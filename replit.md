# EverQuest Idle

A browser-based idle/incremental game merging Melvor Idle gameplay with the classic EverQuest (1999) setting.

## Project Overview

Players choose a classic EQ class and race, then progress through zones by fighting monsters and leveling skills. The game features "Ghost Players" — simulated AI-driven characters who progress alongside the player, participate in a virtual economy (The Bazaar), and generate in-character chat messages using an AI backend.

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 5
- **State Management:** Zustand
- **Styling:** Tailwind CSS + PostCSS
- **AI/LLM:** Vercel AI SDK (`ai`, `@ai-sdk/gateway`) → OpenAI GPT-4.1-mini
- **Persistence:** LocalForage (IndexedDB/LocalStorage)
- **Optional Backend:** Supabase (cloud saves/syncing)
- **Package Manager:** npm

## Phase 10 — EQ 1999 UI Redesign (Complete)

- **`src/index.css`** fully rewritten: design token system (`--eq-bg`, `--eq-panel`, `--eq-bevel-hi/lo`, `--eq-border`, `--eq-gold`, bar colors); `.eq-window` (beveled stone chrome using directional border-colors + box-shadow); `.eq-title-bar` (dark gradient + gold ALL-CAPS text + text-shadow glow); `.eq-btn / eq-btn-active / eq-btn-danger` (stone-raised buttons with directional 3D borders); `.eq-bar-track / eq-bar-fill / eq-bar-hp / mana / xp / end / enemy` (solid fill bars with shine overlay); `.eq-gem-slot` (dark inset gem frames); `.eq-chat` (monospace combat log); `.eq-divider` (horizontal gradient rule)
- **`EQPanelHeader.tsx`** — now just renders `.eq-title-bar` div; zero inline styles
- **`HpBar.tsx`** — fully rewritten: `eq-bar-track` + `eq-bar-fill` + named bar class; configurable height; colored label with bar type color; shows `current/max` values; no Tailwind color classes
- **`Header.tsx`** — thin menu bar with EQ/OPTIONS/HELP/PERSONA `eq-btn` buttons, centered gold title, right-side character tag
- **`LeftPanel.tsx`** — `eq-window` sidebar, WINDOWS title bar, all 12 nav buttons styled as `eq-btn` with active gold highlight
- **`MainView.tsx`** — `eq-window` zone window with title bar; zone art area; monster display with `eq-bar-enemy`; player HP/Mana/XP bars; coin display; auto-combat `eq-btn`
- **`CombatLog.tsx`** — `eq-window` with dark gradient header bar, filter tabs, monospace `eq-chat` log area; compact 170px height
- **`RightPanel.tsx`** — `eq-window` sidebar: Character, Target, Group, Actions sections with `eq-title-bar` headings and `eq-divider` separators
- **`CharacterCreationScreen.tsx`** — uses `eq-window`, `eq-title-bar`, `eq-btn`, inset input fields matching the stone aesthetic

## Phase 9 — Vanilla EQ Content (Complete)

- **Data:** `spells.ts` (8 caster/priest classes L1–60), `factions.ts` (20+ factions + vendor pricing), `quests.ts` (8 quests), named boss drops in `items.ts`, `monsters.ts` (Pyzjn, Kirak Vil, Lady Vox, Lord Nagafen with real P99 loot)
- **Engines:** `factionEngine.ts` (kill→faction delta, cascade, KOS, vendor pricing), `questEngine.ts` (kill recording, step advancement, quest start/abandon/available)
- **Store:** `gameStore.ts` — new state fields `factionStandings`, `spellBook`, `memorizedSpells`, `activeQuests`, `completedQuests`; new actions: `memorizeSpell`, `forgetSpell`, `learnSpell`, `autoMemorize`, `beginQuest`, `dropQuest`; `createCharacter` seeds starting factions and spell book
- **Tick:** `tick.ts` — calls `applyKillFactionChanges` and `recordKillForQuests`/`checkQuestAdvance` on every kill; returns updated faction/quest state
- **UI:** `SpellsPanel.tsx` (full spell book with 8 gem slots, memorize/forget, auto-mem, search), `QuestsPanel.tsx` (active/available/completed tabs, progress bars, abandon), `FactionsPanel.tsx` (sorted standings with color bars + legend), QUESTS + FACTIONS buttons in `LeftPanel.tsx`

## Project Structure

- `src/components/` — UI layer (layout, panels, reusable UI)
- `src/engine/` — Core game logic (tick engine, combat, LLM agent)
- `src/data/` — Static game data (monsters, items, zones, recipes)
- `src/store/` — Zustand stores (game state)
- `src/hooks/` — Custom React hooks (game loop)
- `src/types/` — TypeScript interfaces
- `src/utils/` — Helper utilities
- `public/assets/sprites/` — Item and monster sprites

## Key Files

- `vite.config.ts` — Vite config (host: 0.0.0.0, port: 5000, allowedHosts: true)
- `src/main.tsx` + `src/App.tsx` — App entry points
- `src/store/gameStore.ts` — Central game state
- `src/engine/tickEngine.ts` — Game tick logic
- `.env.local` — API keys for AI Gateway and Supabase

## Architecture

- **Frontend** (Vite dev server, port 5000): React app, game engine, UI panels
- **Backend** (`server.js`, port 3001): Express proxy for Vercel AI Gateway (ghost chat)
  - Vite proxies `/api/*` → `localhost:3001` in dev mode
  - Keys stay server-side and are never exposed to the browser
  - Endpoint: `POST /api/ghost-chat` — takes `{ system, prompt }`, returns `{ text }`

## Development

```bash
npm run dev      # Start Vite frontend on port 5000
npm run server   # Start ghost chat proxy on port 3001
npm run build    # TypeScript compile + Vite build → dist/
npm run preview  # Preview production build
```

## Supabase Item Database (Phase 11 — PEQ Integration)

Full EverQuest item/monster database stored in Supabase for zone-based queries.

### Setup (one time)
1. Open your Supabase project → SQL Editor → run `supabase/schema.sql`
2. In Supabase Auth, the tables use public read-only RLS (no service role needed for reads)
3. Seed with current static data: `npm run db:seed`
4. For full PEQ database (6,000+ items):
   - Download `peqdb_latest.sql` from https://github.com/ProjectEQ/projecteqdb
   - `SUPABASE_SERVICE_ROLE_KEY=<key> npx tsx scripts/import-peq.ts --peq peqdb_latest.sql`

### Tables
- **`eq_items`** — all items with full stats, class/race restrictions, slot info
- **`eq_monsters`** — NPCs with zone arrays, level ranges, damage
- **`eq_loot_entries`** — monster → item drop chance mappings
- **`eq_zone_items`** — pre-computed zone → item index for fast lookups

### Game Integration
- **`src/engine/itemsDb.ts`** — `fetchZoneItems(zoneId)`, `fetchZoneMonsters(zoneId)`, `fetchItem(id)`
- Automatically falls back to static `ITEMS`/`MONSTERS` if Supabase is unreachable
- Results are cached in memory per session (no duplicate queries per zone)

## Secrets (Replit Secrets — never in .env.local)

- `VITE_AI_GATEWAY_KEY` — Vercel AI Gateway client key (ghost chat AI)
- `VITE_SUPABASE_URL` — Supabase project URL (cloud saves + item DB)
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key (cloud saves + item DB reads)

## Deployment

Configured as a **static** deployment:
- Build command: `npm run build`
- Public directory: `dist/`
