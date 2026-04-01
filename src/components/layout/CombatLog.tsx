import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { CombatLogEntry } from '../../types';

type Filter = 'ALL' | 'COMBAT' | 'LOOT' | 'SYSTEM';

const FILTER_TYPES: Record<Filter, CombatLogEntry['type'][] | null> = {
  ALL:    null,
  COMBAT: ['hit', 'miss', 'spell', 'death'],
  LOOT:   ['loot'],
  SYSTEM: ['system', 'xp'],
};

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function getEntryColor(type: CombatLogEntry['type']): string {
  switch (type) {
    case 'hit':    return '#e0d8c0';
    case 'miss':   return '#7a6e58';
    case 'spell':  return '#88aaff';
    case 'death':  return '#ff4444';
    case 'loot':   return '#ddaa22';
    case 'xp':     return '#44cc44';
    case 'system': return '#8a7e66';
    default:       return '#c8c0a8';
  }
}

const FILTER_LABELS: Filter[] = ['ALL', 'COMBAT', 'LOOT', 'SYSTEM'];

export function CombatLog() {
  const combatLog    = useGameStore((s) => s.combatLog);
  const clearCombatLog = useGameStore((s) => s.clearCombatLog);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const [filter, setFilter]         = useState<Filter>('ALL');
  const [autoScroll, setAutoScroll] = useState(true);

  const filteredEntries = FILTER_TYPES[filter] === null
    ? combatLog
    : combatLog.filter((e) => (FILTER_TYPES[filter] as CombatLogEntry['type'][]).includes(e.type));

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [combatLog, autoScroll]);

  return (
    <div
      className="eq-window"
      style={{
        margin: '0 4px 4px',
        borderRadius: 0,
        height: '170px',
        minHeight: '170px',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Title / controls bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2px 6px',
          background: 'linear-gradient(to bottom, #1e1608 0%, #0e0c04 100%)',
          borderBottom: '1px solid var(--eq-bevel-lo)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--eq-gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Chat / Combat Log
        </span>
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
          {FILTER_LABELS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: filter === f ? '1px solid var(--eq-gold)' : '1px solid transparent',
                color: filter === f ? 'var(--eq-gold)' : 'var(--eq-text-dim)',
                padding: '0 5px',
                cursor: 'pointer',
                fontSize: '9px',
                fontFamily: 'inherit',
                letterSpacing: '0.05em',
              }}
            >
              {f}
            </button>
          ))}
          <div style={{ width: '1px', background: 'var(--eq-bevel-lo)', height: '10px', margin: '0 2px' }} />
          <button
            onClick={() => setAutoScroll((v) => !v)}
            title="Toggle auto-scroll"
            style={{
              background: 'none',
              border: `1px solid ${autoScroll ? 'var(--eq-border)' : 'var(--eq-bevel-lo)'}`,
              color: autoScroll ? 'var(--eq-gold)' : 'var(--eq-text-dim)',
              padding: '0 4px',
              cursor: 'pointer',
              fontSize: '9px',
              fontFamily: 'inherit',
            }}
          >
            ↓
          </button>
          <button
            onClick={clearCombatLog}
            title="Clear log"
            style={{
              background: 'none',
              border: '1px solid var(--eq-bevel-lo)',
              color: 'var(--eq-text-dim)',
              padding: '0 4px',
              cursor: 'pointer',
              fontSize: '9px',
              fontFamily: 'inherit',
            }}
          >
            CLR
          </button>
        </div>
      </div>

      {/* Entries */}
      <div
        className="eq-chat"
        style={{ overflowY: 'auto', flex: 1, padding: '3px 6px' }}
      >
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            style={{
              fontSize: '11px',
              lineHeight: '1.4',
              color: getEntryColor(entry.type),
              fontStyle: entry.type === 'system' ? 'italic' : 'normal',
              wordBreak: 'break-word',
            }}
          >
            <span style={{ color: '#3a3228', fontSize: '10px', marginRight: '5px', fontFamily: 'monospace' }}>
              [{formatTimestamp(entry.timestamp)}]
            </span>
            {entry.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
