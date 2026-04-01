// All 14 vanilla EQ classes
export type CharacterClass =
  | 'Warrior'
  | 'Monk'
  | 'Rogue'
  | 'Paladin'
  | 'ShadowKnight'
  | 'Ranger'
  | 'Bard'
  | 'Cleric'
  | 'Druid'
  | 'Shaman'
  | 'Wizard'
  | 'Magician'
  | 'Enchanter'
  | 'Necromancer';

// All vanilla EQ races
export type Race =
  | 'Human'
  | 'Barbarian'
  | 'Erudite'
  | 'WoodElf'
  | 'HighElf'
  | 'DarkElf'
  | 'HalfElf'
  | 'Dwarf'
  | 'Troll'
  | 'Ogre'
  | 'Halfling'
  | 'Gnome';

// Equipment slots — all 21 EQ gear slots
export type EquipSlot =
  | 'Head'
  | 'Face'
  | 'Ear1'
  | 'Ear2'
  | 'Neck'
  | 'Shoulders'
  | 'Arms'
  | 'Back'
  | 'Wrist1'
  | 'Wrist2'
  | 'Range'
  | 'Hands'
  | 'Primary'
  | 'Secondary'
  | 'Fingers1'
  | 'Fingers2'
  | 'Chest'
  | 'Legs'
  | 'Feet'
  | 'Waist'
  | 'Ammo';

export type ItemType =
  | 'armor'
  | 'weapon'
  | 'shield'
  | 'jewelry'
  | 'tradeskill'
  | 'food'
  | 'drink'
  | 'quest'
  | 'scroll'
  | 'container';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type MonsterType =
  | 'humanoid'
  | 'animal'
  | 'undead'
  | 'magical'
  | 'plant'
  | 'construct';

export type PersonalityType =
  | 'Grinder'
  | 'Tradeskiller'
  | 'Merchant'
  | 'Casual'
  | 'Tank'
  | 'Healer'
  | 'Loner'
  | 'Social'
  | 'AFKFarmer'
  | 'NinjaLooter'
  | 'KSer'
  | 'CampStealer'
  | 'Drama'
  | 'Burnout'
  | 'Returning'
  | 'NewPlayer'
  | 'Addict'
  | 'Conspiracy'
  | 'Roleplayer'
  | 'ForumWarrior'
  | 'GuildOfficer'
  | 'Economist'
  | 'Speedrunner'
  | 'Pacifist'
  | 'Veteran';

export type Continent = 'Antonica' | 'Faydwer' | 'Odus' | 'Planes';

export type ZoneType = 'outdoor' | 'dungeon' | 'city' | 'raid' | 'plane';

export interface ItemStats {
  ac?: number;
  hp?: number;
  mana?: number;
  endurance?: number;
  str?: number;
  sta?: number;
  agi?: number;
  dex?: number;
  wis?: number;
  int?: number;
  cha?: number;
  svMagic?: number;
  svFire?: number;
  svCold?: number;
  svDisease?: number;
  svPoison?: number;
  attack?: number;
  hpRegen?: number;
  manaRegen?: number;
  avoidance?: number;
  spellDmg?: number;
  dotShield?: number;
  damage?: number;
  delay?: number;
}

export interface Item {
  id: string;
  name: string;
  slot: EquipSlot | null;
  type: ItemType;
  rarity: ItemRarity;
  stats: ItemStats;
  weight: number;
  classes: CharacterClass[] | 'ALL';
  races: Race[] | 'ALL';
  lore: boolean;
  noDrop: boolean;
  stackable: boolean;
  stackSize?: number;
  value: number;
  source: 'monster' | 'drop' | 'tradeskill' | 'vendor' | 'quest';
  sprite: string;
  recLevel?: number;
  reqLevel?: number;
  description?: string;
}

