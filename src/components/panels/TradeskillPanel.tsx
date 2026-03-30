import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { EQPanelHeader } from '../ui/EQPanelHeader';

const TRADESKILLS = [
  'Baking', 'Brewing', 'Blacksmithing', 'Fletching',
  'Jewelry Making', 'Pottery', 'Research', 'Tailoring', 'Alchemy',
] as const;

type Tradeskill = typeof TRADESKILLS[number];

const BEGINNER_RECIPES: { skill: Tradeskill; name: string; ingredients: string }[] = [
  { skill: 'Baking', name: 'Bat Wing Crunchies', ingredients: 'Bat Wing × 2, Dough' },
  { skill: 'Brewing', name: 'Kromrif Blood', ingredients: 'Vinegar, Bat Blood' },
  { skill: 'Tailoring', name: 'Spiderling Silk Wristguard', ingredients: 'Spiderling Silk × 4' },
  { skill: 'Blacksmithing', name: 'Rusty Axe', ingredients: 'Small Brick of Ore, Blade Mold' },
];

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
        flexShrink: 0,
      }}
    >
      {index + 1}
    </div>
  );
}

function ResultSlot() {
  return (
    <div
      title="Result slot"
      style={{
        width: '80px',
        height: '80px',
        backgroundColor: '#0d0b08',
        border: '1px dashed var(--eq-border-light)',
        borderRadius: '3px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        color: 'var(--eq-text-dim)',
        flexShrink: 0,
      }}
    >
      <div style={{ fontSize: '18px', opacity: 0.3 }}>?</div>
      <div style={{ fontSize: '9px' }}>Result</div>
    </div>
  );
}

export function TradeskillPanel() {
  const player = useGameStore((s) => s.player);
  const [selectedSkill, setSelectedSkill] = useState<Tradeskill>('Baking');
  const [combineMessage, setCombineMessage] = useState<string | null>(null);

  const skillLevel = player.skills[selectedSkill] ?? 0;
  const pct = Math.min(100, Math.floor((skillLevel / 300) * 100));

  const handleCombine = () => {
    setCombineMessage('You must find the recipe first.');
    setTimeout(() => setCombineMessage(null), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ color: 'var(--eq-text)', fontSize: '12px' }}>
      {/* Tradeskill selector */}
      <EQPanelHeader title="TRADESKILLS" />
      <div className="p-2">
        <select
          value={selectedSkill}
          onChange={(e) => {
            setSelectedSkill(e.target.value as Tradeskill);
            setCombineMessage(null);
          }}
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
      <EQPanelHeader title="COMBINE BOX" />
      <div className="p-3">
        {/* 4×2 ingredient grid + result slot */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 60px)', gap: '4px' }}>
            {Array.from({ length: 8 }, (_, i) => (
              <IngredientSlot key={i} index={i} />
            ))}
          </div>
          <ResultSlot />
        </div>
        <div className="text-center">
          <button
            onClick={handleCombine}
            style={{
              backgroundColor: '#2a1f0a',
              border: '1px solid var(--eq-border)',
              color: 'var(--eq-gold)',
              padding: '4px 16px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'inherit',
              borderRadius: '2px',
            }}
          >
            [COMBINE]
          </button>
          {combineMessage && (
            <div className="text-xs mt-2" style={{ color: 'var(--eq-orange)' }}>
              {combineMessage}
            </div>
          )}
        </div>
      </div>

      {/* Recipe browser */}
      <EQPanelHeader title="BEGINNER RECIPES" />
      <div className="p-2 text-xs space-y-1">
        {BEGINNER_RECIPES.map((recipe) => (
          <div
            key={recipe.name}
            className="p-1 border-b"
            style={{ borderColor: 'var(--eq-border)', opacity: recipe.skill === selectedSkill ? 1 : 0.5 }}
          >
            <div style={{ color: recipe.skill === selectedSkill ? 'var(--eq-gold)' : 'var(--eq-text)' }}>
              {recipe.skill}: {recipe.name}
            </div>
            <div style={{ color: 'var(--eq-text-dim)', fontSize: '10px' }}>{recipe.ingredients}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
