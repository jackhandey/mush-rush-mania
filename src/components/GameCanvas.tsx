import { useEffect, useRef, useState } from 'react';
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
}

export const GameCanvas = () => {
  const [gameState, setGameState] = useState<'tutorial' | 'menu' | 'playing' | 'crashed'>('tutorial');
  const [showTutorial, setShowTutorial] = useState(true);
  const [score, setScore] = useState(0);
  const [mushroomPos, setMushroomPos] = useState({ x: 50, y: 80 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isDropping, setIsDropping] = useState(false);
  const [obstacles, setObstacles] = useState<GameObject[]>([]);
  const [mossPads, setMossPads] = useState<MossPad[]>([]);
  const [worldScrollSpeed, setWorldScrollSpeed] = useState(0);
  const gameLoopRef = useRef<number>();

  const startGame = () => {
    setShowTutorial(false);
    setGameState('playing');
    setScore(0);
    setMushroomPos({ x: 50, y: 75 }); // Center of screen
    setIsDropping(false);
    setWorldScrollSpeed(2); // Start scrolling
    initializeObstacles();
    launch();
  };

  const initializeObstacles = () => {
    const newObstacles: GameObject[] = [];
    const newMossPads: MossPad[] = [];
    
    // Create background scenery (logs/trees) scattered across the view
    for (let i = 0; i < 10; i++) {
      newObstacles.push({
        x: i * 15,
        y: 10 + Math.random() * 50, // Scattered at different heights
        width: 12,
        height: 6,
      });
    }
    
    // Create moss pads at the bottom - these are what you land on
    for (let i = 0; i < 8; i++) {
      newMossPads.push({
        x: i * 20,
        y: 75,
        width: 19.5,
        height: 4.8,
        angle: i * 45,
        speed: 0.16,
      });
    }
    
    setObstacles(newObstacles);
    setMossPads(newMossPads);
  };

  const launch = () => {
    // Simple upward launch - no horizontal movement needed
    setVelocity({ x: 0, y: -12 });
    setIsDropping(false);
  };

  const handleTap = () => {
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
      setVelocity({ x: 0, y: 13 }); // Slightly slower drop (was 15)
      toast('THWACK!', { duration: 500 });
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      // Scroll the world continuously
      setObstacles(obs => {
        const scrolled = obs.map(o => ({ ...o, x: o.x - worldScrollSpeed * 0.1 }));
        // Remove off-screen obstacles and add new ones on the right
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
        const scrolled = pads.map(p => ({ ...p, x: p.x - worldScrollSpeed * 0.1 }));
        // Remove off-screen pads and add new ones on the right
        const visible = scrolled.filter(p => p.x > -20);
        while (visible.length < 8) {
          const lastX = visible.length > 0 ? Math.max(...visible.map(p => p.x)) : 100;
          visible.push({
            x: lastX + 20,
            y: 75,
            width: 19.5,
            height: 4.8,
            angle: Math.random() * 360,
            speed: 0.16,
          });
        }
        return visible;
      });
      
      setMushroomPos(prev => {
        // Mushroom stays centered, world moves
        let newX = prev.x;
        let newY = prev.y + velocity.y * 0.1;
        
        // Slightly slower gravity for more control
        if (!isDropping) {
          setVelocity(v => ({ ...v, y: v.y + 0.55 })); // Reduced from 0.6
        }
        
        // Check boundaries - only top and bottom matter now
        if (newY > 95 || newY < 0) {
          setGameState('crashed');
          setWorldScrollSpeed(0);
          toast.error(`Crashed! Score: ${score}`, { duration: 2000 });
          return prev;
        }
        
        // Check collision with mushroom hitbox
        const mushroomBox = { x: newX + 1, y: newY + 1, width: 3, height: 3 };
        
        // Check landing on moss pad
        let landedPad: MossPad | null = null;
        mossPads.forEach(pad => {
          if (checkCollision(mushroomBox, pad) && velocity.y > 0) {
            landedPad = pad;
          }
        });
        
        if (landedPad && isDropping) {
          setScore(s => s + 1);
          toast.success('BOING!', { duration: 500 });
          launch();
          return { x: newX, y: landedPad.y - 5 };
        }
        
        return { x: newX, y: newY };
      });
      
      // Update moss pads animation (wiggling)
      setMossPads(pads => pads.map(pad => ({
        ...pad,
        angle: (pad.angle + 1) % 360,
      })));
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, velocity, isDropping, obstacles, mossPads, score]);

  const checkCollision = (a: GameObject, b: GameObject) => {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  };

  return (
    <div 
      className="relative w-full h-screen bg-gradient-to-b from-game-bgStart to-game-bgEnd overflow-hidden cursor-pointer select-none"
      onClick={handleTap}
      onTouchStart={(e) => {
        e.preventDefault();
        handleTap();
      }}
    >
      {/* Tutorial */}
      {gameState === 'tutorial' && showTutorial && (
        <Tutorial onComplete={() => setGameState('menu')} />
      )}
      
      {/* Score */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-6xl font-bold text-foreground z-10">
        {score}
      </div>
      
      {/* Menu Screen */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-background/80 backdrop-blur-sm">
          <h1 className="text-7xl font-bold text-primary mb-4 tracking-wider">
            MUSH-RUSH
          </h1>
          
          {/* Instructions */}
          <div className="bg-card border-2 border-primary rounded-lg p-6 max-w-md mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">How to Play:</h2>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">1</div>
                <p className="text-lg text-muted-foreground">Mushroom launches automatically</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">2</div>
                <p className="text-lg text-muted-foreground">TAP to drop straight down</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">3</div>
                <p className="text-lg text-muted-foreground">Land on green moss pads = +1 point!</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground font-bold flex-shrink-0">!</div>
                <p className="text-lg text-muted-foreground">Avoid brown logs or you crash</p>
              </div>
            </div>
          </div>
          
          <p className="text-3xl text-foreground mb-4 font-bold animate-pulse">TAP ANYWHERE TO START</p>
          <div className="animate-bounce-slow">
            <Grumblecap isDropping={false} isCrashed={false} />
          </div>
        </div>
      )}

      {/* Game Objects */}
      {gameState === 'playing' && (
        <>
          {/* Mushroom */}
          <div 
            className="absolute transition-transform"
            style={{ 
              left: `${mushroomPos.x}%`, 
              top: `${mushroomPos.y}%`,
              transform: isDropping ? 'rotate(0deg)' : `rotate(${velocity.x * 5}deg)`,
            }}
          >
            <Grumblecap isDropping={isDropping} isCrashed={false} />
          </div>
          
          {/* Background Scenery (logs/trees flying by) */}
          {obstacles.map((obs, i) => (
            <div
              key={`obs-${i}`}
              className="absolute bg-game-log border-2 border-accent rounded-lg opacity-60"
              style={{
                left: `${obs.x}%`,
                top: `${obs.y}%`,
                width: `${obs.width}%`,
                height: `${obs.height}%`,
              }}
            />
          ))}
          
          {/* Moss Pads with Labels */}
          {mossPads.map((pad, i) => (
            <div
              key={`pad-${i}`}
              className="absolute transition-all"
              style={{
                left: `${pad.x}%`,
                top: `${pad.y}%`,
              }}
            >
              <div 
                className="bg-game-moss border-2 border-primary rounded-full shadow-lg shadow-primary/50"
                style={{
                  width: `${pad.width}vw`,
                  height: `${pad.height}vh`,
                }}
              />
              {score < 3 && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-primary whitespace-nowrap bg-background/80 px-2 py-1 rounded">
                  LAND HERE
                </div>
              )}
            </div>
          ))}
        </>
      )}

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
