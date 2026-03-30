# ⚔️ EverQuest Idle

> *A Melvor Idle-style idle/incremental game inspired by classic EverQuest (1999 Vanilla) — built to last forever.*

EverQuest Idle combines the deep idle mechanics of **Melvor Idle** with the rich world of **classic EverQuest**. Starting from the original 1999 vanilla release, the game will grow with expansions forever. Nothing is ever removed — everything builds on what came before.

---

## 📌 MASTER DESIGN DOCUMENT
> This README is the single source of truth for the project. All key design decisions, systems, formulas, and data live here so nothing is ever lost between sessions.

---

## 🎯 Vision & Inspiration

- **Core Gameplay Loop:** Melvor Idle — idle/incremental mechanics, skill grinding, passive progress
- **World & Content:** EverQuest (1999 Vanilla) — classes, zones, monsters, items, lore
- **Start:** Vanilla EverQuest (1999) — all classes, all zones, all monsters, all items
- **Growth:** Expansions added over time (Ruins of Kunark → Scars of Velious → Shadows of Luclin → ...)
- **This game will never stop growing.**

---

## 🛠️ TECH STACK DECISION (FINAL)

### **React + TypeScript + Vite** (Browser-Based)

**Why this stack:**
- Runs in any browser — zero install for players, shareable via URL
- React's component model is perfect for an EQ-style UI (each panel = a component)
- TypeScript prevents data bugs — critical for complex combat math, ghost engine, and item data
- Vite gives instant hot-reload for fast development
- Huge ecosystem — tooltip libraries, state management, animation, all available
- You rely on Copilot for all code — TypeScript/React is the best-supported language for AI-assisted coding
- Canvas/WebGL can be embedded inside React if pixel-art rendering is needed for sprites
- Easy to add a backend later (Node.js / Supabase) for persistence

**Supporting Libraries (planned):**
| Library | Purpose |
|---------|---------|
| `zustand` | Global game state (player, ghosts, economy, world) |
| `react-tooltip` or custom | Rich item/stat tooltips (like EQ item cards) |
| `framer-motion` | UI animations (panel open/close, combat hits) |
| `tailwindcss` | Rapid UI styling, dark stone EQ theme |
| `localforage` | Persistent save state in browser |
| `howler.js` | Sound effects (optional, for EQ ambient sounds) |

**File Structure (planned):**
```
/src
  /components       ← UI panels (Inventory, Group, Combat, Bazaar, etc.)
  /engine           ← Core tick engine, combat math, XP engine
  /data             ← monsters.ts, items.ts, zones.ts, spells.ts
  /ghost            ← Ghost player AI engine
  /hooks            ← Custom React hooks (useGameLoop, useCombat, etc.)
  /store            ← Zustand game state
  /assets           ← Sprites, icons, sounds
    /sprites
      /monsters     ← {monster_id}.png (placeholder.png as fallback)
      /items        ← {item_id}.png (placeholder.png as fallback)
```

---

## 🖥️ UI DESIGN SPECIFICATION

### Core Philosophy
- **Inspired by the original EverQuest UI** — stone/parchment aesthetic, panel-based layout
- **Modernized** — crisp, readable, responsive, fully clickable, no confusion
- **Everything accessible** — zero hidden menus, all systems visible from a single screen
- **Idle-first** — the game plays itself; the UI shows you what is happening and lets you redirect

