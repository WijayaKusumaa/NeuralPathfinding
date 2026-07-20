import { useGameStore } from '../../store/gameStore';

interface HUDProps {
  onOpenSettings: () => void;
}

export function HUD({ onOpenSettings }: HUDProps) {
  const level = useGameStore((state) => state.level);
  const score = useGameStore((state) => state.score);
  const timer = useGameStore((state) => state.timer);
  const maxTime = useGameStore((state) => state.maxTime);
  const graph = useGameStore((state) => state.graph);
  const selectedPath = useGameStore((state) => state.selectedPath);
  const showHint = useGameStore((state) => state.showHint);
  
  const toggleHint = useGameStore((state) => state.toggleHint);
  const resetPath = useGameStore((state) => state.resetPath);
  const undoPath = useGameStore((state) => state.undoPath);
  const wrongSelection = useGameStore((state) => state.wrongSelection);

  // Calculate stats
  const timePercentage = (timer / maxTime) * 100;
  const isTimeLow = timer < 15;

  // Track player path cost/weight
  let currentPathWeight = 0;
  if (graph) {
    for (let i = 0; i < selectedPath.length - 1; i++) {
      const from = selectedPath[i];
      const to = selectedPath[i + 1];
      const edge = graph.edges.find(
        (e) => (e.from === from && e.to === to) || (e.from === to && e.to === from)
      );
      if (edge) currentPathWeight += edge.weight;
    }
  }

  // Display node count
  const nodeCount = graph ? graph.nodes.length : 0;

  return (
    <div className={`absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 transition-all duration-300 ${
      wrongSelection ? 'ring-8 ring-rose-600/35' : ''
    }`}>
      {/* Top Header Panel */}
      <div className="w-full flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-4 pointer-events-auto">
          {/* Level Display */}
          <div className="glass-panel px-4 py-2 rounded-xl flex flex-col items-center border border-white/5 relative min-w-[70px]">
            <span className="text-[9px] text-cyan-400 font-mono tracking-wider uppercase">Level</span>
            <span className="text-lg font-bold font-display text-white">{level}</span>
          </div>
 
          {/* Node Count Badge */}
          <div className="glass-panel px-4 py-2 rounded-xl hidden md:flex flex-col items-center border border-white/5 relative min-w-[80px]">
            <span className="text-[9px] text-slate-405 text-slate-400 font-mono tracking-wider uppercase">Synapses</span>
            <span className="text-lg font-bold font-display text-white">{nodeCount}</span>
          </div>
 
          {/* Path Weight Badge */}
          {graph && (
            <div className="glass-panel px-4 py-2 rounded-xl flex flex-col items-center border border-white/5 relative">
              <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase">Path Cost</span>
              <span className="text-lg font-bold font-display text-white">
                {Math.round(currentPathWeight * 10) / 10}
                <span className="text-slate-500 text-xs font-normal"> / {graph.shortestPathWeight}</span>
              </span>
            </div>
          )}
        </div>
 
        {/* Scoring Panel */}
        <div className="glass-panel px-6 py-2 rounded-xl flex flex-col items-end border border-white/5 relative pointer-events-auto">
          <span className="text-[9px] text-cyan-400 font-mono tracking-wider uppercase">System Score</span>
          <span className="text-xl font-black font-display text-white tracking-wider glow-text-cyan animate-pulse-glow">
            {score}
          </span>
        </div>
      </div>
 
      {/* Middle Alerts (Visual Indicators) */}
      <div className="w-full flex justify-center text-center">
        {wrongSelection && (
          <div className="glass-panel border-rose-500/30 px-5 py-2.5 rounded-full animate-bounce cyber-corners cyber-corners-rose">
            <span className="text-xs font-semibold tracking-widest text-rose-500 uppercase font-display">
              ⚠️ PATH DEVIATION DETECTED
            </span>
          </div>
        )}
      </div>
 
      {/* Bottom Interface Bar */}
      <div className="w-full flex flex-col md:flex-row items-center md:items-end justify-between gap-4 pointer-events-none">
        {/* Timer Countdown Bar */}
        <div className="w-full md:max-w-xs glass-panel p-3.5 rounded-2xl flex items-center space-x-4 border border-white/5 relative pointer-events-auto">
          <div className="flex flex-col flex-1">
            <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider mb-1.5">
              <span className={isTimeLow ? 'text-rose-500 animate-pulse font-bold' : 'text-slate-400'}>
                Time Remaining
              </span>
              <span className={isTimeLow ? 'text-rose-500 font-bold glow-text-rose' : 'text-white'}>
                {timer}s
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-1000 rounded-full ${
                  isTimeLow ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-cyan-400 shadow-[0_0_10px_#06b6d4]'
                }`}
                style={{ width: `${timePercentage}%` }}
              />
            </div>
          </div>
        </div>
 
        {/* Control Action Buttons */}
        <div className="flex items-center space-x-3 pointer-events-auto">
          <button
            onClick={undoPath}
            disabled={selectedPath.length <= 1}
            className="px-5 py-3 rounded-xl cyber-btn font-extrabold text-xs tracking-wider transition-all duration-300 uppercase disabled:opacity-40 disabled:pointer-events-none"
          >
            Undo Step
          </button>
          
          <button
            onClick={resetPath}
            disabled={selectedPath.length <= 1}
            className="px-5 py-3 rounded-xl cyber-btn cyber-btn-rose font-extrabold text-xs tracking-wider transition-all duration-300 uppercase disabled:opacity-40 disabled:pointer-events-none"
          >
            Reset Path
          </button>
 
          <button
            onClick={toggleHint}
            className={`px-5 py-3 rounded-xl cyber-btn font-extrabold text-xs tracking-wider transition-all duration-300 uppercase ${
              showHint
                ? 'border-fuchsia-500/60 text-white bg-fuchsia-500/20 shadow-[0_0_15px_rgba(217,70,239,0.35)]'
                : ''
            }`}
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
 
          <button
            onClick={onOpenSettings}
            className="p-3 rounded-xl border border-white/10 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 transition-all duration-300 cursor-pointer shadow-[0_0_10px_rgba(255,255,255,0.02)]"
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>
    </div>
  );
}
export default HUD;
