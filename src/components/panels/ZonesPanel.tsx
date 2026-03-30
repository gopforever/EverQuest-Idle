import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ZONE_LIST } from '../../data/zones';
import type { Continent } from '../../types';

const CONTINENTS: Continent[] = ['Antonica', 'Faydwer', 'Odus', 'Planes'];

const ZONE_TYPE_ICON: Record<string, string> = {
  outdoor: '🌿',
  dungeon: '🪦',
  city: '🏙️',
  raid: '⚔️',
  plane: '✨',
};

const DUNGEON_LEVEL_LABEL: Record<number, string> = {
  1: 'Upper',
  2: 'Lower',
};

export function ZonesPanel() {
  const currentZone = useGameStore((s) => s.currentZone);
  const player = useGameStore((s) => s.player);
  const changeZone = useGameStore((s) => s.changeZone);

  const [collapsed, setCollapsed] = useState<Record<Continent, boolean>>({
    Antonica: false,
    Faydwer: false,
    Odus: false,
    Planes: false,
  });

  const toggleContinent = (continent: Continent) => {
    setCollapsed((prev) => ({ ...prev, [continent]: !prev[continent] }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-3" style={{ color: 'var(--eq-text)' }}>
      <div className="text-sm font-bold mb-3" style={{ color: 'var(--eq-gold)' }}>ZONE BROWSER</div>
      {CONTINENTS.map((continent) => {
        const zones = ZONE_LIST.filter((z) => z.continent === continent);
        if (zones.length === 0) return null;
        const isCollapsed = collapsed[continent];
        return (
          <div key={continent} className="mb-3">
            <button
              onClick={() => toggleContinent(continent)}
              className="w-full text-left text-xs font-bold mb-1 px-2 py-1 rounded"
              style={{
                backgroundColor: '#2a1f0a',
                color: 'var(--eq-gold)',
                border: '1px solid var(--eq-border)',
              }}
            >
              {isCollapsed ? '▶' : '▼'} {continent.toUpperCase()}
              <span style={{ color: 'var(--eq-text-dim)', fontWeight: 'normal', marginLeft: 6 }}>
                ({zones.length})
              </span>
            </button>
            {!isCollapsed && (
              <div className="space-y-1 mt-1">
                {zones.map((zone) => {
                  const isActive = zone.id === currentZone.id;
                  const locked = zone.minLevel !== undefined && player.level < zone.minLevel;
                  return (
                    <div
                      key={zone.id}
                      className="rounded border px-2 py-1.5 text-xs"
                      style={{
                        backgroundColor: isActive ? '#3a2c18' : '#0d0b08',
                        borderColor: isActive ? 'var(--eq-border-light, #8b6914)' : 'var(--eq-border)',
                        opacity: locked ? 0.5 : 1,
                      }}
                    >
                      <div className="flex items-center justify-between gap-1">
                        {/* Left: icon + name */}
                        <span
                          style={{
                            color: isActive ? 'var(--eq-gold)' : locked ? 'var(--eq-text-dim)' : 'var(--eq-text)',
                            flex: 1,
                            minWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {ZONE_TYPE_ICON[zone.type] ?? '📍'} {zone.name}
                        </span>

                        {/* Badges */}
                        <span style={{ color: 'var(--eq-text-dim)', whiteSpace: 'nowrap' }}>
                          Lv {zone.levelRange.min}–{zone.levelRange.max}
                        </span>
                        {zone.zem > 75 && (
                          <span
                            className="rounded px-1"
                            style={{ backgroundColor: '#3d2200', color: '#f59e0b', whiteSpace: 'nowrap' }}
                          >
                            ZEM {zone.zem}
                          </span>
                        )}
                        {zone.dungeonLevel !== undefined && DUNGEON_LEVEL_LABEL[zone.dungeonLevel] && (
                          <span
                            className="rounded px-1"
                            style={{ backgroundColor: '#1a1a2e', color: '#a78bfa', whiteSpace: 'nowrap' }}
                          >
                            [{DUNGEON_LEVEL_LABEL[zone.dungeonLevel]}]
                          </span>
                        )}
                        {isActive && (
                          <span
                            className="rounded px-1 font-bold"
                            style={{ backgroundColor: '#2a1f0a', color: 'var(--eq-gold)', whiteSpace: 'nowrap' }}
                          >
                            HERE
                          </span>
                        )}

                        {/* Enter / Lock button */}
                        {locked ? (
                          <span
                            title={`Requires level ${zone.minLevel}`}
                            style={{ color: '#ef4444', whiteSpace: 'nowrap', cursor: 'default' }}
                          >
                            🔒{zone.minLevel}
                          </span>
                        ) : (
                          <button
                            onClick={() => changeZone(zone.id)}
                            disabled={isActive}
                            className="rounded px-1 font-bold text-xs"
                            style={{
                              backgroundColor: isActive ? '#1a1207' : '#2a1f0a',
                              color: isActive ? 'var(--eq-text-dim)' : 'var(--eq-gold)',
                              border: '1px solid var(--eq-border)',
                              cursor: isActive ? 'default' : 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isActive ? '—' : 'ENTER'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
