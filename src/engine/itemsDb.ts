/**
 * itemsDb.ts — Supabase-backed item/monster database
 *
 * The game calls fetchZoneItems(zoneId) when entering a zone.
 * Results are cached in memory for the session.
 * Falls back to static ITEMS/MONSTERS if Supabase is unavailable.
 */

import { supabase } from '../lib/supabase';
import { ITEMS }    from '../data/items';
import { MONSTERS } from '../data/monsters';
import type { Item, Monster, LootEntry, ItemStats, EquipSlot, ItemType, ItemRarity } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Types matching the Supabase eq_items / eq_monsters row shapes
// ─────────────────────────────────────────────────────────────────────────────
interface DbItem {
  id: string;
  name: string;
  slot: string | null;
  item_type: string;
  rarity: string;
  damage: number;
  delay: number;
  ac: number;
  hp: number;
  mana: number;
  endurance: number;
  str: number;
  sta: number;
  agi: number;
  dex: number;
  wis: number;
  int: number;
  cha: number;
  sv_magic: number;
  sv_fire: number;
  sv_cold: number;
  sv_disease: number;
  sv_poison: number;
  attack: number;
  hp_regen: number;
  mana_regen: number;
  avoidance: number;
  spell_dmg: number;
  dot_shield: number;
  weight: number;
  value: number;
  lore: boolean;
  no_drop: boolean;
  magic: boolean;
  stackable: boolean;
  stack_size: number;
  source: string;
  description: string;
  classes: string[];
  races: string[];
  rec_level: number;
  req_level: number;
}

interface DbMonster {
  id: string;
  name: string;
  zones: string[];
  level_min: number;
  level_max: number;
  hp: number;
  dmg_min: number;
  dmg_max: number;
  xp_reward: number;
  monster_type: string;
  aggro: boolean;
  social: boolean;
}

