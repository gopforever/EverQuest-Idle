import type { Faction, FactionStandingName } from '../types';

/** Convert a numeric faction value to the named standing */
export function getFactionStandingName(value: number): FactionStandingName {
  if (value <= -750) return 'Scowling';
  if (value <= -500) return 'Glaring';
  if (value <= -100) return 'Dubious';
  if (value < 0)    return 'Apprehensive';
  if (value < 100)  return 'Indifferent';
  if (value < 450)  return 'Amiable';
  if (value < 700)  return 'Kindly';
  if (value < 1050) return 'Warmly';
  return 'Ally';
}

/** Returns true if NPC of this faction would attack on sight */
export function isFactionHostile(value: number): boolean {
  return value <= -500; // Dubious or worse = KOS
}

/** Vendor price modifier based on CHA and faction (0.8x to 1.5x) */
export function getVendorPriceModifier(value: number, cha: number): number {
  const factionBonus = Math.max(0, Math.min(0.3, (value - 0) / 1000 * 0.3));
  const chaBonus = Math.max(0, Math.min(0.1, (cha - 75) / 250 * 0.1));
  const base = 1.5; // unfriendly price
  return Math.max(0.8, base - factionBonus - chaBonus);
}

export const FACTIONS: Record<string, Faction> = {

  // ── Qeynos / Antonica Good ────────────────────────────────────────
  guards_of_qeynos: {
    id: 'guards_of_qeynos',
    name: 'Guards of Qeynos',
    description: 'The city guards of Qeynos, loyal to Antonius Bayle IV.',
    city: 'qeynos',
    alignment: 'good',
    defaultValue: 0,
    killedBy: ['gnoll_pup', 'scrawny_gnoll', 'gnoll', 'gnoll_armored', 'gnoll_guard',
               'gnoll_shaman', 'gnoll_elite_guard', 'gnoll_commander', 'splitpaw_refugee',
               'pyzjn'],
    raisedByKilling: [],
    linkedFactions: [
      { factionId: 'citizens_of_qeynos', modifier: 0.5 },
      { factionId: 'knights_of_thunder', modifier: 0.3 },
    ],
  },

  citizens_of_qeynos: {
    id: 'citizens_of_qeynos',
    name: 'Citizens of Qeynos',
    description: 'The common folk and merchants of Qeynos.',
    city: 'qeynos',
    alignment: 'good',
    defaultValue: 0,
    killedBy: [],
    linkedFactions: [],
  },

  knights_of_thunder: {
    id: 'knights_of_thunder',
    name: 'Knights of Thunder',
    description: 'The holy warrior order of Qeynos, champions of Karana.',
    city: 'qeynos',
    alignment: 'good',
    defaultValue: 0,
    killedBy: [],
    linkedFactions: [
      { factionId: 'guards_of_qeynos', modifier: 0.5 },
    ],
  },

  bloodsabers: {
    id: 'bloodsabers',
    name: 'Bloodsabers',
    description: 'A secret cult of necromancers hiding beneath Qeynos.',
    city: 'qeynos',
    alignment: 'evil',
    defaultValue: -200,
    killedBy: [],
    linkedFactions: [
      { factionId: 'corrupt_qeynos_guards', modifier: 0.7 },
    ],
  },

  corrupt_qeynos_guards: {
    id: 'corrupt_qeynos_guards',
    name: 'Corrupt Qeynos Guards',
    description: 'Qeynos guards who have fallen to corruption and deal with the Bloodsabers.',
    city: 'qeynos',
    alignment: 'evil',
    defaultValue: -200,
    killedBy: [],
    linkedFactions: [],
  },

  // ── Blackburrow Gnolls ───────────────────────────────────────────
  inhabitants_blackburrow: {
    id: 'inhabitants_blackburrow',
    name: 'Inhabitants of Blackburrow',
    description: 'The gnoll tribes of Blackburrow, enemies of Qeynos.',
    alignment: 'evil',
    defaultValue: -500,
    killedBy: ['guards_of_qeynos', 'citizens_of_qeynos'],
    raisedByKilling: [],
    linkedFactions: [
      { factionId: 'splitpaw_gnolls', modifier: 0.5 },
    ],
  },

  splitpaw_gnolls: {
    id: 'splitpaw_gnolls',
    name: 'Splitpaw Gnolls',
    description: 'The gnoll tribe of Splitpaw Lair, rivals to the Blackburrow gnolls.',
    alignment: 'evil',
    defaultValue: -500,
    killedBy: [],
    linkedFactions: [],
  },

  // ── Freeport ─────────────────────────────────────────────────────
  freeport_militia: {
    id: 'freeport_militia',
    name: 'Freeport Militia',
    description: 'The military arm of Freeport, corrupt and iron-fisted.',
    city: 'freeport',
    alignment: 'neutral',
    defaultValue: 0,
    killedBy: [],
    linkedFactions: [
      { factionId: 'citizens_of_freeport', modifier: 0.5 },
    ],
  },

  citizens_of_freeport: {
    id: 'citizens_of_freeport',
    name: 'Citizens of Freeport',
    description: 'The merchants and common people living within the Freeport city walls.',
    city: 'freeport',
    alignment: 'neutral',
    defaultValue: 0,
    killedBy: [],
    linkedFactions: [],
  },

  knights_of_truth: {
    id: 'knights_of_truth',
    name: 'Knights of Truth',
    description: 'Paladins of Qeynos who maintain order in Freeport East.',
    city: 'freeport',
    alignment: 'good',
    defaultValue: 0,
    killedBy: [],
    linkedFactions: [],
  },

  dismal_rage: {
    id: 'dismal_rage',
    name: 'Dismal Rage',
    description: 'The dark cleric guild of Freeport, servants of Bertoxxulous.',
    city: 'freeport',
    alignment: 'evil',
    defaultValue: -400,
    killedBy: [],
    linkedFactions: [],
  },

  steel_warriors: {
    id: 'steel_warriors',
    name: 'Steel Warriors',
    description: 'The warrior guild of Freeport.',
    city: 'freeport',
    alignment: 'neutral',
    defaultValue: 0,
    killedBy: [],
    linkedFactions: [],
  },

  // ── Neriak ───────────────────────────────────────────────────────
  neriak_foreign_quarter: {
    id: 'neriak_foreign_quarter',
    name: 'Neriak — Foreign Quarter',
    description: 'The outer quarter of the dark elf city of Neriak.',
    city: 'neriak',
    alignment: 'evil',
    defaultValue: -300,
    killedBy: [],
    linkedFactions: [],
  },

  neriak_commons: {
    id: 'neriak_commons',
    name: 'Neriak — Commons',
    description: 'The middle district of Neriak.',
    city: 'neriak',
    alignment: 'evil',
    defaultValue: -300,
    killedBy: [],
    linkedFactions: [],
  },

  neriak_third_gate: {
    id: 'neriak_third_gate',
    name: "Neriak — Third Gate",
    description: 'The innermost and most powerful district of Neriak.',
    city: 'neriak',
    alignment: 'evil',
    defaultValue: -500,
    killedBy: [],
    linkedFactions: [],
  },

  indigo_brotherhood: {
    id: 'indigo_brotherhood',
    name: 'Indigo Brotherhood',
    description: 'The rogue guild of Neriak.',
    city: 'neriak',
    alignment: 'evil',
    defaultValue: -400,
    killedBy: [],
    linkedFactions: [],
  },

  // ── Faydwer ──────────────────────────────────────────────────────
  kelethin_guards: {
    id: 'kelethin_guards',
    name: 'Kelethin Guards',
    description: 'The wood elf guards of Kelethin, the treetop city of Faydwer.',
    city: 'kelethin',
    alignment: 'good',
    defaultValue: 0,
    killedBy: [],
    linkedFactions: [
      { factionId: 'citizens_of_kelethin', modifier: 0.5 },
    ],
  },

  citizens_of_kelethin: {
    id: 'citizens_of_kelethin',
    name: 'Citizens of Kelethin',
    description: 'The wood elves of Kelethin in the Greater Faydark.',
    city: 'kelethin',
    alignment: 'good',
    defaultValue: 0,
    killedBy: [],
    linkedFactions: [],
  },

  felguard: {
    id: 'felguard',
    name: 'Felguard',
    description: 'The dark elf militia of Felwithe, enemies of the wood elves.',
    city: 'felwithe',
    alignment: 'evil',
    defaultValue: -500,
    killedBy: [],
    linkedFactions: [],
  },

  king_tearis_thex: {
    id: 'king_tearis_thex',
    name: "King Tearis Thex's Loyalists",
    description: 'Followers of the High Elf king of Felwithe.',
    city: 'felwithe',
    alignment: 'good',
    defaultValue: 0,
    killedBy: [],
    linkedFactions: [],
  },

  // ── Dragon Factions ──────────────────────────────────────────────
  ring_of_scale: {
    id: 'ring_of_scale',
    name: 'Ring of Scale',
    description: 'Dragon faction associated with the ancient dragons of Norrath.',
    alignment: 'evil',
    defaultValue: -200,
    killedBy: ['lord_nagafen', 'lady_vox'],
    linkedFactions: [],
  },

  claws_of_veeshan: {
    id: 'claws_of_veeshan',
    name: 'Claws of Veeshan',
    description: 'The dragon faction loyal to the Wurmqueen Veeshan.',
    alignment: 'neutral',
    defaultValue: 0,
    killedBy: ['lord_nagafen', 'lady_vox'],
    linkedFactions: [],
  },

  // ── Oggok / Grobb ────────────────────────────────────────────────
  ogguk_guards: {
    id: 'ogguk_guards',
    name: 'Ogguk Guards',
    description: 'The ogre guards of Oggok city.',
    city: 'oggok',
    alignment: 'evil',
    defaultValue: -500,
    killedBy: [],
    linkedFactions: [],
  },

  grobb_guards: {
    id: 'grobb_guards',
    name: 'Grobb Guards',
    description: 'The troll guards of Grobb city.',
    city: 'grobb',
    alignment: 'evil',
    defaultValue: -500,
    killedBy: [],
    linkedFactions: [],
  },

  // ── Underfoot / Planes ───────────────────────────────────────────
  temple_of_cazic_thule: {
    id: 'temple_of_cazic_thule',
    name: 'Temple of Cazic-Thule',
    description: 'The servants of the Fear god, enemies of all civilization.',
    alignment: 'evil',
    defaultValue: -1000,
    killedBy: [],
    linkedFactions: [],
  },

  servants_of_innoruuk: {
    id: 'servants_of_innoruuk',
    name: 'Servants of Innoruuk',
    description: 'Denizens of the Plane of Hate, utterly hostile to all.',
    alignment: 'evil',
    defaultValue: -2000,
    killedBy: [],
    linkedFactions: [],
  },
};

