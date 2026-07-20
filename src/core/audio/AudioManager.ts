// Procedural Audio Engine for Neural Pathfinding
// Synthesizes tense cyberpunk drones, dynamic heartbeats, and sci-fi click chimes using Web Audio API

class AudioManagerClass {
  private ctx: AudioContext | null = null;
  
  // Settings
  private musicEnabled: boolean = true;
  private sfxEnabled: boolean = true;
  
  // Audio Nodes for Background Drone
  private droneGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private padGain: GainNode | null = null;
  private padOsc1: OscillatorNode | null = null;
  private padOsc2: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  
  // Heartbeat variables
  private heartbeatTimer: number | null = null;
  private heartbeatInterval: number = 1200; // ms between heartbeats
  private tension: number = 0; // 0 to 1
  
  init() {
    if (this.ctx) return;
    
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      
      // Initialize background nodes if context successfully created
      this.setupDroneNodes();
      
      if (this.musicEnabled) {
        this.startDrone();
        this.startHeartbeatLoop();
      }
    } catch (e) {
      console.warn('Failed to initialize Web Audio API:', e);
    }
  }

  private setupDroneNodes() {
    if (!this.ctx) return;

    // Create drone gain & lowpass filter
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0; // start silent, fade in
    
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 85; // very low cutoff

    // Dual low triangle oscillators for a detuned chorus drone
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'triangle';
    this.droneOsc1.frequency.value = 55; // A1
    
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.value = 55.4; // detuned

    // Connect drone
    this.droneOsc1.connect(lowpass);
    this.droneOsc2.connect(lowpass);
    lowpass.connect(this.droneGain);
    this.droneGain.connect(this.ctx.destination);

    // Create Discordant Pad nodes (eerie atmosphere)
    this.padGain = this.ctx.createGain();
    this.padGain.gain.value = 0;

    const padFilter = this.ctx.createBiquadFilter();
    padFilter.type = 'bandpass';
    padFilter.frequency.value = 440;
    padFilter.Q.value = 1.0;

    this.padOsc1 = this.ctx.createOscillator();
    this.padOsc1.type = 'sine';
    this.padOsc1.frequency.value = 110; // A2

    this.padOsc2 = this.ctx.createOscillator();
    this.padOsc2.type = 'sine';
    this.padOsc2.frequency.value = 116.5; // Bb2 (minor second, very tense)

    // LFO to slowly sweep filter/gain for breathing effect
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = 0.08; // extremely slow LFO (12.5 seconds per cycle)

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.03; // small gain modulation range

    // Connect pad
    this.padOsc1.connect(padFilter);
    this.padOsc2.connect(padFilter);
    padFilter.connect(this.padGain);
    this.padGain.connect(this.ctx.destination);
    
    // Connect LFO to modulate pad gain for a swelling effect
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.padGain.gain);

    // Start oscillators
    this.droneOsc1.start();
    this.droneOsc2.start();
    this.padOsc1.start();
    this.padOsc2.start();
    this.lfo.start();
  }

  // Settings Setters
  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!this.ctx) return;
    
    if (enabled) {
      this.resumeContext().then(() => {
        this.startDrone();
        this.startHeartbeatLoop();
      });
    } else {
      this.stopDrone();
      this.stopHeartbeatLoop();
    }
  }

  setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  startMusic() {
    if (!this.ctx) return;
    if (this.musicEnabled) {
      this.resumeContext().then(() => {
        this.startDrone();
        this.startHeartbeatLoop();
      });
    }
  }

  stopMusic() {
    this.stopDrone();
    this.stopHeartbeatLoop();
  }

  private async resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  private startDrone() {
    if (!this.ctx || !this.droneGain || !this.padGain) return;
    
    const now = this.ctx.currentTime;
    // Fade in low drone
    this.droneGain.gain.cancelScheduledValues(now);
    this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
    this.droneGain.gain.linearRampToValueAtTime(0.35, now + 3);

    // Fade in eerie pad
    this.padGain.gain.cancelScheduledValues(now);
    this.padGain.gain.setValueAtTime(this.padGain.gain.value, now);
    this.padGain.gain.linearRampToValueAtTime(0.04, now + 4);
  }

  private stopDrone() {
    if (!this.ctx || !this.droneGain || !this.padGain) return;

    const now = this.ctx.currentTime;
    // Fade out drone quickly
    this.droneGain.gain.cancelScheduledValues(now);
    this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
    this.droneGain.gain.linearRampToValueAtTime(0, now + 0.8);

    // Fade out pad
    this.padGain.gain.cancelScheduledValues(now);
    this.padGain.gain.setValueAtTime(this.padGain.gain.value, now);
    this.padGain.gain.linearRampToValueAtTime(0, now + 0.8);
  }

  // Tension Control (called when timer ticks)
  // ratio goes from 1.0 (full time) to 0.0 (expired)
  updateTension(ratio: number) {
    this.tension = 1 - ratio; // tension rises as ratio drops
    
    // Scale heartbeat speed: from 1200ms down to 350ms
    const targetInterval = Math.max(350, 1200 - this.tension * 850);
    this.heartbeatInterval = targetInterval;
    
    // Slightly adjust pad frequencies to increase dissonance under high tension
    if (this.padOsc2 && this.ctx) {
      const now = this.ctx.currentTime;
      // modulate detuning under high tension
      const detuneValue = this.tension * 15; // pitch up to 15 cents sharp
      this.padOsc2.detune.setValueAtTime(detuneValue, now);
    }
  }

  // Heartbeat procedural generator (lub-dub)
  private startHeartbeatLoop() {
    this.stopHeartbeatLoop();
    if (!this.musicEnabled) return;

    const runHeartbeat = () => {
      this.playHeartbeatTicks();
      this.heartbeatTimer = setTimeout(runHeartbeat, this.heartbeatInterval) as any;
    };

    this.heartbeatTimer = setTimeout(runHeartbeat, this.heartbeatInterval) as any;
  }

  private stopHeartbeatLoop() {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private playHeartbeatTicks() {
    if (!this.ctx || !this.musicEnabled || this.ctx.state !== 'running') return;
    
    const now = this.ctx.currentTime;
    
    // Beat 1: "Lub"
    this.synthesizeHeartthud(now, 50 + this.tension * 15, 0.12, 0.45);
    
    // Beat 2: "Dub" (slightly higher pitch, slightly louder, 150ms later)
    this.synthesizeHeartthud(now + 0.16, 56 + this.tension * 18, 0.12, 0.55);
  }

  private synthesizeHeartthud(time: number, pitch: number, duration: number, volume: number) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    // Sweeps pitch downwards to create a thud
    osc.frequency.setValueAtTime(pitch, time);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, time + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(80, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume * 0.12, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  // SFX Players
  playNodeHover() {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resumeContext();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3200, now);
    
    gain.gain.setValueAtTime(0.005, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.02);
  }

  playNodeSelect(isOptimal: boolean) {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resumeContext();

    const now = this.ctx.currentTime;
    
    if (isOptimal) {
      // Play a beautiful metallic bell chime (harmonic)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174.66, now); // D6 (harmonic)

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
    } else {
      // Play a quick pitch warning dip
      this.playWarningBuzzer();
    }
  }

  playWrongConnection() {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resumeContext();
    this.playWarningBuzzer();
  }

  private playWarningBuzzer() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.25);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  playButtonClick() {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resumeContext();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  playLevelClear() {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resumeContext();

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major scale arpeggio
    
    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.06;
      
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.06, noteTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.2);
    });
  }

  playGameOver() {
    if (!this.ctx) return;
    this.resumeContext();
    this.stopDrone();
    this.stopHeartbeatLoop();
    
    if (!this.sfxEnabled) return;

    const now = this.ctx.currentTime;
    
    // Descending power down pitch sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(20, now + 1.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(20, now + 1.2);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.3);
  }
}

export const AudioManager = new AudioManagerClass();
export default AudioManager;
