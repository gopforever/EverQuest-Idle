import { useGameStore } from '../../store/gameStore';
import { HpBar } from '../ui/HpBar';

export function RightPanel() {
  const player = useGameStore((s) => s.player);
  const ghosts = useGameStore((s) => s.ghosts);
  const combat = useGameStore((s) => s.combat);

  const onlineGhosts = ghosts.filter((g) => g.isOnline).slice(0, 5);

  return (
    <aside
      className="flex flex-col border-l"
      style={{
        width: '220px',
        minWidth: '220px',
        backgroundColor: 'var(--eq-panel)',
        borderColor: 'var(--eq-border)',
        color: 'var(--eq-text)',
      }}
    >
      {/* Group Window */}
      <div className="p-2 border-b" style={{ borderColor: 'var(--eq-border)' }}>
        <div
          className="text-xs font-bold mb-2 text-center py-1"
          style={{ backgroundColor: '#2a1f0a', color: 'var(--eq-gold)', border: '1px solid var(--eq-border)' }}
        >
          GROUP WINDOW
        </div>
        {/* Player row */}
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-0.5">
            <span style={{ color: 'var(--eq-gold)' }} className="font-bold truncate max-w-24">
              ★ {player.name}
            </span>
            <span style={{ color: 'var(--eq-text-dim)' }}>Lv{player.level}</span>
          </div>
          <HpBar current={player.stats.hp} max={player.stats.maxHp} colorClass="hp" showText={false} />
        </div>
        {/* Ghost rows */}
        {onlineGhosts.map((ghost) => (
          <div key={ghost.id} className="mb-2">
            <div className="flex justify-between text-xs mb-0.5">
              <span className="truncate max-w-24" style={{ color: 'var(--eq-text)' }}>
                {ghost.name}
              </span>
              <span style={{ color: 'var(--eq-text-dim)' }}>Lv{ghost.level}</span>
            </div>
            <HpBar current={ghost.stats.hp} max={ghost.stats.maxHp} colorClass="hp" showText={false} />
          </div>
        ))}
        {/* Empty slots */}
        {Array.from({ length: Math.max(0, 5 - onlineGhosts.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="mb-2">
            <div className="text-xs mb-0.5" style={{ color: 'var(--eq-text-dim)' }}>--- empty ---</div>
            <div className="h-2.5 rounded-sm" style={{ backgroundColor: '#1a1510', border: '1px solid var(--eq-border)' }} />
          </div>
        ))}
      </div>

      {/* Current Target */}
      <div className="p-2 border-b" style={{ borderColor: 'var(--eq-border)' }}>
        <div
          className="text-xs font-bold mb-2 text-center py-1"
          style={{ backgroundColor: '#2a1f0a', color: 'var(--eq-gold)', border: '1px solid var(--eq-border)' }}
        >
          CURRENT TARGET
        </div>
        {combat.currentMonster ? (
          <div>
            <div className="text-xs font-bold mb-1" style={{ color: 'var(--eq-orange)' }}>
              {combat.currentMonster.name}
            </div>
            <HpBar
              current={combat.monsterCurrentHp}
              max={combat.currentMonster.hp}
              label="HP"
              colorClass="hp"
            />
            <div className="mt-1 text-xs" style={{ color: 'var(--eq-text-dim)' }}>
              Type: {combat.currentMonster.type}
            </div>
          </div>
        ) : (
          <div className="text-xs text-center py-2" style={{ color: 'var(--eq-text-dim)' }}>
            No target
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="p-2 flex flex-col gap-1">
        <div
          className="text-xs font-bold mb-1 text-center py-1"
          style={{ backgroundColor: '#2a1f0a', color: 'var(--eq-gold)', border: '1px solid var(--eq-border)' }}
        >
          ACTIONS
        </div>
        {['ABILITIES', 'COMBAT'].map((label) => (
          <button
            key={label}
            className="w-full py-1 text-xs rounded border"
            style={{ backgroundColor: '#1a1510', borderColor: 'var(--eq-border)', color: 'var(--eq-text)' }}
          >
            {label}
          </button>
        ))}
      </div>
    </aside>
  );
}
