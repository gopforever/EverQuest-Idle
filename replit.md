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

## Development

```bash
npm run dev      # Start dev server on port 5000
npm run build    # TypeScript compile + Vite build → dist/
npm run preview  # Preview production build
```

## Deployment

Configured as a **static** deployment:
- Build command: `npm run build`
- Public directory: `dist/`
