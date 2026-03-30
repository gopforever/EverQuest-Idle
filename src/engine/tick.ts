import type { GameState, CombatLogEntry, Monster } from '../types';
import {
  calcActualMeleeHit,
  calcHitChance,
  calcNpcMaxHit,
  calcMitigatedDamage,
  calcXpToNextLevel,
  getClassXpModifier,
} from './combat';
import { calcBaseXp } from './xp';
import { MONSTERS } from '../data/monsters';

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

function pickRandomMonster(zoneMonsterIds: string[]): Monster | null {
  if (zoneMonsterIds.length === 0) return null;
  const id = zoneMonsterIds[Math.floor(Math.random() * zoneMonsterIds.length)];
  return MONSTERS[id] ?? null;
}

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

  // Spawn a monster if none active
  if (!currentMonster) {
    const monster = pickRandomMonster(currentZone.monsters);
    if (!monster) {
      newLog.push(makeLogEntry('No monsters found in this zone.', 'system'));
      return { tickCount, combatLog: [...state.combatLog, ...newLog].slice(-50) };
    }
    const spawnHp =
      monster.levelRange.min +
      Math.floor(
        Math.random() * (monster.levelRange.max - monster.levelRange.min + 1)
      );
    const scaledHp = Math.floor(
      monster.hp *
        (0.8 + (spawnHp - monster.levelRange.min) / Math.max(1, monster.levelRange.max - monster.levelRange.min) * 0.4)
    );
    currentMonster = monster;
    monsterCurrentHp = scaledHp;
    newLog.push(
      makeLogEntry(`A ${monster.name} appears!`, 'system')
    );
  }

  // Player attacks monster
  const weaponDamage =
    (player.gear['Primary']?.stats?.damage ?? 3);
  const offenseSkill = player.skills['1HSlash'] ?? player.level * 2;
  const npcLevel = Math.floor(
    (currentMonster.levelRange.min + currentMonster.levelRange.max) / 2
  );
  const defenseSkill = npcLevel * 2;
  const hitChance = calcHitChance(offenseSkill, defenseSkill);

  if (Math.random() < hitChance) {
    const dmg = calcActualMeleeHit(weaponDamage, player.level, player.stats.str);
    monsterCurrentHp = monsterCurrentHp - dmg;
    newLog.push(
      makeLogEntry(
        `You hit ${currentMonster.name} for ${dmg} damage.`,
        'hit'
      )
    );
  } else {
    newLog.push(
      makeLogEntry(`You try to hit ${currentMonster.name}, but miss!`, 'miss')
    );
  }

  // Monster killed?
  if (monsterCurrentHp <= 0) {
    const zem = currentZone.zem;
    const baseXp = calcBaseXp(npcLevel, zem, 1);
    const classModifier = getClassXpModifier(player.class);
    const xpGained = Math.floor(baseXp * classModifier);

    newLog.push(
      makeLogEntry(`You have slain ${currentMonster.name}!`, 'death')
    );
    newLog.push(
      makeLogEntry(`You gain ${xpGained} experience points.`, 'xp')
    );

    // Roll loot
    for (const lootEntry of currentMonster.lootTable) {
      if (Math.random() < lootEntry.dropChance) {
        newLog.push(
          makeLogEntry(
            `--${currentMonster.name}'s corpse-- You receive: ${lootEntry.itemId}`,
            'loot'
          )
        );
      }
    }

    // Apply XP
    let newXp = player.xp + xpGained;
    let newLevel = player.level;
    let newXpToNext = player.xpToNextLevel;

    if (newXp >= newXpToNext && newLevel < 60) {
      newXp -= newXpToNext;
      newLevel++;
      newXpToNext = calcXpToNextLevel(newLevel);
      newLog.push(
        makeLogEntry(`You have reached level ${newLevel}!`, 'system')
      );
    }

    player = {
      ...player,
      xp: newXp,
      level: newLevel,
      xpToNextLevel: newXpToNext,
    };

    combat = {
      ...combat,
      currentMonster: null,
      monsterCurrentHp: 0,
    };
  } else {
    // Monster attacks player
    const npcMaxHit = calcNpcMaxHit(npcLevel);
    const npcDmg = Math.max(1, Math.floor(Math.random() * npcMaxHit) + 1);
    const mitigated = calcMitigatedDamage(npcDmg, player.stats.ac, npcLevel);
    const newHp = player.stats.hp - mitigated;

    newLog.push(
      makeLogEntry(
        `${currentMonster.name} hits YOU for ${mitigated} damage.`,
        'hit'
      )
    );

    if (newHp <= 0) {
      // Player death
      const xpLoss = Math.floor(player.xpToNextLevel * 0.10);
      const newXp = Math.max(0, player.xp - xpLoss);
      newLog.push(makeLogEntry('You have been slain!', 'death'));
      newLog.push(
        makeLogEntry(
          `You lose ${xpLoss} experience points.`,
          'system'
        )
      );
      player = {
        ...player,
        xp: newXp,
        stats: {
          ...player.stats,
          hp: Math.floor(player.stats.maxHp * 0.5),
        },
      };
      combat = {
        ...combat,
        currentMonster: null,
        monsterCurrentHp: 0,
      };
    } else {
      player = {
        ...player,
        stats: { ...player.stats, hp: newHp },
      };
      combat = {
        ...combat,
        currentMonster,
        monsterCurrentHp,
        lastTickTime: Date.now(),
      };
    }
  }

  const updatedLog = [...state.combatLog, ...newLog].slice(-50);

  return {
    player,
    combat,
    tickCount,
    combatLog: updatedLog,
  };
}
