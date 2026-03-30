import { useGameStore } from '../../store/gameStore';
import type { CharacterClass } from '../../types';

const NON_CASTERS: CharacterClass[] = ['Warrior', 'Monk', 'Rogue'];

function SpellGem({ index }: { index: number }) {
  return (
    <div
      title={`Spell Gem ${index + 1} — Empty`}
      style={{
        width: '40px',
        height: '40px',
        backgroundColor: '#1a1510',
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

export function SpellsPanel() {
  const player = useGameStore((s) => s.player);

  if (NON_CASTERS.includes(player.class)) {
    return (
      <div
        className="flex-1 overflow-y-auto flex items-center justify-center"
        style={{ color: 'var(--eq-text-dim)' }}
      >
        <div className="text-center p-4 text-xs italic">
          This class does not cast spells.
        </div>
      </div>
    );
  }

  const isMeditating = player.stats.mana < player.stats.maxMana;

  return (
    <div className="flex-1 overflow-y-auto" style={{ color: 'var(--eq-text)' }}>
      {/* Spell gems */}
      <div
        className="text-xs font-bold text-center py-1"
        style={{ backgroundColor: '#2a1f0a', color: 'var(--eq-gold)', border: '1px solid var(--eq-border)' }}
      >
        MEMORIZED SPELLS
      </div>
      <div className="flex flex-wrap gap-2 p-3 justify-center">
        {Array.from({ length: 8 }, (_, i) => (
          <SpellGem key={i} index={i} />
        ))}
      </div>

      {/* Meditation status */}
      <div className="px-3 pb-2 text-center">
        {isMeditating ? (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded"
            style={{ backgroundColor: '#1a1a40', color: '#7777ff', border: '1px solid #4444aa' }}
          >
            [MEDITATING]
          </span>
        ) : (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded"
            style={{ backgroundColor: '#2a1f0a', color: 'var(--eq-gold)', border: '1px solid var(--eq-border)' }}
          >
            [FULL MANA]
          </span>
        )}
        <div className="text-xs mt-1" style={{ color: 'var(--eq-text-dim)' }}>
          Mana: {player.stats.mana} / {player.stats.maxMana}
        </div>
      </div>

      {/* Spell book */}
      <div
        className="text-xs font-bold text-center py-1"
        style={{ backgroundColor: '#2a1f0a', color: 'var(--eq-gold)', border: '1px solid var(--eq-border)' }}
      >
        SPELL BOOK
      </div>
      <div className="p-3 text-xs text-center" style={{ color: 'var(--eq-text-dim)' }}>
        No spells known. Visit a spell vendor or trainer.
      </div>
    </div>
  );
}