export interface LootEntry {
  itemId: string;
  dropChance: number;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface Monster {
  id: string;
  name: string;
  zones: string[];
  levelRange: { min: number; max: number };
  hp: number;
  damageRange: { min: number; max: number };
  lootTable: LootEntry[];
  xpReward: number;
  sprite: string;
  type: MonsterType;
  aggro: boolean;
  social: boolean;
}

export interface Zone {
  id: string;
  name: string;
  shortName: string;
  continent: Continent;
  type: ZoneType;
  levelRange: { min: number; max: number };
  zem: number;
  monsters: string[];
  isRaidZone: boolean;
  minGroupSize?: number;
  minLevel?: number;
  dungeonLevel?: number;
  connectsTo: string[];
  description: string;
}

export interface CharacterStats {
  str: number;
  sta: number;
  agi: number;
  dex: number;
  wis: number;
  int: number;
  cha: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  ac: number;
  attack: number;
}

export type EquipmentSlots = Partial<Record<EquipSlot, Item>>;

/** Persistent counters for achievement tracking */
export interface PlayerTracking {
  totalKills: number;
  gnollKills: number;
  undeadKills: number;
  giantKills: number;
  dragonKills: number;
  zonesVisited: string[];         // zone IDs visited
  continentsVisited: string[];    // 'Antonica' | 'Faydwer' | 'Odus' | 'Planes'
  tradeskillCombines: number;
  bazaarPurchases: number;
  bazaarSales: number;
  platEarned: number;             // lifetime plat earned
  deathsTotal: number;
  groupsFormed: number;           // times player was in a group
  timesGroupedWithGhost: number;
  raidBossesKilled: string[];     // monster IDs of raid bosses killed
}

export function defaultTracking(): PlayerTracking {
  return {
    totalKills: 0,
    gnollKills: 0,
    undeadKills: 0,
    giantKills: 0,
    dragonKills: 0,
    zonesVisited: [],
    continentsVisited: [],
    tradeskillCombines: 0,
    bazaarPurchases: 0,
    bazaarSales: 0,
    platEarned: 0,
    deathsTotal: 0,
    groupsFormed: 0,
    timesGroupedWithGhost: 0,
    raidBossesKilled: [],
  };
}

export interface PlayerCharacter {
  name: string;
  race: Race;
  class: CharacterClass;
  level: number;
  xp: number;
  xpToNextLevel: number;
  stats: CharacterStats;
  gear: EquipmentSlots;
  inventory: (Item | null)[];
  currency: { pp: number; gp: number; sp: number; cp: number };
  currentZone: string;
  skills: Record<string, number>;
  deathCount: number; // total deaths for stat tracking
  tracking?: PlayerTracking;
}

export type GhostGoalType =
  | 'ReachLevel'
  | 'FindGroup'
  | 'FlipItems'
  | 'CraftItem'
  | 'ExploreZone'
  | 'FarmItem'
  | 'Recover';

export interface GhostGoal {
  type: GhostGoalType;
  targetLevel?: number;      // for ReachLevel
  targetZone?: string;       // for ExploreZone
  targetItemId?: string;     // for FarmItem / CraftItem
  progressTicks?: number;    // ticks spent on this goal
}

export interface GhostReputation {
  title?: string;        // e.g. "Known Tank", "Famous Crafter", "Infamous Ninja"
  killPoints: number;    // lifetime kill score
  craftPoints: number;   // lifetime crafting score
  raidPoints: number;    // lifetime raid boss kills
  tradingPoints: number; // lifetime bazaar trades
}

export interface GhostPlayer {
  id: string;
  name: string;
  race: Race;
  class: CharacterClass;
  level: number;
  xp: number;
  xpToNextLevel: number;
  personality: PersonalityType;
  isOnline: boolean;
  currentZone: string;
  currentActivity: string;
  gear: EquipmentSlots;
  stats: CharacterStats;
  plat: number;
  achievements: string[];
  deathCount: number;
  skills: Record<string, number>;
  recoveryTicksRemaining: number;
  mood?: 'normal' | 'tilted' | 'euphoric' | 'panicking' | 'bored';
  memory?: string[];           // last N event strings this ghost experienced
  memorySummary?: string;      // LLM-compressed summary of past events
  llmCooldownUntilTick?: number; // don't call LLM again until this tick
  currentGoal?: GhostGoal;
  allies?: string[];           // ghost IDs this ghost considers friendly
  rivals?: string[];           // ghost IDs this ghost dislikes
  guildName?: string;
  reputation?: GhostReputation;
}

export interface GroupState {
  members: string[];
  lootStyle: 'roundRobin' | 'freeForAll' | 'leader';
}

export interface CombatLogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'hit' | 'miss' | 'spell' | 'death' | 'loot' | 'xp' | 'system';
}

export interface CombatState {
  isActive: boolean;
  currentMonster: Monster | null;
  monsterCurrentHp: number;
  lastTickTime: number;
  autoAttacking: boolean;
  currentTarget: string | null;
  lastSwingTick: number;       // tick number of last weapon swing
  currentMonsterLevel: number; // level of the currently-engaged monster
}

// ── Tradeskill types ─────────────────────────────────────────────────────────

export type TradeskillName =
  | 'Blacksmithing'
  | 'Tailoring'
  | 'Baking'
  | 'Brewing'
  | 'Jewelcrafting'
  | 'Pottery'
  | 'Fletching'
  | 'Fishing'
  | 'Tinkering';

export interface TradeskillRecipe {
  id: string;
  name: string;
  skill: TradeskillName;
  skillRequired: number;
  skillGainChance: number;
  ingredients: { itemId: string; quantity: number }[];
  resultItemId: string;
  resultQuantity: number;
  trivial: number;
  failProduct?: string;
}

// ── Bazaar types ─────────────────────────────────────────────────────────────

export interface BazaarListing {
  id: string;
  sellerId: string;
  sellerName: string;
  itemId: string;
  itemName: string;
  quantity: number;
  pricePerUnit: number;
  listedAt: number;
  category: TradeskillName | 'loot' | 'misc';
}

