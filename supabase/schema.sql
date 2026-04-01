-- EverQuest Idle — Supabase Item/Monster Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ─────────────────────────────────────────────────────────────────────────────
-- ITEMS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS eq_items (
  id          TEXT PRIMARY KEY,        -- slug id (e.g. "rusty_short_sword")
  peq_id      INTEGER,                 -- original PEQ item ID (null for hand-crafted)
  name        TEXT NOT NULL,

  -- Equipment
  slot        TEXT,                    -- 'Primary','Secondary','Head','Chest', etc.
  item_type   TEXT,                    -- 'weapon','armor','shield','jewelry','quest','misc'
  rarity      TEXT DEFAULT 'common',   -- 'common','uncommon','rare','epic'

  -- Combat stats
  damage      INTEGER DEFAULT 0,
  delay       INTEGER DEFAULT 0,

  -- Defense & pools
  ac          INTEGER DEFAULT 0,
  hp          INTEGER DEFAULT 0,
  mana        INTEGER DEFAULT 0,
  endurance   INTEGER DEFAULT 0,

  -- Attributes
  str         INTEGER DEFAULT 0,
  sta         INTEGER DEFAULT 0,
  agi         INTEGER DEFAULT 0,
  dex         INTEGER DEFAULT 0,
  wis         INTEGER DEFAULT 0,
  int         INTEGER DEFAULT 0,
  cha         INTEGER DEFAULT 0,

  -- Saves
  sv_magic    INTEGER DEFAULT 0,
  sv_fire     INTEGER DEFAULT 0,
  sv_cold     INTEGER DEFAULT 0,
  sv_disease  INTEGER DEFAULT 0,
  sv_poison   INTEGER DEFAULT 0,

  -- Combat misc
  attack      INTEGER DEFAULT 0,
  hp_regen    INTEGER DEFAULT 0,
  mana_regen  INTEGER DEFAULT 0,
  avoidance   INTEGER DEFAULT 0,
  spell_dmg   INTEGER DEFAULT 0,
  dot_shield  INTEGER DEFAULT 0,

  -- Item properties
  weight      FLOAT   DEFAULT 0.1,
  value       INTEGER DEFAULT 0,       -- in copper
  lore        BOOLEAN DEFAULT false,
  no_drop     BOOLEAN DEFAULT false,
  magic       BOOLEAN DEFAULT false,
  stackable   BOOLEAN DEFAULT false,
  stack_size  INTEGER DEFAULT 1,
  source      TEXT    DEFAULT 'drop',  -- 'drop','vendor','quest','craft'
  description TEXT,

  -- Restrictions (stored as JSON arrays)
  classes     TEXT[]  DEFAULT '{}',
  races       TEXT[]  DEFAULT '{}',
  rec_level   INTEGER DEFAULT 0,
  req_level   INTEGER DEFAULT 0,

  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eq_items_slot  ON eq_items(slot);
CREATE INDEX IF NOT EXISTS idx_eq_items_level ON eq_items(req_level);

-- ─────────────────────────────────────────────────────────────────────────────
-- MONSTERS / NPCS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS eq_monsters (
  id           TEXT PRIMARY KEY,       -- slug id
  peq_id       INTEGER,                -- original PEQ npc_types.id
  name         TEXT NOT NULL,

  zones        TEXT[]  DEFAULT '{}',   -- zone slugs where this monster spawns
  level_min    INTEGER DEFAULT 1,
  level_max    INTEGER DEFAULT 1,
  hp           INTEGER DEFAULT 100,
  dmg_min      INTEGER DEFAULT 1,
  dmg_max      INTEGER DEFAULT 5,
  xp_reward    INTEGER DEFAULT 10,
  monster_type TEXT    DEFAULT 'humanoid',
  aggro        BOOLEAN DEFAULT false,
  social       BOOLEAN DEFAULT false,

  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eq_monsters_zones ON eq_monsters USING GIN(zones);

-- ─────────────────────────────────────────────────────────────────────────────
-- LOOT ENTRIES  (monster → item drop chances)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS eq_loot_entries (
  id           SERIAL PRIMARY KEY,
  monster_id   TEXT REFERENCES eq_monsters(id) ON DELETE CASCADE,
  item_id      TEXT REFERENCES eq_items(id)    ON DELETE CASCADE,
  drop_chance  FLOAT   DEFAULT 0.1,            -- 0.0–1.0
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_loot_monster ON eq_loot_entries(monster_id);
CREATE INDEX IF NOT EXISTS idx_loot_item    ON eq_loot_entries(item_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- ZONE ITEM INDEX  (pre-computed: which items can be found in a zone)
-- Built by the import script; used for fast "what drops in this zone?" lookups.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS eq_zone_items (
  zone_id  TEXT NOT NULL,
  item_id  TEXT NOT NULL REFERENCES eq_items(id) ON DELETE CASCADE,
  PRIMARY KEY (zone_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_zone_items_zone ON eq_zone_items(zone_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security (items/monsters are public read-only reference data)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE eq_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE eq_monsters     ENABLE ROW LEVEL SECURITY;
ALTER TABLE eq_loot_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE eq_zone_items   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read eq_items"        ON eq_items        FOR SELECT USING (true);
CREATE POLICY "public read eq_monsters"     ON eq_monsters     FOR SELECT USING (true);
CREATE POLICY "public read eq_loot_entries" ON eq_loot_entries FOR SELECT USING (true);
CREATE POLICY "public read eq_zone_items"   ON eq_zone_items   FOR SELECT USING (true);
