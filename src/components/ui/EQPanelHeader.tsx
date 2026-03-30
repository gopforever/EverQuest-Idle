export function EQPanelHeader({ title }: { title: string }) {
  return (
    <div
      className="text-xs font-bold text-center py-1 mb-2"
      style={{
        backgroundColor: '#2a1f0a',
        color: 'var(--eq-gold)',
        border: '1px solid var(--eq-border)',
        fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
        letterSpacing: '0.05em',
      }}
    >
      {title}
    </div>
  );
}
