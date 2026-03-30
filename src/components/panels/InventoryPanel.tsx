import { useGameStore } from '../../store/gameStore';
import { HpBar } from '../ui/HpBar';
import { Tooltip } from '../ui/Tooltip';
import type { EquipSlot, Item } from '../../types';

const GEAR_SLOTS: EquipSlot[] = [
  'Head', 'Face', 'Ear1', 'Ear2', 'Neck', 'Shoulders',
  'Arms', 'Back', 'Wrist1', 'Wrist2', 'Range', 'Hands',
  'Primary', 'Secondary', 'Fingers1', 'Fingers2', 'Chest',
  'Legs', 'Feet', 'Waist', 'Ammo',
];

function ItemTooltipContent({ item }: { item: Item }) {
  return (
    <div>
      <div className="font-bold" style={{ color: item.rarity === 'common' ? '#e8dcc8' : item.rarity === 'uncommon' ? '#3399ff' : item.rarity === 'rare' ? '#aa00ff' : '#ff9900' }}>
        {item.name}
      </div>
      <div style={{ color: '#9a8870' }}>{item.slot} — {item.type}</div>
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

export function InventoryPanel() {
  const player = useGameStore((s) => s.player);

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

      {/* Equipment paper doll */}
      <div className="mb-3">
        <div className="text-xs font-bold mb-1" style={{ color: 'var(--eq-gold)' }}>EQUIPMENT</div>
        <div className="grid grid-cols-3 gap-1">
          {GEAR_SLOTS.map((slot) => {
            const item = player.gear[slot];
            return (
              <Tooltip key={slot} content={item ? <ItemTooltipContent item={item} /> : <span>{slot} — empty</span>}>
                <div
                  className="p-1 border rounded text-center cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    borderColor: item ? 'var(--eq-border-light)' : 'var(--eq-border)',
                    backgroundColor: item ? '#2a2010' : '#0d0b08',
                    minHeight: '36px',
                  }}
                >
                  <div className="text-xs leading-tight" style={{ color: item ? 'var(--eq-gold)' : 'var(--eq-text-dim)' }}>
                    {item ? item.name.slice(0, 8) + (item.name.length > 8 ? '…' : '') : slot.slice(0, 6)}
                  </div>
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Currency */}
      <div className="p-2 border rounded text-xs" style={{ borderColor: 'var(--eq-border)', backgroundColor: 'var(--eq-panel)' }}>
        <div className="font-bold mb-1" style={{ color: 'var(--eq-gold)' }}>CURRENCY</div>
        <div className="grid grid-cols-4 gap-1 text-center">
          {(['pp', 'gp', 'sp', 'cp'] as const).map((c) => (
            <div key={c}>
              <div style={{ color: 'var(--eq-text-dim)' }}>{c.toUpperCase()}</div>
              <div style={{ color: 'var(--eq-text)' }}>{player.currency[c]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
