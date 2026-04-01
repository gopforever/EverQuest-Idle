import { useGameStore } from '../../store/gameStore';

export function Header() {
  const player = useGameStore((s) => s.player);
  const characterCreated = useGameStore((s) => s.characterCreated);

  return (
    <header
      style={{
        background: 'linear-gradient(to bottom, #181208 0%, #0c0a06 100%)',
        borderBottom: `1px solid var(--eq-bevel-lo)`,
        boxShadow: '0 1px 0 rgba(200,160,80,0.08), 0 2px 8px rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '3px 10px',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* Left — menu buttons */}
      <div style={{ display: 'flex', gap: '2px' }}>
        {['EQ', 'OPTIONS', 'HELP', 'PERSONA'].map((label) => (
          <button key={label} className="eq-btn" style={{ padding: '2px 8px', fontSize: '10px' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Center — logo */}
      <div
        style={{
          fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
          fontSize: '15px',
          fontWeight: 'bold',
          letterSpacing: '0.18em',
          color: 'var(--eq-gold)',
          textShadow: '0 0 12px rgba(200,140,0,0.5), 0 1px 3px rgba(0,0,0,1)',
          textTransform: 'uppercase',
        }}
      >
        EverQuest Idle
      </div>

      {/* Right — player tag */}
      <div
        style={{
          fontSize: '10px',
          color: 'var(--eq-text-dim)',
          letterSpacing: '0.05em',
          textAlign: 'right',
        }}
      >
        {characterCreated ? (
          <>
            <span style={{ color: 'var(--eq-gold)' }}>{player.name}</span>
            <span style={{ margin: '0 4px', color: 'var(--eq-bevel-lo)' }}>|</span>
            <span>Lv {player.level} {player.class}</span>
          </>
        ) : (
          <span style={{ color: 'var(--eq-text-dim)', fontStyle: 'italic' }}>Norrath awaits…</span>
        )}
      </div>
    </header>
  );
}
