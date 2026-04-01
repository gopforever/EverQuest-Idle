import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Item, CharacterClass, ItemStats, EquipSlot } from '../../types';

// ── Abbreviation maps ─────────────────────────────────────────────────────────
const CLASS_ABBR: Record<CharacterClass, string> = {
  Warrior:     'WAR', Cleric:      'CLR', Paladin:      'PAL',
  Ranger:      'RNG', ShadowKnight:'SK',  Druid:        'DRU',
  Monk:        'MNK', Bard:        'BRD', Rogue:        'ROG',
  Shaman:      'SHM', Necromancer: 'NEC', Wizard:       'WIZ',
  Magician:    'MAG', Enchanter:   'ENC',
};

const RACE_ABBR: Partial<Record<string, string>> = {
  Human:      'HUM', Barbarian:  'BAR', Erudite:  'ERU',
  'Wood Elf': 'ELF', 'High Elf': 'HEL', 'Dark Elf': 'DEL',
  'Half Elf': 'HEF', Dwarf:     'DWF', Troll:    'TRL',
  Ogre:       'OGR', Halfling:   'HFL', Gnome:    'GNM',
};

function getSize(weight: number): string {
  if (weight < 0.3) return 'SMALL';
  if (weight < 1.5) return 'MEDIUM';
  if (weight < 4.0) return 'LARGE';
  return 'GIANT';
}

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'uncommon':  return '#5599ff';
    case 'rare':      return '#aa44ff';
    case 'epic':      return '#ff8800';
    case 'legendary': return '#ffdd00';
    default:          return '#d4a520';
  }
}

// ── Stat delta display ────────────────────────────────────────────────────────
function StatDelta({ val, cmp }: { val?: number; cmp?: number }) {
  if (!val && !cmp) return null;
  const current  = val ?? 0;
  const equipped = cmp ?? 0;
  const delta    = current - equipped;
  if (delta === 0) return null;
  return (
    <span style={{
      fontSize: '8px',
      color: delta > 0 ? '#44cc44' : '#cc4444',
      marginLeft: '3px',
      fontWeight: 'bold',
    }}>
      {delta > 0 ? `+${delta}` : `${delta}`}
    </span>
  );
}

// ── A single stat row ─────────────────────────────────────────────────────────
function StatRow({
  label,
  value,
  cmpValue,
  unit = '',
}: {
  label: string;
  value?: number | string;
  cmpValue?: number;
  unit?: string;
}) {
  if (value === undefined || value === null || value === 0) return null;

  const numVal = typeof value === 'number' ? value : undefined;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0', fontSize: '11px' }}>
      <span style={{ color: '#a09080', minWidth: '90px' }}>{label}:</span>
      <span style={{ color: 'var(--eq-text)', fontWeight: 'bold' }}>
        {value}{unit}
        {numVal !== undefined && (
          <StatDelta val={numVal} cmp={cmpValue} />
        )}
      </span>
    </div>
  );
}

// ── Stat block (two columns for attributes/resists) ───────────────────────────
function StatGrid({ pairs }: {
  pairs: Array<{ label: string; val?: number; cmp?: number }>;
}) {
  const visible = pairs.filter((p) => (p.val ?? 0) !== 0);
  if (visible.length === 0) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '8px', rowGap: '1px' }}>
      {visible.map(({ label, val, cmp }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
          <span style={{ color: '#a09080' }}>{label}:</span>
          <span style={{ color: 'var(--eq-text)', fontWeight: 'bold' }}>
            {val}
            <StatDelta val={val} cmp={cmp} />
          </span>
        </div>
      ))}
    </div>
  );
}

function EQDivider() {
  return <div style={{ height: '1px', background: 'var(--eq-bevel-lo)', margin: '5px 0' }} />;
}

// ── Get paired slot for gear lookup ──────────────────────────────────────────
function getEquippedItem(gear: Record<string, Item | null | undefined>, slot: EquipSlot | null): Item | null {
  if (!slot) return null;
  return (gear[slot] as Item | null | undefined) ?? null;
}

