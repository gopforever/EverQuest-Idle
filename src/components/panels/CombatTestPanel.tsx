import { useState, Fragment } from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  calcMeleeMaxHit,
  calcActualMeleeHit,
  calcHitChance,
  calcMitigatedDamage,
  calcAcMitigation,
  calcXpReward,
  getClassXpModifier,
  rollSpellResist,
  calcXpToNextLevel,
  calcMaxHpForLevel,
  calcMaxManaForLevel,
  calcWeaponSwingInterval,
  getWeaponDamage,
  getWeaponDelay,
} from '../../engine/combat';
import { calcDeathXpLoss, calcResXpRecovery } from '../../engine/death';
import { RACE_CLASS_COMBOS, RACE_BASE_STATS, CLASS_STAT_BONUSES } from '../../data/characterData';
import { MONSTERS } from '../../data/monsters';
import type { CharacterClass, Race } from '../../types';

const ALL_CLASSES: CharacterClass[] = [
  'Warrior', 'Monk', 'Rogue', 'Paladin', 'ShadowKnight', 'Ranger', 'Bard',
  'Cleric', 'Druid', 'Shaman', 'Wizard', 'Magician', 'Enchanter', 'Necromancer',
];

const ALL_RACES: Race[] = [
  'Human', 'Barbarian', 'Erudite', 'WoodElf', 'HighElf', 'DarkElf',
  'HalfElf', 'Dwarf', 'Troll', 'Ogre', 'Halfling', 'Gnome',
];

const MONSTER_IDS = Object.keys(MONSTERS);

// ── Shared style helpers ──────────────────────────────────────────────────────

const sectionHeaderStyle: React.CSSProperties = {
  backgroundColor: '#2a1f0a',
  color: 'var(--eq-gold)',
  border: '1px solid var(--eq-border)',
  padding: '2px 6px',
  fontSize: '11px',
  fontWeight: 'bold',
  letterSpacing: '0.05em',
  textAlign: 'center',
  marginBottom: '4px',
  marginTop: '8px',
};

const inputStyle: React.CSSProperties = {
  background: '#1a1510',
  border: '1px solid var(--eq-border)',
  color: 'var(--eq-text)',
  padding: '2px 6px',
  fontSize: '12px',
  fontFamily: 'inherit',
  width: '70px',
};

const wideInputStyle: React.CSSProperties = {
  ...inputStyle,
  width: '120px',
};

const btnStyle: React.CSSProperties = {
  background: '#2a1f0a',
  border: '1px solid var(--eq-border)',
  color: 'var(--eq-gold)',
  padding: '2px 8px',
  cursor: 'pointer',
  fontSize: '11px',
  fontFamily: 'inherit',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 0',
  flexWrap: 'wrap',
};

const labelStyle: React.CSSProperties = {
  color: 'var(--eq-text-dim)',
  fontSize: '11px',
  minWidth: '80px',
};

const resultStyle: React.CSSProperties = {
  color: 'var(--eq-orange, #e09040)',
  fontSize: '12px',
  fontWeight: 'bold',
};

const positiveStyle: React.CSSProperties = {
  color: '#5ddb5d',
  fontSize: '12px',
  fontWeight: 'bold',
};

const dangerStyle: React.CSSProperties = {
  color: '#a04040',
  fontSize: '12px',
  fontWeight: 'bold',
};

// ── Section: Instant Setup Controls ──────────────────────────────────────────

