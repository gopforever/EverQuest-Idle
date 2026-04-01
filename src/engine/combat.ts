import type { CharacterClass, EquipmentSlots } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// MELEE DAMAGE
// Classic EQ formula (reverse-engineered from EQEmu source):
//   max_hit = weapon_damage + floor(weapon_damage × skill / 200) + str_bonus
//   str_bonus = max(0, floor((STR - 75) / 3))
// At skill 0  → 1× weapon damage
// At skill 200 → 2× weapon damage  (achieved around level 40)
// ─────────────────────────────────────────────────────────────────────────────
export function calcStrBonus(str: number): number {
  return str > 75 ? Math.floor((str - 75) / 3) : 0;
}

export function calcMeleeMaxHit(weaponDamage: number, str: number, weaponSkill: number): number {
  const strBonus = calcStrBonus(str);
  const skillMult = Math.floor(weaponDamage * weaponSkill / 200);
  return Math.max(1, weaponDamage + skillMult + strBonus);
}

export function calcActualMeleeHit(weaponDamage: number, str: number, weaponSkill: number): number {
  const maxHit = calcMeleeMaxHit(weaponDamage, str, weaponSkill);
  return Math.max(1, Math.floor(Math.random() * maxHit) + 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// HIT CHANCE
// Classic EQ: ~75% base for same-level fights, skill gap shifts it.
// (offenseSkill - defenseSkill) × 0.4% per point, capped 5–95%.
// defenseSkill for NPCs ≈ npcLevel × 2 (used in tick.ts).
// ─────────────────────────────────────────────────────────────────────────────
export function calcHitChance(offenseSkill: number, defenseSkill: number): number {
  const base = 0.75;
  const modifier = (offenseSkill - defenseSkill) * 0.004;
  return Math.min(0.95, Math.max(0.05, base + modifier));
}

// ─────────────────────────────────────────────────────────────────────────────
// AC MITIGATION
// Classic EQ: AC / (AC + 150 + attackerLevel × 4).
// Smaller constant makes AC matter more at low-mid levels.
// Example: Warrior with AC 80 vs level 10 mob → 80/(80+190) = 29.6% mitigation.
// ─────────────────────────────────────────────────────────────────────────────
export function calcAcMitigation(ac: number, attackerLevel: number): number {
  return ac / (ac + 150 + attackerLevel * 4);
}

export function calcMitigatedDamage(rawDamage: number, ac: number, attackerLevel: number): number {
  const mitigationFactor = calcAcMitigation(ac, attackerLevel);
  return Math.max(1, Math.floor(rawDamage * (1 - mitigationFactor)));
}

// ─────────────────────────────────────────────────────────────────────────────
// NPC DAMAGE
// Classic EQ NPCs were dangerous. Formula:
//   max_hit = level × 2.5 + level² / 20
// Level  1 → ~3    Level  5 → ~14   Level 10 → ~30
// Level 20 → ~70   Level 40 → ~180  Level 50 → ~250
// ─────────────────────────────────────────────────────────────────────────────
export function calcNpcMaxHit(npcLevel: number): number {
  return Math.max(2, Math.floor(npcLevel * 2.5 + (npcLevel * npcLevel) / 20));
}

// ─────────────────────────────────────────────────────────────────────────────
// SPELL RESIST
// Roll = random(0, 200) − (casterLevel − targetLevel) × 5
// Resisted if roll > targetSave
// ─────────────────────────────────────────────────────────────────────────────
export function rollSpellResist(casterLevel: number, targetLevel: number, targetSave: number): boolean {
  const roll = Math.floor(Math.random() * 201) - (casterLevel - targetLevel) * 5;
  return roll > targetSave;
}

// ─────────────────────────────────────────────────────────────────────────────
// XP FORMULAS
// XP to next level: 500 × N²
//   Level  1 → 2:       500 XP (~25 same-level kills)
//   Level 10 → 11:   50,000 XP (~250 same-level kills)
//   Level 20 → 21:  200,000 XP (~500 same-level kills)
//   Level 50 → 51: 1,250,000 XP (~1,250 same-level kills)
//
// Classic EQ penalty classes (hybrids penalized):
//   Pure melee/caster: 1.0×   Hybrid: 0.6×   Bard: 0.4×
// ─────────────────────────────────────────────────────────────────────────────
export function calcXpToNextLevel(level: number): number {
  return Math.floor(500 * level * level);
}

export function getClassXpModifier(characterClass: CharacterClass): number {
  const bard: CharacterClass[] = ['Bard'];
  const hybrids: CharacterClass[] = ['Paladin', 'ShadowKnight', 'Ranger'];
  if (bard.includes(characterClass)) return 0.40;
  if (hybrids.includes(characterClass)) return 0.60;
  return 1.0;
}

// ─────────────────────────────────────────────────────────────────────────────
// WEAPON TIMING
// Delay is in EQ tenth-of-second units (delay 25 = 2.5 s = ~3 ticks).
// ─────────────────────────────────────────────────────────────────────────────
const DELAY_UNITS_PER_TICK = 10;

export function calcWeaponSwingInterval(delay: number): number {
  return Math.max(1, Math.ceil(delay / DELAY_UNITS_PER_TICK));
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFHAND ATTACK
// 50% of main-hand max + DEX bonus.
// ─────────────────────────────────────────────────────────────────────────────
export function calcOffhandHit(weaponDamage: number, str: number, dex: number, weaponSkill: number): number {
  const maxHit = Math.floor(calcMeleeMaxHit(weaponDamage, str, weaponSkill) * 0.5);
  const dexBonus = dex > 75 ? Math.floor((dex - 75) / 15) : 0;
  return Math.max(1, Math.floor(Math.random() * Math.max(1, maxHit + dexBonus)) + 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// GHOST GEAR HELPERS
// ─────────────────────────────────────────────────────────────────────────────
export function getWeaponDamage(gear: EquipmentSlots): number {
  return gear['Primary']?.stats?.damage ?? 3;
}

export function getWeaponDelay(gear: EquipmentSlots): number {
  return gear['Primary']?.stats?.delay ?? 25;
}

// ─────────────────────────────────────────────────────────────────────────────
// HP / MANA SCALING ON LEVEL-UP
// Called each time the player gains a level so their pool grows.
//
// HP:   Warriors/Monks get a melee bonus; STA > 75 adds per-level bonus.
// Mana: Casters use INT; priests use WIS; hybrids get reduced pool.
// ─────────────────────────────────────────────────────────────────────────────
export function calcMaxHpForLevel(level: number, sta: number, cls: CharacterClass): number {
  const meleeClasses: CharacterClass[] = ['Warrior', 'Paladin', 'ShadowKnight', 'Monk'];
  const priestClasses: CharacterClass[] = ['Cleric', 'Druid', 'Shaman'];
  const hybridClasses: CharacterClass[] = ['Ranger', 'Bard', 'Rogue'];

  let hpPerLevel: number;
  if (meleeClasses.includes(cls)) {
    hpPerLevel = 20;
  } else if (hybridClasses.includes(cls)) {
    hpPerLevel = 15;
  } else if (priestClasses.includes(cls)) {
    hpPerLevel = 12;
  } else {
    hpPerLevel = 10; // pure casters
  }

  const base = 20 + level * hpPerLevel;
  const staBonus = sta > 75 ? Math.floor((sta - 75) * level * 0.15) : 0;
  return Math.max(10, base + staBonus);
}

export function calcMaxManaForLevel(level: number, wis: number, int: number, cls: CharacterClass): number {
  const casterClasses: CharacterClass[] = ['Wizard', 'Magician', 'Enchanter', 'Necromancer'];
  const priestClasses: CharacterClass[] = ['Cleric', 'Druid', 'Shaman'];
  const hybridClasses: CharacterClass[] = ['Paladin', 'ShadowKnight', 'Ranger', 'Bard'];

  const intBonus = int > 75 ? Math.floor((int - 75) * level * 0.4) : 0;
  const wisBonus = wis > 75 ? Math.floor((wis - 75) * level * 0.4) : 0;
  const wisHybridBonus = wis > 75 ? Math.floor((wis - 75) * level * 0.15) : 0;

  if (casterClasses.includes(cls)) {
    return Math.max(10, 10 + level * 15 + intBonus);
  }
  if (priestClasses.includes(cls)) {
    return Math.max(10, 10 + level * 15 + wisBonus);
  }
  if (hybridClasses.includes(cls)) {
    return Math.max(10, 5 + level * 8 + wisHybridBonus);
  }
  return 0; // Warriors, Monks, Rogues — no mana
}

// ─────────────────────────────────────────────────────────────────────────────
// DODGE CHANCE
// 5% base + 0.1% per AGI above 75, capped at 30%.
// ─────────────────────────────────────────────────────────────────────────────
export function calcDodgeChance(agi: number): number {
  const base = 0.05;
  const bonus = agi > 75 ? (agi - 75) * 0.001 : 0;
  return Math.min(0.30, base + bonus);
}

// ─────────────────────────────────────────────────────────────────────────────
// DOUBLE ATTACK
// Warriors, Monks, Rogues, Rangers: DEX-based, capped at 30%.
// ─────────────────────────────────────────────────────────────────────────────
export function calcDoubleAttackChance(dex: number, cls: CharacterClass): number {
  const eligible: CharacterClass[] = ['Warrior', 'Monk', 'Rogue', 'Ranger'];
  if (!eligible.includes(cls)) return 0;
  return Math.min(0.30, Math.max(0, (dex - 70) * 0.002));
}

// ─────────────────────────────────────────────────────────────────────────────
// AGGRO WEIGHT
// ─────────────────────────────────────────────────────────────────────────────
export function getAggroWeight(cls: CharacterClass): number {
  const highAggro: CharacterClass[] = ['Warrior', 'Paladin'];
  return highAggro.includes(cls) ? 2.0 : 1.0;
}
