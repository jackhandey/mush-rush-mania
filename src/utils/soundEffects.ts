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

  // Positive jet whoosh (LOST numbers: 4, 8, 15, 16, 23, 42)
  playRatchet() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Rising, positive jet whoosh sound
    const jet = ctx.createOscillator();
    const jetGain = ctx.createGain();
    
    jet.connect(jetGain);
    jetGain.connect(ctx.destination);
    
    // Rising frequency for positive feel
    jet.frequency.setValueAtTime(150, now);
    jet.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    jet.frequency.exponentialRampToValueAtTime(400, now + 0.3);
    jet.type = 'sine';
    
    jetGain.gain.setValueAtTime(0.01, now);
    jetGain.gain.linearRampToValueAtTime(0.3, now + 0.08);
    jetGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    
    // Add airy whoosh layer
    const whoosh = ctx.createOscillator();
    const whooshGain = ctx.createGain();
    
    whoosh.connect(whooshGain);
    whooshGain.connect(ctx.destination);
    
    whoosh.frequency.setValueAtTime(800, now);
    whoosh.frequency.exponentialRampToValueAtTime(1500, now + 0.2);
    whoosh.frequency.exponentialRampToValueAtTime(1000, now + 0.35);
    whoosh.type = 'triangle';
    
    whooshGain.gain.setValueAtTime(0.01, now);
    whooshGain.gain.linearRampToValueAtTime(0.12, now + 0.1);
    whooshGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    
    jet.start(now);
    whoosh.start(now);
    jet.stop(now + 0.35);
    whoosh.stop(now + 0.35);
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

  // Lightsaber sound (66th jump)
  playLightsaber() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Iconic hum with ignition
    const ignite = ctx.createOscillator();
    const igniteGain = ctx.createGain();
    ignite.connect(igniteGain);
    igniteGain.connect(ctx.destination);
    
    ignite.frequency.setValueAtTime(100, now);
    ignite.frequency.exponentialRampToValueAtTime(180, now + 0.15);
    ignite.type = 'sawtooth';
    
    igniteGain.gain.setValueAtTime(0.01, now);
    igniteGain.gain.linearRampToValueAtTime(0.35, now + 0.1);
    igniteGain.gain.setValueAtTime(0.25, now + 0.15);
    igniteGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    // Hum layer
    const hum = ctx.createOscillator();
    const humGain = ctx.createGain();
    hum.connect(humGain);
    humGain.connect(ctx.destination);
    
    hum.frequency.setValueAtTime(120, now);
    hum.type = 'sine';
    
    humGain.gain.setValueAtTime(0.01, now + 0.1);
    humGain.gain.linearRampToValueAtTime(0.15, now + 0.2);
    humGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    ignite.start(now);
    hum.start(now);
    ignite.stop(now + 0.6);
    hum.stop(now + 0.6);
  }

  // Nerdy sound (73rd jump) - dial-up modem / computer beep
  playNerdy() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Classic computer beep sequence
    const frequencies = [800, 1000, 900, 1100, 850];
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const start = now + i * 0.08;
      osc.frequency.setValueAtTime(freq, start);
      osc.type = 'square';
      
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.06);
      
      osc.start(start);
      osc.stop(start + 0.07);
    });
  }

  // Scary but upbeat (19th jump) - minor chord burst with upward resolve
  playScaryUpbeat() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Minor chord stinger
    const freqs = [220, 261, 330]; // A minor-ish
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.3);
      osc.type = 'triangle';
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      
      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  // Upbeat fiery sound (64th jump)
  playFiery() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Crackling fire with upward whoosh
    const crackle = ctx.createOscillator();
    const crackleGain = ctx.createGain();
    crackle.connect(crackleGain);
    crackleGain.connect(ctx.destination);
    
    crackle.frequency.setValueAtTime(200, now);
    crackle.frequency.exponentialRampToValueAtTime(800, now + 0.2);
    crackle.frequency.exponentialRampToValueAtTime(1200, now + 0.35);
    crackle.type = 'sawtooth';
    
    crackleGain.gain.setValueAtTime(0.2, now);
    crackleGain.gain.setValueAtTime(0.3, now + 0.15);
    crackleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    // Pop layer
    const pop = ctx.createOscillator();
    const popGain = ctx.createGain();
    pop.connect(popGain);
    popGain.connect(ctx.destination);
    
    pop.frequency.setValueAtTime(400, now + 0.1);
    pop.frequency.exponentialRampToValueAtTime(100, now + 0.2);
    pop.type = 'sine';
    
    popGain.gain.setValueAtTime(0.15, now + 0.1);
    popGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    
    crackle.start(now);
    pop.start(now + 0.1);
    crackle.stop(now + 0.4);
    pop.stop(now + 0.25);
  }

  // Hulk smash sound (52nd jump) - deep powerful hit with roar
  playHulk() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Deep impact
    const impact = ctx.createOscillator();
    const impactGain = ctx.createGain();
    impact.connect(impactGain);
    impactGain.connect(ctx.destination);
    
    impact.frequency.setValueAtTime(80, now);
    impact.frequency.exponentialRampToValueAtTime(40, now + 0.3);
    impact.type = 'sine';
    
    impactGain.gain.setValueAtTime(0.5, now);
    impactGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    // Roar layer
    const roar = ctx.createOscillator();
    const roarGain = ctx.createGain();
    roar.connect(roarGain);
    roarGain.connect(ctx.destination);
    
    roar.frequency.setValueAtTime(150, now);
    roar.frequency.linearRampToValueAtTime(200, now + 0.15);
    roar.frequency.linearRampToValueAtTime(120, now + 0.4);
    roar.type = 'sawtooth';
    
    roarGain.gain.setValueAtTime(0.01, now);
    roarGain.gain.linearRampToValueAtTime(0.25, now + 0.1);
    roarGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    impact.start(now);
    roar.start(now);
    impact.stop(now + 0.4);
    roar.stop(now + 0.5);
  }

  // Sword sound (88th jump) - metallic swing and clash
  playSword() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Metallic ring
    const ring = ctx.createOscillator();
    const ringGain = ctx.createGain();
    ring.connect(ringGain);
    ringGain.connect(ctx.destination);
    
    ring.frequency.setValueAtTime(2000, now);
    ring.frequency.exponentialRampToValueAtTime(800, now + 0.3);
    ring.type = 'sine';
    
    ringGain.gain.setValueAtTime(0.3, now);
    ringGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    // Whoosh layer
    const whoosh = ctx.createOscillator();
    const whooshGain = ctx.createGain();
    whoosh.connect(whooshGain);
    whooshGain.connect(ctx.destination);
    
    whoosh.frequency.setValueAtTime(300, now);
    whoosh.frequency.exponentialRampToValueAtTime(1500, now + 0.1);
    whoosh.frequency.exponentialRampToValueAtTime(500, now + 0.2);
    whoosh.type = 'triangle';
    
    whooshGain.gain.setValueAtTime(0.2, now);
    whooshGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    
    ring.start(now);
    whoosh.start(now);
    ring.stop(now + 0.4);
    whoosh.stop(now + 0.25);
  }

  // Love sound (143rd jump) - warm, melodic heartbeat
  playLove() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Heartbeat pattern - two beats
    for (let i = 0; i < 2; i++) {
      const beat = ctx.createOscillator();
      const beatGain = ctx.createGain();
      beat.connect(beatGain);
      beatGain.connect(ctx.destination);
      
      const start = now + i * 0.25;
      beat.frequency.setValueAtTime(80, start);
      beat.frequency.exponentialRampToValueAtTime(60, start + 0.1);
      beat.type = 'sine';
      
      beatGain.gain.setValueAtTime(0.3, start);
      beatGain.gain.exponentialRampToValueAtTime(0.01, start + 0.15);
      
      beat.start(start);
      beat.stop(start + 0.15);
    }
    
    // Warm harmonics
    const warm = ctx.createOscillator();
    const warmGain = ctx.createGain();
    warm.connect(warmGain);
    warmGain.connect(ctx.destination);
    
    warm.frequency.setValueAtTime(440, now + 0.1);
    warm.frequency.linearRampToValueAtTime(523, now + 0.4);
    warm.type = 'sine';
    
    warmGain.gain.setValueAtTime(0.01, now + 0.1);
    warmGain.gain.linearRampToValueAtTime(0.15, now + 0.25);
    warmGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    warm.start(now + 0.1);
    warm.stop(now + 0.6);
  }

  // Record scratch sound (187th jump)
  playRecordScratch() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Vinyl scratch - rapid frequency sweep
    const scratch = ctx.createOscillator();
    const scratchGain = ctx.createGain();
    scratch.connect(scratchGain);
    scratchGain.connect(ctx.destination);
    
    scratch.frequency.setValueAtTime(1000, now);
    scratch.frequency.exponentialRampToValueAtTime(200, now + 0.1);
    scratch.frequency.exponentialRampToValueAtTime(800, now + 0.2);
    scratch.frequency.exponentialRampToValueAtTime(150, now + 0.3);
    scratch.type = 'sawtooth';
    
    scratchGain.gain.setValueAtTime(0.25, now);
    scratchGain.gain.setValueAtTime(0.15, now + 0.1);
    scratchGain.gain.setValueAtTime(0.25, now + 0.2);
    scratchGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    
    // Noise layer for texture
    const noise = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    noise.frequency.setValueAtTime(100, now);
    noise.type = 'triangle';
    
    noiseGain.gain.setValueAtTime(0.1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    scratch.start(now);
    noise.start(now);
    scratch.stop(now + 0.35);
    noise.stop(now + 0.3);
  }

  // Police siren (209th jump)
  playPoliceSiren() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const siren = ctx.createOscillator();
    const sirenGain = ctx.createGain();
    siren.connect(sirenGain);
    sirenGain.connect(ctx.destination);
    
    // Oscillating between two frequencies
    siren.frequency.setValueAtTime(600, now);
    siren.frequency.linearRampToValueAtTime(900, now + 0.15);
    siren.frequency.linearRampToValueAtTime(600, now + 0.3);
    siren.frequency.linearRampToValueAtTime(900, now + 0.45);
    siren.frequency.linearRampToValueAtTime(600, now + 0.6);
    siren.type = 'sine';
    
    sirenGain.gain.setValueAtTime(0.25, now);
    sirenGain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
    
    siren.start(now);
    siren.stop(now + 0.65);
  }

  // Pac man wakka wakka (256th jump)
  playPacman() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Classic wakka wakka sound
    for (let i = 0; i < 4; i++) {
      const wakka = ctx.createOscillator();
      const wakkaGain = ctx.createGain();
      wakka.connect(wakkaGain);
      wakkaGain.connect(ctx.destination);
      
      const start = now + i * 0.12;
      const isHigh = i % 2 === 0;
      wakka.frequency.setValueAtTime(isHigh ? 500 : 400, start);
      wakka.frequency.exponentialRampToValueAtTime(isHigh ? 300 : 200, start + 0.08);
      wakka.type = 'square';
      
      wakkaGain.gain.setValueAtTime(0.2, start);
      wakkaGain.gain.exponentialRampToValueAtTime(0.01, start + 0.1);
      
      wakka.start(start);
      wakka.stop(start + 0.1);
    }
  }

  // Pokemon sound (151st jump) - capture/encounter jingle
  playPokemon() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Ascending capture jingle
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const start = now + i * 0.1;
      osc.frequency.setValueAtTime(freq, start);
      osc.type = 'square';
      
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.12);
      
      osc.start(start);
      osc.stop(start + 0.12);
    });
  }

  // Punk rock guitar (138th, 182nd jump)
  playPunkGuitar() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Power chord with distortion
    const freqs = [82, 123, 164]; // E2, B2, E3 power chord
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(freq, now);
      osc.type = 'sawtooth';
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.setValueAtTime(0.25, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      
      osc.start(now);
      osc.stop(now + 0.4);
    });
    
    // Palm mute hit
    const mute = ctx.createOscillator();
    const muteGain = ctx.createGain();
    mute.connect(muteGain);
    muteGain.connect(ctx.destination);
    
    mute.frequency.setValueAtTime(100, now);
    mute.type = 'square';
    
    muteGain.gain.setValueAtTime(0.3, now);
    muteGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    
    mute.start(now);
    mute.stop(now + 0.08);
  }

  // Traffic sound (212th jump)
  playTraffic() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Car horn beep
    const horn = ctx.createOscillator();
    const hornGain = ctx.createGain();
    horn.connect(hornGain);
    hornGain.connect(ctx.destination);
    
    horn.frequency.setValueAtTime(350, now);
    horn.type = 'sine';
    
    hornGain.gain.setValueAtTime(0.3, now);
    hornGain.gain.setValueAtTime(0.01, now + 0.2);
    hornGain.gain.setValueAtTime(0.25, now + 0.25);
    hornGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    
    // Engine rumble layer
    const engine = ctx.createOscillator();
    const engineGain = ctx.createGain();
    engine.connect(engineGain);
    engineGain.connect(ctx.destination);
    
    engine.frequency.setValueAtTime(60, now);
    engine.type = 'sawtooth';
    
    engineGain.gain.setValueAtTime(0.1, now);
    engineGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    horn.start(now);
    engine.start(now);
    horn.stop(now + 0.45);
    engine.stop(now + 0.5);
  }

  // Ocean waves (310th jump)
  playOcean() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Wave swell using filtered noise simulation
    const wave = ctx.createOscillator();
    const waveGain = ctx.createGain();
    wave.connect(waveGain);
    waveGain.connect(ctx.destination);
    
    wave.frequency.setValueAtTime(100, now);
    wave.frequency.linearRampToValueAtTime(200, now + 0.4);
    wave.frequency.linearRampToValueAtTime(80, now + 0.8);
    wave.type = 'sine';
    
    waveGain.gain.setValueAtTime(0.01, now);
    waveGain.gain.linearRampToValueAtTime(0.2, now + 0.3);
    waveGain.gain.linearRampToValueAtTime(0.25, now + 0.5);
    waveGain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
    
    // High frequency foam/crash
    const foam = ctx.createOscillator();
    const foamGain = ctx.createGain();
    foam.connect(foamGain);
    foamGain.connect(ctx.destination);
    
    foam.frequency.setValueAtTime(800, now + 0.3);
    foam.frequency.exponentialRampToValueAtTime(400, now + 0.7);
    foam.type = 'triangle';
    
    foamGain.gain.setValueAtTime(0.01, now + 0.3);
    foamGain.gain.linearRampToValueAtTime(0.1, now + 0.5);
    foamGain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);
    
    wave.start(now);
    foam.start(now + 0.3);
    wave.stop(now + 1.0);
    foam.stop(now + 0.9);
  }

  // Staircase sound (142nd jump) - ascending steps
  playStaircase() {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Ascending notes like walking up stairs
    const notes = [220, 262, 294, 330, 370, 415, 466, 523];
    notes.forEach((freq, i) => {
      const step = ctx.createOscillator();
      const stepGain = ctx.createGain();
      step.connect(stepGain);
      stepGain.connect(ctx.destination);
      
      const start = now + i * 0.08;
      step.frequency.setValueAtTime(freq, start);
      step.type = 'triangle';
      
      stepGain.gain.setValueAtTime(0.2, start);
      stepGain.gain.exponentialRampToValueAtTime(0.01, start + 0.1);
      
      step.start(start);
      step.stop(start + 0.1);
    });
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
