import { create } from 'zustand';
import type {
  GameState,
  PlayerCharacter,
  CombatState,
  CombatLogEntry,
  Item,
  EquipSlot,
  GhostPlayer,
  CharacterStats,
  Race,
  CharacterClass,
} from '../types';
import { ZONES, STARTING_ZONE } from '../data/zones';
import { processTick } from '../engine/tick';
import { processGhostTick } from '../engine/ghostAI';
import { saveGameState, loadGameState } from '../engine/save';
import { calcXpToNextLevel } from '../engine/combat';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const GHOST_NAMES = [
  'Talindra', 'Brokk', 'Serenaya', 'Grimtooth', 'Yallara',
  'Thunderforge', 'Moonwhisper', 'Darkclaw', 'Silverveil', 'Ironpaw',
  'Ashveil', 'Stonehammer', 'Windrunner', 'Shadowblade', 'Dawnseeker',
  'Bloodmane', 'Frostweave', 'Emberfall', 'Stormcaller', 'Nightshade',
];

const GHOST_RACES: Race[] = ['Human', 'Barbarian', 'WoodElf', 'HalfElf', 'Dwarf', 'Halfling', 'Gnome'];
const GHOST_CLASSES: CharacterClass[] = ['Warrior', 'Rogue', 'Ranger', 'Cleric', 'Druid', 'Wizard', 'Shaman'];
const GHOST_PERSONALITIES = ['Grinder', 'Tradeskiller', 'Merchant', 'Casual', 'Tank', 'Healer', 'Loner', 'Social', 'AFKFarmer'] as const;

function makeDefaultStats(): CharacterStats {
  return {
    str: 75, sta: 75, agi: 75, dex: 75,
    wis: 75, int: 75, cha: 75,
    hp: 100, maxHp: 100,
    mana: 100, maxMana: 100,
    ac: 10, attack: 30,
  };
}

function makeGhost(index: number): GhostPlayer {
  const race = GHOST_RACES[index % GHOST_RACES.length];
  const cls = GHOST_CLASSES[index % GHOST_CLASSES.length];
  const personality = GHOST_PERSONALITIES[index % GHOST_PERSONALITIES.length];
  const defaultStats = makeDefaultStats();
  return {
    id: generateId(),
    name: GHOST_NAMES[index % GHOST_NAMES.length] + (index >= GHOST_NAMES.length ? `_${Math.floor(index / GHOST_NAMES.length)}` : ''),
    race,
    class: cls,
    level: 1,
    xp: 0,
    xpToNextLevel: calcXpToNextLevel(1),
    currentHp: defaultStats.maxHp,
    personality,
    isOnline: Math.random() > 0.4,
    currentZone: 'qeynos_hills',
    currentActivity: 'Idle',
    gear: {},
    stats: defaultStats,
    plat: 0,
    achievements: [],
  };
}

function makeInitialPlayer(): PlayerCharacter {
  return {
    name: 'Adventurer',
    race: 'Human',
    class: 'Warrior',
    level: 1,
    xp: 0,
    xpToNextLevel: calcXpToNextLevel(1),
    stats: makeDefaultStats(),
    gear: {
      Primary: {
        id: 'rusty_short_sword',
        name: 'Rusty Short Sword',
        slot: 'Primary',
        type: 'weapon',
        rarity: 'common',
        stats: { damage: 3, delay: 25 },
        weight: 5.0,
        classes: ['Warrior', 'Paladin', 'ShadowKnight', 'Ranger', 'Rogue', 'Bard'],
        races: ['Human', 'Barbarian', 'Erudite', 'WoodElf', 'HighElf', 'DarkElf', 'HalfElf', 'Dwarf', 'Troll', 'Ogre', 'Halfling', 'Gnome'],
        lore: false,
        noDrop: false,
        stackable: false,
        value: 5,
        source: 'vendor',
        sprite: '/assets/sprites/items/rusty_short_sword.png',
        recLevel: 1,
        description: 'A worn and rusty short sword. Better than nothing.',
      },
    },
    inventory: new Array(30).fill(null) as (null)[],
    currency: { pp: 0, gp: 0, sp: 0, cp: 0 },
    currentZone: 'qeynos_hills',
    skills: {
      '1HSlash': 5,
      Defense: 5,
      Offense: 5,
    },
    deathCount: 0,
  };
}

const initialCombat: CombatState = {
  isActive: false,
  currentMonster: null,
  monsterCurrentHp: 0,
  lastTickTime: 0,
  autoAttacking: false,
  currentTarget: null,
  lastSwingTick: 0,
  currentMonsterLevel: 0,
};

interface GameStore extends GameState {
  startGame: () => void;
  toggleAutoCombat: () => void;
  changeZone: (zoneId: string) => void;
  tick: () => void;
  addCombatLogEntry: (entry: Omit<CombatLogEntry, 'id' | 'timestamp'>) => void;
  equipItem: (item: Item, slot: EquipSlot) => void;
  unequipItem: (slot: EquipSlot) => void;
  resetGame: () => void;
  saveGame: () => void;
  loadGame: () => void;
  // Required actions per spec
  gainXP: (amount: number) => void;
  levelUp: () => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  moveToZone: (zoneId: string) => void;
  setCurrentTarget: (monsterId: string | null) => void;
  incrementTick: () => void;
  clearCombatLog: () => void;
}

const initialGhosts = Array.from({ length: 100 }, (_, i) => makeGhost(i));

