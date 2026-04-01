import type { CharacterClass } from '../types';
import { getClassXpModifier } from './combat';

// XP per kill: npcLevel × 20 × ZEM / groupSize
// Same-level examples:
//   Level  1 mob → 20 XP  (25 kills to level 1→2, solo)
//   Level 10 mob → 200 XP (250 kills to level 10→11, solo)
//   Level 20 mob → 400 XP (500 kills to level 20→21, solo)
export function calcBaseXp(npcLevel: number, zem: number, groupSize: number): number {
  return Math.floor(npcLevel * 20 * zem / Math.max(1, groupSize));
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

// XP to Level N = 500 × N²
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let n = 1; n < level; n++) {
    total += Math.floor(500 * n * n);
  }
  return total;
}

export function levelFromTotalXp(totalXp: number): number {
  let level = 1;
  let accumulated = 0;
  while (level < 60) {
    const xpNeeded = Math.floor(500 * level * level);
    if (accumulated + xpNeeded > totalXp) break;
    accumulated += xpNeeded;
    level++;
  }
  return level;
}
