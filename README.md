# ⚔️ EverQuest Idle

> *A Melvor Idle-style idle/incremental game inspired by classic EverQuest (1999 Vanilla) — built to last forever.*

EverQuest Idle combines the deep idle mechanics of **Melvor Idle** with the rich world of **classic EverQuest**. Starting from the original 1999 vanilla release, the game will grow with expansions forever. Nothing is ever removed — everything builds on what came before.

---

## 📌 MASTER DESIGN DOCUMENT
> This README is the single source of truth for the project. All key design decisions, systems, and data live here so nothing is ever lost.

---

## 🎯 Vision & Inspiration

- **Core Gameplay Loop:** Melvor Idle — idle/incremental mechanics, skill grinding, passive progress
- **World & Content:** EverQuest (1999 Vanilla) — classes, zones, monsters, items, lore
- **Start:** Vanilla EverQuest (1999) — all classes, all zones, all monsters, all items
- **Growth:** Expansions added over time (Ruins of Kunark → Scars of Velious → Shadows of Luclin → ...)
- **This game will never stop growing.**

---

## 👻 Ghost Players (NPC Simulation Engine)

One of the most unique systems in EverQuest Idle is the **Ghost Player Engine** — a population of 100 simulated players who inhabit the world alongside the real player.

### Core Concept
- **100 Ghost Players** to start, each treated as a full player character
- Each starts at **Level 1** and grows organically over time
- They are **not bots** — they are simulated personalities with persistent state
- The real player and ghost players share the same world, economy, and systems

### Ghost Player Behaviors
Ghost players have randomized but persistent **personality profiles** that determine their playstyle:

| Personality Type | Behavior |
|-----------------|----------|
| **The Grinder** | Always hunting, pushes to max level, raids when possible |
| **The Tradeskiller** | Rarely fights; focuses on crafting, harvesting, selling |
| **The Merchant** | Buys low, sells high on the Bazaar; flips items |
| **The Casual** | Logs in and out irregularly; slow progression |
| **The Tank** | Gears defensively, seeks groups, joins raid forces |
| **The Healer** | Cleric/Druid/Shaman builds; keeps groups alive |
| **The Loner** | Solos everything; avoids groups |
| **The Social** | Groups constantly; may not be the best geared but always online |
| **The AFK Farmer** | Online but idle; grinds easy mobs passively |

### Ghost Player Systems (Complex Engine Required)
- [ ] **Login/Logout Simulation** — each ghost has a schedule (peak hours, night owls, weekenders)
- [ ] **Progression Engine** — level, skills, gear all advance over real time
- [ ] **Personality Persistence** — traits are seeded at creation and never change
- [ ] **Economy Participation** — buy/sell on the Bazaar, drive supply/demand
- [ ] **Group Formation** — ghosts seek groups based on personality and zone level
- [ ] **Tradeskill Engine** — some ghosts craft and list items for sale
- [ ] **Dynamic Names & Races** — each ghost gets a unique EQ-style name, race, and class
- [ ] **Ghost Memory** — remembers what zones they've been to, what they've killed
- [ ] **Death & Recovery** — ghosts die, lose XP, corpse run, recover
- [ ] **Reputation** — ghosts build server reputation over time (Known Tank, Famous Crafter, etc.)

---

## 🧙 Classes (Vanilla — All 14)

| Role | Classes |
|------|---------|
| **Melee** | Warrior, Monk, Rogue |
| **Hybrid** | Paladin, Shadow Knight, Ranger, Bard |
| **Priest** | Cleric, Druid, Shaman |
| **Pure Caster** | Wizard, Magician, Enchanter, Necromancer |

Each class will have:
- Unique idle skill tree
- Class-specific abilities that trigger automatically
- Gear progression tied to class
- Ghost players can be any class

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

---

## 👾 Monsters

> All monsters from vanilla EverQuest will be included. Sprite sheets will be added progressively. All monsters have a sprite placeholder until art is added.

### Monster Data Structure (per monster)
Each monster entry stores:
- `name` — display name
- `zone` — which zone(s) it spawns in
- `level_range` — min/max level
- `hp` — hit points
- `damage_range` — min/max damage per hit
- `loot_table` — array of possible drops with % chance
- `xp_reward` — base XP on kill
- `sprite` — path to sprite (placeholder until sheet added)
- `type` — (humanoid, animal, undead, magical, etc.)
- `aggro` — true/false
- `social` — true/false (calls friends when attacked)

