import { supabase } from '../lib/supabase';
import type { GhostPlayer, GameState } from '../types';

/** Convert GhostPlayer (camelCase) → DB row (snake_case) */
function toRow(g: GhostPlayer): Record<string, unknown> {
  return {
    id: g.id,
    name: g.name,
    race: g.race,
    class: g.class,
    level: g.level,
    xp: g.xp,
    xp_to_next_level: g.xpToNextLevel,
    personality: g.personality,
    is_online: g.isOnline,
    current_zone: g.currentZone,
    current_activity: g.currentActivity,
    plat: g.plat,
    death_count: g.deathCount,
    recovery_ticks_remaining: g.recoveryTicksRemaining,
    mood: g.mood ?? 'normal',
    memory: g.memory ?? [],
    memory_summary: g.memorySummary ?? null,
    llm_cooldown_until_tick: g.llmCooldownUntilTick ?? null,
    guild_name: g.guildName ?? null,
    allies: g.allies ?? [],
    rivals: g.rivals ?? [],
    achievements: g.achievements,
    skills: g.skills,
    gear: g.gear,
    stats: g.stats,
    current_goal: g.currentGoal ?? null,
  };
}

/** Convert DB row → GhostPlayer */
function fromRow(row: Record<string, unknown>): GhostPlayer {
  return {
    id: row.id as string,
    name: row.name as string,
    race: row.race as GhostPlayer['race'],
    class: row.class as GhostPlayer['class'],
    level: row.level as number,
    xp: row.xp as number,
    xpToNextLevel: row.xp_to_next_level as number,
    personality: row.personality as GhostPlayer['personality'],
    isOnline: row.is_online as boolean,
    currentZone: row.current_zone as string,
    currentActivity: row.current_activity as string,
    plat: row.plat as number,
    deathCount: row.death_count as number,
    recoveryTicksRemaining: row.recovery_ticks_remaining as number,
    mood: row.mood as GhostPlayer['mood'],
    memory: (row.memory as string[]) ?? [],
    memorySummary: row.memory_summary as string | undefined,
    llmCooldownUntilTick: row.llm_cooldown_until_tick as number | undefined,
    guildName: row.guild_name as string | undefined,
    allies: (row.allies as string[]) ?? [],
    rivals: (row.rivals as string[]) ?? [],
    achievements: (row.achievements as string[]) ?? [],
    skills: row.skills as Record<string, number>,
    gear: row.gear as GhostPlayer['gear'],
    stats: row.stats as GhostPlayer['stats'],
    currentGoal: row.current_goal as GhostPlayer['currentGoal'],
  };
}

/** Upsert a batch of ghosts. Call this every N ticks (e.g., every 50). */
export async function syncGhostsToSupabase(ghosts: GhostPlayer[]): Promise<void> {
  if (!supabase) return;

  const rows = ghosts.map(toRow);
  const { error } = await supabase
    .from('ghost_players')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('[ghostSync] upsert error:', error.message);
  }
}

/** Load all ghosts from Supabase (e.g., on game load). */
export async function loadGhostsFromSupabase(): Promise<GhostPlayer[] | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('ghost_players')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(200);

  if (error) {
    console.error('[ghostSync] load error:', error.message);
    return null;
  }

  return (data as Record<string, unknown>[]).map(fromRow);
}

/** Sync only a specific ghost's memory + mood (after LLM runs). Lightweight. */
export async function syncGhostMemory(ghost: GhostPlayer): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from('ghost_players')
    .update({
      memory: ghost.memory ?? [],
      memory_summary: ghost.memorySummary ?? null,
      mood: ghost.mood ?? 'normal',
      llm_cooldown_until_tick: ghost.llmCooldownUntilTick ?? null,
      current_activity: ghost.currentActivity,
      current_zone: ghost.currentZone,
      is_online: ghost.isOnline,
    })
    .eq('id', ghost.id);

  if (error) {
    console.error('[ghostSync] memory sync error:', error.message);
  }
}

/** Upsert player save state to Supabase. */
export async function savePlayerToSupabase(userId: string, state: Partial<GameState>): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from('player_saves')
    .upsert(
      {
        user_id: userId,
        player_data: state.player ?? null,
        tick_count: state.tickCount ?? 0,
        current_zone: typeof state.currentZone === 'string'
          ? state.currentZone
          : (state.currentZone as { id?: string } | undefined)?.id ?? 'qeynos_hills',
        character_created: state.characterCreated ?? false,
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('[ghostSync] player save error:', error.message);
  }
}

/** Load player save state from Supabase. */
export async function loadPlayerFromSupabase(userId: string): Promise<Partial<GameState> | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('player_saves')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('[ghostSync] player load error:', error.message);
    return null;
  }

  if (!data) return null;

  const row = data as Record<string, unknown>;
  return {
    player: row.player_data as GameState['player'],
    tickCount: row.tick_count as number,
    characterCreated: row.character_created as boolean,
  };
}
