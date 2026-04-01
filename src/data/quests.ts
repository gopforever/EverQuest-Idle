import type { Quest } from '../types';

export const QUESTS: Record<string, Quest> = {

  // ══════════════════════════════════════════════════════════════════
  // GNOLL SLAYER SERIES (Qeynos Faction Quests)
  // ══════════════════════════════════════════════════════════════════

  gnoll_slayer_1: {
    id: 'gnoll_slayer_1',
    name: 'Gnoll Slayer: First Blood',
    description: 'Guard Welan in Qeynos Hills asks you to prove your worth by slaying gnolls. Bring him gnoll fangs as proof.',
    category: 'faction',
    startZone: 'qeynos_hills',
    minLevel: 1,
    npcName: 'Guard Welan',
    steps: [
      {
        id: 'gs1_kill', description: 'Kill gnolls and collect 4 Gnoll Fangs.',
        killMonsterId: 'gnoll', killCount: 4,
      },
    ],
    rewards: {
      xp: 250,
      currency: { gp: 1, sp: 5 },
      factionChanges: [
        { factionId: 'guards_of_qeynos', amount: 50 },
        { factionId: 'citizens_of_qeynos', amount: 20 },
        { factionId: 'inhabitants_blackburrow', amount: -100 },
      ],
    },
  },

  gnoll_slayer_2: {
    id: 'gnoll_slayer_2',
    name: 'Gnoll Slayer: Clear the Hills',
    description: 'The gnoll menace grows bolder. Return to Guard Welan — he needs you to push deeper into Blackburrow.',
    category: 'faction',
    startZone: 'qeynos_hills',
    minLevel: 5,
    npcName: 'Guard Welan',
    prerequisiteQuestIds: ['gnoll_slayer_1'],
    steps: [
      {
        id: 'gs2_kill_guards', description: 'Kill 6 Gnoll Guards in Blackburrow.',
        killMonsterId: 'gnoll_guard', killCount: 6,
      },
      {
        id: 'gs2_kill_shaman', description: 'Slay the Gnoll Shaman who commands their rituals.',
        killMonsterId: 'gnoll_shaman', killCount: 2,
      },
    ],
    rewards: {
      xp: 1200,
      currency: { gp: 5 },
      itemIds: ['bronze_short_sword'],
      factionChanges: [
        { factionId: 'guards_of_qeynos', amount: 100 },
        { factionId: 'inhabitants_blackburrow', amount: -200 },
      ],
    },
  },

  gnoll_slayer_3: {
    id: 'gnoll_slayer_3',
    name: 'Gnoll Slayer: The Commander Falls',
    description: 'The Gnoll Commander rallies their forces. Defeat the commanders to break their chain of command.',
    category: 'faction',
    startZone: 'blackburrow',
    minLevel: 12,
    npcName: 'Guard Captain Tillin',
    prerequisiteQuestIds: ['gnoll_slayer_2'],
    steps: [
      {
        id: 'gs3_kill_cmd', description: 'Slay 3 Gnoll Commanders in Blackburrow.',
        killMonsterId: 'gnoll_commander', killCount: 3,
      },
    ],
    rewards: {
      xp: 3000,
      currency: { pp: 2 },
      itemIds: ['battle_worn_axe'],
      factionChanges: [
        { factionId: 'guards_of_qeynos', amount: 200 },
        { factionId: 'knights_of_thunder', amount: 100 },
        { factionId: 'inhabitants_blackburrow', amount: -500 },
        { factionId: 'splitpaw_gnolls', amount: -100 },
      ],
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // BLOODSTAINED TUNIC — Warrior Epic Precursor
  // ══════════════════════════════════════════════════════════════════

  bloodstained_tunic_1: {
    id: 'bloodstained_tunic_1',
    name: 'The Bloodstained Tunic: A Soldier\'s Past',
    description: 'A dying warrior in Qeynos carries a bloodstained tunic and whispers of an old debt. Uncover the truth of his tale by speaking to veterans across Norrath.',
    category: 'epic_precursor',
    startZone: 'qeynos',
    minLevel: 20,
    npcName: 'Dying Veteran Banthek',
    steps: [
      {
        id: 'bst1_level', description: 'You must be at least level 20 to assist the veteran.',
        requireLevel: 20,
      },
      {
        id: 'bst1_faction', description: 'Prove your loyalty to Qeynos before the veterans will trust you.',
        requireFactionId: 'guards_of_qeynos',
        requireFactionStanding: 'Amiable',
      },
      {
        id: 'bst1_commanders', description: 'Slay the gnoll commanders who killed the veteran\'s old squad.',
        killMonsterId: 'gnoll_commander', killCount: 5,
      },
    ],
    rewards: {
      xp: 8000,
      currency: { pp: 5 },
      itemIds: ['bloodstained_tunic'],
      factionChanges: [
        { factionId: 'guards_of_qeynos', amount: 300 },
        { factionId: 'steel_warriors', amount: 200 },
      ],
    },
    prerequisiteQuestIds: ['gnoll_slayer_3'],
  },

  bloodstained_tunic_2: {
    id: 'bloodstained_tunic_2',
    name: 'The Bloodstained Tunic: Proof of Valor',
    description: 'A Warrior\'s guild master in Freeport has recognized the bloodstained tunic. He will forge you a proper warrior\'s breastplate if you defeat a powerful named guardian.',
    category: 'epic_precursor',
    startZone: 'west_freeport',
    minLevel: 30,
    npcName: 'Guildmaster Brangus',
    prerequisiteQuestIds: ['bloodstained_tunic_1'],
    steps: [
      {
        id: 'bst2_boss', description: 'Bring the bloodstained tunic to Guildmaster Brangus, then slay the ancient gnoll elite captain.',
        killMonsterId: 'pyzjn', killCount: 1,
      },
    ],
    rewards: {
      xp: 20000,
      currency: { pp: 15 },
      itemIds: ['warriors_breastplate_of_valor'],
      factionChanges: [
        { factionId: 'steel_warriors', amount: 500 },
        { factionId: 'freeport_militia', amount: 200 },
      ],
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // SPLITPAW QUEST LINE
  // ══════════════════════════════════════════════════════════════════

  splitpaw_1: {
    id: 'splitpaw_1',
    name: 'Splitpaw: The Refugee Problem',
    description: 'Splitpaw gnolls have been driven from their lair and now take refuge in Blackburrow. A Qeynos ranger asks you to deal with these displaced gnolls.',
    category: 'faction',
    startZone: 'south_karana',
    minLevel: 8,
    npcName: 'Ranger Jyle Windrunner',
    steps: [
      {
        id: 'sp1_refugees', description: 'Slay 5 Splitpaw Refugees who have taken over part of Blackburrow.',
        killMonsterId: 'splitpaw_refugee', killCount: 5,
      },
    ],
    rewards: {
      xp: 2000,
      currency: { gp: 3 },
      factionChanges: [
        { factionId: 'guards_of_qeynos', amount: 75 },
        { factionId: 'splitpaw_gnolls', amount: -200 },
      ],
    },
  },

  splitpaw_2: {
    id: 'splitpaw_2',
    name: 'Splitpaw: Into the Lair',
    description: 'The Splitpaw Lair in South Karana has become a threat. Clear its commanders to restore safety to the Karana Plains.',
    category: 'faction',
    startZone: 'splitpaw_lair',
    minLevel: 15,
    npcName: 'Ranger Jyle Windrunner',
    prerequisiteQuestIds: ['splitpaw_1'],
    steps: [
      {
        id: 'sp2_commanders', description: 'Slay 3 Splitpaw Commanders within the Splitpaw Lair.',
        killMonsterId: 'splitpaw_commander', killCount: 3,
      },
      {
        id: 'sp2_gnolls', description: 'Clear the remaining Splitpaw Gnolls from the lair entrance.',
        killMonsterId: 'splitpaw_gnoll', killCount: 8,
      },
    ],
    rewards: {
      xp: 5000,
      currency: { pp: 3 },
      itemIds: ['gnoll_hide_tunic'],
      factionChanges: [
        { factionId: 'guards_of_qeynos', amount: 150 },
        { factionId: 'splitpaw_gnolls', amount: -400 },
        { factionId: 'inhabitants_blackburrow', amount: 100 },
      ],
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // PLANE ACCESS QUESTS
  // ══════════════════════════════════════════════════════════════════

  plane_of_fear_access: {
    id: 'plane_of_fear_access',
    name: 'The Key of Fear',
    description: 'To enter the Plane of Fear, you must prove yourself by slaying Cazic-Thule\'s most powerful servants in the temple and reaching level 46.',
    category: 'plane_access',
    startZone: 'cazic_thule',
    minLevel: 46,
    npcName: 'Ancient Planar Shard',
    steps: [
      {
        id: 'pf_level', description: 'Reach level 46 to withstand the terrors within.',
        requireLevel: 46,
      },
      {
        id: 'pf_warriors', description: 'Prove your strength by slaying 10 Amygdalan Warriors in the Temple of Cazic-Thule.',
        killMonsterId: 'amygdalan_warrior', killCount: 10,
      },
      {
        id: 'pf_temple', description: 'You must first descend into the Temple of Cazic-Thule.',
        requireZoneId: 'cazic_thule',
      },
    ],
    rewards: {
      xp: 50000,
      itemIds: ['fear_key'],
      factionChanges: [
        { factionId: 'temple_of_cazic_thule', amount: -500 },
      ],
    },
  },

  plane_of_hate_access: {
    id: 'plane_of_hate_access',
    name: 'Burning Words of Xin Thall',
    description: 'The Plane of Hate can only be reached through a wizard\'s portal. Gather the components and find a wizard willing to open the door.',
    category: 'plane_access',
    startZone: 'west_freeport',
    minLevel: 46,
    npcName: 'Xin Thall Cenobite Scroll',
    steps: [
      {
        id: 'ph_level', description: 'Reach level 46.',
        requireLevel: 46,
      },
      {
        id: 'ph_golem', description: 'Obtain the Burning Words from a Hate Golem in the Plane of Hate.',
        killMonsterId: 'hate_golem', killCount: 1,
      },
    ],
    rewards: {
      xp: 50000,
      itemIds: ['hate_key'],
      factionChanges: [
        { factionId: 'servants_of_innoruuk', amount: -500 },
      ],
    },
  },

  plane_of_sky_access: {
    id: 'plane_of_sky_access',
    name: 'The Eye of Veeshan\'s Trial',
    description: 'The Plane of Sky opens only to those who have proven themselves worthy in battle at sea. The island of Erud\'s Crossing holds the path.',
    category: 'plane_access',
    startZone: 'eruds_crossing',
    minLevel: 46,
    npcName: 'Keeper Mikel',
    steps: [
      {
        id: 'ps_level', description: 'Reach level 46.',
        requireLevel: 46,
      },
      {
        id: 'ps_eye', description: 'Defeat the Eye of Veeshan guardian.',
        killMonsterId: 'eye_of_veeshan', killCount: 1,
      },
    ],
    rewards: {
      xp: 50000,
      itemIds: ['sky_key'],
      factionChanges: [
        { factionId: 'claws_of_veeshan', amount: -200 },
      ],
    },
  },
};

export const QUEST_LIST = Object.values(QUESTS);
