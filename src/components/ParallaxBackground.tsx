import { memo, useRef, useEffect, useState } from 'react';

interface ParallaxBackgroundProps {
  isPlaying: boolean;
  worldSpeed: number;
}

interface FlyingInsect {
  x: number;
  y: number;
  speed: number;
  wingPhase: number;
  size: number;
  active: boolean;
}

export const ParallaxBackground = memo(({ isPlaying, worldSpeed }: ParallaxBackgroundProps) => {
  const isMobile = window.innerWidth <= 768;
  const [tick, setTick] = useState(0);
  const insectRef = useRef<FlyingInsect>({ x: -20, y: 15, speed: 0.3, wingPhase: 0, size: 1, active: false });
  const lastInsectTime = useRef(0);
  const offsetRef = useRef({ bg: 0, mid: 0, fg: 0, topFg: 0 });
  const lastFrameTime = useRef(0);
  
  // Animation loop - throttled on mobile for performance
  useEffect(() => {
    let animationId: number;
    const targetFPS = isMobile ? 30 : 60; // Throttle to 30fps on mobile
    const frameInterval = 1000 / targetFPS;
    
    const animate = (timestamp: number) => {
      // Throttle frame rate on mobile
      if (isMobile && timestamp - lastFrameTime.current < frameInterval) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime.current = timestamp;
      
      // Use base speed when not playing, actual speed during gameplay
      const effectiveSpeed = isPlaying ? worldSpeed : 1.5;
      
      const bgSpeed = effectiveSpeed * 0.02;
      const midSpeed = effectiveSpeed * 0.05;
      const fgSpeed = effectiveSpeed * 0.08;
      const topFgSpeed = effectiveSpeed * 0.25;
      
      offsetRef.current = {
        bg: (offsetRef.current.bg + bgSpeed) % 200,
        mid: (offsetRef.current.mid + midSpeed) % 200,
        fg: (offsetRef.current.fg + fgSpeed) % 200,
        topFg: (offsetRef.current.topFg + topFgSpeed) % 150,
      };
      
      // Update flying insect (desktop only for performance)
      if (!isMobile) {
        const now = Date.now();
        const insect = insectRef.current;
        if (insect.active) {
          insect.x += insect.speed;
          insect.wingPhase = (insect.wingPhase + 15) % 360;
          if (insect.x > 120) {
            insect.active = false;
          }
        } else if (now - lastInsectTime.current > 8000 + Math.random() * 12000) {
          insectRef.current = {
            x: -10,
            y: 8 + Math.random() * 18,
            speed: 0.15 + Math.random() * 0.2,
            wingPhase: 0,
            size: 0.8 + Math.random() * 0.4,
            active: true,
          };
          lastInsectTime.current = now;
        }
      }
      
      setTick(t => t + 1);
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, worldSpeed, isMobile]);
  
  // Mobile: Simplified static background for performance
  if (isMobile) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Simple gradient sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-parallax-sky via-parallax-skyMid to-parallax-skyBottom" />
        
        {/* Static moon */}
        <div 
          className="absolute w-12 h-12 rounded-full"
          style={{
            top: '8%',
            right: '15%',
            background: 'radial-gradient(circle at 40% 40%, hsl(var(--moon-glow)), hsl(var(--moon-surface)), hsl(var(--moon-dark)))',
            boxShadow: '0 0 40px 15px hsl(var(--moon-glow) / 0.3)',
          }}
        />
        
        {/* Simple scrolling hills */}
        <svg 
          className="absolute bottom-0 w-[200%] h-[40%]"
          style={{ left: `${-offsetRef.current.bg * 0.3}%` }}
          viewBox="0 0 200 100" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,100 L0,60 C30,50 60,65 100,55 C140,45 170,60 200,50 L200,100 Z"
            fill="hsl(var(--hill-far))"
          />
          <path 
            d="M0,100 L0,70 C25,60 55,75 95,62 C135,50 165,65 200,55 L200,100 Z"
            fill="hsl(var(--hill-near))"
          />
        </svg>
        
        {/* Simple fog */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[20%]"
          style={{
            background: 'linear-gradient(to top, hsl(var(--fog-color) / 0.3), transparent)',
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* ========== BACKGROUND LAYER - Twilight Sky ========== */}
      <div className="absolute inset-0 bg-gradient-to-b from-parallax-sky via-parallax-skyMid to-parallax-skyBottom" />
      
      {/* Glowing Moon */}
      <div 
        className="absolute w-16 h-16 md:w-24 md:h-24 rounded-full"
        style={{
          top: '8%',
          right: `${15 + offsetRef.current.bg * 0.05}%`,
          background: 'radial-gradient(circle at 40% 40%, hsl(var(--moon-glow)), hsl(var(--moon-surface)), hsl(var(--moon-dark)))',
          boxShadow: '0 0 60px 20px hsl(var(--moon-glow) / 0.3), 0 0 120px 40px hsl(var(--moon-glow) / 0.1)',
        }}
      />
      
      {/* ========== FLYING INSECT (Background element) ========== */}
      {insectRef.current.active && (
        <svg
          className="absolute z-[1] opacity-60"
          style={{
            left: `${insectRef.current.x}%`,
            top: `${insectRef.current.y}%`,
            width: `${2 * insectRef.current.size}%`,
            height: `${1.5 * insectRef.current.size}%`,
          }}
          viewBox="0 0 40 30"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Body */}
          <ellipse cx="20" cy="15" rx="8" ry="4" fill="hsl(var(--hill-far))" />
          <ellipse cx="12" cy="15" rx="4" ry="3" fill="hsl(var(--hill-far))" />
          {/* Wings - animated */}
          <ellipse 
            cx="20" cy="15" rx="10" ry="6" 
            fill="hsl(var(--foreground) / 0.15)"
            transform={`rotate(${Math.sin(insectRef.current.wingPhase * Math.PI / 180) * 20} 20 15) translate(0 ${Math.sin(insectRef.current.wingPhase * Math.PI / 180) * -3})`}
          />
          <ellipse 
            cx="20" cy="15" rx="8" ry="5" 
            fill="hsl(var(--foreground) / 0.1)"
            transform={`rotate(${Math.sin(insectRef.current.wingPhase * Math.PI / 180) * -15} 20 15) translate(0 ${Math.sin(insectRef.current.wingPhase * Math.PI / 180) * 2})`}
          />
        </svg>
      )}
      
      {/* ========== BACKGROUND - Organic Rolling Hills ========== */}
      <svg 
        className="absolute bottom-0 w-[300%] h-[45%]"
        style={{ left: `${-100 - offsetRef.current.bg * 0.3}%` }}
        viewBox="0 0 300 100" 
        preserveAspectRatio="none"
      >
        {/* Far hills - smooth curves */}
        <path 
          d="M0,100 L0,60 
             C20,55 30,65 50,50 
             C70,35 80,55 100,45 
             C120,35 140,50 160,40 
             C180,30 200,45 220,38 
             C240,30 260,42 280,35 
             C290,32 295,38 300,35 
             L300,100 Z"
          fill="hsl(var(--hill-far))"
        />
        {/* Near hills - overlapping smooth curves */}
        <path 
          d="M0,100 L0,70 
             C15,65 25,75 45,62 
             C65,50 85,68 105,55 
             C125,42 145,60 165,52 
             C185,44 205,58 225,48 
             C245,38 265,52 285,45 
             C295,42 300,48 300,48 
             L300,100 Z"
          fill="hsl(var(--hill-near))"
        />
      </svg>

      {/* ========== MID-GROUND - Giant Tree Roots ========== */}
      <svg 
        className="absolute bottom-0 w-[250%] h-[55%] opacity-70"
        style={{ left: `${-50 - offsetRef.current.mid}%` }}
        viewBox="0 0 250 100" 
        preserveAspectRatio="none"
      >
        {/* Massive curved root 1 */}
        <path 
          d="M20,100 
             C25,85 15,70 25,55 
             C35,40 20,30 35,20 
             C45,12 40,8 50,5
             C55,3 52,8 55,15
             C58,25 50,35 55,50
             C60,65 50,80 60,100"
          fill="hsl(var(--root-color))"
        />
        {/* Root branch */}
        <path 
          d="M35,55 
             C45,50 55,55 60,45 
             C65,35 75,40 70,55
             C65,70 75,85 70,100"
          fill="hsl(var(--root-color))"
          opacity="0.8"
        />
        
        {/* Massive curved root 2 */}
        <path 
          d="M100,100 
             C95,80 110,65 100,50 
             C90,35 105,25 95,15 
             C88,8 95,5 90,3
             C85,1 88,8 85,18
             C82,30 92,45 85,60
             C78,75 90,90 80,100"
          fill="hsl(var(--root-color))"
          opacity="0.9"
        />
        
        {/* Giant arching root */}
        <path 
          d="M150,100 
             C145,75 165,55 155,35 
             C148,20 170,10 165,5
             C175,8 180,25 175,40
             C170,55 185,75 180,100"
          fill="hsl(var(--root-color))"
          opacity="0.75"
        />
        
        {/* Twisted root cluster */}
        <path 
          d="M210,100 
             C205,85 220,70 210,55 
             C200,40 225,30 215,18
             C230,25 235,45 230,60
             C225,75 240,90 235,100"
          fill="hsl(var(--root-color))"
          opacity="0.85"
        />
      </svg>

      {/* ========== MID-GROUND - Massive Fern Fronds ========== */}
      <svg 
        className="absolute bottom-[5%] w-[200%] h-[50%] opacity-60"
        style={{ left: `${-30 - offsetRef.current.mid * 0.8}%` }}
        viewBox="0 0 200 100" 
        preserveAspectRatio="none"
      >
        {/* Giant fern frond 1 - organic curves */}
        <path 
          d="M30,95 
             C35,80 25,65 30,50 
             C35,35 25,25 32,15
             C28,25 22,35 25,50
             C28,65 20,80 25,95"
          fill="hsl(var(--fern-dark))"
        />
        {/* Fern leaflets - smooth curves */}
        <path 
          d="M32,15 C40,18 45,25 40,32 C35,28 30,22 32,15"
          fill="hsl(var(--fern-color))"
        />
        <path 
          d="M30,25 C22,22 15,28 18,35 C25,32 32,28 30,25"
          fill="hsl(var(--fern-color))"
        />
        <path 
          d="M33,35 C42,32 50,38 45,48 C38,42 32,38 33,35"
          fill="hsl(var(--fern-color))"
        />
        <path 
          d="M28,45 C18,42 10,50 15,58 C22,52 28,48 28,45"
          fill="hsl(var(--fern-color))"
        />
        <path 
          d="M32,55 C42,50 52,58 48,68 C40,62 34,56 32,55"
          fill="hsl(var(--fern-color))"
        />
        <path 
          d="M26,65 C16,62 8,70 14,80 C22,72 28,66 26,65"
          fill="hsl(var(--fern-color))"
        />
        
        {/* Giant fern frond 2 */}
        <path 
          d="M90,98 
             C95,82 85,65 92,48 
             C98,32 88,20 95,10
             C90,20 82,32 88,48
             C94,65 82,82 88,98"
          fill="hsl(var(--fern-dark))"
        />
        <path d="M95,10 C105,15 110,25 102,32 C96,25 92,18 95,10" fill="hsl(var(--fern-color))" />
        <path d="M92,22 C82,18 72,28 78,38 C86,30 94,25 92,22" fill="hsl(var(--fern-color))" />
        <path d="M96,38 C108,32 118,42 110,55 C100,45 95,40 96,38" fill="hsl(var(--fern-color))" />
        <path d="M88,52 C75,48 65,60 75,72 C82,62 90,55 88,52" fill="hsl(var(--fern-color))" />
        
        {/* Giant fern frond 3 */}
        <path 
          d="M150,96 
             C158,78 145,60 155,42 
             C165,25 150,15 160,8
             C152,18 142,30 152,48
             C162,65 148,82 155,96"
          fill="hsl(var(--fern-dark))"
        />
        <path d="M160,8 C172,15 175,28 165,35 C158,25 156,15 160,8" fill="hsl(var(--fern-color))" />
        <path d="M155,25 C142,20 132,32 142,45 C150,35 158,28 155,25" fill="hsl(var(--fern-color))" />
        <path d="M158,48 C172,42 182,55 172,68 C162,58 156,50 158,48" fill="hsl(var(--fern-color))" />
      </svg>

      {/* ========== MID-GROUND - Mossy Boulders ========== */}
      <svg 
        className="absolute bottom-0 w-[180%] h-[25%] opacity-50"
        style={{ left: `${-20 - offsetRef.current.mid * 0.6}%` }}
        viewBox="0 0 180 100" 
        preserveAspectRatio="none"
      >
        {/* Organic boulder 1 */}
        <ellipse cx="40" cy="85" rx="25" ry="15" fill="hsl(var(--rock-dark))" />
        <ellipse cx="38" cy="82" rx="22" ry="12" fill="hsl(var(--rock-moss))" />
        
        {/* Organic boulder 2 */}
        <ellipse cx="110" cy="88" rx="20" ry="12" fill="hsl(var(--rock-dark))" />
        <ellipse cx="108" cy="86" rx="17" ry="10" fill="hsl(var(--rock-moss))" />
        
        {/* Organic boulder 3 */}
        <ellipse cx="160" cy="90" rx="18" ry="10" fill="hsl(var(--rock-dark))" />
        <ellipse cx="158" cy="88" rx="15" ry="8" fill="hsl(var(--rock-moss))" />
      </svg>

      {/* ========== FOREGROUND - Blurred Fern Fronds ========== */}
      <svg 
        className="absolute bottom-0 left-0 w-[20%] h-[45%] opacity-35 blur-[2px]"
        style={{ left: `${-5 - (offsetRef.current.fg % 30)}%` }}
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        {/* Large foreground fern - very blurred */}
        <path 
          d="M50,100 
             C55,75 40,55 50,35 
             C60,15 45,5 55,0"
          stroke="hsl(var(--fern-color))"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M50,35 C65,30 75,40 65,50" stroke="hsl(var(--fern-color))" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M50,50 C35,45 25,55 35,65" stroke="hsl(var(--fern-color))" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M50,65 C68,58 80,68 70,80" stroke="hsl(var(--fern-color))" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
      
      {/* Foreground grass - soft curves */}
      <svg 
        className="absolute bottom-0 right-0 w-[15%] h-[35%] opacity-30 blur-[1px]"
        style={{ right: `${-3 - (offsetRef.current.fg % 25) * 0.5}%` }}
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <path d="M20,100 C25,70 15,40 25,10" stroke="hsl(var(--grass-blade))" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M45,100 C50,65 40,35 55,5" stroke="hsl(var(--grass-blade))" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M70,100 C65,72 75,45 65,15" stroke="hsl(var(--grass-blade))" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>

      {/* Particles and fireflies removed for performance */}

      {/* ========== ATMOSPHERIC FOG ========== */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[25%] pointer-events-none"
        style={{
          background: 'linear-gradient(to top, hsl(var(--fog-color) / 0.4), transparent)',
        }}
      />

      {/* ========== TOP FOREGROUND - Depth of Field Layer (z-50, above player) ========== */}
      {/* Left side grass & clover cluster - SHORT, stays below platforms */}
      <svg 
        className="absolute bottom-0 w-[35%] h-[18%] z-50 pointer-events-none"
        style={{ 
          left: `${-8 - (offsetRef.current.topFg % 80)}%`,
          filter: 'blur(4px)',
        }}
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        {/* Short grass blades */}
        <path d="M15,100 C18,85 12,70 20,50" stroke="hsl(var(--fg-silhouette))" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M30,100 C35,82 25,65 38,40" stroke="hsl(var(--fg-silhouette))" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M48,100 C42,88 55,72 45,55" stroke="hsl(var(--fg-silhouette))" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M62,100 C68,85 58,68 72,45" stroke="hsl(var(--fg-silhouette))" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M78,100 C72,90 82,75 70,60" stroke="hsl(var(--fg-silhouette))" strokeWidth="4" fill="none" strokeLinecap="round" />
        
        {/* Clover at bottom */}
        <g transform="translate(25, 88)">
          <ellipse cx="-5" cy="-2" rx="6" ry="5" fill="hsl(var(--fg-silhouette))" transform="rotate(-30)" />
          <ellipse cx="5" cy="-2" rx="6" ry="5" fill="hsl(var(--fg-silhouette))" transform="rotate(30)" />
          <ellipse cx="0" cy="-8" rx="5" ry="5" fill="hsl(var(--fg-silhouette))" />
          <path d="M0,0 C0,3 0,8 0,12" stroke="hsl(var(--fg-silhouette))" strokeWidth="3" fill="none" />
        </g>
        
        {/* Second clover */}
        <g transform="translate(70, 92)">
          <ellipse cx="-4" cy="-2" rx="5" ry="4" fill="hsl(var(--fg-silhouette))" transform="rotate(-35)" />
          <ellipse cx="4" cy="-2" rx="5" ry="4" fill="hsl(var(--fg-silhouette))" transform="rotate(35)" />
          <ellipse cx="0" cy="-6" rx="4" ry="4" fill="hsl(var(--fg-silhouette))" />
          <path d="M0,0 C0,2 0,5 0,8" stroke="hsl(var(--fg-silhouette))" strokeWidth="2" fill="none" />
        </g>
      </svg>
      
      {/* Right side grass & clover cluster */}
      <svg 
        className="absolute bottom-0 w-[30%] h-[15%] z-50 pointer-events-none"
        style={{ 
          right: `${-5 - (offsetRef.current.topFg % 60) * 0.8}%`,
          filter: 'blur(3px)',
        }}
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        {/* Short grass blades */}
        <path d="M20,100 C25,85 15,70 28,50" stroke="hsl(var(--fg-silhouette))" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M40,100 C35,88 48,72 32,55" stroke="hsl(var(--fg-silhouette))" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M58,100 C65,82 52,65 68,42" stroke="hsl(var(--fg-silhouette))" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M75,100 C70,87 80,72 68,58" stroke="hsl(var(--fg-silhouette))" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M88,100 C92,90 82,78 95,62" stroke="hsl(var(--fg-silhouette))" strokeWidth="4" fill="none" strokeLinecap="round" />
        
        {/* Clover */}
        <g transform="translate(50, 90)">
          <ellipse cx="-5" cy="-2" rx="6" ry="5" fill="hsl(var(--fg-silhouette))" transform="rotate(-25)" />
          <ellipse cx="5" cy="-2" rx="6" ry="5" fill="hsl(var(--fg-silhouette))" transform="rotate(25)" />
          <ellipse cx="0" cy="-8" rx="5" ry="5" fill="hsl(var(--fg-silhouette))" />
          <path d="M0,0 C0,3 0,7 0,10" stroke="hsl(var(--fg-silhouette))" strokeWidth="3" fill="none" />
        </g>
      </svg>
      
      {/* Center grass accent */}
      <svg 
        className="absolute bottom-0 w-[25%] h-[12%] z-50 pointer-events-none"
        style={{ 
          left: `${45 - (offsetRef.current.topFg % 100) * 0.5}%`,
          filter: 'blur(5px)',
          opacity: 0.7,
        }}
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <path d="M30,100 C35,88 25,75 40,55" stroke="hsl(var(--fg-silhouette))" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M50,100 C45,85 55,70 42,50" stroke="hsl(var(--fg-silhouette))" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M70,100 C75,90 65,78 78,60" stroke="hsl(var(--fg-silhouette))" strokeWidth="5" fill="none" strokeLinecap="round" />
        
        {/* Small clover */}
        <g transform="translate(55, 92)">
          <ellipse cx="-3" cy="-2" rx="4" ry="3" fill="hsl(var(--fg-silhouette))" transform="rotate(-30)" />
          <ellipse cx="3" cy="-2" rx="4" ry="3" fill="hsl(var(--fg-silhouette))" transform="rotate(30)" />
          <ellipse cx="0" cy="-5" rx="3" ry="3" fill="hsl(var(--fg-silhouette))" />
        </g>
      </svg>
    </div>
  );
});

ParallaxBackground.displayName = 'ParallaxBackground';
