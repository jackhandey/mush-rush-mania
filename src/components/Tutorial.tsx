import { useEffect, useState } from 'react';
import { Grumblecap } from './Grumblecap';

interface TutorialProps {
  onComplete: () => void;
}

export const Tutorial = ({ onComplete }: TutorialProps) => {
  const [step, setStep] = useState(0);
  const [mushroomY, setMushroomY] = useState(20);
  const [isDropping, setIsDropping] = useState(false);

  useEffect(() => {
    const sequence = async () => {
      // Step 0: Show mushroom launching
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep(1);
      
      // Step 1: Mushroom arcs up
      let y = 20;
      const arcInterval = setInterval(() => {
        y += 2;
        setMushroomY(y);
        if (y >= 40) {
          clearInterval(arcInterval);
          setStep(2);
        }
      }, 50);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 2: Show TAP indicator
      setStep(2);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 3: Drop!
      setStep(3);
      setIsDropping(true);
      const dropInterval = setInterval(() => {
        y += 3;
        setMushroomY(y);
        if (y >= 65) {
          clearInterval(dropInterval);
          setStep(4);
        }
      }, 50);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 4: Land and score
      setStep(4);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 5: Ready to play
      setStep(5);
    };
    
    sequence();
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 bg-background/95 backdrop-blur-sm">
      <div className="relative w-full max-w-md h-96">
        {/* Tutorial Title */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center">
          <h2 className="text-3xl font-bold text-primary mb-2">Quick Tutorial</h2>
        </div>
        
        {/* Step Instructions */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 text-center px-4">
          {step === 0 && (
            <p className="text-xl text-foreground">Watch the Grumblecap launch...</p>
          )}
          {step === 1 && (
            <p className="text-xl text-foreground animate-pulse">It flies in an arc automatically</p>
          )}
          {step === 2 && (
            <div className="space-y-2">
              <p className="text-2xl font-bold text-primary animate-pulse">TAP NOW!</p>
              <p className="text-lg text-muted-foreground">Tap when above a moss pad</p>
            </div>
          )}
          {step === 3 && (
            <p className="text-xl text-foreground">Dropping straight down!</p>
          )}
          {step === 4 && (
            <div className="space-y-2">
              <p className="text-3xl font-bold text-primary">BOING! +1</p>
              <p className="text-lg text-foreground">Perfect landing!</p>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-4">
              <p className="text-2xl font-bold text-primary">You got it!</p>
              <p className="text-lg text-muted-foreground">Time to play for real</p>
              <button
                onClick={onComplete}
                className="mt-4 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-bold text-xl hover:scale-105 transition-transform"
              >
                START GAME
              </button>
            </div>
          )}
        </div>
        
        {/* Visual Demo Area */}
        <div className="absolute top-32 left-0 right-0 bottom-0">
          {/* Moss Pad */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 bg-game-moss border-2 border-primary rounded-full shadow-lg shadow-primary/50"
            style={{
              top: '60%',
              width: '80px',
              height: '20px',
            }}
          >
            {step < 4 && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-primary whitespace-nowrap">
                LAND HERE
              </div>
            )}
          </div>
          
          {/* Mushroom */}
          {step < 5 && (
            <div 
              className="absolute left-1/2 -translate-x-1/2 transition-all duration-100"
              style={{ 
                top: `${mushroomY}%`,
              }}
            >
              <Grumblecap isDropping={isDropping} isCrashed={false} />
            </div>
          )}
          
          {/* TAP Indicator */}
          {step === 2 && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-24 h-24 border-4 border-primary rounded-full animate-ping opacity-75" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl">
                👆
              </div>
            </div>
          )}
          
          {/* Success Animation */}
          {step === 4 && (
            <div className="absolute left-1/2 top-2/3 -translate-x-1/2 -translate-y-1/2">
              <div className="text-6xl font-bold text-primary animate-bounce">+1</div>
            </div>
          )}
        </div>
        
        {/* Skip Button */}
        {step < 5 && (
          <button
            onClick={onComplete}
            className="absolute bottom-4 right-4 px-4 py-2 text-sm text-muted-foreground hover:text-foreground underline"
          >
            Skip Tutorial
          </button>
        )}
      </div>
    </div>
  );
};
