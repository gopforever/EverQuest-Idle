import { useGameStore } from '../../store/gameStore';
import { EQPanelHeader } from '../ui/EQPanelHeader';
import { getSortedFactionStandings } from '../../engine/factionEngine';

const STANDING_COLORS: Record<string, string> = {
  Ally:          '#44ffaa',
  Warmly:        '#44cc88',
  Kindly:        '#88dd44',
  Amiable:       '#cccc44',
  Indifferent:   '#aaaaaa',
  Apprehensive:  '#cc8844',
  Dubious:       '#cc6644',
  Glaring:       '#cc4444',
  Scowling:      '#ff2222',
};

const STANDING_BG: Record<string, string> = {
  Ally:          '#0a2a1a',
  Warmly:        '#0a2210',
  Kindly:        '#0a1a08',
  Amiable:       '#1a1a08',
  Indifferent:   '#111111',
  Apprehensive:  '#1a1008',
  Dubious:       '#1a0808',
  Glaring:       '#1a0404',
  Scowling:      '#220404',
};

export function FactionsPanel() {
  const factionStandings = useGameStore((s) => s.factionStandings);
  const standings = getSortedFactionStandings(factionStandings);

  // Group by positive/negative
  const positive = standings.filter((s) => s.value >= 100);
  const neutral  = standings.filter((s) => s.value > -100 && s.value < 100);
  const negative = standings.filter((s) => s.value <= -100);

  function FactionRow({ name, value, standing }: { id: string; name: string; value: number; standing: string }) {
    const color = STANDING_COLORS[standing] ?? '#aaa';
    const bg    = STANDING_BG[standing] ?? '#111';
    const bar   = Math.max(0, Math.min(100, ((value + 2000) / 4000) * 100));

    return (
      <div
        style={{
          padding: '5px 8px',
          borderBottom: '1px solid var(--eq-border)',
          backgroundColor: bg,
        }}
        title={`${name}: ${standing} (${value > 0 ? '+' : ''}${value})`}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--eq-text)', fontWeight: value >= 100 || value <= -100 ? 'bold' : 'normal' }}>
            {name}
          </div>
          <div style={{ fontSize: '10px', color, fontWeight: 'bold', flexShrink: 0, marginLeft: '6px' }}>
            {standing}
          </div>
        </div>
        <div style={{ marginTop: '3px', height: '3px', backgroundColor: '#222', borderRadius: '2px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${bar}%`,
              backgroundColor: color,
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>
    );
  }

  const allEmpty = Object.keys(factionStandings).length === 0;

  return (
    <div className="flex-1 overflow-y-auto" style={{ color: 'var(--eq-text)', display: 'flex', flexDirection: 'column' }}>
      <EQPanelHeader title="FACTION STANDINGS" />

      {allEmpty ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--eq-text-dim)', fontSize: '11px' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚖</div>
          <div>Create a character to see faction standings.</div>
        </div>
      ) : (
        <>
          {/* Friendly */}
          {positive.length > 0 && (
            <>
              <div
                style={{
                  padding: '3px 8px',
                  fontSize: '9px',
                  color: '#44cc88',
                  backgroundColor: '#0a1a0a',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid var(--eq-border)',
                }}
              >
                Friendly ({positive.length})
              </div>
              {positive.map((s) => <FactionRow key={s.id} {...s} />)}
            </>
          )}

          {/* Neutral */}
          {neutral.length > 0 && (
            <>
              <div
                style={{
                  padding: '3px 8px',
                  fontSize: '9px',
                  color: '#aaa',
                  backgroundColor: '#111',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid var(--eq-border)',
                }}
              >
                Neutral ({neutral.length})
              </div>
              {neutral.map((s) => <FactionRow key={s.id} {...s} />)}
            </>
          )}

          {/* Hostile */}
          {negative.length > 0 && (
            <>
              <div
                style={{
                  padding: '3px 8px',
                  fontSize: '9px',
                  color: '#cc4444',
                  backgroundColor: '#1a0a0a',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid var(--eq-border)',
                }}
              >
                Hostile ({negative.length})
              </div>
              {negative.map((s) => <FactionRow key={s.id} {...s} />)}
            </>
          )}

          {/* Legend */}
          <div
            style={{
              padding: '6px 8px',
              borderTop: '1px solid var(--eq-border)',
              fontSize: '9px',
              color: 'var(--eq-text-dim)',
              lineHeight: 1.8,
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '3px', color: 'var(--eq-gold)' }}>Standing Thresholds</div>
            {[
              ['Ally', '> +1050'],
              ['Warmly', '> +700'],
              ['Kindly', '> +450'],
              ['Amiable', '> +100'],
              ['Indifferent', '0'],
              ['Apprehensive', '< 0'],
              ['Dubious', '< -100 (KOS)'],
              ['Glaring', '< -500 (KOS)'],
              ['Scowling', '< -750 (KOS)'],
            ].map(([label, range]) => (
              <div key={label} style={{ display: 'flex', gap: '6px' }}>
                <span style={{ color: STANDING_COLORS[label] ?? '#aaa', minWidth: '80px' }}>{label}</span>
                <span style={{ color: '#666' }}>{range}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