### Main Screen Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  [HELP] [OPTIONS] [PERSONA]          ⚔️ EverQuest Idle              │
├───────────────┬─────────────────────────────┬───────────────────────┤
│               │                             │  GROUP WINDOW         │
│  LEFT PANEL   │     MAIN VIEW PANEL         │  [You]   HP ████░     │
│               │                             │  [Ghost1] HP ███      │
│  [INVENTORY]  │  Zone Art / Combat View     │  [Ghost2] HP ██       │
│  [SKILLS]     │  (idle animation,           │  [Ghost3] HP ████     │
│  [SPELLS]     │   monster sprites,          │  [Ghost4] HP ██       │
│  [ZONES]      │   combat log scrolling)     │  [Ghost5] HP ███      │
│  [TRADESKILL] │                             │                       │
│  [BAZAAR]     │                             │  CURRENT TARGET       │
│  [GUILD]      ├─────────────────────────────│  [Monster Name]       │
│  [ACHIEVE]    │  COMBAT LOG                 │  HP: ████░░ (73%)     │
│  [WHO]        │  scrolling text output      │                       │
│               │  (EQ parchment style)       │  [ABILITIES]          │
│               │                             │  [COMBAT]             │
└───────────────┴─────────────────────────────┴───────────────────────┘
```

### Panel Descriptions

| Panel | Contents |
|-------|----------|
| **Inventory** | Paper doll with all 21 EQ gear slots, bags, stats (STR/STA/AGI/DEX/WIS/INT/CHA/HP/MANA), weight, currency (pp/gp/sp/cp) |
| **Skills** | All class skills with progress bars, tradeskill levels |
| **Spells** | Spell gem slots (8 memorized), spell book, rest/med status |
| **Zones** | World map by continent, zone level range, dungeon levels |
| **Tradeskill** | Combine interface, recipe browser, skill tracker |
| **Bazaar** | Live market — list items, search, buy from ghost players |
| **Guild** | Guild roster, ranks, notes |
| **Achievements** | Full achievement browser |
| **Who** | Live who list — ghost players online, their zone, level, class |

### Group Window (Human + Ghost Players)

When grouped with ghost players:
```
┌─────────────────────────────────────────────────────┐
│  GROUP                                    [DISBAND]  │
├──────────┬──────┬───────┬──────┬────────────────────┤
│ Name     │ Lvl  │ Class │ HP   │ Mana / Status      │
├──────────┼──────┼───────┼──────┼────────────────────┤
│ [YOU] ★  │  35  │ WAR   │ █████│ ── (melee)         │
│ Taelyra  │  34  │ CLR   │ ████░│ ████ [Healing...]  │
│ Vrenox   │  36  │ ENC   │ ███░░│ ███░ [Slowing...]  │
│ Brimholt │  33  │ MAG   │ ████ │ ██░░ [Nuking...]   │
│ Saelindra│  35  │ DRU   │ ████ │ ████ [SoW up]      │
│ Krothus  │  34  │ WAR   │ ████ │ ── (offtank)       │
└──────────┴──────┴───────┴──────┴────────────────────┘
  [INVITE]  [KICK]  [MAKE LEADER]  [LOOT SETTINGS]
