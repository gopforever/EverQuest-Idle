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
import { defaultTracking } from '../types';
import { ZONES, STARTING_ZONE } from '../data/zones';
import { processTick } from '../engine/tick';
import { processGhostTick } from '../engine/ghostAI';
import { saveGameState, loadGameState } from '../engine/save';
import { syncGhostsToSupabase, loadGhostsFromSupabase, syncGhostMemory } from '../engine/ghostSync';
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
import { generateGhostName } from '../utils/ghostNames';
import { runLlmAgentQueue, applyLlmResultsToGhosts } from '../engine/llmAgent';
import { getStartingFactionStandings } from '../data/factions';
import { getSpellsForClass, autoMemorizeSpells } from '../data/spells';
import { startQuest, abandonQuest } from '../engine/questEngine';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** All valid race+class pairs, flattened for ghost generation. */
const ALL_RACE_CLASS_PAIRS: { race: Race; cls: CharacterClass }[] = (
  Object.entries(RACE_CLASS_COMBOS) as [Race, CharacterClass[]][]
).flatMap(([race, classes]) => classes.map((cls) => ({ race, cls })));

const GHOST_PERSONALITIES = [
  'Grinder', 'Tradeskiller', 'Merchant', 'Casual', 'Tank', 'Healer', 'Loner', 'Social', 'AFKFarmer',
  'NinjaLooter', 'KSer', 'CampStealer', 'Drama', 'Burnout', 'Returning', 'NewPlayer', 'Addict',
  'Conspiracy', 'Roleplayer', 'ForumWarrior', 'GuildOfficer', 'Economist', 'Speedrunner', 'Pacifist', 'Veteran',
] as const;

const RACE_HOME_ZONE: Partial<Record<Race, string[]>> = {
  Human:    ['qeynos', 'north_freeport'],
  Barbarian:['halas'],
  Erudite:  ['erudin', 'paineel'],
  WoodElf:  ['kelethin'],
  HighElf:  ['felwithe_north'],
  DarkElf:  ['neriak_commons'],
  HalfElf:  ['qeynos', 'north_freeport'],
  Dwarf:    ['kaladim_north'],
  Troll:    ['west_commonlands'],
  Ogre:     ['west_commonlands'],
  Halfling: ['rivervale'],
  Gnome:    ['akanon'],
};

function getGhostStartingZone(race: Race): string {
  const options = RACE_HOME_ZONE[race];
  if (!options || options.length === 0) return 'west_commonlands';
  const zoneId = options[Math.floor(Math.random() * options.length)];
  return ZONES[zoneId] ? zoneId : 'west_commonlands';
}

