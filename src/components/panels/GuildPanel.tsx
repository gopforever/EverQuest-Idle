import { useGameStore } from '../../store/gameStore';
import { EQPanelHeader } from '../ui/EQPanelHeader';

export function GuildPanel() {
  const combatLog = useGameStore((s) => s.combatLog);
  const ghosts = useGameStore((s) => s.ghosts);

  // Find last 5 system log entries that mention a ghost name
  const ghostNames = new Set(ghosts.map((g) => g.name));
  const guildActivity = combatLog
    .filter((e) => e.type === 'system' && Array.from(ghostNames).some((n) => e.message.includes(n)))
    .slice(-5)
    .reverse();

  const btnStyle: React.CSSProperties = {
    backgroundColor: 'var(--eq-panel)',
    border: '1px solid var(--eq-border)',
    color: 'var(--eq-gold)',
    padding: '4px 14px',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'inherit',
    borderRadius: '2px',
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ color: 'var(--eq-text)' }}>
      <EQPanelHeader title="GUILD ROSTER" />

      {/* No-guild empty state */}
      <div className="p-4 text-center">
        <div className="text-xs mb-1" style={{ color: 'var(--eq-text-dim)' }}>Guild Name:</div>
        <div className="text-sm font-bold mb-4" style={{ color: 'var(--eq-gold)' }}>&lt;No Guild&gt;</div>
        <div className="text-xs mb-4 italic" style={{ color: 'var(--eq-text-dim)', lineHeight: '1.5' }}>
          You are not in a guild. Seek out a recruiter in the lands of Norrath,
          or gather your allies and found one yourself.
        </div>
        <div className="flex gap-2 justify-center">
          <button style={btnStyle} onClick={() => undefined}>[FORM GUILD]</button>
          <button style={btnStyle} onClick={() => undefined}>[JOIN GUILD]</button>
        </div>
      </div>

      {/* Guild Activity Feed */}
      <EQPanelHeader title="GUILD ACTIVITY FEED" />
      <div className="p-2 text-xs space-y-1">
        {guildActivity.length > 0 ? (
          guildActivity.map((e) => (
            <div key={e.id} style={{ color: 'var(--eq-text-dim)', fontStyle: 'italic' }}>
              {e.message}
            </div>
          ))
        ) : (
          <div className="text-center py-2" style={{ color: 'var(--eq-text-dim)' }}>
            No recent guild activity.
          </div>
        )}
      </div>
    </div>
  );
}
