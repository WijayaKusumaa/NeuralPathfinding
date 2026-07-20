import { create } from 'zustand';
import type { Graph } from '../core/graph/GraphTypes';
import { AudioManager } from '../core/audio/AudioManager';

export type GameMode = 'START' | 'PLAYING' | 'LEVEL_CLEAR' | 'GAMEOVER';

interface GameState {
  // Game states
  gameMode: GameMode;
  level: number;
  score: number;
  highScore: number;
  timer: number;
  maxTime: number;
  graph: Graph | null;
  selectedPath: number[]; // path chosen by player
  isGenerating: boolean;
  showHint: boolean;
  wrongSelection: boolean; // visual feedback for wrong selection
  
  // Accessibility
  colorblindMode: boolean;
  nodeScale: number; // 1.0 to 2.0

  // Audio settings
  musicEnabled: boolean;
  sfxEnabled: boolean;

  // Actions
  setGameMode: (mode: GameMode) => void;
  startGame: () => void;
  setColorblindMode: (val: boolean) => void;
  setNodeScale: (val: number) => void;
  toggleHint: () => void;
  setGraph: (graph: Graph) => void;
  setIsGenerating: (val: boolean) => void;
  tickTimer: () => void;
  
  // Audio actions
  setMusicEnabled: (val: boolean) => void;
  setSfxEnabled: (val: boolean) => void;
  
  // Gameplay Actions
  selectNode: (nodeId: number) => void;
  resetPath: () => void;
  undoPath: () => void;
  nextLevel: () => void;
  retryLevel: () => void;
  quitGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  gameMode: 'START',
  level: 1,
  score: 0,
  highScore: parseInt(localStorage.getItem('np_highscore') || '0', 10),
  timer: 60,
  maxTime: 60,
  graph: null,
  selectedPath: [0],
  isGenerating: false,
  showHint: false,
  wrongSelection: false,
  colorblindMode: false,
  nodeScale: 1.2,
  musicEnabled: localStorage.getItem('np_music') !== 'false',
  sfxEnabled: localStorage.getItem('np_sfx') !== 'false',

  setGameMode: (gameMode) => set({ gameMode }),

  startGame: () => {
    // Setup and trigger synthesized audio
    AudioManager.init();
    const { musicEnabled, sfxEnabled } = get();
    AudioManager.setMusicEnabled(musicEnabled);
    AudioManager.setSfxEnabled(sfxEnabled);
    AudioManager.startMusic();
    AudioManager.playButtonClick();

    set({
      gameMode: 'PLAYING',
      level: 1,
      score: 0,
      graph: null,
      selectedPath: [0],
      showHint: false,
      wrongSelection: false,
    });
  },

  setColorblindMode: (colorblindMode) => set({ colorblindMode }),
  setNodeScale: (nodeScale) => set({ nodeScale }),
  toggleHint: () => set((state) => ({ showHint: !state.showHint })),
  
  setMusicEnabled: (musicEnabled) => {
    localStorage.setItem('np_music', musicEnabled.toString());
    AudioManager.setMusicEnabled(musicEnabled);
    set({ musicEnabled });
  },
  setSfxEnabled: (sfxEnabled) => {
    localStorage.setItem('np_sfx', sfxEnabled.toString());
    AudioManager.setSfxEnabled(sfxEnabled);
    set({ sfxEnabled });
  },
  
  setGraph: (graph) => {
    // Dynamic timer scaling: more nodes = more time
    const numNodes = graph.nodes.length;
    let timeLimit = 60;
    if (numNodes <= 20) timeLimit = 60;
    else if (numNodes <= 50) timeLimit = 90;
    else if (numNodes <= 150) timeLimit = 120;
    else if (numNodes <= 300) timeLimit = 180;
    else timeLimit = 240;

    // Reset audio tension to baseline
    AudioManager.updateTension(1.0);

    set({
      graph,
      timer: timeLimit,
      maxTime: timeLimit,
      selectedPath: [graph.startNodeId],
      wrongSelection: false,
      showHint: false,
    });
  },

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  tickTimer: () => {
    const { timer, maxTime, gameMode, graph, isGenerating } = get();
    if (gameMode !== 'PLAYING' || !graph || isGenerating) return;

    if (timer <= 1) {
      AudioManager.playGameOver();
      set({ gameMode: 'GAMEOVER' });
    } else {
      const nextTimer = timer - 1;
      AudioManager.updateTension(nextTimer / maxTime);
      set({ timer: nextTimer });
    }
  },

