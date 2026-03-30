import type { PlayerCharacter, TradeskillRecipe, Item } from '../types';
import { ITEMS } from '../data/items';

export interface CombineResult {
  success: boolean;
  skillGained: boolean;
  resultItem: Item | null;
  failItem: Item | null;
  updatedInventory: (Item | null)[];
  updatedSkills: Record<string, number>;
  logMessage: string;
}

/** Check if player has all required ingredients in inventory */
export function canCombine(player: PlayerCharacter, recipe: TradeskillRecipe): boolean {
  for (const { itemId, quantity } of recipe.ingredients) {
    let count = 0;
    for (const slot of player.inventory) {
      if (slot && slot.id === itemId) {
        count += 1;
      }
    }
    if (count < quantity) return false;
  }
  return true;
}

/** Consume ingredients from inventory, return updated inventory */
function consumeIngredients(
  inventory: (Item | null)[],
  recipe: TradeskillRecipe
): (Item | null)[] {
  let updated = [...inventory] as (Item | null)[];
  for (const { itemId, quantity } of recipe.ingredients) {
    let remaining = quantity;
    for (let i = 0; i < updated.length && remaining > 0; i++) {
      if (updated[i]?.id === itemId) {
        updated[i] = null;
        remaining--;
      }
    }
  }
  return updated;
}

/** Add item to first available inventory slot */
function addToInventory(inventory: (Item | null)[], item: Item): (Item | null)[] {
  const updated = [...inventory] as (Item | null)[];
  const emptySlot = updated.findIndex((s) => s === null);
  if (emptySlot !== -1) {
    updated[emptySlot] = item;
  }
  return updated;
}

/**
 * Calculate success chance based on player skill vs trivial level.
 * At or above trivial: 95% chance.
 * Below trivial: scales from 5% (skill 0) up to ~90% (near trivial).
 */
export function calcSuccessChance(playerSkill: number, trivial: number): number {
  if (playerSkill >= trivial) return 0.95;
  const ratio = playerSkill / trivial;
  return Math.max(0.05, ratio * 0.9);
}

/** Main combine function */
export function attemptCombine(
  player: PlayerCharacter,
  recipe: TradeskillRecipe
): CombineResult {
  // 1. Check ingredients
  if (!canCombine(player, recipe)) {
    return {
      success: false,
      skillGained: false,
      resultItem: null,
      failItem: null,
      updatedInventory: player.inventory,
      updatedSkills: player.skills,
      logMessage: 'You are missing ingredients.',
    };
  }

  // 2. Consume ingredients regardless of success/fail
  let updatedInventory = consumeIngredients(player.inventory, recipe);

  const playerSkill = player.skills[recipe.skill] ?? 0;
  const successChance = calcSuccessChance(playerSkill, recipe.trivial);

  // 3. Roll success
  const success = Math.random() < successChance;

  let resultItem: Item | null = null;
  let failItem: Item | null = null;
  let logMessage: string;

  if (success) {
    // 4. Add result item(s) to inventory
    const item = ITEMS[recipe.resultItemId];
    if (item) {
      resultItem = item;
      for (let i = 0; i < recipe.resultQuantity; i++) {
        updatedInventory = addToInventory(updatedInventory, item);
      }
      logMessage =
        recipe.resultQuantity > 1
          ? `You successfully combine the materials and create ${recipe.resultQuantity}x ${item.name}!`
          : `You successfully combine the materials and create ${item.name}!`;
    } else {
      logMessage = 'Combine succeeded but result item not found.';
    }
  } else {
    // 5. On fail: add failProduct if defined
    if (recipe.failProduct) {
      const failItemObj = ITEMS[recipe.failProduct];
      if (failItemObj) {
        failItem = failItemObj;
        updatedInventory = addToInventory(updatedInventory, failItemObj);
      }
    }
    logMessage = `You fail to combine the materials${recipe.failProduct ? ' and receive a ruined combine.' : '.'}`;
  }

  // 6. Roll skill gain: only if below trivial
  const updatedSkills = { ...player.skills };
  let skillGained = false;
  if (playerSkill < recipe.trivial && Math.random() < recipe.skillGainChance) {
    updatedSkills[recipe.skill] = Math.min(300, (updatedSkills[recipe.skill] ?? 0) + 1);
    skillGained = true;
    logMessage += ` Your ${recipe.skill} skill has increased!`;
  }

  return {
    success,
    skillGained,
    resultItem,
    failItem,
    updatedInventory,
    updatedSkills,
    logMessage,
  };
}
