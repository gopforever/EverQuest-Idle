import { useState, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { EQPanelHeader } from '../ui/EQPanelHeader';
import type { TradeskillName } from '../../types';
import { RECIPES_BY_SKILL } from '../../data/recipes';
import { canCombine } from '../../engine/tradeskills';

const TRADESKILL_NAMES: TradeskillName[] = [
  'Blacksmithing',
  'Tailoring',
  'Baking',
  'Brewing',
  'Jewelcrafting',
  'Pottery',
  'Fletching',
  'Fishing',
  'Tinkering',
];

export function TradeskillPanel() {
  const player = useGameStore((s) => s.player);
  const attemptTradeskillCombine = useGameStore((s) => s.attemptTradeskillCombine);

  const [selectedSkill, setSelectedSkill] = useState<TradeskillName>('Blacksmithing');
  const [combineMessage, setCombineMessage] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<'success' | 'fail' | null>(null);

  const skillLevel = player.skills[selectedSkill] ?? 0;
  const pct = Math.min(100, Math.floor((skillLevel / 300) * 100));

  const isTinkeringLocked =
    selectedSkill === 'Tinkering' && player.race !== 'Gnome';

  const recipes = RECIPES_BY_SKILL[selectedSkill] ?? [];

  const handleCombine = useCallback(
    (recipeId: string) => {
      // Peek at result via canCombine first for instant UI feedback
      const recipe = (RECIPES_BY_SKILL[selectedSkill] ?? []).find(
        (r) => r.id === recipeId
      );
      if (!recipe) return;
      const has = canCombine(player, recipe);
      if (!has) {
        setCombineMessage('You are missing ingredients.');
        setLastResult('fail');
        setTimeout(() => setCombineMessage(null), 3000);
        return;
      }
      attemptTradeskillCombine(recipeId);
      // Message comes from combatLog via the store, show a brief local message
      setCombineMessage('Combine attempted — check the log!');
      setLastResult('success');
      setTimeout(() => setCombineMessage(null), 3000);
    },
    [selectedSkill, player, attemptTradeskillCombine]
  );

  return (
    <div className="flex-1 overflow-y-auto" style={{ color: 'var(--eq-text)', fontSize: '12px' }}>
      <EQPanelHeader title="TRADESKILLS" />

      {/* Skill selector */}
      <div className="p-2">
        <select
          value={selectedSkill}
          onChange={(e) => {
            setSelectedSkill(e.target.value as TradeskillName);
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
          {TRADESKILL_NAMES.map((ts) => (
            <option key={ts} value={ts}>
              {ts}
              {ts === 'Tinkering' && player.race !== 'Gnome' ? ' (Gnome Only)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Skill progress bar */}
      <div className="px-2 pb-2">
        <div
          className="flex justify-between text-xs mb-1"
          style={{ color: 'var(--eq-text-dim)' }}
        >
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
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              backgroundColor: '#4a7a4a',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Tinkering locked message */}
      {isTinkeringLocked && (
        <div
          className="mx-2 mb-2 p-2 text-xs text-center"
          style={{
            border: '1px solid var(--eq-border)',
            color: '#cc4444',
            backgroundColor: '#1a0808',
            borderRadius: '2px',
          }}
        >
          Tinkering is restricted to Gnomes only.
        </div>
      )}

      {/* Combine result message */}
      {combineMessage && (
        <div
          className="mx-2 mb-2 p-1 text-xs text-center"
          style={{
            color: lastResult === 'success' ? '#4a9a4a' : '#cc7744',
            border: `1px solid ${lastResult === 'success' ? '#4a9a4a' : '#cc7744'}`,
            borderRadius: '2px',
          }}
        >
          {combineMessage}
        </div>
      )}

      {/* Recipe list */}
      <EQPanelHeader title={`${selectedSkill.toUpperCase()} RECIPES`} />
      <div className="p-1 text-xs space-y-1" style={{ overflowY: 'auto' }}>
        {recipes.length === 0 && (
          <div className="p-2 text-center" style={{ color: 'var(--eq-text-dim)' }}>
            No recipes found.
          </div>
        )}
        {recipes.map((recipe) => {
          const skillOk = skillLevel >= recipe.skillRequired;
          const hasIngredients = !isTinkeringLocked && canCombine(player, recipe);
          const canAttempt = skillOk && hasIngredients && !isTinkeringLocked;

          return (
            <div
              key={recipe.id}
              className="p-1"
              style={{
                borderBottom: '1px solid var(--eq-border)',
                opacity: skillOk ? 1 : 0.5,
                backgroundColor: hasIngredients && skillOk ? '#0f1a0f' : 'transparent',
              }}
            >
              {/* Recipe header */}
              <div
                className="flex justify-between items-center mb-1"
                style={{ color: skillOk ? 'var(--eq-gold)' : 'var(--eq-text-dim)' }}
              >
                <span style={{ fontWeight: 'bold' }}>{recipe.name}</span>
                <span style={{ fontSize: '10px', color: 'var(--eq-text-dim)' }}>
                  Skill {recipe.skillRequired}+ (Trivial: {recipe.trivial})
                </span>
              </div>

              {/* Ingredients */}
              <div style={{ color: 'var(--eq-text-dim)', marginBottom: '3px' }}>
                {recipe.ingredients.map((ing) => {
                  const present = player.inventory.filter(
                    (s) => s?.id === ing.itemId
                  ).length;
                  const enough = present >= ing.quantity;
                  return (
                    <span
                      key={ing.itemId}
                      style={{
                        marginRight: '6px',
                        color: enough ? '#4a9a4a' : '#cc4444',
                      }}
                    >
                      {enough ? '✓' : '✗'} {ing.itemId.replace(/_/g, ' ')} ×{ing.quantity}
                    </span>
                  );
                })}
              </div>

              {/* Result + combine button */}
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--eq-text-dim)', fontSize: '10px' }}>
                  → {recipe.resultItemId.replace(/_/g, ' ')}
                  {recipe.resultQuantity > 1 ? ` ×${recipe.resultQuantity}` : ''}
                </span>
                <button
                  onClick={() => handleCombine(recipe.id)}
                  disabled={!canAttempt}
                  style={{
                    backgroundColor: canAttempt ? '#2a1f0a' : '#111',
                    border: `1px solid ${canAttempt ? 'var(--eq-border)' : '#333'}`,
                    color: canAttempt ? 'var(--eq-gold)' : 'var(--eq-text-dim)',
                    padding: '1px 8px',
                    cursor: canAttempt ? 'pointer' : 'not-allowed',
                    fontSize: '10px',
                    fontFamily: 'inherit',
                    borderRadius: '1px',
                  }}
                >
                  [COMBINE]
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

