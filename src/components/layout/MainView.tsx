import { useGameStore } from '../../store/gameStore';
import { HpBar } from '../ui/HpBar';

export function MainView() {
  const currentZone = useGameStore((s) => s.currentZone);
  const combat = useGameStore((s) => s.combat);
  const player = useGameStore((s) => s.player);
  const toggleAutoCombat = useGameStore((s) => s.toggleAutoCombat);

  return (
    <main
      className="flex flex-col flex-1 overflow-hidden"
      style={{ backgroundColor: 'var(--eq-bg)', color: 'var(--eq-text)' }}
    >
      {/* Zone header */}
      <div
        className="px-4 py-2 border-b text-sm"
        style={{ borderColor: 'var(--eq-border)', backgroundColor: 'var(--eq-panel)' }}
      >
        <span style={{ color: 'var(--eq-gold)' }} className="font-bold">
          {currentZone.name}
        </span>
        <span style={{ color: 'var(--eq-text-dim)' }} className="ml-2 text-xs">
          ({currentZone.continent} — {currentZone.type} — Levels {currentZone.levelRange.min}-{currentZone.levelRange.max})
        </span>
      </div>

      {/* Zone art placeholder */}
      <div
        className="flex items-center justify-center flex-1 text-2xl font-bold border-b"
        style={{
          minHeight: '200px',
          borderColor: 'var(--eq-border)',
          backgroundColor: '#0d0b08',
          color: 'var(--eq-text-dim)',
          fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
        }}
      >
        [ {currentZone.name} ]
      </div>

      {/* Combat area */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--eq-border)' }}>
        {combat.currentMonster ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded border flex items-center justify-center text-xs"
                style={{ borderColor: 'var(--eq-border)', backgroundColor: 'var(--eq-panel)' }}
              >
                👾
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm" style={{ color: 'var(--eq-orange)' }}>
                  {combat.currentMonster.name}
                </div>
                <div className="text-xs" style={{ color: 'var(--eq-text-dim)' }}>
                  Level {Math.floor((combat.currentMonster.levelRange.min + combat.currentMonster.levelRange.max) / 2)} — {combat.currentMonster.type}
                </div>
                <HpBar
                  current={combat.monsterCurrentHp}
                  max={combat.currentMonster.hp}
                  colorClass="hp"
                  showText
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-center py-2" style={{ color: 'var(--eq-text-dim)' }}>
            {combat.autoAttacking ? 'Searching for enemies...' : 'No target. Toggle AUTO COMBAT to engage.'}
          </div>
        )}

        {/* Player HP/Mana quick view */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <HpBar current={player.stats.hp} max={player.stats.maxHp} label="HP" colorClass="hp" />
          <HpBar current={player.stats.mana} max={player.stats.maxMana} label="Mana" colorClass="mana" />
        </div>

        {/* XP Bar */}
        <div className="mt-2">
          <HpBar current={player.xp} max={player.xpToNextLevel} label={`XP (Lv ${player.level})`} colorClass="xp" showText />
        </div>

        {/* Auto combat toggle */}
        <button
          onClick={toggleAutoCombat}
          className="mt-3 w-full py-2 text-sm font-bold rounded border transition-all"
          style={{
            backgroundColor: combat.autoAttacking ? '#1a4a1a' : '#2a2218',
            borderColor: combat.autoAttacking ? '#2d8a2d' : 'var(--eq-border)',
            color: combat.autoAttacking ? '#5ddb5d' : 'var(--eq-text)',
          }}
        >
          {combat.autoAttacking ? '⚔️ AUTO COMBAT ON' : '⚔️ AUTO COMBAT OFF'}
        </button>
      </div>
    </main>
  );
}
