import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { CharacterClass } from '../../types';
import { SPELLS } from '../../data/spells';
import { HelpModal } from '../ui/HelpModal';

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
  slow:    '⌛',
  haste:   '⚡',
  mez:     '★',
  root:    '⚓',
  fear:    '☀',
  charm:   '♥',
  lifetap: '⚗',
  pet:     '☆',
  port:    '⟲',
  snare:   '⌖',
  rune:    '◈',
};

interface LeftBarProps {
  onOpenPanel: (panel: string) => void;
}

function GemSlot({ gemIndex, spellId }: { gemIndex: number; spellId: string | null }) {
  const spell = spellId ? SPELLS[spellId] : null;
  const color = spell ? (SCHOOL_COLORS[spell.school] ?? '#888') : '#2a2010';
  const icon  = spell ? (EFFECT_ICONS[spell.effect] ?? '?') : null;

  return (
    <div
      title={spell
        ? `Gem ${gemIndex + 1}: ${spell.name} (L${spell.level} ${spell.school})\n${spell.description}`
        : `Gem ${gemIndex + 1} — Empty`}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 5px',
        background: spell ? 'linear-gradient(to right, #0e0c07, #181308)' : 'linear-gradient(to right, #050403, #0a0805)',
        border: `1px solid ${spell ? color : '#2a2010'}`,
        borderTopColor: spell ? color : '#1a1408',
        borderLeftColor: spell ? color : '#1a1408',
        borderBottomColor: '#1a1208', borderRightColor: '#1a1208',
        boxShadow: spell ? `inset 0 0 8px rgba(0,0,0,0.7), 0 0 3px ${color}22` : 'inset 1px 1px 3px rgba(0,0,0,0.9)',
        cursor: 'default', flexShrink: 0, minHeight: '28px',
      }}
    >
      <span style={{ fontSize: '8px', color: spell ? '#4a3820' : '#1a1408', minWidth: '8px', fontWeight: 'bold' }}>
        {gemIndex + 1}
      </span>
      <div style={{
        width: '22px', height: '22px', borderRadius: '50%',
        background: spell ? `radial-gradient(circle at 35% 35%, ${color}cc, ${color}44, #000)` : 'radial-gradient(circle at 35% 35%, #2a2010, #0a0805)',
        border: `1px solid ${spell ? color : '#2a2010'}`,
        boxShadow: spell ? `0 0 6px ${color}66, inset 0 0 4px rgba(0,0,0,0.5)` : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '10px',
      }}>
        {icon && <span>{icon}</span>}
      </div>
      <div style={{
        fontSize: '8px', color: spell ? color : '#2a2010', lineHeight: 1.2, overflow: 'hidden',
        flex: 1, whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        fontWeight: spell ? 'bold' : 'normal',
        textShadow: spell ? `0 0 6px ${color}66` : 'none',
      }}>
        {spell ? spell.name : '— empty —'}
      </div>
    </div>
  );
}