### Confirmed Monsters (Sprite Sheet 1) ![image1](image1)

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

> All items from vanilla EverQuest will be included. Every item has a data entry. Sprite placeholders used until art is finalized.

### Item Data Structure (per item)
- `name` — display name
- `slot` — (head, chest, legs, feet, hands, wrists, back, neck, fingers, ears, waist, primary, secondary, range, ammo)
- `type` — (armor, weapon, shield, jewelry, tradeskill material, food, drink, quest item, spell scroll, container)
- `stats` — AC, STR, STA, AGI, DEX, WIS, INT, CHA, HP, MANA, SV FIRE/COLD/MAGIC/DISEASE/POISON
- `weight` — item weight
- `classes` — which classes can use it
- `races` — which races can use it
- `lore` — true/false (no drop duplicate)
- `no_drop` — true/false
- `stackable` — true/false
- `stack_size` — max stack
- `value` — vendor sell price in copper
- `source` — monster drop, tradeskill, vendor, quest reward
- `sprite` — path to sprite placeholder

---

## 🎨 Art & Sprites

### Sprite System
- All monsters and items use a **placeholder sprite** system until real art is added
- Sprite sheets are added progressively — the engine must support swapping placeholders for real sprites without code changes
- Each entity has a `sprite` field pointing to its asset path

### Sprite Sheets (Tracking)
| Sheet | Contents | Status |
|-------|----------|--------|
| Sheet 1 | Gnolls, Razorgill, Giant Plague Rat, Giant Snake, Bear, Splitpaw variants | ✅ Received |
| Sheet 2+ | TBD — added as created | 🔲 Pending |

### Placeholder Convention
```
/assets/sprites/monsters/placeholder.png   ← default monster placeholder
/assets/sprites/items/placeholder.png      ← default item placeholder
/assets/sprites/monsters/{monster_id}.png  ← real sprite when available
/assets/sprites/items/{item_id}.png        ← real sprite when available
```

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

- **Ghost players actively participate** in the Bazaar economy
- Players and ghosts list items for sale
- Supply and demand fluctuate based on ghost player activity
- Rare drops become valuable; common drops cheapen over time
- Tradeskiller ghosts craft and list items driving down prices
- Grinder ghosts flood the market with monster drops

---

## 🗓️ Roadmap

### Phase 1 — Foundation
- [ ] Core idle engine (tick system, XP, resources)
- [ ] Placeholder sprite system
- [ ] Monster data structure & first monster entries (Gnolls etc.)
- [ ] Item data structure & first item entries

### Phase 2 — Classes & Combat
- [ ] All 14 vanilla classes implemented
- [ ] Auto-combat system (Melvor-style)
- [ ] Class-specific abilities

### Phase 3 — World
- [ ] All vanilla zones implemented
- [ ] Zone-appropriate monster tables
- [ ] Zone progression (level gates)

### Phase 4 — Ghost Player Engine (MVP)
- [ ] 100 ghost players generated
- [ ] Login/logout simulation
- [ ] Basic personality system
- [ ] Ghost progression (leveling)

### Phase 5 — Economy & Tradeskills
- [ ] All vanilla tradeskills
- [ ] Bazaar system
- [ ] Ghost player economy participation

### Phase 6 — Ghost Player Engine (Full)
- [ ] Full personality behaviors
- [ ] Ghost grouping system
- [ ] Ghost reputation system
- [ ] Ghost memory & history

### Phase 7 — Polish & Depth
- [ ] All vanilla monsters with loot tables
- [ ] All vanilla items
- [ ] Quests (major quest lines)

### Phase 8 — Ruins of Kunark (Expansion 1)
- [ ] New zones, monsters, items, classes (Iksar)

### Phase 9+ — Future Expansions...

---

## 🛠️ Tech Stack

> *(To be finalized — options: TypeScript + React for browser-based, or Godot for visual upgrade path)*

---

## 🤝 Contributing

This is a long-term passion project. Contributions, ideas, and feedback are always welcome. Open an issue or start a discussion!

---

## 📜 License

MIT — Free to use, fork, and build upon.

---

*"What is this place?" — Every new EverQuest player, forever.*