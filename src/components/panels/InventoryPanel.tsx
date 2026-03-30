import { useGameStore } from '../../store/gameStore';
import { HpBar } from '../ui/HpBar';
import { Tooltip } from '../ui/Tooltip';
import { EQPanelHeader } from '../ui/EQPanelHeader';
import type { EquipSlot, Item } from '../../types';

function ItemTooltipContent({ item }: { item: Item }) {
  return (
    <div>
      <div className="font-bold" style={{ color: item.rarity === 'common' ? '#e8dcc8' : item.rarity === 'uncommon' ? '#3399ff' : item.rarity === 'rare' ? '#aa00ff' : '#ff9900' }}>
        {item.name}
      </div>
      <div style={{ color: '#9a8870' }}>{item.slot ?? 'No Slot'} — {item.type}</div>
      {item.stats.damage && <div>DMG: {item.stats.damage} DLY: {item.stats.delay}</div>}
      {item.stats.ac && <div>AC: {item.stats.ac}</div>}
      {Object.entries(item.stats)
        .filter(([k]) => !['damage', 'delay', 'ac'].includes(k) && item.stats[k as keyof typeof item.stats])
        .map(([k, v]) => (
          <div key={k}>{k.toUpperCase()}: +{v as number}</div>
        ))}
      <div style={{ color: '#9a8870' }} className="mt-1">WT: {item.weight} Value: {item.value}cp</div>
      {item.description && <div className="mt-1 italic" style={{ color: '#9a8870' }}>{item.description}</div>}
    </div>
  );
}

function SlotCell({ slot, item }: { slot: EquipSlot | null; item?: Item }) {
  if (!slot) {
    return <div style={{ width: '44px', height: '44px' }} />;
  }
  return (
    <Tooltip content={item ? <ItemTooltipContent item={item} /> : <span>{slot} — empty</span>}>
      <div
        style={{
          width: '44px',
          height: '44px',
          border: `1px solid ${item ? 'var(--eq-border-light)' : 'var(--eq-border)'}`,
          backgroundColor: item ? '#2a2010' : '#0d0b08',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          padding: '2px',
        }}
        title={slot}
      >
        <div style={{ fontSize: '9px', color: 'var(--eq-text-dim)', lineHeight: 1, marginBottom: '1px' }}>
          {slot}
        </div>
        <div
          style={{
            fontSize: '9px',
            color: item ? 'var(--eq-gold)' : 'var(--eq-text-dim)',
            textAlign: 'center',
            wordBreak: 'break-all',
            lineHeight: 1.1,
          }}
        >
          {item ? (item.name.length > 9 ? item.name.slice(0, 8) + '…' : item.name) : '—'}
        </div>
      </div>
    </Tooltip>
  );
}

export function InventoryPanel() {
  const player = useGameStore((s) => s.player);

  // Calculate total equipped weight
  const totalWeight = Object.values(player.gear).reduce(
    (sum, item) => sum + (item ? item.weight : 0),
    0
  );

  // Left column slots
  const leftSlots: EquipSlot[] = ['Ear1', 'Head', 'Face', 'Neck', 'Shoulders', 'Arms', 'Back', 'Wrist1', 'Wrist2', 'Range'];
  // Right column slots (null = spacer)
  const rightSlots: (EquipSlot | null)[] = ['Ear2', null, null, 'Chest', null, 'Hands', 'Primary', 'Secondary', 'Fingers1', 'Fingers2'];
  // Bottom row slots
  const bottomSlots: EquipSlot[] = ['Legs', 'Feet', 'Waist', 'Ammo'];

  const initials = player.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex-1 overflow-y-auto p-3" style={{ color: 'var(--eq-text)' }}>
      {/* Character info */}
      <div className="mb-3 p-2 border rounded" style={{ borderColor: 'var(--eq-border)', backgroundColor: 'var(--eq-panel)' }}>
        <div className="font-bold text-sm" style={{ color: 'var(--eq-gold)' }}>{player.name}</div>
        <div className="text-xs" style={{ color: 'var(--eq-text-dim)' }}>
          Level {player.level} {player.race} {player.class}
        </div>
        <div className="mt-2 space-y-1">
          <HpBar current={player.stats.hp} max={player.stats.maxHp} label="HP" colorClass="hp" />
          <HpBar current={player.stats.mana} max={player.stats.maxMana} label="Mana" colorClass="mana" />
          <HpBar current={player.xp} max={player.xpToNextLevel} label="XP" colorClass="xp" />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-3 p-2 border rounded text-xs grid grid-cols-2 gap-1" style={{ borderColor: 'var(--eq-border)', backgroundColor: 'var(--eq-panel)' }}>
        {(['str', 'sta', 'agi', 'dex', 'wis', 'int', 'cha'] as const).map((stat) => (
          <div key={stat} className="flex justify-between">
            <span style={{ color: 'var(--eq-text-dim)' }}>{stat.toUpperCase()}</span>
            <span style={{ color: 'var(--eq-text)' }}>{player.stats[stat]}</span>
          </div>
        ))}
        <div className="flex justify-between">
          <span style={{ color: 'var(--eq-text-dim)' }}>AC</span>
          <span style={{ color: 'var(--eq-text)' }}>{player.stats.ac}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: 'var(--eq-text-dim)' }}>ATK</span>
          <span style={{ color: 'var(--eq-text)' }}>{player.stats.attack}</span>
        </div>
      </div>

      {/* Paper doll */}
      <EQPanelHeader title="EQUIPMENT" />
      <div className="mb-3">
        {/* Main 3-column layout */}
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '4px' }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {leftSlots.map((slot) => (
              <SlotCell key={slot} slot={slot} item={player.gear[slot]} />
            ))}
          </div>
          {/* Center: portrait */}
          <div
            style={{
              width: '80px',
              height: '120px',
              border: '2px solid var(--eq-gold)',
              backgroundColor: '#1a1510',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'flex-start',
              marginTop: '2px',
            }}
          >
            <span style={{ color: 'var(--eq-gold)', fontSize: '24px', fontWeight: 'bold' }}>{initials}</span>
          </div>
          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {rightSlots.map((slot, idx) => (
              <SlotCell key={slot ?? `spacer-${idx}`} slot={slot} item={slot ? player.gear[slot] : undefined} />
            ))}
          </div>
        </div>
        {/* Bottom row */}
        <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
          {bottomSlots.map((slot) => (
            <SlotCell key={slot} slot={slot} item={player.gear[slot]} />
          ))}
        </div>
      </div>

      {/* Currency */}
      <div className="mb-2 p-2 border rounded text-xs" style={{ borderColor: 'var(--eq-border)', backgroundColor: 'var(--eq-panel)' }}>
        <div className="font-bold mb-1" style={{ color: 'var(--eq-gold)' }}>CURRENCY</div>
        <div className="flex gap-3">
          {(['pp', 'gp', 'sp', 'cp'] as const).map((c) => (
            <span key={c}>
              <span style={{ color: 'var(--eq-text-dim)' }}>{c}: </span>
              <span style={{ color: 'var(--eq-gold)' }}>{player.currency[c]}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Weight */}
      <div className="text-xs" style={{ color: 'var(--eq-text-dim)' }}>
        Weight: <span style={{ color: 'var(--eq-text)' }}>{totalWeight.toFixed(1)} / 40.0</span>
      </div>
    </div>
  );
}