export const FACTION_LIST = Object.values(FACTIONS);

/** Get starting faction standings for a new character */
export function getStartingFactionStandings(race: string, charClass: string): Record<string, number> {
  const standings: Record<string, number> = {};

  // Set all factions to their defaults
  for (const faction of FACTION_LIST) {
    standings[faction.id] = faction.defaultValue;
  }

  // Race-based adjustments
  const raceBoosts: Record<string, Record<string, number>> = {
    Human:     { guards_of_qeynos: 100, freeport_militia: 100, citizens_of_freeport: 100 },
    Barbarian: { guards_of_qeynos: -50, freeport_militia: 0 },
    Erudite:   { guards_of_qeynos: 50, citizens_of_qeynos: 100 },
    WoodElf:   { kelethin_guards: 300, citizens_of_kelethin: 300, guards_of_qeynos: 100 },
    HighElf:   { kelethin_guards: 100, king_tearis_thex: 300, guards_of_qeynos: 100 },
    DarkElf:   { neriak_foreign_quarter: 200, neriak_commons: 200, guards_of_qeynos: -400, inhabitants_blackburrow: 200 },
    HalfElf:   { guards_of_qeynos: 50, kelethin_guards: 100, freeport_militia: 50 },
    Dwarf:     { guards_of_qeynos: 100, freeport_militia: 50 },
    Troll:     { grobb_guards: 300, guards_of_qeynos: -600, freeport_militia: -400 },
    Ogre:      { ogguk_guards: 300, guards_of_qeynos: -600, freeport_militia: -200 },
    Halfling:  { guards_of_qeynos: 200, citizens_of_qeynos: 200 },
    Gnome:     { guards_of_qeynos: 50, citizens_of_qeynos: 100 },
  };

  const classBoosts: Record<string, Record<string, number>> = {
    Necromancer: { bloodsabers: 300, guards_of_qeynos: -200, inhabitants_blackburrow: 200, temple_of_cazic_thule: 100 },
    ShadowKnight: { dismal_rage: 100, bloodsabers: 100, guards_of_qeynos: -200 },
    Paladin:     { knights_of_truth: 200, knights_of_thunder: 200, guards_of_qeynos: 100 },
    Cleric:      { guards_of_qeynos: 50, citizens_of_qeynos: 100 },
    Druid:       { kelethin_guards: 100, citizens_of_kelethin: 100 },
    Shaman:      { grobb_guards: 50, ogguk_guards: 50 },
  };

  const rb = raceBoosts[race] ?? {};
  for (const [fid, delta] of Object.entries(rb)) {
    standings[fid] = Math.max(-2000, Math.min(2000, (standings[fid] ?? 0) + delta));
  }

  const cb = classBoosts[charClass] ?? {};
  for (const [fid, delta] of Object.entries(cb)) {
    standings[fid] = Math.max(-2000, Math.min(2000, (standings[fid] ?? 0) + delta));
  }

  return standings;
}