function SetupControls() {
  const gainXP = useGameStore((s) => s.gainXP);
  const player = useGameStore((s) => s.player);

  const [levelInput, setLevelInput] = useState('1');
  const [hpInput, setHpInput] = useState('');
  const [manaInput, setManaInput] = useState('');
  const [xpInput, setXpInput] = useState('');
  const [gpInput, setGpInput] = useState('');
  const [classInput, setClassInput] = useState<CharacterClass>(player.class);
  const [raceInput, setRaceInput] = useState<Race>(player.race);
  const [comboError, setComboError] = useState('');
  const [wepDmg, setWepDmg] = useState('3');
  const [wepDelay, setWepDelay] = useState('25');

  function applyLevel() {
    const newLevel = Math.max(1, Math.min(60, parseInt(levelInput) || 1));
    useGameStore.setState((s) => {
      const newMaxHp = calcMaxHpForLevel(newLevel, s.player.stats.sta, s.player.class);
      const newMaxMana = calcMaxManaForLevel(newLevel, s.player.stats.wis, s.player.stats.int, s.player.class);
      return {
        player: {
          ...s.player,
          level: newLevel,
          xpToNextLevel: calcXpToNextLevel(newLevel),
          stats: {
            ...s.player.stats,
            maxHp: newMaxHp,
            hp: newMaxHp,
            maxMana: newMaxMana,
            mana: newMaxMana,
          },
        },
      };
    });
  }

  function applyClassRace() {
    const validClasses = RACE_CLASS_COMBOS[raceInput as Race] ?? [];
    if (!validClasses.includes(classInput as CharacterClass)) {
      setComboError(`${raceInput} cannot be ${classInput}`);
      return;
    }
    setComboError('');
    useGameStore.setState((s) => {
      const raceBase = RACE_BASE_STATS[raceInput as Race];
      const classBonus = CLASS_STAT_BONUSES[classInput as CharacterClass];
      const mergedStats = {
        str: (raceBase.str ?? 75) + (classBonus.str ?? 0),
        sta: (raceBase.sta ?? 75) + (classBonus.sta ?? 0),
        agi: (raceBase.agi ?? 75) + (classBonus.agi ?? 0),
        dex: (raceBase.dex ?? 75) + (classBonus.dex ?? 0),
        wis: (raceBase.wis ?? 75) + (classBonus.wis ?? 0),
        int: (raceBase.int ?? 75) + (classBonus.int ?? 0),
        cha: (raceBase.cha ?? 75) + (classBonus.cha ?? 0),
      };
      const newMaxHp = calcMaxHpForLevel(s.player.level, mergedStats.sta, classInput);
      const newMaxMana = calcMaxManaForLevel(s.player.level, mergedStats.wis, mergedStats.int, classInput);
      return {
        player: {
          ...s.player,
          race: raceInput,
          class: classInput,
          stats: {
            ...s.player.stats,
            ...mergedStats,
            maxHp: newMaxHp,
            hp: newMaxHp,
            maxMana: newMaxMana,
            mana: newMaxMana,
          },
        },
      };
    });
  }

  function equipTestWeapon() {
    const dmg = Math.max(1, parseInt(wepDmg) || 3);
    const delay = Math.max(1, parseInt(wepDelay) || 25);
    const testWeapon = {
      id: 'test_weapon',
      name: `Test Weapon (${dmg}dmg / ${delay}dly)`,
      slot: 'Primary' as const,
      type: 'weapon' as const,
      rarity: 'common' as const,
      stats: { damage: dmg, delay: delay },
      weight: 1.0,
      classes: [...ALL_CLASSES] as CharacterClass[],
      races: [...ALL_RACES] as Race[],
      lore: false,
      noDrop: false,
      stackable: false,
      value: 0,
      source: 'vendor' as const,
      sprite: '',
      recLevel: 1,
      description: 'Debug test weapon.',
    };
    useGameStore.setState((s) => ({
      player: {
        ...s.player,
        gear: { ...s.player.gear, Primary: testWeapon },
      },
    }));
  }

  function setHp() {
    const val = parseInt(hpInput) || 0;
    useGameStore.setState((s) => ({
      player: {
        ...s.player,
        stats: {
          ...s.player.stats,
          hp: Math.min(val, s.player.stats.maxHp),
        },
      },
    }));
  }

  function setMana() {
    const val = parseInt(manaInput) || 0;
    useGameStore.setState((s) => ({
      player: {
        ...s.player,
        stats: {
          ...s.player.stats,
          mana: Math.min(val, s.player.stats.maxMana),
        },
      },
    }));
  }

  function fillHpMana() {
    useGameStore.setState((s) => ({
      player: {
        ...s.player,
        stats: {
          ...s.player.stats,
          hp: s.player.stats.maxHp,
          mana: s.player.stats.maxMana,
        },
      },
    }));
  }

  function grantXP() {
    const amount = parseInt(xpInput) || 0;
    if (amount > 0) gainXP(amount);
  }

  function grantGold() {
    const amount = parseInt(gpInput) || 0;
    if (amount > 0) {
      useGameStore.setState((s) => ({
        player: {
          ...s.player,
          currency: {
            ...s.player.currency,
            gp: s.player.currency.gp + amount,
          },
        },
      }));
    }
  }

  return (
    <>
      <div style={sectionHeaderStyle}>INSTANT SETUP</div>

      <div style={rowStyle}>
        <span style={labelStyle}>Level (1–60)</span>
        <input
          type="number"
          min={1}
          max={60}
          value={levelInput}
          onChange={(e) => setLevelInput(e.target.value)}
          style={inputStyle}
        />
        <button style={btnStyle} onClick={applyLevel}>Apply</button>
        <span style={{ color: 'var(--eq-text-dim)', fontSize: '11px' }}>
          (now: {player.level})
        </span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>HP</span>
        <input
          type="number"
          min={0}
          placeholder={String(player.stats.maxHp)}
          value={hpInput}
          onChange={(e) => setHpInput(e.target.value)}
          style={inputStyle}
        />
        <button style={btnStyle} onClick={setHp}>Set HP</button>
        <span style={{ color: 'var(--eq-text-dim)', fontSize: '11px' }}>
          {player.stats.hp}/{player.stats.maxHp}
        </span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Mana</span>
        <input
          type="number"
          min={0}
          placeholder={String(player.stats.maxMana)}
          value={manaInput}
          onChange={(e) => setManaInput(e.target.value)}
          style={inputStyle}
        />
        <button style={btnStyle} onClick={setMana}>Set Mana</button>
        <span style={{ color: 'var(--eq-text-dim)', fontSize: '11px' }}>
          {player.stats.mana}/{player.stats.maxMana}
        </span>
      </div>

      <div style={rowStyle}>
        <button style={{ ...btnStyle, width: '100%' }} onClick={fillHpMana}>
          Fill HP &amp; Mana
        </button>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Grant XP</span>
        <input
          type="number"
          min={0}
          value={xpInput}
          onChange={(e) => setXpInput(e.target.value)}
          style={inputStyle}
        />
        <button style={btnStyle} onClick={grantXP}>Grant XP</button>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Gold (gp)</span>
        <input
          type="number"
          min={0}
          value={gpInput}
          onChange={(e) => setGpInput(e.target.value)}
          style={inputStyle}
        />
        <button style={btnStyle} onClick={grantGold}>Grant Gold</button>
        <span style={{ color: 'var(--eq-text-dim)', fontSize: '11px' }}>
          {player.currency.gp} gp
        </span>
      </div>

      <div style={{ borderTop: '1px solid var(--eq-border)', margin: '6px 0 2px' }} />
      <div style={{ fontSize: '11px', color: 'var(--eq-gold)', marginBottom: '2px' }}>Set Class / Race</div>

      <div style={rowStyle}>
        <span style={labelStyle}>Race</span>
        <select
          value={raceInput}
          onChange={(e) => setRaceInput(e.target.value as Race)}
          style={{ ...wideInputStyle, width: '110px' }}
        >
          {ALL_RACES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Class</span>
        <select
          value={classInput}
          onChange={(e) => setClassInput(e.target.value as CharacterClass)}
          style={{ ...wideInputStyle, width: '110px' }}
        >
          {ALL_CLASSES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button style={btnStyle} onClick={applyClassRace}>Apply</button>
      </div>

      {comboError && (
        <div style={{ color: '#a04040', fontSize: '11px', padding: '1px 0' }}>{comboError}</div>
      )}

      <div style={{ borderTop: '1px solid var(--eq-border)', margin: '6px 0 2px' }} />
      <div style={{ fontSize: '11px', color: 'var(--eq-gold)', marginBottom: '2px' }}>Test Weapon</div>

      <div style={rowStyle}>
        <span style={labelStyle}>Damage</span>
        <input
          type="number"
          min={1}
          value={wepDmg}
          onChange={(e) => setWepDmg(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Delay (1/10s)</span>
        <input
          type="number"
          min={1}
          value={wepDelay}
          onChange={(e) => setWepDelay(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={rowStyle}>
        <button style={{ ...btnStyle, width: '100%' }} onClick={equipTestWeapon}>
          Equip Test Weapon
        </button>
      </div>
    </>
  );
}

// ── Section: Combat Simulation ────────────────────────────────────────────────

function CombatSimulation() {
  const combat = useGameStore((s) => s.combat);

  const [monsterId, setMonsterId] = useState(() => MONSTER_IDS[0] ?? '');
  const [monsterLevel, setMonsterLevel] = useState('1');

  function spawnAndFight() {
    const monster = MONSTERS[monsterId];
    if (!monster) return;
    const level = Math.max(1, Math.min(60, parseInt(monsterLevel) || 1));
    useGameStore.setState((s) => ({
      combat: {
        ...s.combat,
        currentMonster: monster,
        currentMonsterLevel: level,
        monsterCurrentHp: monster.hp,
        autoAttacking: true,
        isActive: true,
      },
      gameStarted: true,
    }));
  }

  function killCurrentMonster() {
    useGameStore.setState((s) => ({
      combat: {
        ...s.combat,
        monsterCurrentHp: 0,
      },
    }));
  }

  function stopCombat() {
    useGameStore.setState((s) => ({
      combat: {
        ...s.combat,
        autoAttacking: false,
        isActive: false,
        currentMonster: null,
        monsterCurrentHp: 0,
        currentMonsterLevel: 0,
      },
    }));
  }

  return (
    <>
      <div style={sectionHeaderStyle}>COMBAT SIMULATION</div>

      <div style={rowStyle}>
        <span style={labelStyle}>Monster</span>
        <select
          value={monsterId}
          onChange={(e) => setMonsterId(e.target.value)}
          style={{ ...wideInputStyle, width: '130px' }}
        >
          {MONSTER_IDS.map((id) => (
            <option key={id} value={id}>
              {MONSTERS[id]?.name ?? id}
            </option>
          ))}
        </select>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Mob Level</span>
        <input
          type="number"
          min={1}
          max={60}
          value={monsterLevel}
          onChange={(e) => setMonsterLevel(e.target.value)}
          style={inputStyle}
        />
        <button style={btnStyle} onClick={spawnAndFight}>
          Spawn &amp; Fight
        </button>
      </div>

      {combat.currentMonster && (
        <div style={{ fontSize: '11px', color: 'var(--eq-text-dim)', padding: '2px 0' }}>
          Fighting:{' '}
          <span style={{ color: 'var(--eq-orange, #e09040)' }}>
            {combat.currentMonster.name}
          </span>{' '}
          (Lv{combat.currentMonsterLevel}) — HP:{' '}
          <span style={{ color: '#a04040' }}>{combat.monsterCurrentHp}</span>
        </div>
      )}

      <div style={{ ...rowStyle, marginTop: '4px', gap: '6px' }}>
        <button
          style={{ ...btnStyle, color: '#a04040', borderColor: '#a04040' }}
          onClick={killCurrentMonster}
          disabled={!combat.currentMonster}
        >
          Kill Monster
        </button>
        <button
          style={btnStyle}
          onClick={stopCombat}
        >
          Stop Combat
        </button>
      </div>
    </>
  );
}

// ── Section: Group Combat Test ────────────────────────────────────────────────

const BB_MONSTERS: { id: string; midLevel: number }[] = [
  { id: 'gnoll_pup', midLevel: 2 },
  { id: 'gnoll_warrior', midLevel: 5 },
  { id: 'gnoll_shaman', midLevel: 8 },
  { id: 'gnoll_warlord', midLevel: 10 },
];
const BB_ZEM = 120;

function GroupCombatTest() {
  const currentZone = useGameStore((s) => s.currentZone);
  const ghosts = useGameStore((s) => s.ghosts);
  const group = useGameStore((s) => s.group);
  const player = useGameStore((s) => s.player);
  const inviteGhost = useGameStore((s) => s.inviteGhost);
  const kickGhost = useGameStore((s) => s.kickGhost);
  const disbandGroup = useGameStore((s) => s.disbandGroup);

  const availableGhosts = ghosts
    .filter((g) => g.isOnline && !group.members.includes(g.id))
    .slice(0, 30);

  const [selectedGhostId, setSelectedGhostId] = useState(() => availableGhosts[0]?.id ?? '');

  // If the currently selected ghost is no longer available, reset to the first available
  const effectiveSelectedId = availableGhosts.some((g) => g.id === selectedGhostId)
    ? selectedGhostId
    : (availableGhosts[0]?.id ?? '');

  const groupSize = group.members.length + 1;
  const classMod = getClassXpModifier(player.class);

  function teleportToBlackburrow() {
    useGameStore.getState().changeZone('blackburrow');
  }

  function quickFill() {
    const spotsLeft = 5 - group.members.length;
    const toInvite = ghosts
      .filter((g) => g.isOnline && !group.members.includes(g.id))
      .slice(0, spotsLeft);
    toInvite.forEach((g) => inviteGhost(g.id));
  }

  return (
    <>
      <div style={sectionHeaderStyle}>GROUP COMBAT TESTING</div>

      {/* Sub-area 1: Zone Setup */}
      <div style={rowStyle}>
        <button style={btnStyle} onClick={teleportToBlackburrow}>
          📍 Teleport to Blackburrow
        </button>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--eq-text-dim)', padding: '2px 0 6px 0' }}>
        Currently in: {currentZone?.name ?? currentZone?.id ?? '—'}
      </div>

      {/* Sub-area 2: Group Management */}
      <div style={{ fontSize: '11px', color: 'var(--eq-gold)', marginBottom: '2px' }}>GROUP MEMBERS</div>

      {group.members.length === 0 ? (
        <div style={{ fontSize: '11px', color: 'var(--eq-text-dim)', padding: '2px 0' }}>No members in group.</div>
      ) : (
        group.members.map((ghostId) => {
          const ghost = ghosts.find((g) => g.id === ghostId);
          if (!ghost) return null;
          return (
            <div key={ghostId} style={{ ...rowStyle, gap: '4px' }}>
              <button
                style={{ ...btnStyle, color: '#a04040', borderColor: '#a04040', padding: '1px 5px' }}
                onClick={() => kickGhost(ghostId)}
              >
                Kick
              </button>
              <span style={{ fontSize: '11px' }}>
                {ghost.name} — {ghost.race} {ghost.class} Lv{ghost.level}
              </span>
            </div>
          );
        })
      )}

      <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--eq-text-dim)' }}>
        Group: 1 + {group.members.length} members
      </div>

      <div style={{ fontSize: '11px', color: 'var(--eq-gold)', marginTop: '6px', marginBottom: '2px' }}>Add Ghost to Group</div>
      <div style={rowStyle}>
        <select
          value={effectiveSelectedId}
          onChange={(e) => setSelectedGhostId(e.target.value)}
          style={{ ...wideInputStyle, width: '160px' }}
        >
          {availableGhosts.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name} ({g.race} {g.class.slice(0, 3)} Lv{g.level})
            </option>
          ))}
        </select>
        <button style={btnStyle} onClick={() => { if (effectiveSelectedId) inviteGhost(effectiveSelectedId); }}>
          Invite
        </button>
      </div>

      <div style={{ ...rowStyle, marginTop: '4px', gap: '6px' }}>
        <button style={btnStyle} onClick={quickFill} disabled={group.members.length >= 5}>
          Quick Fill Group
        </button>
        <button
          style={{ ...btnStyle, color: '#a04040', borderColor: '#a04040' }}
          onClick={disbandGroup}
          disabled={group.members.length === 0}
        >
          Disband Group
        </button>
      </div>

      {/* Sub-area 3: Group XP Preview */}
      <div style={{ fontSize: '11px', color: 'var(--eq-gold)', marginTop: '8px', marginBottom: '2px' }}>GROUP XP PREVIEW (Blackburrow, ZEM {BB_ZEM})</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '2px 8px', fontSize: '11px', alignItems: 'center' }}>
        <span style={{ color: 'var(--eq-text-dim)', fontWeight: 'bold' }}>Monster</span>
        <span style={{ color: 'var(--eq-text-dim)', fontWeight: 'bold' }}>BaseXP</span>
        <span style={{ color: 'var(--eq-text-dim)', fontWeight: 'bold' }}>Group XP</span>
        <span style={{ color: 'var(--eq-text-dim)', fontWeight: 'bold' }}>Your XP</span>
        {BB_MONSTERS.map(({ id, midLevel }) => {
          const monster = MONSTERS[id];
          if (!monster) return null;
          const baseXp = monster.xpReward;
          const groupXp = calcXpReward(midLevel, BB_ZEM, groupSize);
          const yourXp = Math.floor(groupXp * classMod);
          return (
            <Fragment key={id}>
              <span>{monster.name}</span>
              <span style={{ color: 'var(--eq-text-dim)', textAlign: 'right' }}>{baseXp}</span>
              <span style={{ color: 'var(--eq-orange, #e09040)', textAlign: 'right' }}>{groupXp}</span>
              <span style={{ color: '#5ddb5d', textAlign: 'right' }}>{yourXp}</span>
            </Fragment>
          );
        })}
      </div>
    </>
  );
}

