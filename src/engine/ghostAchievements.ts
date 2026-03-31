import type { GhostPlayer } from '../types';
import { ACHIEVEMENT_DEFS } from '../data/achievements';

/**
 * checkGhostAchievements — returns an array of NEW achievement IDs earned by
 * the ghost this tick (not already present in ghost.achievements).
 */
export function checkGhostAchievements(ghost: GhostPlayer): string[] {
  const already = new Set(ghost.achievements ?? []);
  const earned: string[] = [];

  function award(id: string): void {
    if (!already.has(id)) {
      earned.push(id);
      already.add(id); // prevent double-awarding within the same call
    }
  }

  // Level-based achievements
  if (ghost.level >= 2) award('ding');
  if (ghost.level >= 5) award('adventurer');
  if (ghost.level >= 20) award('seasoned');
  if (ghost.level >= 40) award('server_celeb');
  if (ghost.level >= 50) award('epic_journey');
  if (ghost.level >= 60) award('max_level');

  // Proxy: treat ghosts as having slain gnolls if they're level 10+
  if (ghost.level >= 10) award('gnoll_slayer');

  // Death-based
  if ((ghost.deathCount ?? 0) > 0) award('no_fear');

  return earned;
}

/**
 * getGhostAchievementPoints — sum of points for all achievement IDs the ghost
 * has earned, looked up from the achievement definitions.
 */
export function getGhostAchievementPoints(ghost: GhostPlayer): number {
  const lookup = new Map(ACHIEVEMENT_DEFS.map((a) => [a.id, a.points]));
  return (ghost.achievements ?? []).reduce((sum, id) => sum + (lookup.get(id) ?? 0), 0);
}
