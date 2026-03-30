/**
 * Combat Engine — EverQuest-accurate combat math formulas
 *
 * Melee:
 *   Max Hit = (Weapon Damage × Player Level) / 5
 *   Actual Hit = random(1, Max Hit) + minor STR bonus
 *
 * Spell damage:
 *   Spell Damage = Base Spell Damage ± ~10 % variance
 *
 * Spell resist:
 *   Roll = random(0, 200) − (Caster Level − Target Level) × 5
 *   Resisted if Roll > Target Save vs [type]
 *
 * AC mitigation:
 *   AC Reduction Factor = AC / (AC + 400 + Level × 6)
 *   Mitigated Damage = Incoming × (1 − AC Reduction Factor)
 *
 * NPC damage:
 *   NPC Max Hit ≈ NPC Level × 2
 */

/**
 * Calculate a single melee hit value for the player.
 * @param weaponDamage - Base damage stat of the equipped weapon
 * @param playerLevel  - Current player level
 * @param str          - Player STR stat (small bonus above 75)
 * @returns Damage dealt (minimum 1)
 */
export function calculateMeleeHit(weaponDamage: number, playerLevel: number, str: number): number {
  const maxHit = (weaponDamage * playerLevel) / 5;
  const strBonus = str > 75 ? Math.floor((str - 75) / 10) : 0;
  const cappedMax = Math.max(1, Math.floor(maxHit) + strBonus);
  return Math.max(1, Math.floor(Math.random() * cappedMax) + 1);
}

/**
 * Calculate spell damage with ±10 % variance.
 * @param baseSpellDamage - The spell's listed damage value
 * @returns Actual damage dealt
 */
export function calculateSpellDamage(baseSpellDamage: number): number {
  const variance = baseSpellDamage * 0.1;
  const min = Math.floor(baseSpellDamage - variance);
  const max = Math.ceil(baseSpellDamage + variance);
  return Math.max(1, min + Math.floor(Math.random() * (max - min + 1)));
}

/**
 * Determine whether a spell is resisted.
 * @param casterLevel  - Level of the spell caster
 * @param targetLevel  - Level of the target
 * @param targetSave   - Target's save-vs-[type] value
 * @returns true if the spell was resisted
 */
export function checkSpellResist(casterLevel: number, targetLevel: number, targetSave: number): boolean {
  const roll = Math.floor(Math.random() * 201) - (casterLevel - targetLevel) * 5;
  return roll > targetSave;
}

/**
 * Apply AC mitigation to incoming damage.
 * @param incomingDamage - Raw damage before mitigation
 * @param ac             - Defender's total AC value
 * @param attackerLevel  - Level of the attacker
 * @returns Actual damage after mitigation (minimum 1)
 */
export function calculateACMitigation(incomingDamage: number, ac: number, attackerLevel: number): number {
  const reductionFactor = ac / (ac + 400 + attackerLevel * 6);
  return Math.max(1, Math.floor(incomingDamage * (1 - reductionFactor)));
}

/**
 * Calculate a single NPC melee hit.
 * @param npcLevel - Level of the NPC attacker
 * @returns Damage dealt (minimum 1)
 */
export function calculateNPCHit(npcLevel: number): number {
  const maxHit = Math.max(1, npcLevel * 2);
  return Math.max(1, Math.floor(Math.random() * maxHit) + 1);
}