// ── Section: Melee Hit Calculator ─────────────────────────────────────────────

function MeleeHitCalc() {
  const [weaponDmg, setWeaponDmg] = useState('10');
  const [level, setLevel] = useState('20');
  const [str, setStr] = useState('80');
  const [sampleHit, setSampleHit] = useState<number | null>(null);

  const wDmg = parseInt(weaponDmg) || 0;
  const lv = parseInt(level) || 1;
  const st = parseInt(str) || 0;
  const maxHit = calcMeleeMaxHit(wDmg, lv, st);

  function reroll() {
    setSampleHit(calcActualMeleeHit(wDmg, lv, st));
  }

  return (
    <>
      <div style={sectionHeaderStyle}>MELEE HIT CALCULATOR</div>
      <div style={rowStyle}>
        <span style={labelStyle}>Weapon Dmg</span>
        <input type="number" value={weaponDmg} onChange={(e) => setWeaponDmg(e.target.value)} style={inputStyle} />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Player Level</span>
        <input type="number" value={level} onChange={(e) => setLevel(e.target.value)} style={inputStyle} />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>STR</span>
        <input type="number" value={str} onChange={(e) => setStr(e.target.value)} style={inputStyle} />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Max Hit</span>
        <span style={resultStyle}>{maxHit}</span>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Sample Hit</span>
        <span style={resultStyle}>{sampleHit ?? '—'}</span>
        <button style={btnStyle} onClick={reroll}>Roll</button>
      </div>
    </>
  );
}

