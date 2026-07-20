import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import type { WorkerResponse } from '../workers/workerTypes';

// Keep the worker instance alive across hook mounts
let graphWorker: Worker | null = null;

function getWorker(): Worker {
  if (!graphWorker) {
    // In Vite, we can import worker as modules using the `new URL` syntax
    graphWorker = new Worker(new URL('../workers/graph.worker.ts', import.meta.url), {
      type: 'module',
    });
  }
  return graphWorker;
}

export function useGraph() {
  const level = useGameStore((state) => state.level);
  const gameMode = useGameStore((state) => state.gameMode);
  const graph = useGameStore((state) => state.graph);
  const setGraph = useGameStore((state) => state.setGraph);
  const setIsGenerating = useGameStore((state) => state.setIsGenerating);

  // Determine how many nodes to generate based on the level
  const getNodesCountForLevel = (lvl: number): number => {
    if (lvl === 1) return 10;
    if (lvl === 2) return 18;
    if (lvl === 3) return 30;
    if (lvl === 4) return 50;
    if (lvl === 5) return 80;
    if (lvl === 6) return 120;
    if (lvl === 7) return 180;
    if (lvl === 8) return 250;
    if (lvl === 9) return 380;
    return 500; // Cap at 500 nodes
  };

  const triggerGraphGeneration = () => {
    const worker = getWorker();
    const nodesCount = getNodesCountForLevel(level);

    setIsGenerating(true);
    worker.postMessage({ type: 'GENERATE_GRAPH', numNodes: nodesCount });
  };

  useEffect(() => {
    if (gameMode !== 'PLAYING') return;
    if (graph !== null) return;

    const worker = getWorker();

    const handleMessage = (event: MessageEvent<WorkerResponse>) => {
      const data = event.data;
      if (data && data.type === 'GRAPH_GENERATED') {
        setGraph(data.graph);
        setIsGenerating(false);
      }
    };

    worker.addEventListener('message', handleMessage);
    triggerGraphGeneration();

    return () => {
      worker.removeEventListener('message', handleMessage);
    };
  }, [level, gameMode, graph]);

  return { triggerGraphGeneration };
}
