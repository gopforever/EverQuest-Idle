type PanelId = 'inventory' | 'skills' | 'spells' | 'zones' | 'tradeskill' | 'bazaar' | 'guild' | 'achievements' | 'who';

interface LeftPanelProps {
  activePanel: PanelId;
  onPanelChange: (panel: PanelId) => void;
}

const PANELS: { id: PanelId; label: string }[] = [
  { id: 'inventory', label: 'INVENTORY' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'spells', label: 'SPELLS' },
  { id: 'zones', label: 'ZONES' },
  { id: 'tradeskill', label: 'TRADESKILL' },
  { id: 'bazaar', label: 'BAZAAR' },
  { id: 'guild', label: 'GUILD' },
  { id: 'achievements', label: 'ACHIEVE' },
  { id: 'who', label: 'WHO' },
];

export function LeftPanel({ activePanel, onPanelChange }: LeftPanelProps) {
  return (
    <aside
      className="flex flex-col gap-1 p-2 border-r"
      style={{
        width: '120px',
        minWidth: '120px',
        backgroundColor: 'var(--eq-panel)',
        borderColor: 'var(--eq-border)',
      }}
    >
      {PANELS.map((panel) => (
        <button
          key={panel.id}
          onClick={() => onPanelChange(panel.id)}
          className="w-full px-2 py-1.5 text-xs text-left rounded border transition-colors"
          style={{
            backgroundColor: activePanel === panel.id ? '#3a2c18' : '#1a1510',
            borderColor: activePanel === panel.id ? 'var(--eq-border-light)' : 'var(--eq-border)',
            color: activePanel === panel.id ? 'var(--eq-gold)' : 'var(--eq-text)',
            fontWeight: activePanel === panel.id ? 'bold' : 'normal',
          }}
        >
          {panel.label}
        </button>
      ))}
    </aside>
  );
}

export type { PanelId };
