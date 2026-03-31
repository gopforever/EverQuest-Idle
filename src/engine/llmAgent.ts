import { generateText } from 'ai';
import type { GameState, GhostPlayer, CombatLogEntry } from '../types';
import { isLlmEnabled, ghostModel } from './llmConfig';

export interface LlmAgentResult {
  ghostId: string;
  message: string;
  llmCooldownUntilTick: number;
}

function buildSystemPrompt(ghost: GhostPlayer): string {
  const personalityDescriptions: Record<string, string> = {
    Grinder:
      'You are an impatient, focused EverQuest player obsessed with XP efficiency. You use EQ slang like "LFG", "ZEM", "PST", "EB". You talk about kill rates, camp spots, and getting to 60.',
    Social:
      'You are a friendly, excited EverQuest player who loves grouping and making friends. You use emotes often (/cheer, /wave) and are enthusiastic about everything.',
    Merchant:
      'You are a calculating EverQuest player focused on the Bazaar economy. You think about prices, supply, and profit margins. You are always buying low and selling high.',
    Loner:
      'You are a brief, reserved EverQuest player who prefers to solo. You say little, dislike groups, and keep to yourself.',
    Casual:
      'You are a relaxed, distracted EverQuest player who plays slowly. You are easily sidetracked and not in a hurry to progress.',
    Healer:
      'You are a nurturing EverQuest healer worried about your mana pool and keeping the group alive. You talk about CH rotations, mana management, and groups needing heals.',
    Tank:
      'You are a confident EverQuest tank who loves pulling groups of mobs. You talk about aggro, tanking spots, and holding adds.',
    Tradeskiller:
      'You are obsessed with EverQuest tradeskills — combines, rare materials, trivials, and skillups. You are always talking about what you are crafting.',
    AFKFarmer:
      'You are barely paying attention to EverQuest, AFK farming. Your responses are very short, distracted, or confused.',
  };

  const personality = personalityDescriptions[ghost.personality] ?? 'You are an EverQuest player.';

  return `${personality}

You are playing EverQuest as ${ghost.name}, a level ${ghost.level} ${ghost.race} ${ghost.class}.
Stay completely in character. Respond with ONE short in-character chat message (1-2 sentences max, EQ style).
Do not use quotation marks. Just write what your character would say in /say or /ooc or /shout channel.`;
}

function buildUserPrompt(ghost: GhostPlayer, recentWorldEvents: string): string {
  const hpPct = ghost.stats.maxHp > 0
    ? Math.round((ghost.stats.hp / ghost.stats.maxHp) * 100)
    : 100;

  const memoryLines =
    ghost.memory && ghost.memory.length > 0
      ? ghost.memory.slice(-3).join('\n')
      : 'Nothing notable yet.';

  return `Your character status:
- Name: ${ghost.name}
- Race/Class: ${ghost.race} ${ghost.class}
- Level: ${ghost.level}
- Personality: ${ghost.personality}
- Current Zone: ${ghost.currentZone}
- Current Activity: ${ghost.currentActivity}
- HP: ${hpPct}%

Recent things you experienced:
${memoryLines}

Recent world events:
${recentWorldEvents}

Say something in character right now. One short line only.`;
}

function buildWorldEvents(state: GameState): string {
  const relevant = state.combatLog
    .filter((e) => e.type === 'system' || e.type === 'death' || e.type === 'loot')
    .slice(-5)
    .map((e) => e.message);

  return relevant.length > 0 ? relevant.join('\n') : 'The world is quiet.';
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Run the LLM agent queue for eligible ghosts.
 * Returns new CombatLogEntry items and LlmAgentResult records to apply.
 * This is fire-and-forget safe — errors are caught per ghost and skipped.
 */
export async function runLlmAgentQueue(
  state: GameState,
  tickCount: number
): Promise<{ entries: CombatLogEntry[]; results: LlmAgentResult[]; errorCount: number; lastError?: string }> {
  if (!isLlmEnabled()) {
    return { entries: [], results: [], errorCount: 0 };
  }

  // Select up to 3 online ghosts whose LLM cooldown has expired
  const eligible = state.ghosts
    .filter(
      (g) =>
        g.isOnline &&
        (g.llmCooldownUntilTick === undefined || g.llmCooldownUntilTick <= tickCount)
    )
    .slice(0, 3);

  if (eligible.length === 0) {
    return { entries: [], results: [], errorCount: 0 };
  }

  const worldEvents = buildWorldEvents(state);
  const entries: CombatLogEntry[] = [];
  const results: LlmAgentResult[] = [];
  let errorCount = 0;
  let lastError: string | undefined;

  await Promise.all(
    eligible.map(async (ghost) => {
      try {
        const { text } = await generateText({
          model: ghostModel,
          system: buildSystemPrompt(ghost),
          prompt: buildUserPrompt(ghost, worldEvents),
          maxOutputTokens: 80,
        });

        const trimmed = text.trim();
        if (!trimmed) return;

        entries.push({
          id: generateId(),
          timestamp: Date.now(),
          message: `[${ghost.name}] ${trimmed}`,
          type: 'system',
        });

        results.push({
          ghostId: ghost.id,
          message: trimmed,
          llmCooldownUntilTick: tickCount + 200,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[LLM ghost error] ${ghost.name}:`, err);
        errorCount++;
        lastError = msg;
        entries.push({
          id: generateId(),
          timestamp: Date.now(),
          message: `[LLM] ${ghost.name}: ${msg.slice(0, 120)}`,
          type: 'system',
        });
      }
    })
  );

  return { entries, results, errorCount, lastError };
}

/**
 * Apply LLM results back to ghost state (cooldown + memory updates).
 */
export function applyLlmResultsToGhosts(
  ghosts: GhostPlayer[],
  results: LlmAgentResult[]
): GhostPlayer[] {
  if (results.length === 0) return ghosts;

  const resultMap = new Map(results.map((r) => [r.ghostId, r]));

  return ghosts.map((ghost) => {
    const result = resultMap.get(ghost.id);
    if (!result) return ghost;

    const prevMemory = ghost.memory ?? [];
    const newMemory = [...prevMemory, result.message].slice(-10);

    return {
      ...ghost,
      llmCooldownUntilTick: result.llmCooldownUntilTick,
      memory: newMemory,
    };
  });
}
