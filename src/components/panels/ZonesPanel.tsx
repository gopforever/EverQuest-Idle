import { useGameStore } from '../../store/gameStore';
import { ZONE_LIST } from '../../data/zones';
import type { Continent } from '../../types';

const CONTINENTS: Continent[] = ['Antonica', 'Faydwer', 'Odus', 'Planes'];

const ZONE_TYPE_ICON: Record<string, string> = {
  outdoor: '🌲',
  dungeon: '🏚',
  city: '🏙',
  raid: '⚔️',
  plane: '✨',
};

export function ZonesPanel() {
  const currentZone = useGameStore((s) => s.currentZone);
  const player = useGameStore((s) => s.player);
  const changeZone = useGameStore((s) => s.changeZone);

  return (
    <div className="flex-1 overflow-y-auto p-3" style={{ color: 'var(--eq-text)' }}>
      <div className="text-sm font-bold mb-3" style={{ color: 'var(--eq-gold)' }}>ZONE BROWSER</div>
      {CONTINENTS.map((continent) => {
        const zones = ZONE_LIST.filter((z) => z.continent === continent);
        if (zones.length === 0) return null;
        return (
          <div key={continent} className="mb-4">
            <div
              className="text-xs font-bold mb-2 px-2 py-1 rounded"
              style={{ backgroundColor: '#2a1f0a', color: 'var(--eq-gold)', border: '1px solid var(--eq-border)' }}
            >
              {continent}
            </div>
            <div className="space-y-1">
              {zones.map((zone) => {
                const isActive = zone.id === currentZone.id;
                const tooLow = player.level < zone.levelRange.min - 5 && zone.levelRange.min > 1;
                return (
                  <button
                    key={zone.id}
                    onClick={() => changeZone(zone.id)}
                    disabled={tooLow}
                    className="w-full text-left px-2 py-1.5 rounded border text-xs transition-colors disabled:opacity-40"
                    style={{
                      backgroundColor: isActive ? '#3a2c18' : '#0d0b08',
                      borderColor: isActive ? 'var(--eq-border-light)' : 'var(--eq-border)',
                      color: isActive ? 'var(--eq-gold)' : tooLow ? 'var(--eq-text-dim)' : 'var(--eq-text)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {ZONE_TYPE_ICON[zone.type] ?? '📍'} {zone.name}
                      </span>
                      <span style={{ color: 'var(--eq-text-dim)' }}>
                        {zone.levelRange.min}-{zone.levelRange.max}
                      </span>
                    </div>
                    <div style={{ color: 'var(--eq-text-dim)' }} className="mt-0.5">
                      {zone.type} · ZEM {zone.zem}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