// ── Main modal ───────────────────────────────────────────────────────────────
export function ItemExamineModal() {
  const item         = useGameStore((s) => s.examineItem);
  const gear         = useGameStore((s) => s.player.gear);
  const setExamine   = useGameStore((s) => s.setExamineItem);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setExamine(null);
    }
    if (item) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, setExamine]);

  if (!item) return null;

  const equipped = getEquippedItem(gear as Record<string, Item | null | undefined>, item.slot);
  const es: ItemStats = equipped?.stats ?? {};
  const s: ItemStats  = item.stats;

  const rColor = getRarityColor(item.rarity);

  // Tags
  const tags: string[] = [];
  if (item.rarity !== 'common') tags.push('MAGIC');
  if (item.lore) tags.push('LORE');
  if (item.noDrop) tags.push('NO DROP');
  if (!item.stackable) {} // baseline

  // Class/Race text
  const classText = item.classes === 'ALL'
    ? 'ALL'
    : item.classes.map((c) => CLASS_ABBR[c] ?? c).join(' ');

  const raceText = item.races === 'ALL'
    ? 'ALL'
    : item.races.map((r) => RACE_ABBR[r] ?? r).join(' ');

  const isWeapon = item.type === 'weapon' || (s.damage !== undefined && s.damage > 0);

  return (
    /* Full-screen backdrop */
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
      }}
      onClick={() => setExamine(null)}
    >
      {/* Modal window — stop propagation so clicking inside doesn't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '360px',
          maxHeight: '88vh',
          overflowY: 'auto',
          fontFamily: 'var(--eq-font, "Courier New", monospace)',
          background: 'linear-gradient(to bottom, #0e0c07, #080600)',
          border: '2px solid var(--eq-bevel-hi)',
          borderTopColor: 'var(--eq-bevel-lo)',
          borderLeftColor: 'var(--eq-bevel-lo)',
          boxShadow: '0 0 0 1px var(--eq-bevel-hi), 4px 4px 12px rgba(0,0,0,0.95)',
        }}
      >
        {/* ── Title bar ──────────────────────────────────────────────── */}
        <div
          style={{
            padding: '5px 8px',
            borderBottom: '1px solid var(--eq-bevel-lo)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(to right, #1a1408, #0e0c07)',
          }}
        >
          <span style={{ fontSize: '9px', letterSpacing: '0.14em', color: 'var(--eq-text-dim)', textTransform: 'uppercase' }}>
            ITEM INFORMATION
          </span>
          <button
            onClick={() => setExamine(null)}
            style={{
              background: 'none',
              border: '1px solid var(--eq-bevel-lo)',
              color: 'var(--eq-text-dim)',
              cursor: 'pointer',
              fontSize: '9px',
              padding: '1px 5px',
              fontFamily: 'inherit',
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div style={{ padding: '10px 12px' }}>

          {/* ── Item header: icon + name ──────────────────────────────── */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
            {/* Item icon (stylized box) */}
            <div style={{
              width: '44px',
              height: '44px',
              flexShrink: 0,
              background: 'linear-gradient(135deg, #2a1e10, #0a0805)',
              border: `2px solid ${rColor}`,
              borderTopColor: `${rColor}88`,
              borderLeftColor: `${rColor}88`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: `inset 0 0 8px rgba(0,0,0,0.8), 0 0 6px ${rColor}33`,
            }}>
              {item.type === 'weapon' ? '⚔' :
               item.type === 'armor' ? '🛡' :
               item.type === 'shield' ? '🔰' :
               item.type === 'jewelry' ? '💎' :
               item.type === 'scroll' ? '📜' : '◈'}
            </div>

            {/* Name + tags */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: rColor,
                lineHeight: 1.3,
                textShadow: `0 0 8px ${rColor}44`,
                wordBreak: 'break-word',
              }}>
                {item.name}
              </div>
              {tags.length > 0 && (
                <div style={{ fontSize: '10px', color: '#cc9944', marginTop: '2px', letterSpacing: '0.06em' }}>
                  {tags.join(', ')}
                </div>
              )}
              <div style={{ fontSize: '10px', color: '#7a6040', marginTop: '1px' }}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </div>
            </div>
          </div>

          {/* ── Restrictions ─────────────────────────────────────────── */}
          <div style={{ fontSize: '10px', lineHeight: 1.6, marginBottom: '6px' }}>
            {item.classes !== 'ALL' && (
              <div>
                <span style={{ color: '#7a6040' }}>Class: </span>
                <span style={{ color: '#c09050' }}>{classText}</span>
              </div>
            )}
            {item.races !== 'ALL' && (
              <div>
                <span style={{ color: '#7a6040' }}>Race: </span>
                <span style={{ color: '#c09050' }}>{raceText}</span>
              </div>
            )}
            {item.slot && (
              <div>
                <span style={{ color: '#7a6040' }}>Slot: </span>
                <span style={{ color: '#c09050' }}>{item.slot}</span>
              </div>
            )}
          </div>

          <EQDivider />

          {/* ── General properties ───────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '8px', rowGap: '1px', marginBottom: '4px' }}>
            <StatRow label="Size"      value={getSize(item.weight)} />
            <StatRow label="Weight"    value={item.weight.toFixed(1)} />
            {item.recLevel !== undefined && item.recLevel > 0 && (
              <StatRow label="Rec Level" value={item.recLevel} />
            )}
            {item.reqLevel !== undefined && item.reqLevel > 0 && (
              <StatRow label="Req Level" value={item.reqLevel} />
            )}
          </div>

          {/* ── Weapon stats ─────────────────────────────────────────── */}
          {isWeapon && (s.damage !== undefined || s.delay !== undefined) && (
            <>
              <EQDivider />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', columnGap: '8px', rowGap: '1px', marginBottom: '4px' }}>
                {s.damage !== undefined && s.damage > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ color: '#a09080' }}>Dmg:</span>
                    <span style={{ color: '#ff9944', fontWeight: 'bold' }}>
                      {s.damage}
                      <StatDelta val={s.damage} cmp={es.damage} />
                    </span>
                  </div>
                )}
                {s.delay !== undefined && s.delay > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ color: '#a09080' }}>Dly:</span>
                    <span style={{ color: 'var(--eq-text)', fontWeight: 'bold' }}>{s.delay}</span>
                  </div>
                )}
                {s.damage !== undefined && s.delay !== undefined && s.delay > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ color: '#a09080' }}>Ratio:</span>
                    <span style={{ color: '#cc8844', fontWeight: 'bold' }}>
                      {(s.damage / s.delay * 100).toFixed(0)}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Defensive stats ──────────────────────────────────────── */}
          {(s.ac || s.hp || s.mana || s.endurance) && (
            <>
              <EQDivider />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '8px', rowGap: '1px', marginBottom: '4px' }}>
                {(s.ac ?? 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ color: '#a09080' }}>AC:</span>
                    <span style={{ color: '#66ccff', fontWeight: 'bold' }}>
                      {s.ac}<StatDelta val={s.ac} cmp={es.ac} />
                    </span>
                  </div>
                )}
                {(s.hp ?? 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ color: '#a09080' }}>HP:</span>
                    <span style={{ color: '#dd4444', fontWeight: 'bold' }}>
                      {s.hp}<StatDelta val={s.hp} cmp={es.hp} />
                    </span>
                  </div>
                )}
                {(s.mana ?? 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ color: '#a09080' }}>Mana:</span>
                    <span style={{ color: '#4488ff', fontWeight: 'bold' }}>
                      {s.mana}<StatDelta val={s.mana} cmp={es.mana} />
                    </span>
                  </div>
                )}
                {(s.endurance ?? 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ color: '#a09080' }}>End:</span>
                    <span style={{ color: '#88cc44', fontWeight: 'bold' }}>
                      {s.endurance}<StatDelta val={s.endurance} cmp={es.endurance} />
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Attributes ───────────────────────────────────────────── */}
          {(s.str || s.sta || s.agi || s.dex || s.wis || s.int || s.cha) && (
            <>
              <EQDivider />
              <StatGrid pairs={[
                { label: 'Strength',      val: s.str, cmp: es.str },
                { label: 'Stamina',       val: s.sta, cmp: es.sta },
                { label: 'Agility',       val: s.agi, cmp: es.agi },
                { label: 'Dexterity',     val: s.dex, cmp: es.dex },
                { label: 'Wisdom',        val: s.wis, cmp: es.wis },
                { label: 'Intelligence',  val: s.int, cmp: es.int },
                { label: 'Charisma',      val: s.cha, cmp: es.cha },
              ]} />
            </>
          )}

          {/* ── Saves ────────────────────────────────────────────────── */}
          {(s.svMagic || s.svFire || s.svCold || s.svDisease || s.svPoison) && (
            <>
              <EQDivider />
              <StatGrid pairs={[
                { label: 'Magic', val: s.svMagic,   cmp: es.svMagic   },
                { label: 'Fire',  val: s.svFire,    cmp: es.svFire    },
                { label: 'Cold',  val: s.svCold,    cmp: es.svCold    },
                { label: 'Dis.',  val: s.svDisease, cmp: es.svDisease },
                { label: 'Poison',val: s.svPoison,  cmp: es.svPoison  },
              ]} />
            </>
          )}

          {/* ── Combat misc ──────────────────────────────────────────── */}
          {(s.attack || s.hpRegen || s.manaRegen || s.avoidance || s.spellDmg || s.dotShield) && (
            <>
              <EQDivider />
              <StatGrid pairs={[
                { label: 'Attack',     val: s.attack,    cmp: es.attack    },
                { label: 'HP Regen',   val: s.hpRegen,   cmp: es.hpRegen   },
                { label: 'Mana Regen', val: s.manaRegen, cmp: es.manaRegen },
                { label: 'Avoidance',  val: s.avoidance, cmp: es.avoidance },
                { label: 'Spell Dmg',  val: s.spellDmg,  cmp: es.spellDmg  },
                { label: 'DoT Shield', val: s.dotShield,  cmp: es.dotShield  },
              ]} />
            </>
          )}

          <EQDivider />

          {/* ── Comparison note ──────────────────────────────────────── */}
          {equipped ? (
            <div style={{
              fontSize: '9px',
              color: '#6a5030',
              fontStyle: 'italic',
              marginBottom: '6px',
              lineHeight: 1.5,
            }}>
              Comparing vs. <span style={{ color: '#a08040' }}>{equipped.name}</span>
              {' '}(equipped in {item.slot})
            </div>
          ) : item.slot ? (
            <div style={{
              fontSize: '9px',
              color: '#6a5030',
              fontStyle: 'italic',
              marginBottom: '6px',
            }}>
              Slot {item.slot} is currently empty.
            </div>
          ) : null}

          {/* ── Description ──────────────────────────────────────────── */}
          {item.description && (
            <div style={{
              fontSize: '10px',
              color: '#8a7050',
              fontStyle: 'italic',
              lineHeight: 1.5,
              marginBottom: '6px',
              borderLeft: '2px solid var(--eq-bevel-lo)',
              paddingLeft: '6px',
            }}>
              {item.description}
            </div>
          )}

          {/* ── Source / value ───────────────────────────────────────── */}
          <div style={{
            fontSize: '9px',
            color: '#4a3820',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}>
            <span>Source: {item.source}</span>
            <span>Value: {item.value > 0 ? `${item.value} cp` : 'No value'}</span>
          </div>

          {/* ── Close button ─────────────────────────────────────────── */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setExamine(null)}
              style={{
                background: 'linear-gradient(to bottom, #251e12 0%, #120f05 100%)',
                border: '1px solid var(--eq-border)',
                borderTopColor: 'var(--eq-bevel-hi)',
                borderLeftColor: 'var(--eq-bevel-hi)',
                borderBottomColor: 'var(--eq-bevel-lo)',
                borderRightColor: 'var(--eq-bevel-lo)',
                color: 'var(--eq-text)',
                fontSize: '10px',
                letterSpacing: '0.1em',
                padding: '5px 28px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textTransform: 'uppercase',
              }}
            >
              [ CLOSE ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