export const useGameStore = create<GameStore>((set, get) => ({
  player: makeInitialPlayer(),
  combat: initialCombat,
  combatLog: [
    {
      id: generateId(),
      timestamp: Date.now(),
      message: 'Welcome to EverQuest Idle! Toggle [AUTO COMBAT] to begin.',
      type: 'system',
    },
  ],
  ghosts: initialGhosts,
  currentZone: STARTING_ZONE,
  tickCount: 0,
  gameStarted: false,

  startGame: () => set({ gameStarted: true }),

  toggleAutoCombat: () => {
    const { combat, gameStarted } = get();
    if (!gameStarted) {
      set({ gameStarted: true });
    }
    const newAutoAttacking = !combat.autoAttacking;
    set({
      combat: {
        ...combat,
        autoAttacking: newAutoAttacking,
        isActive: newAutoAttacking,
      },
    });
    get().addCombatLogEntry({
      message: newAutoAttacking ? 'Auto Combat ENABLED.' : 'Auto Combat DISABLED.',
      type: 'system',
    });
  },

  changeZone: (zoneId: string) => {
    const zone = ZONES[zoneId];
    if (!zone) return;
    const { player } = get();
    if (player.level < zone.levelRange.min - 5 && zone.levelRange.min > 1) {
      get().addCombatLogEntry({
        message: `You are too low level for ${zone.name}.`,
        type: 'system',
      });
      return;
    }
    set({
      currentZone: zone,
      combat: { ...get().combat, currentMonster: null, monsterCurrentHp: 0 },
      player: { ...player, currentZone: zoneId },
    });
    get().addCombatLogEntry({
      message: `You enter ${zone.name}.`,
      type: 'system',
    });
  },

  tick: () => {
    const state = get();
    const playerUpdates = processTick(state);
    // Build an intermediate state so ghostAI can see the player-tick results
    // (including the incremented tickCount and updated combatLog).
    const stateAfterPlayer: GameState = {
      player: playerUpdates.player ?? state.player,
      combat: playerUpdates.combat ?? state.combat,
      combatLog: playerUpdates.combatLog ?? state.combatLog,
      ghosts: state.ghosts,
      currentZone: playerUpdates.currentZone ?? state.currentZone,
      tickCount: playerUpdates.tickCount ?? state.tickCount,
      gameStarted: state.gameStarted,
    };
    const ghostUpdates = processGhostTick(stateAfterPlayer, stateAfterPlayer.tickCount);
    set({ ...playerUpdates, ...ghostUpdates } as Partial<GameStore>);
  },

  addCombatLogEntry: (entry) => {
    const id = generateId();
    const newEntry: CombatLogEntry = {
      id,
      timestamp: Date.now(),
      ...entry,
    };
    set((state) => ({
      combatLog: [...state.combatLog, newEntry].slice(-200),
    }));
  },

  equipItem: (item: Item, slot: EquipSlot) => {
    set((state) => ({
      player: {
        ...state.player,
        gear: { ...state.player.gear, [slot]: item },
      },
    }));
  },

  unequipItem: (slot: EquipSlot) => {
    set((state) => {
      const gear = { ...state.player.gear };
      delete gear[slot];
      return { player: { ...state.player, gear } };
    });
  },

  resetGame: () => {
    set({
      player: makeInitialPlayer(),
      combat: initialCombat,
      combatLog: [{
        id: generateId(),
        timestamp: Date.now(),
        message: 'Game reset. Welcome back to Norrath!',
        type: 'system',
      }],
      ghosts: Array.from({ length: 100 }, (_, i) => makeGhost(i)),
      currentZone: STARTING_ZONE,
      tickCount: 0,
      gameStarted: false,
    });
  },

  saveGame: () => {
    const { player, combat, currentZone, tickCount, ghosts } = get();
    void saveGameState({ player, combat, currentZone, tickCount, ghosts });
  },

  loadGame: () => {
    void loadGameState().then((saved) => {
      if (!saved) return;
      set((state) => ({
        ...state,
        ...saved,
      }));
    });
  },

  // ── Spec-required actions ─────────────────────────────────────────────────

  gainXP: (amount: number) => {
    set((state) => {
      let { xp, level, xpToNextLevel } = state.player;
      xp += amount;
      while (xp >= xpToNextLevel && level < 60) {
        xp -= xpToNextLevel;
        level++;
        xpToNextLevel = calcXpToNextLevel(level);
      }
      return { player: { ...state.player, xp, level, xpToNextLevel } };
    });
  },

  levelUp: () => {
    set((state) => {
      const newLevel = Math.min(60, state.player.level + 1);
      const newXpToNext = calcXpToNextLevel(newLevel);
      return { player: { ...state.player, level: newLevel, xp: 0, xpToNextLevel: newXpToNext } };
    });
  },

  takeDamage: (amount: number) => {
    set((state) => {
      const newHp = Math.max(0, state.player.stats.hp - amount);
      return { player: { ...state.player, stats: { ...state.player.stats, hp: newHp } } };
    });
  },

  heal: (amount: number) => {
    set((state) => {
      const newHp = Math.min(state.player.stats.maxHp, state.player.stats.hp + amount);
      return { player: { ...state.player, stats: { ...state.player.stats, hp: newHp } } };
    });
  },

  moveToZone: (zoneId: string) => {
    get().changeZone(zoneId);
  },

  setCurrentTarget: (monsterId: string | null) => {
    set((state) => ({
      combat: { ...state.combat, currentTarget: monsterId },
    }));
  },

  incrementTick: () => {
    set((state) => ({ tickCount: state.tickCount + 1 }));
  },

  clearCombatLog: () => set({ combatLog: [] }),
}));
