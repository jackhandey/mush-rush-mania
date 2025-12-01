// Simple sound effects using Web Audio API
class SoundEffects {
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Soft organic landing sound - very muted tennis ball on carpet
  playBoing() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Low thud (tennis ball on carpet)
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    
    thud.connect(thudGain);
    thudGain.connect(ctx.destination);
    
    thud.frequency.setValueAtTime(65, now);
    thud.frequency.exponentialRampToValueAtTime(35, now + 0.14);
    thud.type = 'sine';
    
    thudGain.gain.setValueAtTime(0.25, now);
    thudGain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
    
    // Very subtle breath/suction pop layer
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

  // Soft organic jump sound - very gentle push
  playLaunch() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Low push sound
    const push = ctx.createOscillator();
    const pushGain = ctx.createGain();
    
    push.connect(pushGain);
    pushGain.connect(ctx.destination);
    
    push.frequency.setValueAtTime(55, now);
    push.frequency.exponentialRampToValueAtTime(110, now + 0.09);
    push.type = 'sine';
    
    pushGain.gain.setValueAtTime(0.22, now);
    pushGain.gain.exponentialRampToValueAtTime(0.01, now + 0.13);
    
    // Very subtle breath/release layer
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

  // Louder version of launch for 11th jump
  playLaunchLoud() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const push = ctx.createOscillator();
    const pushGain = ctx.createGain();
    
    push.connect(pushGain);
    pushGain.connect(ctx.destination);
    
    push.frequency.setValueAtTime(55, now);
    push.frequency.exponentialRampToValueAtTime(110, now + 0.09);
    push.type = 'sine';
    
    // Much louder
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

  // Squishy sound for dropping
  playThwack() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Create two oscillators for a richer squish
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Low squishy wobble
    osc1.frequency.setValueAtTime(100, now);
    osc1.frequency.exponentialRampToValueAtTime(60, now + 0.08);
    osc1.frequency.exponentialRampToValueAtTime(85, now + 0.16);
    osc1.type = 'sine';
    
    // Second layer for texture
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

  // Sad trombone for crash
  playCrash() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Descending sad sound
    oscillator.frequency.setValueAtTime(300, now);
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.5);
    
    oscillator.type = 'triangle';
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }

  // Electric shock noise (451st jump)
  playShock() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // High frequency buzz with rapid modulation
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

  // Space ship noise (47th jump)
  playSpaceship() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Rising warp sound
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
    
    // Add warble
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

  // Ghost noise (217th jump)
  playGhost() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Eerie wavering tone
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
    
    // Add slight tremolo
    const tremolo = ctx.createOscillator();
    const tremoloGain = ctx.createGain();
    tremolo.connect(tremoloGain);
    tremoloGain.connect(gainNode.gain);
    tremolo.frequency.setValueAtTime(6, now);
    tremoloGain.gain.setValueAtTime(0.05, now);
    
    osc.start(now);
    tremolo.start(now);
    osc.stop(now + 0.8);
    tremolo.stop(now + 0.8);
  }

  // Annoying noise (101st jump)
  playAnnoying() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Harsh dissonant beeps
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

  // Sucking sound (37th jump)
  playSuck() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Descending vacuum sound
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
    osc.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    
    // Add noise layer
    const noise = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.frequency.setValueAtTime(200, now);
    noise.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    noise.type = 'triangle';
    noiseGain.gain.setValueAtTime(0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    
    osc.start(now);
    noise.start(now);
    osc.stop(now + 0.35);
    noise.stop(now + 0.35);
  }

  // Mechanical ratchet / rapid flutter (LOST numbers: 4, 8, 15, 16, 23, 42)
  playRatchet() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Rapid clicking sequence
    for (let i = 0; i < 8; i++) {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const startTime = now + i * 0.025;
      osc.frequency.setValueAtTime(300 - i * 20, startTime);
      osc.type = 'square';
      
      gainNode.gain.setValueAtTime(0.25, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.02);
      
      osc.start(startTime);
      osc.stop(startTime + 0.025);
    }
  }

  // Air release with sigh (42nd jump - combines with ratchet)
  playAirSigh() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Air hiss
    const noise = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    noise.frequency.setValueAtTime(2000, now);
    noise.frequency.exponentialRampToValueAtTime(500, now + 0.4);
    noise.type = 'sawtooth';
    
    noiseGain.gain.setValueAtTime(0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    // Human-like sigh (descending formant)
    const sigh = ctx.createOscillator();
    const sighGain = ctx.createGain();
    sigh.connect(sighGain);
    sighGain.connect(ctx.destination);
    
    sigh.frequency.setValueAtTime(350, now + 0.1);
    sigh.frequency.linearRampToValueAtTime(280, now + 0.5);
    sigh.frequency.linearRampToValueAtTime(200, now + 0.8);
    sigh.type = 'sine';
    
    sighGain.gain.setValueAtTime(0.01, now + 0.1);
    sighGain.gain.linearRampToValueAtTime(0.2, now + 0.25);
    sighGain.gain.linearRampToValueAtTime(0.15, now + 0.5);
    sighGain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);
    
    noise.start(now);
    sigh.start(now + 0.1);
    noise.stop(now + 0.5);
    sigh.stop(now + 0.9);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }
}

export const soundEffects = new SoundEffects();
