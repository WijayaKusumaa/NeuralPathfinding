import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store/gameStore';

export function LevelTransition() {
  const gameMode = useGameStore((state) => state.gameMode);
  const level = useGameStore((state) => state.level);
  const timer = useGameStore((state) => state.timer);
  const maxTime = useGameStore((state) => state.maxTime);
  const graph = useGameStore((state) => state.graph);
  const selectedPath = useGameStore((state) => state.selectedPath);
  const nextLevel = useGameStore((state) => state.nextLevel);

  useEffect(() => {
    if (gameMode === 'LEVEL_CLEAR') {
      // Fire confetti bursts!
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 100 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 40 * (timeLeft / duration);
        // source left/right edges
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [gameMode]);

  if (gameMode !== 'LEVEL_CLEAR' || !graph) return null;

  // Compute final details
  const timeSpent = maxTime - timer;
  
  let playerWeight = 0;
  for (let i = 0; i < selectedPath.length - 1; i++) {
    const from = selectedPath[i];
    const to = selectedPath[i + 1];
    const edge = graph.edges.find(
      (e) => (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
    if (edge) playerWeight += edge.weight;
  }
  playerWeight = Math.round(playerWeight * 10) / 10;

  const optimalWeight = graph.shortestPathWeight;
  const pathEfficiency = Math.round((optimalWeight / playerWeight) * 100);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md transition-all duration-300">
      <div className="w-full max-w-lg p-8 md:p-10 rounded-3xl glass-panel-glow border border-cyan-500/25 text-center relative overflow-hidden scanline cyber-corners">
        
        {/* Subtitle */}
        <div className="text-cyan-400 font-mono tracking-widest text-xs font-semibold uppercase mb-2 animate-pulse-glow">
          TRANSMISSION SECURED
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-wider text-white font-display mb-8 glow-text-cyan">
          SYNAPSE LINK COMPLETED
        </h1>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="glass-panel p-4.5 rounded-2xl flex flex-col items-center border border-white/5 relative">
            <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase mb-1">
              Path Efficiency
            </span>
            <span className={`text-2xl font-bold font-display ${pathEfficiency >= 95 ? 'text-emerald-400 glow-text-cyan' : 'text-amber-400'}`}>
              {pathEfficiency}%
            </span>
          </div>

          <div className="glass-panel p-4.5 rounded-2xl flex flex-col items-center border border-white/5 relative">
            <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase mb-1">
              Time Elapsed
            </span>
            <span className="text-2xl font-bold font-display text-white">
              {timeSpent}s
            </span>
          </div>

          <div className="glass-panel p-4.5 rounded-2xl flex flex-col items-center border border-white/5 relative">
            <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase mb-1">
              Your Route Cost
            </span>
            <span className="text-2xl font-bold font-display text-slate-200">
              {playerWeight}
            </span>
          </div>

          <div className="glass-panel p-4.5 rounded-2xl flex flex-col items-center border border-white/5 relative">
            <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase mb-1">
              Optimal Cost
            </span>
            <span className="text-2xl font-bold font-display text-cyan-400 glow-text-cyan">
              {optimalWeight}
            </span>
          </div>
        </div>

        {/* Efficiency evaluation text */}
        <div className="text-xs font-mono text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed border-t border-white/5 pt-4">
          {pathEfficiency >= 98
            ? '🚀 Absolute Optimization! Perfect topology routing mapping.'
            : pathEfficiency >= 85
            ? '⚡ Strong routing capacity. Try to find the exact shortest path next time!'
            : '⚠️ Route connected, but sub-optimal pathways detected. Optimization score penalized.'}
        </div>

        {/* Action Button */}
        <button
          onClick={nextLevel}
          className="w-full md:w-auto px-10 py-4 rounded-xl cyber-btn text-white font-extrabold text-xs tracking-widest uppercase transition-all duration-300 transform active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.45)] cursor-pointer"
        >
          Initialize Next Level (Lvl {level + 1}) →
        </button>

      </div>
    </div>
  );
}
export default LevelTransition;
