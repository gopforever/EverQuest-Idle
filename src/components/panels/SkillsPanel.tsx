import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { CharacterClass } from '../../types';

const BASE_COMBAT_SKILLS = [
  '1H Slashing', '1H Blunt', '2H Slashing', '2H Blunt',
  'Piercing', 'Hand to Hand', 'Offense', 'Defense', 'Dodge',
];

const CLASS_SKILLS: Partial<Record<CharacterClass, string[]>> = {
  Warrior: ['Taunt', 'Bash'],
  Monk: ['Kick', 'Flying Kick', 'Mend'],
  Rogue: ['Backstab', 'Sneak', 'Hide'],
  Paladin: ['Bash', 'Taunt', 'Lay Hands'],
  ShadowKnight: ['Bash', 'Taunt', 'Harm Touch'],
  Ranger: ['Kick', 'Track'],
  Bard: ['Kick', 'Meditate', 'Channeling'],
  Cleric: ['Meditate', 'Channeling'],
  Druid: ['Meditate', 'Channeling'],
  Shaman: ['Meditate', 'Channeling'],
  Wizard: ['Meditate', 'Channeling'],
  Magician: ['Meditate', 'Channeling'],
  Enchanter: ['Meditate', 'Channeling'],
  Necromancer: ['Meditate', 'Channeling'],
};

const TRADESKILLS = [
  'Alchemy', 'Baking', 'Blacksmithing', 'Brewing',
  'Fletching', 'Jewelry Making', 'Pottery', 'Research', 'Tailoring',
];

type Tab = 'combat' | 'tradeskills';

function ProgressBar({ current, max, color }: { current: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.floor((current / max) * 100)) : 0;
  return (
    <div
      style={{
        height: '8px',
        backgroundColor: '#1a1510',
        border: '1px solid var(--eq-border)',
        borderRadius: '2px',
        overflow: 'hidden',
        minWidth: '60px',
        flex: 1,
      }}
    >
      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color }} />
    </div>
  );
}

function SkillRow({ name, current, max }: { name: string; current: number; max: number }) {
  return (
    <div
      className="flex items-center gap-2 px-2 py-1 border-b text-xs"
      style={{ borderColor: 'var(--eq-border)' }}
    >
      <span style={{ color: 'var(--eq-text)', flex: '0 0 120px' }}>{name}</span>
      <span style={{ color: 'var(--eq-text-dim)', flex: '0 0 56px', textAlign: 'right' }}>
        {current} / {max}
      </span>
      <ProgressBar current={current} max={max} color="#4a7a4a" />
    </div>
  );
}

export function SkillsPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('combat');
  const player = useGameStore((s) => s.player);

  const combatMax = Math.min(200, player.level * 5);

  const combatSkills = [
    ...BASE_COMBAT_SKILLS,
    ...(CLASS_SKILLS[player.class] ?? []),
  ];

  const tradeskills = [
    ...TRADESKILLS,
    ...(player.race === 'Gnome' ? ['Tinkering'] : []),
  ];

  const tabStyle = (tab: Tab): React.CSSProperties => ({
    color: activeTab === tab ? 'var(--eq-gold)' : 'var(--eq-text-dim)',
    background: 'none',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid var(--eq-gold)' : '2px solid transparent',
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'inherit',
  });

  return (
    <div className="flex-1 overflow-y-auto" style={{ color: 'var(--eq-text)' }}>
      {/* Tab bar */}
      <div
        className="flex"
        style={{ borderBottom: '1px solid var(--eq-border)', backgroundColor: 'var(--eq-panel)' }}
      >
        <button style={tabStyle('combat')} onClick={() => setActiveTab('combat')}>
          Combat Skills
        </button>
        <button style={tabStyle('tradeskills')} onClick={() => setActiveTab('tradeskills')}>
          Tradeskills
        </button>
      </div>

      {activeTab === 'combat' && (
        <div>
          <div
            className="text-xs font-bold text-center py-1"
            style={{ backgroundColor: '#2a1f0a', color: 'var(--eq-gold)', border: '1px solid var(--eq-border)' }}
          >
            COMBAT SKILLS — {player.class.toUpperCase()}
          </div>
          {combatSkills.map((skill) => (
            <SkillRow
              key={skill}
              name={skill}
              current={player.skills[skill] ?? 0}
              max={combatMax}
            />
          ))}
        </div>
      )}

      {activeTab === 'tradeskills' && (
        <div>
          <div
            className="text-xs font-bold text-center py-1"
            style={{ backgroundColor: '#2a1f0a', color: 'var(--eq-gold)', border: '1px solid var(--eq-border)' }}
          >
            TRADESKILLS
          </div>
          {tradeskills.map((skill) => (
            <SkillRow
              key={skill}
              name={skill}
              current={player.skills[skill] ?? 0}
              max={300}
            />
          ))}
        </div>
      )}
    </div>
  );
}