export interface BazaarState {
  listings: BazaarListing[];
  lastRefreshTick: number;
}

export interface ServerEvent {
  id: string;
  tick: number;
  type: 'firstLevel60' | 'guildFormed' | 'raidKill' | 'massLogin' | 'milestone';
  message: string;
}

// ── Spell types ─────────────────────────────────────────────────────────────

export type SpellSchool = 'fire' | 'cold' | 'magic' | 'disease' | 'poison' | 'divine' | 'song';

export type SpellEffect =
  | 'dd'          // direct damage
  | 'dot'         // damage over time
  | 'heal'        // direct heal
  | 'hot'         // heal over time
  | 'buff'        // stat/resist buff
  | 'debuff'      // stat/resist debuff
  | 'slow'        // attack speed slow
  | 'haste'       // attack speed haste
  | 'mez'         // mesmerize
  | 'root'        // root
  | 'fear'        // fear
  | 'charm'       // charm
  | 'lifetap'     // lifetap
  | 'pet'         // summon pet
  | 'port'        // teleport
  | 'snare'       // movement slow
  | 'rune';       // absorb damage shield

export interface Spell {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;            // level required to use
  school: SpellSchool;
  effect: SpellEffect;
  manaCost: number;
  castTime: number;         // in seconds (ticks)
  recastTime: number;       // in seconds
  duration: number;         // in ticks (0 = instant)
  value: number;            // damage / heal / buff amount
  dotValue?: number;        // per-tick damage for DoT
  description: string;
  targetSelf?: boolean;     // true = self-only
  targetGroup?: boolean;    // true = group-wide
  targetAoE?: boolean;      // true = AoE
  resistable?: boolean;
}

// ── Faction types ────────────────────────────────────────────────────────────

export type FactionStandingName =
  | 'Scowling'
  | 'Glaring'
  | 'Dubious'
  | 'Apprehensive'
  | 'Indifferent'
  | 'Amiable'
  | 'Kindly'
  | 'Warmly'
  | 'Ally';

export interface Faction {
  id: string;
  name: string;
  description: string;
  city?: string;
  alignment: 'good' | 'neutral' | 'evil';
  /** Starting standing for a neutral character (0 = Indifferent) */
  defaultValue: number;
  /** Kill these monsters to LOWER this faction */
  killedBy?: string[];
  /** Kill these monsters to RAISE this faction */
  raisedByKilling?: string[];
  /** Related factions that move together (same sign) */
  linkedFactions?: { factionId: string; modifier: number }[];
}

export interface FactionStanding {
  factionId: string;
  value: number;       // -2000 to +2000
  standing: FactionStandingName;
}

// ── Quest types ──────────────────────────────────────────────────────────────

export type QuestCategory = 'faction' | 'epic_precursor' | 'plane_access' | 'tradeskill' | 'lore';

export interface QuestStep {
  id: string;
  description: string;
  /** Monster ID to kill for this step */
  killMonsterId?: string;
  killCount?: number;
  /** Item ID required for this step */
  requireItemId?: string;
  /** Faction required to complete */
  requireFactionId?: string;
  requireFactionStanding?: FactionStandingName;
  /** Zone required to be in */
  requireZoneId?: string;
  /** Level requirement */
  requireLevel?: number;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  category: QuestCategory;
  startZone: string;
  minLevel: number;
  steps: QuestStep[];
  rewards: {
    xp?: number;
    currency?: { pp?: number; gp?: number; sp?: number; cp?: number };
    itemIds?: string[];
    factionChanges?: { factionId: string; amount: number }[];
  };
  prerequisiteQuestIds?: string[];
  npcName?: string;
}

export interface ActiveQuest {
  questId: string;
  stepIndex: number;          // current step (0-based)
  stepProgress: number;       // kills / items toward current step
  startedAt: number;          // tickCount when started
}

export interface GameState {
  player: PlayerCharacter;
  combat: CombatState;
  combatLog: CombatLogEntry[];
  ghosts: GhostPlayer[];
  group: GroupState;
  currentZone: Zone;
  tickCount: number;
  gameStarted: boolean;
  characterCreated: boolean;
  bazaar: BazaarState;
  llmErrorCount: number;
  lastLlmError?: string;
  serverEvents: ServerEvent[];
  /** Faction standings — keyed by faction ID, value is -2000 to +2000 */
  factionStandings: Record<string, number>;
  /** Spell IDs the player has learned (their spellbook) */
  spellBook: string[];
  /** Spell IDs currently memorized in gem slots (up to 8) */
  memorizedSpells: (string | null)[];
  /** Active quests in progress */
  activeQuests: ActiveQuest[];
  /** Completed quest IDs */
  completedQuests: string[];
  /** Item currently being examined in the popup window */
  examineItem: Item | null;
  /** Whether the player is currently sitting (faster regen, cannot attack) */
  isSitting: boolean;
}
