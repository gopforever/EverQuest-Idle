import { useState, useCallback, useEffect } from 'react';
import { LeftBar } from './components/layout/LeftBar';
import { RightBar } from './components/layout/RightBar';
import { MainView } from './components/layout/MainView';
import { CombatLog } from './components/layout/CombatLog';
import { InventoryPanel } from './components/panels/InventoryPanel';
import { ZonesPanel } from './components/panels/ZonesPanel';
import { SkillsPanel } from './components/panels/SkillsPanel';
import { SpellsPanel } from './components/panels/SpellsPanel';
import { QuestsPanel } from './components/panels/QuestsPanel';
import { FactionsPanel } from './components/panels/FactionsPanel';
import { WhoPanel } from './components/panels/WhoPanel';
import { GuildPanel } from './components/panels/GuildPanel';
import { AchievementsPanel } from './components/panels/AchievementsPanel';
import { BazaarPanel } from './components/panels/BazaarPanel';
import { TradeskillPanel } from './components/panels/TradeskillPanel';
import { LlmSettingsPanel } from './components/panels/LlmSettingsPanel';
import { useGameLoop } from './hooks/useGameLoop';
import { useGameStore } from './store/gameStore';
import CharacterCreationScreen from './components/CharacterCreationScreen';
import { ItemExamineModal } from './components/ui/ItemExamineModal';

type PanelId =
  | 'inventory' | 'skills' | 'spells' | 'zones' | 'tradeskill'
  | 'bazaar' | 'guild' | 'achievements' | 'who' | 'agents'
  | 'quests' | 'factions';

const PANEL_TITLES: Record<PanelId, string> = {
  inventory:    'INVENTORY',
  skills:       'SKILLS',
  spells:       'SPELLBOOK',
  zones:        'ZONES',
  tradeskill:   'TRADESKILL',
  bazaar:       'THE BAZAAR',
  guild:        'GUILD',
  achievements: 'ACHIEVEMENTS',
  who:          'WHO',
  agents:       'AI AGENTS',
  quests:       'QUESTS',
  factions:     'FACTIONS',
};

function PanelContent({ activePanel }: { activePanel: PanelId }) {
  switch (activePanel) {
    case 'inventory':    return <InventoryPanel />;
    case 'zones':        return <ZonesPanel />;
    case 'skills':       return <SkillsPanel />;
    case 'spells':       return <SpellsPanel />;
    case 'who':          return <WhoPanel />;
    case 'agents':       return <LlmSettingsPanel />;
    case 'guild':        return <GuildPanel />;
    case 'achievements': return <AchievementsPanel />;
    case 'bazaar':       return <BazaarPanel />;
    case 'tradeskill':   return <TradeskillPanel />;
    case 'quests':       return <QuestsPanel />;
    case 'factions':     return <FactionsPanel />;
  }
}

/** Floating panel window that overlays the center view */
function PanelOverlay({
  panelId,
  onClose,
}: {
  panelId: PanelId;
  onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    /* Backdrop — clicking it closes the overlay */
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        /* No backdrop color — the window floats on top */
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          right: '8px',
          bottom: '8px',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'all',
        }}
      >
        <div
          className="eq-window"
          style={{
            flex: 1,
            borderRadius: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Title bar with close button */}
          <div
            className="eq-title-bar"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 8px' }}
          >
            <span>{PANEL_TITLES[panelId]}</span>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid var(--eq-bevel-lo)',
                color: 'var(--eq-text-dim)',
                cursor: 'pointer',
                fontSize: '10px',
                padding: '0 5px',
                fontFamily: 'inherit',
                lineHeight: 1.4,
              }}
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>

          {/* Panel content */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <PanelContent activePanel={panelId} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const characterCreated = useGameStore((s) => s.characterCreated);
  useGameLoop();

  const openPanel = useCallback((id: string) => {
    setActivePanel((prev) => (prev === id ? null : id as PanelId));
  }, []);

  const closePanel = useCallback(() => setActivePanel(null), []);

  if (!characterCreated) {
    return <CharacterCreationScreen />;
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--eq-bg)',
        color: 'var(--eq-text)',
        padding: '4px',
        gap: '4px',
      }}
    >
      {/* Global examine modal — renders over everything */}
      <ItemExamineModal />
      {/* ── Left bar: action buttons + spell gems ── */}
      <LeftBar onOpenPanel={openPanel} />

      {/* ── Center: zone view + chat log (+ overlay) ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, position: 'relative' }}>
        <MainView />
        <CombatLog />

        {/* Floating panel overlay */}
        {activePanel && (
          <PanelOverlay panelId={activePanel} onClose={closePanel} />
        )}
      </div>

      {/* ── Right bar: group + target + panel nav ── */}
      <RightBar onOpenPanel={openPanel} activePanel={activePanel} />
    </div>
  );
}
