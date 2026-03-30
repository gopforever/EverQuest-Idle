import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export function useGameLoop(): void {
  const tick = useGameStore((state) => state.tick);
  const loadGame = useGameStore((state) => state.loadGame);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load saved game on mount
  useEffect(() => {
    loadGame();
  }, [loadGame]);

  // Game loop
  useEffect(() => {
    const startLoop = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        if (document.visibilityState !== 'hidden') {
          tick();
        }
      }, 1000);
    };

    const stopLoop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopLoop();
      } else {
        startLoop();
      }
    };

    startLoop();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopLoop();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tick]);
}
