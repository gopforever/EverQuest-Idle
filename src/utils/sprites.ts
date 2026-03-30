export const PLACEHOLDER_MONSTER_SPRITE = '/assets/sprites/monsters/placeholder.png';
export const PLACEHOLDER_ITEM_SPRITE = '/assets/sprites/items/placeholder.png';

export function getMonsterSprite(monsterId: string): string {
  return `/assets/sprites/monsters/${monsterId}.png`;
}

export function getItemSprite(itemId: string): string {
  return `/assets/sprites/items/${itemId}.png`;
}
