import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { HpBar } from '../ui/HpBar';
import { EQPanelHeader } from '../ui/EQPanelHeader';
import type { GhostPlayer, CharacterClass, EquipSlot } from '../../types';

const CASTER_CLASSES: CharacterClass[] = [
  'Wizard', 'Magician', 'Enchanter', 'Necromancer',
  'Cleric', 'Druid', 'Shaman', 'Bard',
];

const ALL_EQUIP_SLOTS: EquipSlot[] = [
  'Ear1', 'Head', 'Face', 'Neck', 'Shoulders', 'Arms', 'Back',
  'Wrist1', 'Wrist2', 'Range', 'Ear2', 'Chest', 'Hands',
  'Primary', 'Secondary', 'Fingers1', 'Fingers2', 'Legs', 'Feet', 'Waist', 'Ammo',
];

function getActivityText(activity: string): string {
  if (activity === 'Fighting') return 'Fighting...';
  if (activity === 'Idle') return 'Seeking group...';
  if (activity === 'Offline') return 'Offline';
  return `${activity}...`;
}

function GhostDetailModal({ ghost, onClose }: { ghost: GhostPlayer; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        className="eq-window"
        style={{
          padding: '0',
          minWidth: '300px', maxWidth: '380px',
          maxHeight: '80vh', overflowY: 'auto',
          borderRadius: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <EQPanelHeader title={`${ghost.name} — Lv ${ghost.level} ${ghost.class}`} />
        <div style={{ padding: '8px' }}>
          <div style={{ fontSize: '10px', color: 'var(--eq-text-dim)', marginBottom: '6px', letterSpacing: '0.05em' }}>
            {ghost.race} &nbsp;·&nbsp; {ghost.personality}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '8px' }}>
            <HpBar current={ghost.stats.hp}   max={ghost.stats.maxHp}   label="HP"   colorClass="hp"   showText height={13} />
            {CASTER_CLASSES.includes(ghost.class) && (
              <HpBar current={ghost.stats.mana} max={ghost.stats.maxMana} label="Mana" colorClass="mana" showText height={13} />
            )}
          </div>

          <div style={{ fontSize: '10px', color: 'var(--eq-text-dim)', marginBottom: '8px' }}>
            <div>Zone: <span style={{ color: 'var(--eq-text)' }}>{ghost.currentZone}</span></div>
            <div>Activity: <span style={{ color: 'var(--eq-text)' }}>{getActivityText(ghost.currentActivity)}</span></div>
          </div>

          <EQPanelHeader title="ATTRIBUTES" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', marginBottom: '8px' }}>
            {(['str', 'sta', 'agi', 'dex', 'wis', 'int', 'cha'] as const).map((s) => (
              <div key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 4px', fontSize: '10px' }}>
                <span style={{ color: 'var(--eq-text-dim)' }}>{s.toUpperCase()}</span>
                <span style={{ color: 'var(--eq-text)' }}>{ghost.stats[s]}</span>
              </div>
            ))}
          </div>

          <EQPanelHeader title="EQUIPMENT" />
          <div style={{ marginBottom: '8px' }}>
            {ALL_EQUIP_SLOTS.map((slot) => {
              const item = ghost.gear[slot];
              return (
                <div key={slot} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 4px', fontSize: '10px' }}>
                  <span style={{ color: 'var(--eq-text-dim)', minWidth: '70px' }}>{slot}</span>
                  <span style={{ color: item ? 'var(--eq-gold)' : '#3a3228', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                    {item ? item.name : '—'}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button className="eq-btn" onClick={onClose} style={{ padding: '4px 20px' }}>
              [CLOSE]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RightPanel() {
  const player  = useGameStore((s) => s.player);
  const ghosts  = useGameStore((s) => s.ghosts);
  const combat  = useGameStore((s) => s.combat);
  const toggleAutoCombat = useGameStore((s) => s.toggleAutoCombat);

  const [selectedGhost, setSelectedGhost] = useState<GhostPlayer | null>(null);
  const onlineGhosts = ghosts.filter((g) => g.isOnline).slice(0, 5);

  return (
    <aside
      className="eq-window"
      style={{
        width: '210px',
        minWidth: '210px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {selectedGhost && (
        <GhostDetailModal ghost={selectedGhost} onClose={() => setSelectedGhost(null)} />
      )}

      {/* ── Character info ──────────────────────────────────────── */}
      <div style={{ padding: '0' }}>
        <div className="eq-title-bar">Character</div>
        <div style={{ padding: '5px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--eq-gold)', letterSpacing: '0.05em' }}>
              {player.name}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--eq-text-dim)' }}>
              Lv {player.level}
            </span>
          </div>
          <div style={{ fontSize: '9px', color: 'var(--eq-text-dim)', marginBottom: '5px', letterSpacing: '0.04em' }}>
            {player.race} {player.class}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <HpBar current={player.stats.hp}   max={player.stats.maxHp}   label="HP"   colorClass="hp"   showText height={12} />
            {CASTER_CLASSES.includes(player.class) && (
              <HpBar current={player.stats.mana} max={player.stats.maxMana} label="Mana" colorClass="mana" showText height={12} />
            )}
            <HpBar current={player.xp} max={player.xpToNextLevel} label="XP" colorClass="xp" showText height={10} />
          </div>
        </div>
      </div>

      <div className="eq-divider" style={{ margin: '0 4px' }} />

      {/* ── Current Target ──────────────────────────────────────── */}
      <div style={{ padding: '0', flexShrink: 0 }}>
        <div className="eq-title-bar">Target</div>
        <div style={{ padding: '5px 8px', minHeight: '54px' }}>
          {combat.currentMonster ? (
            <>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--eq-orange)', marginBottom: '4px', letterSpacing: '0.03em' }}>
                {combat.currentMonster.name}
                {combat.currentMonsterLevel > 0 && (
                  <span style={{ fontWeight: 'normal', color: 'var(--eq-text-dim)', marginLeft: '5px', fontSize: '9px' }}>
                    (Lv {combat.currentMonsterLevel})
                  </span>
                )}
              </div>
              <HpBar
                current={combat.monsterCurrentHp}
                max={combat.currentMonster.hp}
                label="HP"
                colorClass="enemy"
                showText
                height={12}
              />
              <div style={{ fontSize: '9px', color: 'var(--eq-text-dim)', marginTop: '2px', textTransform: 'capitalize' }}>
                {combat.currentMonster.type}
              </div>
            </>
          ) : (
            <div style={{ fontSize: '10px', color: 'var(--eq-text-dim)', fontStyle: 'italic', paddingTop: '6px', textAlign: 'center' }}>
              No target
            </div>
          )}
        </div>
      </div>

      <div className="eq-divider" style={{ margin: '0 4px' }} />

      {/* ── Group Window ────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="eq-title-bar">Group</div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '5px 8px' }}>

          {/* Player row */}
          <div style={{ marginBottom: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
              <span style={{ color: 'var(--eq-gold)', fontWeight: 'bold' }}>★ {player.name}</span>
              <span style={{ color: 'var(--eq-text-dim)' }}>Lv{player.level}</span>
            </div>
            <HpBar current={player.stats.hp} max={player.stats.maxHp} colorClass="hp" height={8} />
          </div>

          {/* Ghost rows */}
          {onlineGhosts.map((ghost) => (
            <div
              key={ghost.id}
              style={{ marginBottom: '5px', cursor: 'pointer', opacity: 0.9 }}
              onClick={() => setSelectedGhost(ghost)}
              title={`Click to inspect ${ghost.name}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                <span style={{ color: 'var(--eq-text)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ghost.name}
                </span>
                <span style={{ color: 'var(--eq-text-dim)', fontSize: '9px' }}>Lv{ghost.level}</span>
              </div>
              <HpBar current={ghost.stats.hp} max={ghost.stats.maxHp} colorClass="hp" height={7} />
              {CASTER_CLASSES.includes(ghost.class) && (
                <div style={{ marginTop: '1px' }}>
                  <HpBar current={ghost.stats.mana} max={ghost.stats.maxMana} colorClass="mana" height={5} />
                </div>
              )}
              <div style={{ fontSize: '9px', color: 'var(--eq-text-dim)', fontStyle: 'italic', marginTop: '1px' }}>
                {getActivityText(ghost.currentActivity)}
              </div>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 5 - onlineGhosts.length) }).map((_, i) => (
            <div key={`empty-${i}`} style={{ marginBottom: '5px' }}>
              <div style={{ fontSize: '9px', color: '#2a2218', marginBottom: '2px' }}>— empty —</div>
              <div style={{ height: '7px', backgroundColor: '#050402', border: '1px solid var(--eq-bevel-lo)' }} />
            </div>
          ))}
        </div>
      </div>

      <div className="eq-divider" style={{ margin: '0 4px' }} />

      {/* ── Actions ─────────────────────────────────────────────── */}
      <div style={{ padding: '5px 8px', flexShrink: 0 }}>
        <div className="eq-title-bar" style={{ marginBottom: '5px' }}>Actions</div>
        <button
          className={`eq-btn ${combat.autoAttacking ? 'eq-btn-active' : ''}`}
          onClick={toggleAutoCombat}
          style={{ width: '100%', padding: '4px', fontSize: '10px', letterSpacing: '0.08em' }}
        >
          {combat.autoAttacking ? '⚔ AUTO COMBAT: ON' : '⚔ AUTO COMBAT: OFF'}
        </button>
      </div>
    </aside>
  );
}
