import type { Race, CharacterClass, CharacterStats } from '../types';

// ── Race/Class Restrictions (EQ-accurate vanilla) ─────────────────────────────

export const RACE_CLASS_COMBOS: Record<Race, CharacterClass[]> = {
  Human:     ['Warrior', 'Paladin', 'Ranger', 'ShadowKnight', 'Monk', 'Bard', 'Rogue', 'Shaman', 'Cleric', 'Druid', 'Wizard', 'Magician', 'Enchanter', 'Necromancer'],
  Barbarian: ['Warrior', 'Rogue', 'Shaman'],
  Erudite:   ['Wizard', 'Magician', 'Enchanter', 'Necromancer', 'Cleric', 'Paladin', 'ShadowKnight'],
  WoodElf:   ['Warrior', 'Ranger', 'Rogue', 'Druid', 'Bard'],
  HighElf:   ['Paladin', 'Ranger', 'Cleric', 'Wizard', 'Magician', 'Enchanter'],
  DarkElf:   ['Warrior', 'Rogue', 'ShadowKnight', 'Wizard', 'Magician', 'Enchanter', 'Necromancer', 'Cleric'],
  HalfElf:   ['Warrior', 'Paladin', 'Ranger', 'Rogue', 'Bard', 'Druid', 'Cleric'],
  Dwarf:     ['Warrior', 'Paladin', 'Rogue', 'Cleric', 'Shaman'],
  Troll:     ['Warrior', 'ShadowKnight', 'Shaman'],
  Ogre:      ['Warrior', 'ShadowKnight', 'Shaman'],
  Halfling:  ['Warrior', 'Ranger', 'Rogue', 'Cleric', 'Druid'],
  Gnome:     ['Warrior', 'Rogue', 'Wizard', 'Magician', 'Enchanter', 'Necromancer', 'Cleric'],
};

// ── Base Stats by Race (EQ-accurate vanilla) ──────────────────────────────────

export const RACE_BASE_STATS: Record<Race, Omit<CharacterStats, 'hp' | 'maxHp' | 'mana' | 'maxMana' | 'ac' | 'attack'>> = {
  Human:     { str: 75,  sta: 75,  agi: 75,  dex: 75,  wis: 75,  int: 75,  cha: 75  },
  Barbarian: { str: 103, sta: 95,  agi: 82,  dex: 70,  wis: 70,  int: 60,  cha: 55  },
  Erudite:   { str: 60,  sta: 70,  agi: 70,  dex: 70,  wis: 83,  int: 107, cha: 70  },
  WoodElf:   { str: 65,  sta: 65,  agi: 95,  dex: 80,  wis: 80,  int: 75,  cha: 75  },
  HighElf:   { str: 55,  sta: 65,  agi: 85,  dex: 75,  wis: 95,  int: 92,  cha: 80  },
  DarkElf:   { str: 60,  sta: 65,  agi: 90,  dex: 75,  wis: 83,  int: 99,  cha: 60  },
  HalfElf:   { str: 70,  sta: 70,  agi: 90,  dex: 85,  wis: 70,  int: 75,  cha: 75  },
  Dwarf:     { str: 90,  sta: 90,  agi: 70,  dex: 90,  wis: 83,  int: 60,  cha: 45  },
  Troll:     { str: 108, sta: 109, agi: 83,  dex: 75,  wis: 60,  int: 52,  cha: 40  },
  Ogre:      { str: 130, sta: 122, agi: 70,  dex: 70,  wis: 67,  int: 60,  cha: 40  },
  Halfling:  { str: 70,  sta: 75,  agi: 95,  dex: 90,  wis: 80,  int: 67,  cha: 75  },
  Gnome:     { str: 60,  sta: 70,  agi: 85,  dex: 85,  wis: 67,  int: 98,  cha: 60  },
};

// ── Class Stat Bonuses (applied on top of race base) ─────────────────────────

export const CLASS_STAT_BONUSES: Record<CharacterClass, Partial<Omit<CharacterStats, 'hp' | 'maxHp' | 'mana' | 'maxMana' | 'ac' | 'attack'>>> = {
  Warrior:      { str: 5,  sta: 5                    },
  Paladin:      { str: 3,  sta: 3,  wis: 2           },
  ShadowKnight: { str: 3,  sta: 3,  int: 2           },
  Ranger:       { str: 3,  agi: 3,  wis: 2           },
  Monk:         { str: 3,  agi: 5,  dex: 2           },
  Bard:         { str: 3,  dex: 3,  cha: 4           },
  Rogue:        { str: 2,  agi: 5,  dex: 3           },
  Cleric:       { wis: 5,  sta: 3                    },
  Druid:        { wis: 5,  agi: 2                    },
  Shaman:       { wis: 5,  sta: 2                    },
  Wizard:       { int: 5,  wis: 2                    },
  Magician:     { int: 5,  sta: 2                    },
  Enchanter:    { int: 5,  cha: 3                    },
  Necromancer:  { int: 5,  dex: 2                    },
};

// ── Starting Zones by Race ────────────────────────────────────────────────────

export const RACE_STARTING_ZONES: Record<Race, string> = {
  Human:     'qeynos_hills',
  Barbarian: 'everfrost_peaks',
  Erudite:   'toxxulia_forest',
  WoodElf:   'greater_faydark',
  HighElf:   'greater_faydark',
  DarkElf:   'nektulos_forest',
  HalfElf:   'qeynos_hills',
  Dwarf:     'butcherblock_mountains',
  Troll:     'innothule_swamp',
  Ogre:      'innothule_swamp',
  Halfling:  'misty_thicket',
  Gnome:     'steamfont_mountains',
};

