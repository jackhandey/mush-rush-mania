import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Grumblecap } from './Grumblecap';
import { ParallaxBackground } from './ParallaxBackground';
import { toast } from 'sonner';
import { soundManager } from '@/utils/SoundManager';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';

interface MossPad {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  speed: number;
  breathPhase: number;
  glowIntensity: number;
  isDeflating: boolean;
  deflateProgress: number;
}

export const GameCanvas = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'crashed'>('menu');
  const [score, setScore] = useState(0);
  const [renderTick, setRenderTick] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  
  // Use refs for frequently updated values to avoid re-renders
  const mushroomPosRef = useRef({ x: 50, y: 80 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const isDroppingRef = useRef(false);
  const mossPadsRef = useRef<MossPad[]>([]);
  const sporeBurstRef = useRef<{ x: number; y: number; particles: { angle: number; distance: number; opacity: number }[] }>({ x: 0, y: 0, particles: [] });
  const worldScrollSpeedRef = useRef(0);
  const lastLandedPadIdRef = useRef<number | null>(null);
  const nextPadIdRef = useRef(0);
  
  const [isMuted, setIsMuted] = useState(false);
  const gameLoopRef = useRef<number>();
  const lastTapTime = useRef<number>(0);
  const frameCount = useRef(0);
  
  // Mobile detection
  const isMobile = window.innerWidth <= 768;

  // Preload sounds on mount
  useEffect(() => {
    soundManager.preload();
  }, []);

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    mushroomPosRef.current = { x: 50, y: 75 };
    velocityRef.current = { x: 0, y: 0 };
    isDroppingRef.current = false;
    worldScrollSpeedRef.current = isMobile ? 2.2 : 2.5;
    initializePads();
    launch();
  }, []);

  const initializePads = () => {
    const newMossPads: MossPad[] = [];
    
    const padWidth = isMobile ? 16 : 9;
    const padHeight = isMobile ? 5 : 3;
    
    // First pad starts AHEAD of mushroom (mushroom at x=50)
    let currentX = isMobile ? 54 : 56;
    for (let i = 0; i < 6; i++) {
      if (i > 0) {
        const progressFactor = Math.min(i / 4, 1);
        const minSpacing = isMobile ? (18 + progressFactor * 10) : (16 + progressFactor * 8);
        const maxSpacing = isMobile ? (22 + progressFactor * 18) : (20 + progressFactor * 17);
        const spacing = minSpacing + Math.random() * (maxSpacing - minSpacing);
        currentX += spacing;
      }
      
      const baseY = 75;
      const yVariance = i > 7 ? (isMobile ? 14 : 18) : 4;
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
    
    mossPadsRef.current = newMossPads;
  };

  const launch = useCallback(() => {
    // Consistent arc throughout game - difficulty comes from pad spacing
    // Flatter arc: less vertical velocity, lower gravity for longer hang time
    const horizontalVelocity = isMobile ? 85 : 24.14;
    const verticalVelocity = isMobile ? -14 : -17.8;
    
    velocityRef.current = { x: horizontalVelocity, y: verticalVelocity };
    isDroppingRef.current = false;
    soundManager.playLaunch();
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
      soundManager.playThwack();
      toast('THWACK!', { duration: 500 });
    }
  }, [gameState, startGame]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      const worldSpeed = worldScrollSpeedRef.current;
      
      // Update moss pads - mutate in place for performance
      const pads = mossPadsRef.current;
      let validPadCount = 0;
      for (let i = 0; i < pads.length; i++) {
        const p = pads[i];
        p.x -= worldSpeed * 0.1;
        if (p.x > -20) {
          p.angle = (p.angle + p.speed) % 360;
          p.breathPhase = (p.breathPhase + 2) % 360;
          p.y = 75 + Math.sin(p.angle * Math.PI / 180) * 5;
          pads[validPadCount++] = p;
        }
      }
      pads.length = validPadCount;
      
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
      // Vertical variance kicks in after score > 7, increases at 24, then every 33 pads after
      let yVariance = 4;
      if (score > 24) {
        const baseVariance = isMobile ? 22 : 28;
        const incrementsAfter24 = Math.floor((score - 24) / 33);
        const additionalVariance = incrementsAfter24 * (isMobile ? 4 : 5);
        yVariance = baseVariance + additionalVariance + (difficultyFactor * 15);
      } else if (score > 7) {
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
      
      // Update deflating pads - mutate in place
      let deflateValidCount = 0;
      for (let i = 0; i < mossPadsRef.current.length; i++) {
        const p = mossPadsRef.current[i];
        if (p.isDeflating) {
          p.deflateProgress += 0.08;
          if (p.deflateProgress < 1) {
            mossPadsRef.current[deflateValidCount++] = p;
          }
        } else {
          mossPadsRef.current[deflateValidCount++] = p;
        }
      }
      mossPadsRef.current.length = deflateValidCount;
      
      // Update spore burst - mutate in place
      if (sporeBurstRef.current.particles.length > 0) {
        const particles = sporeBurstRef.current.particles;
        let validCount = 0;
        for (let i = 0; i < particles.length; i++) {
          particles[i].distance += 1.5;
          particles[i].opacity -= 0.015;
          if (particles[i].opacity > 0) {
            particles[validCount++] = particles[i];
          }
        }
        particles.length = validCount;
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
        soundManager.playCrash();
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
        soundManager.playBoing();
        toast.success('BOING!', { duration: 500 });
        
        // Increase game speed after 24th pad
        if (newScore > 24) {
          const baseSpeed = isMobile ? 2.2 : 2.5;
          const speedIncrease = Math.min((newScore - 24) * 0.02, 1.5); // Cap at +1.5 speed
          worldScrollSpeedRef.current = baseSpeed + speedIncrease;
        }
        
        // Speed boost triggers
        if (newScore === 33 || newScore === 61 || newScore === 100) {
          worldScrollSpeedRef.current *= 1.5;
        }
        
        // Easter egg sounds at specific scores
        if (newScore === 451) {
          soundManager.playShock();
        } else if (newScore === 47) {
          soundManager.playSpaceship();
        } else if (newScore === 217) {
          soundManager.playGhost();
        } else if (newScore === 101) {
          soundManager.playAnnoying();
        } else if (newScore === 37) {
          soundManager.playSuck();
        } else if (newScore === 66) {
          soundManager.playLightsaber();
        } else if (newScore === 67) {
          soundManager.playKidsLaugh();
        } else if (newScore === 73) {
          soundManager.playNerdy();
        } else if (newScore === 19) {
          soundManager.playScaryUpbeat();
        } else if (newScore === 64) {
          soundManager.playFiery();
        } else if (newScore === 52) {
          soundManager.playHulk();
        } else if (newScore === 88 || newScore === 300) {
          soundManager.playSword();
        } else if (newScore === 142) {
          soundManager.playStaircase();
        } else if (newScore === 143) {
          soundManager.playLove();
        } else if (newScore === 187) {
          soundManager.playRecordScratch();
        } else if (newScore === 209) {
          soundManager.playPoliceSiren();
        } else if (newScore === 256) {
          soundManager.playPacman();
        } else if (newScore === 151) {
          soundManager.playPokemon();
        } else if (newScore === 138 || newScore === 182) {
          soundManager.playPunkGuitar();
        } else if (newScore === 212) {
          soundManager.playTraffic();
        } else if (newScore === 310) {
          soundManager.playOcean();
        } else if ([4, 8, 15, 16, 23].includes(newScore)) {
          soundManager.playRatchet();
        } else if (newScore === 42) {
          soundManager.playHumanSigh();
        }
        
        // 113th jump - mushroom spin
        if (newScore === 113) {
          setIsSpinning(true);
          setTimeout(() => setIsSpinning(false), 1000);
        }
        
        // Deflate the previous pad if it's still visible
        if (lastLandedPadIdRef.current !== null && lastLandedPadIdRef.current !== landedPad.id) {
          for (let i = 0; i < mossPadsRef.current.length; i++) {
            if (mossPadsRef.current[i].id === lastLandedPadIdRef.current) {
              mossPadsRef.current[i].isDeflating = true;
              break;
            }
          }
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
        
        // Update glow intensity
        for (let i = 0; i < mossPadsRef.current.length; i++) {
          if (mossPadsRef.current[i] === landedPad) {
            mossPadsRef.current[i].glowIntensity = 1;
          }
        }
        setTimeout(() => {
          for (let i = 0; i < mossPadsRef.current.length; i++) {
            if (mossPadsRef.current[i] === landedPad) {
              mossPadsRef.current[i].glowIntensity = 0.5 + Math.random() * 0.5;
            }
          }
        }, 200);
        
        mushroomPosRef.current = { x: mushroomPosRef.current.x, y: landedPad.y - 5 };
        
        // 11th jump - louder launch
        if (newScore === 11) {
          soundManager.playLaunchLoud();
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
      className="relative w-full h-screen overflow-hidden cursor-pointer select-none safe-area-container"
      style={{
        background: 'linear-gradient(to bottom, hsl(var(--game-bg-start)), hsl(var(--game-bg-end)))',
      }}
      onClick={handleTap}
      onTouchStart={(e) => {
        e.preventDefault();
        handleTap();
      }}
    >
      {/* Parallax Background System */}
      <ParallaxBackground 
        isPlaying={gameState === 'playing'} 
        worldSpeed={worldScrollSpeedRef.current || (isMobile ? 2.2 : 2.5)} 
      />

      {/* Score and Mute Button */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-6xl font-bold text-foreground z-10 drop-shadow-lg safe-area-top">
        {score}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          const newMuted = soundManager.toggleMute();
          setIsMuted(newMuted);
        }}
        className="absolute top-4 right-4 p-3 bg-background/50 hover:bg-background/70 rounded-full transition-colors z-10 backdrop-blur-sm safe-area-top"
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>
      
      {/* Menu Screen */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-background/70 backdrop-blur-md">
          <h1 className="text-5xl md:text-7xl font-bold text-primary mb-8 tracking-wider drop-shadow-[0_0_30px_hsl(var(--primary)/0.5)]">
            MUSH RUSH MANIA
          </h1>
          
          <div className="mb-8 animate-bounce-slow">
            <Grumblecap isDropping={false} isCrashed={false} />
          </div>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-2">tap to land on the logs</p>
          <p className="text-2xl md:text-3xl text-foreground font-bold animate-pulse">TAP TO START</p>
        </div>
      )}

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
          
          {/* Floating Logs / Mossy Rocks - Simplified on mobile */}
          {mossPadsRef.current.map((pad, i) => {
            const deflateScale = pad.isDeflating ? 1 - pad.deflateProgress : 1;
            const deflateOpacity = pad.isDeflating ? 1 - pad.deflateProgress : 1;
            const is27thPad = pad.id === 26;
            const baseOpacity = is27thPad ? 0.35 : 1;
            
            // Mobile: Simple static pads for performance
            if (isMobile) {
              return (
                <div
                  key={`pad-${i}`}
                  className="absolute z-10"
                  style={{
                    left: `${pad.x}%`,
                    top: `${pad.y}%`,
                    opacity: deflateOpacity * baseOpacity,
                    transform: `scale(${deflateScale})`,
                  }}
                >
                  <svg 
                    style={{
                      width: `${pad.width}vw`,
                      height: `${pad.height * 1.2}vh`,
                    }}
                    viewBox="0 0 100 40" 
                    preserveAspectRatio="none"
                  >
                    <ellipse cx="50" cy="22" rx="48" ry="16" fill="hsl(var(--log-dark))" />
                    <ellipse cx="50" cy="20" rx="46" ry="14" fill="hsl(var(--log-color))" />
                    <ellipse cx="50" cy="12" rx="35" ry="8" fill="hsl(var(--platform-moss))" />
                  </svg>
                  {score < 3 && !pad.isDeflating && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-foreground whitespace-nowrap bg-background/70 px-2 py-1 rounded z-20 border border-foreground/20">
                      ↓ LAND HERE
                    </div>
                  )}
                </div>
              );
            }
            
            // Desktop: Full visual detail
            const wobble = Math.sin(pad.breathPhase * Math.PI / 180) * 1.5;
            const isLog = pad.id % 2 === 0;
            
            return (
              <div
                key={`pad-${i}`}
                className="absolute transition-none z-10"
                style={{
                  left: `${pad.x}%`,
                  top: `${pad.y + wobble * 0.1}%`,
                  opacity: deflateOpacity * baseOpacity,
                }}
              >
                {isLog ? (
                  <svg 
                    className="will-change-transform"
                    style={{
                      width: `${pad.width}vw`,
                      height: `${pad.height * 1.2}vh`,
                      transform: `scale(${deflateScale}) rotate(${wobble}deg)`,
                      filter: 'drop-shadow(0 4px 8px hsl(0 0% 0% / 0.5))',
                    }}
                    viewBox="0 0 100 40" 
                    preserveAspectRatio="none"
                  >
                    <ellipse cx="50" cy="22" rx="48" ry="16" fill="hsl(var(--log-dark))" />
                    <ellipse cx="50" cy="20" rx="46" ry="14" fill="hsl(var(--log-color))" />
                    <path d="M15,18 Q25,15 35,18" stroke="hsl(var(--log-dark))" strokeWidth="1.5" fill="none" opacity="0.6" />
                    <path d="M55,16 Q70,13 85,17" stroke="hsl(var(--log-dark))" strokeWidth="1.5" fill="none" opacity="0.6" />
                    <ellipse cx="25" cy="12" rx="12" ry="5" fill="hsl(var(--platform-moss))" opacity="0.8" />
                    <ellipse cx="65" cy="10" rx="15" ry="6" fill="hsl(var(--platform-moss))" opacity="0.9" />
                    <ellipse cx="45" cy="8" rx="8" ry="4" fill="hsl(var(--platform-moss))" opacity="0.7" />
                  </svg>
                ) : (
                  <svg 
                    className="will-change-transform"
                    style={{
                      width: `${pad.width}vw`,
                      height: `${pad.height * 1.3}vh`,
                      transform: `scale(${deflateScale}) rotate(${wobble * 0.5}deg)`,
                      filter: 'drop-shadow(0 4px 8px hsl(0 0% 0% / 0.5))',
                    }}
                    viewBox="0 0 100 45" 
                    preserveAspectRatio="none"
                  >
                    <path 
                      d="M5,35 C8,28 3,22 10,15 C18,8 30,5 50,5 C70,5 82,8 90,15 C97,22 92,28 95,35 C92,40 70,42 50,42 C30,42 8,40 5,35 Z"
                      fill="hsl(var(--rock-dark))"
                    />
                    <path 
                      d="M8,32 C10,26 6,20 12,14 C20,8 32,6 50,6 C68,6 80,8 88,14 C94,20 90,26 92,32 C88,36 68,38 50,38 C32,38 12,36 8,32 Z"
                      fill="hsl(var(--rock-surface))"
                    />
                    <path 
                      d="M15,25 C20,18 35,12 50,10 C65,12 80,18 85,25 C80,22 65,18 50,17 C35,18 20,22 15,25 Z"
                      fill="hsl(var(--platform-moss))"
                      opacity="0.9"
                    />
                    <ellipse cx="30" cy="15" rx="10" ry="5" fill="hsl(var(--platform-moss))" opacity="0.7" />
                    <ellipse cx="70" cy="14" rx="8" ry="4" fill="hsl(var(--platform-moss))" opacity="0.8" />
                  </svg>
                )}
                {score < 3 && !pad.isDeflating && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-foreground whitespace-nowrap bg-background/70 px-2 py-1 rounded z-20 border border-foreground/20">
                    ↓ LAND HERE
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Foreground particle effects are now handled by ParallaxBackground */}

      {/* Spore Burst Effect */}
      {gameState === 'playing' && sporeBurstRef.current.particles.map((p, i) => {
        const x = sporeBurstRef.current.x + Math.cos(p.angle * Math.PI / 180) * p.distance;
        const y = sporeBurstRef.current.y + Math.sin(p.angle * Math.PI / 180) * p.distance;
        const particleSize = isMobile ? '10px' : '8px';
        return (
          <div
            key={`burst-${i}`}
            className="absolute rounded-full z-40"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: particleSize,
              height: particleSize,
              background: 'hsl(var(--primary))',
              boxShadow: isMobile ? 'none' : '0 0 12px hsl(var(--primary)), 0 0 20px hsl(var(--primary) / 0.5)',
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
