import type { Quest, QuestStep, ActiveQuest, FactionStandingName } from '../types';
import { QUESTS, QUEST_LIST } from '../data/quests';
import { getFactionStandingName } from '../data/factions';

const STANDING_ORDER: FactionStandingName[] = [
  'Scowling', 'Glaring', 'Dubious', 'Apprehensive',
  'Indifferent', 'Amiable', 'Kindly', 'Warmly', 'Ally',
];

function standingMet(required: FactionStandingName, actual: FactionStandingName): boolean {
  return STANDING_ORDER.indexOf(actual) >= STANDING_ORDER.indexOf(required);
}

/** Check whether a quest step is satisfied given current game state */
export function isStepComplete(
  step: QuestStep,
  stepProgress: number,
  playerLevel: number,
  currentZoneId: string,
  factionStandings: Record<string, number>,
): boolean {
  if (step.requireLevel && playerLevel < step.requireLevel) return false;
  if (step.requireZoneId && currentZoneId !== step.requireZoneId) return false;
  if (step.requireFactionId) {
    const actual = getFactionStandingName(factionStandings[step.requireFactionId] ?? 0);
    if (step.requireFactionStanding && !standingMet(step.requireFactionStanding, actual)) return false;
  }
  if (step.killMonsterId) {
    return stepProgress >= (step.killCount ?? 1);
  }
  // Non-kill steps (level check, zone check, faction check) are checked inline
  return true;
}

/**
 * Process a monster kill — returns updated activeQuests (with incremented progress).
 * Does NOT advance step index; that is done in checkQuestAdvance.
 */
export function recordKillForQuests(
  monsterId: string,
  activeQuests: ActiveQuest[],
): ActiveQuest[] {
  return activeQuests.map((aq) => {
    const quest = QUESTS[aq.questId];
    if (!quest) return aq;
    const step = quest.steps[aq.stepIndex];
    if (!step) return aq;
    if (step.killMonsterId === monsterId) {
      return { ...aq, stepProgress: aq.stepProgress + 1 };
    }
    return aq;
  });
}

/**
 * Try to advance any completed steps for all active quests.
 * Returns { activeQuests, completedQuests, newlyCompleted, messages }.
 */
export function checkQuestAdvance(
  activeQuests: ActiveQuest[],
  completedQuests: string[],
): {
  activeQuests: ActiveQuest[];
  completedQuests: string[];
  newlyCompleted: string[];
  messages: string[];
} {
  const newActive: ActiveQuest[] = [];
  const newlyCompleted: string[] = [];
  const messages: string[] = [];

  for (const aq of activeQuests) {
    const quest = QUESTS[aq.questId];
    if (!quest) continue;

    let current = { ...aq };

    // For kill steps, advance when progress meets kill count
    const step = quest.steps[current.stepIndex];
    if (step?.killMonsterId && step.killCount) {
      if (current.stepProgress >= step.killCount) {
        const stepNum = current.stepIndex + 1;
        const total = quest.steps.length;
        messages.push(`[Quest] "${quest.name}" — Step ${stepNum}/${total} complete: ${step.description}`);
        current = { ...current, stepIndex: current.stepIndex + 1, stepProgress: 0 };
      }
    }

    if (current.stepIndex >= quest.steps.length) {
      newlyCompleted.push(quest.id);
      messages.push(`[Quest Complete] "${quest.name}"!`);
    } else {
      newActive.push(current);
    }
  }

  return {
    activeQuests: newActive,
    completedQuests: [...completedQuests, ...newlyCompleted],
    newlyCompleted,
    messages,
  };
}

/** Get all quests available to start for the player */
export function getAvailableQuests(
  playerLevel: number,
  completedQuests: string[],
  activeQuests: ActiveQuest[],
  _currentZoneId?: string,
): Quest[] {
  const activeIds = new Set(activeQuests.map((aq) => aq.questId));
  const completedSet = new Set(completedQuests);

  return QUEST_LIST.filter((q) => {
    if (activeIds.has(q.id)) return false;
    if (completedSet.has(q.id)) return false;
    if (playerLevel < q.minLevel) return false;
    if (q.prerequisiteQuestIds?.some((pre) => !completedSet.has(pre))) return false;
    return true;
  });
}

/** Start a quest — returns updated activeQuests list */
export function startQuest(questId: string, activeQuests: ActiveQuest[], tickCount: number): ActiveQuest[] {
  const already = activeQuests.find((aq) => aq.questId === questId);
  if (already) return activeQuests;
  return [
    ...activeQuests,
    { questId, stepIndex: 0, stepProgress: 0, startedAt: tickCount },
  ];
}

/** Abandon a quest */
export function abandonQuest(questId: string, activeQuests: ActiveQuest[]): ActiveQuest[] {
  return activeQuests.filter((aq) => aq.questId !== questId);
}

/** Get the current step description for an active quest */
export function getCurrentStepDescription(aq: ActiveQuest): string {
  const quest = QUESTS[aq.questId];
  if (!quest) return 'Unknown quest.';
  const step = quest.steps[aq.stepIndex];
  if (!step) return 'Quest complete — turn in for rewards.';
  if (step.killMonsterId && step.killCount) {
    return `${step.description} (${aq.stepProgress}/${step.killCount})`;
  }
  return step.description;
}