  selectNode: (nodeId) => {
    const { graph, selectedPath, gameMode } = get();
    console.log("selectNode called with nodeId:", nodeId, "currentLast:", selectedPath[selectedPath.length - 1], "gameMode:", gameMode);
    if (!graph || gameMode !== 'PLAYING') return;

    const currentLast = selectedPath[selectedPath.length - 1];

    // If tapping the current end of path, do nothing
    if (nodeId === currentLast) return;

    // If clicking a node that is already in the path, we can either backtrack to it or ignore.
    // Let's backtrack if they tap an earlier node in their path to allow correction.
    const indexInPath = selectedPath.indexOf(nodeId);
    if (indexInPath !== -1) {
      AudioManager.playButtonClick();
      set({
        selectedPath: selectedPath.slice(0, indexInPath + 1),
        wrongSelection: false,
      });
      return;
    }

    // Check if nodeId is a neighbor of currentLast
    const neighbors = graph.adjacencyList[currentLast] || [];
    const connection = neighbors.find((n) => n.node === nodeId);

    if (connection) {
      // Valid step spatially
      const newPath = [...selectedPath, nodeId];
      
      // Let's verify if this step is on the optimal path or not.
      // If we want to check efficiency, let's see if this edge exists in the remaining optimal shortest path
      // or if it deviates. If it deviates, we can trigger a short visual warning (wrongSelection).
      const optimalPath = graph.shortestPath;
      const stepIndex = selectedPath.length - 1;
      const isOptimalStep = optimalPath[stepIndex] === currentLast && optimalPath[stepIndex + 1] === nodeId;

      AudioManager.playNodeSelect(isOptimalStep);

      set({
        selectedPath: newPath,
        wrongSelection: !isOptimalStep,
      });

      // Check if End Node is reached
      if (nodeId === graph.endNodeId) {
        // Calculate player path total weight
        let playerWeight = 0;
        for (let i = 0; i < newPath.length - 1; i++) {
          const from = newPath[i];
          const to = newPath[i + 1];
          const edge = graph.edges.find(
            (e) => (e.from === from && e.to === to) || (e.from === to && e.to === from)
          );
          if (edge) playerWeight += edge.weight;
        }

        // Calculate score
        const { maxTime, timer, score, highScore } = get();
        const timeSpent = maxTime - timer;
        const optimalWeight = graph.shortestPathWeight;

        // Score formula: (optimal / player) * 1000 - timeSpent * penalizer
        const ratio = playerWeight > 0 ? (optimalWeight / playerWeight) : 0;
        const levelScore = Math.max(100, Math.floor(ratio * 1000 - timeSpent * 1.5));
        const newScore = score + levelScore;
        const newHighScore = Math.max(highScore, newScore);

        if (newHighScore > highScore) {
          localStorage.setItem('np_highscore', newHighScore.toString());
        }

        AudioManager.playLevelClear();

        set({
          score: newScore,
          highScore: newHighScore,
          gameMode: 'LEVEL_CLEAR',
        });
      }
    } else {
      // Nodes are not adjacent - flash red visual error
      AudioManager.playWrongConnection();
      set({ wrongSelection: true });
      setTimeout(() => {
        set({ wrongSelection: false });
      }, 500);
    }
  },

  resetPath: () => {
    const { graph } = get();
    if (!graph) return;
    AudioManager.playButtonClick();
    set({
      selectedPath: [graph.startNodeId],
      wrongSelection: false,
    });
  },

  undoPath: () => {
    const { selectedPath, graph } = get();
    if (!graph || selectedPath.length <= 1) return;
    AudioManager.playButtonClick();
    set({
      selectedPath: selectedPath.slice(0, -1),
      wrongSelection: false,
    });
  },

  nextLevel: () => {
    AudioManager.playButtonClick();
    AudioManager.startMusic();
    set((state) => ({
      level: state.level + 1,
      gameMode: 'PLAYING',
      wrongSelection: false,
      graph: null,
    }));
  },

  retryLevel: () => {
    AudioManager.init();
    const { musicEnabled, sfxEnabled } = get();
    AudioManager.setMusicEnabled(musicEnabled);
    AudioManager.setSfxEnabled(sfxEnabled);
    AudioManager.startMusic();
    AudioManager.playButtonClick();
    AudioManager.updateTension(1.0);

    set({
      gameMode: 'PLAYING',
      graph: null,
      wrongSelection: false,
      showHint: false,
    });
  },

  quitGame: () => {
    AudioManager.playButtonClick();
    AudioManager.stopMusic();
    set({
      gameMode: 'START',
      level: 1,
      score: 0,
      graph: null,
      selectedPath: [0],
      showHint: false,
    });
  },
}));
