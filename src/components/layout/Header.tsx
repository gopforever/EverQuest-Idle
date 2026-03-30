interface HeaderProps {
  onHelp?: () => void;
  onOptions?: () => void;
  onPersona?: () => void;
}

export function Header({ onHelp, onOptions, onPersona }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-4 py-2 border-b"
      style={{
        backgroundColor: 'var(--eq-panel)',
        borderColor: 'var(--eq-border)',
        color: 'var(--eq-text)',
      }}
    >
      <div className="flex gap-2">
        {[['HELP', onHelp], ['OPTIONS', onOptions], ['PERSONA', onPersona]].map(([label, handler]) => (
          <button
            key={label as string}
            onClick={handler as () => void}
            className="px-3 py-1 text-xs rounded border transition-colors hover:opacity-80"
            style={{
              backgroundColor: '#2a2218',
              borderColor: 'var(--eq-border)',
              color: 'var(--eq-text)',
            }}
          >
            {label as string}
          </button>
        ))}
      </div>
      <h1
        className="text-xl font-bold tracking-wide"
        style={{ color: 'var(--eq-gold)', fontFamily: '"Palatino Linotype", Palatino, Georgia, serif' }}
      >
        ⚔️ EverQuest Idle
      </h1>
      <div className="text-xs" style={{ color: 'var(--eq-text-dim)' }}>
        Norrath awaits...
      </div>
    </header>
  );
}