interface DbLootEntry {
  monster_id: string;
  item_id: string;
  drop_chance: number;
  min_quantity: number;
  max_quantity: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Converters: DB row → game type
// ─────────────────────────────────────────────────────────────────────────────
function dbToItem(row: DbItem): Item {
  const stats: ItemStats = {};
  if (row.damage)     stats.damage    = row.damage;
  if (row.delay)      stats.delay     = row.delay;
  if (row.ac)         stats.ac        = row.ac;
  if (row.hp)         stats.hp        = row.hp;
  if (row.mana)       stats.mana      = row.mana;
  if (row.endurance)  stats.endurance = row.endurance;
  if (row.str)        stats.str       = row.str;
  if (row.sta)        stats.sta       = row.sta;
  if (row.agi)        stats.agi       = row.agi;
  if (row.dex)        stats.dex       = row.dex;
  if (row.wis)        stats.wis       = row.wis;
  if (row.int)        (stats as any).int = row.int;
  if (row.cha)        stats.cha       = row.cha;
  if (row.sv_magic)   stats.svMagic   = row.sv_magic;
  if (row.sv_fire)    stats.svFire    = row.sv_fire;
  if (row.sv_cold)    stats.svCold    = row.sv_cold;
  if (row.sv_disease) stats.svDisease = row.sv_disease;
  if (row.sv_poison)  stats.svPoison  = row.sv_poison;
  if (row.attack)     stats.attack    = row.attack;
  if (row.hp_regen)   stats.hpRegen   = row.hp_regen;
  if (row.mana_regen) stats.manaRegen = row.mana_regen;
  if (row.avoidance)  stats.avoidance = row.avoidance;
  if (row.spell_dmg)  stats.spellDmg  = row.spell_dmg;
  if (row.dot_shield) stats.dotShield = row.dot_shield;

  return {
    id:          row.id,
    name:        row.name,
    slot:        (row.slot as EquipSlot) ?? null,
    type:        (row.item_type as ItemType) ?? 'misc',
    rarity:      (row.rarity as ItemRarity) ?? 'common',
    stats,
    weight:      row.weight,
    value:       row.value,
    lore:        row.lore,
    noDrop:      row.no_drop,
    stackable:   row.stackable,
    stackSize:   row.stack_size,
    source:      (row.source as Item['source']) ?? 'drop',
    sprite:      `/assets/sprites/items/${row.id}.png`,
    classes:     row.classes?.length ? (row.classes as any) : 'ALL',
    races:       row.races?.length   ? (row.races as any)   : 'ALL',
    recLevel:    row.rec_level,
    reqLevel:    row.req_level,
    description: row.description ?? '',
  };
}

function dbToMonster(row: DbMonster, lootMap: Map<string, LootEntry[]>): Monster {
  return {
    id:          row.id,
    name:        row.name,
    zones:       row.zones,
    levelRange:  { min: row.level_min, max: row.level_max },
    hp:          row.hp,
    damageRange: { min: row.dmg_min, max: row.dmg_max },
    xpReward:    row.xp_reward,
    lootTable:   lootMap.get(row.id) ?? [],
    sprite:      `/assets/sprites/monsters/placeholder.png`,
    type:        row.monster_type as Monster['type'],
    aggro:       row.aggro,
    social:      row.social,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Session cache
// ─────────────────────────────────────────────────────────────────────────────
const zoneItemCache  = new Map<string, Item[]>();
const zoneMonsterCache = new Map<string, Monster[]>();
let dbAvailable: boolean | null = null;   // null = unchecked

async function checkDbAvailable(): Promise<boolean> {
  if (dbAvailable !== null) return dbAvailable;
  if (!supabase) { dbAvailable = false; return false; }
  const { error } = await supabase.from('eq_items').select('id').limit(1);
  dbAvailable = !error;
  if (!dbAvailable) console.warn('[itemsDb] Supabase unavailable, using static data:', error?.message);
  return dbAvailable;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all items that can drop in a given zone. Cached per zone per session. */
export async function fetchZoneItems(zoneId: string): Promise<Item[]> {
  if (zoneItemCache.has(zoneId)) return zoneItemCache.get(zoneId)!;

  const dbOk = await checkDbAvailable();
  if (!dbOk) {
    const fallback = staticZoneItems(zoneId);
    zoneItemCache.set(zoneId, fallback);
    return fallback;
  }

  const { data, error } = await supabase!
    .from('eq_zone_items')
    .select('item_id, eq_items(*)')
    .eq('zone_id', zoneId);

  if (error || !data?.length) {
    const fallback = staticZoneItems(zoneId);
    zoneItemCache.set(zoneId, fallback);
    return fallback;
  }

  const items = data.map((row: any) => dbToItem(row.eq_items as DbItem));
  zoneItemCache.set(zoneId, items);
  return items;
}

/** Fetch all monsters that spawn in a given zone. Cached per zone per session. */
export async function fetchZoneMonsters(zoneId: string): Promise<Monster[]> {
  if (zoneMonsterCache.has(zoneId)) return zoneMonsterCache.get(zoneId)!;

  const dbOk = await checkDbAvailable();
  if (!dbOk) {
    const fallback = staticZoneMonsters(zoneId);
    zoneMonsterCache.set(zoneId, fallback);
    return fallback;
  }

  // Fetch monsters in zone
  const { data: monsterRows, error: mErr } = await supabase!
    .from('eq_monsters')
    .select('*')
    .contains('zones', [zoneId]);

  if (mErr || !monsterRows?.length) {
    const fallback = staticZoneMonsters(zoneId);
    zoneMonsterCache.set(zoneId, fallback);
    return fallback;
  }

  // Fetch loot entries for those monsters
  const monsterIds = monsterRows.map((m: DbMonster) => m.id);
  const { data: lootRows } = await supabase!
    .from('eq_loot_entries')
    .select('*')
    .in('monster_id', monsterIds);

  const lootMap = new Map<string, LootEntry[]>();
  for (const row of (lootRows ?? []) as DbLootEntry[]) {
    const entry: LootEntry = {
      itemId:      row.item_id,
      dropChance:  row.drop_chance,
      minQuantity: row.min_quantity,
      maxQuantity: row.max_quantity,
    };
    const list = lootMap.get(row.monster_id) ?? [];
    list.push(entry);
    lootMap.set(row.monster_id, list);
  }

  const monsters = monsterRows.map((row: DbMonster) => dbToMonster(row, lootMap));
  zoneMonsterCache.set(zoneId, monsters);
  return monsters;
}

/** Fetch a single item by ID (checks cache first, then DB, then static). */
export async function fetchItem(itemId: string): Promise<Item | null> {
  // Check all cached zones
  for (const items of zoneItemCache.values()) {
    const found = items.find((i) => i.id === itemId);
    if (found) return found;
  }

  // Static fallback
  if (ITEMS[itemId]) return ITEMS[itemId];

  if (!await checkDbAvailable()) return null;

  const { data, error } = await supabase!
    .from('eq_items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (error || !data) return null;
  return dbToItem(data as DbItem);
}

/** Invalidate the in-memory cache (call after importing new data). */
export function clearItemCache(): void {
  zoneItemCache.clear();
  zoneMonsterCache.clear();
  dbAvailable = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Static fallbacks
// ─────────────────────────────────────────────────────────────────────────────
function staticZoneItems(zoneId: string): Item[] {
  const seen = new Set<string>();
  const result: Item[] = [];
  for (const monster of Object.values(MONSTERS)) {
    if (!monster.zones.includes(zoneId)) continue;
    for (const entry of monster.lootTable) {
      if (!seen.has(entry.itemId) && ITEMS[entry.itemId]) {
        seen.add(entry.itemId);
        result.push(ITEMS[entry.itemId]);
      }
    }
  }
  return result;
}

function staticZoneMonsters(zoneId: string): Monster[] {
  return Object.values(MONSTERS).filter((m) => m.zones.includes(zoneId));
}
