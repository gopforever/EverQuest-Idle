interface HelpModalProps {
  onClose: () => void;
}

const SECTIONS = [
  {
    title: 'Getting Started',
    items: [
      'Click ATTACK (left bar) or AUTO COMBAT (right bar) to begin fighting monsters in your zone.',
      'Monsters appear automatically — defeat them to earn XP, loot, and coin.',
      'Press STOP at any time to halt combat and begin regenerating HP/Mana.',
    ],
  },
  {
    title: 'Leveling & XP',
    items: [
      'You gain XP for each monster slain. Level up to grow stronger and learn new spells.',
      'Hybrid classes (Paladin, Ranger, Shadow Knight) earn XP at 60% of normal rate — just like classic EQ.',
      'Bards earn XP at only 40% rate. Choose wisely.',
      'Death costs you 10% of your current XP to next level.',
    ],
  },
  {
    title: 'Combat & Stats',
    items: [
      'Melee damage scales with your weapon skill (rises each kill, capped at Level×5).',
      'STR above 75 adds a flat bonus to every melee hit.',
      'Defense skill increases your effective AC — train it by getting hit.',
      'AGI gives a dodge chance; DEX enables Double Attack for Warriors, Monks, Rogues, Rangers.',
      'Sitting (SIT button) disables combat and triples regen speed.',
    ],
  },
  {
    title: 'Inventory & Equipment',
    items: [
      'Open INVENTORY to see your gear, bag slots, and coin.',
      'Click any item in your bag to examine it; right-click (or the equip button) to equip it.',
      'Better gear increases your damage, AC, and stats directly.',
    ],
  },
  {
    title: 'Zones & Travel',
    items: [
      'Open ZONES to see all available hunting grounds.',
      'Each zone has a Zone Experience Modifier (ZEM) — higher ZEM = more XP per kill.',
      'Zone difficulty scales with monster levels; fight mobs within ±5 levels of you for best results.',
    ],
  },
  {
    title: 'Spells',
    items: [
      'Casters automatically learn new spells on level-up.',
      'Open SPELLS to view your spellbook and drag spells into gem slots.',
      'Memorized spells (gem slots) are cast automatically during combat based on your class role.',
    ],
  },
  {
    title: 'Ghost Players',
    items: [
      'Up to 100 AI ghost players populate the world alongside you.',
      'Use WHO to see who is online and where they are.',
      'Use RANKINGS to compare your stats against every character in the world.',
      'Ghost players use AI to chat with you in the combat log — their personalities vary wildly.',
    ],
  },
  {
    title: 'Group & Guilds',
    items: [
      'Use INVITE (right bar) to add nearby online ghosts to your group.',
      'Group members fight the same monster, share XP, and healers heal you automatically.',
      'Open GUILD to join or manage your guild.',
    ],
  },
  {
    title: 'Economy',
    items: [
      'Coin (cp/sp/gp/pp) drops from every monster kill.',
      'Open BAZAAR to buy and sell items with ghost merchants.',
      'Open TRADESKILL to combine components and craft better gear.',
    ],
  },
  {
    title: 'Saving & Safety',
    items: [
      'The game auto-saves every 30 seconds and on every zone change.',
      'Press CAMP to immediately save your progress and halt combat.',
      'Your save includes XP, inventory, spells, faction standings, and quest progress.',
    ],
  },
];

export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.88)',
        zIndex: 3000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        className="eq-window"
        style={{
          width: '560px', maxWidth: '95vw',
          maxHeight: '85vh',
          borderRadius: 0,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div
          className="eq-title-bar"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 10px', flexShrink: 0 }}
        >
          <span style={{ letterSpacing: '0.15em' }}>HELP — EVERQUEST IDLE</span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid var(--eq-bevel-lo)',
              color: 'var(--eq-text-dim)', cursor: 'pointer',
              fontSize: '10px', padding: '0 6px', fontFamily: 'inherit', lineHeight: 1.4,
            }}
            title="Close (Esc)"
          >✕</button>
        </div>

        {/* Subtitle */}
        <div style={{ background: '#0e0c06', borderBottom: '1px solid var(--eq-border)', padding: '5px 12px', flexShrink: 0 }}>
          <div style={{ color: 'var(--eq-gold)', fontSize: '11px', letterSpacing: '0.05em' }}>
            A browser-based idle RPG set in the world of classic EverQuest (1999)
          </div>
          <div style={{ color: 'var(--eq-text-dim)', fontSize: '9px', marginTop: '2px' }}>
            Combat formulas, zone experience modifiers, and class XP rates are authentic to EQ 1999.
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {SECTIONS.map((section) => (
            <div key={section.title} style={{ marginBottom: '12px' }}>
              <div style={{
                color: 'var(--eq-gold)', fontSize: '10px', fontWeight: 'bold',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                borderBottom: '1px solid var(--eq-border)', paddingBottom: '2px', marginBottom: '5px',
              }}>
                {section.title}
              </div>
              {section.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ color: 'var(--eq-bevel-hi)', flexShrink: 0, fontSize: '10px', lineHeight: '16px' }}>◆</span>
                  <span style={{ color: 'var(--eq-text)', fontSize: '11px', lineHeight: '16px' }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--eq-border)', padding: '6px 12px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--eq-text-dim)', fontSize: '9px' }}>Click anywhere outside this window or press Esc to close</span>
          <button
            className="eq-btn"
            onClick={onClose}
            style={{ padding: '3px 16px', fontSize: '10px' }}
          >
            [CLOSE]
          </button>
        </div>
      </div>
    </div>
  );
}
