import { useGameStore } from '../../store/gameStore';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const highScore = useGameStore((state) => state.highScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050608] p-4 overflow-hidden scanline">
      {/* Decorative Network Grid Particles Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none" />
      
      {/* Decorative background grid */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      <div className="w-full max-w-2xl p-8 md:p-12 rounded-3xl glass-panel-glow border border-cyan-500/20 text-center relative overflow-hidden animate-fade-in flex flex-col items-center cyber-corners">
        {/* Glowing Badge */}
        <div className="px-4 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-950/30 text-cyan-400 font-mono text-[9px] tracking-widest uppercase mb-6 animate-pulse-glow">
          COGNITIVE TOPOLOGY SYSTEM v2.5
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-wider text-white font-display mb-1 glow-text-cyan">
          NEURAL PATHFINDING
        </h1>
        <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mb-8" />

        {/* Game Info Panel */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel py-3.5 px-3 rounded-xl border border-white/5 relative">
            <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-0.5">Difficulty</span>
            <span className="text-xs font-bold text-rose-500 font-display tracking-wide">GRANDMASTER</span>
          </div>
          <div className="glass-panel py-3.5 px-3 rounded-xl border border-white/5 relative">
            <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-0.5">Target</span>
            <span className="text-xs font-bold text-cyan-400 font-display tracking-wide">ROUTE OPTIM</span>
          </div>
          <div className="glass-panel py-3.5 px-3 rounded-xl border border-white/5 relative">
            <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-0.5">Horizon</span>
            <span className="text-xs font-bold text-indigo-400 font-display tracking-wide">3 - 5 MINS</span>
          </div>
          <div className="glass-panel py-3.5 px-3 rounded-xl border border-white/5 relative">
            <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-0.5">Record High</span>
            <span className="text-xs font-bold text-emerald-400 font-mono tracking-wide glow-text-cyan">{highScore}</span>
          </div>
        </div>

        {/* Rules & Manual */}
        <div className="w-full text-left space-y-4 mb-10 max-w-lg">
          <h3 className="text-xs font-bold font-display tracking-widest text-slate-400 uppercase pb-2 border-b border-white/5">
            // OPERATIONAL INSTRUCTIONS
          </h3>
          <ul className="space-y-3.5 text-xs md:text-sm text-slate-400 font-sans leading-relaxed">
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2.5 font-mono font-bold text-xs bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">01</span>
              <span>Connect the network by linking node nodes sequentially from <strong className="text-emerald-400 font-semibold">Start (Green)</strong> to <strong className="text-rose-500 font-semibold">End (Red)</strong>.</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2.5 font-mono font-bold text-xs bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">02</span>
              <span>Edges carry transmission costs (weights). Your goal is to map the path with the lowest overall cost.</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2.5 font-mono font-bold text-xs bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">03</span>
              <span>Deviation from optimal paths or non-adjacent taps trigger system penalties. Be fast yet precise.</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2.5 font-mono font-bold text-xs bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">04</span>
              <span>Complexity scales procedural topologies up to 500-node networks as level rises.</span>
            </li>
          </ul>
        </div>

        {/* Start Game Action */}
        <button
          onClick={onStart}
          className="px-12 py-4 rounded-xl cyber-btn text-white font-extrabold text-xs tracking-widest uppercase transition-all duration-300 transform active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] cursor-pointer text-center"
        >
          INITIALIZE COGNITIVE SYNC
        </button>
      </div>

      {/* Subtle Copyright Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none opacity-45">
        <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
          © {new Date().getFullYear()} WIJAYAKUSUMA. ALL RIGHTS RESERVED.
        </span>
      </div>
    </div>
  );
}
export default StartScreen;
