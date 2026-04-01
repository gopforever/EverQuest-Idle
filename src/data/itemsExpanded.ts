/**
 * itemsExpanded.ts
 * ~200 authentic classic EverQuest items, organized by zone/tier.
 * Merged into ITEMS in items.ts via spread.
 */
import type { Item, CharacterClass } from '../types';

const ALL_CLASSES: CharacterClass[] = [
  'Warrior', 'Monk', 'Rogue', 'Paladin', 'ShadowKnight', 'Ranger', 'Bard',
  'Cleric', 'Druid', 'Shaman', 'Wizard', 'Magician', 'Enchanter', 'Necromancer',
];
const MELEE: CharacterClass[] = ['Warrior', 'Monk', 'Rogue', 'Paladin', 'ShadowKnight', 'Ranger', 'Bard'];
const CASTER: CharacterClass[] = ['Cleric', 'Druid', 'Shaman', 'Wizard', 'Magician', 'Enchanter', 'Necromancer'];
const TANK: CharacterClass[] = ['Warrior', 'Paladin', 'ShadowKnight'];
const PLATE: CharacterClass[] = ['Warrior', 'Paladin', 'ShadowKnight', 'Cleric'];
const CHAIN: CharacterClass[] = ['Warrior', 'Paladin', 'ShadowKnight', 'Ranger', 'Bard', 'Cleric', 'Shaman'];
const LEATHER: CharacterClass[] = ['Monk', 'Rogue', 'Druid', 'Bard', 'Ranger'];
const SILK: CharacterClass[] = ['Wizard', 'Magician', 'Enchanter', 'Necromancer'];
const HEALERS: CharacterClass[] = ['Cleric', 'Druid', 'Shaman'];
const SP = '/assets/sprites/items/placeholder.png';

