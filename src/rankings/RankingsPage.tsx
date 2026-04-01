import React, { useEffect, useState, useMemo } from 'react';
import localforage from 'localforage';

const SAVE_KEY = 'everquest_idle_save';

// ── Types (minimal, matching main game types) ─────────────────────────────────
interface CharacterStats { maxHp: number; maxMana: number; ac: number; str: number; agi: number; wis: number; int: number; cha: number; }
interface GhostPlayer { id: string; name: string; race: string; class: string; level: number; xp: number; xpToNextLevel: number; isOnline: boolean; currentZone: string; currentActivity: string; stats: CharacterStats; deathCount: number; totalKills?: number; achievements: string[]; skills: Record<string, number>; plat: number; reputation?: { killPoints: number; craftPoints: number; raidPoints: number; tradingPoints: number }; guildName?: string; }
interface PlayerTracking { totalKills: number; totalDeaths: number; highestDamage: number; zonesVisited: string[]; }
interface PlayerCharacter { name: string; race: string; class: string; level: number; xp: number; xpToNextLevel: number; stats: CharacterStats; currentZone: string; deathCount: number; tracking?: PlayerTracking; }
interface GameState { player?: PlayerCharacter; ghosts?: GhostPlayer[]; }

// ── Class colours matching the main app ──────────────────────────────────────
const CLASS_COLORS: Record<string, string> = {
  Warrior: '#c4a35a', Paladin: '#a0c4ff', ShadowKnight: '#b87fff',
  Ranger: '#6fcf97', Druid: '#f2994a', Monk: '#e2c96e',
  Bard: '#56ccf2', Rogue: '#f2c94c', Shaman: '#9b51e0',
  Necromancer: '#a0a0a0', Wizard: '#4fc3f7', Magician: '#ff8a65',
  Enchanter: '#ce93d8', Cleric: '#fff9c4', Beastlord: '#80cbc4',
};

const CLASS_ICONS: Record<string, string> = {
  Warrior: '⚔️', Paladin: '✝️', ShadowKnight: '💀', Ranger: '🏹',
  Druid: '🌿', Monk: '👊', Bard: '🎵', Rogue: '🗡️', Shaman: '🔮',
  Necromancer: '☠️', Wizard: '⚡', Magician: '🔥', Enchanter: '✨',
  Cleric: '🛡️', Beastlord: '🐾',
};

const ZONE_NAMES: Record<string, string> = {
  qeynos_hills: 'Qeynos Hills', west_commonlands: 'West Commonlands',
  east_commonlands: 'East Commonlands', north_ro: 'Northern Desert of Ro',
  south_ro: 'Southern Desert of Ro', oasis_of_marr: 'Oasis of Marr',
  kurn_tower: "Kurn's Tower", field_of_bone: 'Field of Bone',
  lake_of_ill_omen: 'Lake of Ill Omen', overthere: 'The Overthere',
  plane_of_fear: 'Plane of Fear', plane_of_hate: 'Plane of Hate',
  plane_of_sky: 'Plane of Sky', crushbone: 'Crushbone',
  unrest: 'Estate of Unrest', lower_guk: 'Lower Guk',
};

type SortKey = 'level' | 'kills' | 'deaths' | 'hp' | 'ac' | 'str' | 'xp';

interface RankEntry {
  id: string; name: string; cls: string; race: string; level: number;
  zone: string; maxHp: number; ac: number; str: number;
  kills: number; deaths: number; xpPct: number; isPlayer: boolean;
  isOnline: boolean; achievements: string[]; plat: number;
  killPoints: number; guildName?: string;
}

