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

  // Foreground layer 1 - faster, different shapes (ferns, curly grass, mushroom silhouettes)
  const ForegroundLayer1 = ({ offset }: { offset: number }) => (
    <div 
      className="absolute bottom-0 h-[14%] w-[200%] z-50 pointer-events-none"
      style={{ 
        left: `${-offset}%`,
        filter: isMobile ? 'none' : 'blur(3px)',
        opacity: isMobile ? 0.75 : 0.9,
      }}
    >
      <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
        {/* Curly fern frond 1 */}
        <path d="M12,100 C15,85 8,70 18,55 C28,40 15,30 25,20" stroke="hsl(var(--fg-silhouette))" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M18,55 C28,52 32,58 28,65" stroke="hsl(var(--fg-silhouette))" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M15,70 C5,68 2,75 8,82" stroke="hsl(var(--fg-silhouette))" strokeWidth="4" fill="none" strokeLinecap="round" />
        
        {/* Thin wispy grass */}
        <path d="M38,100 C42,88 36,75 45,60 C48,55 44,50 48,42" stroke="hsl(var(--fg-silhouette))" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M45,100 C40,85 48,70 42,55" stroke="hsl(var(--fg-silhouette))" strokeWidth="2" fill="none" strokeLinecap="round" />
        
        {/* Small mushroom silhouette */}
        <ellipse cx="65" cy="92" rx="8" ry="4" fill="hsl(var(--fg-silhouette))" />
        <path d="M65,92 L65,100" stroke="hsl(var(--fg-silhouette))" strokeWidth="4" fill="none" />
        
        {/* Curved leaf blade */}
        <path d="M85,100 C95,80 80,60 100,40 C105,35 100,30 108,25" stroke="hsl(var(--fg-silhouette))" strokeWidth="6" fill="none" strokeLinecap="round" />
        
        {/* Curly fern frond 2 */}
        <path d="M115,100 C112,82 120,65 110,48 C100,32 115,22 105,12" stroke="hsl(var(--fg-silhouette))" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M110,48 C98,45 95,52 100,60" stroke="hsl(var(--fg-silhouette))" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M115,65 C125,62 130,70 125,78" stroke="hsl(var(--fg-silhouette))" strokeWidth="4" fill="none" strokeLinecap="round" />
        
        {/* Dandelion puff silhouette */}
        <circle cx="145" cy="55" r="8" fill="hsl(var(--fg-silhouette))" />
        <path d="M145,63 L145,100" stroke="hsl(var(--fg-silhouette))" strokeWidth="2" fill="none" />
        
        {/* Broad leaf */}
        <path d="M168,100 C175,85 165,70 180,55 C185,50 175,45 185,38" stroke="hsl(var(--fg-silhouette))" strokeWidth="8" fill="none" strokeLinecap="round" />
        
        {/* Small toadstool */}
        <ellipse cx="195" cy="90" rx="6" ry="3" fill="hsl(var(--fg-silhouette))" />
        <path d="M195,90 L195,100" stroke="hsl(var(--fg-silhouette))" strokeWidth="3" fill="none" />
      </svg>
    </div>
  );

  // Foreground grass layer 2 - slower, more blurred (deeper depth of field)
  const ForegroundLayer2 = ({ offset }: { offset: number }) => (
    <div 
      className="absolute bottom-0 h-[18%] w-[200%] z-[49] pointer-events-none"
      style={{ 
        left: `${-offset}%`,
        filter: isMobile ? 'none' : 'blur(6px)',
        opacity: isMobile ? 0.5 : 0.6,
      }}
    >
      <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
        <path d="M15,100 C22,72 10,48 28,22" stroke="hsl(var(--fg-silhouette))" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M48,100 C40,78 55,55 42,30" stroke="hsl(var(--fg-silhouette))" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M82,100 C92,70 75,45 98,18" stroke="hsl(var(--fg-silhouette))" strokeWidth="11" fill="none" strokeLinecap="round" />
        <path d="M120,100 C110,75 128,50 115,25" stroke="hsl(var(--fg-silhouette))" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M158,100 C168,72 152,48 175,22" stroke="hsl(var(--fg-silhouette))" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M192,100 C182,78 198,55 185,30" stroke="hsl(var(--fg-silhouette))" strokeWidth="8" fill="none" strokeLinecap="round" />
        
        {/* Larger clover clusters */}
        <g transform="translate(65, 85)">
          <ellipse cx="-6" cy="-3" rx="7" ry="5" fill="hsl(var(--fg-silhouette))" transform="rotate(-28)" />
          <ellipse cx="6" cy="-3" rx="7" ry="5" fill="hsl(var(--fg-silhouette))" transform="rotate(28)" />
          <ellipse cx="0" cy="-10" rx="6" ry="5" fill="hsl(var(--fg-silhouette))" />
        </g>
        <g transform="translate(145, 86)">
          <ellipse cx="-5" cy="-2" rx="6" ry="4" fill="hsl(var(--fg-silhouette))" transform="rotate(-32)" />
          <ellipse cx="5" cy="-2" rx="6" ry="4" fill="hsl(var(--fg-silhouette))" transform="rotate(32)" />
          <ellipse cx="0" cy="-8" rx="5" ry="4" fill="hsl(var(--fg-silhouette))" />
        </g>
      </svg>
    </div>
  );

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
      
      {/* Foreground grass layers - two speeds for depth */}
      <ForegroundLayer2 offset={offsetRef.current.topFg * 0.6} />
      <ForegroundLayer1 offset={offsetRef.current.topFg} />
    </div>
  );
});

ParallaxBackground.displayName = 'ParallaxBackground';
