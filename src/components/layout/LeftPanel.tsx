type PanelId =
  | 'inventory' | 'skills' | 'spells' | 'zones' | 'tradeskill'
  | 'bazaar' | 'guild' | 'achievements' | 'who' | 'agents'
  | 'quests' | 'factions';

interface LeftPanelProps {
  activePanel: PanelId;
  onPanelChange: (panel: PanelId) => void;
}

const PANELS: { id: PanelId; label: string }[] = [
  { id: 'inventory',    label: 'INVENTORY'  },
  { id: 'spells',       label: 'SPELLS'     },
  { id: 'skills',       label: 'SKILLS'     },
  { id: 'quests',       label: 'QUESTS'     },
  { id: 'factions',     label: 'FACTIONS'   },
  { id: 'zones',        label: 'ZONES'      },
  { id: 'tradeskill',   label: 'TRADESKILL' },
  { id: 'bazaar',       label: 'BAZAAR'     },
  { id: 'guild',        label: 'GUILD'      },
  { id: 'achievements', label: 'ACHIEVE'    },
  { id: 'who',          label: 'WHO'        },
  { id: 'agents',       label: '✦ AGENTS'  },
];

export function LeftPanel({ activePanel, onPanelChange }: LeftPanelProps) {
  return (
    <aside
      className="eq-window"
      style={{
        width: '108px',
        minWidth: '108px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        padding: '4px',
        borderRadius: 0,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Window title */}
      <div className="eq-title-bar" style={{ marginBottom: '4px', textAlign: 'center', fontSize: '9px' }}>
        WINDOWS
      </div>

      {PANELS.map((panel) => {
        const isActive = activePanel === panel.id;
        return (
          <button
            key={panel.id}
            onClick={() => onPanelChange(panel.id)}
            className="eq-btn"
            style={{
              width: '100%',
              textAlign: 'center',
              padding: '4px 4px',
              fontSize: '9px',
              letterSpacing: '0.06em',
              color:           isActive ? '#f0e060' : 'var(--eq-text-dim)',
              background:      isActive
                ? 'linear-gradient(to bottom, #2a2010 0%, #1a1508 100%)'
                : 'linear-gradient(to bottom, #251e12 0%, #120f05 100%)',
              borderTopColor:    isActive ? 'var(--eq-gold-dark)' : 'var(--eq-bevel-hi)',
              borderLeftColor:   isActive ? 'var(--eq-gold-dark)' : 'var(--eq-bevel-hi)',
              borderBottomColor: isActive ? 'var(--eq-bevel-lo)'  : 'var(--eq-bevel-lo)',
              borderRightColor:  isActive ? 'var(--eq-bevel-lo)'  : 'var(--eq-bevel-lo)',
              textShadow:        isActive ? '0 0 6px rgba(200,160,0,0.4)' : 'none',
            }}
          >
            {panel.label}
          </button>
        );
      })}
    </aside>
  );
}

export type { PanelId };
