interface GrumblecapProps {
  isDropping: boolean;
  isCrashed: boolean;
}

export const Grumblecap = ({ isDropping, isCrashed }: GrumblecapProps) => {
  return (
    <div className={`relative transition-transform ${isCrashed ? 'animate-wiggle' : ''}`}>
      {/* Mushroom Cap */}
      <div 
        className={`w-12 h-10 bg-game-cap rounded-t-full border-2 border-accent relative transition-all duration-200 ${
          isDropping ? 'scale-y-75' : ''
        }`}
      >
        {/* Cap spots */}
        <div className="absolute top-2 left-2 w-2 h-2 bg-secondary rounded-full opacity-70" />
        <div className="absolute top-1 right-3 w-1.5 h-1.5 bg-secondary rounded-full opacity-70" />
        <div className="absolute bottom-2 left-4 w-1 h-1 bg-secondary rounded-full opacity-70" />
        
        {/* Grumpy Eyes */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-2">
          <div className="relative">
            <div className="w-3 h-3 bg-accent rounded-full" />
            <div className="absolute top-0 left-0.5 w-1.5 h-1.5 bg-background rounded-full" />
          </div>
          <div className="relative">
            <div className="w-3 h-3 bg-accent rounded-full" />
            <div className="absolute top-0 left-0.5 w-1.5 h-1.5 bg-background rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Mushroom Stem */}
      <div 
        className={`w-6 h-6 bg-game-stem mx-auto border-2 border-accent rounded-sm transition-all duration-200 ${
          isDropping ? 'h-8' : ''
        }`}
      />
      
      {/* Spore cloud on crash */}
      {isCrashed && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-16 h-16 bg-destructive rounded-full opacity-50 animate-ping" />
        </div>
      )}
    </div>
  );
};
