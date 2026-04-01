import { useState } from 'react';
import { Header } from './components/layout/Header';
import { LeftPanel, type PanelId } from './components/layout/LeftPanel';
import { MainView } from './components/layout/MainView';
import { RightPanel } from './components/layout/RightPanel';
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
    default:             return null;
  }
}

export default function App() {
  const [activePanel, setActivePanel] = useState<PanelId>('inventory');
  const characterCreated = useGameStore((s) => s.characterCreated);
  useGameLoop();

  if (!characterCreated) {
    return <CharacterCreationScreen />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--eq-bg)',
        color: 'var(--eq-text)',
      }}
    >
      <Header />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '4px', gap: '4px' }}>

        {/* Left nav — window buttons */}
        <LeftPanel activePanel={activePanel} onPanelChange={setActivePanel} />

        {/* Side panel content window */}
        <div
          className="eq-window"
          style={{
            width: '270px',
            minWidth: '270px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 0,
            flexShrink: 0,
          }}
        >
          <PanelContent activePanel={activePanel} />
        </div>

        {/* Center — main view + combat log */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', gap: '0', minWidth: 0 }}>
          <MainView />
          <CombatLog />
        </div>

        {/* Right — character/target/group panel */}
        <RightPanel />
      </div>
    </div>
  );
}
