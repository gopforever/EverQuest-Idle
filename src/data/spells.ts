import type { Spell } from '../types';

export const SPELLS: Record<string, Spell> = {

  // ══════════════════════════════════════════════════════════════════
  // CLERIC SPELLS
  // ══════════════════════════════════════════════════════════════════

  minor_healing: {
    id: 'minor_healing', name: 'Minor Healing', class: 'Cleric', level: 1,
    school: 'divine', effect: 'heal', manaCost: 10, castTime: 2, recastTime: 0,
    duration: 0, value: 18, description: 'Heals your target for 18 hit points.',
  },
  courage: {
    id: 'courage', name: 'Courage', class: 'Cleric', level: 1,
    school: 'divine', effect: 'buff', manaCost: 15, castTime: 2, recastTime: 0,
    duration: 360, value: 12, description: 'Increases target\'s AC and ATK by 12.',
  },
  light_healing: {
    id: 'light_healing', name: 'Light Healing', class: 'Cleric', level: 1,
    school: 'divine', effect: 'heal', manaCost: 30, castTime: 3, recastTime: 0,
    duration: 0, value: 40, description: 'Heals your target for 40 hit points.',
  },
  endure_cold_clr: {
    id: 'endure_cold_clr', name: 'Endure Cold', class: 'Cleric', level: 5,
    school: 'divine', effect: 'buff', manaCost: 20, castTime: 3, recastTime: 0,
    duration: 720, value: 15, description: 'Increases cold resistance by 15.',
    targetSelf: false,
  },
  cure_poison_clr: {
    id: 'cure_poison_clr', name: 'Cure Poison', class: 'Cleric', level: 5,
    school: 'divine', effect: 'buff', manaCost: 30, castTime: 3, recastTime: 0,
    duration: 0, value: 1, description: 'Removes poison effects from target.',
  },
  healing: {
    id: 'healing', name: 'Healing', class: 'Cleric', level: 9,
    school: 'divine', effect: 'heal', manaCost: 65, castTime: 3, recastTime: 0,
    duration: 0, value: 96, description: 'Heals your target for 96 hit points.',
  },
  endure_fire_clr: {
    id: 'endure_fire_clr', name: 'Endure Fire', class: 'Cleric', level: 9,
    school: 'divine', effect: 'buff', manaCost: 20, castTime: 3, recastTime: 0,
    duration: 720, value: 15, description: 'Increases fire resistance by 15.',
  },
  skin_like_rock: {
    id: 'skin_like_rock', name: 'Skin like Rock', class: 'Cleric', level: 14,
    school: 'divine', effect: 'buff', manaCost: 60, castTime: 4, recastTime: 0,
    duration: 720, value: 24, description: 'Increases target\'s AC by 24.',
  },
  greater_healing: {
    id: 'greater_healing', name: 'Greater Healing', class: 'Cleric', level: 19,
    school: 'divine', effect: 'heal', manaCost: 150, castTime: 3, recastTime: 0,
    duration: 0, value: 199, description: 'Heals your target for 199 hit points.',
  },
  counteract_disease: {
    id: 'counteract_disease', name: 'Counteract Disease', class: 'Cleric', level: 24,
    school: 'divine', effect: 'buff', manaCost: 60, castTime: 3, recastTime: 0,
    duration: 0, value: 1, description: 'Removes disease effects from target.',
  },
  superior_healing: {
    id: 'superior_healing', name: 'Superior Healing', class: 'Cleric', level: 29,
    school: 'divine', effect: 'heal', manaCost: 250, castTime: 3, recastTime: 0,
    duration: 0, value: 399, description: 'Heals your target for 399 hit points.',
  },
  wave_of_healing: {
    id: 'wave_of_healing', name: 'Wave of Healing', class: 'Cleric', level: 29,
    school: 'divine', effect: 'heal', manaCost: 200, castTime: 4, recastTime: 0,
    duration: 0, value: 175, description: 'Heals all group members for 175 hit points.',
    targetGroup: true,
  },
  complete_heal: {
    id: 'complete_heal', name: 'Complete Heal', class: 'Cleric', level: 34,
    school: 'divine', effect: 'heal', manaCost: 400, castTime: 10, recastTime: 0,
    duration: 0, value: 9999, description: 'Completely heals a single target. 10-second cast.',
  },
  celestial_healing: {
    id: 'celestial_healing', name: 'Celestial Healing', class: 'Cleric', level: 39,
    school: 'divine', effect: 'hot', manaCost: 165, castTime: 3, recastTime: 0,
    duration: 30, value: 30, description: 'Heals target for 30 HP per tick for 30 ticks.',
  },
  word_of_healing: {
    id: 'word_of_healing', name: 'Word of Healing', class: 'Cleric', level: 39,
    school: 'divine', effect: 'heal', manaCost: 280, castTime: 4, recastTime: 0,
    duration: 0, value: 249, description: 'Heals all group members for 249 hit points.',
    targetGroup: true,
  },
  divine_aura: {
    id: 'divine_aura', name: 'Divine Aura', class: 'Cleric', level: 44,
    school: 'divine', effect: 'buff', manaCost: 50, castTime: 0, recastTime: 0,
    duration: 3, value: 999, description: 'Makes caster invulnerable for 3 ticks.',
    targetSelf: true,
  },
  resurrection: {
    id: 'resurrection', name: 'Resurrection', class: 'Cleric', level: 44,
    school: 'divine', effect: 'buff', manaCost: 200, castTime: 10, recastTime: 0,
    duration: 0, value: 70, description: 'Resurrects a dead ally, restoring 70% XP.',
  },
  word_of_vivification: {
    id: 'word_of_vivification', name: 'Word of Vivification', class: 'Cleric', level: 55,
    school: 'divine', effect: 'heal', manaCost: 400, castTime: 4, recastTime: 0,
    duration: 0, value: 375, description: 'Heals all group members for 375 hit points.',
    targetGroup: true,
  },
  glorys_call: {
    id: 'glorys_call', name: "Glory's Call", class: 'Cleric', level: 60,
    school: 'divine', effect: 'heal', manaCost: 600, castTime: 3, recastTime: 0,
    duration: 0, value: 600, description: 'Heals all group members for 600 hit points.',
    targetGroup: true,
  },

  // ══════════════════════════════════════════════════════════════════
  // DRUID SPELLS
  // ══════════════════════════════════════════════════════════════════

  minor_healing_dru: {
    id: 'minor_healing_dru', name: 'Minor Healing', class: 'Druid', level: 1,
    school: 'divine', effect: 'heal', manaCost: 10, castTime: 2, recastTime: 0,
    duration: 0, value: 18, description: 'Heals your target for 18 hit points.',
  },
  skin_like_wood: {
    id: 'skin_like_wood', name: 'Skin like Wood', class: 'Druid', level: 1,
    school: 'divine', effect: 'buff', manaCost: 20, castTime: 3, recastTime: 0,
    duration: 720, value: 10, description: 'Increases AC by 10.',
  },
  snare: {
    id: 'snare', name: 'Snare', class: 'Druid', level: 5,
    school: 'magic', effect: 'snare', manaCost: 30, castTime: 2, recastTime: 0,
    duration: 60, value: 25, description: 'Reduces target movement speed by 25%.',
    resistable: true,
  },
  endure_cold_dru: {
    id: 'endure_cold_dru', name: 'Endure Cold', class: 'Druid', level: 5,
    school: 'divine', effect: 'buff', manaCost: 20, castTime: 3, recastTime: 0,
    duration: 720, value: 15, description: 'Increases cold resistance by 15.',
  },
  healing_dru: {
    id: 'healing_dru', name: 'Healing', class: 'Druid', level: 9,
    school: 'divine', effect: 'heal', manaCost: 65, castTime: 3, recastTime: 0,
    duration: 0, value: 96, description: 'Heals your target for 96 hit points.',
  },
  camouflage: {
    id: 'camouflage', name: 'Camouflage', class: 'Druid', level: 9,
    school: 'magic', effect: 'buff', manaCost: 40, castTime: 3, recastTime: 0,
    duration: 360, value: 1, description: 'Makes target invisible to most animals.',
  },
  greater_healing_dru: {
    id: 'greater_healing_dru', name: 'Greater Healing', class: 'Druid', level: 19,
    school: 'divine', effect: 'heal', manaCost: 150, castTime: 3, recastTime: 0,
    duration: 0, value: 199, description: 'Heals your target for 199 hit points.',
  },
  wolf_form: {
    id: 'wolf_form', name: 'Wolf Form', class: 'Druid', level: 19,
    school: 'magic', effect: 'buff', manaCost: 60, castTime: 4, recastTime: 0,
    duration: 720, value: 5, description: 'Transforms caster into a wolf, increasing STR and run speed.',
    targetSelf: true,
  },
  tunares_renewal: {
    id: 'tunares_renewal', name: "Tunare's Renewal", class: 'Druid', level: 24,
    school: 'divine', effect: 'heal', manaCost: 195, castTime: 3, recastTime: 0,
    duration: 0, value: 296, description: 'Heals your target for 296 hit points.',
  },
  superior_healing_dru: {
    id: 'superior_healing_dru', name: 'Superior Healing', class: 'Druid', level: 29,
    school: 'divine', effect: 'heal', manaCost: 250, castTime: 3, recastTime: 0,
    duration: 0, value: 399, description: 'Heals your target for 399 hit points.',
  },
  circle_of_karana: {
    id: 'circle_of_karana', name: 'Circle of Karana', class: 'Druid', level: 34,
    school: 'magic', effect: 'port', manaCost: 100, castTime: 6, recastTime: 0,
    duration: 0, value: 1, description: 'Teleports caster to North Karana.',
    targetSelf: true,
  },
  chloroblast: {
    id: 'chloroblast', name: 'Chloroblast', class: 'Druid', level: 34,
    school: 'divine', effect: 'heal', manaCost: 300, castTime: 3, recastTime: 0,
    duration: 0, value: 496, description: 'Heals your target for 496 hit points.',
  },
  regrowth: {
    id: 'regrowth', name: 'Regrowth', class: 'Druid', level: 39,
    school: 'divine', effect: 'hot', manaCost: 225, castTime: 4, recastTime: 0,
    duration: 42, value: 28, description: 'Heals target for 28 HP per tick for 42 ticks.',
  },
  karana_renewal: {
    id: 'karana_renewal', name: "Karana's Renewal", class: 'Druid', level: 55,
    school: 'divine', effect: 'hot', manaCost: 300, castTime: 4, recastTime: 0,
    duration: 42, value: 50, description: 'Heals target for 50 HP per tick for 42 ticks.',
  },
  natures_recovery: {
    id: 'natures_recovery', name: "Nature's Recovery", class: 'Druid', level: 60,
    school: 'divine', effect: 'heal', manaCost: 400, castTime: 3, recastTime: 0,
    duration: 0, value: 600, description: 'Heals all group members for 600 hit points.',
    targetGroup: true,
  },

  // ══════════════════════════════════════════════════════════════════
  // SHAMAN SPELLS
  // ══════════════════════════════════════════════════════════════════

  inner_fire: {
    id: 'inner_fire', name: 'Inner Fire', class: 'Shaman', level: 1,
    school: 'divine', effect: 'buff', manaCost: 20, castTime: 3, recastTime: 0,
    duration: 720, value: 20, description: 'Increases target\'s AC by 20.',
  },
  minor_healing_shm: {
    id: 'minor_healing_shm', name: 'Minor Healing', class: 'Shaman', level: 1,
    school: 'divine', effect: 'heal', manaCost: 10, castTime: 2, recastTime: 0,
    duration: 0, value: 18, description: 'Heals your target for 18 hit points.',
  },
  torbas_poison_bolt: {
    id: 'torbas_poison_bolt', name: "Torbas' Poison Bolt", class: 'Shaman', level: 5,
    school: 'poison', effect: 'dd', manaCost: 30, castTime: 2, recastTime: 0,
    duration: 0, value: 32, description: 'Deals 32 poison damage to target.',
    resistable: true,
  },
  frost_rift: {
    id: 'frost_rift', name: 'Frost Rift', class: 'Shaman', level: 9,
    school: 'cold', effect: 'dd', manaCost: 65, castTime: 2, recastTime: 0,
    duration: 0, value: 88, description: 'Deals 88 cold damage to target.',
    resistable: true,
  },
  malaise: {
    id: 'malaise', name: 'Malaise', class: 'Shaman', level: 9,
    school: 'magic', effect: 'debuff', manaCost: 40, castTime: 2, recastTime: 0,
    duration: 60, value: 20, description: 'Reduces target\'s magic resistance by 20.',
    resistable: true,
  },
  healing_shm: {
    id: 'healing_shm', name: 'Healing', class: 'Shaman', level: 9,
    school: 'divine', effect: 'heal', manaCost: 65, castTime: 3, recastTime: 0,
    duration: 0, value: 96, description: 'Heals your target for 96 hit points.',
  },
  turgurs_insects: {
    id: 'turgurs_insects', name: "Turgur's Insects", class: 'Shaman', level: 14,
    school: 'disease', effect: 'slow', manaCost: 80, castTime: 3, recastTime: 0,
    duration: 60, value: 17, description: 'Slows target\'s attack speed by 17%.',
    resistable: true,
  },
  greater_healing_shm: {
    id: 'greater_healing_shm', name: 'Greater Healing', class: 'Shaman', level: 19,
    school: 'divine', effect: 'heal', manaCost: 150, castTime: 3, recastTime: 0,
    duration: 0, value: 199, description: 'Heals your target for 199 hit points.',
  },
  listless_power: {
    id: 'listless_power', name: 'Listless Power', class: 'Shaman', level: 19,
    school: 'disease', effect: 'slow', manaCost: 100, castTime: 3, recastTime: 0,
    duration: 60, value: 25, description: 'Slows target\'s attack speed by 25%.',
    resistable: true,
  },
  fleeting_fury: {
    id: 'fleeting_fury', name: 'Fleeting Fury', class: 'Shaman', level: 24,
    school: 'divine', effect: 'haste', manaCost: 75, castTime: 3, recastTime: 0,
    duration: 120, value: 25, description: 'Increases target\'s attack speed by 25%.',
  },
  torpor: {
    id: 'torpor', name: 'Torpor', class: 'Shaman', level: 34,
    school: 'disease', effect: 'slow', manaCost: 200, castTime: 3, recastTime: 0,
    duration: 60, value: 50, description: 'Slows target\'s attack speed by 50% and provides a heal-over-time.',
    resistable: true,
  },
  malosini: {
    id: 'malosini', name: 'Malosini', class: 'Shaman', level: 44,
    school: 'magic', effect: 'debuff', manaCost: 70, castTime: 2, recastTime: 0,
    duration: 60, value: 40, description: 'Reduces target\'s magic resistance by 40.',
    resistable: true,
  },
  cannibalize_iii: {
    id: 'cannibalize_iii', name: 'Cannibalize III', class: 'Shaman', level: 49,
    school: 'divine', effect: 'heal', manaCost: 0, castTime: 0, recastTime: 6,
    duration: 0, value: 200, description: 'Sacrifices 100 HP to restore 200 mana.',
    targetSelf: true,
  },
  sha_legacy: {
    id: 'sha_legacy', name: "Sha's Legacy", class: 'Shaman', level: 55,
    school: 'magic', effect: 'dd', manaCost: 350, castTime: 3, recastTime: 0,
    duration: 0, value: 660, description: 'Deals 660 magic damage to target.',
    resistable: true,
  },

  // ══════════════════════════════════════════════════════════════════
  // WIZARD SPELLS
  // ══════════════════════════════════════════════════════════════════

  flare: {
    id: 'flare', name: 'Flare', class: 'Wizard', level: 1,
    school: 'fire', effect: 'dd', manaCost: 10, castTime: 2, recastTime: 0,
    duration: 0, value: 14, description: 'Deals 14 fire damage to target.',
    resistable: true,
  },
  minor_shielding: {
    id: 'minor_shielding', name: 'Minor Shielding', class: 'Wizard', level: 1,
    school: 'magic', effect: 'buff', manaCost: 15, castTime: 2, recastTime: 0,
    duration: 720, value: 5, description: 'Increases magic resistance by 5.',
    targetSelf: true,
  },
  burst_of_flame: {
    id: 'burst_of_flame', name: 'Burst of Flame', class: 'Wizard', level: 2,
    school: 'fire', effect: 'dd', manaCost: 20, castTime: 2, recastTime: 0,
    duration: 0, value: 22, description: 'Deals 22 fire damage to target.',
    resistable: true,
  },
  flame_shock: {
    id: 'flame_shock', name: 'Flame Shock', class: 'Wizard', level: 4,
    school: 'fire', effect: 'dd', manaCost: 40, castTime: 2, recastTime: 0,
    duration: 0, value: 40, description: 'Deals 40 fire damage to target.',
    resistable: true,
  },
  lesser_shielding: {
    id: 'lesser_shielding', name: 'Lesser Shielding', class: 'Wizard', level: 4,
    school: 'magic', effect: 'buff', manaCost: 20, castTime: 2, recastTime: 0,
    duration: 720, value: 10, description: 'Increases magic resistance by 10.',
    targetSelf: true,
  },
  frost_bolt: {
    id: 'frost_bolt', name: 'Frost Bolt', class: 'Wizard', level: 4,
    school: 'cold', effect: 'dd', manaCost: 45, castTime: 2, recastTime: 0,
    duration: 0, value: 50, description: 'Deals 50 cold damage to target.',
    resistable: true,
  },
  shock_of_cold: {
    id: 'shock_of_cold', name: 'Shock of Cold', class: 'Wizard', level: 5,
    school: 'cold', effect: 'dd', manaCost: 75, castTime: 2, recastTime: 0,
    duration: 0, value: 75, description: 'Deals 75 cold damage to target.',
    resistable: true,
  },
  shock_of_fire: {
    id: 'shock_of_fire', name: 'Shock of Fire', class: 'Wizard', level: 8,
    school: 'fire', effect: 'dd', manaCost: 110, castTime: 2, recastTime: 0,
    duration: 0, value: 115, description: 'Deals 115 fire damage to target.',
    resistable: true,
  },
  shielding: {
    id: 'shielding', name: 'Shielding', class: 'Wizard', level: 9,
    school: 'magic', effect: 'buff', manaCost: 30, castTime: 2, recastTime: 0,
    duration: 720, value: 15, description: 'Increases magic resistance by 15.',
    targetSelf: true,
  },
  shock_of_ice: {
    id: 'shock_of_ice', name: 'Shock of Ice', class: 'Wizard', level: 12,
    school: 'cold', effect: 'dd', manaCost: 175, castTime: 2, recastTime: 0,
    duration: 0, value: 170, description: 'Deals 170 cold damage to target.',
    resistable: true,
  },
  concussion: {
    id: 'concussion', name: 'Concussion', class: 'Wizard', level: 16,
    school: 'magic', effect: 'dd', manaCost: 200, castTime: 2, recastTime: 0,
    duration: 0, value: 214, description: 'Deals 214 magic damage to target.',
    resistable: true,
  },
  conflagration: {
    id: 'conflagration', name: 'Conflagration', class: 'Wizard', level: 20,
    school: 'fire', effect: 'dd', manaCost: 265, castTime: 2, recastTime: 0,
    duration: 0, value: 278, description: 'Deals 278 fire damage to target.',
    resistable: true,
  },
  greater_shielding: {
    id: 'greater_shielding', name: 'Greater Shielding', class: 'Wizard', level: 29,
    school: 'magic', effect: 'buff', manaCost: 50, castTime: 2, recastTime: 0,
    duration: 720, value: 20, description: 'Increases magic resistance by 20.',
    targetSelf: true,
  },
  incinerate: {
    id: 'incinerate', name: 'Incinerate', class: 'Wizard', level: 29,
    school: 'fire', effect: 'dd', manaCost: 400, castTime: 2, recastTime: 0,
    duration: 0, value: 425, description: 'Deals 425 fire damage to target.',
    resistable: true,
  },
  frost_strike: {
    id: 'frost_strike', name: 'Frost Strike', class: 'Wizard', level: 34,
    school: 'cold', effect: 'dd', manaCost: 500, castTime: 2, recastTime: 0,
    duration: 0, value: 533, description: 'Deals 533 cold damage to target.',
    resistable: true,
  },
  major_shielding: {
    id: 'major_shielding', name: 'Major Shielding', class: 'Wizard', level: 39,
    school: 'magic', effect: 'buff', manaCost: 75, castTime: 2, recastTime: 0,
    duration: 720, value: 25, description: 'Increases magic resistance by 25.',
    targetSelf: true,
  },
  inferno_al_kabor: {
    id: 'inferno_al_kabor', name: "Inferno of Al'Kabor", class: 'Wizard', level: 44,
    school: 'fire', effect: 'dd', manaCost: 775, castTime: 2, recastTime: 0,
    duration: 0, value: 822, description: 'Deals 822 fire damage to target.',
    resistable: true,
  },
  sunstrike: {
    id: 'sunstrike', name: 'Sunstrike', class: 'Wizard', level: 49,
    school: 'fire', effect: 'dd', manaCost: 920, castTime: 2, recastTime: 0,
    duration: 0, value: 979, description: 'Deals 979 fire damage to target.',
    resistable: true,
  },
  ice_comet: {
    id: 'ice_comet', name: 'Ice Comet', class: 'Wizard', level: 51,
    school: 'cold', effect: 'dd', manaCost: 1000, castTime: 2, recastTime: 0,
    duration: 0, value: 1058, description: 'Deals 1058 cold damage to target.',
    resistable: true,
  },
  winds_of_gelid: {
    id: 'winds_of_gelid', name: 'Winds of Gelid', class: 'Wizard', level: 55,
    school: 'cold', effect: 'dd', manaCost: 1050, castTime: 2, recastTime: 0,
    duration: 0, value: 1100, description: 'Deals 1100 cold damage to target.',
    resistable: true,
  },
  thunderbolt: {
    id: 'thunderbolt', name: 'Thunderbolt', class: 'Wizard', level: 60,
    school: 'magic', effect: 'dd', manaCost: 1250, castTime: 2, recastTime: 0,
    duration: 0, value: 1349, description: 'Deals 1349 magic damage to target.',
    resistable: true,
  },

  // ══════════════════════════════════════════════════════════════════
  // MAGICIAN SPELLS
  // ══════════════════════════════════════════════════════════════════

  elemental_armor: {
    id: 'elemental_armor', name: 'Elemental Armor', class: 'Magician', level: 1,
    school: 'magic', effect: 'buff', manaCost: 25, castTime: 3, recastTime: 0,
    duration: 720, value: 20, description: 'Increases target\'s AC by 20.',
  },
  burst_of_flame_mag: {
    id: 'burst_of_flame_mag', name: 'Burst of Flame', class: 'Magician', level: 1,
    school: 'fire', effect: 'dd', manaCost: 20, castTime: 2, recastTime: 0,
    duration: 0, value: 22, description: 'Deals 22 fire damage to target.',
    resistable: true,
  },
  fire_flux: {
    id: 'fire_flux', name: 'Fire Flux', class: 'Magician', level: 5,
    school: 'fire', effect: 'dd', manaCost: 50, castTime: 2, recastTime: 0,
    duration: 0, value: 50, description: 'Deals 50 fire damage to target.',
    resistable: true,
  },
  earth_pet: {
    id: 'earth_pet', name: 'Summon: Earth Elemental', class: 'Magician', level: 5,
    school: 'magic', effect: 'pet', manaCost: 80, castTime: 5, recastTime: 0,
    duration: 0, value: 5, description: 'Summons an earth elemental pet.',
  },
  shock_of_flame: {
    id: 'shock_of_flame', name: 'Shock of Flame', class: 'Magician', level: 9,
    school: 'fire', effect: 'dd', manaCost: 90, castTime: 2, recastTime: 0,
    duration: 0, value: 88, description: 'Deals 88 fire damage to target.',
    resistable: true,
  },
  water_pet: {
    id: 'water_pet', name: 'Summon: Water Elemental', class: 'Magician', level: 9,
    school: 'magic', effect: 'pet', manaCost: 120, castTime: 5, recastTime: 0,
    duration: 0, value: 9, description: 'Summons a water elemental pet.',
  },
  burnout: {
    id: 'burnout', name: 'Burnout', class: 'Magician', level: 14,
    school: 'magic', effect: 'haste', manaCost: 75, castTime: 3, recastTime: 0,
    duration: 60, value: 20, description: 'Increases pet\'s attack speed and damage.',
  },
  fire_pet: {
    id: 'fire_pet', name: 'Summon: Fire Elemental', class: 'Magician', level: 14,
    school: 'fire', effect: 'pet', manaCost: 150, castTime: 5, recastTime: 0,
    duration: 0, value: 14, description: 'Summons a fire elemental pet.',
  },
  air_pet: {
    id: 'air_pet', name: 'Summon: Air Elemental', class: 'Magician', level: 19,
    school: 'magic', effect: 'pet', manaCost: 180, castTime: 5, recastTime: 0,
    duration: 0, value: 19, description: 'Summons an air elemental pet.',
  },
  burnout_ii: {
    id: 'burnout_ii', name: 'Burnout II', class: 'Magician', level: 24,
    school: 'magic', effect: 'haste', manaCost: 100, castTime: 3, recastTime: 0,
    duration: 60, value: 30, description: 'Greatly increases pet\'s attack speed and damage.',
  },
  burnout_iii: {
    id: 'burnout_iii', name: 'Burnout III', class: 'Magician', level: 34,
    school: 'magic', effect: 'haste', manaCost: 150, castTime: 3, recastTime: 0,
    duration: 60, value: 40, description: 'Massively increases pet\'s attack speed and damage.',
  },
  burnout_iv: {
    id: 'burnout_iv', name: 'Burnout IV', class: 'Magician', level: 44,
    school: 'magic', effect: 'haste', manaCost: 200, castTime: 3, recastTime: 0,
    duration: 60, value: 50, description: 'Devastatingly increases pet\'s attack speed and damage.',
  },
  megaflare: {
    id: 'megaflare', name: 'Megaflare', class: 'Magician', level: 49,
    school: 'fire', effect: 'dd', manaCost: 850, castTime: 2, recastTime: 0,
    duration: 0, value: 900, description: 'Deals 900 fire damage to target.',
    resistable: true,
  },
  strike_of_solusek: {
    id: 'strike_of_solusek', name: 'Strike of Solusek', class: 'Magician', level: 55,
    school: 'fire', effect: 'dd', manaCost: 1100, castTime: 2, recastTime: 0,
    duration: 0, value: 1150, description: 'Deals 1150 fire damage with the power of Solusek Ro.',
    resistable: true,
  },

  // ══════════════════════════════════════════════════════════════════
  // ENCHANTER SPELLS
  // ══════════════════════════════════════════════════════════════════

  mesmerization: {
    id: 'mesmerization', name: 'Mesmerization', class: 'Enchanter', level: 1,
    school: 'magic', effect: 'mez', manaCost: 30, castTime: 2, recastTime: 0,
    duration: 30, value: 30, description: 'Mesmerizes target for up to 30 ticks.',
    resistable: true,
  },
  alliance: {
    id: 'alliance', name: 'Alliance', class: 'Enchanter', level: 1,
    school: 'magic', effect: 'charm', manaCost: 40, castTime: 3, recastTime: 0,
    duration: 120, value: 10, description: 'Charms a target up to level 10.',
    resistable: true,
  },
  pendril_animation: {
    id: 'pendril_animation', name: "Pendril's Animation", class: 'Enchanter', level: 1,
    school: 'magic', effect: 'pet', manaCost: 50, castTime: 5, recastTime: 0,
    duration: 0, value: 3, description: 'Animates an elemental pet.',
  },
  chilling_embrace: {
    id: 'chilling_embrace', name: 'Chilling Embrace', class: 'Enchanter', level: 5,
    school: 'cold', effect: 'slow', manaCost: 60, castTime: 2, recastTime: 0,
    duration: 60, value: 25, description: 'Slows target\'s attack speed by 25%.',
    resistable: true,
  },
  tashani: {
    id: 'tashani', name: 'Tashani', class: 'Enchanter', level: 9,
    school: 'magic', effect: 'debuff', manaCost: 40, castTime: 2, recastTime: 0,
    duration: 60, value: 20, description: 'Reduces target\'s magic resistance by 20.',
    resistable: true,
  },
  rune_i: {
    id: 'rune_i', name: 'Rune I', class: 'Enchanter', level: 14,
    school: 'magic', effect: 'rune', manaCost: 60, castTime: 3, recastTime: 0,
    duration: 0, value: 200, description: 'Absorbs 200 points of incoming damage.',
  },
  greater_animation: {
    id: 'greater_animation', name: 'Greater Animation', class: 'Enchanter', level: 19,
    school: 'magic', effect: 'pet', manaCost: 120, castTime: 5, recastTime: 0,
    duration: 0, value: 19, description: 'Animates a more powerful elemental pet.',
  },
  clarity: {
    id: 'clarity', name: 'Clarity', class: 'Enchanter', level: 24,
    school: 'magic', effect: 'buff', manaCost: 100, castTime: 4, recastTime: 0,
    duration: 480, value: 7, description: 'Increases target\'s mana regeneration by 7 per tick.',
  },
  rune_iii: {
    id: 'rune_iii', name: 'Rune III', class: 'Enchanter', level: 29,
    school: 'magic', effect: 'rune', manaCost: 160, castTime: 3, recastTime: 0,
    duration: 0, value: 600, description: 'Absorbs 600 points of incoming damage.',
  },
  clarity_ii: {
    id: 'clarity_ii', name: 'Clarity II', class: 'Enchanter', level: 34,
    school: 'magic', effect: 'buff', manaCost: 150, castTime: 4, recastTime: 0,
    duration: 480, value: 11, description: 'Increases target\'s mana regeneration by 11 per tick.',
  },
  adorning_grace: {
    id: 'adorning_grace', name: 'Adorning Grace', class: 'Enchanter', level: 39,
    school: 'cold', effect: 'slow', manaCost: 150, castTime: 2, recastTime: 0,
    duration: 60, value: 45, description: 'Slows target\'s attack speed by 45%.',
    resistable: true,
  },
  rune_iv: {
    id: 'rune_iv', name: 'Rune IV', class: 'Enchanter', level: 44,
    school: 'magic', effect: 'rune', manaCost: 240, castTime: 3, recastTime: 0,
    duration: 0, value: 1000, description: 'Absorbs 1000 points of incoming damage.',
  },
  celerity: {
    id: 'celerity', name: 'Celerity', class: 'Enchanter', level: 49,
    school: 'magic', effect: 'haste', manaCost: 200, castTime: 4, recastTime: 0,
    duration: 120, value: 40, description: 'Increases target\'s attack speed by 40%.',
  },
  clarity_iii: {
    id: 'clarity_iii', name: 'Clarity III', class: 'Enchanter', level: 55,
    school: 'magic', effect: 'buff', manaCost: 200, castTime: 4, recastTime: 0,
    duration: 480, value: 16, description: 'Increases all group members\' mana regeneration by 16 per tick.',
    targetGroup: true,
  },
  rune_v: {
    id: 'rune_v', name: 'Rune V', class: 'Enchanter', level: 55,
    school: 'magic', effect: 'rune', manaCost: 320, castTime: 3, recastTime: 0,
    duration: 0, value: 1400, description: 'Absorbs 1400 points of incoming damage.',
  },
  boon_clear_mind: {
    id: 'boon_clear_mind', name: 'Boon of the Clear Mind', class: 'Enchanter', level: 60,
    school: 'magic', effect: 'buff', manaCost: 250, castTime: 4, recastTime: 0,
    duration: 480, value: 20, description: 'Increases all group members\' mana regeneration by 20 per tick.',
    targetGroup: true,
  },

  // ══════════════════════════════════════════════════════════════════
  // NECROMANCER SPELLS
  // ══════════════════════════════════════════════════════════════════

  disease_cloud: {
    id: 'disease_cloud', name: 'Disease Cloud', class: 'Necromancer', level: 1,
    school: 'disease', effect: 'dot', manaCost: 15, castTime: 2, recastTime: 0,
    duration: 12, value: 2, dotValue: 2, description: 'Afflicts target with a disease dealing 2 damage per tick.',
    resistable: true,
  },
  lifetap: {
    id: 'lifetap', name: 'Lifetap', class: 'Necromancer', level: 1,
    school: 'magic', effect: 'lifetap', manaCost: 20, castTime: 2, recastTime: 0,
    duration: 0, value: 10, description: 'Steals 10 hit points from target and adds them to caster\'s HP.',
    resistable: true,
  },
  leering_corpse: {
    id: 'leering_corpse', name: 'Leering Corpse', class: 'Necromancer', level: 5,
    school: 'magic', effect: 'pet', manaCost: 75, castTime: 5, recastTime: 0,
    duration: 0, value: 5, description: 'Animates an undead servant to fight for you.',
  },
  heart_flutter: {
    id: 'heart_flutter', name: 'Heart Flutter', class: 'Necromancer', level: 5,
    school: 'disease', effect: 'lifetap', manaCost: 40, castTime: 2, recastTime: 0,
    duration: 0, value: 32, description: 'Deals damage and returns a portion as HP.',
    resistable: true,
  },
  animate_dead: {
    id: 'animate_dead', name: 'Animate Dead', class: 'Necromancer', level: 9,
    school: 'magic', effect: 'pet', manaCost: 120, castTime: 5, recastTime: 0,
    duration: 0, value: 9, description: 'Animates a more powerful undead servant.',
  },
  cascading_darkness: {
    id: 'cascading_darkness', name: 'Cascading Darkness', class: 'Necromancer', level: 9,
    school: 'magic', effect: 'dot', manaCost: 75, castTime: 2, recastTime: 0,
    duration: 7, value: 40, dotValue: 40, description: 'Envelops target in darkness, dealing 40 damage per tick.',
    resistable: true,
  },
  shadowbolt: {
    id: 'shadowbolt', name: 'Shadowbolt', class: 'Necromancer', level: 14,
    school: 'magic', effect: 'dd', manaCost: 110, castTime: 2, recastTime: 0,
    duration: 0, value: 106, description: 'Deals 106 magic damage to target.',
    resistable: true,
  },
  invoke_fear: {
    id: 'invoke_fear', name: 'Invoke Fear', class: 'Necromancer', level: 19,
    school: 'magic', effect: 'fear', manaCost: 80, castTime: 2, recastTime: 0,
    duration: 30, value: 1, description: 'Causes target to flee in fear.',
    resistable: true,
  },
  dooming_darkness: {
    id: 'dooming_darkness', name: 'Dooming Darkness', class: 'Necromancer', level: 29,
    school: 'disease', effect: 'dot', manaCost: 150, castTime: 2, recastTime: 0,
    duration: 15, value: 32, dotValue: 32, description: 'Deals 32 disease damage per tick and slows target.',
    resistable: true,
  },
  scourge: {
    id: 'scourge', name: 'Scourge', class: 'Necromancer', level: 34,
    school: 'disease', effect: 'dot', manaCost: 250, castTime: 2, recastTime: 0,
    duration: 15, value: 30, dotValue: 30, description: 'Afflicts target with a vile plague dealing 30 damage per tick.',
    resistable: true,
  },
  pox_bertoxxulous: {
    id: 'pox_bertoxxulous', name: 'Pox of Bertoxxulous', class: 'Necromancer', level: 44,
    school: 'disease', effect: 'dot', manaCost: 400, castTime: 2, recastTime: 0,
    duration: 18, value: 60, dotValue: 60, description: 'Calls upon Bertoxxulous to afflict target with a powerful plague.',
    resistable: true,
  },
  splurt: {
    id: 'splurt', name: 'Splurt', class: 'Necromancer', level: 49,
    school: 'magic', effect: 'dot', manaCost: 325, castTime: 2, recastTime: 0,
    duration: 10, value: 22, dotValue: 22, description: 'Ramping DoT — deals 22 damage per tick, increasing each tick.',
    resistable: true,
  },
  lich: {
    id: 'lich', name: 'Lich', class: 'Necromancer', level: 55,
    school: 'magic', effect: 'buff', manaCost: 0, castTime: 4, recastTime: 0,
    duration: 0, value: 15, description: 'Transforms caster into a lich, draining HP to power mana regeneration.',
    targetSelf: true,
  },
  pyrocruor: {
    id: 'pyrocruor', name: 'Pyrocruor', class: 'Necromancer', level: 60,
    school: 'fire', effect: 'dot', manaCost: 550, castTime: 2, recastTime: 0,
    duration: 20, value: 88, dotValue: 88, description: 'Engulfs target in cursed flames, dealing 88 fire damage per tick.',
    resistable: true,
  },

  // ══════════════════════════════════════════════════════════════════
  // BARD SONGS
  // ══════════════════════════════════════════════════════════════════

  chant_of_battle: {
    id: 'chant_of_battle', name: 'Chant of Battle', class: 'Bard', level: 1,
    school: 'song', effect: 'buff', manaCost: 0, castTime: 0, recastTime: 0,
    duration: 6, value: 10, description: 'Song: Increases group ATK by 10 while singing.',
    targetGroup: true,
  },
  hymn_of_restoration: {
    id: 'hymn_of_restoration', name: 'Hymn of Restoration', class: 'Bard', level: 1,
    school: 'song', effect: 'hot', manaCost: 0, castTime: 0, recastTime: 0,
    duration: 6, value: 20, description: 'Song: Heals group members for 20 HP per pulse.',
    targetGroup: true,
  },
  selos_chorus: {
    id: 'selos_chorus', name: "Selo's Accelerating Chorus", class: 'Bard', level: 5,
    school: 'song', effect: 'haste', manaCost: 0, castTime: 0, recastTime: 0,
    duration: 6, value: 15, description: 'Song: Increases group run speed by 15%.',
    targetGroup: true,
  },
  cassindras_clarity: {
    id: 'cassindras_clarity', name: "Cassindra's Chorus of Clarity", class: 'Bard', level: 19,
    school: 'song', effect: 'buff', manaCost: 0, castTime: 0, recastTime: 0,
    duration: 6, value: 4, description: 'Song: Increases group mana regeneration by 4 per pulse.',
    targetGroup: true,
  },
  angstlichs_assonance: {
    id: 'angstlichs_assonance', name: "Angstlich's Assonance", class: 'Bard', level: 24,
    school: 'song', effect: 'mez', manaCost: 0, castTime: 0, recastTime: 0,
    duration: 6, value: 30, description: 'Song: Mesmerizes a single target while singing.',
    resistable: true,
  },
  nillipus_march: {
    id: 'nillipus_march', name: "Nillipus' March of the Wee", class: 'Bard', level: 24,
    school: 'song', effect: 'haste', manaCost: 0, castTime: 0, recastTime: 0,
    duration: 6, value: 20, description: 'Song: Increases group attack haste by 20%.',
    targetGroup: true,
  },
  vilias_celerity: {
    id: 'vilias_celerity', name: "Vilia's Chorus of Celerity", class: 'Bard', level: 39,
    school: 'song', effect: 'haste', manaCost: 0, castTime: 0, recastTime: 0,
    duration: 6, value: 30, description: 'Song: Greatly increases group attack haste.',
    targetGroup: true,
  },
  cantata_soothing: {
    id: 'cantata_soothing', name: 'Cantata of Soothing', class: 'Bard', level: 39,
    school: 'song', effect: 'slow', manaCost: 0, castTime: 0, recastTime: 0,
    duration: 6, value: 25, description: 'Song: Slows a single target\'s attack speed by 25%.',
    resistable: true,
  },
  mcvaxius_horn: {
    id: 'mcvaxius_horn', name: "McVaxius' Horn of War", class: 'Bard', level: 55,
    school: 'song', effect: 'haste', manaCost: 0, castTime: 0, recastTime: 0,
    duration: 6, value: 40, description: 'Song: Greatly increases group haste and ATK.',
    targetGroup: true,
  },
  saryns_lullaby: {
    id: 'saryns_lullaby', name: "Saryrn's Lullaby", class: 'Bard', level: 49,
    school: 'song', effect: 'mez', manaCost: 0, castTime: 0, recastTime: 0,
    duration: 6, value: 50, description: 'Song: AoE mesmerize while singing.',
    targetAoE: true,
    resistable: true,
  },
};

