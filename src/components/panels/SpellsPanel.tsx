import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { EQPanelHeader } from '../ui/EQPanelHeader';
import type { CharacterClass, Spell } from '../../types';
import { SPELLS, getSpellsForClass } from '../../data/spells';

const NON_CASTERS: CharacterClass[] = ['Warrior', 'Monk', 'Rogue', 'Paladin', 'ShadowKnight', 'Ranger'];

const SCHOOL_COLORS: Record<string, string> = {
  fire:    '#ff6633',
  cold:    '#66bbff',
  magic:   '#cc88ff',
  disease: '#88cc44',
  poison:  '#aadd22',
  divine:  '#ffdd77',
  song:    '#ff99cc',
};

const EFFECT_ICONS: Record<string, string> = {
  dd:      '⚡',
  dot:     '☠',
  heal:    '✚',
  hot:     '♻',
  buff:    '↑',
  debuff:  '↓',
  slow:    '🐢',
  haste:   '⚡',
  mez:     '★',
  root:    '⚓',
  fear:    '☀',
  charm:   '♥',
  lifetap: '⚗',
  pet:     '☆',
  port:    '⟲',
  snare:   '🕸',
  rune:    '🛡',
};

function SpellGem({
  gemIndex,
  spellId,
  onForget,
  onSwapFrom,
  isSwapSource,
}: {
  gemIndex: number;
  spellId: string | null;
  onForget: (gemIndex: number) => void;
  onSwapFrom: (gemIndex: number) => void;
  isSwapSource: boolean;
}) {
  const spell = spellId ? SPELLS[spellId] : null;
  const color = spell ? (SCHOOL_COLORS[spell.school] ?? '#999') : 'transparent';
  const icon  = spell ? (EFFECT_ICONS[spell.effect] ?? '?') : '';

  return (
    <div
      title={
        spell
          ? `${spell.name} (L${spell.level} ${spell.school}) — ${spell.description}`
          : `Gem ${gemIndex + 1} — Empty`
      }
      onClick={() => spell && onSwapFrom(gemIndex)}
      style={{
        width: '52px',
        height: '52px',
        backgroundColor: spell ? '#1a1510' : '#0e0c08',
        border: `2px solid ${isSwapSource ? '#ffcc44' : spell ? color : 'var(--eq-border)'}`,
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: spell ? 'pointer' : 'default',
        position: 'relative',
        transition: 'border-color 0.15s',
      }}
    >
      {spell ? (
        <>
          <div style={{ fontSize: '18px', lineHeight: 1 }}>{icon}</div>
          <div
            style={{
              fontSize: '7px',
              color: color,
              textAlign: 'center',
              lineHeight: 1.1,
              maxWidth: '48px',
              overflow: 'hidden',
              fontWeight: 'bold',
              marginTop: '2px',
            }}
          >
            {spell.name.slice(0, 12)}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onForget(gemIndex); }}
            title="Forget spell"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              fontSize: '8px',
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              padding: '1px 2px',
            }}
          >
            ×
          </button>
        </>
      ) : (
        <div style={{ fontSize: '8px', color: 'var(--eq-text-dim)', textAlign: 'center' }}>
          Gem {gemIndex + 1}
        </div>
      )}
    </div>
  );
}

function SpellBookEntry({
  spell,
  onMemorize,
  memorizedAt,
  swapTarget,
}: {
  spell: Spell;
  onMemorize: (spellId: string) => void;
  memorizedAt: number | null;
  swapTarget: number | null;
}) {
  const color = SCHOOL_COLORS[spell.school] ?? '#999';
  const icon  = EFFECT_ICONS[spell.effect] ?? '?';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 6px',
        borderBottom: '1px solid var(--eq-border)',
        fontSize: '11px',
      }}
    >
      <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color, fontWeight: 'bold', fontSize: '11px' }}>
          {spell.name}
          {memorizedAt !== null && (
            <span style={{ color: '#888', fontWeight: 'normal', fontSize: '9px', marginLeft: '4px' }}>
              [Gem {memorizedAt + 1}]
            </span>
          )}
        </div>
        <div style={{ color: 'var(--eq-text-dim)', fontSize: '9px' }}>
          L{spell.level} · {spell.school} · Mana: {spell.manaCost}
          {spell.value > 0 && ` · ${spell.effect === 'dot' ? `${spell.dotValue ?? spell.value}/tick` : spell.value}`}
        </div>
      </div>
      <button
        onClick={() => onMemorize(spell.id)}
        disabled={memorizedAt !== null && swapTarget === null}
        title={memorizedAt !== null ? 'Already memorized' : 'Memorize this spell'}
        style={{
          fontSize: '9px',
          padding: '1px 5px',
          backgroundColor: memorizedAt !== null ? '#2a2010' : '#3a2c18',
          color: memorizedAt !== null ? '#666' : 'var(--eq-gold)',
          border: `1px solid ${memorizedAt !== null ? '#333' : 'var(--eq-border)'}`,
          borderRadius: '2px',
          cursor: memorizedAt !== null ? 'default' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {memorizedAt !== null ? 'Memorized' : (swapTarget !== null ? `→ Gem ${swapTarget + 1}` : 'Memorize')}
      </button>
    </div>
  );
}