export function LeftBar({ onOpenPanel }: LeftBarProps) {
  const player           = useGameStore((s) => s.player);
  const memorizedSpells  = useGameStore((s) => s.memorizedSpells);
  const combat           = useGameStore((s) => s.combat);
  const isSitting        = useGameStore((s) => s.isSitting);
  const toggleAutoCombat = useGameStore((s) => s.toggleAutoCombat);
  const toggleSit        = useGameStore((s) => s.toggleSit);
  const campOut          = useGameStore((s) => s.campOut);

  const [showHelp, setShowHelp] = useState(false);

  const isCaster = !NON_CASTERS.includes(player.class);

  const btnStyle = (active?: boolean, disabled?: boolean): React.CSSProperties => ({
    background: active
      ? 'linear-gradient(to bottom, #2a2010 0%, #1a1508 100%)'
      : 'linear-gradient(to bottom, #251e12 0%, #120f05 100%)',
    border: '1px solid var(--eq-border)',
    borderTopColor:    active ? 'var(--eq-bevel-lo)' : 'var(--eq-bevel-hi)',
    borderLeftColor:   active ? 'var(--eq-bevel-lo)' : 'var(--eq-bevel-hi)',
    borderBottomColor: active ? 'var(--eq-bevel-hi)' : 'var(--eq-bevel-lo)',
    borderRightColor:  active ? 'var(--eq-bevel-hi)' : 'var(--eq-bevel-lo)',
    color:    active ? '#f0e060' : disabled ? '#3a3020' : 'var(--eq-text)',
    fontSize: '9px',
    letterSpacing: '0.05em',
    padding:  '3px 4px',
    cursor:   disabled ? 'not-allowed' : 'pointer',
    textAlign: 'center' as const,
    fontFamily: 'inherit',
    textTransform: 'uppercase' as const,
    whiteSpace: 'nowrap' as const,
    opacity: disabled ? 0.5 : 1,
  });

  return (
    <aside
      className="eq-window"
      style={{
        width: '130px', minWidth: '130px', flexShrink: 0,
        display: 'flex', flexDirection: 'column', gap: '3px',
        padding: '4px', borderRadius: 0, overflow: 'hidden',
      }}
    >
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* ── Top menu ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
        <button
          style={btnStyle()}
          onClick={() => setShowHelp(true)}
          title="Game Help"
        >HELP</button>
        <button
          style={btnStyle()}
          onClick={() => onOpenPanel('agents')}
          title="Options / AI Settings"
        >OPTIONS</button>
      </div>
      <button
        style={{ ...btnStyle(), width: '100%' }}
        onClick={() => onOpenPanel('inventory')}
        title="Character sheet &amp; inventory"
      >PERSONA</button>

      <div className="eq-divider" />

      {/* ── Spell Gem Slots ─────────────────────────────────── */}
      {isCaster ? (
        <>
          <div style={{
            fontSize: '8px', color: 'var(--eq-text-dim)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            textAlign: 'center', paddingBottom: '1px',
          }}>
            Spell Gems
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {memorizedSpells.map((spellId, i) => (
              <GemSlot key={i} gemIndex={i} spellId={spellId} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
            <button style={btnStyle()} onClick={() => onOpenPanel('spells')}>SPELLS</button>
            <button style={btnStyle()} onClick={() => onOpenPanel('skills')}>SKILLS</button>
          </div>
        </>
      ) : (
        <>
          <div style={{
            fontSize: '9px', color: 'var(--eq-text-dim)',
            textAlign: 'center', padding: '8px 4px', fontStyle: 'italic', lineHeight: 1.5,
          }}>
            {player.class}
            <br />
            <span style={{ color: '#4a3820' }}>No spells</span>
          </div>
          <button style={btnStyle()} onClick={() => onOpenPanel('skills')}>SKILLS</button>
        </>
      )}

      <div className="eq-divider" />

      {/* ── Combat / Rest actions ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
        <button
          style={btnStyle(combat.autoAttacking)}
          onClick={toggleAutoCombat}
          title="Toggle auto-combat"
        >
          {combat.autoAttacking ? 'STOP' : 'ATTACK'}
        </button>
        <button
          style={btnStyle(false, true)}
          title="Follow is not yet available in solo idle mode"
        >FOLLOW</button>
        <button
          style={btnStyle(false, true)}
          title="Auto-heal is handled by healer ghosts in your group"
        >HEALTH</button>
        <button
          style={btnStyle(false, true)}
          title="Guard stance — coming soon"
        >GUARD</button>
        <button
          style={btnStyle()}
          onClick={campOut}
          title="Camp out — saves your progress and stops combat"
        >CAMP</button>
        <button
          style={btnStyle(isSitting)}
          onClick={toggleSit}
          title={isSitting ? 'You are sitting — click to stand (4× regen while sitting)' : 'Sit to rest — 4× HP/Mana regen, disables combat'}
        >
          {isSitting ? 'STAND' : 'SIT'}
        </button>
      </div>
    </aside>
  );
}
