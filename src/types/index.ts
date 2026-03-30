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
  | 'AFKFarmer';

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
  slot: EquipSlot;
  type: ItemType;
  rarity: ItemRarity;
  stats: ItemStats;
  weight: number;
  classes: CharacterClass[];
  races: Race[];
  lore: boolean;
  noDrop: boolean;
  stackable: boolean;
  stackSize?: number;
  value: number;
  source: 'drop' | 'tradeskill' | 'vendor' | 'quest';
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
}

export interface GhostPlayer {
  id: string;
  name: string;
  race: Race;
  class: CharacterClass;
  level: number;
  xp: number;
  xpToNextLevel: number;
  currentHp: number;
  personality: PersonalityType;
  isOnline: boolean;
  currentZone: string;
  currentActivity: string;
  gear: EquipmentSlots;
  stats: CharacterStats;
  plat: number;
  achievements: string[];
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

export interface GameState {
  player: PlayerCharacter;
  combat: CombatState;
  combatLog: CombatLogEntry[];
  ghosts: GhostPlayer[];
  currentZone: Zone;
  tickCount: number;
  gameStarted: boolean;
}
