import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { HpBar } from '../ui/HpBar';
import { EQPanelHeader } from '../ui/EQPanelHeader';
import type { EquipSlot, Item } from '../../types';

// ── Slot compatibility (paired slots) ───────────────────────────────────────
function getCompatibleSlots(itemSlot: EquipSlot): EquipSlot[] {
  if (itemSlot === 'Ear1'     || itemSlot === 'Ear2')     return ['Ear1',     'Ear2'];
  if (itemSlot === 'Wrist1'   || itemSlot === 'Wrist2')   return ['Wrist1',   'Wrist2'];
  if (itemSlot === 'Fingers1' || itemSlot === 'Fingers2') return ['Fingers1', 'Fingers2'];
  return [itemSlot];
}

function getRarityColor(rarity?: string): string {
  switch (rarity) {
    case 'uncommon': return '#5599ff';
    case 'rare':     return '#aa44ff';
    case 'epic':     return '#ff8800';
    default:         return 'var(--eq-text)';
  }
}

// ── Item detail card ─────────────────────────────────────────────────────────
function ItemDetail({ item, onEquip, onDrop }: {
  item: Item;
  onEquip?: () => void;
  onDrop?: () => void;
}) {
  const stats = item.stats;
  const statRows: { key: string; label: string; val: number }[] = [
    ...(stats.damage  ? [{ key: 'dmg', label: 'DMG', val: stats.damage }]  : []),
    ...(stats.delay   ? [{ key: 'dly', label: 'DLY', val: stats.delay }]   : []),
    ...(stats.ac      ? [{ key: 'ac',  label: 'AC',  val: stats.ac }]      : []),
    ...(stats.hp      ? [{ key: 'hp',  label: 'HP',  val: stats.hp }]      : []),
    ...(stats.mana    ? [{ key: 'mana',label: 'Mana',val: stats.mana }]    : []),
    ...(stats.str     ? [{ key: 'str', label: 'STR', val: stats.str }]     : []),
    ...(stats.sta     ? [{ key: 'sta', label: 'STA', val: stats.sta }]     : []),
    ...(stats.agi     ? [{ key: 'agi', label: 'AGI', val: stats.agi }]     : []),
    ...(stats.dex     ? [{ key: 'dex', label: 'DEX', val: stats.dex }]     : []),
    ...(stats.wis     ? [{ key: 'wis', label: 'WIS', val: stats.wis }]     : []),
    ...(stats.int     ? [{ key: 'int', label: 'INT', val: stats.int }]     : []),
    ...(stats.cha     ? [{ key: 'cha', label: 'CHA', val: stats.cha }]     : []),
    ...(stats.attack  ? [{ key: 'atk', label: 'ATK', val: stats.attack }]  : []),
  ];

  return (
    <div
      style={{
        padding: '8px',
        borderTop: '1px solid var(--eq-bevel-lo)',
        backgroundColor: 'var(--eq-panel)',
        fontSize: '11px',
      }}
    >
      <div style={{ fontWeight: 'bold', color: getRarityColor(item.rarity), marginBottom: '2px', letterSpacing: '0.03em' }}>
        {item.name}
      </div>
      <div style={{ color: 'var(--eq-text-dim)', fontSize: '10px', marginBottom: '4px' }}>
        {item.slot ?? 'No slot'} · {item.type} · WT {item.weight} · {item.value}cp
      </div>
      {statRows.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 8px', marginBottom: '4px' }}>
          {statRows.map((r) => (
            <div key={r.key} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--eq-text-dim)' }}>{r.label}</span>
              <span style={{ color: 'var(--eq-gold)' }}>+{r.val}</span>
            </div>
          ))}
        </div>
      )}
      {item.description && (
        <div style={{ color: 'var(--eq-text-dim)', fontStyle: 'italic', fontSize: '10px', marginBottom: '4px' }}>
          {item.description}
        </div>
      )}
      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
        {onEquip && (
          <button className="eq-btn" onClick={onEquip} style={{ flex: 1, padding: '3px', fontSize: '9px' }}>
            EQUIP
          </button>
        )}
        {onDrop && (
          <button className="eq-btn eq-btn-danger" onClick={onDrop} style={{ padding: '3px 6px', fontSize: '9px' }}>
            DROP
          </button>
        )}
      </div>
    </div>
  );
}

