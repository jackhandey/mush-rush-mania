// SoundManager - Pre-loads and manages audio for native Android/iOS
// Supports .ogg (low latency effects) and .mp3 (background music)

type SoundName = 
  | 'launch' | 'launchLoud' | 'boing' | 'thwack' | 'crash'
  | 'shock' | 'spaceship' | 'ghost' | 'annoying' | 'suck' | 'humanSigh'
  | 'kidsLaugh' | 'ratchet' | 'lightsaber' | 'nerdy' | 'scaryUpbeat'
  | 'fiery' | 'hulk' | 'sword' | 'staircase' | 'love' | 'recordScratch'
  | 'policeSiren' | 'pacman' | 'pokemon' | 'punkGuitar' | 'traffic' | 'ocean';

interface SoundConfig {
  path: string;
  volume: number;
  fallback?: () => void;
}

class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundName, HTMLAudioElement[]> = new Map();
  private isMuted: boolean = false;
  private isLoaded: boolean = false;
  private poolSize: number = 3; // Audio pool for overlapping sounds

  // Sound configuration - paths relative to public folder
  private soundConfigs: Record<SoundName, SoundConfig> = {
    launch: { path: '/assets/sounds/launch.ogg', volume: 0.5 },
    launchLoud: { path: '/assets/sounds/launch-loud.ogg', volume: 0.8 },
    boing: { path: '/assets/sounds/boing.ogg', volume: 0.6 },
    thwack: { path: '/assets/sounds/thwack.ogg', volume: 0.5 },
    crash: { path: '/assets/sounds/crash.ogg', volume: 0.7 },
    shock: { path: '/assets/sounds/shock.ogg', volume: 0.5 },
    spaceship: { path: '/assets/sounds/spaceship.ogg', volume: 0.5 },
    ghost: { path: '/assets/sounds/ghost.ogg', volume: 0.5 },
    annoying: { path: '/assets/sounds/annoying.ogg', volume: 0.4 },
    suck: { path: '/assets/sounds/suck.ogg', volume: 0.6 },
    humanSigh: { path: '/assets/sounds/human-sigh.ogg', volume: 0.5 },
    kidsLaugh: { path: '/assets/sounds/kids-laugh.ogg', volume: 0.5 },
    ratchet: { path: '/assets/sounds/ratchet.ogg', volume: 0.5 },
    lightsaber: { path: '/assets/sounds/lightsaber.ogg', volume: 0.5 },
    nerdy: { path: '/assets/sounds/nerdy.ogg', volume: 0.5 },
    scaryUpbeat: { path: '/assets/sounds/scary-upbeat.ogg', volume: 0.5 },
    fiery: { path: '/assets/sounds/fiery.ogg', volume: 0.5 },
    hulk: { path: '/assets/sounds/hulk.ogg', volume: 0.5 },
    sword: { path: '/assets/sounds/sword.ogg', volume: 0.5 },
    staircase: { path: '/assets/sounds/staircase.ogg', volume: 0.5 },
    love: { path: '/assets/sounds/love.ogg', volume: 0.5 },
    recordScratch: { path: '/assets/sounds/record-scratch.ogg', volume: 0.5 },
    policeSiren: { path: '/assets/sounds/police-siren.ogg', volume: 0.5 },
    pacman: { path: '/assets/sounds/pacman.ogg', volume: 0.5 },
    pokemon: { path: '/assets/sounds/pokemon.ogg', volume: 0.5 },
    punkGuitar: { path: '/assets/sounds/punk-guitar.ogg', volume: 0.5 },
    traffic: { path: '/assets/sounds/traffic.ogg', volume: 0.5 },
    ocean: { path: '/assets/sounds/ocean.ogg', volume: 0.5 },
  };

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Pre-load all sound files
  async preload(): Promise<void> {
    if (this.isLoaded) return;

    const loadPromises: Promise<void>[] = [];

    for (const [name, config] of Object.entries(this.soundConfigs)) {
      loadPromises.push(this.loadSound(name as SoundName, config.path));
    }

    await Promise.allSettled(loadPromises);
    this.isLoaded = true;
    console.log('SoundManager: All sounds preloaded');
  }

  private async loadSound(name: SoundName, path: string): Promise<void> {
    const pool: HTMLAudioElement[] = [];
    
    for (let i = 0; i < this.poolSize; i++) {
      const audio = new Audio();
      audio.preload = 'auto';
      
      // Try .ogg first, fallback to .mp3
      const oggPath = path;
      const mp3Path = path.replace('.ogg', '.mp3');
      
      await new Promise<void>((resolve) => {
        audio.oncanplaythrough = () => resolve();
        audio.onerror = () => {
          // Try mp3 fallback
          audio.src = mp3Path;
          audio.oncanplaythrough = () => resolve();
          audio.onerror = () => resolve(); // Silently fail, will use Web Audio fallback
        };
        audio.src = oggPath;
      });
      
      pool.push(audio);
    }
    
    this.sounds.set(name, pool);
  }

  private playFromPool(name: SoundName): boolean {
    const pool = this.sounds.get(name);
    if (!pool || pool.length === 0) return false;

    const config = this.soundConfigs[name];
    
    // Find an audio element that's not playing
    for (const audio of pool) {
      if (audio.paused || audio.ended) {
        audio.currentTime = 0;
        audio.volume = config.volume;
        audio.play().catch(() => {}); // Ignore autoplay restrictions
        return true;
      }
    }
    
    // All busy, reset first one
    const audio = pool[0];
    audio.currentTime = 0;
    audio.volume = config.volume;
    audio.play().catch(() => {});
    return true;
  }

  // Play sound with Web Audio fallback
  private play(name: SoundName, fallbackFn?: () => void): void {
    if (this.isMuted) return;
    
    // Try pre-loaded audio first
    if (this.playFromPool(name)) return;
    
    // Fall back to Web Audio API synthesis
    if (fallbackFn) fallbackFn();
  }

  // ========== PUBLIC PLAY METHODS ==========

  playLaunch(): void {
    this.play('launch', () => this.synthLaunch());
  }

  playLaunchLoud(): void {
    this.play('launchLoud', () => this.synthLaunchLoud());
  }

  playBoing(): void {
    this.play('boing', () => this.synthBoing());
  }

  playThwack(): void {
    this.play('thwack', () => this.synthThwack());
  }

  playCrash(): void {
    this.play('crash', () => this.synthCrash());
  }

  playShock(): void {
    this.play('shock', () => this.synthShock());
  }

  playSpaceship(): void {
    this.play('spaceship', () => this.synthSpaceship());
  }

  playGhost(): void {
    this.play('ghost', () => this.synthGhost());
  }

  playAnnoying(): void {
    this.play('annoying', () => this.synthAnnoying());
  }

  playSuck(): void {
    this.play('suck', () => this.synthSuck());
  }

  playHumanSigh(): void {
    this.play('humanSigh', () => this.synthHumanSigh());
  }

  playKidsLaugh(): void {
    this.play('kidsLaugh', () => this.synthKidsLaugh());
  }

  playRatchet(): void {
    this.play('ratchet', () => this.synthRatchet());
  }

  playLightsaber(): void {
    this.play('lightsaber', () => this.synthLightsaber());
  }

  playNerdy(): void {
    this.play('nerdy', () => this.synthNerdy());
  }

  playScaryUpbeat(): void {
    this.play('scaryUpbeat', () => this.synthScaryUpbeat());
  }

  playFiery(): void {
    this.play('fiery', () => this.synthFiery());
  }

  playHulk(): void {
    this.play('hulk', () => this.synthHulk());
  }

  playSword(): void {
    this.play('sword', () => this.synthSword());
  }

  playStaircase(): void {
    this.play('staircase', () => this.synthStaircase());
  }

  playLove(): void {
    this.play('love', () => this.synthLove());
  }

  playRecordScratch(): void {
    this.play('recordScratch', () => this.synthRecordScratch());
  }

  playPoliceSiren(): void {
    this.play('policeSiren', () => this.synthPoliceSiren());
  }

  playPacman(): void {
    this.play('pacman', () => this.synthPacman());
  }

  playPokemon(): void {
    this.play('pokemon', () => this.synthPokemon());
  }

  playPunkGuitar(): void {
    this.play('punkGuitar', () => this.synthPunkGuitar());
  }

  playTraffic(): void {
    this.play('traffic', () => this.synthTraffic());
  }

  playOcean(): void {
    this.play('ocean', () => this.synthOcean());
  }

  // ========== MUTE CONTROL ==========

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  // ========== WEB AUDIO FALLBACK SYNTHESIZERS ==========

  private synthBoing(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.connect(thudGain);
    thudGain.connect(ctx.destination);
    thud.frequency.setValueAtTime(65, now);
    thud.frequency.exponentialRampToValueAtTime(35, now + 0.14);
    thud.type = 'sine';
    thudGain.gain.setValueAtTime(0.25, now);
    thudGain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
    
    const pop = ctx.createOscillator();
    const popGain = ctx.createGain();
    pop.connect(popGain);
    popGain.connect(ctx.destination);
    pop.frequency.setValueAtTime(900, now);
    pop.frequency.exponentialRampToValueAtTime(350, now + 0.035);
    pop.type = 'sine';
    popGain.gain.setValueAtTime(0.04, now);
    popGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    
    thud.start(now);
    pop.start(now);
    thud.stop(now + 0.16);
    pop.stop(now + 0.04);
  }

  private synthLaunch(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const push = ctx.createOscillator();
    const pushGain = ctx.createGain();
    push.connect(pushGain);
    pushGain.connect(ctx.destination);
    push.frequency.setValueAtTime(55, now);
    push.frequency.exponentialRampToValueAtTime(110, now + 0.09);
    push.type = 'sine';
    pushGain.gain.setValueAtTime(0.22, now);
    pushGain.gain.exponentialRampToValueAtTime(0.01, now + 0.13);
    
    const breath = ctx.createOscillator();
    const breathGain = ctx.createGain();
    breath.connect(breathGain);
    breathGain.connect(ctx.destination);
    breath.frequency.setValueAtTime(700, now);
    breath.frequency.exponentialRampToValueAtTime(1100, now + 0.05);
    breath.type = 'sine';
    breathGain.gain.setValueAtTime(0.035, now);
    breathGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
    
    push.start(now);
    breath.start(now);
    push.stop(now + 0.13);
    breath.stop(now + 0.06);
  }

  private synthLaunchLoud(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const push = ctx.createOscillator();
    const pushGain = ctx.createGain();
    push.connect(pushGain);
    pushGain.connect(ctx.destination);
    push.frequency.setValueAtTime(55, now);
    push.frequency.exponentialRampToValueAtTime(110, now + 0.09);
    push.type = 'sine';
    pushGain.gain.setValueAtTime(0.6, now);
    pushGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    
    const breath = ctx.createOscillator();
    const breathGain = ctx.createGain();
    breath.connect(breathGain);
    breathGain.connect(ctx.destination);
    breath.frequency.setValueAtTime(700, now);
    breath.frequency.exponentialRampToValueAtTime(1100, now + 0.05);
    breath.type = 'sine';
    breathGain.gain.setValueAtTime(0.12, now);
    breathGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    
    push.start(now);
    breath.start(now);
    push.stop(now + 0.18);
    breath.stop(now + 0.08);
  }

  private synthThwack(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc1.frequency.setValueAtTime(100, now);
    osc1.frequency.exponentialRampToValueAtTime(60, now + 0.08);
    osc1.frequency.exponentialRampToValueAtTime(85, now + 0.16);
    osc1.type = 'sine';
    
    osc2.frequency.setValueAtTime(150, now);
    osc2.frequency.exponentialRampToValueAtTime(90, now + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(120, now + 0.16);
    osc2.type = 'triangle';
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.18);
    osc2.stop(now + 0.18);
  }

  private synthCrash(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(300, now);
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.5);
    oscillator.type = 'triangle';
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }

  private synthShock(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc1.frequency.setValueAtTime(1200, now);
    osc1.frequency.setValueAtTime(800, now + 0.05);
    osc1.frequency.setValueAtTime(1500, now + 0.1);
    osc1.frequency.setValueAtTime(600, now + 0.15);
    osc1.type = 'sawtooth';
    
    osc2.frequency.setValueAtTime(60, now);
    osc2.type = 'square';
    
    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.setValueAtTime(0.1, now + 0.05);
    gainNode.gain.setValueAtTime(0.35, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.25);
    osc2.stop(now + 0.25);
  }

  private synthSpaceship(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.5);
    osc.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.setValueAtTime(0.35, now + 0.25);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.frequency.setValueAtTime(8, now);
    lfoGain.gain.setValueAtTime(50, now);
    
    osc.start(now);
    lfo.start(now);
    osc.stop(now + 0.6);
    lfo.stop(now + 0.6);
  }

  private synthGhost(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(500, now + 0.2);
    osc.frequency.linearRampToValueAtTime(350, now + 0.4);
    osc.frequency.linearRampToValueAtTime(450, now + 0.6);
    osc.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.1);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.3);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    
    osc.start(now);
    osc.stop(now + 0.8);
  }

  private synthAnnoying(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const startTime = now + i * 0.08;
      osc.frequency.setValueAtTime(1800 + (i % 2) * 400, startTime);
      osc.type = 'square';
      
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.06);
      
      osc.start(startTime);
      osc.stop(startTime + 0.06);
    }
  }

  private synthSuck(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);
    osc.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.35, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
    
    const noise = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.frequency.setValueAtTime(400, now);
    noise.frequency.exponentialRampToValueAtTime(60, now + 0.45);
    noise.type = 'triangle';
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(0.2, now + 0.08);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.start(now);
    noise.start(now);
    osc.stop(now + 0.55);
    noise.stop(now + 0.5);
  }

  private synthHumanSigh(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const sigh = ctx.createOscillator();
    const sighGain = ctx.createGain();
    sigh.connect(sighGain);
    sighGain.connect(ctx.destination);
    
    sigh.frequency.setValueAtTime(350, now);
    sigh.frequency.linearRampToValueAtTime(280, now + 0.4);
    sigh.frequency.linearRampToValueAtTime(180, now + 0.8);
    sigh.type = 'sine';
    
    sighGain.gain.setValueAtTime(0.01, now);
    sighGain.gain.linearRampToValueAtTime(0.25, now + 0.15);
    sighGain.gain.linearRampToValueAtTime(0.18, now + 0.5);
    sighGain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);
    
    sigh.start(now);
    sigh.stop(now + 0.9);
  }

  private synthKidsLaugh(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const startTime = now + i * 0.12;
      const basePitch = 500 + (i % 2) * 150;
      osc.frequency.setValueAtTime(basePitch, startTime);
      osc.frequency.exponentialRampToValueAtTime(basePitch * 0.7, startTime + 0.1);
      osc.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.01, startTime);
      gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
      
      osc.start(startTime);
      osc.stop(startTime + 0.11);
    }
  }

  private synthRatchet(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const jet = ctx.createOscillator();
    const jetGain = ctx.createGain();
    jet.connect(jetGain);
    jetGain.connect(ctx.destination);
    
    jet.frequency.setValueAtTime(150, now);
    jet.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    jet.frequency.exponentialRampToValueAtTime(400, now + 0.3);
    jet.type = 'sawtooth';
    
    jetGain.gain.setValueAtTime(0.15, now);
    jetGain.gain.setValueAtTime(0.25, now + 0.1);
    jetGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    
    jet.start(now);
    jet.stop(now + 0.35);
  }

  private synthLightsaber(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
    osc.frequency.setValueAtTime(180, now + 0.15);
    osc.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    osc.start(now);
    osc.stop(now + 0.4);
  }

  private synthNerdy(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const notes = [523, 659, 784, 659];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      osc.type = 'square';
      gain.gain.setValueAtTime(0.15, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.08);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.1);
    });
  }

  private synthScaryUpbeat(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
    osc.type = 'sawtooth';
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }

  private synthFiery(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.4);
    osc.type = 'sawtooth';
    
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.start(now);
    osc.stop(now + 0.5);
  }

  private synthHulk(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
    osc.type = 'sawtooth';
    
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.start(now);
    osc.stop(now + 0.5);
  }

  private synthSword(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(2000, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.15);
    osc.type = 'sawtooth';
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    osc.start(now);
    osc.stop(now + 0.2);
  }

  private synthStaircase(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const notes = [262, 294, 330, 349, 392];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.2, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.1);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.12);
    });
  }

  private synthLove(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.2);
    osc.frequency.linearRampToValueAtTime(500, now + 0.4);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.start(now);
    osc.stop(now + 0.5);
  }

  private synthRecordScratch(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);
    osc.type = 'sawtooth';
    
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }

  private synthPoliceSiren(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(900, now + 0.25);
    osc.frequency.linearRampToValueAtTime(600, now + 0.5);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    osc.start(now);
    osc.stop(now + 0.6);
  }

  private synthPacman(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const startTime = now + i * 0.06;
      osc.frequency.setValueAtTime(i % 2 === 0 ? 500 : 400, startTime);
      osc.type = 'square';
      
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);
      
      osc.start(startTime);
      osc.stop(startTime + 0.06);
    }
  }

  private synthPokemon(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const notes = [392, 440, 494, 523];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      osc.type = 'square';
      gain.gain.setValueAtTime(0.15, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.08);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.1);
    });
  }

  private synthPunkGuitar(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const distortion = ctx.createWaveShaper();
    
    osc.connect(distortion);
    distortion.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(196, now);
    osc.type = 'sawtooth';
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    osc.start(now);
    osc.stop(now + 0.4);
  }

  private synthTraffic(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(350, now + 0.5);
    osc.type = 'triangle';
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    osc.start(now);
    osc.stop(now + 0.6);
  }

  private synthOcean(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(150, now + 0.4);
    osc.frequency.linearRampToValueAtTime(80, now + 0.8);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
    
    osc.start(now);
    osc.stop(now + 1);
  }
}

// Export singleton instance
export const soundManager = new SoundManager();