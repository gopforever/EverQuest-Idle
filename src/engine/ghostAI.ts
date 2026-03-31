import type { GameState, GhostPlayer, CombatLogEntry, CharacterClass } from '../types';
import { ZONES } from '../data/zones';
import { MONSTERS } from '../data/monsters';
import {
  calcActualMeleeHit,
  calcHitChance,
  calcXpToNextLevel,
  calcNpcMaxHit,
  calcMitigatedDamage,
  calcWeaponSwingInterval,
  getWeaponDamage,
  getWeaponDelay,
  calcMaxHpForLevel,
  calcMaxManaForLevel,
  calcDodgeChance,
  calcDoubleAttackChance,
} from './combat';
import { calcBaseXp, applyClassModifier } from './xp';
import { calcDeathXpLoss, calcBindPointHp, calcBindPointMana, isCasterClass } from './death';

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
  lastSwingTick: number;
}

const ghostCombatMap = new Map<string, GhostCombatState>();

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

// ── Caster classes (same list as RightPanel.tsx) ─────────────────────────────

const CASTER_CLASSES: CharacterClass[] = [
  'Wizard', 'Magician', 'Enchanter', 'Necromancer',
  'Cleric', 'Druid', 'Shaman', 'Bard',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Cap a skill value: max(level × 5, 200). */
function capGhostSkill(value: number, level: number): number {
  return Math.min(200, Math.min(level * 5, value));
}

/** Apply one tick of out-of-combat HP/mana regen (2% of max, min 1). */
function applyOutOfCombatRegen(g: GhostPlayer): GhostPlayer {
  const regenHp = Math.max(1, Math.floor(g.stats.maxHp * 0.02));
  const regenMana = Math.max(1, Math.floor(g.stats.maxMana * 0.02));
  return {
    ...g,
    stats: {
      ...g.stats,
      hp: Math.min(g.stats.maxHp, g.stats.hp + regenHp),
      mana: Math.min(g.stats.maxMana, g.stats.mana + regenMana),
    },
  };
}

function spawnMonsterForGhost(ghost: GhostPlayer, tickCount: number): GhostCombatState | null {
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
    lastSwingTick: tickCount,
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

    // ── Recovery countdown ────────────────────────────────────────────────
    if (g.recoveryTicksRemaining > 0) {
      const remaining = g.recoveryTicksRemaining - 1;
      // Regen HP/mana while recovering (not fighting)
      g = applyOutOfCombatRegen(g);
      g = {
        ...g,
        recoveryTicksRemaining: remaining,
        currentActivity: remaining === 0 ? 'Idle' : 'Recovering',
      };
      return g;
    }

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
    if (!zone || zone.monsters.length === 0) {
      // Not fighting — apply out-of-combat HP/mana regen
      g = applyOutOfCombatRegen(g);
      return g;
    }

    g = { ...g, currentActivity: 'Fighting' };

    // Ensure a monster is active
    let cs = ghostCombatMap.get(g.id);
    if (!cs) {
      const spawned = spawnMonsterForGhost(g, tickCount);
      if (!spawned) return g;
      cs = spawned;
      ghostCombatMap.set(g.id, cs);
    }

    // ── Ghost attacks its monster (weapon-delay gated) ────────────────────
    const weaponDamage = getWeaponDamage(g.gear);
    const weaponDelay = getWeaponDelay(g.gear);
    const swingInterval = calcWeaponSwingInterval(weaponDelay);
    const canSwing = tickCount - cs.lastSwingTick >= swingInterval;

    const offenseSkill = g.skills['Offense'] ?? g.level * 2;
    const defenseSkill = cs.monsterLevel * 2;
    const hitChance = calcHitChance(offenseSkill, defenseSkill);

    if (canSwing) {
      cs = { ...cs, lastSwingTick: tickCount };
      ghostCombatMap.set(g.id, cs);

      if (Math.random() < hitChance) {
        const dmg = calcActualMeleeHit(weaponDamage, g.level, g.stats.str);
        cs = { ...cs, monsterHp: cs.monsterHp - dmg };
        ghostCombatMap.set(g.id, cs);

        // Double attack proc
        if (Math.random() < calcDoubleAttackChance(g.stats.dex, g.class)) {
          const dmg2 = calcActualMeleeHit(weaponDamage, g.level, g.stats.str);
          cs = { ...cs, monsterHp: cs.monsterHp - dmg2 };
          ghostCombatMap.set(g.id, cs);
        }
      }

      // ── Caster spell attack ───────────────────────────────────────────
      if (CASTER_CLASSES.includes(g.class) && g.stats.mana > 0) {
        const spellDmg = g.level * 2;
        const manaCost = Math.min(g.stats.mana, g.level * 3);
        cs = { ...cs, monsterHp: cs.monsterHp - spellDmg };
        ghostCombatMap.set(g.id, cs);
        g = { ...g, stats: { ...g.stats, mana: Math.max(0, g.stats.mana - manaCost) } };
      }
    }

    // ── Monster attacks ghost back ────────────────────────────────────────
    const npcMaxHit = calcNpcMaxHit(cs.monsterLevel);
    const rawNpcDmg = Math.max(1, Math.floor(Math.random() * npcMaxHit) + 1);

    // Dodge check
    if (Math.random() < calcDodgeChance(g.stats.agi)) {
      const dodgeSkills = { ...g.skills };
      dodgeSkills['Dodge'] = capGhostSkill((dodgeSkills['Dodge'] ?? 0) + 1, g.level);
      g = { ...g, skills: dodgeSkills };
      newEntries.push(makeLogEntry(`${g.name} dodges!`, 'miss'));
    } else {
      const mitigated = calcMitigatedDamage(rawNpcDmg, g.stats.ac, cs.monsterLevel);
      const newHp = g.stats.hp - mitigated;
      g = { ...g, stats: { ...g.stats, hp: newHp } };

      // Defense skill gain when taking damage
      const newSkills = { ...g.skills };
      newSkills['Defense'] = capGhostSkill((newSkills['Defense'] ?? 0) + 1, g.level);
      g = { ...g, skills: newSkills };

      // Ghost death
      if (g.stats.hp <= 0) {
        newEntries.push(
          makeLogEntry(`${g.name} has been slain by ${cs.monsterName}!`, 'death'),
        );
        const xpLost = calcDeathXpLoss(g.xpToNextLevel);
        const newXp = Math.max(0, g.xp - xpLost);
        if (xpLost > 0) {
          newEntries.push(
            makeLogEntry(`${g.name} loses ${xpLost} experience points.`, 'system'),
          );
        }
        const bindHp = calcBindPointHp(g.stats.maxHp);
        const bindMana = calcBindPointMana(g.stats.maxMana, isCasterClass(g.class));
        g = {
          ...g,
          xp: newXp,
          deathCount: g.deathCount + 1,
          stats: { ...g.stats, hp: bindHp, mana: bindMana },
          currentActivity: 'Recovering',
          recoveryTicksRemaining: 30,
        };
        ghostCombatMap.delete(g.id);
        return g;
      }
    }

    // ── Monster killed? ───────────────────────────────────────────────────
    if (cs.monsterHp <= 0) {
      ghostCombatMap.delete(g.id);

      // Determine group size for XP
      const ghostInPlayerZone =
        g.currentZone === state.player.currentZone && state.combat.autoAttacking;
      const groupedGhostsInZone = ghostInPlayerZone
        ? state.group.members.filter((mid) => {
            const m = state.ghosts.find((gh) => gh.id === mid);
            return m && m.currentZone === state.player.currentZone && m.recoveryTicksRemaining === 0;
          }).length
        : 0;
      const groupSize = ghostInPlayerZone ? 1 + groupedGhostsInZone : 1;

      // XP gain
      const baseXp = calcBaseXp(cs.monsterLevel, zone.zem, groupSize);
      const xpGained = applyClassModifier(baseXp, g.class);

      let newXp = g.xp + xpGained;
      let newLevel = g.level;
      let newXpToNext = g.xpToNextLevel;

      // Level-up loop (cap at 60)
      while (newLevel < 60) {
        const xpNeeded = calcXpToNextLevel(newLevel);
        if (newXp < xpNeeded) break;
        newXp -= xpNeeded;
        newLevel++;
        newXpToNext = calcXpToNextLevel(newLevel);

        // Recalculate HP/Mana using shared formulas
        const newMaxHp = calcMaxHpForLevel(newLevel, g.stats.sta, g.class);
        const newMaxMana = calcMaxManaForLevel(newLevel, g.stats.wis, g.stats.int, g.class);
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

      // Skill gain on kill
      const killSkills = { ...g.skills };
      killSkills['Offense'] = capGhostSkill((killSkills['Offense'] ?? 0) + 1, newLevel);
      killSkills['1H Slashing'] = capGhostSkill((killSkills['1H Slashing'] ?? 0) + 1, newLevel);
      g = { ...g, skills: killSkills };

      // Potential loot (50% chance)
      if (Math.random() < 0.5) {
        const lootName =
          GHOST_LOOT_NAMES[Math.floor(Math.random() * GHOST_LOOT_NAMES.length)];
        newEntries.push(
          makeLogEntry(`${g.name} loots ${lootName}.`, 'loot'),
        );
      }

      g = { ...g, xp: newXp, level: newLevel, xpToNextLevel: newXpToNext };

      // Spawn the next monster immediately
      const next = spawnMonsterForGhost(g, tickCount);
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
