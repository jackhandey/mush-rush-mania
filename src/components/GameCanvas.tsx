import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Grumblecap } from './Grumblecap';
import { toast } from 'sonner';
import { soundEffects } from '@/utils/soundEffects';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MossPad extends GameObject {
  id: number;
  angle: number;
  speed: number;
  breathPhase: number;
  glowIntensity: number;
  isDeflating: boolean;
  deflateProgress: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  drift: number;
}

interface Firefly extends Particle {
  blinkPhase: number;
  blinkSpeed: number;
}

interface Raindrop extends Particle {
  blur: number;
}

export const GameCanvas = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'crashed'>('menu');
  const [score, setScore] = useState(0);
  const [renderTick, setRenderTick] = useState(0); // Single state to trigger renders
  const [isSpinning, setIsSpinning] = useState(false); // For 113th jump spin effect
  
  // Use refs for frequently updated values to avoid re-renders
  const mushroomPosRef = useRef({ x: 50, y: 80 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const isDroppingRef = useRef(false);
  const obstaclesRef = useRef<GameObject[]>([]);
  const mossPadsRef = useRef<MossPad[]>([]);
  const sporesRef = useRef<Particle[]>([]);
  const firefliesRef = useRef<Firefly[]>([]);
  const raindropsRef = useRef<Raindrop[]>([]);
  const gnatsRef = useRef<Particle[]>([]);
  const sporeBurstRef = useRef<{ x: number; y: number; particles: { angle: number; distance: number; opacity: number }[] }>({ x: 0, y: 0, particles: [] });
  const worldScrollSpeedRef = useRef(0);
  const lastLandedPadIdRef = useRef<number | null>(null);
  const nextPadIdRef = useRef(0);
  const spinRotationRef = useRef(0);
  
  const [isMuted, setIsMuted] = useState(false);
  const gameLoopRef = useRef<number>();
  const lastTapTime = useRef<number>(0);
  
  // Mobile detection
  const isMobile = window.innerWidth <= 768;

  const checkCollision = useCallback((a: GameObject, b: GameObject) => {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }, []);

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    mushroomPosRef.current = { x: 50, y: 75 };
    velocityRef.current = { x: 0, y: 0 };
    isDroppingRef.current = false;
    worldScrollSpeedRef.current = isMobile ? 2.2 : 2.5;
    initializeObstacles();
    launch();
  }, []);

  const initializeObstacles = () => {
    const newObstacles: GameObject[] = [];
    const newMossPads: MossPad[] = [];
    
    // Create background scenery (roots/leaves) - minimal for performance
    for (let i = 0; i < 4; i++) {
      newObstacles.push({
        x: i * 25,
        y: 10 + Math.random() * 50,
        width: 12,
        height: 6,
      });
    }
    
    // Create fungal shelves - progressive spacing (easier start, harder later)
    const padWidth = isMobile ? 16 : 9;
    const padHeight = isMobile ? 5 : 3;
    
    // First pad starts AHEAD of mushroom (mushroom at x=50)
    let currentX = isMobile ? 54 : 56;
    for (let i = 0; i < 6; i++) {
      // Progressive spacing - first few pads are closer, then spread out
      if (i > 0) {
        const progressFactor = Math.min(i / 4, 1); // Ramps up over first 4 pads
        const minSpacing = isMobile ? (18 + progressFactor * 10) : (16 + progressFactor * 8);
        const maxSpacing = isMobile ? (22 + progressFactor * 18) : (20 + progressFactor * 17);
        const spacing = minSpacing + Math.random() * (maxSpacing - minSpacing);
        currentX += spacing;
      }
      
      // Variable Y position - minimal variance until after pad 13
      const baseY = 75;
      const yVariance = i > 13 ? ((isMobile ? 12 : 15) + ((i - 13) * 3)) : 4;
      const randomY = baseY + (Math.random() - 0.5) * yVariance;
      
      newMossPads.push({
        id: nextPadIdRef.current++,
        x: currentX,
        y: randomY,
        width: padWidth,
        height: padHeight,
        angle: i * 60,
        speed: 0.4,
        breathPhase: Math.random() * 360,
        glowIntensity: 0.6,
        isDeflating: false,
        deflateProgress: 0,
      });
    }
    
    // Initialize particles - minimal on mobile for Android performance
    const newSpores: Particle[] = [];
    const newFireflies: Firefly[] = [];
    const newRaindrops: Raindrop[] = [];
    const newGnats: Particle[] = [];
    
    if (!isMobile) {
      // Desktop only particles
      for (let i = 0; i < 3; i++) {
        newSpores.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 1.5,
          opacity: 0.4,
          speed: 0.08,
          drift: Math.random() * 0.4 - 0.2,
        });
      }
      for (let i = 0; i < 2; i++) {
        newFireflies.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 3,
          opacity: 0.6,
          speed: 0.12,
          drift: Math.random() * 0.2 - 0.1,
          blinkPhase: Math.random() * 360,
          blinkSpeed: 2.5,
        });
      }
    }
    
    obstaclesRef.current = newObstacles;
    mossPadsRef.current = newMossPads;
    sporesRef.current = newSpores;
    firefliesRef.current = newFireflies;
    raindropsRef.current = newRaindrops;
    gnatsRef.current = newGnats;
  };

  const launch = useCallback(() => {
    // Consistent arc throughout game - difficulty comes from pad spacing
    // Flatter arc: less vertical velocity, lower gravity for longer hang time
    const horizontalVelocity = isMobile ? 85 : 24.14;
    const verticalVelocity = isMobile ? -14 : -17.8;
    
    velocityRef.current = { x: horizontalVelocity, y: verticalVelocity };
    isDroppingRef.current = false;
    soundEffects.playLaunch();
  }, []);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapTime.current < 100) return;
    lastTapTime.current = now;
    
    if (gameState === 'menu') {
      startGame();
      return;
    }
    
    if (gameState === 'playing' && !isDroppingRef.current) {
      isDroppingRef.current = true;
      const dropSpeed = isMobile ? 13 : 15;
      velocityRef.current = { x: 0, y: dropSpeed };
      soundEffects.playThwack();
      toast('THWACK!', { duration: 500 });
    }
  }, [gameState, startGame]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      const worldSpeed = worldScrollSpeedRef.current;
      // Update obstacles
      obstaclesRef.current = obstaclesRef.current.map(o => ({ ...o, x: o.x - worldSpeed * 0.1 })).filter(o => o.x > -20);
      while (obstaclesRef.current.length < 6) {
        const lastX = obstaclesRef.current.length > 0 ? Math.max(...obstaclesRef.current.map(o => o.x)) : 100;
        obstaclesRef.current.push({
          x: lastX + 15,
          y: 10 + Math.random() * 50,
          width: 12,
          height: 6,
        });
      }
      
      // Update moss pads
      mossPadsRef.current = mossPadsRef.current.map(p => {
        const newAngle = (p.angle + p.speed) % 360;
        const newBreathPhase = (p.breathPhase + 2) % 360;
        const baseY = 75;
        const verticalOffset = Math.sin(newAngle * Math.PI / 180) * 5;
        return {
          ...p,
          x: p.x - worldSpeed * 0.1,
          y: baseY + verticalOffset,
          angle: newAngle,
          breathPhase: newBreathPhase,
        };
      }).filter(p => p.x > -20);
      
      while (mossPadsRef.current.length < 6) {
        const lastX = mossPadsRef.current.length > 0 ? Math.max(...mossPadsRef.current.map(p => p.x)) : 100;
        const padWidth = isMobile ? 16 : 9;
        const padHeight = isMobile ? 5 : 3;
      // Progressive difficulty based on score
      const difficultyFactor = Math.min(score / 8, 1); // Maxes out at score 8
      const minSpacing = isMobile ? (18 + difficultyFactor * 8) : (16 + difficultyFactor * 10);
      const maxSpacing = isMobile ? (22 + difficultyFactor * 14) : (20 + difficultyFactor * 18);
      const spacing = minSpacing + Math.random() * (maxSpacing - minSpacing);
      const baseY = 75;
      // Vertical variance kicks in after score > 13, increases at 24, then every 33 pads after
      let yVariance = 4;
      if (score > 24) {
        const baseVariance = isMobile ? 22 : 28;
        const incrementsAfter24 = Math.floor((score - 24) / 33);
        const additionalVariance = incrementsAfter24 * (isMobile ? 4 : 5);
        yVariance = baseVariance + additionalVariance + (difficultyFactor * 15);
      } else if (score > 13) {
        yVariance = (isMobile ? 14 : 18) + (difficultyFactor * 10);
      }
      const randomY = baseY + (Math.random() - 0.5) * yVariance;
        
        mossPadsRef.current.push({
          id: nextPadIdRef.current++,
          x: lastX + spacing,
          y: randomY,
          width: padWidth,
          height: padHeight,
          angle: Math.random() * 360,
          speed: 0.4,
          breathPhase: Math.random() * 360,
          glowIntensity: 0.6,
          isDeflating: false,
          deflateProgress: 0,
        });
      }
      
      // Update deflating pads
      mossPadsRef.current = mossPadsRef.current.map(p => {
        if (p.isDeflating) {
          const newProgress = p.deflateProgress + 0.08;
          if (newProgress >= 1) {
            return null; // Remove fully deflated pads
          }
          return { ...p, deflateProgress: newProgress };
        }
        return p;
      }).filter((p): p is MossPad => p !== null);
      
      // Update particles (simplified)
      sporesRef.current = sporesRef.current.map(s => ({
        ...s,
        y: s.y > 110 ? -10 : s.y + s.speed,
        x: s.y > 110 ? Math.random() * 100 : s.x + s.drift,
      }));
      
      firefliesRef.current = firefliesRef.current.map(f => ({
        ...f,
        x: f.x > 110 ? -10 : f.x < -10 ? 110 : f.x + f.drift,
        y: f.y > 110 ? -10 : f.y + f.speed * 0.5,
        blinkPhase: (f.blinkPhase + f.blinkSpeed) % 360,
      }));
      
      raindropsRef.current = raindropsRef.current.map(r => ({
        ...r,
        y: r.y > 110 ? -r.size : r.y + r.speed,
        x: r.y > 110 ? Math.random() * 100 : r.x,
      }));
      
      gnatsRef.current = gnatsRef.current.map(g => ({
        ...g,
        x: g.x > 110 ? -10 : g.x < -10 ? 110 : g.x + g.drift,
        y: g.y + g.speed * Math.sin(Date.now() * 0.01) * 0.2,
      }));
      
      // Update spore burst - slower fade for visibility
      if (sporeBurstRef.current.particles.length > 0) {
        sporeBurstRef.current = {
          ...sporeBurstRef.current,
          particles: sporeBurstRef.current.particles
            .map(p => ({ ...p, distance: p.distance + 1.5, opacity: p.opacity - 0.015 }))
            .filter(p => p.opacity > 0),
        };
      }
      
      // Update mushroom physics
      const velocity = velocityRef.current;
      const isDropping = isDroppingRef.current;
      // Mushroom stays at fixed X, world scrolls instead
      let newY = mushroomPosRef.current.y + velocity.y * 0.1;
      
      if (!isDropping) {
        const gravity = isMobile ? 0.18 : 0.65;
        velocityRef.current = { ...velocity, y: velocity.y + gravity };
      }
      
      if (newY > 82 || newY < 0) {
        setGameState('crashed');
        worldScrollSpeedRef.current = 0;
        soundEffects.playCrash();
        toast.error(`Crashed! Score: ${score}`, { duration: 2000 });
        return;
      }
      
      // Collision detection
      const mushroomWidth = isMobile ? 8 : 5;
      const mushroomHeight = isMobile ? 8 : 5;
      const mushroomCenterX = mushroomPosRef.current.x + mushroomWidth / 2;
      const mushroomBottomY = newY + mushroomHeight;
      
      let landedPad: MossPad | null = null;
      for (const pad of mossPadsRef.current) {
        if (velocity.y > 0 && 
            mushroomCenterX >= pad.x && 
            mushroomCenterX <= pad.x + pad.width &&
            mushroomBottomY >= pad.y - 0.5 && 
            mushroomBottomY <= pad.y + pad.height + 0.5) {
          landedPad = pad;
          break;
        }
      }
      
      if (landedPad && isDropping) {
        const newScore = score + 1;
        setScore(newScore);
        soundEffects.playBoing();
        toast.success('BOING!', { duration: 500 });
        
        // Easter egg sounds at specific scores
        if (newScore === 451) {
          soundEffects.playShock();
        } else if (newScore === 47) {
          soundEffects.playSpaceship();
        } else if (newScore === 217) {
          soundEffects.playGhost();
        } else if (newScore === 101) {
          soundEffects.playAnnoying();
        } else if (newScore === 37) {
          soundEffects.playSuck();
        } else if (newScore === 66) {
          soundEffects.playLightsaber();
        } else if (newScore === 73) {
          soundEffects.playNerdy();
        } else if (newScore === 19) {
          soundEffects.playScaryUpbeat();
        } else if (newScore === 64) {
          soundEffects.playFiery();
        } else if (newScore === 52) {
          soundEffects.playHulk();
        } else if (newScore === 88 || newScore === 300) {
          soundEffects.playSword();
        } else if (newScore === 143) {
          soundEffects.playLove();
        } else if (newScore === 187) {
          soundEffects.playRecordScratch();
        } else if (newScore === 209) {
          soundEffects.playPoliceSiren();
        } else if (newScore === 256) {
          soundEffects.playPacman();
        } else if (newScore === 151) {
          soundEffects.playPokemon();
        } else if (newScore === 138 || newScore === 182) {
          soundEffects.playPunkGuitar();
        } else if (newScore === 212) {
          soundEffects.playTraffic();
        } else if (newScore === 310) {
          soundEffects.playOcean();
        } else if ([4, 8, 15, 16, 23].includes(newScore)) {
          soundEffects.playRatchet();
        } else if (newScore === 42) {
          soundEffects.playRatchet();
          soundEffects.playAirSigh();
        }
        
        // 113th jump - mushroom spin
        if (newScore === 113) {
          setIsSpinning(true);
          spinRotationRef.current = 0;
          setTimeout(() => setIsSpinning(false), 1000);
        }
        
        // Deflate the previous pad if it's still visible
        if (lastLandedPadIdRef.current !== null && lastLandedPadIdRef.current !== landedPad.id) {
          mossPadsRef.current = mossPadsRef.current.map(p => 
            p.id === lastLandedPadIdRef.current ? { ...p, isDeflating: true } : p
          );
        }
        lastLandedPadIdRef.current = landedPad.id;
        
        // Spore burst every 7th jump
        if (newScore % 7 === 0) {
          const burstParticles = [];
          for (let i = 0; i < 16; i++) {
            burstParticles.push({
              angle: (i * 22.5) + Math.random() * 10,
              distance: 0,
              opacity: 1,
            });
          }
          sporeBurstRef.current = { x: mushroomPosRef.current.x + 4, y: mushroomPosRef.current.y + 4, particles: burstParticles };
        }
        
        mossPadsRef.current = mossPadsRef.current.map(p => 
          p === landedPad ? { ...p, glowIntensity: 1 } : p
        );
        setTimeout(() => {
          mossPadsRef.current = mossPadsRef.current.map(p => 
            p === landedPad ? { ...p, glowIntensity: 0.5 + Math.random() * 0.5 } : p
          );
        }, 200);
        
        mushroomPosRef.current = { x: mushroomPosRef.current.x, y: landedPad.y - 5 };
        
        // 11th jump - louder launch
        if (newScore === 11) {
          soundEffects.playLaunchLoud();
          velocityRef.current = { x: isMobile ? 85 : 24.14, y: isMobile ? -14 : -17.8 };
          isDroppingRef.current = false;
        } else {
          launch();
        }
      } else {
        mushroomPosRef.current = { x: mushroomPosRef.current.x, y: newY };
      }
      
      // Trigger render
      setRenderTick(t => t + 1);
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, score, launch]);


  return (
    <div 
      className="relative w-full h-screen bg-gradient-to-b from-game-bgStart to-game-bgEnd overflow-hidden cursor-pointer select-none"
      onClick={handleTap}
      onTouchStart={(e) => {
        e.preventDefault();
        handleTap();
      }}
    >
      {/* Score and Mute Button */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-6xl font-bold text-foreground z-10">
        {score}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          const newMuted = soundEffects.toggleMute();
          setIsMuted(newMuted);
        }}
        className="absolute top-4 right-4 p-3 bg-background/50 hover:bg-background/70 rounded-full transition-colors z-10"
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>
      
      {/* Menu Screen */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-background/80 backdrop-blur-sm">
          <h1 className="text-7xl font-bold text-primary mb-8 tracking-wider">
            MUSH RUSH MANIA
          </h1>
          
          <div className="mb-8 animate-bounce-slow">
            <Grumblecap isDropping={false} isCrashed={false} />
          </div>
          
          <p className="text-xl text-muted-foreground mb-2">tap to land on the moss pads</p>
          <p className="text-3xl text-foreground font-bold animate-pulse">TAP TO START</p>
        </div>
      )}

      {/* Lightweight Atmospheric Background - CSS only, no JS particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft ambient glow spots */}
        <div className="absolute top-[15%] left-[10%] w-32 h-32 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-[60%] right-[15%] w-40 h-40 rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute bottom-[20%] left-[25%] w-24 h-24 rounded-full bg-primary/4 blur-2xl" />
        {/* Subtle vertical light rays */}
        <div className="absolute top-0 left-[20%] w-px h-[40%] bg-gradient-to-b from-foreground/5 to-transparent" />
        <div className="absolute top-0 right-[35%] w-px h-[30%] bg-gradient-to-b from-foreground/3 to-transparent" />
      </div>

      {/* Background Layer - Far (desktop only) */}
      {!isMobile && (
        <div className="absolute inset-0 overflow-hidden opacity-40 blur-md">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-game-bgStart via-accent/20 to-game-bgEnd" />
          <div className="absolute top-0 left-20 w-1 h-full bg-gradient-to-b from-foreground/10 to-transparent rotate-12 blur-sm" />
          <div className="absolute top-0 right-32 w-1 h-full bg-gradient-to-b from-foreground/8 to-transparent -rotate-6 blur-sm" />
        </div>
      )}

      {/* Background Scenery (blurry roots/leaves) */}
      {gameState === 'playing' && obstaclesRef.current.map((obs, i) => (
        <div
          key={`obs-${i}`}
          className="absolute bg-accent/60 rounded-full opacity-30 blur-sm"
          style={{
            left: `${obs.x}%`,
            top: `${obs.y}%`,
            width: `${obs.width}%`,
            height: `${obs.height}%`,
          }}
        />
      ))}

      {/* Mid-ground - Glowing spores */}
      {gameState === 'playing' && sporesRef.current.map((spore, i) => (
        <div
          key={`spore-${i}`}
          className="absolute rounded-full bg-game-sporeGlow blur-sm"
          style={{
            left: `${spore.x}%`,
            top: `${spore.y}%`,
            width: `${spore.size}px`,
            height: `${spore.size}px`,
            opacity: spore.opacity,
          }}
        />
      ))}

      {gameState === 'playing' && (
        <>
          {/* Mushroom */}
          <MemoizedGrumblecap 
            isDropping={isDroppingRef.current} 
            isCrashed={false}
            isSpinning={isSpinning}
            style={{ 
              left: `${mushroomPosRef.current.x}%`, 
              top: `${mushroomPosRef.current.y}%`,
              transform: isDroppingRef.current ? 'rotate(0deg)' : `rotate(${velocityRef.current.x * 5}deg)`,
              width: isMobile ? '8%' : '5%',
              height: isMobile ? '8%' : '5%',
            }}
          />
          
          {/* Fungal Shelves */}
          {mossPadsRef.current.map((pad, i) => {
            const breathScale = 1 + Math.sin(pad.breathPhase * Math.PI / 180) * 0.05;
            const glowPulse = Math.sin(pad.breathPhase * Math.PI / 180) * 0.3 + 0.7;
            const deflateScale = pad.isDeflating ? 1 - pad.deflateProgress : 1;
            const deflateOpacity = pad.isDeflating ? 1 - pad.deflateProgress : 1;
            // 27th pad (id 26, 0-indexed) is extra faded
            const is27thPad = pad.id === 26;
            const baseOpacity = is27thPad ? 0.35 : 1;
            
            return (
              <div
                key={`pad-${i}`}
                className="absolute transition-none z-10"
                style={{
                  left: `${pad.x}%`,
                  top: `${pad.y}%`,
                  opacity: deflateOpacity * baseOpacity,
                }}
              >
                <div 
                  className="relative rounded-full will-change-transform"
                  style={{
                    width: `${pad.width}vw`,
                    height: `${pad.height}vh`,
                    transform: isMobile 
                      ? `scale(${deflateScale})` 
                      : `scale(${breathScale * deflateScale}, ${(1 / breathScale) * deflateScale})`,
                  }}
                >
                  {/* Glow layer - simplified on mobile */}
                  {!isMobile && (
                    <div 
                      className="absolute inset-0 rounded-full blur-md"
                      style={{
                        background: `radial-gradient(circle, hsl(var(--fungal-glow)) ${glowPulse * pad.glowIntensity * 100}%, transparent)`,
                        boxShadow: `0 0 ${20 * pad.glowIntensity * glowPulse}px hsl(var(--fungal-glow))`,
                      }}
                    />
                  )}
                  {/* Shelf surface */}
                  <div 
                    className="absolute inset-0 rounded-full border-2"
                    style={{
                      background: isMobile 
                        ? `hsl(var(--fungal-shelf))` 
                        : `radial-gradient(ellipse at 50% 30%, hsl(var(--fungal-shelf)), hsl(var(--accent)))`,
                      borderColor: `hsl(var(--fungal-glow) / 0.5)`,
                    }}
                  />
                </div>
                {score < 3 && !pad.isDeflating && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-primary whitespace-nowrap bg-background/80 px-2 py-1 rounded z-20">
                    LAND HERE
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Foreground - Fireflies */}
      {gameState === 'playing' && firefliesRef.current.map((firefly, i) => {
        const blinkIntensity = Math.max(0, Math.sin(firefly.blinkPhase * Math.PI / 180));
        return (
          <div
            key={`firefly-${i}`}
            className="absolute rounded-full z-30"
            style={{
              left: `${firefly.x}%`,
              top: `${firefly.y}%`,
              width: `${firefly.size}px`,
              height: `${firefly.size}px`,
              background: `hsl(var(--firefly-blue))`,
              opacity: firefly.opacity * blinkIntensity,
            }}
          />
        );
      })}

      {/* Foreground - Raindrops */}
      {gameState === 'playing' && raindropsRef.current.map((drop, i) => (
        <div
          key={`rain-${i}`}
          className="absolute rounded-full bg-foreground/20 z-40"
          style={{
            left: `${drop.x}%`,
            top: `${drop.y}%`,
            width: `${drop.size}px`,
            height: `${drop.size * 1.5}px`,
            opacity: drop.opacity,
          }}
        />
      ))}

      {/* Foreground - Tiny gnats */}
      {gameState === 'playing' && gnatsRef.current.map((gnat, i) => (
        <div
          key={`gnat-${i}`}
          className="absolute rounded-full bg-background z-30"
          style={{
            left: `${gnat.x}%`,
            top: `${gnat.y}%`,
            width: `${gnat.size}px`,
            height: `${gnat.size}px`,
            opacity: gnat.opacity,
          }}
        />
      ))}

      {/* Spore Burst Effect */}
      {gameState === 'playing' && sporeBurstRef.current.particles.map((p, i) => {
        const x = sporeBurstRef.current.x + Math.cos(p.angle * Math.PI / 180) * p.distance;
        const y = sporeBurstRef.current.y + Math.sin(p.angle * Math.PI / 180) * p.distance;
        return (
          <div
            key={`burst-${i}`}
            className="absolute rounded-full z-40"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: isMobile ? '10px' : '8px',
              height: isMobile ? '10px' : '8px',
              background: 'hsl(var(--primary))',
              boxShadow: '0 0 12px hsl(var(--primary)), 0 0 20px hsl(var(--primary) / 0.5)',
              opacity: p.opacity,
            }}
          />
        );
      })}

      {/* Crash Screen */}
      {gameState === 'crashed' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-destructive/20 backdrop-blur-sm">
          <div className="mb-4">
            <Grumblecap isDropping={false} isCrashed={true} />
          </div>
          <p className="text-4xl font-bold text-foreground mb-2">Score: {score}</p>
          <Button 
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              startGame();
            }}
            className="text-2xl px-8 py-6 mt-4"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

// Memoized Grumblecap wrapper to prevent unnecessary re-renders
const MemoizedGrumblecap = memo(({ isDropping, isCrashed, isSpinning, style }: { 
  isDropping: boolean; 
  isCrashed: boolean;
  isSpinning?: boolean;
  style?: React.CSSProperties;
}) => (
  <div 
    className={`absolute transition-transform z-20 ${isSpinning ? 'animate-spin' : ''}`} 
    style={{ ...style, animationDuration: isSpinning ? '0.3s' : undefined }}
  >
    <Grumblecap isDropping={isDropping} isCrashed={isCrashed} />
  </div>
));
