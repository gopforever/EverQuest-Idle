import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { CombatLogEntry } from '../../types';

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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatLog]);

  return (
    <div
      className="border-t p-2 overflow-y-auto"
      style={{
        borderColor: 'var(--eq-border)',
        backgroundColor: 'var(--eq-panel)',
        height: '160px',
        minHeight: '160px',
      }}
    >
      <div
        className="text-xs font-bold mb-1"
        style={{ color: 'var(--eq-gold)' }}
      >
        COMBAT LOG
      </div>
      <div className="space-y-0.5">
        {combatLog.map((entry) => (
          <div
            key={entry.id}
            className="text-xs leading-tight"
            style={getEntryStyle(entry.type)}
          >
            {entry.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
