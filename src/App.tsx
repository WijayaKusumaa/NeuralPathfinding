import { useState } from 'react';
import { useGameStore } from './store/gameStore';
import { useGraph } from './hooks/useGraph';
import { useGameTimer } from './hooks/useGameTimer';
import GraphScene from './components/scene/GraphScene';
import HUD from './components/hud/HUD';
import Minimap from './components/hud/Minimap';
import LevelTransition from './components/hud/LevelTransition';
import StartScreen from './components/ui/StartScreen';
import GameOverScreen from './components/ui/GameOverScreen';
import SettingsPanel from './components/ui/SettingsPanel';

function App() {
  const gameMode = useGameStore((state) => state.gameMode);
  const startGame = useGameStore((state) => state.startGame);
  const retryLevel = useGameStore((state) => state.retryLevel);
  const [showSettings, setShowSettings] = useState(false);

  // Initialize hooks to process graph generation and timing loops
  useGraph();
  useGameTimer();

  const handleStartGame = () => {
    startGame();
  };

  const handleRestart = () => {
    retryLevel();
  };

  return (
    <div className="w-full h-full relative overflow-hidden select-none">
      {/* 1. Main Game Screens depending on gameMode */}
      {gameMode === 'START' && (
        <StartScreen onStart={handleStartGame} />
      )}

      {gameMode === 'GAMEOVER' && (
        <GameOverScreen onRestart={handleRestart} />
      )}

      {/* 2. Interactive Scene and overlays during PLAYING or LEVEL_CLEAR */}
      {(gameMode === 'PLAYING' || gameMode === 'LEVEL_CLEAR') && (
        <>
          <div className="w-full h-full relative">
            <GraphScene />
          </div>

          <HUD onOpenSettings={() => setShowSettings(true)} />
          
          <Minimap />

          {gameMode === 'LEVEL_CLEAR' && (
            <LevelTransition />
          )}
        </>
      )}

      {/* 3. Settings Overlay Panel */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App;