function makeGhost(index: number): GhostPlayer {
  const pair = ALL_RACE_CLASS_PAIRS[index % ALL_RACE_CLASS_PAIRS.length];
  const race = pair.race;
  const cls = pair.cls;
  const personality = GHOST_PERSONALITIES[index % GHOST_PERSONALITIES.length];
  const stats = buildGhostStats(race, cls);
  return {
    id: generateId(),
    name: generateGhostName(index),
    race,
    class: cls,
    level: 1,
    xp: 0,
    xpToNextLevel: calcXpToNextLevel(1),
    personality,
    isOnline: Math.random() > 0.4,
    currentZone: getGhostStartingZone(race),
    currentActivity: 'Idle',
    gear: buildStartingGear(race, cls),
    stats,
    plat: 0,
    achievements: [],
    deathCount: 0,
    skills: { '1H Slashing': 5, Defense: 5, Offense: 5 },
    recoveryTicksRemaining: 0,
    allies: [],
    rivals: [],
    reputation: { killPoints: 0, craftPoints: 0, raidPoints: 0, tradingPoints: 0 },
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
    tracking: defaultTracking(),
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
  // LLM agent actions
  runLlmAgentsAsync: () => void;
  // Spell actions
  memorizeSpell: (spellId: string, gemIndex: number) => void;
  forgetSpell: (gemIndex: number) => void;
  learnSpell: (spellId: string) => void;
  autoMemorize: () => void;
  // Quest actions
  beginQuest: (questId: string) => void;
  dropQuest: (questId: string) => void;
  // Examine window
  setExamineItem: (item: Item | null) => void;
  // Sit / camp
  toggleSit: () => void;
  campOut: () => void;
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
  llmErrorCount: 0,
  lastLlmError: undefined,
  serverEvents: [],
  factionStandings: {},
  spellBook: [],
  memorizedSpells: [null, null, null, null, null, null, null, null],
  activeQuests: [],
  completedQuests: [],
  examineItem: null,
  isSitting: false,

  startGame: () => set({ gameStarted: true }),

  createCharacter: (name: string, race: Race, cls: CharacterClass) => {
    const stats = buildPlayerStats(race, cls);
    const skills = buildStartingSkills(cls);
    const gear = buildStartingGear(race, cls);
    const startingZoneId = getStartingZone(race);
    const startingZone = ZONES[startingZoneId] ?? ZONES['qeynos_hills'];
    const factionStandings = getStartingFactionStandings(race, cls);
    const startingSpells = getSpellsForClass(cls, 1).map((s) => s.id);
    const memorizedSpells = autoMemorizeSpells(cls, 1, startingSpells);
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
        tracking: defaultTracking(),
      },
      currentZone: startingZone,
      combat: initialCombat,
      factionStandings,
      spellBook: startingSpells,
      memorizedSpells,
      activeQuests: [],
      completedQuests: [],
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
    const tracking = player.tracking ?? defaultTracking();
    const newZonesVisited = tracking.zonesVisited.includes(zoneId)
      ? tracking.zonesVisited
      : [...tracking.zonesVisited, zoneId];
    const newContinentsVisited = tracking.continentsVisited.includes(zone.continent)
      ? tracking.continentsVisited
      : [...tracking.continentsVisited, zone.continent];
    set({
      currentZone: zone,
      combat: { ...get().combat, autoAttacking: false, currentMonster: null, monsterCurrentHp: 0 },
      player: {
        ...player,
        currentZone: zoneId,
        tracking: { ...tracking, zonesVisited: newZonesVisited, continentsVisited: newContinentsVisited },
      },
    });
    get().addCombatLogEntry({
      message: `You enter ${zone.name}.`,
      type: 'system',
    });
    // Save on zone change — progress milestone
    get().saveGame();
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
      llmErrorCount: state.llmErrorCount,
      lastLlmError: state.lastLlmError,
      serverEvents: state.serverEvents ?? [],
      factionStandings: playerUpdates.factionStandings ?? state.factionStandings ?? {},
      spellBook: playerUpdates.spellBook ?? state.spellBook ?? [],
      memorizedSpells: state.memorizedSpells ?? [null, null, null, null, null, null, null, null],
      activeQuests: playerUpdates.activeQuests ?? state.activeQuests ?? [],
      completedQuests: playerUpdates.completedQuests ?? state.completedQuests ?? [],
      examineItem: null,
      isSitting: state.isSitting,
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

    // Auto-save every 30 ticks (~30 seconds)
    if (newTickCount % 30 === 0) {
      get().saveGame();
    }

    // Fire LLM agent queue every 50 ticks (non-blocking)
    if (newTickCount % 50 === 0) {
      get().runLlmAgentsAsync();
      // Sync all ghost state to Supabase (non-blocking)
      void syncGhostsToSupabase(get().ghosts);
    }
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
    set((state) => {
      const player = state.player;
      const inventory = [...player.inventory] as (Item | null)[];
      const gear = { ...player.gear };

      // Remove the item being equipped from inventory (find by id)
      const invIdx = inventory.findIndex((i) => i?.id === item.id);
      if (invIdx !== -1) inventory[invIdx] = null;

      // If a different item is already in this slot, move it back to inventory
      const displaced = gear[slot];
      if (displaced && displaced.id !== item.id) {
        // Put displaced item in the same inventory slot the new item came from,
        // otherwise find the next empty slot
        const targetSlot = invIdx !== -1 ? invIdx : inventory.findIndex((s) => s === null);
        if (targetSlot !== -1) inventory[targetSlot] = displaced;
      }

      gear[slot] = item;
      return { player: { ...player, inventory, gear } };
    });
  },

  unequipItem: (slot: EquipSlot) => {
    set((state) => {
      const player = state.player;
      const item = player.gear[slot];
      if (!item) return {};

      const inventory = [...player.inventory] as (Item | null)[];
      const emptyIdx = inventory.findIndex((s) => s === null);
      if (emptyIdx === -1) {
        // Inventory is full — silently refuse
        return {};
      }
      inventory[emptyIdx] = item;

      const gear = { ...player.gear };
      delete gear[slot];
      return { player: { ...player, inventory, gear } };
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
      serverEvents: [],
    });
  },

  saveGame: () => {
    const {
      player, combat, currentZone, tickCount, ghosts, characterCreated,
      factionStandings, spellBook, memorizedSpells, activeQuests, completedQuests,
    } = get();
    const saveCombat = { ...combat, autoAttacking: false, isActive: false };
    void saveGameState({
      player, combat: saveCombat, currentZone, tickCount, ghosts, characterCreated,
      factionStandings, spellBook, memorizedSpells, activeQuests, completedQuests,
    });
  },

  loadGame: () => {
    void loadGameState().then(async (saved) => {
      if (saved) {
        // Always load with combat inactive so player isn't mid-fight on reload
        const safeSaved = {
          ...saved,
          combat: {
            ...(saved.combat ?? initialCombat),
            autoAttacking: false,
            isActive: false,
            currentMonster: null,
            monsterCurrentHp: 0,
          },
        };
        set((state) => ({ ...state, ...safeSaved }));
      }
      // Hydrate ghosts from Supabase (authoritative remote store)
      const remoteGhosts = await loadGhostsFromSupabase();
      if (remoteGhosts && remoteGhosts.length > 0) {
        set({ ghosts: remoteGhosts });
      }
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
      player: {
        ...player,
        inventory: newInventory,
        currency: newCurrency,
        tracking: {
          ...(player.tracking ?? defaultTracking()),
          bazaarPurchases: (player.tracking?.bazaarPurchases ?? 0) + 1,
        } as typeof player.tracking,
      },
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
      player: {
        ...player,
        inventory: newInventory,
        tracking: {
          ...(player.tracking ?? defaultTracking()),
          bazaarSales: (player.tracking?.bazaarSales ?? 0) + 1,
        },
      },
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
        tracking: result.success
          ? {
              ...(player.tracking ?? defaultTracking()),
              tradeskillCombines: (player.tracking?.tradeskillCombines ?? 0) + 1,
            }
          : player.tracking,
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
    const tracking = player.tracking ?? defaultTracking();
    const isFirstMember = group.members.length === 0;
    set({
      ghosts: updatedGhosts,
      group: { ...group, members: [...group.members, ghostId] },
      combatLog: [...combatLog, newEntry].slice(-200),
      player: {
        ...player,
        tracking: {
          ...tracking,
          timesGroupedWithGhost: tracking.timesGroupedWithGhost + 1,
          groupsFormed: isFirstMember ? tracking.groupsFormed + 1 : tracking.groupsFormed,
        },
      },
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

  runLlmAgentsAsync: () => {
    const state = get();
    runLlmAgentQueue(state, state.tickCount).then(({ entries, results, errorCount, lastError }) => {
      if (entries.length === 0 && results.length === 0 && errorCount === 0) return;
      set((s) => ({
        combatLog: [...s.combatLog, ...entries].slice(-200),
        ghosts: applyLlmResultsToGhosts(s.ghosts, results),
        llmErrorCount: s.llmErrorCount + errorCount,
        ...(lastError !== undefined ? { lastLlmError: lastError } : {}),
      }));
      // Sync just the memory/mood fields for ghosts that ran LLM (lightweight)
      if (results.length > 0) {
        const resultGhostIds = new Set(results.map(r => r.ghostId));
        const updatedGhosts = get().ghosts.filter(g => resultGhostIds.has(g.id));
        for (const ghost of updatedGhosts) {
          void syncGhostMemory(ghost);
        }
      }
    }).catch((err: unknown) => {
      console.error('[LLM queue error]', err);
    });
  },

  // ── Spell actions ────────────────────────────────────────────────

  memorizeSpell: (spellId: string, gemIndex: number) => {
    const { memorizedSpells } = get();
    if (gemIndex < 0 || gemIndex > 7) return;
    const updated = [...memorizedSpells] as (string | null)[];
    updated[gemIndex] = spellId;
    set({ memorizedSpells: updated });
  },

  forgetSpell: (gemIndex: number) => {
    const { memorizedSpells } = get();
    const updated = [...memorizedSpells] as (string | null)[];
    updated[gemIndex] = null;
    set({ memorizedSpells: updated });
  },

  learnSpell: (spellId: string) => {
    const { spellBook } = get();
    if (spellBook.includes(spellId)) return;
    set({ spellBook: [...spellBook, spellId] });
  },

  autoMemorize: () => {
    const { player, spellBook } = get();
    const gems = autoMemorizeSpells(player.class, player.level, spellBook);
    set({ memorizedSpells: gems });
  },

  // ── Quest actions ────────────────────────────────────────────────

  beginQuest: (questId: string) => {
    const { activeQuests, tickCount } = get();
    set({ activeQuests: startQuest(questId, activeQuests, tickCount) });
  },

  dropQuest: (questId: string) => {
    const { activeQuests } = get();
    set({ activeQuests: abandonQuest(questId, activeQuests) });
  },

  setExamineItem: (item: Item | null) => {
    set({ examineItem: item });
  },

  toggleSit: () => {
    const { isSitting, combat } = get();
    if (!isSitting && combat.autoAttacking) {
      get().toggleAutoCombat();
    }
    const nowSitting = !isSitting;
    const sitMsg = nowSitting
      ? 'You sit down to rest.'
      : 'You stand up.';
    set((s) => ({
      isSitting: nowSitting,
      combatLog: [
        ...s.combatLog,
        { id: `sit-${Date.now()}`, timestamp: Date.now(), message: sitMsg, type: 'system' as const },
      ].slice(-200),
    }));
  },

  campOut: () => {
    const { combat } = get();
    if (combat.autoAttacking) get().toggleAutoCombat();
    set((s) => ({
      isSitting: false,
      combatLog: [
        ...s.combatLog,
        { id: `camp-${Date.now()}`, timestamp: Date.now(), message: 'Camping... Your progress has been saved.', type: 'system' as const },
      ].slice(-200),
    }));
    get().saveGame();
  },
}));
