import { memo, useRef, useEffect, useState } from 'react';

interface ParallaxBackgroundProps {
  isPlaying: boolean;
  worldSpeed: number;
}

export const ParallaxBackground = memo(({ isPlaying, worldSpeed }: ParallaxBackgroundProps) => {
  const isMobile = window.innerWidth <= 768;
  const [tick, setTick] = useState(0);
  const offsetRef = useRef({ bg: 0, mid: 0, fg: 0, topFg: 0 });
  const lastFrameTime = useRef(0);
  
  // Animation loop - throttled on mobile for performance
  useEffect(() => {
    let animationId: number;
    const targetFPS = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFPS;
    
    const animate = (timestamp: number) => {
      if (isMobile && timestamp - lastFrameTime.current < frameInterval) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime.current = timestamp;
      
      const effectiveSpeed = isPlaying ? worldSpeed : 1.5;
      
      // Different scroll speeds for parallax effect
      const bgSpeed = effectiveSpeed * 0.15;
      const midSpeed = effectiveSpeed * 0.4;
      const fgSpeed = effectiveSpeed * 0.7;
      const topFgSpeed = effectiveSpeed * 1.2;
      
      offsetRef.current = {
        bg: (offsetRef.current.bg + bgSpeed) % 100,
        mid: (offsetRef.current.mid + midSpeed) % 100,
        fg: (offsetRef.current.fg + fgSpeed) % 100,
        topFg: (offsetRef.current.topFg + topFgSpeed) % 100,
      };
      
      setTick(t => t + 1);
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, worldSpeed, isMobile]);

  // Create a seamlessly tiling hill pattern
  const HillsLayer = ({ offset, opacity = 1 }: { offset: number; opacity?: number }) => (
    <div 
      className="absolute bottom-0 h-[40%] w-[200%]"
      style={{ 
        left: `${-offset}%`,
        opacity,
      }}
    >
      <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
        {/* Far hills */}
        <path 
          d="M0,100 L0,55 C10,50 20,60 35,45 C50,30 60,50 80,40 C100,30 110,45 130,35 C150,25 170,40 185,32 C195,28 198,35 200,35 L200,100 Z"
          fill="hsl(var(--hill-far))"
        />
        {/* Near hills */}
        <path 
          d="M0,100 L0,65 C15,58 25,70 45,55 C65,42 80,60 100,50 C120,40 140,55 160,45 C175,38 190,50 200,45 L200,100 Z"
          fill="hsl(var(--hill-near))"
        />
      </svg>
    </div>
  );

  // Tree roots layer
  const RootsLayer = ({ offset }: { offset: number }) => (
    <div 
      className="absolute bottom-0 h-[50%] w-[200%] opacity-60"
      style={{ left: `${-offset}%` }}
    >
      <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
        <path 
          d="M15,100 C18,80 12,60 20,40 C28,20 18,10 30,5 C22,15 18,30 22,50 C26,70 15,85 25,100"
          fill="hsl(var(--root-color))"
        />
        <path 
          d="M55,100 C50,75 65,55 55,35 C45,15 60,8 52,3 C62,12 68,30 60,50 C52,70 65,88 58,100"
          fill="hsl(var(--root-color))"
          opacity="0.85"
        />
        <path 
          d="M95,100 C100,82 88,62 98,42 C108,22 92,12 105,5 C95,18 90,35 100,55 C110,75 95,90 105,100"
          fill="hsl(var(--root-color))"
          opacity="0.75"
        />
        <path 
          d="M140,100 C135,78 150,58 138,38 C126,18 145,8 135,3 C148,15 152,35 142,55 C132,75 148,92 140,100"
          fill="hsl(var(--root-color))"
          opacity="0.9"
        />
        <path 
          d="M175,100 C180,80 168,60 180,40 C192,20 172,10 188,5 C175,18 172,38 182,58 C192,78 175,92 185,100"
          fill="hsl(var(--root-color))"
          opacity="0.8"
        />
      </svg>
    </div>
  );

  // Fern fronds layer
  const FernsLayer = ({ offset }: { offset: number }) => (
    <div 
      className="absolute bottom-[5%] h-[45%] w-[200%] opacity-55"
      style={{ left: `${-offset}%` }}
    >
      <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
        {/* Fern 1 */}
        <path d="M20,95 C25,75 15,55 25,35 C35,15 20,8 30,2 C22,15 15,35 22,55 C29,75 18,88 22,95" fill="hsl(var(--fern-dark))" />
        <path d="M30,2 C40,8 45,18 38,28 C32,20 28,12 30,2" fill="hsl(var(--fern-color))" />
        <path d="M25,20 C15,15 8,25 15,35 C22,28 28,22 25,20" fill="hsl(var(--fern-color))" />
        <path d="M28,40 C40,35 48,45 42,55 C35,48 30,42 28,40" fill="hsl(var(--fern-color))" />
        <path d="M22,58 C12,52 5,62 12,72 C20,65 25,58 22,58" fill="hsl(var(--fern-color))" />
        
        {/* Fern 2 */}
        <path d="M70,98 C75,78 65,58 75,38 C85,18 68,8 80,2 C72,15 65,35 72,55 C79,75 68,90 72,98" fill="hsl(var(--fern-dark))" />
        <path d="M80,2 C92,10 95,22 85,30 C78,22 76,12 80,2" fill="hsl(var(--fern-color))" />
        <path d="M72,25 C60,18 52,30 62,42 C70,32 75,25 72,25" fill="hsl(var(--fern-color))" />
        <path d="M78,48 C92,40 100,52 90,65 C82,55 78,48 78,48" fill="hsl(var(--fern-color))" />
        
        {/* Fern 3 */}
        <path d="M125,96 C132,76 120,56 132,36 C144,16 125,8 138,2 C128,18 122,38 132,58 C142,78 128,92 132,96" fill="hsl(var(--fern-dark))" />
        <path d="M138,2 C152,12 155,28 142,35 C135,22 134,10 138,2" fill="hsl(var(--fern-color))" />
        <path d="M130,30 C118,22 108,35 120,48 C128,38 132,30 130,30" fill="hsl(var(--fern-color))" />
        
        {/* Fern 4 */}
        <path d="M175,95 C180,75 170,55 180,35 C190,15 172,8 185,2 C175,15 168,35 178,55 C188,75 175,88 180,95" fill="hsl(var(--fern-dark))" />
        <path d="M185,2 C198,10 200,25 188,32 C180,20 182,10 185,2" fill="hsl(var(--fern-color))" />
        <path d="M178,28 C165,22 158,35 168,48 C178,38 182,28 178,28" fill="hsl(var(--fern-color))" />
      </svg>
    </div>
  );

  // Mossy boulders layer
  const BouldersLayer = ({ offset }: { offset: number }) => (
    <div 
      className="absolute bottom-0 h-[22%] w-[200%] opacity-45"
      style={{ left: `${-offset}%` }}
    >
      <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
        <ellipse cx="25" cy="82" rx="18" ry="12" fill="hsl(var(--rock-dark))" />
        <ellipse cx="23" cy="79" rx="15" ry="9" fill="hsl(var(--rock-moss))" />
        
        <ellipse cx="75" cy="85" rx="14" ry="10" fill="hsl(var(--rock-dark))" />
        <ellipse cx="73" cy="83" rx="11" ry="7" fill="hsl(var(--rock-moss))" />
        
        <ellipse cx="125" cy="88" rx="16" ry="8" fill="hsl(var(--rock-dark))" />
        <ellipse cx="123" cy="86" rx="13" ry="6" fill="hsl(var(--rock-moss))" />
        
        <ellipse cx="170" cy="84" rx="12" ry="9" fill="hsl(var(--rock-dark))" />
        <ellipse cx="168" cy="82" rx="10" ry="7" fill="hsl(var(--rock-moss))" />
      </svg>
    </div>
  );

  // Foreground grass silhouettes
  const ForegroundGrassLayer = ({ offset, side }: { offset: number; side: 'left' | 'right' | 'center' }) => {
    const positions = {
      left: { left: `${-offset % 100}%`, width: '200%' },
      right: { right: `${-offset % 100 * 0.8}%`, width: '200%' },
      center: { left: `${50 - offset % 100 * 0.5}%`, width: '150%' },
    };
    
    return (
      <div 
        className="absolute bottom-0 h-[15%] z-50 pointer-events-none"
        style={{ 
          ...positions[side],
          filter: isMobile ? 'none' : 'blur(4px)',
          opacity: isMobile ? 0.7 : 0.85,
        }}
      >
        <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
          {/* Grass blades */}
          <path d="M10,100 C15,82 8,65 18,45" stroke="hsl(var(--fg-silhouette))" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M25,100 C30,78 20,58 35,35" stroke="hsl(var(--fg-silhouette))" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M42,100 C38,85 48,68 40,50" stroke="hsl(var(--fg-silhouette))" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M58,100 C65,82 52,62 68,40" stroke="hsl(var(--fg-silhouette))" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M75,100 C70,88 80,72 68,55" stroke="hsl(var(--fg-silhouette))" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M92,100 C98,80 85,60 100,38" stroke="hsl(var(--fg-silhouette))" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M110,100 C105,85 118,68 108,48" stroke="hsl(var(--fg-silhouette))" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M128,100 C135,78 122,58 140,35" stroke="hsl(var(--fg-silhouette))" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M148,100 C142,88 155,70 145,52" stroke="hsl(var(--fg-silhouette))" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M165,100 C172,82 160,62 178,42" stroke="hsl(var(--fg-silhouette))" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M185,100 C180,85 192,68 182,50" stroke="hsl(var(--fg-silhouette))" strokeWidth="5" fill="none" strokeLinecap="round" />
          
          {/* Clover clusters */}
          <g transform="translate(35, 88)">
            <ellipse cx="-4" cy="-2" rx="5" ry="4" fill="hsl(var(--fg-silhouette))" transform="rotate(-30)" />
            <ellipse cx="4" cy="-2" rx="5" ry="4" fill="hsl(var(--fg-silhouette))" transform="rotate(30)" />
            <ellipse cx="0" cy="-7" rx="4" ry="4" fill="hsl(var(--fg-silhouette))" />
          </g>
          <g transform="translate(95, 90)">
            <ellipse cx="-3" cy="-2" rx="4" ry="3" fill="hsl(var(--fg-silhouette))" transform="rotate(-35)" />
            <ellipse cx="3" cy="-2" rx="4" ry="3" fill="hsl(var(--fg-silhouette))" transform="rotate(35)" />
            <ellipse cx="0" cy="-5" rx="3" ry="3" fill="hsl(var(--fg-silhouette))" />
          </g>
          <g transform="translate(155, 88)">
            <ellipse cx="-4" cy="-2" rx="5" ry="4" fill="hsl(var(--fg-silhouette))" transform="rotate(-25)" />
            <ellipse cx="4" cy="-2" rx="5" ry="4" fill="hsl(var(--fg-silhouette))" transform="rotate(25)" />
            <ellipse cx="0" cy="-7" rx="4" ry="4" fill="hsl(var(--fg-silhouette))" />
          </g>
        </svg>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-parallax-sky via-parallax-skyMid to-parallax-skyBottom" />
      
      {/* Moon */}
      <div 
        className="absolute rounded-full"
        style={{
          top: '8%',
          right: '15%',
          width: isMobile ? '3rem' : '5rem',
          height: isMobile ? '3rem' : '5rem',
          background: 'radial-gradient(circle at 40% 40%, hsl(var(--moon-glow)), hsl(var(--moon-surface)), hsl(var(--moon-dark)))',
          boxShadow: isMobile ? 'none' : '0 0 60px 20px hsl(var(--moon-glow) / 0.3), 0 0 120px 40px hsl(var(--moon-glow) / 0.1)',
        }}
      />
      
      {/* Background hills - slowest scroll */}
      <HillsLayer offset={offsetRef.current.bg} />
      
      {/* Mid-ground layers */}
      <RootsLayer offset={offsetRef.current.mid} />
      <FernsLayer offset={offsetRef.current.mid * 0.8} />
      <BouldersLayer offset={offsetRef.current.mid * 0.6} />
      
      {/* Atmospheric fog */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[20%] pointer-events-none"
        style={{
          background: 'linear-gradient(to top, hsl(var(--fog-color) / 0.35), transparent)',
        }}
      />
      
      {/* Foreground grass - fastest scroll, above player */}
      <ForegroundGrassLayer offset={offsetRef.current.topFg} side="left" />
    </div>
  );
});

ParallaxBackground.displayName = 'ParallaxBackground';
