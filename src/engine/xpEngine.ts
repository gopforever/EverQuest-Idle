/**
 * XP Engine — EverQuest-accurate XP formulas
 *
 * Base XP per kill:  XP = (NPC Level² × ZEM) / (5 × Group Size)
 * Level XP Curve:    XP to Level N ≈ 1000 × N² × (1 + N × 0.1)
 *
 * Class modifiers:
 *   Pure classes  → ×1.00
 *   Hybrids (Paladin, Shadow Knight, Ranger, Bard) → ×0.60
 *
 * Death penalty:  10% of XP-to-next-level is lost
 * Full Res:       recovers 96 % of lost XP
 * Partial Res:    recovers 75 % of lost XP
 */

import type { CharacterClass } from '../types';

/** XP gained for killing one NPC at the given level inside a zone with `zem`. */
export function calculateKillXP(npcLevel: number, zem: number, groupSize = 1): number {
  return Math.floor((npcLevel * npcLevel * zem) / (5 * Math.max(1, groupSize)));
}

/** Total XP required to gain level N (i.e. to go from level N to N+1). */
export function xpToLevel(level: number): number {
  return Math.floor(1000 * level * level * (1 + level * 0.1));
}

/**
 * Hybrid penalty classes receive only 60 % of normal XP.
 * Pure classes receive 100 %.
 */
export function applyClassModifier(xp: number, characterClass: CharacterClass): number {
  const hybrids: CharacterClass[] = ['Paladin', 'ShadowKnight', 'Ranger', 'Bard'];
  const modifier = hybrids.includes(characterClass) ? 0.6 : 1.0;
  return Math.floor(xp * modifier);
}

/**
 * Death penalty: lose 10 % of the XP required for the current level.
 * Returns the amount of XP lost (not the new total).
 */
export function applyDeathPenalty(xpToNextLevel: number): number {
  return Math.floor(xpToNextLevel * 0.10);
}

/**
 * Resurrection XP recovery.
 * @param lostXp - XP lost from the death penalty
 * @param fullRes - true → Cleric/Druid full res (96 %), false → partial res (75 %)
 * @returns Amount of XP restored
 */
export function applyResurrection(lostXp: number, fullRes: boolean): number {
  return Math.floor(lostXp * (fullRes ? 0.96 : 0.75));
}
