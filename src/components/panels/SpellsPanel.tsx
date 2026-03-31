import { useGameStore } from '../../store/gameStore';
import { EQPanelHeader } from '../ui/EQPanelHeader';
import type { CharacterClass } from '../../types';

const NON_CASTERS: CharacterClass[] = ['Warrior', 'Monk', 'Rogue', 'Paladin', 'ShadowKnight', 'Ranger'];

function SpellGem({ index }: { index: number }) {
  return (
    <div
      title={`Gem ${index + 1} — Empty`}
      style={{
        width: '44px',
        height: '44px',
        backgroundColor: '#1a1510',
        border: '1px dashed var(--eq-border)',
        borderRadius: '3px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        color: 'var(--eq-text-dim)',
      }}
    >
      <div style={{ fontSize: '9px', color: 'var(--eq-text-dim)' }}>Gem {index + 1}</div>
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
          Your class does not use spells.
        </div>
      </div>
    );
  }

  const isMeditating = player.stats.mana < player.stats.maxMana;

  return (
    <div className="flex-1 overflow-y-auto" style={{ color: 'var(--eq-text)' }}>
      {/* Spell gems */}
      <EQPanelHeader title="MEMORIZED SPELLS" />
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
      <EQPanelHeader title="SPELL BOOK" />
      <div className="p-3 text-center space-y-2">
        <div className="text-xs" style={{ color: 'var(--eq-text-dim)' }}>
          Visit a spell vendor or scribe trainer to learn spells.
        </div>
        <div
          className="text-xs font-bold px-2 py-1 rounded inline-block"
          style={{
            backgroundColor: '#1a1207',
            color: 'var(--eq-gold)',
            border: '1px solid var(--eq-border)',
            opacity: 0.75,
          }}
        >
          ✦ Spell system coming in Phase 2 ✦
        </div>
      </div>
    </div>
  );
}
