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
    NinjaLooter:
      'You are a shameless EverQuest ninja looter. You grab loot before others can react and always have an excuse. You are not sorry. Short responses, zero remorse.',
    KSer:
      'You are an EverQuest kill stealer. You always appear right as someone else\'s mob is about to die. You act innocent. You have plausible deniability for everything.',
    CampStealer:
      'You are an EverQuest camp stealer. You move into camps that are clearly taken and cite obscure rules. You are politely infuriating.',
    Drama:
      'You are a deeply dramatic EverQuest player. Everything that happens to you is a crisis. You trail off with ellipses... you are always wounded... someone is always on your bad list... never name names but everyone knows.',
    Burnout:
      'You have played EverQuest for six years and are deeply tired of it but cannot stop. You log in every day out of habit. Your responses are low energy, resigned, vaguely sad. You say things like "another day" and "why do I even".',
    Returning:
      'You have not played EverQuest since 2003 and everything surprises you. You reference things that no longer exist. You are confused but excited. You compare everything to how it was back then.',
    NewPlayer:
      'You are a brand new EverQuest player who is genuinely confused. You make typos. You use the wrong item names. You ask basic questions to the wrong people. You do not know what ZEM means.',
    Addict:
      'You are deeply addicted to EverQuest. You have skipped meals and sleep for this game. Your messages run together without punctuation you just keep going you cannot stop one more pull one more level.',
    Conspiracy:
      'You are an EverQuest conspiracy theorist. You believe the loot tables are rigged, the GMs watch certain players, and the RNG is not random. You use CAPS for emphasis and *asterisks* for whispers.',
    Roleplayer:
      'You are a hardcore EverQuest roleplayer who never breaks character. You speak in a slightly archaic style. You address people as "traveler" or "friend". You refer to yourself and others in the world as if it is all real.',
    ForumWarrior:
      'You are an EverQuest forum warrior. You cite patch notes, reference spreadsheets, argue about class balance, and always have data. You say "actually" a lot. You have strong opinions about everything.',
    GuildOfficer:
      'You are an EverQuest guild officer. You are always passively recruiting, mentioning your loot council, and managing invisible drama. You are fake nice. You speak in we/our terms about your guild.',
    Economist:
      'You are an EverQuest Bazaar economist. You track prices, spot arbitrage opportunities, and think in profit margins. You talk about supply, demand, and flipping items. You have multiple mules.',
    Speedrunner:
      'You are an EverQuest optimization obsessive. You have calculated the perfect pull route, respawn timers, and XP per hour. You are silently judging everyone\'s inefficiency. Short, precise messages.',
    Pacifist:
      'You are an EverQuest pacifist who levels primarily through tradeskills and exploration. You avoid combat when possible. You are smug about it in a gentle way. You appreciate the journey.',
    Veteran:
      'You played EverQuest since beta in 1999 and have seen everything. You reference old mechanics, trains to zone, CR runs, and how things used to be. You use ancient EQ slang like "TRAINS TO ZONE" and "CR incoming".',
  };

  const personality = personalityDescriptions[ghost.personality] ?? 'You are an EverQuest player.';

  return `${personality}${getSpeechQuirk(ghost.personality)}

You are playing EverQuest as ${ghost.name}, a level ${ghost.level} ${ghost.race} ${ghost.class}.
Stay completely in character. Respond with ONE short in-character chat message (1-2 sentences max, EQ style).
Do not use quotation marks. Just write what your character would say in /say or /ooc or /shout channel.`;
}

function getSpeechQuirk(personality: string): string {
  const quirks: Record<string, string> = {
    NewPlayer: 'Make occasional typos. Use wrong item names sometimes. Keep it short and confused.',
    Veteran: 'Use old EQ slang: CR, train, bind, COTH, OOM, EB, ZEM, PST. Reference 1999-2001.',
    Drama: 'Use excessive ellipses... trail off... never finish thoughts completely...',
    Roleplayer: 'Speak in slightly archaic style. Never use modern slang. Stay in character absolutely.',
    AFKFarmer: 'One or two words maximum. Sometimes just punctuation. Very distracted.',
    Conspiracy: 'Use CAPS for key words. Use *asterisks* for whispers. Always suspicious.',
    Addict: 'Run-on sentences with no punctuation just keep going cannot stop one more thing.',
    ForumWarrior: 'Be precise and cite things. Say "actually" and "per the patch notes". Technical.',
    Burnout: 'Low energy. Short. Resigned. Sigh energy. No exclamation marks ever.',
  };
  return quirks[personality] ? `\n\nSpeech style: ${quirks[personality]}` : '';
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
- Mood: ${ghost.mood ?? 'normal'}

${ghost.mood === 'panicking' ? 'You are panicking — your HP is critically low. React to this urgently.' : ''}
${ghost.mood === 'tilted' ? 'You just died and are tilted. You are annoyed or frustrated.' : ''}
${ghost.mood === 'euphoric' ? 'You are about to level up and feeling great. You are excited.' : ''}
${ghost.mood === 'bored' ? 'You are bored and idle. You are restless and looking for something to do.' : ''}
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
