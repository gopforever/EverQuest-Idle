import { useState } from 'react';
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
} from '../../engine/combat';
import { calcDeathXpLoss, calcResXpRecovery } from '../../engine/death';
import { MONSTERS } from '../../data/monsters';
import type { CharacterClass } from '../../types';

const ALL_CLASSES: CharacterClass[] = [
  'Warrior', 'Monk', 'Rogue', 'Paladin', 'ShadowKnight', 'Ranger', 'Bard',
  'Cleric', 'Druid', 'Shaman', 'Wizard', 'Magician', 'Enchanter', 'Necromancer',
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

  function applyLevel() {
    const newLevel = Math.max(1, Math.min(60, parseInt(levelInput) || 1));
    useGameStore.setState((s) => ({
      player: {
        ...s.player,
        level: newLevel,
        xpToNextLevel: calcXpToNextLevel(newLevel),
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
      <MeleeHitCalc />
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
