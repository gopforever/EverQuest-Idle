import type { Race, CharacterClass, CharacterStats, EquipmentSlots } from '../types';
import { ITEMS } from '../data/items';
import { ZONES } from '../data/zones';
import {
  RACE_BASE_STATS,
  CLASS_STAT_BONUSES,
  RACE_CLASS_COMBOS,
  RACE_STARTING_ZONES,
  CLASS_STARTING_SKILLS,
  MELEE_CLASSES,
} from '../data/characterData';

// ── Validation ────────────────────────────────────────────────────────────────

export function isValidRaceClassCombo(race: Race, cls: CharacterClass): boolean {
  return RACE_CLASS_COMBOS[race]?.includes(cls) ?? false;
}

// ── Stat building ─────────────────────────────────────────────────────────────

export function buildPlayerStats(race: Race, cls: CharacterClass): CharacterStats {
  const base = RACE_BASE_STATS[race];
  const bonus = CLASS_STAT_BONUSES[cls];

  const str = base.str + (bonus.str ?? 0);
  const sta = base.sta + (bonus.sta ?? 0);
  const agi = base.agi + (bonus.agi ?? 0);
  const dex = base.dex + (bonus.dex ?? 0);
  const wis = base.wis + (bonus.wis ?? 0);
  const int = base.int + (bonus.int ?? 0);
  const cha = base.cha + (bonus.cha ?? 0);

  const { maxHp, maxMana } = calcHpMana(cls, sta, wis, int);

  const ac = calcBaseAc(cls);
  const attack = calcBaseAttack(cls, str, dex);

  return {
    str, sta, agi, dex, wis, int, cha,
    hp: maxHp,
    maxHp,
    mana: maxMana,
    maxMana,
    ac,
    attack,
  };
}

/** Same calculation as buildPlayerStats — used for ghost players. */
export function buildGhostStats(race: Race, cls: CharacterClass): CharacterStats {
  return buildPlayerStats(race, cls);
}

function calcHpMana(
  cls: CharacterClass,
  sta: number,
  wis: number,
  int: number,
): { maxHp: number; maxMana: number } {
  let maxHp: number;
  let maxMana: number;

  switch (cls) {
    case 'Warrior':
      maxHp   = Math.floor(sta * 1.5);
      maxMana = 0;
      break;
    case 'Monk':
    case 'Rogue':
      maxHp   = Math.floor(sta * 1.2);
      maxMana = 0;
      break;
    case 'Paladin':
    case 'ShadowKnight':
    case 'Ranger':
    case 'Bard':
      maxHp   = Math.floor(sta * 1.2);
      maxMana = Math.floor((cls === 'ShadowKnight' ? int : wis) * 0.8);
      break;
    case 'Cleric':
    case 'Druid':
    case 'Shaman':
      maxHp   = Math.floor(sta * 1.0);
      maxMana = Math.floor(wis * 1.5);
      break;
    case 'Wizard':
    case 'Magician':
    case 'Enchanter':
    case 'Necromancer':
      maxHp   = Math.floor(sta * 0.9);
      maxMana = Math.floor(int * 1.5);
      break;
    default:
      maxHp   = Math.floor(sta * 1.0);
      maxMana = 0;
  }

  return { maxHp: Math.max(1, maxHp), maxMana: Math.max(0, maxMana) };
}

function calcBaseAc(cls: CharacterClass): number {
  switch (cls) {
    case 'Warrior':
      return 15;
    case 'Paladin':
    case 'ShadowKnight':
      return 12;
    case 'Ranger':
    case 'Monk':
      return 10;
    case 'Rogue':
    case 'Bard':
      return 9;
    case 'Cleric':
    case 'Shaman':
      return 8;
    case 'Druid':
      return 7;
    default:
      return 5;
  }
}

function calcBaseAttack(cls: CharacterClass, str: number, dex: number): number {
  const statBonus = Math.floor((str + dex) / 20);
  switch (cls) {
    case 'Warrior':
    case 'Monk':
      return 30 + statBonus;
    case 'Paladin':
    case 'ShadowKnight':
    case 'Ranger':
    case 'Bard':
      return 25 + statBonus;
    case 'Rogue':
      return 28 + statBonus;
    default:
      return 15 + statBonus;
  }
}

// ── Skills ────────────────────────────────────────────────────────────────────

export function buildStartingSkills(cls: CharacterClass): Record<string, number> {
  return { ...CLASS_STARTING_SKILLS[cls] };
}

// ── Gear ──────────────────────────────────────────────────────────────────────

export function buildStartingGear(cls: CharacterClass): EquipmentSlots {
  if (MELEE_CLASSES.has(cls)) {
    const sword = ITEMS['rusty_short_sword'];
    if (sword) {
      return { Primary: sword };
    }
  }
  return {};
}

// ── Starting zone ─────────────────────────────────────────────────────────────

export function getStartingZone(race: Race): string {
  const zoneId = RACE_STARTING_ZONES[race];
  if (ZONES[zoneId]) return zoneId;
  return 'qeynos_hills';
}
