interface HpBarProps {
  current: number;
  max: number;
  label?: string;
  colorClass?: 'hp' | 'mana' | 'xp';
  showText?: boolean;
}

export function HpBar({ current, max, label, colorClass = 'hp', showText = true }: HpBarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;

  const getBarColor = () => {
    if (colorClass === 'mana') return 'bg-blue-600';
    if (colorClass === 'xp') return 'bg-yellow-500';
    if (pct > 75) return 'bg-green-600';
    if (pct > 50) return 'bg-yellow-500';
    if (pct > 25) return 'bg-orange-500';
    return 'bg-red-600';
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs mb-0.5" style={{ color: 'var(--eq-text-dim)' }}>
          <span>{label}</span>
          {showText && <span>{current}/{max}</span>}
        </div>
      )}
      <div className="w-full rounded-sm overflow-hidden" style={{ backgroundColor: '#1a1510', height: '10px', border: '1px solid var(--eq-border)' }}>
        <div
          className={`h-full transition-all duration-300 ${getBarColor()}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
