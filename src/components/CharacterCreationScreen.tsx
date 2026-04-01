import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Race, CharacterClass } from '../types';
import {
  RACE_CLASS_COMBOS,
  RACE_DISPLAY_NAMES,
  RACE_DESCRIPTIONS,
  CLASS_DESCRIPTIONS,
} from '../data/characterData';
import { buildPlayerStats, getStartingZone } from '../engine/characterCreation';
import { ZONES } from '../data/zones';

const ALL_RACES = Object.keys(RACE_CLASS_COMBOS) as Race[];
const ALL_CLASSES: CharacterClass[] = [
  'Warrior', 'Paladin', 'ShadowKnight', 'Ranger', 'Monk', 'Bard', 'Rogue',
  'Cleric', 'Druid', 'Shaman', 'Wizard', 'Magician', 'Enchanter', 'Necromancer',
];

const NAME_RE = /^[A-Za-z][A-Za-z '-]*$/;

function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 20 && NAME_RE.test(trimmed);
}

// ── Styles ────────────────────────────────────────────────────────────────────

const containerStyle = {
  position: 'fixed' as const,
  inset: 0,
  backgroundColor: 'var(--eq-bg)',
  color: 'var(--eq-text)',
  fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'auto',
  padding: '16px',
};

const cardStyle = {
  width: '100%',
  maxWidth: '700px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0',
};

const sectionStyle = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--eq-bevel-lo)',
};

const labelStyle = {
  color: 'var(--eq-gold)',
  fontSize: '10px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.12em',
  marginBottom: '8px',
  fontWeight: 'bold',
  textShadow: '0 0 6px rgba(180,120,0,0.3)',
};

