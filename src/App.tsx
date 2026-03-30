import { useState } from 'react';
import { Header } from './components/layout/Header';
import { LeftPanel, type PanelId } from './components/layout/LeftPanel';
import { MainView } from './components/layout/MainView';
import { RightPanel } from './components/layout/RightPanel';
import { CombatLog } from './components/layout/CombatLog';
import { InventoryPanel } from './components/panels/InventoryPanel';
import { ZonesPanel } from './components/panels/ZonesPanel';
import { useGameLoop } from './hooks/useGameLoop';
import { useGameStore } from './store/gameStore';

function PlaceholderPanel({ title }: { title: string }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center" style={{ color: 'var(--eq-text-dim)' }}>
      <div className="text-center">
        <div className="text-2xl mb-2">🚧</div>
        <div className="font-bold" style={{ color: 'var(--eq-gold)' }}>{title}</div>
        <div className="text-xs mt-1">Coming Soon</div>
      </div>
    </div>
  );
}

function PanelContent({ activePanel }: { activePanel: PanelId }) {
  switch (activePanel) {
    case 'inventory': return <InventoryPanel />;
    case 'zones': return <ZonesPanel />;
    default: return <PlaceholderPanel title={activePanel.toUpperCase()} />;
  }
}

/** Compact status bar showing engine is ticking + key player stats. */
function StatusBar() {
  const player = useGameStore((s) => s.player);
  const tickCount = useGameStore((s) => s.tickCount);
  const currentZone = useGameStore((s) => s.currentZone);

  const xpPct = player.xpToNextLevel > 0
    ? Math.floor((player.xp / player.xpToNextLevel) * 100)
    : 0;

  return (
    <div
      className="flex items-center gap-4 px-3 py-1 text-xs border-b"
      style={{ borderColor: 'var(--eq-border)', backgroundColor: 'var(--eq-panel)', color: 'var(--eq-text-dim)' }}
    >
      <span style={{ color: 'var(--eq-gold)' }}>{player.name}</span>
      <span>Lv {player.level} {player.class}</span>
      <span>XP: {xpPct}%</span>
      <span>Zone: <span style={{ color: 'var(--eq-gold)' }}>{currentZone.name}</span></span>
      <span style={{ marginLeft: 'auto' }}>
        ⏱ Tick <span style={{ color: 'var(--eq-gold)' }}>#{tickCount}</span>
      </span>
    </div>
  );
}

export default function App() {
  const [activePanel, setActivePanel] = useState<PanelId>('inventory');
  useGameLoop();

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--eq-bg)', color: 'var(--eq-text)', fontFamily: '"Palatino Linotype", Palatino, Georgia, serif' }}
    >
      <Header />
      <StatusBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Left nav */}
        <LeftPanel activePanel={activePanel} onPanelChange={setActivePanel} />

        {/* Side panel content */}
        <div
          className="flex flex-col border-r overflow-hidden"
          style={{ width: '260px', minWidth: '260px', borderColor: 'var(--eq-border)', backgroundColor: 'var(--eq-panel)' }}
        >
          <PanelContent activePanel={activePanel} />
        </div>

        {/* Main view + combat log */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <MainView />
          <CombatLog />
        </div>

        {/* Right panel */}
        <RightPanel />
      </div>
    </div>
  );
}
