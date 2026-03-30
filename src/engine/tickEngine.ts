/**
 * Tick Engine — 1-second game loop manager
 * Integrates with the Zustand game store via a store accessor callback.
 *
 * Usage:
 *   import { startGameLoop, stopGameLoop } from './tickEngine';
 *   startGameLoop(() => useGameStore.getState().tick());
 */

type TickHandler = () => void;

const handlers: TickHandler[] = [];
let intervalId: ReturnType<typeof setInterval> | null = null;

/** Register a function to be called every tick (1000 ms). */
export function registerTickHandler(handler: TickHandler): void {
  if (!handlers.includes(handler)) {
    handlers.push(handler);
  }
}

/** Unregister a previously registered tick handler. */
export function unregisterTickHandler(handler: TickHandler): void {
  const idx = handlers.indexOf(handler);
  if (idx !== -1) handlers.splice(idx, 1);
}

/** Start the 1-second game loop. Calling again while running is a no-op. */
export function startGameLoop(tickFn?: TickHandler): void {
  if (tickFn) registerTickHandler(tickFn);
  if (intervalId !== null) return;
  intervalId = setInterval(() => {
    if (document.visibilityState !== 'hidden') {
      for (const handler of handlers) {
        handler();
      }
    }
  }, 1000);
}

/** Stop the game loop and clear all registered handlers. */
export function stopGameLoop(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  handlers.length = 0;
}

/** Returns true when the loop is currently running. */
export function isGameLoopRunning(): boolean {
  return intervalId !== null;
}
