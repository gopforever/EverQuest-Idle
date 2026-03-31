import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { GhostPlayer, CharacterClass } from '../../types';

type SortKey = 'name' | 'level' | 'class' | 'zone' | 'status';
type SortDir = 'asc' | 'desc';

function getClassRole(cls: CharacterClass): 'tank' | 'healer' | 'dps' | 'support' {
  if (['Warrior', 'Paladin', 'ShadowKnight'].includes(cls as string)) return 'tank';
  if (['Cleric', 'Druid', 'Shaman'].includes(cls as string)) return 'healer';
  if (cls === 'Bard') return 'support';
  return 'dps';
}

function RoleBadge({ cls }: { cls: CharacterClass }) {
  const role = getClassRole(cls);
  if (role === 'tank') return <span style={{ color: '#4488ff', fontWeight: 'bold', marginLeft: 2 }}>[T]</span>;
  if (role === 'healer') return <span style={{ color: '#44cc44', fontWeight: 'bold', marginLeft: 2 }}>[H]</span>;
  if (role === 'support') return <span style={{ color: '#cc88ff', fontWeight: 'bold', marginLeft: 2 }}>[S]</span>;
  return null;
}

function sortGhosts(ghosts: GhostPlayer[], key: SortKey, dir: SortDir): GhostPlayer[] {
  return [...ghosts].sort((a, b) => {
    let cmp = 0;
    if (key === 'level') {
      cmp = a.level - b.level;
    } else if (key === 'status') {
      cmp = (a.isOnline ? 1 : 0) - (b.isOnline ? 1 : 0);
    } else {
      const av = key === 'zone' ? a.currentZone : key === 'class' ? a.class : a.name;
      const bv = key === 'zone' ? b.currentZone : key === 'class' ? b.class : b.name;
      cmp = av.localeCompare(bv);
    }
    return dir === 'asc' ? cmp : -cmp;
  });
}

export function WhoPanel() {
  const ghosts = useGameStore((s) => s.ghosts);
  const [filter, setFilter] = useState('');
  const [showOffline, setShowOffline] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('level');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const onlineCount = ghosts.filter((g) => g.isOnline).length;

  const visible = useMemo(() => {
    const query = filter.toLowerCase();
    const filtered = ghosts.filter((g) => {
      if (!showOffline && !g.isOnline) return false;
      if (query) {
        return g.name.toLowerCase().includes(query) || g.class.toLowerCase().includes(query);
      }
      return true;
    });
    return sortGhosts(filtered, sortKey, sortDir);
  }, [ghosts, filter, showOffline, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'level' ? 'desc' : 'asc');
    }
  }

  const thStyle = (key: SortKey): React.CSSProperties => ({
    cursor: 'pointer',
    color: sortKey === key ? 'var(--eq-gold)' : 'var(--eq-text-dim)',
    padding: '2px 4px',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  });

  return (
    <div className="flex-1 overflow-y-auto" style={{ color: 'var(--eq-text)', fontSize: '11px' }}>
      {/* Header */}
      <div
        className="text-xs font-bold text-center py-1"
        style={{ backgroundColor: '#2a1f0a', color: 'var(--eq-gold)', border: '1px solid var(--eq-border)' }}
      >
        {onlineCount} / 100 PLAYERS ONLINE
      </div>

      {/* Controls */}
      <div className="p-2 flex flex-col gap-1" style={{ borderBottom: '1px solid var(--eq-border)' }}>
        <input
          type="text"
          placeholder="Filter by name or class…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            backgroundColor: '#0d0b08',
            border: '1px solid var(--eq-border)',
            color: 'var(--eq-text)',
            padding: '2px 6px',
            fontSize: '11px',
            borderRadius: '2px',
            width: '100%',
            fontFamily: 'inherit',
          }}
        />
        <label className="flex items-center gap-1" style={{ color: 'var(--eq-text-dim)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showOffline}
            onChange={(e) => setShowOffline(e.target.checked)}
            style={{ accentColor: 'var(--eq-gold)' }}
          />
          Show Offline
        </label>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#1a1510' }}>
              {(
                [
                  { key: 'name', label: 'Name' },
                  { key: 'level', label: 'Lvl' },
                  { key: 'class', label: 'Class' },
                  { key: 'zone', label: 'Zone' },
                  { key: 'status', label: 'Status' },
                ] as { key: SortKey; label: string }[]
              ).map(({ key, label }) => (
                <th
                  key={key}
                  style={thStyle(key)}
                  onClick={() => handleSort(key)}
                >
                  {label}
                  {sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((ghost) => (
              <tr
                key={ghost.id}
                style={{
                  color: ghost.isOnline ? 'var(--eq-text)' : 'var(--eq-text-dim)',
                  borderBottom: '1px solid #1a1510',
                }}
              >
                <td style={{ padding: '2px 4px', whiteSpace: 'nowrap' }}>
                  {ghost.name}
                  {ghost.reputation?.title && (
                    <span style={{ color: '#aa8800', marginLeft: 4, fontSize: '10px' }}>
                      [{ghost.reputation.title}]
                    </span>
                  )}
                </td>
                <td style={{ padding: '2px 4px', textAlign: 'center' }}>{ghost.level}</td>
                <td style={{ padding: '2px 4px', whiteSpace: 'nowrap' }}>
                  {ghost.class}
                  <RoleBadge cls={ghost.class} />
                </td>
                <td style={{ padding: '2px 4px', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ghost.currentZone}
                </td>
                <td style={{ padding: '2px 4px', whiteSpace: 'nowrap' }}>
                  {ghost.isOnline ? (
                    <span style={{ color: '#44aa44' }}>● Online</span>
                  ) : (
                    <span style={{ color: 'var(--eq-text-dim)' }}>○ Offline</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div className="text-center p-4" style={{ color: 'var(--eq-text-dim)' }}>
            No players match your search.
          </div>
        )}
      </div>
    </div>
  );
}
