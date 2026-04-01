import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { HpBar } from '../ui/HpBar';
import type { GhostPlayer, CharacterClass } from '../../types';

const CASTER_CLASSES: CharacterClass[] = [
  'Wizard', 'Magician', 'Enchanter', 'Necromancer',
  'Cleric', 'Druid', 'Shaman', 'Bard',
];

function getActivityText(a: string) {
  if (a === 'Fighting') return 'Fighting';
  if (a === 'Idle') return 'Seeking group';
  if (a === 'Offline') return 'Offline';
  return a;
}

interface RightBarProps {
  onOpenPanel: (panel: string) => void;
  activePanel: string | null;
}

function GhostDetailModal({ ghost, onClose }: { ghost: GhostPlayer; onClose: () => void }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div className="eq-window" style={{ padding: 0, minWidth: '300px', maxWidth: '380px', maxHeight: '80vh', overflowY: 'auto', borderRadius: 0 }} onClick={e => e.stopPropagation()}>
        <div className="eq-title-bar">{ghost.name} — Lv {ghost.level} {ghost.class}</div>
        <div style={{ padding: '8px', fontSize: '11px' }}>
          <div style={{ color: 'var(--eq-text-dim)', marginBottom: '6px' }}>{ghost.race} · {ghost.personality}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '8px' }}>
            <HpBar current={ghost.stats.hp} max={ghost.stats.maxHp} label="HP" colorClass="hp" showText height={12} />
            {CASTER_CLASSES.includes(ghost.class) && (
              <HpBar current={ghost.stats.mana} max={ghost.stats.maxMana} label="Mana" colorClass="mana" showText height={12} />
            )}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--eq-text-dim)', marginBottom: '6px' }}>
            <div>Zone: <span style={{ color: 'var(--eq-text)' }}>{ghost.currentZone}</span></div>
            <div>Activity: <span style={{ color: 'var(--eq-text)' }}>{getActivityText(ghost.currentActivity)}</span></div>
          </div>
          <div className="eq-title-bar" style={{ marginBottom: '4px' }}>ATTRIBUTES</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', marginBottom: '8px', fontSize: '10px' }}>
            {(['str','sta','agi','dex','wis','int','cha'] as const).map(s => (
              <div key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 4px' }}>
                <span style={{ color: 'var(--eq-text-dim)' }}>{s.toUpperCase()}</span>
                <span>{ghost.stats[s]}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <button className="eq-btn" onClick={onClose} style={{ padding: '4px 20px' }}>[CLOSE]</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const PANEL_BUTTONS: { id: string; label: string; title?: string }[] = [
  { id: 'inventory',    label: 'INVENTORY',  title: 'View equipment and bag items' },
  { id: 'skills',       label: 'SKILLS',     title: 'View combat and trade skills' },
  { id: 'spells',       label: 'SPELLS',     title: 'Spellbook and gem slots' },
  { id: 'quests',       label: 'QUESTS',     title: 'Active and available quests' },
  { id: 'factions',     label: 'FACTIONS',   title: 'Faction standings by city' },
  { id: 'zones',        label: 'ZONES',      title: 'Zone browser and travel' },
  { id: 'tradeskill',   label: 'TRADESKILL', title: 'Crafting and combines' },
  { id: 'bazaar',       label: 'BAZAAR',     title: 'Player marketplace' },
  { id: 'guild',        label: 'GUILD',      title: 'Guild management' },
  { id: 'achievements', label: 'ACHIEVE',    title: 'Achievement tracker' },
  { id: 'rankings',     label: 'RANKINGS',   title: 'World leaderboards' },
  { id: 'who',          label: 'WHO',        title: 'See who is online' },
  { id: 'agents',       label: '✦ AGENTS',  title: 'AI ghost settings' },
];

export function RightBar({ onOpenPanel, activePanel }: RightBarProps) {
  const player   = useGameStore((s) => s.player);
  const ghosts   = useGameStore((s) => s.ghosts);
  const group    = useGameStore((s) => s.group);
  const combat   = useGameStore((s) => s.combat);
  const isSitting = useGameStore((s) => s.isSitting);
  const toggleAutoCombat = useGameStore((s) => s.toggleAutoCombat);
  const toggleSit        = useGameStore((s) => s.toggleSit);
  const campOut          = useGameStore((s) => s.campOut);
  const inviteGhost      = useGameStore((s) => s.inviteGhost);
  const disbandGroup     = useGameStore((s) => s.disbandGroup);

  const [selectedGhost, setSelectedGhost] = useState<GhostPlayer | null>(null);

  const groupMembers = group.members
    .map((id) => ghosts.find((g) => g.id === id))
    .filter((g): g is GhostPlayer => Boolean(g));

  const MAX_GROUP_SIZE = 5;

  const canInvite = group.members.length < MAX_GROUP_SIZE;
  const canDisband = group.members.length > 0;

  function handleInvite() {
    const onlineNotInGroup = ghosts.find(
      (g) => g.isOnline && !group.members.includes(g.id) && g.currentZone === player.currentZone
    );
    if (onlineNotInGroup) {
      inviteGhost(onlineNotInGroup.id);
    }
  }

  const btnStyle = (isActive?: boolean, isDisabled?: boolean): React.CSSProperties => ({
    background: isActive
      ? 'linear-gradient(to bottom, #2a2010 0%, #1a1508 100%)'
      : 'linear-gradient(to bottom, #251e12 0%, #120f05 100%)',
    border: '1px solid var(--eq-border)',
    borderTopColor:    isActive ? 'var(--eq-bevel-lo)' : 'var(--eq-bevel-hi)',
    borderLeftColor:   isActive ? 'var(--eq-bevel-lo)' : 'var(--eq-bevel-hi)',
    borderBottomColor: isActive ? 'var(--eq-bevel-hi)' : 'var(--eq-bevel-lo)',
    borderRightColor:  isActive ? 'var(--eq-bevel-hi)' : 'var(--eq-bevel-lo)',
    color: isActive ? '#f0e060' : isDisabled ? '#3a3020' : 'var(--eq-text)',
    fontSize: '9px', letterSpacing: '0.05em', padding: '3px 4px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    textAlign: 'center' as const, fontFamily: 'inherit',
    textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const,
    opacity: isDisabled ? 0.45 : 1,
  });

  return (
    <aside
      className="eq-window"
      style={{
        width: '140px', minWidth: '140px', flexShrink: 0,
        display: 'flex', flexDirection: 'column', gap: '3px',
        padding: '4px', borderRadius: 0, overflow: 'hidden',
      }}
    >
      {selectedGhost && <GhostDetailModal ghost={selectedGhost} onClose={() => setSelectedGhost(null)} />}

      {/* ── Character portrait ───────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '2px 2px 4px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #6a5030, #2a1a08)',
          border: '1px solid var(--eq-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', color: 'var(--eq-gold)', fontWeight: 'bold', flexShrink: 0,
        }}>
          {player.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--eq-gold)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {player.name}
          </div>
          <div style={{ fontSize: '8px', color: 'var(--eq-text-dim)' }}>
            Lv {player.level} {player.class}
          </div>
        </div>
      </div>

      {/* Player HP bar */}
      <HpBar current={player.stats.hp} max={player.stats.maxHp} colorClass="hp" height={8} />
      {CASTER_CLASSES.includes(player.class) && (
        <HpBar current={player.stats.mana} max={player.stats.maxMana} colorClass="mana" height={6} />
      )}

      {/* Effects — shows buff count placeholder */}
      <button
        style={btnStyle()}
        onClick={() => onOpenPanel('factions')}
        title="View active effects and faction standings"
      >
        EFFECTS
      </button>

      <div className="eq-divider" />

      {/* ── Party / Group ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
        <button
          style={btnStyle()}
          onClick={() => onOpenPanel('guild')}
          title="Guild management"
        >PARTY</button>
        <button
          style={btnStyle()}
          onClick={() => onOpenPanel('who')}
          title="See who is online"
        >MEMBERS</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingBottom: '2px' }}>
        {groupMembers.map((ghost) => (
          <div key={ghost.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedGhost(ghost)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '1px' }}>
              <span style={{ color: 'var(--eq-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }}>
                {ghost.name}
              </span>
              <span style={{ color: 'var(--eq-text-dim)' }}>L{ghost.level}</span>
            </div>
            <HpBar current={ghost.stats.hp} max={ghost.stats.maxHp} colorClass="hp" height={6} />
          </div>
        ))}
        {Array.from({ length: Math.max(0, MAX_GROUP_SIZE - groupMembers.length) }).map((_, i) => (
          <div key={`empty-${i}`} style={{ fontSize: '8px', color: '#1a1410', padding: '1px 0' }}>— open —</div>
        ))}
      </div>

      <div className="eq-divider" />

      {/* ── Current Target ───────────────────────────────── */}
      <div style={{
        padding: '2px 3px',
        background: combat.currentMonster ? '#1a0000' : 'transparent',
        border: `1px solid ${combat.currentMonster ? '#440000' : 'var(--eq-bevel-lo)'}`,
        minHeight: '36px',
      }}>
        <div style={{ fontSize: '8px', color: 'var(--eq-text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>
          Current Target
        </div>
        {combat.currentMonster ? (
          <>
            <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#cc4444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {combat.currentMonster.name}
            </div>
            <HpBar current={combat.monsterCurrentHp} max={combat.currentMonster.hp} colorClass="enemy" height={7} />
          </>
        ) : (
          <div style={{ fontSize: '8px', color: '#2a1a10', fontStyle: 'italic', textAlign: 'center', marginTop: '4px' }}>
            no target
          </div>
        )}
      </div>

      <div className="eq-divider" />

      {/* ── Social/combat buttons ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
        <button
          style={btnStyle()}
          onClick={() => onOpenPanel('skills')}
          title="View abilities and combat skills"
        >ABILITIES</button>
        <button
          style={btnStyle(combat.autoAttacking)}
          onClick={toggleAutoCombat}
          title={combat.autoAttacking ? 'Stop auto-combat' : 'Start auto-combat'}
        >
          {combat.autoAttacking ? 'STOP' : 'COMBAT'}
        </button>
        <button
          style={btnStyle()}
          onClick={() => onOpenPanel('who')}
          title="See who is online — chat with ghosts"
        >SOCIALS</button>
        <button
          style={btnStyle(false, !canInvite)}
          onClick={canInvite ? handleInvite : undefined}
          title={canInvite ? 'Invite nearest online ghost in your zone to group' : 'Group is full (5 members)'}
        >INVITE</button>
        <button
          style={btnStyle(false, !canDisband)}
          onClick={canDisband ? disbandGroup : undefined}
          title={canDisband ? 'Disband your current group' : 'You have no group to disband'}
        >DISBAND</button>
        <button
          style={btnStyle()}
          onClick={campOut}
          title="Camp out — stops combat and saves your progress"
        >CAMP</button>
        <button
          style={btnStyle(isSitting)}
          onClick={toggleSit}
          title={isSitting ? 'You are sitting (4× regen) — click to stand' : 'Sit to rest — 4× HP/Mana regen, disables combat'}
        >
          {isSitting ? 'STAND' : 'SIT'}
        </button>
        <button
          style={btnStyle(false, true)}
          title="Walk mode — coming soon"
        >WALK</button>
      </div>

      <div className="eq-divider" />

      {/* ── Panel access ─────────────────────────────────── */}
      <div style={{ fontSize: '8px', color: 'var(--eq-text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>
        Windows
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
        {PANEL_BUTTONS.map(({ id, label, title }) => (
          <button
            key={id}
            style={btnStyle(activePanel === id)}
            onClick={() => onOpenPanel(id)}
            title={title}
          >
            {label}
          </button>
        ))}
      </div>
    </aside>
  );
}