// ── Section: Hit Chance Calculator ────────────────────────────────────────────

// ── Section: DPS Estimate ─────────────────────────────────────────────────────

function DpsEstimate() {
  const player = useGameStore((s) => s.player);
  const [mobDefense, setMobDefense] = useState('10');

  const weaponDamage = getWeaponDamage(player.gear ?? {});
  const weaponDelay = getWeaponDelay(player.gear ?? {});
  const offenseSkill = player.skills['1HSlash'] ?? player.level * 2;
  const defSkill = parseInt(mobDefense) || 10;

  const maxHit = calcMeleeMaxHit(weaponDamage, player.level, player.stats.str);
  const avgHit = (maxHit + 1) / 2;
  const hitChance = calcHitChance(offenseSkill, defSkill);
  const swingInterval = calcWeaponSwingInterval(weaponDelay);
  const estDps = swingInterval > 0 ? (avgHit * hitChance) / swingInterval : 0;

  return (
    <>
      <div style={sectionHeaderStyle}>DPS ESTIMATE</div>
      <div style={{ fontSize: '10px', color: 'var(--eq-text-dim)', padding: '1px 0 3px' }}>
        Live player stats · weapon: {weaponDamage}dmg / {weaponDelay}dly
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Mob Defense</span>
        <input
          type="number"
          min={0}
          value={mobDefense}
          onChange={(e) => setMobDefense(e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Max Hit</span>
        <span style={resultStyle}>{maxHit}</span>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Avg Hit</span>
        <span style={resultStyle}>{avgHit.toFixed(1)}</span>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Hit Chance</span>
        <span style={resultStyle}>{(hitChance * 100).toFixed(1)}%</span>
        <span style={{ fontSize: '10px', color: 'var(--eq-text-dim)' }}>
          (off:{offenseSkill})
        </span>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Swing Interval</span>
        <span style={resultStyle}>{swingInterval}s</span>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Est. DPS</span>
        <span style={{ ...resultStyle, color: '#5ddb5d' }}>{estDps.toFixed(2)}</span>
      </div>
    </>
  );
}

function HitChanceCalc() {
  const [offense, setOffense] = useState('100');
  const [defense, setDefense] = useState('100');

  const off = parseInt(offense) || 0;
  const def = parseInt(defense) || 0;
  const hitChance = calcHitChance(off, def);

  return (
    <>
      <div style={sectionHeaderStyle}>HIT CHANCE CALCULATOR</div>
      <div style={rowStyle}>
        <span style={labelStyle}>Offense Skill</span>
        <input type="number" value={offense} onChange={(e) => setOffense(e.target.value)} style={inputStyle} />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Defense Skill</span>
        <input type="number" value={defense} onChange={(e) => setDefense(e.target.value)} style={inputStyle} />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Hit Chance</span>
        <span style={resultStyle}>{(hitChance * 100).toFixed(1)}%</span>
      </div>
    </>
  );
}

// ── Section: AC Mitigation Calculator ─────────────────────────────────────────

function AcMitigationCalc() {
  const [ac, setAc] = useState('100');
  const [attackerLevel, setAttackerLevel] = useState('20');
  const [rawDmg, setRawDmg] = useState('50');

  const acVal = parseInt(ac) || 0;
  const lv = parseInt(attackerLevel) || 1;
  const dmg = parseInt(rawDmg) || 0;
  const mitigationFactor = calcAcMitigation(acVal, lv);
  const mitigatedDmg = calcMitigatedDamage(dmg, acVal, lv);

  return (
    <>
      <div style={sectionHeaderStyle}>AC MITIGATION CALCULATOR</div>
      <div style={rowStyle}>
        <span style={labelStyle}>AC</span>
        <input type="number" value={ac} onChange={(e) => setAc(e.target.value)} style={inputStyle} />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Attacker Level</span>
        <input type="number" value={attackerLevel} onChange={(e) => setAttackerLevel(e.target.value)} style={inputStyle} />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Raw Damage</span>
        <input type="number" value={rawDmg} onChange={(e) => setRawDmg(e.target.value)} style={inputStyle} />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Mitigation</span>
        <span style={resultStyle}>{(mitigationFactor * 100).toFixed(1)}%</span>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Dmg After AC</span>
        <span style={dangerStyle}>{mitigatedDmg}</span>
      </div>
    </>
  );
}

// ── Section: XP Calculator ─────────────────────────────────────────────────────

function XpCalc() {
  const [npcLevel, setNpcLevel] = useState('10');
  const [zem, setZem] = useState('75');
  const [groupSize, setGroupSize] = useState('1');
  const [cls, setCls] = useState<CharacterClass>('Warrior');

  const npcLv = parseInt(npcLevel) || 1;
  const zemVal = parseInt(zem) || 75;
  const gSize = Math.max(1, parseInt(groupSize) || 1);
  const baseXp = calcXpReward(npcLv, zemVal, gSize);
  const classMod = getClassXpModifier(cls);
  const finalXp = Math.floor(baseXp * classMod);

  return (
    <>
      <div style={sectionHeaderStyle}>XP CALCULATOR</div>
      <div style={rowStyle}>
        <span style={labelStyle}>NPC Level</span>
        <input type="number" value={npcLevel} onChange={(e) => setNpcLevel(e.target.value)} style={inputStyle} />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>ZEM</span>
        <input type="number" value={zem} onChange={(e) => setZem(e.target.value)} style={inputStyle} />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Group Size</span>
        <input type="number" min={1} max={6} value={groupSize} onChange={(e) => setGroupSize(e.target.value)} style={inputStyle} />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Class</span>
        <select
          value={cls}
          onChange={(e) => setCls(e.target.value as CharacterClass)}
          style={{ ...wideInputStyle, width: '110px' }}
        >
          {ALL_CLASSES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Base XP</span>
        <span style={positiveStyle}>{baseXp}</span>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>After Modifier</span>
        <span style={positiveStyle}>{finalXp}</span>
        <span style={{ color: 'var(--eq-text-dim)', fontSize: '11px' }}>
          (×{classMod.toFixed(2)})
        </span>
      </div>
    </>
  );
}

// ── Section: Spell Resist Calculator ──────────────────────────────────────────

function SpellResistCalc() {
  const [casterLevel, setCasterLevel] = useState('20');
  const [targetLevel, setTargetLevel] = useState('20');
  const [targetSave, setTargetSave] = useState('50');
  const [result, setResult] = useState<boolean | null>(null);

  const cLv = parseInt(casterLevel) || 1;
  const tLv = parseInt(targetLevel) || 1;
  const tSave = parseInt(targetSave) || 0;

  function reroll() {
    setResult(rollSpellResist(cLv, tLv, tSave));
  }

  return (
    <>
      <div style={sectionHeaderStyle}>SPELL RESIST CALCULATOR</div>
      <div style={rowStyle}>
        <span style={labelStyle}>Caster Level</span>
        <input type="number" value={casterLevel} onChange={(e) => setCasterLevel(e.target.value)} style={inputStyle} />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Target Level</span>
        <input type="number" value={targetLevel} onChange={(e) => setTargetLevel(e.target.value)} style={inputStyle} />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Target Save</span>
        <input type="number" value={targetSave} onChange={(e) => setTargetSave(e.target.value)} style={inputStyle} />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Result</span>
        {result === null ? (
          <span style={{ color: 'var(--eq-text-dim)', fontSize: '12px' }}>—</span>
        ) : result ? (
          <span style={dangerStyle}>RESISTED</span>
        ) : (
          <span style={positiveStyle}>LANDED</span>
        )}
        <button style={btnStyle} onClick={reroll}>Re-roll</button>
      </div>
    </>
  );
}

// ── Section: Death / Rez Calculator ───────────────────────────────────────────

function DeathRezCalc() {
  const player = useGameStore((s) => s.player);
  const [xpToNext, setXpToNext] = useState(String(player.xpToNextLevel));
  const [resType, setResType] = useState<'none' | 'partial' | 'full'>('none');

  const xpToNextVal = parseInt(xpToNext) || 0;
  const xpLost = calcDeathXpLoss(xpToNextVal);
  const xpRecovered = calcResXpRecovery(xpLost, resType);

  return (
    <>
      <div style={sectionHeaderStyle}>DEATH / REZ CALCULATOR</div>
      <div style={rowStyle}>
        <span style={labelStyle}>XP to Next Lv</span>
        <input
          type="number"
          value={xpToNext}
          onChange={(e) => setXpToNext(e.target.value)}
          style={{ ...inputStyle, width: '90px' }}
        />
        <button
          style={{ ...btnStyle, fontSize: '10px' }}
          onClick={() => setXpToNext(String(player.xpToNextLevel))}
        >
          Use Live
        </button>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Rez Type</span>
        <select
          value={resType}
          onChange={(e) => setResType(e.target.value as 'none' | 'partial' | 'full')}
          style={{ ...wideInputStyle, width: '100px' }}
        >
          <option value="none">None</option>
          <option value="partial">Partial (75%)</option>
          <option value="full">Full (96%)</option>
        </select>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>XP Lost</span>
        <span style={dangerStyle}>-{xpLost}</span>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>XP Recovered</span>
        <span style={positiveStyle}>+{xpRecovered}</span>
      </div>
    </>
  );
}

// ── Section: Live Player Stats ────────────────────────────────────────────────

function StatRow({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0', fontSize: '11px' }}>
      <span style={{ color: 'var(--eq-text-dim)' }}>{label}</span>
      <span style={{ color: color ?? 'var(--eq-text)', fontWeight: 'bold' }}>{value}</span>
    </div>
  );
}

function LivePlayerStats() {
  const player = useGameStore((s) => s.player);
  const currentZone = useGameStore((s) => s.currentZone);

  const xpPct = player.xpToNextLevel > 0
    ? ((player.xp / player.xpToNextLevel) * 100).toFixed(1)
    : '0.0';

  return (
    <>
      <div style={sectionHeaderStyle}>LIVE PLAYER SNAPSHOT</div>
      <div style={{ padding: '0 4px' }}>
        <StatRow label="Name" value={player.name} color="var(--eq-gold)" />
        <StatRow label="Race" value={player.race} />
        <StatRow label="Class" value={player.class} />
        <StatRow label="Level" value={player.level} color="var(--eq-gold)" />
        <StatRow label="HP" value={`${player.stats.hp} / ${player.stats.maxHp}`} color="#5ddb5d" />
        <StatRow label="Mana" value={`${player.stats.mana} / ${player.stats.maxMana}`} color="#5d8ddb" />
        <div style={{ borderTop: '1px solid var(--eq-border)', margin: '4px 0' }} />
        <StatRow label="STR" value={player.stats.str} />
        <StatRow label="STA" value={player.stats.sta} />
        <StatRow label="AGI" value={player.stats.agi} />
        <StatRow label="DEX" value={player.stats.dex} />
        <StatRow label="WIS" value={player.stats.wis} />
        <StatRow label="INT" value={player.stats.int} />
        <StatRow label="CHA" value={player.stats.cha} />
        <div style={{ borderTop: '1px solid var(--eq-border)', margin: '4px 0' }} />
        <StatRow label="AC" value={player.stats.ac} />
        <StatRow label="Attack" value={player.stats.attack} />
        <div style={{ borderTop: '1px solid var(--eq-border)', margin: '4px 0' }} />
        <StatRow label="XP" value={`${player.xp} / ${player.xpToNextLevel}`} color="var(--eq-orange, #e09040)" />
        <StatRow label="XP %" value={`${xpPct}%`} color="var(--eq-orange, #e09040)" />
        <StatRow label="Deaths" value={player.deathCount} color="#a04040" />
        <StatRow label="Zone" value={currentZone.name} color="var(--eq-gold)" />
        <div style={{ borderTop: '1px solid var(--eq-border)', margin: '4px 0' }} />
        <div style={{ fontSize: '11px', color: 'var(--eq-gold)', marginBottom: '2px' }}>Skills</div>
        {Object.keys(player.skills ?? {}).filter((k) => (player.skills[k] ?? 0) > 0).length === 0 ? (
          <div style={{ color: 'var(--eq-text-dim)', fontSize: '11px', fontStyle: 'italic' }}>
            No skills trained
          </div>
        ) : (
          Object.entries(player.skills ?? {})
            .filter(([, v]) => v > 0)
            .map(([skill, val]) => (
              <StatRow key={skill} label={skill} value={val} />
            ))
        )}
      </div>
    </>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────

export function CombatTestPanel() {
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '6px 8px',
        background: 'var(--eq-panel)',
        color: 'var(--eq-text)',
        fontFamily: 'inherit',
        fontSize: '12px',
      }}
    >
      <div
        style={{
          backgroundColor: '#2a1f0a',
          color: 'var(--eq-gold)',
          border: '1px solid var(--eq-border)',
          padding: '4px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '12px',
          letterSpacing: '0.1em',
          marginBottom: '4px',
        }}
      >
        ⚔ COMBAT TEST PANEL ⚔
      </div>
      <div style={{ fontSize: '10px', color: 'var(--eq-text-dim)', textAlign: 'center', marginBottom: '6px' }}>
        Developer / Debug Overlay
      </div>

      <SetupControls />
      <CombatSimulation />
      <GroupCombatTest />
      <MeleeHitCalc />
      <DpsEstimate />
      <HitChanceCalc />
      <AcMitigationCalc />
      <XpCalc />
      <SpellResistCalc />
      <DeathRezCalc />
      <LivePlayerStats />

      <div style={{ height: '16px' }} />
    </div>
  );
}
