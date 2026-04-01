import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { GhostPlayer, CharacterClass } from '../../types';

type RankCategory = 'level' | 'kills' | 'deaths' | 'hp' | 'ac' | 'str' | 'xp';
type SortDir = 'asc' | 'desc';

const CLASS_ICONS: Partial<Record<CharacterClass, string>> = {
  Warrior:      '⚔',
  Paladin:      '✝',
  ShadowKnight: '☠',
  Ranger:       '🏹',
  Monk:         '✊',
  Bard:         '♪',
  Rogue:        '🗡',
  Cleric:       '⛪',
  Druid:        '🌿',
  Shaman:       '🌀',
  Wizard:       '⚡',
  Magician:     '🔮',
  Enchanter:    '✨',
  Necromancer:  '💀',
};

const CLASS_COLOR: Partial<Record<CharacterClass, string>> = {
  Warrior:      '#c0b060',
  Paladin:      '#f0e080',
  ShadowKnight: '#aa66cc',
  Ranger:       '#88cc44',
  Monk:         '#d4a030',
  Bard:         '#cc88ff',
  Rogue:        '#dddddd',
  Cleric:       '#ffffff',
  Druid:        '#44cc44',
  Shaman:       '#88aaff',
  Wizard:       '#8888ff',
  Magician:     '#ff8866',
  Enchanter:    '#cc44cc',
  Necromancer:  '#8866cc',
};

const CATEGORIES: { id: RankCategory; label: string; desc: string }[] = [
  { id: 'level',  label: 'Level',  desc: 'Sort by character level' },
  { id: 'kills',  label: 'Kills',  desc: 'Total mob kills' },
  { id: 'deaths', label: 'Deaths', desc: 'Total deaths' },
  { id: 'hp',     label: 'Max HP', desc: 'Maximum hit points' },
  { id: 'ac',     label: 'AC',     desc: 'Armor class' },
  { id: 'str',    label: 'STR',    desc: 'Strength stat' },
  { id: 'xp',     label: 'XP %',   desc: 'Current XP progress to next level' },
];

interface RankEntry {
  id: string;
  name: string;
  cls: CharacterClass;
  race: string;
  level: number;
  zone: string;
  maxHp: number;
  ac: number;
  str: number;
  kills: number;
  deaths: number;
  xpPct: number;
  isPlayer: boolean;
  isOnline: boolean;
}

function getRankValue(entry: RankEntry, cat: RankCategory): number {
  switch (cat) {
    case 'level':  return entry.level;
    case 'kills':  return entry.kills;
    case 'deaths': return entry.deaths;
    case 'hp':     return entry.maxHp;
    case 'ac':     return entry.ac;
    case 'str':    return entry.str;
    case 'xp':     return entry.xpPct;
  }
}

function getRankDisplay(entry: RankEntry, cat: RankCategory): string {
  const v = getRankValue(entry, cat);
  if (cat === 'xp') return `${v.toFixed(1)}%`;
  return String(v);
}

function MedalBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '14px', marginRight: 2 }}>🥇</span>;
  if (rank === 2) return <span style={{ color: '#c0c0c0', fontWeight: 'bold', fontSize: '14px', marginRight: 2 }}>🥈</span>;
  if (rank === 3) return <span style={{ color: '#cd7f32', fontWeight: 'bold', fontSize: '14px', marginRight: 2 }}>🥉</span>;
  return <span style={{ color: 'var(--eq-text-dim)', fontSize: '11px', minWidth: '22px', display: 'inline-block', textAlign: 'right', marginRight: 2 }}>{rank}</span>;
}

