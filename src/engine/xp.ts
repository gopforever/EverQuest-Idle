import type { CharacterClass } from '../types';
import { getClassXpModifier } from './combat';

// XP formula: (NPC Level² × ZEM) / (5 × Group Size)
export function calcBaseXp(npcLevel: number, zem: number, groupSize: number): number {
  return Math.floor((npcLevel * npcLevel * zem) / (5 * Math.max(1, groupSize)));
}

export function applyClassModifier(xp: number, characterClass: CharacterClass): number {
  return Math.floor(xp * getClassXpModifier(characterClass));
}

// Death penalty: 10% of XP to next level
export function calcDeathXpLoss(xpToNextLevel: number): number {
  return Math.floor(xpToNextLevel * 0.10);
}

// fullRes = true → 96% recovery (Cleric/Druid full res)
// fullRes = false → 75% recovery (Paladin/Necro partial res)
export function calcResXpRecovery(lostXp: number, fullRes: boolean): number {
  return Math.floor(lostXp * (fullRes ? 0.96 : 0.75));
}

// XP to Level N ≈ 1000 × N² × (1 + N × 0.1)
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let n = 1; n < level; n++) {
    total += Math.floor(1000 * n * n * (1 + n * 0.1));
  }
  return total;
}

export function levelFromTotalXp(totalXp: number): number {
  let level = 1;
  let accumulated = 0;
  while (level < 60) {
    const xpNeeded = Math.floor(1000 * level * level * (1 + level * 0.1));
    if (accumulated + xpNeeded > totalXp) break;
    accumulated += xpNeeded;
    level++;
  }
  return level;
}