// ── Paper-doll gear slot ─────────────────────────────────────────────────────
function GearSlotCell({
  slot,
  item,
  selected,
  onClick,
}: {
  slot: EquipSlot | null;
  item?: Item;
  selected?: boolean;
  onClick?: () => void;
}) {
  if (!slot) return <div style={{ width: '46px', height: '46px' }} />;

  const hasItem = Boolean(item);
  const borderColor = selected
    ? 'var(--eq-gold)'
    : hasItem
    ? 'var(--eq-bevel-hi)'
    : 'var(--eq-bevel-lo)';

  return (
    <div
      onClick={onClick}
      title={`${slot}${item ? ': ' + item.name : ' (empty)'}`}
      style={{
        width: '46px',
        height: '46px',
        border: `1px solid ${borderColor}`,
        borderTopColor: hasItem ? 'var(--eq-bevel-lo)' : 'var(--eq-bevel-lo)',
        borderLeftColor: hasItem ? 'var(--eq-bevel-lo)' : 'var(--eq-bevel-lo)',
        backgroundColor: selected ? '#2a2010' : hasItem ? '#1a1608' : '#050402',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: hasItem ? 'pointer' : 'default',
        padding: '2px',
        boxShadow: hasItem
          ? 'inset 0 0 6px rgba(0,0,0,0.6)'
          : 'inset 1px 1px 3px rgba(0,0,0,0.8)',
        transition: 'background-color 0.1s',
        overflow: 'hidden',
      }}
    >
      <div style={{ fontSize: '8px', color: selected ? 'var(--eq-gold)' : 'var(--eq-text-dim)', lineHeight: 1, marginBottom: '1px' }}>
        {slot.replace(/[12]$/, '')}
        {/[12]$/.test(slot) && <span style={{ opacity: 0.6 }}>{slot.slice(-1)}</span>}
      </div>
      <div
        style={{
          fontSize: '9px',
          color: item ? getRarityColor(item.rarity) : '#2a2018',
          textAlign: 'center',
          wordBreak: 'break-all',
          lineHeight: 1.1,
          maxWidth: '42px',
          overflow: 'hidden',
        }}
      >
        {item ? (item.name.length > 8 ? item.name.slice(0, 7) + '…' : item.name) : '—'}
      </div>
    </div>
  );
}

