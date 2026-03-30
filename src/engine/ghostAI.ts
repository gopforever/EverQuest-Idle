import type { GameState, GhostPlayer, CombatLogEntry } from '../types';
import { ZONES } from '../data/zones';
import { MONSTERS } from '../data/monsters';
import { calcActualMeleeHit, calcHitChance, calcXpToNextLevel } from './combat';
import { calcBaseXp, applyClassModifier } from './xp';

let _idCounter = 0;
function generateId(): string {
  return `${Date.now()}-${(++_idCounter).toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function makeLogEntry(message: string, type: CombatLogEntry['type']): CombatLogEntry {
  return { id: generateId(), timestamp: Date.now(), message, type };
}

// ── Ghost combat state tracking ───────────────────────────────────────────────

interface GhostCombatState {
  monsterId: string;
  monsterHp: number;
  monsterMaxHp: number;
  monsterLevel: number;
  monsterName: string;
}

const ghostCombatMap = new Map<string, GhostCombatState>();

// ── Constants ─────────────────────────────────────────────────────────────────

/** Multiplier used to derive weapon damage from ghost level. */
const GHOST_WEAPON_DAMAGE_MULTIPLIER = 0.8;

/** Multiplier used to derive offense/defense skill values from level. */
const SKILL_LEVEL_MULTIPLIER = 2;

// ── Static data ───────────────────────────────────────────────────────────────

const GHOST_LOOT_NAMES = [
  'Wolf Pelt',
  'Bat Wing',
  'Bone Chips',
  'Silk',
  'Fine Steel Sword',
  'Gnoll Fang',
  'Snake Scale',
  'Bear Pelt',
  'Rusty Dagger',
  'Rat Whisker',
  'Spider Silk',
  'Bronze Coin',
  'Tattered Robe',
  'Crude Stein',
  'Cracked Skull',
];

const GHOST_CHAT: Record<string, string[]> = {
  Grinder: [
    'LFG EB. PST.',
    'Anyone need a puller?',
    'Camping [zone] guards for faction.',
    'Almost 30, grind never stops.',
    'ZEM here is amazing.',
  ],
  Social: [
    'Hey all! Great night to hunt :)',
    'Anyone want to group?',
    'Happy to heal if you need!',
    'Grats on the level!',
    'This zone is so crowded lol',
  ],
  Merchant: [
    'WTS Fine Steel Sword 5pp PST',
    'WTB Bone Chips PST',
    'Selling at EC tunnel, check me out',
    'WTS rare drop, PST offer',
    'Prices going up on silk again',
  ],
  Tradeskiller: [
    'Need Spiderling Silk for tailoring, WTB',
    'Anyone have brewing supplies?',
    'Just hit 150 tailoring!',
    'Tinkering is so expensive...',
    'WTB bat wings x20 PST',
  ],
  Casual: [
    'Just logging in for a bit',
    'Anyone doing LDoN tonight?',
    'afk for a min',
    'This is so relaxing',
    'Slow night, just questing',
  ],
  AFKFarmer: [
    'afk',
    'back',
    'sry was afk',
    'still here just farming',
    '.....',
  ],
  Tank: [
    'Need healer for WC camp',
    'Aggroing, stand back',
    'I can tank that',
    'Pulling to camp, everyone ready?',
    'MT here',
  ],
  Healer: [
    'Healing up, one sec',
    'OOM, need to med',
    'Can rez if needed',
    'Watch your health!',
    'Full mana, ready to go',
  ],
  Loner: [
    'Solo is fine',
    "Don't need a group",
    'Just me and my pet',
    'Prefer to play alone tbh',
    'Quiet night',
  ],
};

// Zone travel chance per tick-60 window, keyed by personality
const ZONE_TRAVEL_CHANCE: Record<string, number> = {
  Grinder: 0.10,
  Tank: 0.10,
  Casual: 0.25,
  Social: 0.25,
  AFKFarmer: 0.25,
  Merchant: 0.40,
  Tradeskiller: 0.15,
  Healer: 0.10,
  Loner: 0.10,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function spawnMonsterForGhost(ghost: GhostPlayer): GhostCombatState | null {
  const zone = ZONES[ghost.currentZone];
  if (!zone || zone.monsters.length === 0) return null;

  const monsterId = zone.monsters[Math.floor(Math.random() * zone.monsters.length)];
  const monster = MONSTERS[monsterId];
  if (!monster) return null;

  const levelRange = monster.levelRange.max - monster.levelRange.min;
  const monsterLevel =
    monster.levelRange.min +
    (levelRange > 0 ? Math.floor(Math.random() * (levelRange + 1)) : 0);
  const scaleFactor =
    0.8 + (levelRange > 0 ? (monsterLevel - monster.levelRange.min) / levelRange : 0) * 0.4;
  const monsterMaxHp = Math.max(1, Math.floor(monster.hp * scaleFactor));

  return {
    monsterId,
    monsterHp: monsterMaxHp,
    monsterMaxHp,
    monsterLevel,
    monsterName: monster.name,
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * processGhostTick — called every game tick alongside processTick.
 * Returns a Partial<GameState> patch containing updated ghosts and any new
 * combat log entries appended to the log provided in `state`.
 */
export function processGhostTick(
  state: GameState,
  tickCount: number,
): Partial<GameState> {
  const newEntries: CombatLogEntry[] = [];

  const updatedGhosts = state.ghosts.map((ghost) => {
    let g = { ...ghost };

    // ── Online/Offline cycling (every 120 ticks) ──────────────────────────
    if (tickCount % 120 === 0) {
      if (g.isOnline && Math.random() < 0.05) {
        g = { ...g, isOnline: false, currentActivity: 'Offline' };
        ghostCombatMap.delete(g.id);
        newEntries.push(makeLogEntry(`${g.name} has logged out.`, 'system'));
        return g;
      } else if (!g.isOnline && Math.random() < 0.05) {
        g = { ...g, isOnline: true, currentActivity: 'Idle' };
        newEntries.push(makeLogEntry(`${g.name} has entered the world.`, 'system'));
      }
    }

    if (!g.isOnline) return g;

    // ── Ghost chat (0.3% chance per tick) ────────────────────────────────
    if (Math.random() < 0.003) {
      const pool = GHOST_CHAT[g.personality] ?? GHOST_CHAT['Casual'];
      const msg = pool[Math.floor(Math.random() * pool.length)];
      newEntries.push(makeLogEntry(`${g.name} says, '${msg}'`, 'system'));
    }

    // ── Zone travel (every 60 ticks) ─────────────────────────────────────
    if (tickCount % 60 === 0) {
      const travelChance = ZONE_TRAVEL_CHANCE[g.personality] ?? 0.10;
      if (Math.random() < travelChance) {
        const currentZoneData = ZONES[g.currentZone];
        if (currentZoneData && currentZoneData.connectsTo.length > 0) {
          // Only consider adjacent zones within ±5 levels of the ghost
          const valid = currentZoneData.connectsTo.filter((zid) => {
            const z = ZONES[zid];
            return z !== undefined &&
              z.levelRange.min <= g.level + 5 &&
              z.levelRange.max >= g.level - 5;
          });
          if (valid.length > 0) {
            const newZoneId = valid[Math.floor(Math.random() * valid.length)];
            const newZone = ZONES[newZoneId];
            if (newZone) {
              g = { ...g, currentZone: newZoneId };
              ghostCombatMap.delete(g.id);
              newEntries.push(
                makeLogEntry(`${g.name} has entered ${newZone.name}.`, 'system'),
              );
            }
          }
        }
      }
    }

    // ── Ghost combat ──────────────────────────────────────────────────────
    const zone = ZONES[g.currentZone];
    if (!zone || zone.monsters.length === 0) return g;

    g = { ...g, currentActivity: 'Fighting' };

    // Ensure a monster is active
    let cs = ghostCombatMap.get(g.id);
    if (!cs) {
      const spawned = spawnMonsterForGhost(g);
      if (!spawned) return g;
      cs = spawned;
      ghostCombatMap.set(g.id, cs);
    }

    // Ghost attacks its monster
    const weaponDamage = Math.max(2, Math.floor(g.level * GHOST_WEAPON_DAMAGE_MULTIPLIER));
    const offenseSkill = g.level * SKILL_LEVEL_MULTIPLIER;
    const defenseSkill = cs.monsterLevel * SKILL_LEVEL_MULTIPLIER;
    const hitChance = calcHitChance(offenseSkill, defenseSkill);

    if (Math.random() < hitChance) {
      const dmg = calcActualMeleeHit(weaponDamage, g.level, g.stats.str);
      cs = { ...cs, monsterHp: cs.monsterHp - dmg };
      ghostCombatMap.set(g.id, cs);
    }

    // Monster killed?
    if (cs.monsterHp <= 0) {
      ghostCombatMap.delete(g.id);

      // XP gain
      const baseXp = calcBaseXp(cs.monsterLevel, zone.zem, 1);
      const xpGained = applyClassModifier(baseXp, g.class);

      let newXp = g.xp + xpGained;
      let newLevel = g.level;

      // Level-up loop (cap at 50)
      while (newLevel < 50) {
        const xpNeeded = calcXpToNextLevel(newLevel);
        if (newXp < xpNeeded) break;
        newXp -= xpNeeded;
        newLevel++;

        // Recalculate HP/Mana on level-up
        const newMaxHp = 20 + newLevel * 10 + Math.floor(g.stats.sta * 0.5);
        const newMaxMana =
          20 +
          newLevel * 10 +
          Math.floor(Math.max(g.stats.wis, g.stats.int) * 0.5);
        g = {
          ...g,
          stats: {
            ...g.stats,
            maxHp: newMaxHp,
            hp: newMaxHp,
            maxMana: newMaxMana,
            mana: newMaxMana,
          },
        };

        newEntries.push(
          makeLogEntry(`${g.name} has reached level ${newLevel}!`, 'system'),
        );
      }

      // Potential loot (50% chance)
      if (Math.random() < 0.5) {
        const lootName =
          GHOST_LOOT_NAMES[Math.floor(Math.random() * GHOST_LOOT_NAMES.length)];
        newEntries.push(
          makeLogEntry(`${g.name} loots ${lootName}.`, 'loot'),
        );
      }

      g = { ...g, xp: newXp, level: newLevel };

      // Spawn the next monster immediately
      const next = spawnMonsterForGhost(g);
      if (next) ghostCombatMap.set(g.id, next);
    }

    return g;
  });

  const updatedLog = [...state.combatLog, ...newEntries].slice(-50);

  return {
    ghosts: updatedGhosts,
    combatLog: updatedLog,
  };
}
