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
  const currentZone      = useGameStore((s) => s.currentZone);
  const combat           = useGameStore((s) => s.combat);
  const player           = useGameStore((s) => s.player);
  const tickCount        = useGameStore((s) => s.tickCount);
  const toggleAutoCombat = useGameStore((s) => s.toggleAutoCombat);

  const weaponDelay      = player.gear['Primary']?.stats?.delay ?? 25;
  const swingInterval    = calcWeaponSwingInterval(weaponDelay);
  const ticksUntilSwing  = Math.max(0, swingInterval - (tickCount - combat.lastSwingTick));

  const monsterHpPct = combat.currentMonster
    ? Math.max(0, Math.min(100, combat.monsterCurrentHp / combat.currentMonster.hp * 100))
    : 0;

  return (
    <div
      className="eq-window"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 0,
        minHeight: 0,
      }}
    >
      {/* ── Zone title bar ──────────────────────────────────── */}
      <div
        className="eq-title-bar"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span>
          {ZONE_ICONS[currentZone.type] ?? '♦'}&nbsp;&nbsp;
          {currentZone.name.toUpperCase()}
        </span>
        <span style={{ fontSize: '9px', color: 'var(--eq-text-dim)', fontWeight: 'normal', letterSpacing: '0.04em' }}>
          {currentZone.continent} · L{currentZone.levelRange.min}–{currentZone.levelRange.max} · ZEM {currentZone.zem}
        </span>
      </div>

      {/* ── Zone art / description ──────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--eq-bg)',
          borderBottom: '1px solid var(--eq-bevel-lo)',
          padding: '8px',
          textAlign: 'center',
          gap: '4px',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <div style={{ fontSize: '32px', opacity: 0.4, lineHeight: 1, color: 'var(--eq-text-dim)' }}>
          {ZONE_ICONS[currentZone.type] ?? '♦'}
        </div>
        <div style={{
          fontSize: '13px',
          fontWeight: 'bold',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--eq-gold)',
          textShadow: '0 0 10px rgba(180,120,0,0.35)',
        }}>
          {currentZone.name}
        </div>
        {currentZone.description && (
          <div style={{
            fontSize: '10px',
            color: 'var(--eq-text-dim)',
            maxWidth: '400px',
            lineHeight: 1.5,
            fontStyle: 'italic',
          }}>
            {currentZone.description}
          </div>
        )}

        {/* ── Player name display (like EQ's overhead name) ── */}
        <div style={{
          fontSize: '11px',
          color: 'var(--eq-gold)',
          marginTop: '4px',
          letterSpacing: '0.06em',
          fontStyle: 'italic',
          opacity: 0.7,
        }}>
          {player.name}
        </div>
      </div>

      {/* ── Combat area ─────────────────────────────────────── */}
      <div style={{ padding: '6px 10px', backgroundColor: 'var(--eq-panel)', flexShrink: 0 }}>

        {/* Monster row */}
        {combat.currentMonster ? (
          <div style={{ marginBottom: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '3px' }}>
              <span style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: monsterHpPct < 20 ? '#dd3333' : 'var(--eq-orange)',
                letterSpacing: '0.03em',
              }}>
                {combat.currentMonster.name}
              </span>
              {combat.currentMonsterLevel > 0 && (
                <span style={{ fontSize: '10px', color: 'var(--eq-text-dim)' }}>
                  (Lv {combat.currentMonsterLevel})
                </span>
              )}
              <span style={{ fontSize: '9px', color: 'var(--eq-text-dim)', textTransform: 'capitalize', marginLeft: 'auto' }}>
                {combat.currentMonster.type}
              </span>
            </div>
            <HpBar current={combat.monsterCurrentHp} max={combat.currentMonster.hp} label="HP" colorClass="enemy" showText height={13} />
            {combat.autoAttacking && (
              <div style={{ fontSize: '9px', color: 'var(--eq-text-dim)', marginTop: '2px', textAlign: 'right', fontStyle: 'italic' }}>
                {ticksUntilSwing === 0 ? '⚔ Swinging…' : `Next swing: ${ticksUntilSwing}s`}
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '10px', color: 'var(--eq-text-dim)', textAlign: 'center', padding: '3px 0 5px', fontStyle: 'italic' }}>
            {combat.autoAttacking ? 'Searching for enemies…' : 'No target selected.'}
          </div>
        )}

        <div className="eq-divider" />

        {/* Player vital bars */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', margin: '5px 0 4px' }}>
          <HpBar current={player.stats.hp}   max={player.stats.maxHp}   label="HP"   colorClass="hp"   showText height={13} />
          <HpBar current={player.stats.mana} max={player.stats.maxMana} label="Mana" colorClass="mana" showText height={13} />
        </div>
        <HpBar current={player.xp} max={player.xpToNextLevel} label={`XP — Lv ${player.level}`} colorClass="xp" showText height={10} />

        {/* Currency + deaths */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: 'var(--eq-text-dim)' }}>
          <span>
            {player.currency.pp > 0 && <span style={{ color: '#d4a520' }}>{player.currency.pp}<small>pp</small> </span>}
            {player.currency.gp > 0 && <span style={{ color: '#cc8800' }}>{player.currency.gp}<small>gp</small> </span>}
            {player.currency.sp > 0 && <span style={{ color: '#aaa' }}>{player.currency.sp}<small>sp</small> </span>}
            <span style={{ color: '#886633' }}>{player.currency.cp}<small>cp</small></span>
          </span>
          {player.deathCount > 0 && (
            <span style={{ color: '#cc3333' }}>Deaths: {player.deathCount}</span>
          )}
        </div>

        {/* Auto-combat button */}
        <button
          onClick={toggleAutoCombat}
          className={`eq-btn ${combat.autoAttacking ? 'eq-btn-active' : ''}`}
          style={{ width: '100%', marginTop: '5px', padding: '4px', fontSize: '11px', letterSpacing: '0.1em' }}
        >
          {combat.autoAttacking ? '⚔ AUTO COMBAT : ON' : '⚔ AUTO COMBAT : OFF'}
        </button>
      </div>
    </div>
  );
}
