import localforage from 'localforage';
import type { GameState } from '../types';

const SAVE_KEY = 'everquest_idle_save';

export async function saveGameState(state: Partial<GameState>): Promise<void> {
  await localforage.setItem(SAVE_KEY, state);
}

export async function loadGameState(): Promise<Partial<GameState> | null> {
  const saved = await localforage.getItem<Partial<GameState>>(SAVE_KEY);
  return saved ?? null;
}

export async function deleteSaveGame(): Promise<void> {
  await localforage.removeItem(SAVE_KEY);
}