export const SPELL_LIST = Object.values(SPELLS);

/** Get all spells available to a class at or below a given level */
export function getSpellsForClass(charClass: string, atLevel: number): Spell[] {
  return SPELL_LIST.filter((s) => s.class === charClass && s.level <= atLevel);
}

/** Get the best offensive spell a class can cast right now */
export function getBestOffensiveSpell(charClass: string, level: number, memorized: (string | null)[]): Spell | null {
  const memSpells = memorized
    .filter((id): id is string => id !== null)
    .map((id) => SPELLS[id])
    .filter((s): s is Spell => !!s && s.class === charClass && s.level <= level)
    .filter((s) => ['dd', 'dot', 'lifetap'].includes(s.effect));

  if (memSpells.length === 0) return null;
  return memSpells.reduce((best, s) => (s.value > best.value ? s : best), memSpells[0]);
}

/** Get the best heal spell */
export function getBestHealSpell(charClass: string, level: number, memorized: (string | null)[]): Spell | null {
  const healSpells = memorized
    .filter((id): id is string => id !== null)
    .map((id) => SPELLS[id])
    .filter((s): s is Spell => !!s && s.class === charClass && s.level <= level)
    .filter((s) => s.effect === 'heal');

  if (healSpells.length === 0) return null;
  return healSpells.reduce((best, s) => (s.value > best.value ? s : best), healSpells[0]);
}