// ── Achievements ──────────────────────────────────────────────────────────────
const ACHIEVEMENT_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  firstBlood:   { label: 'First Blood',     icon: '🩸', desc: 'Made their first kill' },
  centuryKill:  { label: 'Centurion',       icon: '💯', desc: 'Reached 100 kills' },
  millKill:     { label: 'Slaughterer',     icon: '🔪', desc: 'Reached 1000 kills' },
  ding10:       { label: 'Rising Star',     icon: '⭐', desc: 'Reached level 10' },
  ding20:       { label: 'Veteran',         icon: '🌟', desc: 'Reached level 20' },
  ding50:       { label: 'Legend',          icon: '👑', desc: 'Reached level 50' },
  ding60:       { label: 'Epicus Maximus',  icon: '🏆', desc: 'Reached max level 60!' },
  deathless:    { label: 'Deathless',       icon: '🛡️', desc: 'Reached level 10 with no deaths' },
  dyingOften:   { label: 'The Unlucky',     icon: '💀', desc: 'Died more than 10 times' },
  wealthyAdv:   { label: 'Wealthy',         icon: '💰', desc: 'Earned 1000 platinum' },
  raidSlayer:   { label: 'Raid Slayer',     icon: '🐉', desc: 'Killed a raid boss' },
  pvpChampion:  { label: 'PvP Champion',    icon: '⚔️', desc: 'Won 10 PvP encounters' },
  tradeskillGuru: { label: 'Craftmaster',   icon: '🔨', desc: 'Mastered a tradeskill' },
};

// ── Helper: format numbers ────────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

// ── Server stats sidebar ──────────────────────────────────────────────────────
function ServerStats({ entries }: { entries: RankEntry[] }) {
  const online = entries.filter(e => e.isOnline).length;
  const topKiller = [...entries].sort((a, b) => b.kills - a.kills)[0];
  const topLevel  = [...entries].sort((a, b) => b.level - a.level)[0];
  const totalKills = entries.reduce((s, e) => s + e.kills, 0);
  const totalDeaths = entries.reduce((s, e) => s + e.deaths, 0);

  return (
    <div className="server-stats">
      <h3>Norrath Status</h3>
      <div className="stat-row"><span className="label">Server</span><span className="value online">Online ●</span></div>
      <div className="stat-row"><span className="label">Players Online</span><span className="value">{online}</span></div>
      <div className="stat-row"><span className="label">Total Adventurers</span><span className="value">{entries.length}</span></div>
      <div className="stat-row"><span className="label">Total Kills</span><span className="value">{fmt(totalKills)}</span></div>
      <div className="stat-row"><span className="label">Total Deaths</span><span className="value">{fmt(totalDeaths)}</span></div>
      {topLevel && (
        <div className="stat-row"><span className="label">Highest Level</span>
          <span className="value" style={{ color: CLASS_COLORS[topLevel.cls] }}>
            {CLASS_ICONS[topLevel.cls]} {topLevel.name} ({topLevel.level})
          </span>
        </div>
      )}
      {topKiller && topKiller.kills > 0 && (
        <div className="stat-row"><span className="label">Top Killer</span>
          <span className="value" style={{ color: CLASS_COLORS[topKiller.cls] }}>
            {CLASS_ICONS[topKiller.cls]} {topKiller.name} ({fmt(topKiller.kills)})
          </span>
        </div>
      )}
    </div>
  );
}

// ── Achievement badge ─────────────────────────────────────────────────────────
function AchievBadge({ id }: { id: string }) {
  const a = ACHIEVEMENT_LABELS[id];
  if (!a) return <span className="achiev-badge unknown" title={id}>{id}</span>;
  return (
    <span className="achiev-badge" title={a.desc}>
      {a.icon} {a.label}
    </span>
  );
}

// ── XP bar ────────────────────────────────────────────────────────────────────
function XpBar({ pct, level }: { pct: number; level: number }) {
  if (level >= 60) return <span style={{ color: '#d4a520', fontWeight: 'bold' }}>MAX</span>;
  return (
    <div className="xp-bar-wrap">
      <div className="xp-bar-fill" style={{ width: `${Math.min(pct, 100).toFixed(1)}%` }} />
      <span className="xp-bar-label">{pct.toFixed(1)}%</span>
    </div>
  );
}

