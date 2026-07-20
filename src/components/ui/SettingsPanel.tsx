import { useGameStore } from '../../store/gameStore';

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const colorblindMode = useGameStore((state) => state.colorblindMode);
  const setColorblindMode = useGameStore((state) => state.setColorblindMode);
  const nodeScale = useGameStore((state) => state.nodeScale);
  const setNodeScale = useGameStore((state) => state.setNodeScale);
  const musicEnabled = useGameStore((state) => state.musicEnabled);
  const setMusicEnabled = useGameStore((state) => state.setMusicEnabled);
  const sfxEnabled = useGameStore((state) => state.sfxEnabled);
  const setSfxEnabled = useGameStore((state) => state.setSfxEnabled);
  const quitGame = useGameStore((state) => state.quitGame);

  const handleResetHighscore = () => {
    if (confirm('Reset your highscore?')) {
      localStorage.removeItem('np_highscore');
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md p-8 rounded-2xl glass-panel-glow border border-cyan-500/20 text-slate-200 cyber-corners">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <h2 className="text-xl font-bold tracking-wider text-cyan-400 font-display glow-text-cyan">
            SYSTEM PARAMETERS
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Node Size Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold tracking-wider uppercase text-slate-400">
              <span>Synapse Node Size</span>
              <span className="text-cyan-400">{Math.round(nodeScale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.0"
              step="0.1"
              value={nodeScale}
              onChange={(e) => setNodeScale(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-white/5"
            />
            <p className="text-[10px] text-slate-500">
              Increase node scale for easier tapping on smaller displays.
            </p>
          </div>

          <div className="h-px bg-white/5" />

          {/* Background Music Toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <span className="block text-xs font-semibold tracking-wider uppercase text-slate-350 text-slate-300">
                Tense Background Music
              </span>
              <span className="text-[10px] text-slate-500">
                Procedural heartbeat & reactor drone.
              </span>
            </div>
            <button
              onClick={() => setMusicEnabled(!musicEnabled)}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                musicEnabled ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'bg-slate-900 border border-white/5'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  musicEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <span className="block text-xs font-semibold tracking-wider uppercase text-slate-350 text-slate-300">
                Feedback Sound Effects
              </span>
              <span className="text-[10px] text-slate-500">
                Audio ticks on clicks, errors & level clears.
              </span>
            </div>
            <button
              onClick={() => setSfxEnabled(!sfxEnabled)}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                sfxEnabled ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'bg-slate-900 border border-white/5'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  sfxEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Colorblind Toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <span className="block text-xs font-semibold tracking-wider uppercase text-slate-350 text-slate-300">
                Colorblind Palette
              </span>
              <span className="text-[10px] text-slate-500">
                High-contrast node and pathway coloring.
              </span>
            </div>
            <button
              onClick={() => setColorblindMode(!colorblindMode)}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                colorblindMode ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'bg-slate-900 border border-white/5'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  colorblindMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-white/5 my-4" />

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleResetHighscore}
              className="w-full py-2.5 rounded-lg border border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/5 text-rose-400 text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer text-center"
            >
              Reset Highscore
            </button>
            <button
              onClick={() => {
                quitGame();
                onClose();
              }}
              className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-wider uppercase border border-white/5 transition-all duration-200 cursor-pointer text-center"
            >
              Exit to Main Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SettingsPanel;