/** Auto-memorize best spells for level (fills gems with top DD + heal/buff spells) */
export function autoMemorizeSpells(charClass: string, level: number, spellBook: string[]): (string | null)[] {
  const available = spellBook
    .map((id) => SPELLS[id])
    .filter((s): s is Spell => !!s && s.class === charClass && s.level <= level);

  const gems: (string | null)[] = [null, null, null, null, null, null, null, null];
  let gemIdx = 0;

  // Prioritize: DD/dot/lifetap, then heal/hot, then buff/slow, then rest
  const priority: SpellEffect[] = ['dd', 'dot', 'lifetap', 'heal', 'hot', 'slow', 'debuff', 'buff', 'rune', 'pet', 'mez', 'haste', 'charm', 'fear', 'root', 'snare', 'port'];

  for (const eff of priority) {
    if (gemIdx >= 8) break;
    const candidates = available
      .filter((s) => s.effect === eff)
      .sort((a, b) => b.value - a.value)
      .slice(0, 2);
    for (const s of candidates) {
      if (gemIdx < 8) gems[gemIdx++] = s.id;
    }
  }

  return gems;
}

type SpellEffect =
  | 'dd' | 'dot' | 'heal' | 'hot' | 'buff' | 'debuff'
  | 'slow' | 'haste' | 'mez' | 'root' | 'fear'
  | 'charm' | 'lifetap' | 'pet' | 'port' | 'snare' | 'rune';
