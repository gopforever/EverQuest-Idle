import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { CombatLogEntry } from '../../types';

type Filter = 'ALL' | 'COMBAT' | 'LOOT' | 'SYSTEM';

const FILTER_TYPES: Record<Filter, CombatLogEntry['type'][] | null> = {
  ALL: null,
  COMBAT: ['hit', 'miss', 'spell', 'death'],
  LOOT: ['loot'],
  SYSTEM: ['system', 'xp'],
};

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `[${hh}:${mm}:${ss}]`;
}

function getEntryColor(type: CombatLogEntry['type']): string {
  switch (type) {
    case 'hit': return '#e8dcc8';
    case 'miss': return '#9a8870';
    case 'spell': return '#6699ff';
    case 'death': return '#cc3333';
    case 'loot': return '#d4a520';
    case 'xp': return '#33cc33';
    case 'system': return '#9a8870';
    default: return '#e8dcc8';
  }
}

function getEntryStyle(type: CombatLogEntry['type']): React.CSSProperties {
  return {
    color: getEntryColor(type),
    fontStyle: type === 'system' ? 'italic' : 'normal',
  };
}

export function CombatLog() {
  const combatLog = useGameStore((s) => s.combatLog);
  const clearCombatLog = useGameStore((s) => s.clearCombatLog);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [autoScroll, setAutoScroll] = useState(true);

  const filteredEntries = FILTER_TYPES[filter] === null
    ? combatLog
    : combatLog.filter((e) => (FILTER_TYPES[filter] as CombatLogEntry['type'][]).includes(e.type));

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [combatLog, autoScroll]);

  const filterBtnStyle = (f: Filter): React.CSSProperties => ({
    background: 'none',
    border: 'none',
    borderBottom: filter === f ? '2px solid var(--eq-gold)' : '2px solid transparent',
    color: filter === f ? 'var(--eq-gold)' : 'var(--eq-text-dim)',
    padding: '1px 6px',
    cursor: 'pointer',
    fontSize: '10px',
    fontFamily: 'inherit',
  });

  return (
    <div
      className="border-t"
      style={{
        borderColor: 'var(--eq-border)',
        backgroundColor: 'var(--eq-panel)',
        height: '160px',
        minHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header row */}
      <div
        className="flex items-center justify-between px-2 py-0.5 border-b flex-shrink-0"
        style={{ borderColor: 'var(--eq-border)' }}
      >
        <span className="text-xs font-bold" style={{ color: 'var(--eq-gold)' }}>COMBAT LOG</span>
        <div className="flex items-center gap-1">
          {(['ALL', 'COMBAT', 'LOOT', 'SYSTEM'] as Filter[]).map((f) => (
            <button key={f} style={filterBtnStyle(f)} onClick={() => setFilter(f)}>{f}</button>
          ))}
          <button
            style={{
              background: 'none',
              border: '1px solid var(--eq-border)',
              color: autoScroll ? 'var(--eq-gold)' : 'var(--eq-text-dim)',
              padding: '0 4px',
              cursor: 'pointer',
              fontSize: '10px',
              fontFamily: 'inherit',
            }}
            onClick={() => setAutoScroll((v) => !v)}
            title="Toggle auto-scroll"
          >
            ↓Auto
          </button>
          <button
            style={{
              background: 'none',
              border: '1px solid var(--eq-border)',
              color: 'var(--eq-text-dim)',
              padding: '0 4px',
              cursor: 'pointer',
              fontSize: '10px',
              fontFamily: 'inherit',
            }}
            onClick={clearCombatLog}
            title="Clear log"
          >
            Clear
          </button>
        </div>
      </div>
      {/* Log entries */}
      <div className="overflow-y-auto flex-1 p-1 space-y-0.5">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="text-xs leading-tight"
            style={getEntryStyle(entry.type)}
          >
            <span style={{ color: '#5a4e3a', marginRight: '4px' }}>
              {formatTimestamp(entry.timestamp)}
            </span>
            {entry.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
