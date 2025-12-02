interface GrumblecapProps {
  isDropping: boolean;
  isCrashed: boolean;
}

export const Grumblecap = ({ isDropping, isCrashed }: GrumblecapProps) => {
  const isMobile = window.innerWidth <= 768;
  
  return (
    <div 
      className={`relative transition-transform ${isCrashed ? 'animate-wiggle' : ''}`}
      style={isMobile ? undefined : {
        filter: 'drop-shadow(0 0 8px hsl(0 80% 55% / 0.4)) drop-shadow(0 4px 12px hsl(0 0% 0% / 0.5))',
      }}
    >
      {/* Mushroom Cap */}
      <div 
        className={`w-12 h-10 bg-game-cap rounded-t-full border-2 border-accent relative transition-all duration-200 ${
          isDropping ? 'scale-y-75' : ''
        }`}
      >
        {/* Cap spots - white for contrast */}
        <div className="absolute top-2 left-2 w-2 h-2 bg-foreground rounded-full opacity-80" />
        <div className="absolute top-1 right-3 w-1.5 h-1.5 bg-foreground rounded-full opacity-80" />
        <div className="absolute bottom-2 left-4 w-1 h-1 bg-foreground rounded-full opacity-70" />
        
        {/* Grumpy Eyes */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-2">
          <div className="relative">
            <div className="w-3 h-3 bg-background rounded-full" />
            <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-foreground rounded-full" />
          </div>
          <div className="relative">
            <div className="w-3 h-3 bg-background rounded-full" />
            <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-foreground rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Mushroom Stem */}
      <div 
        className={`w-6 h-6 bg-game-stem mx-auto border-2 border-accent rounded-sm transition-all duration-200 ${
          isDropping ? 'h-8' : ''
        }`}
      />
      
      {/* Spore cloud on crash - simplified on mobile */}
      {isCrashed && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className={`w-16 h-16 bg-destructive rounded-full opacity-50 ${isMobile ? '' : 'animate-ping'}`} />
        </div>
      )}
    </div>
  );
};
