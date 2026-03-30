import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { EQPanelHeader } from '../ui/EQPanelHeader';

type AchCategory = 'combat' | 'exploration' | 'tradeskills' | 'social';

interface AchievementDef {
  id: string;
  name: string;
  description: string;
  total: number;
}

const ACHIEVEMENT_DEFS: Record<AchCategory, AchievementDef[]> = {
  combat: [
    { id: 'first_blood', name: 'First Blood', description: 'Kill your first monster', total: 1 },
    { id: 'ding', name: 'Ding!', description: 'Reach level 2', total: 1 },
    { id: 'grind_never_stops', name: 'Grind Never Stops', description: 'Reach level 10', total: 1 },
    { id: 'soldier_of_fortune', name: 'Soldier of Fortune', description: 'Reach level 60', total: 60 },
    { id: 'gnoll_slayer', name: 'Gnoll Slayer', description: 'Kill 100 gnolls', total: 100 },
    { id: 'dungeon_delver', name: 'Dungeon Delver', description: 'Enter Blackburrow', total: 1 },
    { id: 'guk_survivor', name: 'Guk Survivor', description: 'Survive Lower Guk', total: 1 },
  ],
  exploration: [
    { id: 'world_traveler', name: 'World Traveler', description: 'Visit all three continents', total: 3 },
    { id: 'zone_explorer', name: 'Zone Explorer', description: 'Discover 10 zones', total: 10 },
    { id: 'wayfarer', name: 'Wayfarer', description: 'Visit 25 zones', total: 25 },
  ],
  tradeskills: [
    { id: 'apprentice_chef', name: 'Apprentice Chef', description: 'Baking skill 50', total: 50 },
    { id: 'master_smith', name: 'Master Smith', description: 'Blacksmithing skill 200', total: 200 },
  ],
  social: [
    { id: 'ghost_of_a_chance', name: 'Ghost of a Chance', description: 'Play alongside 10 ghost players', total: 10 },
    { id: 'well_known', name: 'Well Known', description: 'Reach level 20', total: 20 },
  ],
};

const CATEGORY_LABELS: Record<AchCategory, string> = {
  combat: 'Combat',
  exploration: 'Exploration',
  tradeskills: 'Tradeskills',
  social: 'Social',
};

interface ResolvedAch extends AchievementDef {
  progress: number;
  unlocked: boolean;
}

function AchievementCard({ ach }: { ach: ResolvedAch }) {
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
  const player = useGameStore((s) => s.player);
  const tickCount = useGameStore((s) => s.tickCount);
  const ghosts = useGameStore((s) => s.ghosts);

  // Derive achievement state from live game data
  function resolveAchievement(def: AchievementDef): ResolvedAch {
    switch (def.id) {
      case 'first_blood':
        return {
          ...def,
          progress: tickCount > 5 ? 1 : 0,
          unlocked: player.level >= 1 && tickCount > 5,
        };
      case 'ding':
        return { ...def, progress: player.level >= 2 ? 1 : 0, unlocked: player.level >= 2 };
      case 'grind_never_stops':
        return { ...def, progress: player.level >= 10 ? 1 : 0, unlocked: player.level >= 10 };
      case 'soldier_of_fortune':
        return { ...def, progress: player.level, unlocked: player.level >= 60 };
      case 'ghost_of_a_chance': {
        const onlineCount = ghosts.filter((g) => g.isOnline).length;
        return { ...def, progress: Math.min(10, onlineCount), unlocked: onlineCount >= 10 };
      }
      case 'well_known':
        return { ...def, progress: player.level, unlocked: player.level >= 20 };
      default:
        return { ...def, progress: 0, unlocked: false };
    }
  }

  const resolvedCategory = ACHIEVEMENT_DEFS[activeTab].map(resolveAchievement);

  // Summary across all categories
  const allAchs = (Object.values(ACHIEVEMENT_DEFS) as AchievementDef[][]).flat().map(resolveAchievement);
  const unlockedCount = allAchs.filter((a) => a.unlocked).length;

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
      {/* Summary */}
      <div className="px-3 py-1 text-xs text-center" style={{ color: 'var(--eq-text-dim)', borderBottom: '1px solid var(--eq-border)' }}>
        <span style={{ color: 'var(--eq-gold)' }}>{unlockedCount}</span> / {allAchs.length} achievements unlocked
      </div>
      {/* Tab bar */}
      <div
        className="flex"
        style={{ borderBottom: '1px solid var(--eq-border)', backgroundColor: 'var(--eq-panel)' }}
      >
        {(Object.keys(ACHIEVEMENT_DEFS) as AchCategory[]).map((cat) => (
          <button key={cat} style={tabStyle(cat)} onClick={() => setActiveTab(cat)}>
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Header */}
      <EQPanelHeader title={`${CATEGORY_LABELS[activeTab].toUpperCase()} ACHIEVEMENTS`} />

      {/* Achievement list */}
      {resolvedCategory.map((ach) => (
        <AchievementCard key={ach.id} ach={ach} />
      ))}
    </div>
  );
}
