import type { GameState, CombatLogEntry, Monster, Zone, Item, GhostPlayer, CharacterClass } from '../types';
import {
  calcActualMeleeHit,
  calcHitChance,
  calcNpcMaxHit,
  calcMitigatedDamage,
  calcXpToNextLevel,
  getClassXpModifier,
  calcWeaponSwingInterval,
  getWeaponDamage,
  getWeaponDelay,
  calcDodgeChance,
  calcDoubleAttackChance,
  getAggroWeight,
} from './combat';
import { calcBaseXp, applyClassModifier } from './xp';
import { calcDeathXpLoss, calcBindPointHp, calcBindPointMana, isCasterClass } from './death';
import { MONSTERS } from '../data/monsters';
import { ITEMS } from '../data/items';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function makeLogEntry(
  message: string,
  type: CombatLogEntry['type']
): CombatLogEntry {
  return {
    id: generateId(),
    timestamp: Date.now(),
    message,
    type,
  };
}

/**
 * pickZoneMonster — prefer monsters within ±5 levels of the player, fall back
 * to all zone monsters if no level-appropriate candidates exist.
 */
function pickZoneMonster(zone: Zone, playerLevel: number): Monster | null {
  const all = zone.monsters
    .map((id) => MONSTERS[id])
    .filter((m): m is Monster => !!m);

  if (all.length === 0) return null;

  const candidates = all.filter(
    (m) =>
      m.levelRange.max >= playerLevel - 5 &&
      m.levelRange.min <= playerLevel + 5
  );
  const pool = candidates.length > 0 ? candidates : all;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Clamp a skill value so it never exceeds level × 5 (hard cap 200). */
function capSkill(value: number, playerLevel: number): number {
  return Math.min(200, Math.min(playerLevel * 5, value));
}

// Damage threshold above which a weapon is treated as two-handed for skill gain purposes
const WEAPON_2H_DAMAGE_THRESHOLD = 10;

// Per-ghost last swing tick for group combat (module-scope map)
const groupGhostLastSwing = new Map<string, number>();

export function processTick(state: GameState): Partial<GameState> {
  const newLog: CombatLogEntry[] = [];
  let { player, combat, tickCount, currentZone } = state;

  tickCount = tickCount + 1;

  // ── Regen when not in combat ─────────────────────────────────────────────
  if (!combat.autoAttacking) {
    const hpRegen = Math.max(1, Math.floor(player.stats.maxHp * 0.02));
    const manaRegen = Math.max(1, Math.floor(player.stats.maxMana * 0.02));
    player = {
      ...player,
      stats: {
        ...player.stats,
        hp: Math.min(player.stats.maxHp, player.stats.hp + hpRegen),
        mana: Math.min(player.stats.maxMana, player.stats.mana + manaRegen),
      },
    };
    return { player, combat, tickCount, combatLog: [...state.combatLog, ...newLog] };
  }

  // ── Auto-combat active ───────────────────────────────────────────────────
  let { currentMonster, monsterCurrentHp } = combat;
  let currentMonsterLevel = combat.currentMonsterLevel;

  // ── Resolve active group members in player's zone ─────────────────────────
  let updatedGhosts: GhostPlayer[] = [...state.ghosts];
  const activeGroupMembers: GhostPlayer[] = state.group.members
    .map((id) => state.ghosts.find((g) => g.id === id))
    .filter((g): g is GhostPlayer =>
      g !== undefined &&
      g.isOnline &&
      g.currentZone === player.currentZone &&
      g.recoveryTicksRemaining === 0
    );

  // Spawn a monster if none active
  if (!currentMonster) {
    const monster = pickZoneMonster(currentZone, player.level);
    if (!monster) {
      newLog.push(makeLogEntry('No monsters found in this zone.', 'system'));
      return { tickCount, combatLog: [...state.combatLog, ...newLog].slice(-200) };
    }

    // Pick a specific level for this monster within its range, then scale HP.
    // scaledHp: monsters at the top of their level range have ~40% more HP than at the bottom.
    const monsterLevel =
      monster.levelRange.min +
      Math.floor(
        Math.random() * (monster.levelRange.max - monster.levelRange.min + 1)
      );
    const scaledHp = Math.floor(
      monster.hp *
        (0.8 +
          ((monsterLevel - monster.levelRange.min) /
            Math.max(1, monster.levelRange.max - monster.levelRange.min)) *
            0.4)
    );

    currentMonster = monster;
    monsterCurrentHp = scaledHp;
    currentMonsterLevel = monsterLevel;
    combat = { ...combat, currentMonsterLevel: monsterLevel };

    newLog.push(
      makeLogEntry(`A ${monster.name} (Lv${monsterLevel}) appears!`, 'system')
    );
  }

  // ── Determine weapon swing interval ─────────────────────────────────────
  const weaponDelay = player.gear['Primary']?.stats?.delay ?? 25;
  const swingInterval = calcWeaponSwingInterval(weaponDelay);
  const canSwing = tickCount - combat.lastSwingTick >= swingInterval;

  const weaponDamage = player.gear['Primary']?.stats?.damage ?? 3;
  const offenseSkill = player.skills['1HSlash'] ?? player.level * 2;
  // Use the stored monster level for a consistent fight (set at spawn time)
  const npcLevel = currentMonsterLevel;
  const defenseSkill = npcLevel * 2;
  const hitChance = calcHitChance(offenseSkill, defenseSkill);

  // ── Player attacks monster (gated by swing timer) ────────────────────────
  if (canSwing) {
    combat = { ...combat, lastSwingTick: tickCount };

    if (Math.random() < hitChance) {
      const dmg = calcActualMeleeHit(weaponDamage, player.level, player.stats.str);
      monsterCurrentHp = monsterCurrentHp - dmg;
      newLog.push(
        makeLogEntry(`You hit ${currentMonster.name} for ${dmg} damage.`, 'hit')
      );
      // Double attack
      if (Math.random() < calcDoubleAttackChance(player.stats.dex, player.class as CharacterClass)) {
        const dmg2 = calcActualMeleeHit(weaponDamage, player.level, player.stats.str);
        monsterCurrentHp = monsterCurrentHp - dmg2;
        newLog.push(makeLogEntry(`You double attack ${currentMonster.name} for ${dmg2} damage.`, 'hit'));
      }
    } else {
      newLog.push(
        makeLogEntry(`You try to hit ${currentMonster.name}, but miss!`, 'miss')
      );
    }
  }

  // ── Grouped ghosts attack the same monster ────────────────────────────────
  if (monsterCurrentHp > 0) {
    for (const g of activeGroupMembers) {
      const gWeaponDmg = getWeaponDamage(g.gear);
      const gWeaponDelay = getWeaponDelay(g.gear);
      const gSwingInterval = calcWeaponSwingInterval(gWeaponDelay);
      const gLastSwing = groupGhostLastSwing.get(g.id) ?? 0;
      const gCanSwing = tickCount - gLastSwing >= gSwingInterval;

      if (gCanSwing) {
        groupGhostLastSwing.set(g.id, tickCount);
        const gOffense = g.skills['1HSlash'] ?? g.level * 2;
        const gHitChance = calcHitChance(gOffense, defenseSkill);

        if (Math.random() < gHitChance) {
          const gDmg = calcActualMeleeHit(gWeaponDmg, g.level, g.stats.str);
          monsterCurrentHp -= gDmg;
          newLog.push(makeLogEntry(`${g.name} hits ${currentMonster.name} for ${gDmg} damage.`, 'hit'));
          // Double attack proc
          if (Math.random() < calcDoubleAttackChance(g.stats.dex, g.class)) {
            const gDmg2 = calcActualMeleeHit(gWeaponDmg, g.level, g.stats.str);
            monsterCurrentHp -= gDmg2;
            newLog.push(makeLogEntry(`${g.name} double attacks ${currentMonster.name} for ${gDmg2} damage.`, 'hit'));
          }
        } else {
          newLog.push(makeLogEntry(`${g.name} misses ${currentMonster.name}.`, 'miss'));
        }
      }
    }
  }

  // ── Healer ghosts in group heal lowest-HP member each tick (30% proc) ─────
  if (monsterCurrentHp > 0) {
    const healerClasses: CharacterClass[] = ['Cleric', 'Druid', 'Shaman'];
    for (const healer of activeGroupMembers) {
      if (!healerClasses.includes(healer.class)) continue;
      if (Math.random() >= 0.30) continue;

      const healAmt = Math.floor(healer.stats.maxMana * 0.05);

      // Find lowest-HP member among player + grouped ghosts
      const candidates: Array<{ name: string; hp: number; maxHp: number; isPlayer: boolean; ghostId?: string }> = [
        { name: player.name, hp: player.stats.hp, maxHp: player.stats.maxHp, isPlayer: true },
        ...activeGroupMembers
          .filter((gm) => gm.id !== healer.id)
          .map((gm) => ({ name: gm.name, hp: gm.stats.hp, maxHp: gm.stats.maxHp, isPlayer: false, ghostId: gm.id })),
      ];

      const target = candidates.reduce((a, b) =>
        a.hp / a.maxHp < b.hp / b.maxHp ? a : b
      );

      if (target.isPlayer) {
        player = {
          ...player,
          stats: { ...player.stats, hp: Math.min(player.stats.maxHp, player.stats.hp + healAmt) },
        };
      } else if (target.ghostId) {
        updatedGhosts = updatedGhosts.map((gh) => {
          if (gh.id !== target.ghostId) return gh;
          return { ...gh, stats: { ...gh.stats, hp: Math.min(gh.stats.maxHp, gh.stats.hp + healAmt) } };
        });
      }
      newLog.push(makeLogEntry(`${healer.name} heals ${target.name} for ${healAmt}.`, 'hit'));
    }
  }

  // ── Monster killed? ──────────────────────────────────────────────────────
  if (monsterCurrentHp <= 0) {
    const zem = currentZone.zem;
    const groupSize = 1 + activeGroupMembers.length;
    const baseXp = calcBaseXp(npcLevel, zem, groupSize);
    const classModifier = getClassXpModifier(player.class);
    const xpGained = Math.floor(baseXp * classModifier);

    newLog.push(makeLogEntry(`You have slain ${currentMonster.name}!`, 'death'));
    newLog.push(makeLogEntry(`You gain ${xpGained} experience points.`, 'xp'));

    // ── Grouped ghost XP shares ──────────────────────────────────────────
    updatedGhosts = updatedGhosts.map((g) => {
      if (!activeGroupMembers.some((am) => am.id === g.id)) return g;
      const ghostXp = applyClassModifier(baseXp, g.class);
      let newXp = g.xp + ghostXp;
      let newLevel = g.level;
      let newXpToNext = g.xpToNextLevel;
      while (newLevel < 60 && newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel++;
        newXpToNext = calcXpToNextLevel(newLevel);
        newLog.push(makeLogEntry(`${g.name} has reached level ${newLevel}!`, 'system'));
      }
      return { ...g, xp: newXp, level: newLevel, xpToNextLevel: newXpToNext };
    });

    // ── Skill gain on kill ───────────────────────────────────────────────
    const newSkills = { ...player.skills };
    // Offense always increments on kill
    newSkills['Offense'] = capSkill((newSkills['Offense'] ?? 0) + 1, player.level);
    // Weapon-type skill gain based on equipped weapon
    if (!player.gear['Primary']) {
      newSkills['HandToHand'] = capSkill((newSkills['HandToHand'] ?? 0) + 1, player.level);
    } else {
      // Treat high-damage weapons (>10 dmg) as 2H; others as 1H slash
      const primaryDmg = player.gear['Primary']?.stats?.damage ?? 0;
      if (primaryDmg > WEAPON_2H_DAMAGE_THRESHOLD) {
        newSkills['2HSlash'] = capSkill((newSkills['2HSlash'] ?? 0) + 1, player.level);
      } else {
        newSkills['1HSlash'] = capSkill((newSkills['1HSlash'] ?? 0) + 1, player.level);
      }
    }

    // ── Real loot system — items land in inventory ───────────────────────
    let inventory = [...player.inventory] as (Item | null)[];
    for (const lootEntry of currentMonster.lootTable) {
      if (Math.random() < lootEntry.dropChance) {
        const item = ITEMS[lootEntry.itemId];
        if (item) {
          const emptySlot = inventory.findIndex((slot) => slot === null);
          if (emptySlot !== -1) {
            inventory = [
              ...inventory.slice(0, emptySlot),
              item,
              ...inventory.slice(emptySlot + 1),
            ];
            newLog.push(
              makeLogEntry(
                `--${currentMonster.name}'s corpse-- You receive: ${item.name}.`,
                'loot'
              )
            );
          } else {
            newLog.push(
              makeLogEntry(
                `Your inventory is full! ${item.name} was left on the corpse.`,
                'system'
              )
            );
          }
        }
      }
    }

    // ── Coin drops ──────────────────────────────────────────────────────
    const cpGained = Math.floor(Math.random() * npcLevel * 3) + 1;
    const spGained = Math.floor(Math.random() * Math.max(1, Math.floor(npcLevel / 3)));
    const gpGained = Math.floor(Math.random() * Math.max(1, Math.floor(npcLevel / 10)));
    const coinParts: string[] = [];
    if (cpGained > 0) coinParts.push(`${cpGained}cp`);
    if (spGained > 0) coinParts.push(`${spGained}sp`);
    if (gpGained > 0) coinParts.push(`${gpGained}gp`);
    if (coinParts.length > 0) {
      newLog.push(makeLogEntry(`You receive ${coinParts.join(' ')}.`, 'loot'));
    }

    // ── Apply XP and handle level-up ────────────────────────────────────
    let newXp = player.xp + xpGained;
    let newLevel = player.level;
    let newXpToNext = player.xpToNextLevel;

    if (newXp >= newXpToNext && newLevel < 60) {
      newXp -= newXpToNext;
      newLevel++;
      newXpToNext = calcXpToNextLevel(newLevel);
      newLog.push(makeLogEntry(`You have reached level ${newLevel}!`, 'system'));
    }

    player = {
      ...player,
      xp: newXp,
      level: newLevel,
      xpToNextLevel: newXpToNext,
      skills: newSkills,
      inventory,
      currency: {
        pp: player.currency.pp,
        gp: player.currency.gp + gpGained,
        sp: player.currency.sp + spGained,
        cp: player.currency.cp + cpGained,
      },
    };

    combat = {
      ...combat,
      currentMonster: null,
      monsterCurrentHp: 0,
      currentMonsterLevel: 0,
    };
  } else {
    // ── Monster picks attack target from group (weighted by aggro) ────────
    // Candidates: player + active group members
    interface AggroCandidate {
      name: string;
      weight: number;
      isPlayer: boolean;
      ghostId?: string;
    }
    const aggroCandidates: AggroCandidate[] = [
      { name: player.name, weight: getAggroWeight(player.class as CharacterClass), isPlayer: true },
      ...activeGroupMembers.map((g) => ({
        name: g.name,
        weight: getAggroWeight(g.class),
        isPlayer: false,
        ghostId: g.id,
      })),
    ];

    const totalWeight = aggroCandidates.reduce((sum, c) => sum + c.weight, 0);
    let roll = Math.random() * totalWeight;
    let attackTarget = aggroCandidates[0];
    for (const candidate of aggroCandidates) {
      roll -= candidate.weight;
      if (roll <= 0) {
        attackTarget = candidate;
        break;
      }
    }

    const npcMaxHit = calcNpcMaxHit(npcLevel);
    const npcDmg = Math.max(1, Math.floor(Math.random() * npcMaxHit) + 1);

    if (attackTarget.isPlayer) {
      // ── Monster attacks player ─────────────────────────────────────────
      const mitigated = calcMitigatedDamage(npcDmg, player.stats.ac, npcLevel);
      const newHp = player.stats.hp - mitigated;

      newLog.push(
        makeLogEntry(
          `${currentMonster.name} hits YOU for ${mitigated} damage.`,
          'hit'
        )
      );

      // Defense skill increments when the monster successfully hits the player
      const newSkillsOnHit = { ...player.skills };
      newSkillsOnHit['Defense'] = capSkill((newSkillsOnHit['Defense'] ?? 0) + 1, player.level);

      if (newHp <= 0) {
        // ── Full death flow ────────────────────────────────────────────
        const xpLost = calcDeathXpLoss(player.xpToNextLevel);
        const newXp = Math.max(0, player.xp - xpLost);
        const bindHp = calcBindPointHp(player.stats.maxHp);
        const bindMana = calcBindPointMana(player.stats.maxMana, isCasterClass(player.class));

        newLog.push(makeLogEntry(`You have been slain by ${currentMonster.name}!`, 'death'));
        newLog.push(makeLogEntry(`You lose ${xpLost} experience points.`, 'system'));
        newLog.push(makeLogEntry('You have been transported to your bind point.', 'system'));
        newLog.push(makeLogEntry('Auto Combat has been disabled.', 'system'));

        player = {
          ...player,
          xp: newXp,
          deathCount: player.deathCount + 1,
          skills: newSkillsOnHit,
          stats: {
            ...player.stats,
            hp: bindHp,
            mana: bindMana,
          },
        };
        combat = {
          ...combat,
          autoAttacking: false,
          isActive: false,
          currentMonster: null,
          monsterCurrentHp: 0,
          currentMonsterLevel: 0,
        };
      } else {
        player = {
          ...player,
          skills: newSkillsOnHit,
          stats: { ...player.stats, hp: newHp },
        };
        combat = {
          ...combat,
          currentMonster,
          monsterCurrentHp,
          currentMonsterLevel,
          lastTickTime: Date.now(),
        };
      }
    } else if (attackTarget.ghostId) {
      // ── Monster attacks a grouped ghost ────────────────────────────────
      const ghostIdx = updatedGhosts.findIndex((g) => g.id === attackTarget.ghostId);
      if (ghostIdx !== -1) {
        const tg = updatedGhosts[ghostIdx];

        // Dodge check
        if (Math.random() < calcDodgeChance(tg.stats.agi)) {
          newLog.push(makeLogEntry(`${tg.name} dodges!`, 'miss'));
        } else {
          const mitigated = calcMitigatedDamage(npcDmg, tg.stats.ac, npcLevel);
          const newHp = tg.stats.hp - mitigated;
          newLog.push(makeLogEntry(`${currentMonster.name} hits ${tg.name} for ${mitigated} damage.`, 'hit'));

          if (newHp <= 0) {
            // ── Ghost death in group context ─────────────────────────────
            const xpLost = calcDeathXpLoss(tg.xpToNextLevel);
            const newXp = Math.max(0, tg.xp - xpLost);
            const bindHp = calcBindPointHp(tg.stats.maxHp);
            const bindMana = calcBindPointMana(tg.stats.maxMana, isCasterClass(tg.class));
            newLog.push(makeLogEntry(`${tg.name} has been slain by ${currentMonster.name}!`, 'death'));
            if (xpLost > 0) {
              newLog.push(makeLogEntry(`${tg.name} loses ${xpLost} experience points.`, 'system'));
            }
            updatedGhosts = updatedGhosts.map((g) =>
              g.id !== tg.id ? g : {
                ...g,
                xp: newXp,
                deathCount: g.deathCount + 1,
                stats: { ...g.stats, hp: bindHp, mana: bindMana },
                currentActivity: 'Recovering',
                recoveryTicksRemaining: 30,
              }
            );
          } else {
            // Defend skill gain + update HP
            updatedGhosts = updatedGhosts.map((g) => {
              if (g.id !== tg.id) return g;
              const newSkills = { ...g.skills };
              newSkills['Defense'] = Math.min(200, Math.min(g.level * 5, (newSkills['Defense'] ?? 0) + 1));
              return { ...g, stats: { ...g.stats, hp: newHp }, skills: newSkills };
            });
          }
        }
      }

      combat = {
        ...combat,
        currentMonster,
        monsterCurrentHp,
        currentMonsterLevel,
        lastTickTime: Date.now(),
      };
    }
  }

  const updatedLog = [...state.combatLog, ...newLog].slice(-200);

  return {
    player,
    combat,
    tickCount,
    combatLog: updatedLog,
    ghosts: updatedGhosts,
  };
}
