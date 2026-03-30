import type { CharacterClass } from '../types';

// Returns XP loss amount (10% of xpToNextLevel, floored at 0)
export function calcDeathXpLoss(xpToNextLevel: number): number {
  return Math.floor(xpToNextLevel * 0.1);
}

// Returns HP restored at bind point (50% of maxHp)
export function calcBindPointHp(maxHp: number): number {
  return Math.floor(maxHp * 0.5);
}

// Returns mana restored at bind point
// Casters get 25% of maxMana; non-casters (melee) get full mana (they don't use it)
export function calcBindPointMana(maxMana: number, isCaster: boolean): number {
  return isCaster ? Math.floor(maxMana * 0.25) : maxMana;
}

// Resurrection XP recovery:
//   full    (Cleric/Druid): 96% of lost XP returned
//   partial (Paladin/Necro): 75% of lost XP returned
//   none: 0%
export function calcResXpRecovery(lostXp: number, resType: 'full' | 'partial' | 'none'): number {
  if (resType === 'full') return Math.floor(lostXp * 0.96);
  if (resType === 'partial') return Math.floor(lostXp * 0.75);
  return 0;
}

// Caster classes rely on mana and receive reduced mana at bind point
export function isCasterClass(characterClass: CharacterClass): boolean {
  const casters: CharacterClass[] = [
    'Cleric', 'Druid', 'Shaman', 'Wizard', 'Magician', 'Enchanter', 'Necromancer',
  ];
  return casters.includes(characterClass);
}
