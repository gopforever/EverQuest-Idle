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

## Secrets (Replit Secrets — never in .env.local)

- `VITE_AI_GATEWAY_KEY` — Vercel AI Gateway client key (ghost chat AI)
- `VITE_SUPABASE_URL` — Supabase project URL (cloud saves)
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key (cloud saves)

## Deployment

Configured as a **static** deployment:
- Build command: `npm run build`
- Public directory: `dist/`
