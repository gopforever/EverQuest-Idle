import type { CharacterClass } from '../types';

// Melee damage formula:
// Max Hit = (Weapon Damage × Player Level) / 5
// Actual Hit = random(1, Max Hit) + minor STR Bonus (small bonus above 75 STR)
export function calcMeleeMaxHit(weaponDamage: number, playerLevel: number, str: number): number {
  const base = (weaponDamage * playerLevel) / 5;
  const strBonus = str > 75 ? Math.floor((str - 75) / 10) : 0;
  return Math.max(1, Math.floor(base) + strBonus);
}

export function calcActualMeleeHit(weaponDamage: number, playerLevel: number, str: number): number {
  const maxHit = calcMeleeMaxHit(weaponDamage, playerLevel, str);
  return Math.max(1, Math.floor(Math.random() * maxHit) + 1);
}

// Melee hit chance formula:
// Base 80% hit chance + (Offense Skill - Defense Skill) * 0.5% modifier
// Capped at 95% max, floored at 5% min
export function calcHitChance(offenseSkill: number, defenseSkill: number): number {
  const base = 0.80;
  const modifier = (offenseSkill - defenseSkill) * 0.005;
  return Math.min(0.95, Math.max(0.05, base + modifier));
}

// AC mitigation formula:
// AC Reduction Factor = AC / (AC + 400 + Level × 6)
// Mitigated Damage = Incoming × (1 - AC Reduction Factor)
export function calcAcMitigation(ac: number, attackerLevel: number): number {
  return ac / (ac + 400 + attackerLevel * 6);
}

export function calcMitigatedDamage(rawDamage: number, ac: number, attackerLevel: number): number {
  const mitigationFactor = calcAcMitigation(ac, attackerLevel);
  return Math.max(1, Math.floor(rawDamage * (1 - mitigationFactor)));
}

// NPC damage formula:
// NPC Max Hit ≈ NPC Level × 2
export function calcNpcMaxHit(npcLevel: number): number {
  return Math.max(1, npcLevel * 2);
}

// Spell resist formula:
// Roll = random(0, 200) - (Caster Level - Target Level) × 5
// If Roll > Target Save: RESISTED
export function rollSpellResist(casterLevel: number, targetLevel: number, targetSave: number): boolean {
  const roll = Math.floor(Math.random() * 201) - (casterLevel - targetLevel) * 5;
  return roll > targetSave;
}

// XP reward formula: (NPC Level² × ZEM) / (5 × Group Size)
export function calcXpReward(npcLevel: number, zem: number, groupSize: number): number {
  return Math.floor((npcLevel * npcLevel * zem) / (5 * Math.max(1, groupSize)));
}

// XP to next level: 1000 × N² × (1 + N × 0.1)
export function calcXpToNextLevel(level: number): number {
  return Math.floor(1000 * level * level * (1 + level * 0.1));
}

export function getClassXpModifier(characterClass: CharacterClass): number {
  const hybrids: CharacterClass[] = ['Paladin', 'ShadowKnight', 'Ranger', 'Bard'];
  return hybrids.includes(characterClass) ? 0.6 : 1.0;
}