// ── Character detail card (expandable row) ────────────────────────────────────
function DetailRow({ entry }: { entry: RankEntry }) {
  return (
    <tr className="detail-row">
      <td colSpan={9}>
        <div className="detail-card">
          <div className="detail-section">
            <h4>Stats</h4>
            <div className="detail-grid">
              <span>Max HP: <b>{entry.maxHp}</b></span>
              <span>AC: <b>{entry.ac}</b></span>
              <span>STR: <b>{entry.str}</b></span>
              <span>Kills: <b>{fmt(entry.kills)}</b></span>
              <span>Deaths: <b>{entry.deaths}</b></span>
              <span>Plat: <b>{entry.plat}</b></span>
              <span>Guild Kills: <b>{entry.killPoints}</b></span>
              {entry.guildName && <span>Guild: <b>{entry.guildName}</b></span>}
              <span>Zone: <b>{ZONE_NAMES[entry.zone] ?? entry.zone}</b></span>
            </div>
          </div>
          {entry.achievements.length > 0 && (
            <div className="detail-section">
              <h4>Achievements ({entry.achievements.length})</h4>
              <div className="achiev-list">
                {entry.achievements.map(id => <AchievBadge key={id} id={id} />)}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function RankingsPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>('level');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [filterCls, setFilterCls] = useState('');
  const [showOffline, setShowOffline] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'achievements' | 'guilds'>('leaderboard');

  useEffect(() => {
    localforage.getItem<GameState>(SAVE_KEY).then(saved => {
      setGameState(saved ?? {});
      setLoading(false);
    }).catch(() => { setLoading(false); });
  }, []);

  const entries = useMemo<RankEntry[]>(() => {
    if (!gameState) return [];
    const list: RankEntry[] = [];

    // Real player
    const p = gameState.player;
    if (p) {
      list.push({
        id: '__player__', name: p.name, cls: p.class, race: p.race,
        level: p.level, zone: p.currentZone,
        maxHp: p.stats?.maxHp ?? 0, ac: p.stats?.ac ?? 0, str: p.stats?.str ?? 0,
        kills: p.tracking?.totalKills ?? 0,
        deaths: p.deathCount ?? 0,
        xpPct: p.xpToNextLevel > 0 ? (p.xp / p.xpToNextLevel) * 100 : 0,
        isPlayer: true, isOnline: true,
        achievements: [],
        plat: 0, killPoints: 0,
      });
    }

    // Ghosts
    (gameState.ghosts ?? []).forEach(g => {
      list.push({
        id: g.id, name: g.name, cls: g.class, race: g.race,
        level: g.level, zone: g.currentZone,
        maxHp: g.stats?.maxHp ?? 0, ac: g.stats?.ac ?? 0, str: g.stats?.str ?? 0,
        kills: g.totalKills ?? 0,
        deaths: g.deathCount ?? 0,
        xpPct: g.xpToNextLevel > 0 ? (g.xp / g.xpToNextLevel) * 100 : 0,
        isPlayer: false, isOnline: g.isOnline,
        achievements: g.achievements ?? [],
        plat: g.plat ?? 0,
        killPoints: g.reputation?.killPoints ?? 0,
        guildName: g.guildName,
      });
    });

    return list;
  }, [gameState]);

  const allClasses = useMemo(() => {
    const s = new Set(entries.map(e => e.cls));
    return [...s].sort();
  }, [entries]);

  const filtered = useMemo(() => {
    let list = entries;
    if (!showOffline) list = list.filter(e => e.isOnline || e.isPlayer);
    if (filterText) list = list.filter(e => e.name.toLowerCase().includes(filterText.toLowerCase()) || e.race.toLowerCase().includes(filterText.toLowerCase()));
    if (filterCls) list = list.filter(e => e.cls === filterCls);
    return [...list].sort((a, b) => {
      let va = 0, vb = 0;
      switch (sortBy) {
        case 'level': va = a.level; vb = b.level; break;
        case 'kills': va = a.kills; vb = b.kills; break;
        case 'deaths': va = a.deaths; vb = b.deaths; break;
        case 'hp': va = a.maxHp; vb = b.maxHp; break;
        case 'ac': va = a.ac; vb = b.ac; break;
        case 'str': va = a.str; vb = b.str; break;
        case 'xp': va = a.xpPct; vb = b.xpPct; break;
      }
      return sortAsc ? va - vb : vb - va;
    });
  }, [entries, sortBy, sortAsc, filterText, filterCls, showOffline]);

  function handleSort(key: SortKey) {
    if (sortBy === key) setSortAsc(p => !p);
    else { setSortBy(key); setSortAsc(false); }
  }

  function SortTh({ k, label }: { k: SortKey; label: string }) {
    const active = sortBy === k;
    return (
      <th onClick={() => handleSort(k)} style={{ cursor: 'pointer', userSelect: 'none' }}>
        {label} {active ? (sortAsc ? '▲' : '▼') : <span style={{ opacity: 0.3 }}>▼</span>}
      </th>
    );
  }

  // Achievement showcase: all unique achievements across all characters
  const achievShowcase = useMemo(() => {
    const map = new Map<string, RankEntry[]>();
    entries.forEach(e => {
      e.achievements.forEach(id => {
        if (!map.has(id)) map.set(id, []);
        map.get(id)!.push(e);
      });
    });
    return map;
  }, [entries]);

  // Guilds tab
  const guilds = useMemo(() => {
    const map = new Map<string, RankEntry[]>();
    entries.forEach(e => {
      if (e.guildName) {
        if (!map.has(e.guildName)) map.set(e.guildName, []);
        map.get(e.guildName)!.push(e);
      }
    });
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [entries]);

  if (loading) {
    return (
      <div className="rp-loading">
        <div className="rp-loading-inner">
          <div className="rp-spinner" />
          <p>Loading Norrath...</p>
        </div>
      </div>
    );
  }

  if (!gameState || entries.length === 0) {
    return (
      <div className="rp-loading">
        <div className="rp-loading-inner">
          <h2>No Save Data Found</h2>
          <p>Start playing EverQuest Idle to see your rankings!</p>
          <a href="/" className="rp-btn">▶ Enter Norrath</a>
        </div>
      </div>
    );
  }

  const medal = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';

  return (
    <div className="rp-root">
      {/* ── Header ── */}
      <header className="rp-header">
        <div className="rp-header-inner">
          <div className="rp-logo">
            <span className="rp-logo-eq">EverQuest</span>
            <span className="rp-logo-idle">Idle</span>
          </div>
          <div className="rp-header-center">
            <h1>World Rankings</h1>
            <p className="rp-subtitle">Cazic Thule Server · Season 1</p>
          </div>
          <a href="/" className="rp-play-btn">▶ Play Now</a>
        </div>
      </header>

      <div className="rp-body">
        {/* ── Sidebar ── */}
        <aside className="rp-sidebar">
          <ServerStats entries={entries} />

          {/* Top 3 podium */}
          <div className="podium">
            <h3>Top Adventurers</h3>
            {[...entries].sort((a, b) => b.level - a.level).slice(0, 5).map((e, i) => (
              <div key={e.id} className={`podium-row ${e.isPlayer ? 'is-player' : ''}`}>
                <span className="podium-rank">{medal(i) || `#${i + 1}`}</span>
                <span className="podium-name" style={{ color: CLASS_COLORS[e.cls] }}>
                  {CLASS_ICONS[e.cls]} {e.name}
                </span>
                <span className="podium-level">Lv {e.level}</span>
              </div>
            ))}
          </div>

          {/* Most Kills */}
          {entries.some(e => e.kills > 0) && (
            <div className="podium">
              <h3>Most Kills</h3>
              {[...entries].sort((a, b) => b.kills - a.kills).slice(0, 5).map((e, i) => (
                <div key={e.id} className={`podium-row ${e.isPlayer ? 'is-player' : ''}`}>
                  <span className="podium-rank">{medal(i) || `#${i + 1}`}</span>
                  <span className="podium-name" style={{ color: CLASS_COLORS[e.cls] }}>
                    {CLASS_ICONS[e.cls]} {e.name}
                  </span>
                  <span className="podium-level">{fmt(e.kills)}</span>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* ── Main content ── */}
        <main className="rp-main">
          {/* Tabs */}
          <div className="rp-tabs">
            {(['leaderboard', 'achievements', 'guilds'] as const).map(t => (
              <button key={t} className={`rp-tab ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)}>
                {t === 'leaderboard' ? '🏆 Leaderboard' : t === 'achievements' ? '⭐ Achievements' : '⚔️ Guilds'}
              </button>
            ))}
          </div>

          {activeTab === 'leaderboard' && (
            <>
              {/* Filters */}
              <div className="rp-filters">
                <input className="rp-input" placeholder="Search name or race…"
                  value={filterText} onChange={e => setFilterText(e.target.value)} />
                <select className="rp-select" value={filterCls} onChange={e => setFilterCls(e.target.value)}>
                  <option value="">All Classes</option>
                  {allClasses.map(c => <option key={c} value={c}>{CLASS_ICONS[c]} {c}</option>)}
                </select>
                <label className="rp-toggle">
                  <input type="checkbox" checked={showOffline} onChange={e => setShowOffline(e.target.checked)} />
                  Show Offline
                </label>
                <span className="rp-count">{filtered.length} adventurers</span>
              </div>

              {/* Table */}
              <div className="rp-table-wrap">
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <SortTh k="level" label="Level" />
                      <SortTh k="kills" label="Kills" />
                      <SortTh k="deaths" label="Deaths" />
                      <SortTh k="hp" label="HP" />
                      <SortTh k="ac" label="AC" />
                      <SortTh k="xp" label="XP %" />
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e, i) => (
                      <React.Fragment key={e.id}>
                        <tr
                          className={`rp-row ${e.isPlayer ? 'is-player' : ''} ${expandedId === e.id ? 'expanded' : ''}`}
                          onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
                        >
                          <td className="rank-cell">
                            {medal(i) || <span className="rank-num">{i + 1}</span>}
                          </td>
                          <td className="name-cell">
                            <span className="class-icon">{CLASS_ICONS[e.cls] ?? '?'}</span>
                            <span className="char-name" style={{ color: CLASS_COLORS[e.cls] }}>{e.name}</span>
                            <span className="char-sub">{e.race} {e.cls}</span>
                            {e.guildName && <span className="guild-tag">&lt;{e.guildName}&gt;</span>}
                          </td>
                          <td className="center"><span className="level-badge">{e.level}</span></td>
                          <td className="center num">{fmt(e.kills)}</td>
                          <td className="center num">{e.deaths}</td>
                          <td className="center num">{fmt(e.maxHp)}</td>
                          <td className="center num">{e.ac}</td>
                          <td><XpBar pct={e.xpPct} level={e.level} /></td>
                          <td className="center">
                            {e.isPlayer
                              ? <span className="badge-you">YOU</span>
                              : e.isOnline
                                ? <span className="badge-online">Online</span>
                                : <span className="badge-offline">Offline</span>}
                          </td>
                        </tr>
                        {expandedId === e.id && <DetailRow entry={e} />}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'achievements' && (
            <div className="achiev-page">
              {achievShowcase.size === 0 ? (
                <div className="empty-state">No achievements earned yet. Keep adventuring!</div>
              ) : (
                [...achievShowcase.entries()].map(([id, holders]) => {
                  const a = ACHIEVEMENT_LABELS[id] ?? { label: id, icon: '🏅', desc: '' };
                  return (
                    <div key={id} className="achiev-card">
                      <div className="achiev-card-header">
                        <span className="achiev-icon">{a.icon}</span>
                        <div>
                          <div className="achiev-name">{a.label}</div>
                          <div className="achiev-desc">{a.desc}</div>
                        </div>
                        <span className="achiev-count">{holders.length}×</span>
                      </div>
                      <div className="achiev-holders">
                        {holders.map(h => (
                          <span key={h.id} className={`holder-chip ${h.isPlayer ? 'is-player' : ''}`}
                            style={{ borderColor: CLASS_COLORS[h.cls] }}>
                            {CLASS_ICONS[h.cls]} {h.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'guilds' && (
            <div className="guild-page">
              {guilds.length === 0 ? (
                <div className="empty-state">No guilds formed yet.</div>
              ) : (
                guilds.map(([name, members]) => {
                  const totalKills = members.reduce((s, m) => s + m.kills, 0);
                  const maxLevel = Math.max(...members.map(m => m.level));
                  return (
                    <div key={name} className="guild-card">
                      <div className="guild-card-header">
                        <h3>&lt;{name}&gt;</h3>
                        <div className="guild-meta">
                          <span>{members.length} members</span>
                          <span>Highest Level: {maxLevel}</span>
                          <span>Total Kills: {fmt(totalKills)}</span>
                        </div>
                      </div>
                      <div className="guild-members">
                        {members.sort((a, b) => b.level - a.level).map(m => (
                          <span key={m.id} className={`holder-chip ${m.isPlayer ? 'is-player' : ''}`}
                            style={{ borderColor: CLASS_COLORS[m.cls] }}>
                            {CLASS_ICONS[m.cls]} {m.name} ({m.level})
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </main>
      </div>

      <footer className="rp-footer">
        <p>EverQuest Idle · Cazic Thule Server · Data refreshed from local save ·
          <a href="/" style={{ color: '#d4a520', marginLeft: 8 }}>▶ Return to Norrath</a>
        </p>
      </footer>

      <style>{`
        :root {
          --eq-bg: #000;
          --eq-panel: #0c0a07;
          --eq-dark: #080600;
          --eq-gold: #d4a520;
          --eq-gold-dim: #8a6b14;
          --eq-bevel-hi: #b8934a;
          --eq-text: #c4a35a;
          --eq-text-dim: #6a5a30;
          --eq-border: #2a2010;
          --eq-red: #c0392b;
          --eq-green: #27ae60;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: var(--eq-bg);
          color: var(--eq-text);
          font-family: 'Courier New', Courier, monospace;
          font-size: 13px;
          min-height: 100vh;
        }

        a { color: var(--eq-gold); text-decoration: none; }
        a:hover { text-decoration: underline; }

        /* ── Loading ── */
        .rp-loading {
          display: flex; align-items: center; justify-content: center;
          min-height: 100vh; background: var(--eq-bg);
        }
        .rp-loading-inner { text-align: center; }
        .rp-loading-inner h2 { color: var(--eq-gold); font-size: 1.5rem; margin-bottom: 1rem; }
        .rp-loading-inner p { color: var(--eq-text); margin-bottom: 1.5rem; }
        .rp-spinner {
          width: 40px; height: 40px; border: 3px solid var(--eq-gold-dim);
          border-top-color: var(--eq-gold); border-radius: 50%;
          animation: spin 0.8s linear infinite; margin: 0 auto 1rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Layout ── */
        .rp-root { display: flex; flex-direction: column; min-height: 100vh; }

        /* ── Header ── */
        .rp-header {
          background: linear-gradient(180deg, #1a1408 0%, #0c0a07 100%);
          border-bottom: 2px solid var(--eq-bevel-hi);
          padding: 0.75rem 1.5rem;
        }
        .rp-header-inner {
          max-width: 1400px; margin: 0 auto;
          display: flex; align-items: center; gap: 1.5rem;
        }
        .rp-logo { display: flex; flex-direction: column; line-height: 1.1; }
        .rp-logo-eq { font-size: 1.4rem; font-weight: bold; color: var(--eq-gold); letter-spacing: 2px; text-transform: uppercase; }
        .rp-logo-idle { font-size: 0.7rem; color: var(--eq-bevel-hi); letter-spacing: 4px; text-transform: uppercase; }
        .rp-header-center { flex: 1; text-align: center; }
        .rp-header-center h1 { font-size: 1.6rem; color: var(--eq-gold); letter-spacing: 3px; text-transform: uppercase; text-shadow: 0 0 20px rgba(212,165,32,0.4); }
        .rp-subtitle { color: var(--eq-text-dim); font-size: 0.75rem; letter-spacing: 2px; }
        .rp-play-btn {
          background: var(--eq-gold); color: #000; font-weight: bold;
          padding: 0.5rem 1.25rem; border-radius: 2px; font-family: inherit;
          font-size: 0.85rem; letter-spacing: 1px; white-space: nowrap;
          transition: background 0.15s;
        }
        .rp-play-btn:hover { background: var(--eq-bevel-hi); text-decoration: none; }
        .rp-btn {
          display: inline-block; background: var(--eq-gold); color: #000;
          font-weight: bold; padding: 0.5rem 1.5rem; border-radius: 2px;
          font-family: inherit; font-size: 0.9rem; letter-spacing: 1px;
        }
        .rp-btn:hover { background: var(--eq-bevel-hi); text-decoration: none; }

        /* ── Body layout ── */
        .rp-body {
          flex: 1; display: flex; max-width: 1400px; width: 100%;
          margin: 0 auto; padding: 1.25rem; gap: 1.25rem; align-items: flex-start;
        }

        /* ── Sidebar ── */
        .rp-sidebar {
          width: 240px; flex-shrink: 0;
          display: flex; flex-direction: column; gap: 1rem;
        }
        .server-stats, .podium {
          background: var(--eq-panel);
          border: 1px solid var(--eq-border);
          border-top: 2px solid var(--eq-bevel-hi);
          padding: 0.75rem;
        }
        .server-stats h3, .podium h3 {
          color: var(--eq-gold); font-size: 0.7rem; letter-spacing: 2px;
          text-transform: uppercase; margin-bottom: 0.6rem;
          border-bottom: 1px solid var(--eq-border); padding-bottom: 0.4rem;
        }
        .stat-row { display: flex; justify-content: space-between; margin-bottom: 0.35rem; font-size: 0.75rem; }
        .stat-row .label { color: var(--eq-text-dim); }
        .stat-row .value { color: var(--eq-text); font-weight: bold; }
        .stat-row .online { color: var(--eq-green); }
        .podium-row { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.35rem; font-size: 0.75rem; }
        .podium-rank { width: 22px; text-align: center; font-size: 0.85rem; }
        .podium-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .podium-level { color: var(--eq-text-dim); white-space: nowrap; }
        .podium-row.is-player { background: rgba(212,165,32,0.08); border-radius: 2px; padding: 1px 3px; }

        /* ── Main ── */
        .rp-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1rem; }

        /* ── Tabs ── */
        .rp-tabs { display: flex; gap: 2px; }
        .rp-tab {
          background: var(--eq-dark); border: 1px solid var(--eq-border);
          border-bottom: none; color: var(--eq-text-dim); font-family: inherit;
          font-size: 0.8rem; letter-spacing: 1px; padding: 0.5rem 1.25rem;
          cursor: pointer; transition: all 0.15s;
        }
        .rp-tab:hover { color: var(--eq-text); }
        .rp-tab.active {
          background: var(--eq-panel); color: var(--eq-gold);
          border-color: var(--eq-bevel-hi); border-bottom-color: var(--eq-panel);
        }

        /* ── Filters ── */
        .rp-filters {
          background: var(--eq-panel); border: 1px solid var(--eq-border);
          border-top: 2px solid var(--eq-bevel-hi);
          padding: 0.65rem 0.9rem;
          display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
        }
        .rp-input, .rp-select {
          background: #060503; border: 1px solid var(--eq-border);
          color: var(--eq-text); font-family: inherit; font-size: 0.8rem;
          padding: 0.3rem 0.6rem; outline: none;
        }
        .rp-input:focus, .rp-select:focus { border-color: var(--eq-gold-dim); }
        .rp-toggle { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--eq-text-dim); cursor: pointer; }
        .rp-toggle input { accent-color: var(--eq-gold); cursor: pointer; }
        .rp-count { margin-left: auto; color: var(--eq-text-dim); font-size: 0.75rem; }

        /* ── Table ── */
        .rp-table-wrap {
          background: var(--eq-panel); border: 1px solid var(--eq-border);
          border-top: 2px solid var(--eq-bevel-hi);
          overflow-x: auto;
        }
        .rp-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
        .rp-table thead tr {
          background: #0a0800; border-bottom: 1px solid var(--eq-bevel-hi);
        }
        .rp-table thead th {
          padding: 0.55rem 0.65rem; color: var(--eq-gold);
          font-size: 0.7rem; letter-spacing: 1px; text-transform: uppercase;
          text-align: left; white-space: nowrap;
        }
        .rp-table tbody tr.rp-row {
          border-bottom: 1px solid rgba(42,32,16,0.5);
          cursor: pointer; transition: background 0.1s;
        }
        .rp-table tbody tr.rp-row:hover { background: rgba(42,32,16,0.6); }
        .rp-table tbody tr.rp-row.expanded { background: rgba(42,32,16,0.8); }
        .rp-table tbody tr.rp-row.is-player { background: rgba(212,165,32,0.06); }
        .rp-table tbody tr.rp-row.is-player:hover { background: rgba(212,165,32,0.1); }
        .rp-table td { padding: 0.45rem 0.65rem; vertical-align: middle; }
        .center { text-align: center; }
        .num { color: var(--eq-text); font-weight: bold; }
        .rank-cell { text-align: center; font-size: 1rem; width: 36px; }
        .rank-num { color: var(--eq-text-dim); font-size: 0.75rem; }
        .name-cell { display: flex; flex-direction: column; gap: 1px; }
        .class-icon { font-size: 1rem; }
        .char-name { font-weight: bold; font-size: 0.85rem; }
        .char-sub { font-size: 0.68rem; color: var(--eq-text-dim); }
        .guild-tag { font-size: 0.65rem; color: var(--eq-gold-dim); }
        .level-badge {
          display: inline-block; background: rgba(212,165,32,0.12);
          border: 1px solid var(--eq-gold-dim); color: var(--eq-gold);
          padding: 0 0.5rem; border-radius: 2px; font-weight: bold;
        }
        .badge-you { background: var(--eq-gold); color: #000; font-weight: bold; padding: 1px 8px; border-radius: 2px; font-size: 0.7rem; }
        .badge-online { color: var(--eq-green); font-size: 0.7rem; }
        .badge-offline { color: var(--eq-text-dim); font-size: 0.7rem; }

        /* XP bar */
        .xp-bar-wrap { position: relative; height: 14px; background: #0a0800; border: 1px solid var(--eq-border); border-radius: 1px; overflow: hidden; min-width: 60px; }
        .xp-bar-fill { height: 100%; background: linear-gradient(90deg, #2d5a1b, #4a8c2c); transition: width 0.3s; }
        .xp-bar-label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; color: #fff; text-shadow: 0 0 3px #000; }

        /* ── Detail row ── */
        .detail-row td { padding: 0 !important; border-bottom: 2px solid var(--eq-bevel-hi) !important; }
        .detail-card {
          background: #060503; padding: 0.85rem 1rem;
          display: flex; gap: 2rem; flex-wrap: wrap;
        }
        .detail-section h4 { color: var(--eq-gold); font-size: 0.7rem; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.5rem; }
        .detail-grid { display: flex; flex-wrap: wrap; gap: 0.4rem 1.2rem; font-size: 0.75rem; }
        .detail-grid span { color: var(--eq-text-dim); }
        .detail-grid b { color: var(--eq-text); }
        .achiev-list { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .achiev-badge {
          background: rgba(42,32,16,0.8); border: 1px solid var(--eq-gold-dim);
          padding: 2px 7px; font-size: 0.7rem; color: var(--eq-text);
          border-radius: 2px;
        }
        .achiev-badge.unknown { border-color: var(--eq-border); color: var(--eq-text-dim); }

        /* ── Achievements page ── */
        .achiev-page { display: flex; flex-direction: column; gap: 0.75rem; }
        .achiev-card {
          background: var(--eq-panel); border: 1px solid var(--eq-border);
          border-left: 3px solid var(--eq-gold); padding: 0.75rem 1rem;
        }
        .achiev-card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
        .achiev-icon { font-size: 1.5rem; }
        .achiev-name { color: var(--eq-gold); font-weight: bold; font-size: 0.85rem; }
        .achiev-desc { color: var(--eq-text-dim); font-size: 0.72rem; }
        .achiev-count { margin-left: auto; color: var(--eq-text-dim); font-size: 0.75rem; background: rgba(42,32,16,0.8); padding: 2px 8px; border: 1px solid var(--eq-border); }
        .achiev-holders { display: flex; flex-wrap: wrap; gap: 0.35rem; }
        .holder-chip {
          border: 1px solid; padding: 1px 8px; font-size: 0.72rem;
          border-radius: 2px; background: rgba(0,0,0,0.4);
        }
        .holder-chip.is-player { background: rgba(212,165,32,0.1); }

        /* ── Guilds page ── */
        .guild-page { display: flex; flex-direction: column; gap: 0.75rem; }
        .guild-card {
          background: var(--eq-panel); border: 1px solid var(--eq-border);
          border-top: 2px solid var(--eq-bevel-hi); padding: 0.75rem 1rem;
        }
        .guild-card-header { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 0.6rem; flex-wrap: wrap; }
        .guild-card-header h3 { color: var(--eq-gold); font-size: 1rem; }
        .guild-meta { display: flex; gap: 1.25rem; color: var(--eq-text-dim); font-size: 0.75rem; }
        .guild-members { display: flex; flex-wrap: wrap; gap: 0.35rem; }

        /* ── Footer ── */
        .rp-footer {
          border-top: 1px solid var(--eq-border);
          padding: 0.75rem 1.5rem; text-align: center;
          color: var(--eq-text-dim); font-size: 0.7rem;
        }

        /* ── Empty state ── */
        .empty-state { color: var(--eq-text-dim); text-align: center; padding: 3rem; font-size: 0.9rem; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .rp-body { flex-direction: column; }
          .rp-sidebar { width: 100%; flex-direction: row; flex-wrap: wrap; }
          .server-stats, .podium { flex: 1; min-width: 180px; }
        }
      `}</style>
    </div>
  );
}
