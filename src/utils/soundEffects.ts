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

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }
}

export const soundEffects = new SoundEffects();
