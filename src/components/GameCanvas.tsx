import { useEffect, useRef, useState } from 'react';
import { Grumblecap } from './Grumblecap';
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
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'crashed'>('menu');
  const [score, setScore] = useState(0);
  const [mushroomPos, setMushroomPos] = useState({ x: 50, y: 80 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isDropping, setIsDropping] = useState(false);
  const [obstacles, setObstacles] = useState<GameObject[]>([]);
  const [mossPads, setMossPads] = useState<MossPad[]>([]);
  const gameLoopRef = useRef<number>();

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setMushroomPos({ x: 50, y: 80 });
    setIsDropping(false);
    initializeObstacles();
    launch();
  };

  const initializeObstacles = () => {
    const newObstacles: GameObject[] = [];
    const newMossPads: MossPad[] = [];
    
    // Create initial obstacles
    for (let i = 0; i < 3; i++) {
      newObstacles.push({
        x: 30 + (i * 25),
        y: 20 + (i * 20),
        width: 15,
        height: 8,
      });
    }
    
    // Create moving moss pads
    for (let i = 0; i < 3; i++) {
      newMossPads.push({
        x: 25 + (i * 30),
        y: 30 + (i * 25),
        width: 12,
        height: 4,
        angle: Math.random() * 360,
        speed: 0.5 + Math.random(),
      });
    }
    
    setObstacles(newObstacles);
    setMossPads(newMossPads);
  };

  const launch = () => {
    setVelocity({ x: 3, y: -8 });
    setIsDropping(false);
  };

  const handleTap = () => {
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
      setVelocity({ x: 0, y: 15 }); // Fast drop
      toast('THWACK!', { duration: 500 });
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      setMushroomPos(prev => {
        let newX = prev.x + velocity.x * 0.1;
        let newY = prev.y + velocity.y * 0.1;
        
        // Gravity when not dropping
        if (!isDropping) {
          setVelocity(v => ({ ...v, y: v.y + 0.3 }));
        }
        
        // Check boundaries
        if (newY > 95 || newY < 0 || newX > 95 || newX < 0) {
          setGameState('crashed');
          toast.error(`Crashed! Score: ${score}`, { duration: 2000 });
          return prev;
        }
        
        // Check collision with obstacles
        const mushroomBox = { x: newX, y: newY, width: 5, height: 5 };
        const hitObstacle = obstacles.some(obs => 
          checkCollision(mushroomBox, obs)
        );
        
        if (hitObstacle) {
          setGameState('crashed');
          toast.error(`THWACK! Score: ${score}`, { duration: 2000 });
          return prev;
        }
        
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
      
      // Update moss pads
      setMossPads(pads => pads.map(pad => ({
        ...pad,
        x: pad.x + Math.cos(pad.angle * Math.PI / 180) * pad.speed * 0.1,
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
          <p className="text-2xl text-muted-foreground mb-8">Tap to Start</p>
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
          
          {/* Obstacles */}
          {obstacles.map((obs, i) => (
            <div
              key={`obs-${i}`}
              className="absolute bg-game-log border-2 border-accent rounded-lg"
              style={{
                left: `${obs.x}%`,
                top: `${obs.y}%`,
                width: `${obs.width}%`,
                height: `${obs.height}%`,
              }}
            />
          ))}
          
          {/* Moss Pads */}
          {mossPads.map((pad, i) => (
            <div
              key={`pad-${i}`}
              className="absolute bg-game-moss border-2 border-primary rounded-full transition-all"
              style={{
                left: `${pad.x}%`,
                top: `${pad.y}%`,
                width: `${pad.width}%`,
                height: `${pad.height}%`,
              }}
            />
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
