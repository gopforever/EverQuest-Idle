import { useState } from 'react';

type AchCategory = 'combat' | 'exploration' | 'tradeskills' | 'social';

interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  total: number;
  unlocked: boolean;
}

const ACHIEVEMENTS: Record<AchCategory, Achievement[]> = {
  combat: [
    { id: 'first_blood', name: 'First Blood', description: 'Kill your first monster', progress: 0, total: 1, unlocked: false },
    { id: 'gnoll_slayer', name: 'Gnoll Slayer', description: 'Kill 100 gnolls', progress: 0, total: 100, unlocked: false },
    { id: 'dungeon_delver', name: 'Dungeon Delver', description: 'Enter Blackburrow', progress: 0, total: 1, unlocked: false },
    { id: 'guk_survivor', name: 'Guk Survivor', description: 'Survive Lower Guk', progress: 0, total: 1, unlocked: false },
  ],
  exploration: [
    { id: 'world_traveler', name: 'World Traveler', description: 'Visit all three continents', progress: 0, total: 3, unlocked: false },
    { id: 'zone_explorer', name: 'Zone Explorer', description: 'Discover 10 zones', progress: 0, total: 10, unlocked: false },
    { id: 'wayfarer', name: 'Wayfarer', description: 'Visit 25 zones', progress: 0, total: 25, unlocked: false },
  ],
  tradeskills: [
    { id: 'apprentice_chef', name: 'Apprentice Chef', description: 'Baking skill 50', progress: 0, total: 50, unlocked: false },
    { id: 'master_smith', name: 'Master Smith', description: 'Blacksmithing skill 200', progress: 0, total: 200, unlocked: false },
  ],
  social: [
    { id: 'ghost_of_a_chance', name: 'Ghost of a Chance', description: 'Play alongside 10 ghost players', progress: 0, total: 10, unlocked: false },
    { id: 'well_known', name: 'Well Known', description: 'Reach level 20', progress: 0, total: 20, unlocked: false },
  ],
};

const CATEGORY_LABELS: Record<AchCategory, string> = {
  combat: 'Combat',
  exploration: 'Exploration',
  tradeskills: 'Tradeskills',
  social: 'Social',
};

function AchievementCard({ ach }: { ach: Achievement }) {
  const showBar = ach.total > 1;
  const pct = ach.total > 0 ? Math.min(100, Math.floor((ach.progress / ach.total) * 100)) : 0;

  return (
    <div
      className="p-2 border-b"
      style={{ borderColor: 'var(--eq-border)', opacity: ach.unlocked ? 1 : 0.7 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span style={{ fontSize: '14px' }}>{ach.unlocked ? '✅' : '🔒'}</span>
        <span className="text-xs font-bold" style={{ color: ach.unlocked ? 'var(--eq-gold)' : 'var(--eq-text)' }}>
          {ach.name}
        </span>
      </div>
      <div className="text-xs pl-6" style={{ color: 'var(--eq-text-dim)' }}>
        {ach.description}
      </div>
      {showBar && (
        <div className="pl-6 mt-1">
          <div className="text-xs mb-0.5" style={{ color: 'var(--eq-text-dim)' }}>
            {ach.progress} / {ach.total}
          </div>
          <div
            style={{
              height: '6px',
              backgroundColor: '#1a1510',
              border: '1px solid var(--eq-border)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                backgroundColor: ach.unlocked ? 'var(--eq-gold)' : '#4a7a4a',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function AchievementsPanel() {
  const [activeTab, setActiveTab] = useState<AchCategory>('combat');

  const tabStyle = (tab: AchCategory): React.CSSProperties => ({
    color: activeTab === tab ? 'var(--eq-gold)' : 'var(--eq-text-dim)',
    background: 'none',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid var(--eq-gold)' : '2px solid transparent',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '11px',
    fontFamily: 'inherit',
  });

  return (
    <div className="flex-1 overflow-y-auto" style={{ color: 'var(--eq-text)' }}>
      {/* Tab bar */}
      <div
        className="flex"
        style={{ borderBottom: '1px solid var(--eq-border)', backgroundColor: 'var(--eq-panel)' }}
      >
        {(Object.keys(ACHIEVEMENTS) as AchCategory[]).map((cat) => (
          <button key={cat} style={tabStyle(cat)} onClick={() => setActiveTab(cat)}>
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Header */}
      <div
        className="text-xs font-bold text-center py-1"
        style={{ backgroundColor: '#2a1f0a', color: 'var(--eq-gold)', border: '1px solid var(--eq-border)' }}
      >
        {CATEGORY_LABELS[activeTab].toUpperCase()} ACHIEVEMENTS
      </div>

      {/* Achievement list */}
      {ACHIEVEMENTS[activeTab].map((ach) => (
        <AchievementCard key={ach.id} ach={ach} />
      ))}
    </div>
  );
}
