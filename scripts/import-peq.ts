/**
 * EverQuest Idle — PEQ Data Import Script
 *
 * Usage:
 *   npx tsx scripts/import-peq.ts --seed          # Upload current static items/monsters
 *   npx tsx scripts/import-peq.ts --peq <file>    # Import from PEQ SQL dump
 *   npx tsx scripts/import-peq.ts --seed --peq <file>  # Both
 *
 * Requirements: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SERVICE_ROLE_KEY)
 * must be set as environment variables.
 *
 * For PEQ import: download the full database dump from
 *   https://github.com/ProjectEQ/projecteqdb  → peqdb_latest.sql
 * or individual table dumps (items.sql, npc_types.sql, loottable.sql etc.)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ── Load .env.local ──────────────────────────────────────────────────────────
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??   // preferred: bypasses RLS
  process.env.VITE_SUPABASE_ANON_KEY ?? '';  // fallback: anon (needs RLS insert policy)

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const doSeed = args.includes('--seed');
const peqIdx = args.indexOf('--peq');
const peqFile = peqIdx !== -1 ? args[peqIdx + 1] : null;

if (!doSeed && !peqFile) {
  console.log('Usage:\n  npx tsx scripts/import-peq.ts --seed\n  npx tsx scripts/import-peq.ts --peq /path/to/peqdb.sql\n  npx tsx scripts/import-peq.ts --seed --peq /path/to/peqdb.sql');
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────────────────────
// PEQ BITMASK DECODERS
// ─────────────────────────────────────────────────────────────────────────────
const PEQ_CLASSES: Record<number, string> = {
  1: 'Warrior', 2: 'Cleric', 4: 'Paladin', 8: 'Ranger',
  16: 'ShadowKnight', 32: 'Druid', 64: 'Monk', 128: 'Bard',
  256: 'Rogue', 512: 'Shaman', 1024: 'Necromancer', 2048: 'Wizard',
  4096: 'Magician', 8192: 'Enchanter', 16384: 'Beastlord', 32768: 'Berserker',
};

const PEQ_RACES: Record<number, string> = {
  1: 'Human', 2: 'Barbarian', 4: 'Erudite', 8: 'WoodElf',
  16: 'HighElf', 32: 'DarkElf', 64: 'HalfElf', 128: 'Dwarf',
  256: 'Troll', 512: 'Ogre', 1024: 'Halfling', 2048: 'Gnome',
  4096: 'Iksar', 8192: 'VahShir',
};

// PEQ slot bitmask → our EquipSlot name (takes first matching slot)
const PEQ_SLOTS: Array<[number, string]> = [
  [1, 'Charm'], [2, 'Ear1'], [4, 'Head'], [8, 'Face'], [16, 'Ear2'],
  [32, 'Neck'], [64, 'Shoulders'], [128, 'Arms'], [256, 'Back'],
  [512, 'Wrist1'], [1024, 'Wrist2'], [2048, 'Range'], [4096, 'Hands'],
  [8192, 'Primary'], [16384, 'Secondary'], [32768, 'Fingers1'],
  [65536, 'Fingers2'], [131072, 'Chest'], [262144, 'Legs'],
  [524288, 'Feet'], [1048576, 'Waist'], [2097152, 'Ammo'],
];

// PEQ itemtype → our ItemType
const PEQ_ITEMTYPE: Record<number, string> = {
  0: 'weapon', 1: 'weapon', 2: 'weapon', 3: 'weapon',
  4: 'weapon', 5: 'weapon', 7: 'weapon', 8: 'shield',
  10: 'armor', 11: 'misc', 27: 'jewelry',
};

function decodeMask(mask: number, map: Record<number, string>): string[] {
  if (mask === 0 || mask === 65535 || mask === 4294967295) return [];  // ALL
  const result: string[] = [];
  for (const [bit, name] of Object.entries(map)) {
    if (mask & Number(bit)) result.push(name);
  }
  return result;
}

function decodeSlot(slotMask: number): string | null {
  for (const [bit, name] of PEQ_SLOTS) {
    if (slotMask & bit) return name;
  }
  return null;
}

function slugify(name: string, id: number): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') + '_' + id;
}

// ─────────────────────────────────────────────────────────────────────────────
// BATCH UPSERT HELPER
// ─────────────────────────────────────────────────────────────────────────────
async function batchUpsert(table: string, rows: object[], batchSize = 200): Promise<void> {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from(table).upsert(batch as any);
    if (error) {
      console.error(`  ❌ batch ${i / batchSize} error:`, error.message);
    } else {
      inserted += batch.length;
      process.stdout.write(`\r  ${table}: ${inserted}/${rows.length}`);
    }
  }
  console.log();
}

// ─────────────────────────────────────────────────────────────────────────────
// MODE 1: SEED FROM STATIC TS FILES
// ─────────────────────────────────────────────────────────────────────────────
async function seedFromStatic(): Promise<void> {
  console.log('\n📦  Seeding from static TypeScript data files…');

  const { ITEMS }    = await import('../src/data/items.js'    as any) as any;
  const { MONSTERS } = await import('../src/data/monsters.js' as any) as any;

  // ── Items ─────────────────────────────────────────────────────────────────
  const itemRows = Object.values(ITEMS).map((item: any) => ({
    id:          item.id,
    name:        item.name,
    slot:        item.slot ?? null,
    item_type:   item.type ?? 'misc',
    rarity:      item.rarity ?? 'common',
    damage:      item.stats?.damage      ?? 0,
    delay:       item.stats?.delay       ?? 0,
    ac:          item.stats?.ac          ?? 0,
    hp:          item.stats?.hp          ?? 0,
    mana:        item.stats?.mana        ?? 0,
    endurance:   item.stats?.endurance   ?? 0,
    str:         item.stats?.str         ?? 0,
    sta:         item.stats?.sta         ?? 0,
    agi:         item.stats?.agi         ?? 0,
    dex:         item.stats?.dex         ?? 0,
    wis:         item.stats?.wis         ?? 0,
    int:         item.stats?.int         ?? 0,
    cha:         item.stats?.cha         ?? 0,
    sv_magic:    item.stats?.svMagic     ?? 0,
    sv_fire:     item.stats?.svFire      ?? 0,
    sv_cold:     item.stats?.svCold      ?? 0,
    sv_disease:  item.stats?.svDisease   ?? 0,
    sv_poison:   item.stats?.svPoison    ?? 0,
    attack:      item.stats?.attack      ?? 0,
    hp_regen:    item.stats?.hpRegen     ?? 0,
    mana_regen:  item.stats?.manaRegen   ?? 0,
    avoidance:   item.stats?.avoidance   ?? 0,
    spell_dmg:   item.stats?.spellDmg    ?? 0,
    dot_shield:  item.stats?.dotShield   ?? 0,
    weight:      item.weight ?? 0.1,
    value:       item.value ?? 0,
    lore:        item.lore ?? false,
    no_drop:     item.noDrop ?? false,
    magic:       !!(item.lore || item.noDrop),
    stackable:   item.stackable ?? false,
    stack_size:  item.stackSize ?? 1,
    source:      item.source ?? 'drop',
    description: item.description ?? '',
    classes:     Array.isArray(item.classes) ? item.classes : [],
    races:       Array.isArray(item.races) ? item.races : [],
    rec_level:   item.recLevel ?? 0,
    req_level:   item.reqLevel ?? 0,
  }));

  console.log(`  Found ${itemRows.length} items`);
  await batchUpsert('eq_items', itemRows);

  // ── Monsters ──────────────────────────────────────────────────────────────
  const monsterRows = Object.values(MONSTERS).map((m: any) => ({
    id:           m.id,
    name:         m.name,
    zones:        m.zones ?? [],
    level_min:    m.levelRange?.min ?? 1,
    level_max:    m.levelRange?.max ?? 1,
    hp:           m.hp ?? 100,
    dmg_min:      m.damageRange?.min ?? 1,
    dmg_max:      m.damageRange?.max ?? 5,
    xp_reward:    m.xpReward ?? 10,
    monster_type: m.type ?? 'humanoid',
    aggro:        m.aggro ?? false,
    social:       m.social ?? false,
  }));

  console.log(`  Found ${monsterRows.length} monsters`);
  await batchUpsert('eq_monsters', monsterRows);

  // ── Loot entries ──────────────────────────────────────────────────────────
  const lootRows: object[] = [];
  for (const m of Object.values(MONSTERS) as any[]) {
    for (const entry of (m.lootTable ?? [])) {
      lootRows.push({
        monster_id:   m.id,
        item_id:      entry.itemId,
        drop_chance:  entry.dropChance ?? 0.1,
        min_quantity: entry.minQuantity ?? 1,
        max_quantity: entry.maxQuantity ?? 1,
      });
    }
  }

  console.log(`  Found ${lootRows.length} loot entries`);
  await batchUpsert('eq_loot_entries', lootRows);

  // ── Zone-item index ───────────────────────────────────────────────────────
  const zoneItemSet = new Set<string>();
  for (const m of Object.values(MONSTERS) as any[]) {
    for (const zone of (m.zones ?? [])) {
      for (const entry of (m.lootTable ?? [])) {
        zoneItemSet.add(`${zone}::${entry.itemId}`);
      }
    }
  }
  const zoneItemRows = [...zoneItemSet].map((key) => {
    const [zone_id, item_id] = key.split('::');
    return { zone_id, item_id };
  });

  console.log(`  Found ${zoneItemRows.length} zone-item mappings`);
  await batchUpsert('eq_zone_items', zoneItemRows);

  console.log('\n✅  Static seed complete.');
}

// ─────────────────────────────────────────────────────────────────────────────
// MODE 2: PARSE PEQ SQL DUMP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse a single INSERT ... VALUES (...),(...) line from a SQL dump.
 * Returns array of row objects keyed by column name.
 */
