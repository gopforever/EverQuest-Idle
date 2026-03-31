import { create } from 'zustand';
import type {
  GameState,
  PlayerCharacter,
  CombatState,
  CombatLogEntry,
  Item,
  EquipSlot,
  GhostPlayer,
  Race,
  CharacterClass,
  BazaarState,
  GroupState,
} from '../types';
import { ZONES, STARTING_ZONE } from '../data/zones';
import { processTick } from '../engine/tick';
import { processGhostTick } from '../engine/ghostAI';
import { saveGameState, loadGameState } from '../engine/save';
import { calcXpToNextLevel } from '../engine/combat';
import { RECIPES } from '../data/recipes';
import { attemptCombine } from '../engine/tradeskills';
import { subtractCurrency, refreshBazaarListings, formatCurrency } from '../engine/bazaar';
import { ITEMS } from '../data/items';
import { RACE_CLASS_COMBOS } from '../data/characterData';
import {
  buildPlayerStats,
  buildStartingSkills,
  buildStartingGear,
  buildStartingInventory,
  getStartingZone,
  buildGhostStats,
} from '../engine/characterCreation';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const GHOST_NAMES = [
  'Talindra', 'Brokk', 'Serenaya', 'Grimtooth', 'Yallara',
  'Thunderforge', 'Moonwhisper', 'Darkclaw', 'Silverveil', 'Ironpaw',
  'Ashveil', 'Stonehammer', 'Windrunner', 'Shadowblade', 'Dawnseeker',
  'Bloodmane', 'Frostweave', 'Emberfall', 'Stormcaller', 'Nightshade',
];

/** All valid race+class pairs, flattened for ghost generation. */
const ALL_RACE_CLASS_PAIRS: { race: Race; cls: CharacterClass }[] = (
  Object.entries(RACE_CLASS_COMBOS) as [Race, CharacterClass[]][]
).flatMap(([race, classes]) => classes.map((cls) => ({ race, cls })));

const GHOST_PERSONALITIES = ['Grinder', 'Tradeskiller', 'Merchant', 'Casual', 'Tank', 'Healer', 'Loner', 'Social', 'AFKFarmer'] as const;

function makeGhost(index: number): GhostPlayer {
  const pair = ALL_RACE_CLASS_PAIRS[index % ALL_RACE_CLASS_PAIRS.length];
  const race = pair.race;
  const cls = pair.cls;
  const personality = GHOST_PERSONALITIES[index % GHOST_PERSONALITIES.length];
  const stats = buildGhostStats(race, cls);
  return {
    id: generateId(),
    name: GHOST_NAMES[index % GHOST_NAMES.length] + (index >= GHOST_NAMES.length ? `_${Math.floor(index / GHOST_NAMES.length)}` : ''),
    race,
    class: cls,
    level: 1,
    xp: 0,
    xpToNextLevel: calcXpToNextLevel(1),
    currentHp: stats.maxHp,
    personality,
    isOnline: Math.random() > 0.4,
    currentZone: 'qeynos_hills',
    currentActivity: 'Idle',
    gear: buildStartingGear(race, cls),
    stats,
    plat: 0,
    achievements: [],
    deathCount: 0,
    skills: { '1HSlash': 5, Defense: 5, Offense: 5 },
    recoveryTicksRemaining: 0,
  };
}

