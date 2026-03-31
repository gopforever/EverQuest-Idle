import { useGameStore } from '../../store/gameStore';
import { HpBar } from '../ui/HpBar';
import { calcWeaponSwingInterval } from '../../engine/combat';

export function MainView() {
  const currentZone = useGameStore((s) => s.currentZone);
  const combat = useGameStore((s) => s.combat);
  const player = useGameStore((s) => s.player);
  const tickCount = useGameStore((s) => s.tickCount);
  const toggleAutoCombat = useGameStore((s) => s.toggleAutoCombat);

  const weaponDelay = player.gear['Primary']?.stats?.delay ?? 25;
  const swingInterval = calcWeaponSwingInterval(weaponDelay);
  const ticksSinceSwing = tickCount - combat.lastSwingTick;
  const ticksUntilSwing = Math.max(0, swingInterval - ticksSinceSwing);

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

      {/* Zone art / flavor area */}
      <div
        className="flex flex-col items-center justify-center flex-1 border-b px-6 text-center gap-2"
        style={{
          minHeight: '200px',
          borderColor: 'var(--eq-border)',
          backgroundColor: '#0d0b08',
          fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
        }}
      >
        <div style={{ fontSize: '28px' }}>
          {currentZone.type === 'dungeon' ? '🪦' :
           currentZone.type === 'city' ? '🏙️' :
           currentZone.type === 'raid' ? '⚔️' :
           currentZone.type === 'plane' ? '✨' : '🌿'}
        </div>
        <div className="text-xl font-bold" style={{ color: 'var(--eq-gold)' }}>
          {currentZone.name}
        </div>
        {currentZone.description && (
          <div className="text-sm max-w-sm" style={{ color: 'var(--eq-text-dim)', lineHeight: '1.5' }}>
            {currentZone.description}
          </div>
        )}
        <div className="text-xs mt-1 px-2 py-0.5 rounded" style={{ backgroundColor: '#1a1207', color: 'var(--eq-border)', border: '1px solid var(--eq-border)' }}>
          Levels {currentZone.levelRange.min}–{currentZone.levelRange.max} · ZEM {currentZone.zem}
        </div>
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
                  {combat.currentMonsterLevel > 0 && (
                    <span
                      className="ml-2 text-xs font-normal px-1 rounded"
                      style={{ backgroundColor: '#2a1f0a', color: 'var(--eq-gold)', border: '1px solid var(--eq-border)' }}
                    >
                      Lv{combat.currentMonsterLevel}
                    </span>
                  )}
                </div>
                <div className="text-xs" style={{ color: 'var(--eq-text-dim)' }}>
                  {combat.currentMonster.type}
                </div>
                <HpBar
                  current={combat.monsterCurrentHp}
                  max={combat.currentMonster.hp}
                  colorClass="hp"
                  showText
                />
                {/* Swing timer — each tick is 1 second, so ticks remaining equals seconds remaining */}
                {combat.autoAttacking && (
                  <div className="text-xs mt-1" style={{ color: 'var(--eq-text-dim)' }}>
                    {ticksUntilSwing === 0
                      ? 'Swinging...'
                      : `Next swing in ${ticksUntilSwing}s`}
                  </div>
                )}
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

        {/* Currency & Deaths */}
        <div className="mt-2 flex gap-3 text-xs" style={{ color: 'var(--eq-text-dim)' }}>
          <span>
            {player.currency.pp > 0 && `${player.currency.pp}pp `}
            {player.currency.gp > 0 && `${player.currency.gp}gp `}
            {player.currency.sp > 0 && `${player.currency.sp}sp `}
            {player.currency.cp}cp
          </span>
          <span style={{ color: '#a04040' }}>Deaths: {player.deathCount}</span>
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