```

- Each ghost member shows: Name, Level, Class abbreviation, HP bar, Mana bar, current action
- Click any ghost member → opens their character sheet (read-only, shows gear + stats)
- Ghost actions shown in real-time: "Healing...", "Slowing...", "Nuking...", "Looting..."
- Color-coded HP bars: green >75%, yellow >50%, orange >25%, red = critical
- Ghost players can be invited from the **Who** window or encounter you in a zone

---

## 🖱️ TOOLTIP SYSTEM (MOUSEOVER)

Every interactive element has a rich mouseover tooltip. Nothing requires clicking to get information.

### Item Tooltip (EQ-accurate)
```
┌──────────────────────────────────────┐
│ [item icon]  Elegant Defiant Boots   │  item name (color by rarity)
│              Magic, Attunable        │  item flags
│ Class: DRU MNK BST                   │
│ Race:  HUM BAR ELF HEF ...           │
│ Slot:  Feet                          │
├──────────────────────────────────────┤
│ Size: MEDIUM    AC:       33         │
│ Weight: 0.9     HP:      236         │
│ Rec Level: 80   Mana:    277         │
│ Req Level: 70   End:     244         │
├──────────────────────────────────────┤
│ Strength:    24   Magic:      19     │
│ Stamina:     33   Fire:       18     │
│ Intelligence: 9   Cold:       24     │
│ Wisdom:      28   Disease:    19     │
│ Agility:     10   Poison:     10     │
│ Dexterity:   25   Attack:     16     │
│ Charisma:    15   HP Regen:    4     │
│                   Mana Regen:  4     │
│                   Avoidance:   3     │
├──────────────────────────────────────┤
│ Augment Slot 1 (General): empty      │
│ Augment Slot 2 (Energeiac): empty    │
├──────────────────────────────────────┤
│ Focus Effect: Jayruk's Celerity      │
│ Reduces cast time of beneficial      │
│ spells by 15%. Decays over lv 85.    │
└──────────────────────────────────────┘
```

### Other Tooltip Types
| Hover Target | Tooltip Shows |
|-------------|---------------|
| **Monster** | Level, type, aggro/social, zone, estimated HP, known loot |
| **Ghost Player** | Name, race, class, level, personality type, current activity, gear score |
| **Stat (STR, WIS, etc.)** | What the stat does, current value, gear contribution breakdown |
| **Skill** | Skill name, current level, max level, what it affects |
| **Spell** | Full spell card: mana cost, cast time, duration, resist type, effect |
| **Zone** | Zone name, continent, level range, notable mobs, dungeon type |
| **Achievement** | Full description, requirements, progress, point value |
| **Currency** | PP/GP/SP/CP conversion rates |
| **HP/Mana bar** | Exact current/max values, regen rate |

---

## 🏆 ACHIEVEMENTS SYSTEM

### Player Achievements
- **General** — Reach level milestones, kill milestones, play time
- **Combat** — Kill X of each monster type, defeat raid bosses
- **Tradeskill** — Max each tradeskill, craft X items
- **Exploration** — Visit every zone, every dungeon level
- **Progression** — Complete quest lines, unlock planes
- **Conquest** — Clear raid zones, defeat named mobs
- **Social** — Group with ghost players, join guild
- **Economy** — Buy/sell on Bazaar, accumulate wealth

### Ghost Player Achievements
- Ghost players also earn achievements — shown on their character sheet
- Achievements drive ghost reputation (e.g., "Dawnfire has slain Lord Nagafen" → Famous Raider)
- Leaderboard: Top ghost players by achievement points

### Achievement Data Structure
```typescript
interface Achievement {
  id: string;
  name: string;
  category: 'general' | 'combat' | 'tradeskill' | 'exploration' | 'conquest' | 'social' | 'economy';
  description: string;
  points: number;
  requirements: AchievementRequirement[];
  icon: string;
  completed: boolean;
  completedAt?: Date;
  isSecret?: boolean;
}
```

---

## ⚔️ COMBAT MATH FORMULAS (EverQuest Accurate)

### Melee Damage Formula
```
Max Hit = (Weapon Damage × Player Level) / 5
Actual Hit = random(1, Max Hit) + minor STR Bonus
```

**Examples:**
- Level 10, Weapon Damage 6 → Max Hit = (6 × 10) / 5 = **12**
- Level 50, Weapon Damage 20 → Max Hit = (20 × 50) / 5 = **200**

**STR Bonus:** Minimal below STR 75; increases above 100+

### Melee Hit Chance
```
Hit Chance = Base + (Offense Skill - Defense Skill) modifier
```
- Offense skill and weapon skill affect hit chance, not damage per hit
- Dual Wield and Double Attack add additional swings per round

### Spell Damage
```
Spell Damage = Base Spell Damage ± ~10% variance
Resist Check: Roll = random(0, 200) - (Caster Level - Target Level) × 5
If Roll > Target Save vs [Type]: RESISTED
```

### Armor Class (AC) Mitigation
```
Mitigated Damage = Incoming Damage × (1 - AC Reduction Factor)
AC Reduction Factor = AC / (AC + 400 + Level × 6)
```
Higher AC = more mitigation with diminishing returns.

### NPC Damage Formula
```
NPC Max Hit ≈ NPC Level × 2  (scales by mob type and zone tier)
```

---

## 📈 EXPERIENCE FORMULA (EverQuest Accurate)

### Base XP per Kill
```
XP = (NPC Level × NPC Level × ZEM) / (5 × Group Size)
```

| Variable | Description |
|----------|-------------|
| `NPC Level` | Level of the mob killed |
| `ZEM` | Zone Experience Modifier (typically 75–150) |
| `Group Size` | Number of players on the mob's hate list |

### ZEM Values (vanilla)
| Zone | ZEM |
|------|-----|
| East Karana (outdoor) | 75 |
| Blackburrow | 120 |
| Cazic-Thule | 130 |
| Lower Guk | 150 |
| Plane of Fear | 150 |

### Class XP Modifiers
| Class | XP Modifier |
|-------|------------|
| Warrior, Monk, Rogue, Wizard, Mage, Enchanter, Necromancer, Cleric, Druid, Shaman | ×1.00 |
| Paladin, Shadow Knight, Ranger, Bard | ×0.60 (40% hybrid penalty) |

### Group XP Split
```
Each member receives: Total XP / Group Size
```

### Death Penalty
```
XP Lost = Total XP to next level × 0.10 (10%)
Full Resurrection: recovers 96% of lost XP
Partial Resurrection: recovers 75% of lost XP
```

### Level XP Curve (approximate)
```
XP to Level N ≈ 1000 × N² × (1 + N × 0.1)
```
Steep curve — Level 60 (cap) requires roughly as much XP as all previous levels combined.

---

## 👻 Ghost Players (NPC Simulation Engine)

### Core Concept
- **100 Ghost Players** to start, each treated as a full player character
- Each starts at **Level 1** and grows organically over time
- They are **not bots** — simulated personalities with persistent state
- Ghost players use the **same combat math and XP formulas** as the real player
- The real player and ghost players share the same world, economy, and systems

### Ghost Player Behaviors

| Personality Type | Behavior |
|-----------------|----------|
| **The Grinder** | Always hunting, pushes to max level, raids when possible |
| **The Tradeskiller** | Rarely fights; focuses on crafting, harvesting, selling |
| **The Merchant** | Buys low, sells high on the Bazaar; flips items |
| **The Casual** | Logs in and out irregularly; slow progression |
| **The Tank** | Gears defensively, seeks groups, joins raid forces |
| **The Healer** | Cleric/Druid/Shaman builds; keeps groups alive |
| **The Loner** | Solos everything; avoids groups |
| **The Social** | Groups constantly; may not be best geared but always online |
| **The AFK Farmer** | Online but idle; grinds easy mobs passively |

### Ghost Player Systems (Complex Engine Required)
- [ ] **Login/Logout Simulation** — each ghost has a schedule (peak hours, night owls, weekenders)
- [ ] **Progression Engine** — level, skills, gear all advance over real time
- [ ] **Personality Persistence** — traits are seeded at creation and never change
- [ ] **Economy Participation** — buy/sell on the Bazaar, drive supply/demand
- [ ] **Group Formation** — ghosts seek groups based on personality and zone level
- [ ] **Tradeskill Engine** — some ghosts craft and list items for sale
- [ ] **Dynamic Names & Races** — each ghost gets a unique EQ-style name, race, and class
- [ ] **Ghost Memory** — remembers zones visited, kills made
- [ ] **Death & Recovery** — ghosts die, lose XP, corpse run, recover
- [ ] **Reputation** — ghosts build server reputation over time
- [ ] **Achievements** — ghosts earn achievements, visible on their character sheet

### Ghost Player Data Structure
```typescript
interface GhostPlayer {
  id: string;
  name: string;
  race: Race;
  class: CharacterClass;
  level: number;
  xp: number;
  personality: PersonalityType;
  schedule: PlaySchedule;
  isOnline: boolean;
  currentZone: string;
  currentActivity: string;
  gear: EquipmentSlots;
  stats: CharacterStats;
  tradeskills: TradeskillLevels;
  memory: GhostMemory;
  reputation: ReputationScore;
  achievements: string[];
  plat: number;
  gold: number;
}
```

---

## 🧙 Classes (Vanilla — All 14)

| Role | Classes |
|------|---------|
| **Melee** | Warrior, Monk, Rogue |
| **Hybrid** | Paladin, Shadow Knight, Ranger, Bard |
| **Priest** | Cleric, Druid, Shaman |
| **Pure Caster** | Wizard, Magician, Enchanter, Necromancer |

---

## 🗺️ Zones (Vanilla)

### Antonica
Qeynos, Qeynos Hills, North/South/West/East Karana, Blackburrow, Surefall Glade, Everfrost Peaks, Halas, Permafrost Keep, Highpass Hold, High Keep, Freeport (North/East/West), West/East Commonlands, North/South Ro, Oasis of Marr, Befallen, Najena, Lavastorm Mountains, Nektulos Forest, Neriak (Foreign Quarter/Commons/Third Gate), Misty Thicket, Rivervale, Runnyeye, Lake Rathetear, Rathe Mountains, Gorge of King Xorbb

### Faydwer
Greater Faydark, Kelethin, Lesser Faydark, Felwithe (North/South), Butcherblock Mountains, Crushbone, Kaladim (North/South), Steamfont Mountains, Akanon, Unrest, Castle Mistmoore, Dagnor's Cauldron

### Odus
Erudin, Erud's Crossing, Toxxulia Forest, Paineel

### Dungeons & Planes
Upper Guk, Lower Guk, Solusek's Eye (Sol A), Nagafen's Lair (Sol B), Cazic-Thule, Splitpaw Lair, Plane of Fear, Plane of Hate, Plane of Sky

### Zone Data Structure
```typescript
interface Zone {
  id: string;
  name: string;
  continent: 'Antonica' | 'Faydwer' | 'Odus' | 'Planes';
  type: 'outdoor' | 'dungeon' | 'city' | 'raid' | 'plane';
  levelRange: { min: number; max: number };
  zem: number;
  monsters: string[];
  isRaidZone: boolean;
  minGroupSize?: number;
  connectsTo: string[];
}
```

---

## 👾 Monsters

### Monster Data Structure
```typescript
interface Monster {
  id: string;
  name: string;
  zones: string[];
  levelRange: { min: number; max: number };
  hp: number;
  damageRange: { min: number; max: number };
  lootTable: LootEntry[];
  xpReward: number;
  sprite: string;
  type: 'humanoid' | 'animal' | 'undead' | 'magical' | 'plant' | 'construct';
  aggro: boolean;
  social: boolean;
  resistances?: ResistProfile;
  specialAbilities?: string[];
}
```

### Confirmed Monsters (Sprite Sheet 1)

#### Gnoll Family (Blackburrow / Splitpaw / Qeynos Hills)
| Monster | Notes |
|---------|-------|
| Gnoll Pup | Lowest level Gnoll, non-aggro |
| Scrawny Gnoll | Low level, common in Qeynos Hills |
| Gnoll | Standard gnoll |
| Gnoll (armored variant) | Slightly higher stats |
| Scrawny Gnoll Guard | Guard variant, low level |
| Burly Gnoll | Tougher melee gnoll |
| Gnoll Guard | Armed with spear |
| Gnoll Guard (shield variant) | Defensive, higher AC |
| Gnoll Shaman | Casts spells, heals nearby gnolls |
| Gnoll Elite Guard | High-level dungeon gnoll |
| Gnoll Commander | Boss-tier, leads groups |
| Gnoll Commander (shield variant) | Commander with shield, tank role |
| Gnoll Brewer | Non-combat variant, unique loot |
| Gnoll Master Brewer | Rare spawn, special loot table |
| Splitpaw Refugee | Splitpaw Lair version |
| Splitpaw Commander | Splitpaw Lair boss-tier |

#### Water Creatures
| Monster | Notes |
|---------|-------|
| Razorgill | Aggressive fish, rivers/lakes |
| Razorgill (large variant) | Higher level version |

#### Animals
| Monster | Notes |
|---------|-------|
| Giant Plague Rat | Disease proc possible, caves/sewers |
| Giant Snake | Poison proc, outdoor zones |
| Bear | Melee, outdoor zones, Karana etc. |

---

## 🎒 Items

### Item Data Structure
```typescript
interface Item {
  id: string;
  name: string;
  slot: EquipSlot;
  type: ItemType;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stats: {
    ac?: number; hp?: number; mana?: number; endurance?: number;
    str?: number; sta?: number; agi?: number; dex?: number;
    wis?: number; int?: number; cha?: number;
    svMagic?: number; svFire?: number; svCold?: number;
    svDisease?: number; svPoison?: number;
    attack?: number; hpRegen?: number; manaRegen?: number;
    avoidance?: number; spellDmg?: number; dotShield?: number;
  };
  weight: number;
  classes: CharacterClass[];
  races: Race[];
  lore: boolean;
  noDrop: boolean;
  stackable: boolean;
  stackSize?: number;
  value: number;
  source: 'drop' | 'tradeskill' | 'vendor' | 'quest';
  sprite: string;
  focusEffect?: FocusEffect;
  augmentSlots?: AugmentSlot[];
  recLevel?: number;
  reqLevel?: number;
}
```

---

## 🎨 Art & Sprites

### Placeholder Convention
```
/assets/sprites/monsters/placeholder.png    ← default monster placeholder
/assets/sprites/items/placeholder.png       ← default item placeholder
/assets/sprites/monsters/{monster_id}.png   ← real sprite when available
/assets/sprites/items/{item_id}.png         ← real sprite when available
/assets/sprites/ui/                         ← UI chrome, panel borders, buttons
```

### Sprite Sheets (Tracking)
| Sheet | Contents | Status |
|-------|----------|--------|
| Sheet 1 | Gnolls (all variants), Razorgill x2, Giant Plague Rat, Giant Snake, Bear, Splitpaw Refugee, Splitpaw Commander | ✅ Received |
| Sheet 2+ | TBD | 🔲 Pending |

---

## 🔨 Tradeskills (Vanilla)

| Tradeskill | Products |
|------------|----------|
| Blacksmithing | Weapons, armor, chains, rings |
| Tailoring | Cloth/leather armor, bags |
| Baking | Food buffs, rations |
| Brewing | Drinks, stat potions |
| Jewelcrafting | Rings, earrings, gems |
| Pottery | Containers, clay items |
| Fletching | Arrows, bows |
| Fishing | Raw fish, trade goods |
| Tinkering (Gnome only) | Mechanical devices, traps, goggles |

---

## 💰 Economy — The Bazaar

- Ghost players actively participate in the Bazaar economy
- Supply and demand fluctuate based on ghost player activity
- Rare drops become valuable; common drops cheapen over time
- Currency: Platinum (pp), Gold (gp), Silver (sp), Copper (cp) — 10:1 ratio each tier

---

## 🗓️ Roadmap

### Phase 1 — Foundation
- [ ] Project scaffolding (React + TypeScript + Vite)
- [ ] Core tick engine (game loop, time-based progression)
- [ ] Placeholder sprite system
- [ ] Monster data & first entries (Gnolls from Sheet 1)
- [ ] Item data structure & first entries

### Phase 2 — UI Shell
- [ ] Main screen layout (EQ stone/parchment theme)
- [ ] Inventory panel with paper doll (all 21 gear slots)
- [ ] Rich tooltip system (item cards, stat breakdowns)
- [ ] Combat log panel (scrolling text output)

### Phase 3 — Classes & Combat
- [ ] All 14 vanilla classes with correct XP modifiers
- [ ] Auto-combat system with EQ melee damage formula
- [ ] Spell system with EQ resist formula
- [ ] AC mitigation formula

### Phase 4 — World
- [ ] All vanilla zones with ZEM values
- [ ] Zone-appropriate monster tables
- [ ] Zone map/navigation panel

### Phase 5 — Ghost Player Engine (MVP)
- [ ] 100 ghost players with unique names, races, classes, personalities
- [ ] Login/logout simulation engine
- [ ] Ghost progression (leveling, gear)
- [ ] Group window with real-time ghost status

### Phase 6 — Economy & Tradeskills
- [ ] All vanilla tradeskills
- [ ] Bazaar system (list, search, buy)
- [ ] Ghost player economy participation

### Phase 7 — Achievements
- [ ] Full achievement browser (EQ-style UI)
- [ ] Player achievements (all categories)
- [ ] Ghost player achievements + leaderboard

### Phase 8 — Ghost Player Engine (Full)
- [ ] Full personality behaviors
- [ ] Ghost grouping and raid formation system
- [ ] Ghost reputation system
- [ ] Ghost memory and history

### Phase 9 — Polish & Depth
- [ ] All vanilla monsters with complete loot tables
- [ ] All vanilla items
- [ ] Major quest lines

### Phase 10 — Ruins of Kunark (Expansion 1)
- [ ] New zones, monsters, items, Iksar race

### Phase 11+ — Future Expansions...

---

## 🤝 Contributing

This is a long-term passion project. Contributions, ideas, and feedback are always welcome. Open an issue or start a discussion!

---

## 📜 License

MIT — Free to use, fork, and build upon.

---

*"What is this place?" — Every new EverQuest player, forever.*