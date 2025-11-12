import { useEffect, useRef, useState, useCallback } from 'react';
import { Grumblecap } from './Grumblecap';
import { Tutorial } from './Tutorial';
import { toast } from 'sonner';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MossPad extends GameObject {
  angle: number;
  speed: number;
  breathPhase: number;
  glowIntensity: number;
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
  const [gameState, setGameState] = useState<'tutorial' | 'menu' | 'playing' | 'crashed'>('menu');
  const [showTutorial, setShowTutorial] = useState(false);
  const [score, setScore] = useState(0);
  const [mushroomPos, setMushroomPos] = useState({ x: 50, y: 80 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isDropping, setIsDropping] = useState(false);
  const [obstacles, setObstacles] = useState<GameObject[]>([]);
  const [mossPads, setMossPads] = useState<MossPad[]>([]);
  const [spores, setSpores] = useState<Particle[]>([]);
  const [fireflies, setFireflies] = useState<Firefly[]>([]);
  const [raindrops, setRaindrops] = useState<Raindrop[]>([]);
  const [gnats, setGnats] = useState<Particle[]>([]);
  const [worldScrollSpeed, setWorldScrollSpeed] = useState(0);
  const gameLoopRef = useRef<number>();

  const checkCollision = useCallback((a: GameObject, b: GameObject) => {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }, []);

  const startGame = useCallback(() => {
    setShowTutorial(false);
    setGameState('playing');
    setScore(0);
    setMushroomPos({ x: 50, y: 75 });
    setVelocity({ x: 0, y: 0 });
    setIsDropping(false);
    setWorldScrollSpeed(2);
    initializeObstacles();
    launch();
  }, []);

  const initializeObstacles = () => {
    const newObstacles: GameObject[] = [];
    const newMossPads: MossPad[] = [];
    
    // Create background scenery (roots/leaves) scattered across the view
    for (let i = 0; i < 10; i++) {
      newObstacles.push({
        x: i * 15,
        y: 10 + Math.random() * 50,
        width: 12,
        height: 6,
      });
    }
    
    // Create fungal shelves - starting from left edge
    for (let i = 0; i < 12; i++) {
      newMossPads.push({
        x: i * 15 + 5,
        y: 75,
        width: 10.18,
        height: 3.5,
        angle: i * 45,
        speed: 0.5 + (Math.random() * 0.3),
        breathPhase: Math.random() * 360,
        glowIntensity: 0.5 + Math.random() * 0.5,
      });
    }
    
    // Initialize spores (mid-ground particles)
    const newSpores: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      newSpores.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.4,
        speed: 0.05 + Math.random() * 0.1,
        drift: Math.random() * 0.5 - 0.25,
      });
    }
    
    // Initialize fireflies (foreground)
    const newFireflies: Firefly[] = [];
    for (let i = 0; i < 8; i++) {
      newFireflies.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        opacity: 0.6,
        speed: 0.1 + Math.random() * 0.15,
        drift: Math.random() * 0.3 - 0.15,
        blinkPhase: Math.random() * 360,
        blinkSpeed: 2 + Math.random() * 3,
      });
    }
    
    // Initialize raindrops (foreground)
    const newRaindrops: Raindrop[] = [];
    for (let i = 0; i < 3; i++) {
      newRaindrops.push({
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        size: 40 + Math.random() * 60,
        opacity: 0.15,
        speed: 0.3 + Math.random() * 0.2,
        drift: 0,
        blur: 15 + Math.random() * 10,
      });
    }
    
    // Initialize gnats (foreground)
    const newGnats: Particle[] = [];
    for (let i = 0; i < 15; i++) {
      newGnats.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 0.5 + Math.random() * 1,
        opacity: 0.4 + Math.random() * 0.3,
        speed: 0.3 + Math.random() * 0.4,
        drift: Math.random() * 1 - 0.5,
      });
    }
    
    setObstacles(newObstacles);
    setMossPads(newMossPads);
    setSpores(newSpores);
    setFireflies(newFireflies);
    setRaindrops(newRaindrops);
    setGnats(newGnats);
  };

  const launch = useCallback(() => {
    const horizontalVelocity = 6;
    const verticalVelocity = -12;
    
    setVelocity({ x: horizontalVelocity, y: verticalVelocity });
    setIsDropping(false);
  }, []);

  const handleTap = useCallback(() => {
    if (gameState === 'tutorial') return;
    
    if (gameState === 'menu') {
      startGame();
      return;
    }
    
    if (gameState === 'crashed') {
      startGame();
      return;
    }
    
    if (gameState === 'playing' && !isDropping) {
      setIsDropping(true);
      setVelocity({ x: 0, y: 15 });
      toast('THWACK!', { duration: 500 });
    }
  }, [gameState, isDropping, startGame]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      setObstacles(obs => {
        const scrolled = obs.map(o => ({ ...o, x: o.x - worldScrollSpeed * 0.1 }));
        const visible = scrolled.filter(o => o.x > -20);
        while (visible.length < 10) {
          const lastX = visible.length > 0 ? Math.max(...visible.map(o => o.x)) : 100;
          visible.push({
            x: lastX + 15,
            y: 10 + Math.random() * 50,
            width: 12,
            height: 6,
          });
        }
        return visible;
      });
      
      setMossPads(pads => {
        const scrolled = pads.map(p => {
          const newAngle = (p.angle + p.speed) % 360;
          const newBreathPhase = (p.breathPhase + 2) % 360;
          const baseY = 75;
          const verticalOffset = Math.sin(newAngle * Math.PI / 180) * 5;
          
          return {
            ...p,
            x: p.x - worldScrollSpeed * 0.1,
            y: baseY + verticalOffset,
            angle: newAngle,
            breathPhase: newBreathPhase,
          };
        });
        
        const visible = scrolled.filter(p => p.x > -20);
        while (visible.length < 12) {
          const lastX = visible.length > 0 ? Math.max(...visible.map(p => p.x)) : 100;
          visible.push({
            x: lastX + 15,
            y: 75,
            width: 10.18,
            height: 3.5,
            angle: Math.random() * 360,
            speed: 0.5 + (Math.random() * 0.3),
            breathPhase: Math.random() * 360,
            glowIntensity: 0.5 + Math.random() * 0.5,
          });
        }
        return visible;
      });
      
      setSpores(prev => prev.map(s => ({
        ...s,
        y: s.y + s.speed,
        x: s.x + s.drift,
        ...(s.y > 110 && { y: -10, x: Math.random() * 100 })
      })));
      
      setFireflies(prev => prev.map(f => ({
        ...f,
        x: f.x + f.drift,
        y: f.y + f.speed * 0.5,
        blinkPhase: (f.blinkPhase + f.blinkSpeed) % 360,
        ...(f.x > 110 && { x: -10 }),
        ...(f.x < -10 && { x: 110 }),
        ...(f.y > 110 && { y: -10 })
      })));
      
      setRaindrops(prev => prev.map(r => ({
        ...r,
        y: r.y + r.speed,
        ...(r.y > 110 && { y: -r.size, x: Math.random() * 100 })
      })));
      
      setGnats(prev => prev.map(g => ({
        ...g,
        x: g.x + g.drift,
        y: g.y + g.speed * Math.sin(Date.now() * 0.01) * 0.2,
        ...(g.x > 110 && { x: -10 }),
        ...(g.x < -10 && { x: 110 })
      })));
      
      setMushroomPos(prev => {
        let newX = prev.x;
        let newY = prev.y + velocity.y * 0.1;
        
        if (!isDropping) {
          setVelocity(v => ({ ...v, y: v.y + 0.55 }));
        }
        
        if (newY > 82 || newY < 0) {
          setGameState('crashed');
          setWorldScrollSpeed(0);
          toast.error(`Crashed! Score: ${score}`, { duration: 2000 });
          return prev;
        }
        
        // Use center point of mushroom for precise landing detection
        const mushroomCenterX = newX + 2.5; // Center of 5% wide mushroom
        const mushroomBottomY = newY + 5;   // Bottom of mushroom
        
        let landedPad: MossPad | null = null;
        mossPads.forEach(pad => {
          // Require mushroom center to be within pad boundaries
          if (velocity.y > 0 && 
              mushroomCenterX >= pad.x && 
              mushroomCenterX <= pad.x + pad.width &&
              mushroomBottomY >= pad.y && 
              mushroomBottomY <= pad.y + pad.height) {
            landedPad = pad;
          }
        });
        
        if (landedPad && isDropping) {
          setScore(s => s + 1);
          toast.success('BOING!', { duration: 500 });
          
          setMossPads(pads => pads.map(p => 
            p === landedPad ? { ...p, glowIntensity: 1 } : p
          ));
          setTimeout(() => {
            setMossPads(pads => pads.map(p => 
              p === landedPad ? { ...p, glowIntensity: 0.5 + Math.random() * 0.5 } : p
            ));
          }, 200);
          
          launch();
          return { x: newX, y: landedPad.y - 5 };
        }
        
        return { x: newX, y: newY };
      });
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, velocity, isDropping, worldScrollSpeed, mossPads, score, launch, checkCollision]);


  return (
    <div 
      className="relative w-full h-screen bg-gradient-to-b from-game-bgStart to-game-bgEnd overflow-hidden cursor-pointer select-none"
      onClick={handleTap}
      onTouchStart={(e) => {
        e.preventDefault();
        handleTap();
      }}
    >
      {/* Tutorial - only when explicitly shown */}
      {showTutorial && (
        <Tutorial onComplete={() => {
          setShowTutorial(false);
          setGameState('menu');
        }} />
      )}
      
      {/* Score */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-6xl font-bold text-foreground z-10">
        {score}
      </div>
      
      {/* Menu Screen */}
      {gameState === 'menu' && !showTutorial && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-background/80 backdrop-blur-sm">
          <h1 className="text-7xl font-bold text-primary mb-8 tracking-wider">
            MUSH-RUSH
          </h1>
          
          <div className="mb-8 animate-bounce-slow">
            <Grumblecap isDropping={false} isCrashed={false} />
          </div>
          
          <div className="space-y-4">
            <p className="text-3xl text-foreground font-bold animate-pulse">TAP TO START</p>
            <button
              onClick={() => setShowTutorial(true)}
              className="px-6 py-2 text-lg text-muted-foreground hover:text-foreground underline"
            >
              Show Tutorial
            </button>
          </div>
        </div>
      )}

      {/* Background Layer - Far (Cathedral of roots) */}
      <div className="absolute inset-0 overflow-hidden opacity-40 blur-md">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-game-bgStart via-accent/20 to-game-bgEnd" />
        {/* God rays */}
        <div className="absolute top-0 left-20 w-1 h-full bg-gradient-to-b from-foreground/10 to-transparent rotate-12 blur-sm" />
        <div className="absolute top-0 right-32 w-1 h-full bg-gradient-to-b from-foreground/8 to-transparent -rotate-6 blur-sm" />
      </div>

      {/* Background Scenery (blurry roots/leaves) */}
      {gameState === 'playing' && obstacles.map((obs, i) => (
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
      {gameState === 'playing' && spores.map((spore, i) => (
        <div
          key={`spore-${i}`}
          className="absolute rounded-full bg-game-sporeGlow blur-sm animate-pulse"
          style={{
            left: `${spore.x}%`,
            top: `${spore.y}%`,
            width: `${spore.size}px`,
            height: `${spore.size}px`,
            opacity: spore.opacity,
            boxShadow: `0 0 ${spore.size * 2}px hsl(var(--spore-glow))`,
          }}
        />
      ))}

      {/* Game Objects */}
      {gameState === 'playing' && (
        <>
          {/* Mushroom */}
          <div 
            className="absolute transition-transform z-20"
            style={{ 
              left: `${mushroomPos.x}%`, 
              top: `${mushroomPos.y}%`,
              transform: isDropping ? 'rotate(0deg)' : `rotate(${velocity.x * 5}deg)`,
            }}
          >
            <Grumblecap isDropping={isDropping} isCrashed={false} />
          </div>
          
          {/* Fungal Shelves - Bioluminescent and breathing */}
          {mossPads.map((pad, i) => {
            const breathScale = 1 + Math.sin(pad.breathPhase * Math.PI / 180) * 0.05;
            const glowPulse = Math.sin(pad.breathPhase * Math.PI / 180) * 0.3 + 0.7;
            
            return (
              <div
                key={`pad-${i}`}
                className="absolute transition-none z-10"
                style={{
                  left: `${pad.x}%`,
                  top: `${pad.y}%`,
                }}
              >
                <div 
                  className="relative rounded-full"
                  style={{
                    width: `${pad.width}vw`,
                    height: `${pad.height}vh`,
                    transform: `scale(${breathScale}, ${1 / breathScale})`,
                    transition: 'transform 0.3s ease-in-out',
                  }}
                >
                  {/* Glow layer */}
                  <div 
                    className="absolute inset-0 rounded-full blur-md"
                    style={{
                      background: `radial-gradient(circle, hsl(var(--fungal-glow)) ${glowPulse * pad.glowIntensity * 100}%, transparent)`,
                      boxShadow: `0 0 ${20 * pad.glowIntensity * glowPulse}px hsl(var(--fungal-glow))`,
                    }}
                  />
                  {/* Shelf surface */}
                  <div 
                    className="absolute inset-0 rounded-full border-2"
                    style={{
                      background: `radial-gradient(ellipse at 50% 30%, hsl(var(--fungal-shelf)), hsl(var(--accent)))`,
                      borderColor: `hsl(var(--fungal-glow) / ${0.3 + glowPulse * 0.4})`,
                    }}
                  />
                </div>
                {score < 3 && (
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
      {gameState === 'playing' && fireflies.map((firefly, i) => {
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
              boxShadow: blinkIntensity > 0.5 ? `0 0 ${firefly.size * 3}px hsl(var(--firefly-blue))` : 'none',
            }}
          />
        );
      })}

      {/* Foreground - Giant raindrops */}
      {gameState === 'playing' && raindrops.map((drop, i) => (
        <div
          key={`rain-${i}`}
          className="absolute rounded-full bg-foreground/20 z-40"
          style={{
            left: `${drop.x}%`,
            top: `${drop.y}%`,
            width: `${drop.size}px`,
            height: `${drop.size * 1.5}px`,
            opacity: drop.opacity,
            filter: `blur(${drop.blur}px)`,
          }}
        />
      ))}

      {/* Foreground - Tiny gnats */}
      {gameState === 'playing' && gnats.map((gnat, i) => (
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

      {/* Crash Screen */}
      {gameState === 'crashed' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-destructive/20 backdrop-blur-sm">
          <div className="mb-4">
            <Grumblecap isDropping={false} isCrashed={true} />
          </div>
          <p className="text-4xl font-bold text-foreground mb-2">Score: {score}</p>
          <p className="text-xl text-muted-foreground">Tap to Retry</p>
        </div>
      )}
    </div>
  );
};