function parseInsertLine(line: string): { table: string; rows: Record<string, string | null>[] } | null {
  // Match: INSERT INTO `table` (`col1`,`col2`,...) VALUES (v1,v2,...),(v1,v2,...);
  const match = line.match(/^INSERT INTO `?(\w+)`?\s*\(([^)]+)\)\s+VALUES\s+([\s\S]+?);?\s*$/i);
  if (!match) return null;

  const table   = match[1];
  const colsRaw = match[2];
  const valsRaw = match[3];

  const cols = colsRaw.split(',').map((c) => c.trim().replace(/`/g, ''));

  // Split VALUES into individual row tuples — handle quoted commas
  const rows: Record<string, string | null>[] = [];
  const tupleRe = /\(([^)]*(?:'[^']*'[^)]*)*)\)/g;
  let tupleMatch: RegExpExecArray | null;
  while ((tupleMatch = tupleRe.exec(valsRaw)) !== null) {
    const vals = splitTuple(tupleMatch[1]);
    const row: Record<string, string | null> = {};
    cols.forEach((col, i) => {
      const v = vals[i]?.trim();
      row[col] = v === 'NULL' ? null : v?.replace(/^'|'$/g, '') ?? null;
    });
    rows.push(row);
  }

  return { table, rows };
}

function splitTuple(raw: string): string[] {
  const parts: string[] = [];
  let current = '';
  let inQuote = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === "'" && raw[i - 1] !== '\\') { inQuote = !inQuote; current += ch; }
    else if (ch === ',' && !inQuote) { parts.push(current); current = ''; }
    else current += ch;
  }
  parts.push(current);
  return parts;
}

function peqRowToItem(row: Record<string, string | null>): object {
  const id = parseInt(row['id'] ?? '0', 10);
  const name = row['Name'] ?? row['name'] ?? 'Unknown';
  const slotMask  = parseInt(row['slots']   ?? '0', 10);
  const classMask = parseInt(row['classes'] ?? '65535', 10);
  const raceMask  = parseInt(row['races']   ?? '65535', 10);
  const itemType  = parseInt(row['itemtype'] ?? '10', 10);

  const classes = classMask === 65535 ? [] : decodeMask(classMask, PEQ_CLASSES);
  const races   = raceMask  === 65535 ? [] : decodeMask(raceMask,  PEQ_RACES);

  return {
    id:          slugify(name, id),
    peq_id:      id,
    name,
    slot:        decodeSlot(slotMask),
    item_type:   PEQ_ITEMTYPE[itemType] ?? 'misc',
    rarity:      'common',
    damage:      parseInt(row['damage']  ?? '0', 10),
    delay:       parseInt(row['delay']   ?? '0', 10),
    ac:          parseInt(row['aac']     ?? '0', 10),
    hp:          parseInt(row['hp']      ?? '0', 10),
    mana:        parseInt(row['mana']    ?? '0', 10),
    endurance:   parseInt(row['endur']   ?? '0', 10),
    str:         parseInt(row['astr']    ?? '0', 10),
    sta:         parseInt(row['asta']    ?? '0', 10),
    agi:         parseInt(row['aagi']    ?? '0', 10),
    dex:         parseInt(row['adex']    ?? '0', 10),
    wis:         parseInt(row['awis']    ?? '0', 10),
    int:         parseInt(row['aint']    ?? '0', 10),
    cha:         parseInt(row['acha']    ?? '0', 10),
    sv_magic:    parseInt(row['mr']      ?? '0', 10),
    sv_fire:     parseInt(row['fr']      ?? '0', 10),
    sv_cold:     parseInt(row['cr']      ?? '0', 10),
    sv_disease:  parseInt(row['dr']      ?? '0', 10),
    sv_poison:   parseInt(row['pr']      ?? '0', 10),
    attack:      parseInt(row['attack']  ?? '0', 10),
    hp_regen:    parseInt(row['hpregen'] ?? '0', 10),
    mana_regen:  parseInt(row['manaregen'] ?? '0', 10),
    avoidance:   parseInt(row['avoidance'] ?? '0', 10),
    spell_dmg:   parseInt(row['spellshield'] ?? '0', 10),
    dot_shield:  parseInt(row['dotshielding'] ?? '0', 10),
    weight:      parseInt(row['weight']  ?? '1', 10) / 10,
    value:       parseInt(row['price']   ?? '0', 10),
    lore:        row['lore'] === '1' || row['Lore'] === '1',
    no_drop:     row['nodrop'] === '1' || row['NoDrop'] === '1',
    magic:       row['magic'] === '1' || row['Magic'] === '1',
    stackable:   row['stackable'] === '1',
    stack_size:  parseInt(row['stacksize'] ?? '1', 10),
    source:      'drop',
    description: row['lore_text'] ?? row['comment'] ?? '',
    classes,
    races,
    rec_level:   parseInt(row['reclevel']  ?? '0', 10),
    req_level:   parseInt(row['reqlevel']  ?? '0', 10),
  };
}

function peqRowToMonster(row: Record<string, string | null>): object {
  const id = parseInt(row['id'] ?? '0', 10);
  const name = row['name'] ?? 'Unknown';
  return {
    id:           slugify(name, id),
    peq_id:       id,
    name,
    zones:        [],                   // populated from spawn2 table below
    level_min:    parseInt(row['level']      ?? '1', 10),
    level_max:    parseInt(row['maxlevel']   ?? row['level'] ?? '1', 10),
    hp:           parseInt(row['hp']        ?? '100', 10),
    dmg_min:      parseInt(row['mindmg']    ?? '1', 10),
    dmg_max:      parseInt(row['maxdmg']    ?? '5', 10),
    xp_reward:    parseInt(row['exp']       ?? '10', 10),
    monster_type: 'humanoid',
    aggro:        parseInt(row['aggroradius'] ?? '0', 10) > 0,
    social:       false,
  };
}

async function importFromPEQ(filePath: string): Promise<void> {
  console.log(`\n🗄️   Importing from PEQ dump: ${filePath}`);
  console.log('    (This may take several minutes for a full dump)\n');

  const itemBuffer: object[] = [];
  const monsterBuffer: object[] = [];
  let totalItems = 0, totalMonsters = 0;

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('INSERT INTO')) continue;

    const parsed = parseInsertLine(trimmed);
    if (!parsed) continue;

    const { table, rows } = parsed;

    if (table === 'items') {
      for (const row of rows) {
        itemBuffer.push(peqRowToItem(row));
        if (itemBuffer.length >= 500) {
          await batchUpsert('eq_items', itemBuffer.splice(0));
          totalItems += 500;
          console.log(`  items imported so far: ${totalItems}`);
        }
      }
    } else if (table === 'npc_types') {
      for (const row of rows) {
        monsterBuffer.push(peqRowToMonster(row));
        if (monsterBuffer.length >= 500) {
          await batchUpsert('eq_monsters', monsterBuffer.splice(0));
          totalMonsters += 500;
          console.log(`  monsters imported so far: ${totalMonsters}`);
        }
      }
    }
  }

  // Flush remaining
  if (itemBuffer.length)   await batchUpsert('eq_items',    itemBuffer);
  if (monsterBuffer.length) await batchUpsert('eq_monsters', monsterBuffer);

  console.log(`\n✅  PEQ import complete. Items: ${totalItems + itemBuffer.length}, Monsters: ${totalMonsters + monsterBuffer.length}`);
  console.log('    Note: zone-spawn and loot-table linking requires the spawn2 and loottable tables.');
  console.log('    Re-run with a dump that includes those tables for full loot mapping.');
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log('🗡️   EverQuest Idle — PEQ Import Tool');
  console.log('    Supabase URL:', SUPABASE_URL.slice(0, 40) + '…');

  if (doSeed)  await seedFromStatic();
  if (peqFile) await importFromPEQ(peqFile);

  console.log('\nDone! Check your Supabase dashboard to confirm rows are present.\n');
}

main().catch((e) => { console.error(e); process.exit(1); });
