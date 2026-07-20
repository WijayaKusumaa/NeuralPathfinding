import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function useGameTimer() {
  const gameMode = useGameStore((state) => state.gameMode);
  const tickTimer = useGameStore((state) => state.tickTimer);

  useEffect(() => {
    if (gameMode !== 'PLAYING') return;

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [gameMode, tickTimer]);
}