function makeInitialPlayer(): PlayerCharacter {
  const stats = buildPlayerStats('Human', 'Warrior');
  return {
    name: 'Adventurer',
    race: 'Human',
    class: 'Warrior',
    level: 1,
    xp: 0,
    xpToNextLevel: calcXpToNextLevel(1),
    stats,
    gear: buildStartingGear('Human', 'Warrior'),
    inventory: buildStartingInventory(),
    currency: { pp: 0, gp: 0, sp: 0, cp: 0 },
    currentZone: 'qeynos_hills',
    skills: buildStartingSkills('Warrior'),
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
  createCharacter: (name: string, race: Race, cls: CharacterClass) => void;
  // Required actions per spec
  gainXP: (amount: number) => void;
  levelUp: () => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  moveToZone: (zoneId: string) => void;
  setCurrentTarget: (monsterId: string | null) => void;
  incrementTick: () => void;
  clearCombatLog: () => void;
  // Economy actions
  buyFromBazaar: (listingId: string, quantity: number) => void;
  listItemOnBazaar: (inventorySlot: number, pricePerUnit: number, quantity: number) => void;
  cancelBazaarListing: (listingId: string) => void;
  attemptTradeskillCombine: (recipeId: string) => void;
  // Group actions
  inviteGhost: (ghostId: string) => void;
  kickGhost: (ghostId: string) => void;
  disbandGroup: () => void;
}

const initialGhosts = Array.from({ length: 100 }, (_, i) => makeGhost(i));

const initialBazaar: BazaarState = {
  listings: [],
  lastRefreshTick: 0,
};

const initialGroup: GroupState = {
  members: [],
  lootStyle: 'leader',
};

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
  group: initialGroup,
  currentZone: STARTING_ZONE,
  tickCount: 0,
  gameStarted: false,
  characterCreated: false,
  bazaar: initialBazaar,

  startGame: () => set({ gameStarted: true }),

  createCharacter: (name: string, race: Race, cls: CharacterClass) => {
    const stats = buildPlayerStats(race, cls);
    const skills = buildStartingSkills(cls);
    const gear = buildStartingGear(race, cls);
    const startingZoneId = getStartingZone(race);
    const startingZone = ZONES[startingZoneId] ?? ZONES['qeynos_hills'];
    set({
      characterCreated: true,
      gameStarted: false,
      player: {
        name,
        race,
        class: cls,
        level: 1,
        xp: 0,
        xpToNextLevel: calcXpToNextLevel(1),
        stats,
        gear,
        inventory: buildStartingInventory(),
        currency: { pp: 0, gp: 0, sp: 0, cp: 0 },
        currentZone: startingZoneId,
        skills,
        deathCount: 0,
      },
      currentZone: startingZone,
      combat: initialCombat,
      combatLog: [{
        id: generateId(),
        timestamp: Date.now(),
        message: `Welcome to Norrath, ${name}! You enter the world as a ${race} ${cls}.`,
        type: 'system',
      }],
    });
  },

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
    const { player, combatLog } = get();

    // Enforce minLevel gate
    if (zone.minLevel && player.level < zone.minLevel) {
      const entry: CombatLogEntry = {
        id: `${Date.now()}-levelgate`,
        timestamp: Date.now(),
        message: `You must be at least level ${zone.minLevel} to enter ${zone.name}.`,
        type: 'system',
      };
      set({ combatLog: [...combatLog, entry].slice(-200) });
      return;
    }

    // Stop combat when changing zones
    set({
      currentZone: zone,
      combat: { ...get().combat, autoAttacking: false, currentMonster: null, monsterCurrentHp: 0 },
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
    const newTickCount = playerUpdates.tickCount ?? state.tickCount;
    const stateAfterPlayer: GameState = {
      player: playerUpdates.player ?? state.player,
      combat: playerUpdates.combat ?? state.combat,
      combatLog: playerUpdates.combatLog ?? state.combatLog,
      ghosts: playerUpdates.ghosts ?? state.ghosts,
      group: state.group,
      currentZone: playerUpdates.currentZone ?? state.currentZone,
      tickCount: newTickCount,
      gameStarted: state.gameStarted,
      characterCreated: state.characterCreated,
      bazaar: state.bazaar,
    };
    const ghostUpdates = processGhostTick(stateAfterPlayer, stateAfterPlayer.tickCount);

    // Economy tick: refresh bazaar every 10 game ticks
    let bazaarUpdate: Partial<GameState> = {};
    const lastRefresh = state.bazaar.lastRefreshTick;
    if (newTickCount - lastRefresh >= 10) {
      const freshListings = refreshBazaarListings(
        state.bazaar.listings,
        ghostUpdates.ghosts ?? state.ghosts,
        newTickCount
      );
      bazaarUpdate = {
        bazaar: { listings: freshListings, lastRefreshTick: newTickCount },
      };
    }

    set({ ...playerUpdates, ...ghostUpdates, ...bazaarUpdate } as Partial<GameStore>);
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
      group: initialGroup,
      currentZone: STARTING_ZONE,
      tickCount: 0,
      gameStarted: false,
      characterCreated: false,
      bazaar: initialBazaar,
    });
  },

  saveGame: () => {
    const { player, combat, currentZone, tickCount, ghosts, characterCreated } = get();
    void saveGameState({ player, combat, currentZone, tickCount, ghosts, characterCreated });
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

  // ── Economy actions ────────────────────────────────────────────────────────

  buyFromBazaar: (listingId: string, quantity: number) => {
    const { player, bazaar } = get();
    const listing = bazaar.listings.find((l) => l.id === listingId);
    if (!listing) return;

    // Add item to inventory
    const item = ITEMS[listing.itemId];
    if (!item) return;

    // Check inventory space upfront before charging currency
    const emptySlots = player.inventory.filter((s) => s === null).length;
    if (emptySlots < quantity) {
      get().addCombatLogEntry({ message: 'Your inventory is full!', type: 'system' });
      return;
    }

    const totalCost = listing.pricePerUnit * quantity;
    const newCurrency = subtractCurrency(player.currency, totalCost);
    if (!newCurrency) {
      get().addCombatLogEntry({
        message: `You cannot afford that purchase.`,
        type: 'system',
      });
      return;
    }

    let newInventory = [...player.inventory] as (Item | null)[];
    for (let i = 0; i < quantity; i++) {
      const slot = newInventory.findIndex((s) => s === null);
      if (slot !== -1) {
        newInventory[slot] = item;
      }
    }

    // Update or remove listing
    const newListings = bazaar.listings
      .map((l) => {
        if (l.id !== listingId) return l;
        const remaining = l.quantity - quantity;
        return remaining > 0 ? { ...l, quantity: remaining } : null;
      })
      .filter((l): l is NonNullable<typeof l> => l !== null);

    const costStr = formatCurrency(totalCost);
    get().addCombatLogEntry({
      message: `You purchase ${quantity}x ${listing.itemName} for ${costStr}.`,
      type: 'loot',
    });

    set({
      player: { ...player, inventory: newInventory, currency: newCurrency },
      bazaar: { ...bazaar, listings: newListings },
    });
  },

  listItemOnBazaar: (inventorySlot: number, pricePerUnit: number, quantity: number) => {
    const { player, bazaar } = get();
    const item = player.inventory[inventorySlot];
    if (!item) return;

    // Remove from inventory
    const newInventory = [...player.inventory] as (Item | null)[];
    newInventory[inventorySlot] = null;

    const listing = {
      id: generateId(),
      sellerId: 'player',
      sellerName: player.name,
      itemId: item.id,
      itemName: item.name,
      quantity,
      pricePerUnit,
      listedAt: get().tickCount,
      category: 'misc' as const,
    };

    set({
      player: { ...player, inventory: newInventory },
      bazaar: { ...bazaar, listings: [...bazaar.listings, listing] },
    });

    get().addCombatLogEntry({
      message: `You list ${item.name} on the Bazaar for ${pricePerUnit}cp each.`,
      type: 'system',
    });
  },

  cancelBazaarListing: (listingId: string) => {
    const { player, bazaar } = get();
    const listing = bazaar.listings.find((l) => l.id === listingId && l.sellerId === 'player');
    if (!listing) return;

    // Return item to inventory
    const item = ITEMS[listing.itemId];
    let newInventory = [...player.inventory] as (Item | null)[];
    if (item) {
      const slot = newInventory.findIndex((s) => s === null);
      if (slot !== -1) {
        newInventory[slot] = item;
      }
    }

    const newListings = bazaar.listings.filter((l) => l.id !== listingId);
    set({
      player: { ...player, inventory: newInventory },
      bazaar: { ...bazaar, listings: newListings },
    });

    get().addCombatLogEntry({
      message: `Bazaar listing for ${listing.itemName} cancelled.`,
      type: 'system',
    });
  },

  attemptTradeskillCombine: (recipeId: string) => {
    const { player } = get();
    const recipe = RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return;

    const result = attemptCombine(player, recipe);

    set({
      player: {
        ...player,
        inventory: result.updatedInventory,
        skills: result.updatedSkills,
      },
    });

    get().addCombatLogEntry({
      message: result.logMessage,
      type: result.success ? 'loot' : 'system',
    });
  },

  // ── Group actions ──────────────────────────────────────────────────────────

  inviteGhost: (ghostId: string) => {
    const { ghosts, group, player, combatLog } = get();
    if (group.members.length >= 5) {
      get().addCombatLogEntry({ message: 'Your group is full (max 5 members).', type: 'system' });
      return;
    }
    const ghost = ghosts.find((g) => g.id === ghostId);
    if (!ghost) return;
    if (!ghost.isOnline) {
      get().addCombatLogEntry({ message: `${ghost.name} is not online.`, type: 'system' });
      return;
    }
    if (group.members.includes(ghostId)) {
      get().addCombatLogEntry({ message: `${ghost.name} is already in your group.`, type: 'system' });
      return;
    }
    const updatedGhosts = ghosts.map((g) =>
      g.id !== ghostId ? g : { ...g, currentZone: player.currentZone }
    );
    const newEntry: CombatLogEntry = {
      id: generateId(),
      timestamp: Date.now(),
      message: `${ghost.name} joins your group.`,
      type: 'system',
    };
    set({
      ghosts: updatedGhosts,
      group: { ...group, members: [...group.members, ghostId] },
      combatLog: [...combatLog, newEntry].slice(-200),
    });
  },

  kickGhost: (ghostId: string) => {
    const { ghosts, group, combatLog } = get();
    const ghost = ghosts.find((g) => g.id === ghostId);
    if (!ghost) return;
    const newEntry: CombatLogEntry = {
      id: generateId(),
      timestamp: Date.now(),
      message: `${ghost.name} has left the group.`,
      type: 'system',
    };
    set({
      group: { ...group, members: group.members.filter((id) => id !== ghostId) },
      combatLog: [...combatLog, newEntry].slice(-200),
    });
  },

  disbandGroup: () => {
    const { group, combatLog } = get();
    const newEntry: CombatLogEntry = {
      id: generateId(),
      timestamp: Date.now(),
      message: 'The group has been disbanded.',
      type: 'system',
    };
    set({
      group: { ...group, members: [] },
      combatLog: [...combatLog, newEntry].slice(-200),
    });
  },
}));
