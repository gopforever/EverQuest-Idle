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
  backgroundColor: 'var(--eq-panel)',
  border: '2px solid var(--eq-border)',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '16px',
};

const sectionStyle = {
  border: '1px solid var(--eq-border)',
  padding: '10px 12px',
  backgroundColor: '#0d0b08',
};

const labelStyle = {
  color: 'var(--eq-gold)',
  fontSize: '11px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  marginBottom: '8px',
  fontWeight: 'bold',
};

const btnBase = {
  padding: '4px 10px',
  fontSize: '12px',
  border: '1px solid var(--eq-border)',
  backgroundColor: '#1a1510',
  color: 'var(--eq-text)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'background-color 0.15s, color 0.15s',
};

const btnActiveStyle = {
  ...btnBase,
  backgroundColor: '#3a2a05',
  color: 'var(--eq-gold)',
  borderColor: 'var(--eq-gold)',
};

const btnDisabledStyle = {
  ...btnBase,
  opacity: 0.35,
  cursor: 'not-allowed' as const,
};

const inputStyle = {
  backgroundColor: '#0d0b08',
  border: '1px solid var(--eq-border)',
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
      <div style={cardStyle}>
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--eq-gold)', fontSize: '20px', fontWeight: 'bold', letterSpacing: '0.05em' }}>
            ⚔️ &nbsp;Create Your Character&nbsp; ⚔️
          </div>
          <div style={{ color: 'var(--eq-text-dim)', fontSize: '12px', marginTop: '4px' }}>
            Choose your race and class to enter the world of Norrath
          </div>
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
        <div style={{ textAlign: 'center' }}>
          <button
            style={{
              padding: '10px 32px',
              fontSize: '15px',
              fontFamily: 'inherit',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              border: '2px solid',
              borderColor: canCreate ? 'var(--eq-gold)' : 'var(--eq-border)',
              backgroundColor: canCreate ? '#3a2a05' : '#1a1510',
              color: canCreate ? 'var(--eq-gold)' : 'var(--eq-text-dim)',
              cursor: canCreate ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
            }}
            disabled={!canCreate}
            onClick={handleSubmit}
          >
            Enter the World
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