// ── Bag slot cell ────────────────────────────────────────────────────────────
function BagSlotCell({
  item,
  selected,
  onClick,
}: {
  item?: Item | null;
  selected?: boolean;
  onClick?: () => void;
}) {
  const hasItem = Boolean(item);
  return (
    <div
      onClick={onClick}
      title={item?.name ?? 'Empty'}
      style={{
        width: '34px',
        height: '34px',
        border: `1px solid ${selected ? 'var(--eq-gold)' : hasItem ? 'var(--eq-border)' : 'var(--eq-bevel-lo)'}`,
        backgroundColor: selected ? '#2a2010' : hasItem ? '#0e0c07' : '#050402',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: hasItem ? 'pointer' : 'default',
        boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.8)',
        overflow: 'hidden',
        padding: '2px',
        transition: 'background-color 0.1s',
      }}
    >
      {item && (
        <div
          style={{
            fontSize: '8px',
            color: getRarityColor(item.rarity),
            textAlign: 'center',
            lineHeight: 1.1,
            wordBreak: 'break-all',
          }}
        >
          {item.name.length > 7 ? item.name.slice(0, 6) + '…' : item.name}
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export function InventoryPanel() {
  const player        = useGameStore((s) => s.player);
  const equipItem     = useGameStore((s) => s.equipItem);
  const unequipItem   = useGameStore((s) => s.unequipItem);

  const [selectedBagIdx, setSelectedBagIdx]   = useState<number | null>(null);
  const [selectedGearSlot, setSelectedGearSlot] = useState<EquipSlot | null>(null);

  const selectedBagItem   = selectedBagIdx   !== null ? player.inventory[selectedBagIdx]   : null;
  const selectedGearItem  = selectedGearSlot !== null ? player.gear[selectedGearSlot]       : null;

  // Auto-equip: find first open compatible slot; if all full, use first slot (swap)
  function handleBagItemClick(idx: number) {
    const item = player.inventory[idx];
    if (!item) return;

    // Toggle selection
    if (selectedBagIdx === idx) {
      setSelectedBagIdx(null);
      return;
    }
    setSelectedGearSlot(null);
    setSelectedBagIdx(idx);
  }

  function handleEquipSelected() {
    if (selectedBagItem === null || selectedBagItem === undefined) return;
    if (!selectedBagItem.slot) return;

    const slots = getCompatibleSlots(selectedBagItem.slot);
    // Try empty slot first, else use first slot (swap)
    const targetSlot = slots.find((s) => !player.gear[s]) ?? slots[0];
    equipItem(selectedBagItem, targetSlot);
    setSelectedBagIdx(null);
  }

  function handleGearSlotClick(slot: EquipSlot) {
    const item = player.gear[slot];

    // If a bag item is selected, equip it into this specific slot
    if (selectedBagItem) {
      if (selectedBagItem.slot) {
        const compat = getCompatibleSlots(selectedBagItem.slot);
        if (compat.includes(slot)) {
          equipItem(selectedBagItem, slot);
          setSelectedBagIdx(null);
          return;
        }
      }
    }

    // Otherwise toggle gear slot selection or unequip
    if (!item) {
      setSelectedGearSlot(null);
      return;
    }
    if (selectedGearSlot === slot) {
      // Second click → unequip
      const emptyIdx = player.inventory.findIndex((s) => s === null);
      if (emptyIdx === -1) {
        // Full — just deselect
        setSelectedGearSlot(null);
        return;
      }
      unequipItem(slot);
      setSelectedGearSlot(null);
    } else {
      setSelectedGearSlot(slot);
      setSelectedBagIdx(null);
    }
  }

  function handleUnequipSelected() {
    if (!selectedGearSlot) return;
    const emptyIdx = player.inventory.findIndex((s) => s === null);
    if (emptyIdx === -1) return; // Full
    unequipItem(selectedGearSlot);
    setSelectedGearSlot(null);
  }

  // Paper-doll layout
  const leftSlots:  EquipSlot[]        = ['Ear1', 'Head', 'Face', 'Neck', 'Shoulders', 'Arms', 'Back', 'Wrist1', 'Wrist2', 'Range'];
  const rightSlots: (EquipSlot | null)[] = ['Ear2', null, null, 'Chest', null, 'Hands', 'Primary', 'Secondary', 'Fingers1', 'Fingers2'];
  const bottomSlots: EquipSlot[]       = ['Legs', 'Feet', 'Waist', 'Ammo'];

  const initials = player.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const totalWeight = Object.values(player.gear).reduce((s, i) => s + (i?.weight ?? 0), 0)
    + player.inventory.reduce((s, i) => s + (i?.weight ?? 0), 0);

  const selectedItem = selectedBagItem ?? selectedGearItem;
  const canEquipSelected = Boolean(selectedBagItem?.slot);
  const canUnequipSelected = Boolean(selectedGearSlot && player.gear[selectedGearSlot]);
  const bagFull = player.inventory.every((s) => s !== null);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        color: 'var(--eq-text)',
      }}
    >
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>

        {/* ── Stats ──────────────────────────────────────────────── */}
        <EQPanelHeader title={`${player.name} — Lv ${player.level} ${player.class}`} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1px 12px',
            fontSize: '10px',
            marginBottom: '6px',
            padding: '4px 2px',
          }}
        >
          {(['str', 'sta', 'agi', 'dex', 'wis', 'int', 'cha'] as const).map((s) => (
            <div key={s} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--eq-text-dim)' }}>{s.toUpperCase()}</span>
              <span style={{ color: 'var(--eq-text)' }}>{player.stats[s]}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--eq-text-dim)' }}>AC</span>
            <span style={{ color: 'var(--eq-text)' }}>{player.stats.ac}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--eq-text-dim)' }}>ATK</span>
            <span style={{ color: 'var(--eq-text)' }}>{player.stats.attack}</span>
          </div>
        </div>

        {/* HP / Mana bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '8px' }}>
          <HpBar current={player.stats.hp}   max={player.stats.maxHp}   label="HP"   colorClass="hp"   showText height={11} />
          <HpBar current={player.stats.mana} max={player.stats.maxMana} label="Mana" colorClass="mana" showText height={11} />
          <HpBar current={player.xp}         max={player.xpToNextLevel} label="XP"   colorClass="xp"   showText height={9}  />
        </div>

        {/* ── Paper doll ─────────────────────────────────────────── */}
        <EQPanelHeader title="EQUIPMENT — click slot to select / double-click to unequip" />

        {/* Hint */}
        <div style={{ fontSize: '9px', color: 'var(--eq-text-dim)', marginBottom: '4px', fontStyle: 'italic' }}>
          {selectedBagItem
            ? `▶ Select a gear slot to equip "${selectedBagItem.name}"`
            : selectedGearSlot
            ? `▶ Click again to unequip "${selectedGearItem?.name}" · or pick a bag item to swap`
            : 'Click a gear slot to select · click bag item to select'}
        </div>

        <div style={{ marginBottom: '6px' }}>
          {/* Left / portrait / right */}
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '4px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {leftSlots.map((slot) => (
                <GearSlotCell
                  key={slot}
                  slot={slot}
                  item={player.gear[slot]}
                  selected={selectedGearSlot === slot}
                  onClick={() => handleGearSlotClick(slot)}
                />
              ))}
            </div>

            {/* Portrait */}
            <div
              style={{
                width: '76px',
                height: '110px',
                border: '1px solid var(--eq-border)',
                borderTopColor: 'var(--eq-bevel-lo)',
                borderLeftColor: 'var(--eq-bevel-lo)',
                backgroundColor: '#050402',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'flex-start',
                boxShadow: 'inset 1px 1px 4px rgba(0,0,0,0.9)',
                gap: '4px',
              }}
            >
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--eq-gold)', textShadow: '0 0 10px rgba(180,120,0,0.5)' }}>
                {initials}
              </div>
              <div style={{ fontSize: '8px', color: 'var(--eq-text-dim)', textAlign: 'center', lineHeight: 1.3 }}>
                {player.race}<br />{player.class}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {rightSlots.map((slot, idx) => (
                <GearSlotCell
                  key={slot ?? `spacer-${idx}`}
                  slot={slot}
                  item={slot ? player.gear[slot] : undefined}
                  selected={selectedGearSlot === slot}
                  onClick={slot ? () => handleGearSlotClick(slot) : undefined}
                />
              ))}
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
            {bottomSlots.map((slot) => (
              <GearSlotCell
                key={slot}
                slot={slot}
                item={player.gear[slot]}
                selected={selectedGearSlot === slot}
                onClick={() => handleGearSlotClick(slot)}
              />
            ))}
          </div>

          {/* Equip/Unequip action buttons */}
          {(canEquipSelected || canUnequipSelected) && (
            <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
              {canEquipSelected && (
                <button
                  className="eq-btn eq-btn-active"
                  onClick={handleEquipSelected}
                  style={{ flex: 1, fontSize: '10px', padding: '4px' }}
                >
                  ▲ EQUIP
                </button>
              )}
              {canUnequipSelected && (
                <button
                  className="eq-btn"
                  onClick={handleUnequipSelected}
                  style={{ flex: 1, fontSize: '10px', padding: '4px' }}
                  disabled={bagFull}
                  title={bagFull ? 'Inventory full!' : ''}
                >
                  ▼ UNEQUIP
                </button>
              )}
              <button
                className="eq-btn eq-btn-danger"
                onClick={() => { setSelectedBagIdx(null); setSelectedGearSlot(null); }}
                style={{ fontSize: '10px', padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* ── Bag ────────────────────────────────────────────────── */}
        <EQPanelHeader title={`BAG (${player.inventory.filter(Boolean).length}/30)`} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 34px)',
            gap: '2px',
            marginBottom: '6px',
          }}
        >
          {player.inventory.map((item, idx) => (
            <BagSlotCell
              key={idx}
              item={item}
              selected={selectedBagIdx === idx}
              onClick={() => handleBagItemClick(idx)}
            />
          ))}
        </div>

        {/* ── Currency ────────────────────────────────────────────── */}
        <div style={{ fontSize: '10px', color: 'var(--eq-text-dim)', marginBottom: '4px' }}>
          {(['pp', 'gp', 'sp', 'cp'] as const).map((c) => (
            <span key={c} style={{ marginRight: '8px' }}>
              <span>{c}: </span>
              <span style={{ color: 'var(--eq-gold)' }}>{player.currency[c]}</span>
            </span>
          ))}
        </div>
        <div style={{ fontSize: '9px', color: 'var(--eq-text-dim)' }}>
          WT: {totalWeight.toFixed(1)} / 40.0
        </div>
      </div>

      {/* ── Selected item detail (pinned at bottom) ──────────────── */}
      {selectedItem && (
        <ItemDetail
          item={selectedItem}
          onEquip={canEquipSelected ? handleEquipSelected : undefined}
          onDrop={
            canUnequipSelected
              ? () => { if (!bagFull) { unequipItem(selectedGearSlot!); setSelectedGearSlot(null); } }
              : undefined
          }
        />
      )}
    </div>
  );
}
