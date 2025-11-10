import { useEffect, useState } from 'react';
import { Grumblecap } from './Grumblecap';

interface TutorialProps {
  onComplete: () => void;
}

export const Tutorial = ({ onComplete }: TutorialProps) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const sequence = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep(1);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep(2);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep(3);
    };
    
    sequence();
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 bg-background/95 backdrop-blur-sm">
      <div className="relative w-full max-w-md px-6">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-primary mb-4">MUSH-RUSH</h2>
          <p className="text-xl text-muted-foreground">How to Play</p>
        </div>
        
        {/* Instructions */}
        <div className="bg-card border-2 border-primary rounded-lg p-6 mb-8 space-y-4">
          <div className={`transition-opacity ${step >= 0 ? 'opacity-100' : 'opacity-30'}`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl flex-shrink-0">1</div>
              <p className="text-lg text-foreground pt-2">
                Grumblecap <strong>launches automatically</strong> upward
              </p>
            </div>
          </div>
          
          <div className={`transition-opacity ${step >= 1 ? 'opacity-100' : 'opacity-30'}`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl flex-shrink-0">2</div>
              <p className="text-lg text-foreground pt-2">
                <strong>TAP SCREEN</strong> to drop straight down
              </p>
            </div>
          </div>
          
          <div className={`transition-opacity ${step >= 2 ? 'opacity-100' : 'opacity-30'}`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-game-moss rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl flex-shrink-0">3</div>
              <p className="text-lg text-foreground pt-2">
                Land on <strong className="text-primary">green moss pads</strong> = +1 point!
              </p>
            </div>
          </div>
        </div>
        
        {/* Visual Demo */}
        <div className="bg-game-bgStart rounded-lg p-8 mb-8 relative h-40 overflow-hidden">
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="w-20 h-3 bg-game-moss border-2 border-primary rounded-full" />
          </div>
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce-slow">
            <Grumblecap isDropping={false} isCrashed={false} />
          </div>
          {step >= 1 && (
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 animate-pulse">
              <div className="text-5xl">👇</div>
              <div className="text-sm font-bold text-primary text-center">TAP!</div>
            </div>
          )}
        </div>
        
        {/* Start Button */}
        <button
          onClick={onComplete}
          className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-lg font-bold text-2xl hover:scale-105 transition-transform"
        >
          {step >= 3 ? 'START PLAYING' : 'SKIP →'}
        </button>
      </div>
    </div>
  );
};