export function RankingsPanel() {
  const player = useGameStore((s) => s.player);
  const ghosts = useGameStore((s) => s.ghosts);

  const [category, setCategory] = useState<RankCategory>('level');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filter, setFilter] = useState('');
  const [showOffline, setShowOffline] = useState(false);

  const allEntries = useMemo<RankEntry[]>(() => {
    const playerEntry: RankEntry = {
      id: 'player',
      name: player.name,
      cls: player.class as CharacterClass,
      race: player.race,
      level: player.level,
      zone: player.currentZone,
      maxHp: player.stats.maxHp,
      ac: player.stats.ac,
      str: player.stats.str,
      kills: player.tracking?.totalKills ?? 0,
      deaths: player.deathCount,
      xpPct: player.xpToNextLevel > 0 ? (player.xp / player.xpToNextLevel) * 100 : 0,
      isPlayer: true,
      isOnline: true,
    };

    const ghostEntries: RankEntry[] = ghosts.map((g: GhostPlayer) => ({
      id: g.id,
      name: g.name,
      cls: g.class,
      race: g.race,
      level: g.level,
      zone: g.currentZone,
      maxHp: g.stats.maxHp,
      ac: g.stats.ac,
      str: g.stats.str,
      kills: g.totalKills ?? 0,
      deaths: g.deathCount,
      xpPct: g.xpToNextLevel > 0 ? (g.xp / g.xpToNextLevel) * 100 : 0,
      isPlayer: false,
      isOnline: g.isOnline,
    }));

    return [playerEntry, ...ghostEntries];
  }, [player, ghosts]);

  const ranked = useMemo(() => {
    const q = filter.toLowerCase();
    const filtered = allEntries.filter((e) => {
      if (!showOffline && !e.isOnline) return false;
      if (q) return e.name.toLowerCase().includes(q) || e.cls.toLowerCase().includes(q) || e.race.toLowerCase().includes(q);
      return true;
    });

    return [...filtered].sort((a, b) => {
      const diff = getRankValue(b, category) - getRankValue(a, category);
      return sortDir === 'desc' ? diff : -diff;
    });
  }, [allEntries, category, sortDir, filter, showOffline]);

  const onlineCount = allEntries.filter((e) => e.isOnline).length;

  const catBtnStyle = (active: boolean): React.CSSProperties => ({
    background: active
      ? 'linear-gradient(to bottom, #3a2a10, #1a1408)'
      : 'linear-gradient(to bottom, #1a1408, #0e0a05)',
    border: '1px solid var(--eq-border)',
    borderTopColor: active ? 'var(--eq-bevel-lo)' : 'var(--eq-bevel-hi)',
    borderLeftColor: active ? 'var(--eq-bevel-lo)' : 'var(--eq-bevel-hi)',
    color: active ? '#f0e060' : 'var(--eq-text-dim)',
    fontSize: '10px',
    padding: '3px 7px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    whiteSpace: 'nowrap' as const,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', color: 'var(--eq-text)', fontSize: '11px' }}>

      {/* ── Header banner ───────────────────────────────── */}
      <div style={{ background: 'linear-gradient(to right, #1a0e00, #2a1a00, #1a0e00)', padding: '6px 12px', borderBottom: '1px solid var(--eq-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ color: 'var(--eq-gold)', fontWeight: 'bold', fontSize: '13px', letterSpacing: '0.1em' }}>
            WORLD RANKINGS
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--eq-text-dim)', fontSize: '10px' }}>
              {onlineCount} online
            </span>
            <a
              href="/rankings.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--eq-gold)', fontSize: '9px', letterSpacing: '0.05em', textDecoration: 'none', border: '1px solid var(--eq-gold-dim)', padding: '1px 6px', cursor: 'pointer' }}
              title="Open full rankings website"
            >
              ↗ FULL SITE
            </a>
          </div>
        </div>
        <div style={{ color: 'var(--eq-text-dim)', fontSize: '9px', marginTop: '1px', letterSpacing: '0.05em' }}>
          ANTONICA · FAYDWER · KUNARK · VELIOUS
        </div>
      </div>

      {/* ── Category selector ───────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', padding: '5px 6px', borderBottom: '1px solid var(--eq-border)', flexShrink: 0, background: '#0c0a06' }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            style={catBtnStyle(category === c.id)}
            title={c.desc}
            onClick={() => {
              if (category === c.id) {
                setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
              } else {
                setCategory(c.id);
                setSortDir('desc');
              }
            }}
          >
            {c.label}
            {category === c.id && (
              <span style={{ marginLeft: 3, fontSize: '8px' }}>{sortDir === 'desc' ? '▼' : '▲'}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Filter bar ──────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '4px 6px', borderBottom: '1px solid var(--eq-border)', flexShrink: 0 }}>
        <input
          type="text"
          placeholder="Filter by name, class, race…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            flex: 1,
            background: '#080604',
            border: '1px solid var(--eq-border)',
            color: 'var(--eq-text)',
            padding: '2px 6px',
            fontSize: '10px',
            fontFamily: 'inherit',
          }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--eq-text-dim)', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <input
            type="checkbox"
            checked={showOffline}
            onChange={(e) => setShowOffline(e.target.checked)}
            style={{ accentColor: 'var(--eq-gold)' }}
          />
          Show Offline
        </label>
      </div>

      {/* ── Rankings table ──────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '36px' }} />
            <col style={{ width: '30px' }} />
            <col />
            <col style={{ width: '70px' }} />
            <col style={{ width: '30px' }} />
            <col style={{ width: '70px' }} />
            <col style={{ width: '55px' }} />
          </colgroup>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr style={{ background: '#181208', borderBottom: '1px solid var(--eq-border)' }}>
              <th style={{ padding: '3px 4px', color: 'var(--eq-text-dim)', fontWeight: 'normal', textAlign: 'center', fontSize: '9px' }}>Rank</th>
              <th style={{ padding: '3px 4px', color: 'var(--eq-text-dim)', fontWeight: 'normal', fontSize: '9px' }}></th>
              <th style={{ padding: '3px 4px', color: 'var(--eq-text-dim)', fontWeight: 'normal', textAlign: 'left', fontSize: '9px' }}>Name</th>
              <th style={{ padding: '3px 4px', color: 'var(--eq-text-dim)', fontWeight: 'normal', textAlign: 'left', fontSize: '9px' }}>Class</th>
              <th style={{ padding: '3px 4px', color: 'var(--eq-text-dim)', fontWeight: 'normal', textAlign: 'center', fontSize: '9px' }}>Lv</th>
              <th style={{ padding: '3px 4px', color: 'var(--eq-text-dim)', fontWeight: 'normal', textAlign: 'left', fontSize: '9px' }}>Zone</th>
              <th style={{ padding: '3px 4px', color: 'var(--eq-gold)', fontWeight: 'bold', textAlign: 'right', fontSize: '9px', letterSpacing: '0.05em' }}>
                {CATEGORIES.find((c) => c.id === category)?.label}
              </th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((entry, idx) => {
              const clsColor = CLASS_COLOR[entry.cls] ?? 'var(--eq-text)';
              const clsIcon = CLASS_ICONS[entry.cls] ?? '?';
              const isMe = entry.isPlayer;
              return (
                <tr
                  key={entry.id}
                  style={{
                    background: isMe
                      ? 'rgba(180, 140, 20, 0.08)'
                      : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                    borderBottom: '1px solid #151008',
                    opacity: entry.isOnline ? 1 : 0.45,
                    outline: isMe ? '1px solid rgba(180,140,20,0.3)' : 'none',
                  }}
                >
                  <td style={{ padding: '3px 4px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <MedalBadge rank={idx + 1} />
                  </td>
                  <td style={{ padding: '3px 2px', textAlign: 'center', fontSize: '13px' }}>
                    <span title={entry.cls}>{clsIcon}</span>
                  </td>
                  <td style={{ padding: '3px 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ color: isMe ? 'var(--eq-gold)' : 'var(--eq-text)', fontWeight: isMe ? 'bold' : 'normal' }}>
                      {isMe ? '★ ' : ''}{entry.name}
                    </span>
                    {!entry.isOnline && (
                      <span style={{ color: '#3a3028', fontSize: '9px', marginLeft: 3 }}>○</span>
                    )}
                  </td>
                  <td style={{ padding: '3px 4px', color: clsColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '10px' }}>
                    {entry.cls}
                  </td>
                  <td style={{ padding: '3px 4px', textAlign: 'center', color: 'var(--eq-text-dim)' }}>
                    {entry.level}
                  </td>
                  <td style={{ padding: '3px 4px', color: 'var(--eq-text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '10px' }}>
                    {entry.zone.replace(/_/g, ' ')}
                  </td>
                  <td style={{ padding: '3px 6px', textAlign: 'right', color: category === 'level' ? 'var(--eq-gold)' : 'var(--eq-text)', fontWeight: idx < 3 ? 'bold' : 'normal' }}>
                    {getRankDisplay(entry, category)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {ranked.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--eq-text-dim)', padding: '20px', fontStyle: 'italic' }}>
            No players match your filter.
          </div>
        )}
      </div>

      {/* ── Footer stat ─────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--eq-border)', padding: '4px 8px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--eq-text-dim)', background: '#0c0a06' }}>
        <span>Showing {ranked.length} of {allEntries.length} characters</span>
        <span style={{ color: 'var(--eq-gold)' }}>EverQuest Idle</span>
      </div>
    </div>
  );
}