export function SpellsPanel() {
  const player          = useGameStore((s) => s.player);
  const spellBook       = useGameStore((s) => s.spellBook);
  const memorizedSpells = useGameStore((s) => s.memorizedSpells);
  const memorizeSpell   = useGameStore((s) => s.memorizeSpell);
  const forgetSpell     = useGameStore((s) => s.forgetSpell);
  const autoMemorize    = useGameStore((s) => s.autoMemorize);

  const [swapGem, setSwapGem]       = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');

  if (NON_CASTERS.includes(player.class)) {
    return (
      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="text-center p-4 text-xs" style={{ color: 'var(--eq-text-dim)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚔</div>
          <div style={{ fontStyle: 'italic' }}>Your class does not use spells.</div>
          <div style={{ marginTop: '6px', color: '#666' }}>
            Warriors, Monks, Rogues, Rangers, Paladins,<br />and Shadow Knights use disciplines and combat skills.
          </div>
        </div>
      </div>
    );
  }

  const isMeditating = player.stats.mana < player.stats.maxMana;
  const availableSpells = getSpellsForClass(player.class, player.level)
    .filter((s) => spellBook.includes(s.id))
    .filter((s) =>
      searchText.length === 0 ||
      s.name.toLowerCase().includes(searchText.toLowerCase()) ||
      s.effect.includes(searchText.toLowerCase()),
    )
    .sort((a, b) => a.level - b.level);

  const handleMemorize = (spellId: string) => {
    if (swapGem !== null) {
      memorizeSpell(spellId, swapGem);
      setSwapGem(null);
    } else {
      // Find first empty gem
      const emptyGem = memorizedSpells.findIndex((g) => g === null);
      if (emptyGem >= 0) {
        memorizeSpell(spellId, emptyGem);
      } else {
        // All gems full — tell player to pick a gem to swap
        setSwapGem(0);
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ color: 'var(--eq-text)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Memorized Gems ────────────────────────────────────────── */}
      <EQPanelHeader title="MEMORIZED SPELLS" />
      <div style={{ padding: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
        {Array.from({ length: 8 }, (_, i) => (
          <SpellGem
            key={i}
            gemIndex={i}
            spellId={memorizedSpells[i] ?? null}
            onForget={forgetSpell}
            onSwapFrom={(idx) => setSwapGem(swapGem === idx ? null : idx)}
            isSwapSource={swapGem === i}
          />
        ))}
      </div>

      {/* Meditation / mana status */}
      <div style={{ textAlign: 'center', paddingBottom: '6px' }}>
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
        <div style={{ fontSize: '10px', color: 'var(--eq-text-dim)', marginTop: '2px' }}>
          Mana: {player.stats.mana} / {player.stats.maxMana}
        </div>
        {swapGem !== null && (
          <div style={{ fontSize: '10px', color: '#ffcc44', marginTop: '4px' }}>
            Click a spell book entry to swap into Gem {swapGem + 1} — or click gem to cancel
          </div>
        )}
      </div>

      {/* ── Spell Book ────────────────────────────────────────────── */}
      <EQPanelHeader title={`SPELL BOOK (${availableSpells.length} known)`} />

      {/* Auto-memorize button */}
      <div style={{ padding: '4px 8px', display: 'flex', gap: '6px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search spells..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            flex: 1,
            fontSize: '10px',
            padding: '3px 6px',
            backgroundColor: '#0e0c08',
            border: '1px solid var(--eq-border)',
            color: 'var(--eq-text)',
            borderRadius: '2px',
          }}
        />
        <button
          onClick={autoMemorize}
          title="Auto-fill gems with best spells for your level"
          style={{
            fontSize: '9px',
            padding: '3px 8px',
            backgroundColor: '#2a1f0a',
            color: 'var(--eq-gold)',
            border: '1px solid var(--eq-border)',
            borderRadius: '2px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          AUTO MEM
        </button>
      </div>

      {/* Spell list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {availableSpells.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--eq-text-dim)', fontSize: '11px' }}>
            {spellBook.length === 0
              ? 'No spells known. Purchase spell scrolls from a spell vendor.'
              : 'No spells match your search.'}
          </div>
        ) : (
          availableSpells.map((spell) => {
            const memIdx = memorizedSpells.findIndex((id) => id === spell.id);
            return (
              <SpellBookEntry
                key={spell.id}
                spell={spell}
                onMemorize={handleMemorize}
                memorizedAt={memIdx >= 0 ? memIdx : null}
                swapTarget={swapGem}
              />
            );
          })
        )}

        {/* Unlearned spells teaser */}
        {(() => {
          const unlearnedCount = getSpellsForClass(player.class, player.level)
            .filter((s) => !spellBook.includes(s.id)).length;
          if (unlearnedCount === 0) return null;
          return (
            <div
              style={{
                padding: '8px',
                textAlign: 'center',
                color: 'var(--eq-text-dim)',
                fontSize: '10px',
                fontStyle: 'italic',
                borderTop: '1px solid var(--eq-border)',
              }}
            >
              {unlearnedCount} more spell{unlearnedCount !== 1 ? 's' : ''} available from spell vendors.
            </div>
          );
        })()}
      </div>
    </div>
  );
}
