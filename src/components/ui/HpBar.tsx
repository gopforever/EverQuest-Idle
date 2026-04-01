interface HpBarProps {
  current: number;
  max: number;
  label?: string;
  colorClass?: 'hp' | 'mana' | 'xp' | 'end' | 'enemy';
  showText?: boolean;
  height?: number;
}

export function HpBar({
  current,
  max,
  label,
  colorClass = 'hp',
  showText = false,
  height = 12,
}: HpBarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;

  const fillClass = {
    hp:    'eq-bar-hp',
    mana:  'eq-bar-mana',
    xp:    'eq-bar-xp',
    end:   'eq-bar-end',
    enemy: 'eq-bar-enemy',
  }[colorClass];

  const labelColor = {
    hp:    '#cc4444',
    mana:  '#4466cc',
    xp:    '#aa8800',
    end:   '#33aa66',
    enemy: '#cc4444',
  }[colorClass];

  return (
    <div className="w-full">
      {(label || showText) && (
        <div
          className="flex justify-between"
          style={{ fontSize: '9px', color: 'var(--eq-text-dim)', marginBottom: '1px', letterSpacing: '0.05em' }}
        >
          {label && <span style={{ color: labelColor, textTransform: 'uppercase', fontWeight: 'bold' }}>{label}</span>}
          {showText && (
            <span style={{ color: 'var(--eq-text-dim)' }}>
              {current.toLocaleString()}/{max.toLocaleString()}
            </span>
          )}
        </div>
      )}
      <div className="eq-bar-track" style={{ height: `${height}px` }}>
        <div className={`eq-bar-fill ${fillClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
