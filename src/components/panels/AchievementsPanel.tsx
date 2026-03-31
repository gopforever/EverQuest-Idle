import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { EQPanelHeader } from '../ui/EQPanelHeader';
import { ACHIEVEMENT_DEFS, ACHIEVEMENT_DEFS_BY_CATEGORY } from '../../data/achievements';
import type { AchCategory, AchievementDef } from '../../data/achievements';
import { getGhostAchievementPoints } from '../../engine/ghostAchievements';
import { defaultTracking } from '../../types';

type TabId = AchCategory | 'leaderboard';

const PLANE_ZONE_IDS = ['plane_of_fear', 'plane_of_hate', 'plane_of_sky', 'sol_b', 'cazic_thule'];

const TRADESKILL_NAMES = [
  'Blacksmithing',
  'Tailoring',
  'Baking',
  'Brewing',
  'Jewelcrafting',
  'Pottery',
  'Fletching',
  'Fishing',
  'Tinkering',
];

interface ResolvedAch extends AchievementDef {
  progress: number;
  unlocked: boolean;
}

function AchievementCard({ ach }: { ach: ResolvedAch }) {
  const showBar = ach.total > 1;
  const pct = ach.total > 0 ? Math.min(100, Math.floor((ach.progress / ach.total) * 100)) : 0;
  const isSecret = ach.isSecret && !ach.unlocked;

  return (
    <div
      className="p-2 border-b"
      style={{ borderColor: 'var(--eq-border)', opacity: ach.unlocked ? 1 : 0.65 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span style={{ fontSize: '14px' }}>{ach.unlocked ? ach.icon : '🔒'}</span>
        <span className="text-xs font-bold flex-1" style={{ color: ach.unlocked ? 'var(--eq-gold)' : 'var(--eq-text)' }}>
          {isSecret ? '???' : ach.name}
        </span>
        <span
          className="text-xs px-1"
          style={{
            color: ach.unlocked ? 'var(--eq-gold)' : 'var(--eq-text-dim)',
            border: '1px solid var(--eq-border)',
            borderRadius: '2px',
            whiteSpace: 'nowrap',
          }}
        >
          {ach.points} pts
        </span>
      </div>
      <div className="text-xs pl-6" style={{ color: 'var(--eq-text-dim)' }}>
        {isSecret ? 'Hidden Achievement' : ach.description}
      </div>
      {showBar && !isSecret && (
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

const CATEGORY_LABELS: Record<AchCategory, string> = {
  general: 'General',
  combat: 'Combat',
  exploration: 'Exploration',
  tradeskills: 'Tradeskills',
  economy: 'Economy',
  social: 'Social',
  conquest: 'Conquest',
};

const TAB_ORDER: TabId[] = ['general', 'combat', 'exploration', 'tradeskills', 'economy', 'social', 'conquest', 'leaderboard'];

export function AchievementsPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [filter, setFilter] = useState('');
  const player = useGameStore((s) => s.player);
  const ghosts = useGameStore((s) => s.ghosts);
  const group = useGameStore((s) => s.group);
  const characterCreated = useGameStore((s) => s.characterCreated);

  const tracking = player.tracking ?? defaultTracking();

  // Derive achievement state from live game data
  function resolveAchievement(def: AchievementDef): ResolvedAch {
    switch (def.id) {
      // General
      case 'first_steps':
        return { ...def, progress: characterCreated ? 1 : 0, unlocked: characterCreated };
      case 'adventurer':
        return { ...def, progress: player.level >= 5 ? 1 : 0, unlocked: player.level >= 5 };
      case 'seasoned':
        return { ...def, progress: player.level >= 20 ? 1 : 0, unlocked: player.level >= 20 };
      case 'epic_journey':
        return { ...def, progress: player.level >= 50 ? 1 : 0, unlocked: player.level >= 50 };
      case 'max_level':
        return { ...def, progress: player.level >= 60 ? 1 : 0, unlocked: player.level >= 60 };

      // Combat
      case 'first_blood':
        return { ...def, progress: tracking.totalKills >= 1 ? 1 : 0, unlocked: tracking.totalKills >= 1 };
      case 'monster_slayer':
        return { ...def, progress: Math.min(100, tracking.totalKills), unlocked: tracking.totalKills >= 100 };
      case 'veteran_killer':
        return { ...def, progress: Math.min(1000, tracking.totalKills), unlocked: tracking.totalKills >= 1000 };
      case 'gnoll_slayer':
        return { ...def, progress: Math.min(100, tracking.gnollKills), unlocked: tracking.gnollKills >= 100 };
      case 'gnoll_exterminator':
        return { ...def, progress: Math.min(500, tracking.gnollKills), unlocked: tracking.gnollKills >= 500 };
      case 'undead_hunter':
        return { ...def, progress: Math.min(50, tracking.undeadKills), unlocked: tracking.undeadKills >= 50 };
      case 'giant_killer':
        return { ...def, progress: Math.min(10, tracking.giantKills), unlocked: tracking.giantKills >= 10 };
      case 'dragon_slayer':
        return { ...def, progress: tracking.dragonKills >= 1 ? 1 : 0, unlocked: tracking.dragonKills >= 1 };
      case 'ding':
        return { ...def, progress: player.level >= 2 ? 1 : 0, unlocked: player.level >= 2 };
      case 'no_fear':
        return { ...def, progress: player.deathCount >= 1 ? 1 : 0, unlocked: player.deathCount >= 1 };

      // Exploration
      case 'zone_explorer':
        return { ...def, progress: Math.min(10, tracking.zonesVisited.length), unlocked: tracking.zonesVisited.length >= 10 };
      case 'wayfarer':
        return { ...def, progress: Math.min(25, tracking.zonesVisited.length), unlocked: tracking.zonesVisited.length >= 25 };
      case 'world_traveler': {
        const continents = ['Antonica', 'Faydwer', 'Odus'];
        const visited = continents.filter((c) => tracking.continentsVisited.includes(c)).length;
        return { ...def, progress: Math.min(3, visited), unlocked: visited >= 3 };
      }
      case 'dungeon_delver': {
        const v = tracking.zonesVisited.includes('blackburrow');
        return { ...def, progress: v ? 1 : 0, unlocked: v };
      }
      case 'guk_survivor': {
        const v = tracking.zonesVisited.includes('lower_guk');
        return { ...def, progress: v ? 1 : 0, unlocked: v };
      }
      case 'plane_walker': {
        const v = PLANE_ZONE_IDS.some((z) => tracking.zonesVisited.includes(z));
        return { ...def, progress: v ? 1 : 0, unlocked: v };
      }
      case 'planes_touched': {
        const count = PLANE_ZONE_IDS.filter((z) => tracking.zonesVisited.includes(z)).length;
        return { ...def, progress: Math.min(2, count), unlocked: count >= 2 };
      }
      case 'full_explorer':
        return { ...def, progress: Math.min(40, tracking.zonesVisited.length), unlocked: tracking.zonesVisited.length >= 40 };

      // Tradeskills
      case 'first_combine':
        return { ...def, progress: tracking.tradeskillCombines >= 1 ? 1 : 0, unlocked: tracking.tradeskillCombines >= 1 };
      case 'dedicated_crafter':
        return { ...def, progress: Math.min(50, tracking.tradeskillCombines), unlocked: tracking.tradeskillCombines >= 50 };
      case 'master_crafter':
        return { ...def, progress: Math.min(500, tracking.tradeskillCombines), unlocked: tracking.tradeskillCombines >= 500 };
      case 'apprentice_chef': {
        const skill = player.skills['Baking'] ?? 0;
        return { ...def, progress: Math.min(50, skill), unlocked: skill >= 50 };
      }
      case 'master_smith': {
        const skill = player.skills['Blacksmithing'] ?? 0;
        return { ...def, progress: Math.min(200, skill), unlocked: skill >= 200 };
      }
      case 'brewer': {
        const skill = player.skills['Brewing'] ?? 0;
        return { ...def, progress: Math.min(100, skill), unlocked: skill >= 100 };
      }
      case 'jeweler': {
        const skill = player.skills['Jewelcrafting'] ?? 0;
        return { ...def, progress: Math.min(100, skill), unlocked: skill >= 100 };
      }
      case 'jack_of_all_trades': {
        const count = TRADESKILL_NAMES.filter((s) => (player.skills[s] ?? 0) >= 50).length;
        return { ...def, progress: Math.min(3, count), unlocked: count >= 3 };
      }

      // Economy
      case 'first_sale':
        return { ...def, progress: tracking.bazaarSales >= 1 ? 1 : 0, unlocked: tracking.bazaarSales >= 1 };
      case 'first_purchase':
        return { ...def, progress: tracking.bazaarPurchases >= 1 ? 1 : 0, unlocked: tracking.bazaarPurchases >= 1 };
      case 'merchant_in_training':
        return { ...def, progress: Math.min(10, tracking.bazaarPurchases), unlocked: tracking.bazaarPurchases >= 10 };
      case 'power_seller':
        return { ...def, progress: Math.min(25, tracking.bazaarSales), unlocked: tracking.bazaarSales >= 25 };
      case 'filthy_rich':
        return { ...def, progress: Math.min(1000, tracking.platEarned), unlocked: tracking.platEarned >= 1000 };
      case 'bazaar_tycoon': {
        const total = tracking.bazaarPurchases + tracking.bazaarSales;
        return { ...def, progress: Math.min(100, total), unlocked: total >= 100 };
      }

      // Social
      case 'ghost_of_a_chance': {
        const onlineCount = ghosts.filter((g) => g.isOnline).length;
        return { ...def, progress: Math.min(10, onlineCount), unlocked: onlineCount >= 10 };
      }
      case 'well_known':
        return { ...def, progress: Math.min(5, tracking.timesGroupedWithGhost), unlocked: tracking.timesGroupedWithGhost >= 5 };
      case 'popular':
        return { ...def, progress: Math.min(20, tracking.timesGroupedWithGhost), unlocked: tracking.timesGroupedWithGhost >= 20 };
      case 'group_leader':
        return { ...def, progress: tracking.groupsFormed >= 1 ? 1 : 0, unlocked: tracking.groupsFormed >= 1 };
      case 'server_celeb':
        return { ...def, progress: player.level >= 40 ? 1 : 0, unlocked: player.level >= 40 };
      case 'all_together': {
        const full = group.members.length >= 5;
        return { ...def, progress: full ? 1 : 0, unlocked: full };
      }

      // Conquest
      case 'blackburrow_cleared': {
        const v = player.level >= 15 && tracking.zonesVisited.includes('blackburrow');
        return { ...def, progress: v ? 1 : 0, unlocked: v };
      }
      case 'unrest_survivor': {
        const v = tracking.zonesVisited.includes('unrest');
        return { ...def, progress: v ? 1 : 0, unlocked: v };
      }
      case 'crushbone_champion': {
        const v = tracking.zonesVisited.includes('crushbone');
        return { ...def, progress: v ? 1 : 0, unlocked: v };
      }
      case 'guk_conqueror': {
        const v = tracking.zonesVisited.includes('lower_guk');
        return { ...def, progress: v ? 1 : 0, unlocked: v };
      }
      case 'nagafen_slain': {
        const v = tracking.raidBossesKilled.includes('lord_nagafen');
        return { ...def, progress: v ? 1 : 0, unlocked: v };
      }
      case 'raid_ready':
        return { ...def, progress: player.level >= 46 ? 1 : 0, unlocked: player.level >= 46 };

      default:
        return { ...def, progress: 0, unlocked: false };
    }
  }

  // Summary across all categories
  const allResolved = ACHIEVEMENT_DEFS.map(resolveAchievement);
  const unlockedCount = allResolved.filter((a) => a.unlocked).length;
  const totalPoints = allResolved.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  const maxPoints = ACHIEVEMENT_DEFS.reduce((sum, a) => sum + a.points, 0);

  // Per-category points
  const categoryPoints = activeTab !== 'leaderboard'
    ? ACHIEVEMENT_DEFS_BY_CATEGORY[activeTab as AchCategory]
        .map(resolveAchievement)
        .filter((a) => a.unlocked)
        .reduce((sum, a) => sum + a.points, 0)
    : 0;

  const tabStyle = (tab: TabId): React.CSSProperties => ({
    color: activeTab === tab ? 'var(--eq-gold)' : 'var(--eq-text-dim)',
    background: 'none',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid var(--eq-gold)' : '2px solid transparent',
    padding: '4px 6px',
    cursor: 'pointer',
    fontSize: '10px',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  });

  // Filtered achievements for current category
  const categoryAchs = activeTab !== 'leaderboard'
    ? ACHIEVEMENT_DEFS_BY_CATEGORY[activeTab as AchCategory]
        .map(resolveAchievement)
        .filter((a) =>
          filter.trim() === '' ||
          a.name.toLowerCase().includes(filter.toLowerCase()) ||
          a.description.toLowerCase().includes(filter.toLowerCase())
        )
    : [];

  // Leaderboard: sort ghosts by achievement points
  const leaderboard = [...ghosts]
    .map((g) => ({ ghost: g, points: getGhostAchievementPoints(g) }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 20);

  const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <div className="flex-1 overflow-y-auto" style={{ color: 'var(--eq-text)' }}>
      {/* Summary header */}
      <div
        className="px-3 py-1.5 text-center"
        style={{ borderBottom: '1px solid var(--eq-border)', backgroundColor: 'var(--eq-panel)' }}
      >
        <div className="text-xs" style={{ color: 'var(--eq-text-dim)' }}>
          <span style={{ color: 'var(--eq-gold)' }}>{unlockedCount}</span>
          {' / '}
          {ACHIEVEMENT_DEFS.length}
          {' achievements  '}
          <span style={{ color: 'var(--eq-gold)' }}>{totalPoints}</span>
          {' / '}
          {maxPoints}
          {' points'}
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex overflow-x-auto"
        style={{ borderBottom: '1px solid var(--eq-border)', backgroundColor: 'var(--eq-panel)' }}
      >
        {TAB_ORDER.map((tab) => (
          <button key={tab} style={tabStyle(tab)} onClick={() => { setActiveTab(tab); setFilter(''); }}>
            {tab === 'leaderboard' ? 'Leaderboard' : CATEGORY_LABELS[tab as AchCategory]}
          </button>
        ))}
      </div>

      {activeTab === 'leaderboard' ? (
        <>
          <EQPanelHeader title="GHOST PLAYER LEADERBOARD" />
          <div className="px-2 py-1">
            {leaderboard.map(({ ghost, points }, idx) => (
              <div
                key={ghost.id}
                className="flex items-center gap-2 py-1.5 border-b text-xs"
                style={{ borderColor: 'var(--eq-border)' }}
              >
                <span
                  style={{
                    minWidth: '20px',
                    fontWeight: 'bold',
                    color: rankColors[idx] ?? 'var(--eq-text-dim)',
                  }}
                >
                  #{idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div style={{ color: rankColors[idx] ?? 'var(--eq-text)', fontWeight: idx < 3 ? 'bold' : 'normal' }}>
                    {ghost.name}
                  </div>
                  {ghost.guildName && (
                    <div style={{ color: 'var(--eq-text-dim)', fontSize: '9px' }}>&lt;{ghost.guildName}&gt;</div>
                  )}
                </div>
                <div className="text-right">
                  <div style={{ color: 'var(--eq-text-dim)' }}>Lv{ghost.level} {ghost.class}</div>
                  <div style={{ color: 'var(--eq-text-dim)', fontSize: '9px' }}>{ghost.personality}</div>
                </div>
                <div className="text-right" style={{ minWidth: '60px' }}>
                  <div style={{ color: 'var(--eq-gold)', fontWeight: 'bold' }}>{points} pts</div>
                  <div style={{ color: 'var(--eq-text-dim)', fontSize: '9px' }}>{ghost.achievements.length} achievements</div>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <div className="text-xs py-4 text-center" style={{ color: 'var(--eq-text-dim)' }}>
                No ghost players have earned achievements yet.
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Category points and filter */}
          <div
            className="px-3 py-1 flex items-center gap-2"
            style={{ borderBottom: '1px solid var(--eq-border)' }}
          >
            <span className="text-xs" style={{ color: 'var(--eq-text-dim)', flexShrink: 0 }}>
              Category: <span style={{ color: 'var(--eq-gold)' }}>{categoryPoints} pts</span>
            </span>
            <input
              type="text"
              placeholder="Filter..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                flex: 1,
                fontSize: '10px',
                padding: '2px 6px',
                backgroundColor: '#1a1510',
                border: '1px solid var(--eq-border)',
                color: 'var(--eq-text)',
                borderRadius: '2px',
                fontFamily: 'inherit',
                minWidth: 0,
              }}
            />
          </div>

          <EQPanelHeader title={`${CATEGORY_LABELS[activeTab as AchCategory].toUpperCase()} ACHIEVEMENTS`} />

          {categoryAchs.map((ach) => (
            <AchievementCard key={ach.id} ach={ach} />
          ))}

          {categoryAchs.length === 0 && (
            <div className="text-xs py-4 text-center" style={{ color: 'var(--eq-text-dim)' }}>
              No achievements match your filter.
            </div>
          )}
        </>
      )}
    </div>
  );
}