export const ITEMS_EXPANDED: Record<string, Item> = {

  // ═══════════════════════════════════════════════════════════════
  // QEYNOS HILLS / EARLY ANTONICA  (levels 1–10)
  // ═══════════════════════════════════════════════════════════════

  gnoll_pelt: {
    id: 'gnoll_pelt', name: 'Gnoll Pelt',
    slot: null, type: 'tradeskill', rarity: 'common',
    stats: {}, weight: 0.5, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 20, value: 3,
    source: 'drop', sprite: SP, description: 'A rough gnoll pelt. Used in tailoring.',
  },
  rat_pelt: {
    id: 'rat_pelt', name: 'Rat Pelt',
    slot: null, type: 'tradeskill', rarity: 'common',
    stats: {}, weight: 0.2, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 20, value: 1,
    source: 'drop', sprite: SP, description: 'A small rat pelt.',
  },
  wasp_wings: {
    id: 'wasp_wings', name: 'Wasp Wings',
    slot: null, type: 'tradeskill', rarity: 'common',
    stats: {}, weight: 0.1, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 20, value: 2,
    source: 'drop', sprite: SP, description: 'Translucent wasp wings. Tradeskill component.',
  },
  tattered_cloth_cap: {
    id: 'tattered_cloth_cap', name: 'Tattered Cloth Cap',
    slot: 'Head', type: 'armor', rarity: 'common',
    stats: { ac: 2 }, weight: 0.5, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 2,
    source: 'drop', sprite: SP, recLevel: 1, reqLevel: 1,
    description: 'A worn cloth cap.',
  },
  rough_hide_cloak: {
    id: 'rough_hide_cloak', name: 'Rough Hide Cloak',
    slot: 'Back', type: 'armor', rarity: 'common',
    stats: { ac: 4, sta: 1 }, weight: 1.5, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 8,
    source: 'drop', sprite: SP, recLevel: 2, reqLevel: 1,
    description: 'A cloak made from rough animal hide.',
  },
  bone_earring: {
    id: 'bone_earring', name: 'Bone Earring',
    slot: 'Ear1', type: 'jewelry', rarity: 'common',
    stats: { svDisease: 2 }, weight: 0.1, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 5,
    source: 'drop', sprite: SP, recLevel: 1,
    description: 'An earring carved from bone. Offers slight protection from disease.',
  },
  pyzjn_eye: {
    id: 'pyzjn_eye', name: "Pyzjn's Eye",
    slot: null, type: 'quest', rarity: 'rare',
    stats: {}, weight: 0.1, classes: ALL_CLASSES, races: 'ALL',
    lore: true, noDrop: true, stackable: false, value: 0,
    source: 'drop', sprite: SP, description: 'The eye of the named gnoll Pyzjn. Used in a quest.',
  },

  // ═══════════════════════════════════════════════════════════════
  // FINE STEEL WEAPONS  (widespread, levels 5–20)
  // ═══════════════════════════════════════════════════════════════

  fine_steel_sword: {
    id: 'fine_steel_sword', name: 'Fine Steel Sword',
    slot: 'Primary', type: 'weapon', rarity: 'uncommon',
    stats: { damage: 9, delay: 28 }, weight: 7.5, classes: MELEE, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 65,
    source: 'drop', sprite: SP, recLevel: 8, reqLevel: 5,
    description: 'A finely forged steel sword. Better than the average weapon.',
  },
  fine_steel_dagger: {
    id: 'fine_steel_dagger', name: 'Fine Steel Dagger',
    slot: 'Primary', type: 'weapon', rarity: 'uncommon',
    stats: { damage: 7, delay: 22 }, weight: 3.5, classes: [...MELEE, 'Necromancer', 'Magician'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 55,
    source: 'drop', sprite: SP, recLevel: 6, reqLevel: 3,
    description: 'A finely crafted steel dagger, quick and sharp.',
  },
  fine_steel_long_sword: {
    id: 'fine_steel_long_sword', name: 'Fine Steel Long Sword',
    slot: 'Primary', type: 'weapon', rarity: 'uncommon',
    stats: { damage: 10, delay: 30 }, weight: 9.0, classes: [...TANK, 'Ranger', 'Bard'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 75,
    source: 'drop', sprite: SP, recLevel: 10, reqLevel: 7,
    description: 'A long, well-balanced steel blade.',
  },
  fine_steel_morning_star: {
    id: 'fine_steel_morning_star', name: 'Fine Steel Morning Star',
    slot: 'Primary', type: 'weapon', rarity: 'uncommon',
    stats: { damage: 10, delay: 30 }, weight: 10.5, classes: [...PLATE, 'Shaman'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 60,
    source: 'drop', sprite: SP, recLevel: 8, reqLevel: 5,
    description: 'A spiked morning star of fine steel construction.',
  },
  fine_steel_two_hander: {
    id: 'fine_steel_two_hander', name: 'Fine Steel Two-Hander',
    slot: 'Primary', type: 'weapon', rarity: 'uncommon',
    stats: { damage: 17, delay: 40 }, weight: 14.0, classes: ['Warrior', 'Paladin', 'ShadowKnight', 'Ranger'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 90,
    source: 'drop', sprite: SP, recLevel: 10, reqLevel: 8,
    description: 'A two-handed sword of fine steel.',
  },

  // ═══════════════════════════════════════════════════════════════
  // BLACKBURROW  (levels 5–15)
  // ═══════════════════════════════════════════════════════════════

  gnoll_fur_gloves: {
    id: 'gnoll_fur_gloves', name: 'Gnoll Fur Gloves',
    slot: 'Hands', type: 'armor', rarity: 'common',
    stats: { ac: 5, dex: 1 }, weight: 1.0, classes: [...LEATHER, ...HEALERS], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 18,
    source: 'drop', sprite: SP, recLevel: 5, reqLevel: 3,
    description: 'Gloves lined with gnoll fur. Surprisingly warm.',
  },
  gnoll_fur_boots: {
    id: 'gnoll_fur_boots', name: 'Gnoll Fur Boots',
    slot: 'Feet', type: 'armor', rarity: 'common',
    stats: { ac: 4, agi: 1 }, weight: 2.5, classes: [...LEATHER, ...HEALERS], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 15,
    source: 'drop', sprite: SP, recLevel: 5,
    description: 'Boots made from gnoll fur. Light and comfortable.',
  },
  gnoll_fur_cloak: {
    id: 'gnoll_fur_cloak', name: 'Gnoll Fur Cloak',
    slot: 'Back', type: 'armor', rarity: 'common',
    stats: { ac: 5, sta: 2 }, weight: 2.0, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 22,
    source: 'drop', sprite: SP, recLevel: 5,
    description: 'A warm cloak fashioned from gnoll fur.',
  },
  gnollish_war_shield: {
    id: 'gnollish_war_shield', name: 'Gnollish War Shield',
    slot: 'Secondary', type: 'shield', rarity: 'uncommon',
    stats: { ac: 8 }, weight: 8.0, classes: [...PLATE, 'Shaman', 'Bard'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 30,
    source: 'drop', sprite: SP, recLevel: 8,
    description: 'A crude shield used by gnoll guards.',
  },
  locket_of_escape: {
    id: 'locket_of_escape', name: 'Locket of Escape',
    slot: 'Neck', type: 'jewelry', rarity: 'rare',
    stats: { ac: 3, hp: 15 }, weight: 0.3, classes: ALL_CLASSES, races: 'ALL',
    lore: true, noDrop: false, stackable: false, value: 200,
    source: 'drop', sprite: SP, recLevel: 10,
    description: 'A magical locket found deep in Blackburrow. Tingles with latent magic.',
  },
  // ═══════════════════════════════════════════════════════════════
  // WEST / EAST COMMONLANDS  (levels 1–10)
  // ═══════════════════════════════════════════════════════════════

  orcish_axe: {
    id: 'orcish_axe', name: 'Orcish Axe',
    slot: 'Primary', type: 'weapon', rarity: 'common',
    stats: { damage: 8, delay: 28 }, weight: 9.0, classes: MELEE, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 25,
    source: 'drop', sprite: SP, recLevel: 5,
    description: 'A crude but functional orcish axe.',
  },
  orcish_war_shield: {
    id: 'orcish_war_shield', name: 'Orcish War Shield',
    slot: 'Secondary', type: 'shield', rarity: 'common',
    stats: { ac: 7 }, weight: 9.5, classes: [...PLATE, 'Shaman', 'Bard'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 20,
    source: 'drop', sprite: SP, recLevel: 5,
    description: 'A battered orcish shield.',
  },
  cracked_leather_tunic: {
    id: 'cracked_leather_tunic', name: 'Cracked Leather Tunic',
    slot: 'Chest', type: 'armor', rarity: 'common',
    stats: { ac: 6 }, weight: 4.0, classes: LEATHER, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 12,
    source: 'drop', sprite: SP, recLevel: 4,
    description: 'A cracked and weathered leather tunic.',
  },
  cracked_leather_bracer: {
    id: 'cracked_leather_bracer', name: 'Cracked Leather Bracer',
    slot: 'Wrist1', type: 'armor', rarity: 'common',
    stats: { ac: 3 }, weight: 1.5, classes: LEATHER, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 8,
    source: 'drop', sprite: SP, recLevel: 3,
    description: 'A cracked leather bracer.',
  },
  orc_hide_leggings: {
    id: 'orc_hide_leggings', name: 'Orc Hide Leggings',
    slot: 'Legs', type: 'armor', rarity: 'common',
    stats: { ac: 5 }, weight: 3.0, classes: LEATHER, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 14,
    source: 'drop', sprite: SP, recLevel: 4,
    description: 'Leggings fashioned from orcish hide.',
  },

  // ═══════════════════════════════════════════════════════════════
  // CRUSHBONE  (levels 8–20)
  // ═══════════════════════════════════════════════════════════════

  crushbone_belt: {
    id: 'crushbone_belt', name: 'Crushbone Belt',
    slot: 'Waist', type: 'jewelry', rarity: 'rare',
    stats: { wis: 3, cha: 3, svDisease: 3 }, weight: 0.5, classes: ALL_CLASSES, races: 'ALL',
    lore: true, noDrop: true, stackable: false, value: 0,
    source: 'drop', sprite: SP, recLevel: 10,
    description: 'A magical belt from the heart of Crushbone. Sought by many adventurers.',
  },
  orc_legionnaire_helm: {
    id: 'orc_legionnaire_helm', name: 'Orc Legionnaire Helm',
    slot: 'Head', type: 'armor', rarity: 'common',
    stats: { ac: 7, str: 1 }, weight: 7.0, classes: CHAIN, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 28,
    source: 'drop', sprite: SP, recLevel: 8,
    description: 'The battle-worn helm of an orcish legionnaire.',
  },
  orc_legionnaire_shield: {
    id: 'orc_legionnaire_shield', name: 'Orc Legionnaire Shield',
    slot: 'Secondary', type: 'shield', rarity: 'uncommon',
    stats: { ac: 12, str: 1 }, weight: 11.0, classes: [...PLATE, 'Shaman', 'Bard'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 45,
    source: 'drop', sprite: SP, recLevel: 10,
    description: 'A heavy shield carried by orcish legionnaires.',
  },
  dwarven_battle_axe: {
    id: 'dwarven_battle_axe', name: 'Dwarven Battle Axe',
    slot: 'Primary', type: 'weapon', rarity: 'uncommon',
    stats: { damage: 11, delay: 26, str: 1 }, weight: 10.0, classes: MELEE, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 80,
    source: 'drop', sprite: SP, recLevel: 10,
    description: 'A fine dwarven axe, beautifully balanced.',
  },
  ambassador_dvinn_ring: {
    id: 'ambassador_dvinn_ring', name: "Dvinn's Ring of Darkness",
    slot: 'Fingers1', type: 'jewelry', rarity: 'rare',
    stats: { int: 5, svMagic: 5 }, weight: 0.1, classes: [...CASTER, ...MELEE], races: 'ALL',
    lore: true, noDrop: true, stackable: false, value: 0,
    source: 'drop', sprite: SP, recLevel: 15,
    description: "Ambassador Dvinn's personal ring, imbued with dark magic.",
  },
  crushbone_plate_gauntlets: {
    id: 'crushbone_plate_gauntlets', name: 'Crushbone Plate Gauntlets',
    slot: 'Hands', type: 'armor', rarity: 'uncommon',
    stats: { ac: 9, str: 2 }, weight: 6.0, classes: PLATE, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 55,
    source: 'drop', sprite: SP, recLevel: 12,
    description: 'Heavy gauntlets looted from a Crushbone orc.',
  },
  orc_fang_necklace: {
    id: 'orc_fang_necklace', name: 'Orc Fang Necklace',
    slot: 'Neck', type: 'jewelry', rarity: 'common',
    stats: { sta: 2 }, weight: 0.4, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 15,
    source: 'drop', sprite: SP,
    description: 'A necklace strung with orc fangs.',
  },

  // ═══════════════════════════════════════════════════════════════
  // GREATER FAYDARK / LESSER FAYDARK  (levels 1–25)
  // ═══════════════════════════════════════════════════════════════

  fairy_dust: {
    id: 'fairy_dust', name: 'Fairy Dust',
    slot: null, type: 'tradeskill', rarity: 'common',
    stats: {}, weight: 0.1, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 20, value: 8,
    source: 'drop', sprite: SP, description: 'Magical dust from a fairy. Tradeskill component.',
  },
  fairy_wing: {
    id: 'fairy_wing', name: 'Fairy Wing',
    slot: null, type: 'tradeskill', rarity: 'common',
    stats: {}, weight: 0.1, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 20, value: 5,
    source: 'drop', sprite: SP, description: 'A shimmering fairy wing. Prized by alchemists.',
  },
  brownie_staff: {
    id: 'brownie_staff', name: 'Brownie Staff',
    slot: 'Primary', type: 'weapon', rarity: 'uncommon',
    stats: { damage: 8, delay: 26, int: 2, wis: 2 }, weight: 5.0, classes: [...CASTER, 'Druid', 'Shaman'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 45,
    source: 'drop', sprite: SP, recLevel: 10,
    description: 'A magical staff wielded by Faydwer brownies.',
  },
  pixie_bow: {
    id: 'pixie_bow', name: 'Pixie Bow',
    slot: 'Range', type: 'weapon', rarity: 'uncommon',
    stats: { damage: 8, delay: 30 }, weight: 3.5, classes: ['Ranger', 'Rogue', 'Warrior', 'Bard'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 35,
    source: 'drop', sprite: SP, recLevel: 8,
    description: 'A bow crafted by pixies. Small but accurate.',
  },
  faydwer_lesser_ring: {
    id: 'faydwer_lesser_ring', name: 'Ring of the Faydwer',
    slot: 'Fingers1', type: 'jewelry', rarity: 'uncommon',
    stats: { cha: 3, int: 2 }, weight: 0.1, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 40,
    source: 'drop', sprite: SP, recLevel: 12,
    description: 'A ring crafted in the style of Faydwer.',
  },
  brownie_warrior_bracer: {
    id: 'brownie_warrior_bracer', name: 'Brownie Warrior Bracer',
    slot: 'Wrist1', type: 'armor', rarity: 'uncommon',
    stats: { ac: 7, agi: 3 }, weight: 2.0, classes: LEATHER, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 35,
    source: 'drop', sprite: SP, recLevel: 12,
    description: 'A bracer taken from a brownie warrior of Lesser Faydark.',
  },

  // ═══════════════════════════════════════════════════════════════
  // EVERFROST PEAKS  (levels 10–25)
  // ═══════════════════════════════════════════════════════════════

  mammoth_hide_cloak: {
    id: 'mammoth_hide_cloak', name: 'Mammoth Hide Cloak',
    slot: 'Back', type: 'armor', rarity: 'uncommon',
    stats: { ac: 10, sta: 5, svCold: 5 }, weight: 6.0, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 120,
    source: 'drop', sprite: SP, recLevel: 15,
    description: 'A thick cloak fashioned from mammoth hide. Excellent cold protection.',
  },
  polar_bear_skin_boots: {
    id: 'polar_bear_skin_boots', name: 'Polar Bear Skin Boots',
    slot: 'Feet', type: 'armor', rarity: 'uncommon',
    stats: { ac: 7, svCold: 5, agi: 2 }, weight: 3.0, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 80,
    source: 'drop', sprite: SP, recLevel: 12,
    description: 'Boots crafted from polar bear hide. Warm and sturdy.',
  },
  ivory_mammoth_tusk: {
    id: 'ivory_mammoth_tusk', name: 'Ivory Mammoth Tusk',
    slot: null, type: 'tradeskill', rarity: 'uncommon',
    stats: {}, weight: 3.0, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 50,
    source: 'drop', sprite: SP, description: 'An ivory tusk from a wooly mammoth. Prized by craftsmen.',
  },
  frost_giant_blood: {
    id: 'frost_giant_blood', name: 'Frost Giant Blood',
    slot: null, type: 'quest', rarity: 'uncommon',
    stats: {}, weight: 0.5, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 10, value: 30,
    source: 'drop', sprite: SP, description: 'Congealed blood from a frost giant. Cold to the touch.',
  },
  ice_goblin_talisman: {
    id: 'ice_goblin_talisman', name: 'Ice Goblin Talisman',
    slot: 'Neck', type: 'jewelry', rarity: 'uncommon',
    stats: { svCold: 8, int: 2 }, weight: 0.3, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 65,
    source: 'drop', sprite: SP, recLevel: 12,
    description: 'A talisman worn by ice goblin shamans.',
  },

  // ═══════════════════════════════════════════════════════════════
  // PERMAFROST KEEP  (levels 20–55)
  // ═══════════════════════════════════════════════════════════════

  goblin_frosted_crown: {
    id: 'goblin_frosted_crown', name: 'Goblin Frosted Crown',
    slot: 'Head', type: 'armor', rarity: 'rare',
    stats: { ac: 12, int: 5, wis: 5, svCold: 10 }, weight: 3.5, classes: [...CASTER, ...HEALERS], races: 'ALL',
    lore: true, noDrop: false, stackable: false, value: 350,
    source: 'drop', sprite: SP, recLevel: 22,
    description: 'A crown carved from magical ice. Cold as death itself.',
  },
  crystal_chitin_breastplate: {
    id: 'crystal_chitin_breastplate', name: 'Crystal Chitin Breastplate',
    slot: 'Chest', type: 'armor', rarity: 'rare',
    stats: { ac: 25, sta: 5, str: 5, svCold: 8 }, weight: 14.0, classes: PLATE, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 500,
    source: 'drop', sprite: SP, recLevel: 30,
    description: 'Armor crafted from the crystalline chitin of Permafrost creatures.',
  },
  crystal_chitin_gauntlets: {
    id: 'crystal_chitin_gauntlets', name: 'Crystal Chitin Gauntlets',
    slot: 'Hands', type: 'armor', rarity: 'rare',
    stats: { ac: 12, sta: 3, str: 3 }, weight: 6.5, classes: PLATE, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 280,
    source: 'drop', sprite: SP, recLevel: 28,
    description: 'Gauntlets of crystalline chitin from Permafrost.',
  },
  permafrost_greatsword: {
    id: 'permafrost_greatsword', name: 'Permafrost Greatsword',
    slot: 'Primary', type: 'weapon', rarity: 'rare',
    stats: { damage: 16, delay: 36, svCold: 5 }, weight: 12.0, classes: ['Warrior', 'Paladin', 'ShadowKnight'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 400,
    source: 'drop', sprite: SP, recLevel: 25,
    description: 'A sword forged in the depths of Permafrost Keep.',
  },
  vox_fang_earring: {
    id: 'vox_fang_earring', name: 'Vox Fang Earring',
    slot: 'Ear1', type: 'jewelry', rarity: 'epic',
    stats: { svCold: 15, svMagic: 10, svFire: 10, svDisease: 10, svPoison: 10, hp: 25 },
    weight: 0.1, classes: ALL_CLASSES, races: 'ALL',
    lore: true, noDrop: true, stackable: false, value: 0,
    source: 'drop', sprite: SP, recLevel: 46,
    description: "A fang from Lady Vox herself, fashioned into an earring of great power.",
  },
  shining_metallic_robes: {
    id: 'shining_metallic_robes', name: 'Shining Metallic Robes',
    slot: 'Chest', type: 'armor', rarity: 'epic',
    stats: { ac: 18, int: 8, wis: 8, svMagic: 10, svCold: 10, hp: 40, mana: 40 },
    weight: 4.0, classes: CASTER, races: 'ALL',
    lore: true, noDrop: true, stackable: false, value: 0,
    source: 'drop', sprite: SP, recLevel: 46,
    description: 'Resplendent robes that gleam like moonlight. A treasured reward from Lady Vox.',
  },

  // ═══════════════════════════════════════════════════════════════
  // BEFALLEN  (levels 10–25)
  // ═══════════════════════════════════════════════════════════════

  zombie_skin_bracer: {
    id: 'zombie_skin_bracer', name: 'Zombie Skin Bracer',
    slot: 'Wrist1', type: 'armor', rarity: 'common',
    stats: { ac: 6, svDisease: 3 }, weight: 2.5, classes: [...LEATHER, ...HEALERS], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 22,
    source: 'drop', sprite: SP, recLevel: 10,
    description: 'A bracer wrapped in zombie skin. Faintly smells of decay.',
  },
  bone_finger_necklace: {
    id: 'bone_finger_necklace', name: 'Bone Finger Necklace',
    slot: 'Neck', type: 'jewelry', rarity: 'uncommon',
    stats: { hp: 20, svDisease: 5 }, weight: 0.3, classes: ALL_CLASSES, races: 'ALL',
    lore: true, noDrop: false, stackable: false, value: 85,
    source: 'drop', sprite: SP, recLevel: 12,
    description: 'A necklace of skeletal finger bones. Cold to the touch.',
  },
  ring_of_the_dead: {
    id: 'ring_of_the_dead', name: 'Ring of the Dead',
    slot: 'Fingers1', type: 'jewelry', rarity: 'rare',
    stats: { hp: 15, svDisease: 8, svPoison: 5 }, weight: 0.1, classes: ALL_CLASSES, races: 'ALL',
    lore: true, noDrop: false, stackable: false, value: 180,
    source: 'drop', sprite: SP, recLevel: 15,
    description: 'A ring that pulses with necrotic energy. Prized by those who battle undead.',
  },
  bracelet_of_woven_bone: {
    id: 'bracelet_of_woven_bone', name: 'Bracelet of Woven Bone',
    slot: 'Wrist1', type: 'jewelry', rarity: 'uncommon',
    stats: { ac: 5, wis: 3, svDisease: 5 }, weight: 0.5, classes: HEALERS, races: 'ALL',
    lore: true, noDrop: false, stackable: false, value: 120,
    source: 'drop', sprite: SP, recLevel: 14,
    description: 'A magical bracelet woven from undead bones.',
  },
  ghoul_meat: {
    id: 'ghoul_meat', name: 'Ghoul Meat',
    slot: null, type: 'quest', rarity: 'common',
    stats: {}, weight: 0.5, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 10, value: 5,
    source: 'drop', sprite: SP, description: 'Rotten flesh from a ghoul. Used in necromancer quests.',
  },
  mummy_wrappings: {
    id: 'mummy_wrappings', name: 'Mummy Wrappings',
    slot: null, type: 'tradeskill', rarity: 'common',
    stats: {}, weight: 0.3, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 20, value: 8,
    source: 'drop', sprite: SP, description: 'Ancient linen wrappings from a mummy. Tradeskill component.',
  },

  // ═══════════════════════════════════════════════════════════════
  // RUNNYEYE  (levels 10–20)
  // ═══════════════════════════════════════════════════════════════

  runnyeye_battle_axe: {
    id: 'runnyeye_battle_axe', name: 'Runnyeye Battle Axe',
    slot: 'Primary', type: 'weapon', rarity: 'uncommon',
    stats: { damage: 10, delay: 28 }, weight: 9.5, classes: MELEE, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 55,
    source: 'drop', sprite: SP, recLevel: 10,
    description: 'A goblin-forged battle axe from the depths of Runnyeye.',
  },
  goblin_champion_shield: {
    id: 'goblin_champion_shield', name: 'Goblin Champion Shield',
    slot: 'Secondary', type: 'shield', rarity: 'uncommon',
    stats: { ac: 11, str: 1 }, weight: 10.5, classes: [...PLATE, 'Shaman'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 60,
    source: 'drop', sprite: SP, recLevel: 12,
    description: 'The shield of a goblin champion. Better crafted than it looks.',
  },
  goblin_skin_leggings: {
    id: 'goblin_skin_leggings', name: 'Goblin Skin Leggings',
    slot: 'Legs', type: 'armor', rarity: 'common',
    stats: { ac: 8 }, weight: 4.5, classes: LEATHER, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 25,
    source: 'drop', sprite: SP, recLevel: 10,
    description: 'Leggings stitched from goblin hide.',
  },
  goblin_war_beads: {
    id: 'goblin_war_beads', name: 'Goblin War Beads',
    slot: 'Neck', type: 'jewelry', rarity: 'common',
    stats: { sta: 2 }, weight: 0.3, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 12,
    source: 'drop', sprite: SP, description: 'Beads worn by goblin warriors.',
  },
  eye_of_the_goblin_king: {
    id: 'eye_of_the_goblin_king', name: 'Eye of the Goblin King',
    slot: 'Fingers1', type: 'jewelry', rarity: 'rare',
    stats: { int: 4, svMagic: 6, hp: 15 }, weight: 0.1, classes: ALL_CLASSES, races: 'ALL',
    lore: true, noDrop: true, stackable: false, value: 0,
    source: 'drop', sprite: SP, recLevel: 18,
    description: 'The jeweled eye-ring of the Runnyeye Goblin King.',
  },

  // ═══════════════════════════════════════════════════════════════
  // UNREST  (levels 15–30)
  // ═══════════════════════════════════════════════════════════════

  ghoulish_visage: {
    id: 'ghoulish_visage', name: 'Ghoulish Visage',
    slot: 'Face', type: 'armor', rarity: 'rare',
    stats: { ac: 8, svDisease: 10, svPoison: 5 }, weight: 1.5, classes: [...CASTER, ...MELEE], races: 'ALL',
    lore: true, noDrop: true, stackable: false, value: 0,
    source: 'drop', sprite: SP, recLevel: 20,
    description: 'A terrifying visage taken from the Estate of Unrest. Radiates dark energy.',
  },
  zombie_skin_leggings: {
    id: 'zombie_skin_leggings', name: 'Zombie Skin Leggings',
    slot: 'Legs', type: 'armor', rarity: 'uncommon',
    stats: { ac: 10, svDisease: 3 }, weight: 5.5, classes: LEATHER, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 85,
    source: 'drop', sprite: SP, recLevel: 18,
    description: 'Leggings fashioned from zombie hide. Offers unusual protection.',
  },
  blade_of_carnage: {
    id: 'blade_of_carnage', name: 'Blade of Carnage',
    slot: 'Primary', type: 'weapon', rarity: 'rare',
    stats: { damage: 18, delay: 40, str: 3 }, weight: 13.0, classes: ['Warrior', 'ShadowKnight', 'Paladin'], races: 'ALL',
    lore: true, noDrop: true, stackable: false, value: 0,
    source: 'drop', sprite: SP, recLevel: 22,
    description: 'A massive two-handed blade steeped in the violence of Unrest.',
  },
  ring_of_unrest: {
    id: 'ring_of_unrest', name: 'Ring of Unrest',
    slot: 'Fingers1', type: 'jewelry', rarity: 'rare',
    stats: { hp: 25, svDisease: 8, svPoison: 8 }, weight: 0.1, classes: ALL_CLASSES, races: 'ALL',
    lore: true, noDrop: false, stackable: false, value: 250,
    source: 'drop', sprite: SP, recLevel: 20,
    description: 'A ring forged in the haunted estate. Protects against undead ailments.',
  },
  gargoyle_eye: {
    id: 'gargoyle_eye', name: 'Gargoyle Eye',
    slot: null, type: 'quest', rarity: 'uncommon',
    stats: {}, weight: 0.3, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 40,
    source: 'drop', sprite: SP, description: 'A stone eye plucked from a gargoyle. Used in various quests.',
  },
  festering_essence: {
    id: 'festering_essence', name: 'Festering Essence',
    slot: null, type: 'quest', rarity: 'uncommon',
    stats: {}, weight: 0.2, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 5, value: 25,
    source: 'drop', sprite: SP, description: 'A vial of essence from a festering hag.',
  },
  spook_the_ghastly_shroud: {
    id: 'spook_the_ghastly_shroud', name: "Spook's Tattered Shroud",
    slot: 'Back', type: 'armor', rarity: 'rare',
    stats: { ac: 8, svMagic: 8, int: 3, wis: 3 }, weight: 2.0, classes: [...CASTER, ...HEALERS], races: 'ALL',
    lore: true, noDrop: true, stackable: false, value: 0,
    source: 'drop', sprite: SP, recLevel: 22,
    description: "The shroud of Spook the Ghastly. Crackling with spectral energy.",
  },

  // ═══════════════════════════════════════════════════════════════
  // CASTLE MISTMOORE  (levels 20–40)
  // ═══════════════════════════════════════════════════════════════

  flowing_black_robe: {
    id: 'flowing_black_robe', name: 'Flowing Black Robe',
    slot: 'Chest', type: 'armor', rarity: 'rare',
    stats: { ac: 10, int: 10, svMagic: 5 }, weight: 2.0, classes: SILK, races: 'ALL',
    lore: true, noDrop: false, stackable: false, value: 500,
    source: 'drop', sprite: SP, recLevel: 25,
    description: 'A black robe that flows like shadow. The preferred garb of Mistmoore wizards.',
  },
  bone_clasped_girdle: {
    id: 'bone_clasped_girdle', name: 'Bone-Clasped Girdle',
    slot: 'Waist', type: 'jewelry', rarity: 'rare',
    stats: { hp: 30, wis: 5, svMagic: 8 }, weight: 1.5, classes: ALL_CLASSES, races: 'ALL',
    lore: true, noDrop: true, stackable: false, value: 0,
    source: 'drop', sprite: SP, recLevel: 25,
    description: 'An ornate girdle clasped with carved bone. Imbued with vampiric magic.',
  },
  mistmoore_guard_shield: {
    id: 'mistmoore_guard_shield', name: 'Mistmoore Guard Shield',
    slot: 'Secondary', type: 'shield', rarity: 'uncommon',
    stats: { ac: 18, hp: 15 }, weight: 13.0, classes: [...PLATE, 'Shaman', 'Bard'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 200,
    source: 'drop', sprite: SP, recLevel: 22,
    description: 'The shield of a Mistmoore castle guard.',
  },
  ancient_mistmoore_sword: {
    id: 'ancient_mistmoore_sword', name: 'Ancient Mistmoore Sword',
    slot: 'Primary', type: 'weapon', rarity: 'rare',
    stats: { damage: 15, delay: 32, hp: 10 }, weight: 8.0, classes: MELEE, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 300,
    source: 'drop', sprite: SP, recLevel: 25,
    description: 'A sword of ancient manufacture found in Castle Mistmoore.',
  },
  vampiric_bracer: {
    id: 'vampiric_bracer', name: 'Vampiric Bracer',
    slot: 'Wrist1', type: 'armor', rarity: 'rare',
    stats: { ac: 10, hp: 20, svDisease: 8 }, weight: 3.0, classes: [...MELEE, ...HEALERS], races: 'ALL',
    lore: true, noDrop: false, stackable: false, value: 280,
    source: 'drop', sprite: SP, recLevel: 24,
    description: 'A bracer drained of its former owner\'s life by a vampire.',
  },
  silver_chitin_hand_wraps: {
    id: 'silver_chitin_hand_wraps', name: 'Silver Chitin Hand Wraps',
    slot: 'Hands', type: 'armor', rarity: 'rare',
    stats: { ac: 8, hp: 20, dex: 5 }, weight: 2.0, classes: ['Monk'], races: 'ALL',
    lore: true, noDrop: false, stackable: false, value: 400,
    source: 'drop', sprite: SP, recLevel: 25,
    description: 'Hand wraps crafted from silver chitin. The preferred weapon of monks visiting Mistmoore.',
  },
  blood_soaked_tome: {
    id: 'blood_soaked_tome', name: 'Blood-Soaked Tome',
    slot: null, type: 'quest', rarity: 'uncommon',
    stats: {}, weight: 1.0, classes: ALL_CLASSES, races: 'ALL',
    lore: true, noDrop: false, stackable: false, value: 150,
    source: 'drop', sprite: SP,
    description: 'A tome soaked in blood. Contains dark arcane knowledge.',
  },
  vampire_bat_wing: {
    id: 'vampire_bat_wing', name: 'Vampire Bat Wing',
    slot: null, type: 'tradeskill', rarity: 'common',
    stats: {}, weight: 0.2, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 10, value: 20,
    source: 'drop', sprite: SP, description: 'A leathery wing from a vampire bat.',
  },

  // ═══════════════════════════════════════════════════════════════
  // NEKTULOS FOREST  (levels 10–25)
  // ═══════════════════════════════════════════════════════════════

  spider_silk: {
    id: 'spider_silk', name: 'Spider Silk',
    slot: null, type: 'tradeskill', rarity: 'common',
    stats: {}, weight: 0.1, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 20, value: 5,
    source: 'drop', sprite: SP, description: 'Silk from a giant spider. Used in tailoring.',
  },
  dark_elf_imbued_sword: {
    id: 'dark_elf_imbued_sword', name: 'Dark Elf Imbued Sword',
    slot: 'Primary', type: 'weapon', rarity: 'uncommon',
    stats: { damage: 12, delay: 30, hp: 10 }, weight: 7.5, classes: MELEE, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 180,
    source: 'drop', sprite: SP, recLevel: 14,
    description: 'A sword imbued with dark elven shadow magic.',
  },
  darkwood_longbow: {
    id: 'darkwood_longbow', name: 'Darkwood Longbow',
    slot: 'Range', type: 'weapon', rarity: 'uncommon',
    stats: { damage: 10, delay: 30 }, weight: 3.5, classes: ['Ranger', 'Rogue', 'Warrior', 'Bard'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 120,
    source: 'drop', sprite: SP, recLevel: 14,
    description: 'A longbow carved from the dark trees of Nektulos.',
  },
  dark_elf_shadow_boots: {
    id: 'dark_elf_shadow_boots', name: 'Dark Elf Shadow Boots',
    slot: 'Feet', type: 'armor', rarity: 'uncommon',
    stats: { ac: 8, agi: 5 }, weight: 2.5, classes: LEATHER, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 90,
    source: 'drop', sprite: SP, recLevel: 12,
    description: 'Boots crafted by dark elves. Near-silent when walking.',
  },
  kirak_vil_fang: {
    id: 'kirak_vil_fang', name: "Kirak Vil's Fang",
    slot: null, type: 'quest', rarity: 'rare',
    stats: {}, weight: 0.2, classes: ALL_CLASSES, races: 'ALL',
    lore: true, noDrop: true, stackable: false, value: 0,
    source: 'drop', sprite: SP, description: 'The fang of the named dark elf Kirak Vil.',
  },

  // ═══════════════════════════════════════════════════════════════
  // LAVASTORM MOUNTAINS / NAJENA  (levels 15–35)
  // ═══════════════════════════════════════════════════════════════

  najena_robe: {
    id: 'najena_robe', name: "Najena's Robe",
    slot: 'Chest', type: 'armor', rarity: 'rare',
    stats: { ac: 8, int: 8, svFire: 10 }, weight: 2.5, classes: SILK, races: 'ALL',
    lore: true, noDrop: false, stackable: false, value: 400,
    source: 'drop', sprite: SP, recLevel: 22,
    description: "Najena's personal robe, imbued with fire magic.",
  },
  magma_bracer: {
    id: 'magma_bracer', name: 'Magma Bracer',
    slot: 'Wrist1', type: 'armor', rarity: 'uncommon',
    stats: { ac: 10, svFire: 8 }, weight: 4.0, classes: [...PLATE, 'Shaman'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 150,
    source: 'drop', sprite: SP, recLevel: 18,
    description: 'A bracer forged in the lava flows of Lavastorm.',
  },
  fire_emerald_ring: {
    id: 'fire_emerald_ring', name: 'Fire Emerald Ring',
    slot: 'Fingers1', type: 'jewelry', rarity: 'uncommon',
    stats: { int: 3, svFire: 8 }, weight: 0.1, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 180,
    source: 'drop', sprite: SP, recLevel: 18,
    description: 'A ring set with a fire emerald. Provides protection from flames.',
  },
  golem_eye: {
    id: 'golem_eye', name: 'Golem Eye',
    slot: null, type: 'quest', rarity: 'uncommon',
    stats: {}, weight: 0.4, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 55,
    source: 'drop', sprite: SP, description: "A magical eye plucked from Najena's golem.",
  },
  lava_goblin_skin: {
    id: 'lava_goblin_skin', name: 'Lava Goblin Skin',
    slot: null, type: 'tradeskill', rarity: 'common',
    stats: {}, weight: 0.5, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 20, value: 12,
    source: 'drop', sprite: SP, description: 'Heat-resistant skin from a lava goblin.',
  },
  smoldering_brand: {
    id: 'smoldering_brand', name: 'Smoldering Brand',
    slot: 'Primary', type: 'weapon', rarity: 'rare',
    stats: { damage: 16, delay: 40, svFire: 10 }, weight: 12.0, classes: ['Warrior', 'Paladin', 'ShadowKnight'], races: 'ALL',
    lore: true, noDrop: false, stackable: false, value: 450,
    source: 'drop', sprite: SP, recLevel: 25,
    description: 'A two-handed weapon that smolders with inner fire.',
  },
  ratman_bone_ring: {
    id: 'ratman_bone_ring', name: 'Ratman Bone Ring',
    slot: 'Fingers1', type: 'jewelry', rarity: 'common',
    stats: { dex: 3 }, weight: 0.1, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 35,
    source: 'drop', sprite: SP, recLevel: 14,
    description: 'A ring fashioned from the bones of Najena\'s ratmen.',
  },

  // ═══════════════════════════════════════════════════════════════
  // KARANA ZONES  (levels 10–35)
  // ═══════════════════════════════════════════════════════════════

  hill_giant_toe: {
    id: 'hill_giant_toe', name: 'Hill Giant Toe',
    slot: null, type: 'quest', rarity: 'uncommon',
    stats: {}, weight: 1.5, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 5, value: 100,
    source: 'drop', sprite: SP, description: 'A massive toe from a hill giant. Used in quests.',
  },
  cyclops_eye: {
    id: 'cyclops_eye', name: 'Cyclops Eye',
    slot: null, type: 'quest', rarity: 'uncommon',
    stats: {}, weight: 1.0, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 80,
    source: 'drop', sprite: SP, description: "The single eye of a cyclops. Used in quests and tradeskills.",
  },
  griffon_feather: {
    id: 'griffon_feather', name: 'Griffon Feather',
    slot: null, type: 'tradeskill', rarity: 'uncommon',
    stats: {}, weight: 0.2, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 20, value: 30,
    source: 'drop', sprite: SP, description: 'A majestic feather from a griffon.',
  },
  fine_antique_sword: {
    id: 'fine_antique_sword', name: 'Fine Antique Sword',
    slot: 'Primary', type: 'weapon', rarity: 'uncommon',
    stats: { damage: 11, delay: 32, str: 5 }, weight: 8.5, classes: MELEE, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 200,
    source: 'drop', sprite: SP, recLevel: 20,
    description: 'An antique sword of excellent craftsmanship, found in the Karana plains.',
  },
  karana_wind_bracer: {
    id: 'karana_wind_bracer', name: 'Karana Wind Bracer',
    slot: 'Wrist1', type: 'armor', rarity: 'uncommon',
    stats: { ac: 8, agi: 3, svMagic: 5 }, weight: 2.5, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 110,
    source: 'drop', sprite: SP, recLevel: 18,
    description: 'A bracer said to be touched by the winds of the Karana plains.',
  },
  centaur_hide_boots: {
    id: 'centaur_hide_boots', name: 'Centaur Hide Boots',
    slot: 'Feet', type: 'armor', rarity: 'uncommon',
    stats: { ac: 9, agi: 3, str: 2 }, weight: 4.0, classes: [...MELEE, ...HEALERS], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 130,
    source: 'drop', sprite: SP, recLevel: 20,
    description: 'Boots crafted from the hide of a centaur warrior.',
  },
  rathe_giant_toenail: {
    id: 'rathe_giant_toenail', name: 'Rathe Giant Toenail',
    slot: null, type: 'quest', rarity: 'uncommon',
    stats: {}, weight: 2.0, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 120,
    source: 'drop', sprite: SP, description: "A toenail from a Rathe Mountain giant. Enormous.",
  },

  // ═══════════════════════════════════════════════════════════════
  // DESERT OF RO / OASIS OF MARR  (levels 10–30)
  // ═══════════════════════════════════════════════════════════════

  sand_giant_molar: {
    id: 'sand_giant_molar', name: 'Sand Giant Molar',
    slot: null, type: 'quest', rarity: 'uncommon',
    stats: {}, weight: 2.0, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 5, value: 70,
    source: 'drop', sprite: SP, description: "A molar from a sand giant. Used in quests.",
  },
  desert_wind_bracer: {
    id: 'desert_wind_bracer', name: 'Desert Wind Bracer',
    slot: 'Wrist1', type: 'armor', rarity: 'uncommon',
    stats: { ac: 8, svFire: 5, agi: 2 }, weight: 2.5, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 100,
    source: 'drop', sprite: SP, recLevel: 16,
    description: 'A bracer crafted in the Desert of Ro.',
  },
  alligator_skin_boots: {
    id: 'alligator_skin_boots', name: 'Alligator Skin Boots',
    slot: 'Feet', type: 'armor', rarity: 'uncommon',
    stats: { ac: 7, svPoison: 3 }, weight: 3.5, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 75,
    source: 'drop', sprite: SP, recLevel: 12,
    description: 'Boots made from thick alligator hide.',
  },
  will_o_wisp_essence: {
    id: 'will_o_wisp_essence', name: "Will-o'-Wisp Essence",
    slot: null, type: 'tradeskill', rarity: 'uncommon',
    stats: {}, weight: 0.1, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 10, value: 50,
    source: 'drop', sprite: SP, description: 'Bottled essence from a will-o-wisp. Glows faintly.',
  },
  croc_skin_helm: {
    id: 'croc_skin_helm', name: 'Croc Skin Helm',
    slot: 'Head', type: 'armor', rarity: 'common',
    stats: { ac: 8, svPoison: 3 }, weight: 5.0, classes: [...CHAIN, ...LEATHER], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 55,
    source: 'drop', sprite: SP, recLevel: 12,
    description: 'A helm fashioned from crocodile skin.',
  },

  // ═══════════════════════════════════════════════════════════════
  // SPLITPAW LAIR  (levels 10–25)
  // ═══════════════════════════════════════════════════════════════

  splitpaw_cloak: {
    id: 'splitpaw_cloak', name: 'Splitpaw Cloak',
    slot: 'Back', type: 'armor', rarity: 'uncommon',
    stats: { ac: 10, svPoison: 5, agi: 2 }, weight: 3.0, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 130,
    source: 'drop', sprite: SP, recLevel: 15,
    description: 'A cloak worn by Splitpaw gnoll commanders.',
  },
  gnoll_scout_ring: {
    id: 'gnoll_scout_ring', name: 'Gnoll Scout Ring',
    slot: 'Fingers1', type: 'jewelry', rarity: 'uncommon',
    stats: { dex: 3, agi: 3 }, weight: 0.1, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 80,
    source: 'drop', sprite: SP, recLevel: 12,
    description: 'A ring worn by Splitpaw gnoll scouts.',
  },
  splitpaw_gnoll_totem: {
    id: 'splitpaw_gnoll_totem', name: 'Splitpaw Gnoll Totem',
    slot: 'Secondary', type: 'weapon', rarity: 'uncommon',
    stats: { damage: 5, delay: 22, svDisease: 5 }, weight: 3.0, classes: [...HEALERS, 'Necromancer'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 90,
    source: 'drop', sprite: SP, recLevel: 14,
    description: "A carved totem from Splitpaw. Imbued with gnollish shamanic power.",
  },

  // ═══════════════════════════════════════════════════════════════
  // STEAMFONT MOUNTAINS / AK'ANON  (levels 10–25)
  // ═══════════════════════════════════════════════════════════════

  minotaur_hero_wristguard: {
    id: 'minotaur_hero_wristguard', name: "Minotaur Hero's Wristguard",
    slot: 'Wrist1', type: 'armor', rarity: 'rare',
    stats: { ac: 12, str: 5, sta: 5 }, weight: 5.5, classes: [...PLATE, 'Bard', 'Shaman'], races: 'ALL',
    lore: true, noDrop: true, stackable: false, value: 0,
    source: 'drop', sprite: SP, recLevel: 20,
    description: 'A wristguard worn by the mightiest minotaur heroes of Steamfont.',
  },
  minotaur_horn: {
    id: 'minotaur_horn', name: 'Minotaur Horn',
    slot: null, type: 'tradeskill', rarity: 'uncommon',
    stats: {}, weight: 2.0, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 45,
    source: 'drop', sprite: SP, description: "A horn from a Steamfont minotaur. Prized by craftsmen.",
  },
  clockwork_cog: {
    id: 'clockwork_cog', name: 'Clockwork Cog',
    slot: null, type: 'tradeskill', rarity: 'common',
    stats: {}, weight: 0.5, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 20, value: 10,
    source: 'drop', sprite: SP, description: 'A gear from a gnomish clockwork construct.',
  },
  gnomish_tinkered_shield: {
    id: 'gnomish_tinkered_shield', name: 'Gnomish Tinkered Shield',
    slot: 'Secondary', type: 'shield', rarity: 'uncommon',
    stats: { ac: 12, svMagic: 5 }, weight: 8.5, classes: [...PLATE, 'Shaman'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 120,
    source: 'drop', sprite: SP, recLevel: 14,
    description: "A shield constructed by gnomish tinkerers. Packed with gadgetry.",
  },
  minotaur_elder_greataxe: {
    id: 'minotaur_elder_greataxe', name: 'Minotaur Elder Greataxe',
    slot: 'Primary', type: 'weapon', rarity: 'rare',
    stats: { damage: 18, delay: 40, str: 5 }, weight: 16.0, classes: ['Warrior', 'ShadowKnight', 'Paladin'], races: 'ALL',
    lore: true, noDrop: false, stackable: false, value: 350,
    source: 'drop', sprite: SP, recLevel: 22,
    description: "The greataxe of a Steamfont minotaur elder. Massive and devastating.",
  },

  // ═══════════════════════════════════════════════════════════════
  // DAGNOR'S CAULDRON / LESSER FAYDARK  (levels 15–30)
  // ═══════════════════════════════════════════════════════════════

  fairy_ring: {
    id: 'fairy_ring', name: 'Fairy Ring',
    slot: 'Fingers1', type: 'jewelry', rarity: 'uncommon',
    stats: { cha: 3, int: 3, wis: 3 }, weight: 0.1, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 90,
    source: 'drop', sprite: SP, recLevel: 14,
    description: 'A delicate ring woven by fairies. Shimmers with magical energy.',
  },
  cauldron_leech_mandible: {
    id: 'cauldron_leech_mandible', name: 'Cauldron Leech Mandible',
    slot: null, type: 'tradeskill', rarity: 'common',
    stats: {}, weight: 0.3, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 10, value: 15,
    source: 'drop', sprite: SP, description: "A mandible from a Dagnor's Cauldron leech.",
  },
  water_sprite_girdle: {
    id: 'water_sprite_girdle', name: 'Water Sprite Girdle',
    slot: 'Waist', type: 'jewelry', rarity: 'uncommon',
    stats: { hp: 20, svMagic: 8 }, weight: 0.5, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 150,
    source: 'drop', sprite: SP, recLevel: 16,
    description: 'A girdle blessed by the water sprites of Dagnor\'s Cauldron.',
  },
  pained_soul_shroud: {
    id: 'pained_soul_shroud', name: 'Pained Soul Shroud',
    slot: 'Back', type: 'armor', rarity: 'uncommon',
    stats: { ac: 9, svMagic: 6, int: 4 }, weight: 1.5, classes: [...CASTER, 'Necromancer'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 145,
    source: 'drop', sprite: SP, recLevel: 16,
    description: 'A shroud woven from the spiritual remnants of pained souls.',
  },

  // ═══════════════════════════════════════════════════════════════
  // UPPER / LOWER GUK  (levels 25–45)
  // ═══════════════════════════════════════════════════════════════

  ghoulbane: {
    id: 'ghoulbane', name: 'Ghoulbane',
    slot: 'Primary', type: 'weapon', rarity: 'epic',
    stats: { damage: 14, delay: 36, hp: 15, svDisease: 15, svPoison: 15 },
    weight: 8.0, classes: ['Paladin', 'Warrior', 'ShadowKnight'], races: 'ALL',
    lore: true, noDrop: true, stackable: false, value: 0,
    source: 'drop', sprite: SP, recLevel: 30,
    description: 'The legendary sword Ghoulbane. Devastating against undead and evil creatures. Assembled from multiple quest pieces.',
  },
  froglok_forager_tunic: {
    id: 'froglok_forager_tunic', name: 'Froglok Forager Tunic',
    slot: 'Chest', type: 'armor', rarity: 'uncommon',
    stats: { ac: 16, agi: 3 }, weight: 6.0, classes: LEATHER, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 180,
    source: 'drop', sprite: SP, recLevel: 25,
    description: 'A tunic worn by froglok foragers in the depths of Guk.',
  },
  froglok_scale_cap: {
    id: 'froglok_scale_cap', name: 'Froglok Scale Cap',
    slot: 'Head', type: 'armor', rarity: 'uncommon',
    stats: { ac: 12, agi: 2 }, weight: 4.5, classes: LEATHER, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 140,
    source: 'drop', sprite: SP, recLevel: 24,
    description: 'A cap crafted from froglok scales.',
  },
  froglok_warriors_shield: {
    id: 'froglok_warriors_shield', name: "Froglok Warrior's Shield",
    slot: 'Secondary', type: 'shield', rarity: 'rare',
    stats: { ac: 20, hp: 20 }, weight: 14.0, classes: [...PLATE, 'Shaman'], races: 'ALL',
    lore: true, noDrop: false, stackable: false, value: 350,
    source: 'drop', sprite: SP, recLevel: 28,
    description: 'A powerful shield carried by elite froglok warriors of Guk.',
  },
  froglok_bonecaster_robe: {
    id: 'froglok_bonecaster_robe', name: 'Froglok Bonecaster Robe',
    slot: 'Chest', type: 'armor', rarity: 'rare',
    stats: { ac: 8, int: 8, mana: 25 }, weight: 2.5, classes: SILK, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 400,
    source: 'drop', sprite: SP, recLevel: 28,
    description: 'The robe of a froglok bonecaster. Crackling with necromantic power.',
  },
  stein_of_moggok: {
    id: 'stein_of_moggok', name: 'Stein of Moggok',
    slot: null, type: 'quest', rarity: 'rare',
    stats: {}, weight: 1.5, classes: ALL_CLASSES, races: 'ALL',
    lore: true, noDrop: true, stackable: false, value: 0,
    source: 'drop', sprite: SP, description: 'The Stein of Moggok. A legendary quest item from the depths of Lower Guk.',
  },
  ancient_froglok_sword: {
    id: 'ancient_froglok_sword', name: 'Ancient Froglok Sword',
    slot: 'Primary', type: 'weapon', rarity: 'rare',
    stats: { damage: 16, delay: 34, hp: 20 }, weight: 9.0, classes: MELEE, races: 'ALL',
    lore: true, noDrop: false, stackable: false, value: 450,
    source: 'drop', sprite: SP, recLevel: 30,
    description: 'An ancient sword from the deepest parts of Guk.',
  },
  guk_royal_seal: {
    id: 'guk_royal_seal', name: 'Guk Royal Seal',
    slot: null, type: 'quest', rarity: 'rare',
    stats: {}, weight: 0.5, classes: ALL_CLASSES, races: 'ALL',
    lore: true, noDrop: true, stackable: false, value: 0,
    source: 'drop', sprite: SP, description: 'The royal seal of the froglok rulers of Guk.',
  },

  // ═══════════════════════════════════════════════════════════════
  // GORGE OF KING XORBB  (levels 10–20)
  // ═══════════════════════════════════════════════════════════════

  bixie_stinger: {
    id: 'bixie_stinger', name: 'Bixie Stinger',
    slot: 'Primary', type: 'weapon', rarity: 'uncommon',
    stats: { damage: 8, delay: 20, svPoison: 5 }, weight: 3.0, classes: [...MELEE, 'Necromancer'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 75,
    source: 'drop', sprite: SP, recLevel: 10,
    description: 'A razor-sharp bixie stinger. Coated with natural venom.',
  },
  bixie_chitin_bracer: {
    id: 'bixie_chitin_bracer', name: 'Bixie Chitin Bracer',
    slot: 'Wrist1', type: 'armor', rarity: 'uncommon',
    stats: { ac: 6, svPoison: 3 }, weight: 2.0, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 50,
    source: 'drop', sprite: SP, recLevel: 10,
    description: 'A bracer made from bixie chitin.',
  },
  royal_bixie_stiletto: {
    id: 'royal_bixie_stiletto', name: 'Royal Bixie Stiletto',
    slot: 'Primary', type: 'weapon', rarity: 'rare',
    stats: { damage: 10, delay: 22, dex: 5, svPoison: 8 }, weight: 2.5, classes: ['Rogue', 'Bard', 'Ranger'], races: 'ALL',
    lore: true, noDrop: true, stackable: false, value: 0,
    source: 'drop', sprite: SP, recLevel: 18,
    description: "A stiletto carried by the queen's drone. Wickedly sharp.",
  },
  bixie_wing_powder: {
    id: 'bixie_wing_powder', name: 'Bixie Wing Powder',
    slot: null, type: 'tradeskill', rarity: 'common',
    stats: {}, weight: 0.1, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 20, value: 15,
    source: 'drop', sprite: SP, description: 'Ground powder from bixie wings. Used in alchemy.',
  },

  // ═══════════════════════════════════════════════════════════════
  // LAKE RATHETEAR  (levels 15–30)
  // ═══════════════════════════════════════════════════════════════

  nymph_hair: {
    id: 'nymph_hair', name: 'Nymph Hair',
    slot: null, type: 'tradeskill', rarity: 'uncommon',
    stats: {}, weight: 0.1, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 10, value: 35,
    source: 'drop', sprite: SP, description: "Silken hair from a lake nymph. Used in tailoring.",
  },
  elemental_staff: {
    id: 'elemental_staff', name: 'Elemental Staff',
    slot: 'Primary', type: 'weapon', rarity: 'rare',
    stats: { damage: 14, delay: 36, int: 5, svMagic: 5 }, weight: 6.0, classes: [...CASTER, 'Shaman', 'Druid'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 300,
    source: 'drop', sprite: SP, recLevel: 22,
    description: 'A staff crackling with elemental power, drawn from Lake Rathetear.',
  },
  lake_nymph_girdle: {
    id: 'lake_nymph_girdle', name: 'Lake Nymph Girdle',
    slot: 'Waist', type: 'jewelry', rarity: 'uncommon',
    stats: { hp: 20, mana: 20, svMagic: 5 }, weight: 0.5, classes: [...CASTER, ...HEALERS], races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 200,
    source: 'drop', sprite: SP, recLevel: 20,
    description: 'A girdle woven from the hair of a lake nymph.',
  },
  water_elemental_gem: {
    id: 'water_elemental_gem', name: 'Water Elemental Gem',
    slot: null, type: 'tradeskill', rarity: 'uncommon',
    stats: {}, weight: 0.2, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 60,
    source: 'drop', sprite: SP, description: 'A gem crystallized from a water elemental.',
  },

  // ═══════════════════════════════════════════════════════════════
  // CAZIC-THULE  (via Lavastorm connects, levels 30–45)
  // ═══════════════════════════════════════════════════════════════

  jade_reaver: {
    id: 'jade_reaver', name: 'Jade Reaver',
    slot: 'Primary', type: 'weapon', rarity: 'epic',
    stats: { damage: 14, delay: 36, str: 5, sta: 5, hp: 30 }, weight: 8.0, classes: MELEE, races: 'ALL',
    lore: true, noDrop: true, stackable: false, value: 0,
    source: 'drop', sprite: SP, recLevel: 35,
    description: 'The legendary Jade Reaver from Cazic-Thule. One of the most coveted weapons in all of Norrath.',
  },
  mask_of_terror: {
    id: 'mask_of_terror', name: 'Mask of Terror',
    slot: 'Face', type: 'armor', rarity: 'epic',
    stats: { ac: 12, str: 7, sta: 7, hp: 35 }, weight: 2.0, classes: [...MELEE, 'Shaman'], races: 'ALL',
    lore: true, noDrop: true, stackable: false, value: 0,
    source: 'drop', sprite: SP, recLevel: 35,
    description: 'A terrifying mask from the halls of Cazic-Thule. Imbued with primal fear.',
  },
  cazic_thule_idol: {
    id: 'cazic_thule_idol', name: 'Cazic-Thule Idol',
    slot: null, type: 'quest', rarity: 'rare',
    stats: {}, weight: 2.0, classes: ALL_CLASSES, races: 'ALL',
    lore: true, noDrop: true, stackable: false, value: 0,
    source: 'drop', sprite: SP, description: 'An idol of the god Cazic-Thule. Used in dark rituals.',
  },

  // ═══════════════════════════════════════════════════════════════
  // MISCELLANEOUS / VENDOR-QUALITY DROPS
  // ═══════════════════════════════════════════════════════════════

  bronze_axe: {
    id: 'bronze_axe', name: 'Bronze Axe',
    slot: 'Primary', type: 'weapon', rarity: 'common',
    stats: { damage: 7, delay: 26 }, weight: 8.0, classes: MELEE, races: 'ALL',
    lore: false, noDrop: false, stackable: false, value: 18,
    source: 'drop', sprite: SP, recLevel: 4,
    description: 'A simple bronze axe.',
  },
  ruined_wolf_pelt: {
    id: 'ruined_wolf_pelt', name: 'Ruined Wolf Pelt',
    slot: null, type: 'tradeskill', rarity: 'common',
    stats: {}, weight: 0.5, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 20, value: 3,
    source: 'drop', sprite: SP, description: 'A damaged wolf pelt. Almost worthless.',
  },
  wolf_pelt: {
    id: 'wolf_pelt', name: 'Wolf Pelt',
    slot: null, type: 'tradeskill', rarity: 'common',
    stats: {}, weight: 0.8, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 20, value: 8,
    source: 'drop', sprite: SP, description: 'A good wolf pelt. Used in tailoring.',
  },
  bear_claw: {
    id: 'bear_claw', name: 'Bear Claw',
    slot: null, type: 'tradeskill', rarity: 'common',
    stats: {}, weight: 0.5, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 10, value: 5,
    source: 'drop', sprite: SP, description: 'A curved bear claw.',
  },
  snake_fang: {
    id: 'snake_fang', name: 'Snake Fang',
    slot: null, type: 'tradeskill', rarity: 'common',
    stats: {}, weight: 0.1, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 20, value: 2,
    source: 'drop', sprite: SP, description: 'A hollow snake fang. Tradeskill component.',
  },
  croc_hide: {
    id: 'croc_hide', name: 'Crocodile Hide',
    slot: null, type: 'tradeskill', rarity: 'common',
    stats: {}, weight: 1.0, classes: ALL_CLASSES, races: 'ALL',
    lore: false, noDrop: false, stackable: true, stackSize: 10, value: 10,
    source: 'drop', sprite: SP, description: 'A thick, tough crocodile hide. Used in tailoring.',
  },
  oasis_croc_hide_boots: {
    id: 'oasis_croc_hide_boots', name: 'Oasis Croc-Hide Boots',
    slot: 'feet', type: 'armor', rarity: 'uncommon',
    stats: { ac: 7, str: 2, sta: 1 }, weight: 2.5, classes: ['WAR', 'MNK', 'ROG', 'SHD', 'BRD'], races: 'ALL',
    lore: false, noDrop: false, stackable: false, stackSize: 1, value: 120,
    source: 'drop', sprite: SP, description: 'Boots crafted from Oasis crocodile hide. Surprisingly supple.',
  },
};