// ── Starting Skills by Class ──────────────────────────────────────────────────

export const CLASS_STARTING_SKILLS: Record<CharacterClass, Record<string, number>> = {
  Warrior:      { '1HSlash': 5, '2HSlash': 5, Offense: 5, Defense: 5 },
  Monk:         { HandToHand: 5, Offense: 5, Defense: 5 },
  Rogue:        { '1HSlash': 5, Backstab: 5, Offense: 5, Defense: 5 },
  Paladin:      { '1HSlash': 5, Offense: 5, Defense: 5 },
  ShadowKnight: { '1HSlash': 5, Offense: 5, Defense: 5 },
  Ranger:       { '1HSlash': 5, Archery: 5, Offense: 5, Defense: 5 },
  Bard:         { '1HSlash': 5, Offense: 5, Defense: 5, Singing: 5 },
  Cleric:       { Meditate: 1, Channeling: 1, Defense: 5 },
  Druid:        { Meditate: 1, Channeling: 1, Defense: 5 },
  Shaman:       { Meditate: 1, Channeling: 1, Defense: 5 },
  Wizard:       { Meditate: 1, Channeling: 1, Defense: 5 },
  Magician:     { Meditate: 1, Channeling: 1, Defense: 5 },
  Enchanter:    { Meditate: 1, Channeling: 1, Defense: 5 },
  Necromancer:  { Meditate: 1, Channeling: 1, Defense: 5 },
};

// ── Melee classes ─────────────────────────────────────────────────────────────

export const MELEE_CLASSES = new Set<CharacterClass>([
  'Warrior', 'Monk', 'Rogue', 'Paladin', 'ShadowKnight', 'Ranger', 'Bard',
]);

// ── Caster classes ────────────────────────────────────────────────────────────

export const CASTER_CLASSES = new Set<CharacterClass>([
  'Cleric', 'Druid', 'Shaman', 'Wizard', 'Magician', 'Enchanter', 'Necromancer',
]);

// ── Race descriptions ─────────────────────────────────────────────────────────

export const RACE_DESCRIPTIONS: Record<Race, string> = {
  Human:     'Versatile and adaptable, Humans can master any profession. They hail from the cities of Qeynos and Freeport.',
  Barbarian: 'Fierce warriors from the icy north city of Halas. Barbarians have immense strength and stamina.',
  Erudite:   'The most intelligent race in Norrath, Erudites are masters of magic. They make exceptional casters.',
  WoodElf:   'Agile and nature-attuned, Wood Elves are gifted scouts and druids. They call Kelethin home.',
  HighElf:   'Graceful and wise, High Elves excel at divine and arcane magic. They dwell in Felwithe.',
  DarkElf:   'Cunning and ruthless, Dark Elves embrace shadow magic. They inhabit the underground city of Neriak.',
  HalfElf:   'Born of both worlds, Half Elves are versatile and charismatic.',
  Dwarf:     'Stout and resolute, Dwarves are masterful fighters and clerics from the halls of Kaladim.',
  Troll:     'Massive and brutal, Trolls are among the strongest beings in Norrath. Their regeneration is unmatched.',
  Ogre:      'The strongest race in Norrath, Ogres are nearly unstoppable in melee combat.',
  Halfling:  'Small but surprisingly deadly, Halflings are gifted rangers and rogues from Rivervale.',
  Gnome:     "Brilliant tinkerers from Ak'Anon, Gnomes are gifted wizards and enchanters.",
};

// ── Class descriptions ────────────────────────────────────────────────────────

export const CLASS_DESCRIPTIONS: Record<CharacterClass, string> = {
  Warrior:      'The master of melee combat. Highest HP, best armor, taunt ability.',
  Paladin:      'Holy warrior combining combat and healing. XP penalty applies.',
  ShadowKnight: 'Dark warrior blending melee and necromancy. XP penalty applies.',
  Ranger:       "Nature's warrior — melee and archery specialist. XP penalty applies.",
  Monk:         'Disciplined martial artist. Fast attacks, high dodge. Fists of steel.',
  Bard:         'The ultimate utility class — songs buff allies and debuff enemies. XP penalty applies.',
  Rogue:        'Master of stealth and backstab. Highest single-hit damage.',
  Cleric:       'Primary healer of Norrath. Best resurrection, powerful divine magic.',
  Druid:        'Nature priest. Powerful healer and portcaller. SoW and snare.',
  Shaman:       'Spiritual healer with potent buffs, slows, and dots.',
  Wizard:       'Pure nuker — highest burst damage of any class.',
  Magician:     'Summoner of elemental pets and powerful DD spells.',
  Enchanter:    'Master of crowd control and mana regen. Most complex class in EQ.',
  Necromancer:  'Master of undead — pets, dots, and life-tap spells.',
};

// ── Readable display names for races ─────────────────────────────────────────

export const RACE_DISPLAY_NAMES: Record<Race, string> = {
  Human:     'Human',
  Barbarian: 'Barbarian',
  Erudite:   'Erudite',
  WoodElf:   'Wood Elf',
  HighElf:   'High Elf',
  DarkElf:   'Dark Elf',
  HalfElf:   'Half Elf',
  Dwarf:     'Dwarf',
  Troll:     'Troll',
  Ogre:      'Ogre',
  Halfling:  'Halfling',
  Gnome:     'Gnome',
};