const btnBase: React.CSSProperties = {
  padding: '4px 10px',
  fontSize: '11px',
  letterSpacing: '0.04em',
  background: 'linear-gradient(to bottom, #251e12 0%, #120f05 100%)',
  border: '1px solid var(--eq-border)',
  borderTopColor: 'var(--eq-bevel-hi)',
  borderLeftColor: 'var(--eq-bevel-hi)',
  borderBottomColor: 'var(--eq-bevel-lo)',
  borderRightColor: 'var(--eq-bevel-lo)',
  color: 'var(--eq-text)',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const btnActiveStyle: React.CSSProperties = {
  ...btnBase,
  background: 'linear-gradient(to bottom, #2a2010 0%, #1a1508 100%)',
  color: '#f0e060',
  borderTopColor: 'var(--eq-bevel-lo)',
  borderLeftColor: 'var(--eq-bevel-lo)',
  borderBottomColor: 'var(--eq-bevel-hi)',
  borderRightColor: 'var(--eq-bevel-hi)',
  textShadow: '0 0 6px rgba(200,160,0,0.4)',
};

const btnDisabledStyle: React.CSSProperties = {
  ...btnBase,
  opacity: 0.3,
  cursor: 'not-allowed' as const,
};

const inputStyle: React.CSSProperties = {
  backgroundColor: '#050402',
  border: '1px solid var(--eq-bevel-lo)',
  borderTopColor: '#050402',
  borderLeftColor: '#050402',
  boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.8)',
  color: 'var(--eq-text)',
  padding: '6px 10px',
  fontSize: '14px',
  width: '100%',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function CharacterCreationScreen() {
  const createCharacter = useGameStore((s) => s.createCharacter);

  const [name, setName] = useState('');
  const [race, setRace] = useState<Race | null>(null);
  const [cls, setCls] = useState<CharacterClass | null>(null);

  const validClasses: CharacterClass[] = useMemo(
    () => (race ? RACE_CLASS_COMBOS[race] : []),
    [race],
  );

  const handleRaceSelect = (r: Race) => {
    setRace(r);
    // If current class is not valid for the new race, auto-select the first valid class
    if (cls && !RACE_CLASS_COMBOS[r].includes(cls)) {
      setCls(RACE_CLASS_COMBOS[r][0] ?? null);
    }
  };

  const stats = useMemo(() => {
    if (!race || !cls) return null;
    return buildPlayerStats(race, cls);
  }, [race, cls]);

  const startingZoneName = useMemo(() => {
    if (!race) return null;
    const zoneId = getStartingZone(race);
    return ZONES[zoneId]?.name ?? 'Qeynos Hills';
  }, [race]);

  const canCreate = isValidName(name) && race !== null && cls !== null;

  const handleSubmit = () => {
    if (!canCreate || !race || !cls) return;
    createCharacter(name.trim(), race, cls);
  };

  const description = useMemo(() => {
    if (cls) return CLASS_DESCRIPTIONS[cls];
    if (race) return RACE_DESCRIPTIONS[race];
    return null;
  }, [race, cls]);

  return (
    <div style={containerStyle}>
      <div className="eq-window" style={cardStyle}>
        {/* Title */}
        <div className="eq-title-bar" style={{ fontSize: '14px', textAlign: 'center', padding: '8px', letterSpacing: '0.2em' }}>
          ⚔&nbsp;&nbsp;Create Your Character&nbsp;&nbsp;⚔
        </div>

        {/* Name */}
        <div style={sectionStyle}>
          <div style={labelStyle}>Character Name</div>
          <input
            style={inputStyle}
            type="text"
            placeholder="Your Name"
            maxLength={20}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {name.length > 0 && !isValidName(name) && (
            <div style={{ color: '#c06060', fontSize: '11px', marginTop: '4px' }}>
              Name must be 2–20 characters, letters only (spaces and hyphens allowed).
            </div>
          )}
        </div>

        {/* Race selection */}
        <div style={sectionStyle}>
          <div style={labelStyle}>Select Race</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {ALL_RACES.map((r) => (
              <button
                key={r}
                style={race === r ? btnActiveStyle : btnBase}
                onClick={() => handleRaceSelect(r)}
              >
                {RACE_DISPLAY_NAMES[r]}
              </button>
            ))}
          </div>
        </div>

        {/* Class selection */}
        <div style={sectionStyle}>
          <div style={labelStyle}>Select Class {race ? `(${RACE_DISPLAY_NAMES[race]})` : ''}</div>
          {race ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {ALL_CLASSES.map((c) => {
                const valid = validClasses.includes(c);
                const active = cls === c;
                return (
                  <button
                    key={c}
                    style={active ? btnActiveStyle : valid ? btnBase : btnDisabledStyle}
                    onClick={() => valid && setCls(c)}
                    disabled={!valid}
                    title={valid ? CLASS_DESCRIPTIONS[c] : `${c} is not available for ${RACE_DISPLAY_NAMES[race]}`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ color: 'var(--eq-text-dim)', fontSize: '12px' }}>
              Select a race first to see available classes.
            </div>
          )}
        </div>

        {/* Stats preview */}
        {stats && race && cls && (
          <div style={sectionStyle}>
            <div style={labelStyle}>Starting Stats</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px 12px', fontSize: '13px' }}>
              <StatRow label="STR" value={stats.str} />
              <StatRow label="STA" value={stats.sta} />
              <StatRow label="AGI" value={stats.agi} />
              <StatRow label="DEX" value={stats.dex} />
              <StatRow label="WIS" value={stats.wis} />
              <StatRow label="INT" value={stats.int} />
              <StatRow label="CHA" value={stats.cha} />
              <StatRow label="AC"  value={stats.ac}  />
              <StatRow label="HP"  value={stats.maxHp} highlight />
              <StatRow label="Mana" value={stats.maxMana} highlight />
              <StatRow label="ATK" value={stats.attack} />
            </div>
            {startingZoneName && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--eq-text-dim)' }}>
                Starting Zone: <span style={{ color: 'var(--eq-gold)' }}>{startingZoneName}</span>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <div style={sectionStyle}>
            <div style={labelStyle}>{cls ? 'Class' : 'Race'} Description</div>
            <div style={{ fontSize: '13px', color: 'var(--eq-text-dim)', lineHeight: '1.5' }}>
              {description}
            </div>
          </div>
        )}

        {/* Submit */}
        <div style={{ textAlign: 'center', padding: '14px' }}>
          <button
            className={`eq-btn ${canCreate ? '' : ''}`}
            style={{
              padding: '8px 36px',
              fontSize: '13px',
              letterSpacing: '0.18em',
              color: canCreate ? '#f0e060' : 'var(--eq-text-dim)',
              cursor: canCreate ? 'pointer' : 'not-allowed',
              opacity: canCreate ? 1 : 0.5,
              textShadow: canCreate ? '0 0 8px rgba(200,160,0,0.5)' : 'none',
            }}
            disabled={!canCreate}
            onClick={handleSubmit}
          >
            ENTER THE WORLD
          </button>
          {!canCreate && (
            <div style={{ fontSize: '11px', color: 'var(--eq-text-dim)', marginTop: '6px' }}>
              {!isValidName(name) && 'Enter a valid name (2–20 characters). '}
              {!race && 'Select a race. '}
              {race && !cls && 'Select a class.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #2a2010', padding: '1px 0' }}>
      <span style={{ color: 'var(--eq-text-dim)' }}>{label}</span>
      <span style={{ color: highlight ? 'var(--eq-gold)' : 'var(--eq-text)', fontWeight: highlight ? 'bold' : 'normal' }}>
        {value}
      </span>
    </div>
  );
}

