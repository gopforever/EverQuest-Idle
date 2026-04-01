import { useGameStore } from '../../store/gameStore';
import { HpBar } from '../ui/HpBar';
import { calcWeaponSwingInterval } from '../../engine/combat';

const ZONE_ICONS: Record<string, string> = {
  dungeon: '☠',
  city:    '⌂',
  raid:    '⚔',
  plane:   '✧',
  outdoor: '♦',
};

export function MainView() {
  const currentZone     = useGameStore((s) => s.currentZone);
  const combat          = useGameStore((s) => s.combat);
  const player          = useGameStore((s) => s.player);
  const tickCount       = useGameStore((s) => s.tickCount);
  const toggleAutoCombat = useGameStore((s) => s.toggleAutoCombat);

  const weaponDelay     = player.gear['Primary']?.stats?.delay ?? 25;
  const swingInterval   = calcWeaponSwingInterval(weaponDelay);
  const ticksSinceSwing = tickCount - combat.lastSwingTick;
  const ticksUntilSwing = Math.max(0, swingInterval - ticksSinceSwing);

  const monsterHpPct = combat.currentMonster
    ? Math.max(0, Math.min(100, (combat.monsterCurrentHp / combat.currentMonster.hp) * 100))
    : 0;

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
        backgroundColor: 'var(--eq-bg)',
        color: 'var(--eq-text)',
      }}
    >
      {/* ── Zone window ─────────────────────────────────────────────── */}
      <div
        className="eq-window"
        style={{
          margin: '4px 4px 0',
          borderRadius: 0,
          padding: '0',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Title bar */}
        <div className="eq-title-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {ZONE_ICONS[currentZone.type] ?? '♦'}&nbsp;&nbsp;{currentZone.name.toUpperCase()}
          </span>
          <span style={{ fontSize: '9px', color: 'var(--eq-text-dim)', fontWeight: 'normal', letterSpacing: '0.04em' }}>
            {currentZone.continent} · L{currentZone.levelRange.min}–{currentZone.levelRange.max}
          </span>
        </div>

        {/* Zone description */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 12px',
            textAlign: 'center',
            gap: '6px',
            backgroundColor: 'var(--eq-bg)',
            borderBottom: '1px solid var(--eq-bevel-lo)',
            minHeight: 0,
          }}
        >
          <div style={{ fontSize: '36px', opacity: 0.6, lineHeight: 1, color: 'var(--eq-text-dim)' }}>
            {ZONE_ICONS[currentZone.type] ?? '♦'}
          </div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--eq-gold)',
              textShadow: '0 0 10px rgba(180,120,0,0.4)',
            }}
          >
            {currentZone.name}
          </div>
          {currentZone.description && (
            <div style={{ fontSize: '11px', color: 'var(--eq-text-dim)', maxWidth: '320px', lineHeight: 1.5, fontStyle: 'italic' }}>
              {currentZone.description}
            </div>
          )}
          <div
            style={{
              fontSize: '9px',
              color: 'var(--eq-text-dim)',
              border: '1px solid var(--eq-bevel-lo)',
              padding: '2px 10px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            ZEM {currentZone.zem} · {currentZone.type.toUpperCase()}
          </div>
        </div>

        {/* ── Combat section ────────────────────────────────────────── */}
        <div style={{ padding: '6px 8px', backgroundColor: 'var(--eq-panel)' }}>

          {combat.currentMonster ? (
            <div>
              {/* Monster name row */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: monsterHpPct < 20 ? '#dd3333' : 'var(--eq-orange)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {combat.currentMonster.name}
                </span>
                {combat.currentMonsterLevel > 0 && (
                  <span style={{ fontSize: '10px', color: 'var(--eq-text-dim)' }}>
                    (Lv {combat.currentMonsterLevel})
                  </span>
                )}
                <span
                  style={{
                    fontSize: '9px',
                    color: 'var(--eq-text-dim)',
                    textTransform: 'capitalize',
                    marginLeft: 'auto',
                  }}
                >
                  {combat.currentMonster.type}
                </span>
              </div>

              {/* Monster HP bar — thicker, labeled */}
              <HpBar
                current={combat.monsterCurrentHp}
                max={combat.currentMonster.hp}
                label="HP"
                colorClass="enemy"
                showText
                height={14}
              />

              {/* Swing timer */}
              {combat.autoAttacking && (
                <div style={{ fontSize: '9px', color: 'var(--eq-text-dim)', marginTop: '3px', textAlign: 'right', fontStyle: 'italic' }}>
                  {ticksUntilSwing === 0 ? '⚔ Swinging…' : `Next swing: ${ticksUntilSwing}s`}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--eq-text-dim)', padding: '4px 0', fontStyle: 'italic' }}>
              {combat.autoAttacking ? 'Searching for enemies…' : 'No target selected.'}
            </div>
          )}

          <div className="eq-divider" style={{ margin: '6px 0' }} />

          {/* ── Player vital bars ─────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '4px' }}>
            <HpBar current={player.stats.hp}   max={player.stats.maxHp}   label="HP"   colorClass="hp"   showText height={13} />
            <HpBar current={player.stats.mana} max={player.stats.maxMana} label="Mana" colorClass="mana" showText height={13} />
          </div>
          <HpBar
            current={player.xp}
            max={player.xpToNextLevel}
            label={`XP — Level ${player.level}`}
            colorClass="xp"
            showText
            height={11}
          />

          {/* ── Currency row ────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
            <div style={{ fontSize: '10px', color: 'var(--eq-text-dim)', letterSpacing: '0.03em' }}>
              {player.currency.pp > 0 && <span style={{ color: '#d4a520' }}>{player.currency.pp}<span style={{ fontSize: '8px' }}>pp</span> </span>}
              {player.currency.gp > 0 && <span style={{ color: '#cc8800' }}>{player.currency.gp}<span style={{ fontSize: '8px' }}>gp</span> </span>}
              {player.currency.sp > 0 && <span style={{ color: '#aaaaaa' }}>{player.currency.sp}<span style={{ fontSize: '8px' }}>sp</span> </span>}
              <span style={{ color: '#886633' }}>{player.currency.cp}<span style={{ fontSize: '8px' }}>cp</span></span>
            </div>
            {player.deathCount > 0 && (
              <span style={{ fontSize: '10px', color: '#cc3333' }}>
                Deaths: {player.deathCount}
              </span>
            )}
          </div>

          {/* ── Auto combat toggle ──────────────────────────────── */}
          <button
            onClick={toggleAutoCombat}
            className={`eq-btn ${combat.autoAttacking ? 'eq-btn-active' : ''}`}
            style={{ width: '100%', marginTop: '6px', padding: '5px', fontSize: '11px', letterSpacing: '0.12em' }}
          >
            {combat.autoAttacking ? '⚔ AUTO COMBAT : ON' : '⚔ AUTO COMBAT : OFF'}
          </button>
        </div>
      </div>

      {/* Small bottom padding */}
      <div style={{ height: '4px' }} />
    </main>
  );
}
