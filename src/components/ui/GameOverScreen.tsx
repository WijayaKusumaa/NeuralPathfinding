import { useGameStore } from '../../store/gameStore';

interface GameOverScreenProps {
  onRestart: () => void;
}

export function GameOverScreen({ onRestart }: GameOverScreenProps) {
  const score = useGameStore((state) => state.score);
  const highScore = useGameStore((state) => state.highScore);
  const level = useGameStore((state) => state.level);
  const quitGame = useGameStore((state) => state.quitGame);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070304]/95 p-4 scanline">
      <div className="w-full max-w-md p-8 md:p-10 rounded-3xl glass-panel-glow border border-rose-500/25 text-center relative overflow-hidden animate-fade-in flex flex-col items-center cyber-corners cyber-corners-rose">
        {/* Error Badge */}
        <div className="px-3.5 py-1.5 rounded-full border border-rose-500/30 bg-rose-950/20 text-rose-500 font-mono text-[9px] tracking-widest uppercase mb-6 animate-pulse">
          SYSTEM ERROR: SYNC INTERVAL EXPIRED
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-wider text-white font-display mb-8 glow-text-rose">
          CONNECTION TERMINATED
        </h1>

        {/* Score Grid */}
        <div className="w-full grid grid-cols-2 gap-4 mb-8">
          <div className="glass-panel p-4.5 rounded-2xl flex flex-col items-center border border-white/5 relative">
            <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase mb-1">
              Final Score
            </span>
            <span className="text-3xl font-extrabold font-display text-white">
              {score}
            </span>
          </div>

          <div className="glass-panel p-4.5 rounded-2xl flex flex-col items-center border border-white/5 relative">
            <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase mb-1">
              Max Level
            </span>
            <span className="text-3xl font-extrabold font-display text-rose-500 glow-text-rose">
              {level}
            </span>
          </div>
        </div>

        {score >= highScore && score > 0 && (
          <div className="mb-8 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl animate-pulse">
            <span className="text-emerald-400 text-xs font-mono font-semibold tracking-widest uppercase">
              🔥 NEW SYSTEM HIGH RECORD!
            </span>
          </div>
        )}

        {/* Retry/Exit buttons */}
        <div className="w-full space-y-4">
          <button
            onClick={onRestart}
            className="w-full py-4 rounded-xl cyber-btn cyber-btn-rose text-white font-extrabold text-xs tracking-widest uppercase transition-all duration-300 transform active:scale-95 shadow-[0_0_20px_rgba(244,63,94,0.2)] hover:shadow-[0_0_30px_rgba(244,63,94,0.4)] cursor-pointer text-center"
          >
            Re-Establish Synapse Link
          </button>
          
          <button
            onClick={quitGame}
            className="w-full py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white font-semibold text-xs tracking-wider uppercase transition-all duration-300 bg-slate-900/30 hover:bg-slate-800/50 cursor-pointer text-center"
          >
            Return to Node Core
          </button>
        </div>
      </div>
    </div>
  );
}
export default GameOverScreen;
