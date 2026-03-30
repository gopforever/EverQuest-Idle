import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { startGameLoop, stopGameLoop } from '../engine/tickEngine';

export function useGameLoop(): void {
  const tick = useGameStore((state) => state.tick);
  const loadGame = useGameStore((state) => state.loadGame);

  // Load saved game on mount
  useEffect(() => {
    loadGame();
  }, [loadGame]);

  // Game loop via tickEngine
  useEffect(() => {
    startGameLoop(tick);
    return () => {
      stopGameLoop();
    };
  }, [tick]);
}
