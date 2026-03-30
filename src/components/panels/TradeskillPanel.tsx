import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

const TRADESKILLS = [
  'Baking', 'Brewing', 'Blacksmithing', 'Fletching',
  'Jewelry Making', 'Pottery', 'Research', 'Tailoring', 'Alchemy',
] as const;

type Tradeskill = typeof TRADESKILLS[number];

function IngredientSlot({ index }: { index: number }) {
  return (
    <div
      title={`Ingredient Slot ${index + 1}`}
      style={{
        width: '60px',
        height: '60px',
        backgroundColor: '#0d0b08',
        border: '1px dashed var(--eq-border)',
        borderRadius: '3px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        color: 'var(--eq-text-dim)',
      }}
    >
      {index + 1}
    </div>
  );
}

export function TradeskillPanel() {
  const player = useGameStore((s) => s.player);
  const [selectedSkill, setSelectedSkill] = useState<Tradeskill>('Baking');

  const skillLevel = player.skills[selectedSkill] ?? 0;
  const pct = Math.min(100, Math.floor((skillLevel / 300) * 100));

  return (
    <div className="flex-1 overflow-y-auto" style={{ color: 'var(--eq-text)', fontSize: '12px' }}>
      {/* Tradeskill selector */}
      <div
        className="text-xs font-bold text-center py-1"
        style={{ backgroundColor: '#2a1f0a', color: 'var(--eq-gold)', border: '1px solid var(--eq-border)' }}
      >
        TRADESKILLS
      </div>
      <div className="p-2">
        <select
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value as Tradeskill)}
          style={{
            backgroundColor: '#0d0b08',
            border: '1px solid var(--eq-border)',
            color: 'var(--eq-text)',
            padding: '2px 6px',
            fontSize: '12px',
            fontFamily: 'inherit',
            width: '100%',
            borderRadius: '2px',
          }}
        >
          {TRADESKILLS.map((ts) => (
            <option key={ts} value={ts}>
              {ts}
            </option>
          ))}
        </select>
      </div>

      {/* Skill level */}
      <div className="px-2 pb-2">
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--eq-text-dim)' }}>
          <span>{selectedSkill}</span>
          <span>{skillLevel} / 300</span>
        </div>
        <div
          style={{
            height: '8px',
            backgroundColor: '#1a1510',
            border: '1px solid var(--eq-border)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#4a7a4a' }} />
        </div>
      </div>

      {/* Combine box */}
      <div
        className="text-xs font-bold text-center py-1"
        style={{ backgroundColor: '#2a1f0a', color: 'var(--eq-gold)', border: '1px solid var(--eq-border)' }}
      >
        COMBINE BOX
      </div>
      <div className="p-3">
        <div className="flex gap-2 justify-center mb-3">
          {Array.from({ length: 4 }, (_, i) => (
            <IngredientSlot key={i} index={i} />
          ))}
        </div>
        <div className="text-center">
          <button
            onClick={() => undefined}
            style={{
              backgroundColor: 'var(--eq-panel)',
              border: '1px solid var(--eq-border)',
              color: 'var(--eq-text)',
              padding: '4px 16px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'inherit',
              borderRadius: '2px',
            }}
          >
            [COMBINE]
          </button>
        </div>
      </div>

      {/* Recipe browser */}
      <div
        className="text-xs font-bold text-center py-1"
        style={{ backgroundColor: '#2a1f0a', color: 'var(--eq-gold)', border: '1px solid var(--eq-border)' }}
      >
        KNOWN RECIPES
      </div>
      <div className="p-3 text-xs text-center" style={{ color: 'var(--eq-text-dim)' }}>
        No recipes known for {selectedSkill}.
      </div>
    </div>
  );
}
