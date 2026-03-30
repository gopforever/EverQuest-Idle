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
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--eq-panel)',
          border: '2px solid var(--eq-border)',
          padding: '12px',
          minWidth: '320px',
          maxWidth: '400px',
          maxHeight: '80vh',
          overflowY: 'auto',
          fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
          color: 'var(--eq-text)',
          fontSize: '12px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <EQPanelHeader title={`${ghost.name} — Level ${ghost.level} ${ghost.class}`} />
        <div className="text-xs mb-3" style={{ color: 'var(--eq-text-dim)' }}>
          {ghost.race} | {ghost.personality}
        </div>

        {/* HP/Mana bars */}
        <div className="mb-3 space-y-1">
          <HpBar current={ghost.currentHp} max={ghost.stats.maxHp} label="HP" colorClass="hp" />
          {CASTER_CLASSES.includes(ghost.class) && (
            <HpBar current={ghost.stats.mana} max={ghost.stats.maxMana} label="Mana" colorClass="mana" />
          )}
        </div>

        {/* Zone/Activity */}
        <div className="mb-3 text-xs" style={{ color: 'var(--eq-text-dim)' }}>
          <div>Zone: <span style={{ color: 'var(--eq-text)' }}>{ghost.currentZone}</span></div>
          <div>Activity: <span style={{ color: 'var(--eq-text)' }}>{getActivityText(ghost.currentActivity)}</span></div>
        </div>

        {/* Stats grid */}
        <EQPanelHeader title="ATTRIBUTES" />
        <div className="grid grid-cols-3 gap-1 mb-3 text-xs">
          {(['str', 'sta', 'agi', 'dex', 'wis', 'int', 'cha'] as const).map((s) => (
            <div key={s} className="flex justify-between px-1">
              <span style={{ color: 'var(--eq-text-dim)' }}>{s.toUpperCase()}</span>
              <span style={{ color: 'var(--eq-text)' }}>{ghost.stats[s]}</span>
            </div>
          ))}
        </div>

        {/* Gear slots */}
        <EQPanelHeader title="EQUIPMENT" />
        <div className="space-y-0.5 mb-3 text-xs">
          {ALL_EQUIP_SLOTS.map((slot) => {
            const item = ghost.gear[slot];
            return (
              <div key={slot} className="flex justify-between px-1">
                <span style={{ color: 'var(--eq-text-dim)' }}>{slot}</span>
                <span style={{ color: item ? 'var(--eq-gold)' : 'var(--eq-text-dim)' }}>
                  {item ? item.name : '—'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Close button */}
        <div className="text-center">
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#2a1f0a',
              border: '1px solid var(--eq-border)',
              color: 'var(--eq-gold)',
              padding: '4px 20px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'inherit',
            }}
          >
            [CLOSE]
          </button>
        </div>
      </div>
    </div>
  );
}

export function RightPanel() {
  const player = useGameStore((s) => s.player);
  const ghosts = useGameStore((s) => s.ghosts);
  const combat = useGameStore((s) => s.combat);
  const toggleAutoCombat = useGameStore((s) => s.toggleAutoCombat);

  const [selectedGhost, setSelectedGhost] = useState<GhostPlayer | null>(null);

  const onlineGhosts = ghosts.filter((g) => g.isOnline).slice(0, 5);

  const goldBtnStyle: React.CSSProperties = {
    backgroundColor: '#1a1510',
    border: '1px solid var(--eq-border)',
    color: 'var(--eq-gold)',
    padding: '2px 8px',
    cursor: 'pointer',
    fontSize: '11px',
    fontFamily: 'inherit',
  };

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
      {selectedGhost && (
        <GhostDetailModal ghost={selectedGhost} onClose={() => setSelectedGhost(null)} />
      )}

      {/* Group Window */}
      <div className="p-2 border-b" style={{ borderColor: 'var(--eq-border)' }}>
        <EQPanelHeader title="GROUP WINDOW" />
        {/* Player row */}
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-0.5">
            <span style={{ color: 'var(--eq-gold)' }} className="font-bold truncate max-w-24">
              ★ {player.name}
            </span>
            <span style={{ color: 'var(--eq-text-dim)' }}>Lv{player.level}</span>
          </div>
          <HpBar current={player.stats.hp} max={player.stats.maxHp} colorClass="hp" showText={false} />
          {CASTER_CLASSES.includes(player.class) && (
            <div className="mt-0.5">
              <HpBar current={player.stats.mana} max={player.stats.maxMana} colorClass="mana" showText={false} />
            </div>
          )}
        </div>
        {/* Ghost rows */}
        {onlineGhosts.map((ghost) => (
          <div
            key={ghost.id}
            className="mb-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setSelectedGhost(ghost)}
          >
            <div className="flex justify-between text-xs mb-0.5">
              <span className="truncate max-w-24" style={{ color: 'var(--eq-text)' }}>
                {ghost.name}
              </span>
              <span style={{ color: 'var(--eq-text-dim)' }}>Lv{ghost.level}</span>
            </div>
            <HpBar current={ghost.currentHp} max={ghost.stats.maxHp} colorClass="hp" showText={false} />
            {CASTER_CLASSES.includes(ghost.class) && (
              <div className="mt-0.5">
                <HpBar current={ghost.stats.mana} max={ghost.stats.maxMana} colorClass="mana" showText={false} />
              </div>
            )}
            <div className="text-xs italic mt-0.5" style={{ color: 'var(--eq-text-dim)', fontSize: '10px' }}>
              {getActivityText(ghost.currentActivity)}
            </div>
          </div>
        ))}
        {/* Empty slots */}
        {Array.from({ length: Math.max(0, 5 - onlineGhosts.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="mb-2">
            <div className="text-xs mb-0.5" style={{ color: 'var(--eq-text-dim)' }}>--- empty ---</div>
            <div className="h-2.5 rounded-sm" style={{ backgroundColor: '#1a1510', border: '1px solid var(--eq-border)' }} />
          </div>
        ))}
        {/* Group footer buttons */}
        <div className="flex gap-1 mt-1">
          <button style={goldBtnStyle}>[INVITE]</button>
          {onlineGhosts.length > 0 && (
            <button style={goldBtnStyle}>[DISBAND]</button>
          )}
        </div>
      </div>

      {/* Current Target */}
      <div className="p-2 border-b" style={{ borderColor: 'var(--eq-border)' }}>
        <EQPanelHeader title="CURRENT TARGET" />
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
        <EQPanelHeader title="ACTIONS" />
        <button
          className="w-full py-1 text-xs rounded border"
          style={{ backgroundColor: '#1a1510', borderColor: 'var(--eq-border)', color: 'var(--eq-text)' }}
        >
          ABILITIES
        </button>
        <button
          className="w-full py-1 text-xs rounded border font-bold"
          onClick={toggleAutoCombat}
          style={{
            backgroundColor: combat.autoAttacking ? '#2a1f0a' : '#1a1510',
            borderColor: combat.autoAttacking ? 'var(--eq-gold)' : 'var(--eq-border)',
            color: combat.autoAttacking ? 'var(--eq-gold)' : 'var(--eq-text-dim)',
          }}
        >
          {combat.autoAttacking ? '[AUTO COMBAT: ON]' : '[AUTO COMBAT: OFF]'}
        </button>
      </div>
    </aside>
  );
}
