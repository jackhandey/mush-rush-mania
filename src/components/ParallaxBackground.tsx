import { memo, useRef, useEffect, useState } from 'react';

interface ParallaxBackgroundProps {
  isPlaying: boolean;
  worldSpeed: number;
}

interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  drift: number;
  blinkPhase?: number;
}

export const ParallaxBackground = memo(({ isPlaying, worldSpeed }: ParallaxBackgroundProps) => {
  const isMobile = window.innerWidth <= 768;
  const [tick, setTick] = useState(0);
  const particlesRef = useRef<FloatingParticle[]>([]);
  const firefliesRef = useRef<FloatingParticle[]>([]);
  const offsetRef = useRef({ bg: 0, mid: 0, fg: 0 });
  
  // Initialize particles (desktop only for performance)
  useEffect(() => {
    if (isMobile) return;
    
    // Floating spores
    const spores: FloatingParticle[] = [];
    for (let i = 0; i < 12; i++) {
      spores.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.4,
        speed: 0.03 + Math.random() * 0.05,
        drift: (Math.random() - 0.5) * 0.1,
      });
    }
    particlesRef.current = spores;
    
    // Fireflies
    const flies: FloatingParticle[] = [];
    for (let i = 0; i < 8; i++) {
      flies.push({
        id: i,
        x: Math.random() * 100,
        y: 20 + Math.random() * 60,
        size: 3 + Math.random() * 2,
        opacity: 0.6 + Math.random() * 0.4,
        speed: 0.02 + Math.random() * 0.03,
        drift: (Math.random() - 0.5) * 0.15,
        blinkPhase: Math.random() * 360,
      });
    }
    firefliesRef.current = flies;
  }, [isMobile]);
  
  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;
    
    let animationId: number;
    const animate = () => {
      // Parallax scroll speeds
      const bgSpeed = worldSpeed * 0.02;
      const midSpeed = worldSpeed * 0.05;
      const fgSpeed = worldSpeed * 0.08;
      
      offsetRef.current = {
        bg: (offsetRef.current.bg + bgSpeed) % 200,
        mid: (offsetRef.current.mid + midSpeed) % 200,
        fg: (offsetRef.current.fg + fgSpeed) % 200,
      };
      
      // Update particles (desktop only)
      if (!isMobile) {
        particlesRef.current = particlesRef.current.map(p => ({
          ...p,
          y: p.y > 105 ? -5 : p.y + p.speed,
          x: ((p.x + p.drift + 100) % 100),
        }));
        
        firefliesRef.current = firefliesRef.current.map(f => ({
          ...f,
          x: ((f.x + f.drift + 100) % 100),
          y: f.y + Math.sin(Date.now() * 0.001 + f.id) * 0.1,
          blinkPhase: ((f.blinkPhase || 0) + 3) % 360,
        }));
      }
      
      setTick(t => t + 1);
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, worldSpeed, isMobile]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* ========== BACKGROUND LAYER (Slowest) ========== */}
      {/* Dark forest silhouette with moon */}
      <div className="absolute inset-0 bg-gradient-to-b from-parallax-sky via-parallax-skyMid to-parallax-skyBottom" />
      
      {/* Large glowing moon */}
      <div 
        className="absolute w-16 h-16 md:w-24 md:h-24 rounded-full"
        style={{
          top: '8%',
          right: `${15 + offsetRef.current.bg * 0.05}%`,
          background: 'radial-gradient(circle at 40% 40%, hsl(var(--moon-glow)), hsl(var(--moon-surface)), hsl(var(--moon-dark)))',
          boxShadow: '0 0 60px 20px hsl(var(--moon-glow) / 0.3), 0 0 120px 40px hsl(var(--moon-glow) / 0.1)',
        }}
      />
      
      {/* Rolling hills silhouette - far */}
      <div 
        className="absolute bottom-[25%] h-[30%] w-[250%]"
        style={{
          left: `${-50 - offsetRef.current.bg * 0.3}%`,
          background: 'hsl(var(--hill-far))',
          clipPath: 'polygon(0% 100%, 0% 70%, 5% 65%, 12% 72%, 20% 55%, 30% 68%, 40% 50%, 50% 65%, 60% 45%, 70% 60%, 80% 48%, 90% 62%, 100% 52%, 100% 100%)',
        }}
      />
      
      {/* Rolling hills - near */}
      <div 
        className="absolute bottom-[20%] h-[25%] w-[250%]"
        style={{
          left: `${-30 - offsetRef.current.bg * 0.5}%`,
          background: 'hsl(var(--hill-near))',
          clipPath: 'polygon(0% 100%, 0% 80%, 8% 70%, 15% 78%, 25% 60%, 35% 72%, 45% 55%, 55% 68%, 65% 50%, 75% 65%, 85% 52%, 95% 60%, 100% 55%, 100% 100%)',
        }}
      />
      
      {/* Tree silhouettes on hills */}
      <div 
        className="absolute bottom-[30%] h-[20%] w-[300%] opacity-80"
        style={{
          left: `${-80 - offsetRef.current.bg * 0.4}%`,
        }}
      >
        {[0, 15, 35, 55, 70, 90, 110, 130].map((pos, i) => (
          <div 
            key={i}
            className="absolute bottom-0"
            style={{
              left: `${pos}%`,
              width: '8%',
              height: `${60 + (i % 3) * 20}%`,
              background: 'hsl(var(--tree-silhouette))',
              clipPath: 'polygon(50% 0%, 15% 100%, 85% 100%)',
            }}
          />
        ))}
      </div>

      {/* ========== MID-GROUND LAYER (Medium Speed) ========== */}
      {/* Giant hollow log */}
      <div 
        className="absolute bottom-[15%] h-[18%] w-[40%] md:w-[30%] rounded-[50%] opacity-70"
        style={{
          left: `${80 - offsetRef.current.mid}%`,
          background: 'linear-gradient(180deg, hsl(var(--log-dark)) 0%, hsl(var(--log-color)) 50%, hsl(var(--log-light)) 100%)',
          boxShadow: 'inset 0 -10px 30px hsl(var(--log-dark))',
        }}
      />
      
      {/* Twisted tree roots */}
      <div 
        className="absolute bottom-[10%] h-[25%] w-[20%] opacity-60"
        style={{
          left: `${120 - offsetRef.current.mid}%`,
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <path 
            d="M10,100 Q20,60 35,40 Q50,20 60,30 Q70,40 65,60 Q60,80 70,100" 
            fill="hsl(var(--root-color))"
          />
          <path 
            d="M30,100 Q40,70 55,50 Q65,35 75,45 Q85,55 80,75 Q75,90 85,100" 
            fill="hsl(var(--root-color))"
            opacity="0.8"
          />
        </svg>
      </div>
      
      {/* Mossy rock */}
      <div 
        className="absolute bottom-[12%] h-[12%] w-[15%] md:w-[10%] opacity-50"
        style={{
          left: `${160 - offsetRef.current.mid}%`,
          background: 'radial-gradient(ellipse at 50% 30%, hsl(var(--rock-moss)), hsl(var(--rock-dark)))',
          borderRadius: '60% 70% 50% 60%',
        }}
      />
      
      {/* Second log */}
      <div 
        className="absolute bottom-[8%] h-[15%] w-[35%] md:w-[25%] rounded-[40%] opacity-50"
        style={{
          left: `${200 - offsetRef.current.mid}%`,
          background: 'linear-gradient(170deg, hsl(var(--log-color)) 0%, hsl(var(--log-dark)) 100%)',
        }}
      />

      {/* ========== GOD RAYS ========== */}
      <div className="absolute inset-0 overflow-hidden opacity-20 md:opacity-30">
        <div 
          className="absolute top-0 w-[30%] h-[70%] origin-top"
          style={{
            left: '15%',
            background: 'linear-gradient(180deg, hsl(var(--god-ray)) 0%, transparent 100%)',
            clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)',
            transform: 'rotate(-5deg)',
          }}
        />
        <div 
          className="absolute top-0 w-[25%] h-[60%] origin-top"
          style={{
            left: '45%',
            background: 'linear-gradient(180deg, hsl(var(--god-ray)) 0%, transparent 100%)',
            clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
            transform: 'rotate(3deg)',
          }}
        />
        <div 
          className="absolute top-0 w-[20%] h-[50%] origin-top"
          style={{
            right: '20%',
            background: 'linear-gradient(180deg, hsl(var(--god-ray)) 0%, transparent 100%)',
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
            transform: 'rotate(8deg)',
          }}
        />
      </div>

      {/* ========== FOREGROUND LAYER (Fastest) ========== */}
      {/* Blurred grass blades - left */}
      <div 
        className="absolute bottom-0 h-[30%] w-[15%] opacity-40 blur-sm"
        style={{
          left: `${-5 - (offsetRef.current.fg % 50)}%`,
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <path d="M20,100 Q25,60 15,20" stroke="hsl(var(--grass-blade))" strokeWidth="3" fill="none" />
          <path d="M40,100 Q45,50 35,10" stroke="hsl(var(--grass-blade))" strokeWidth="4" fill="none" />
          <path d="M60,100 Q55,55 65,15" stroke="hsl(var(--grass-blade))" strokeWidth="3" fill="none" />
          <path d="M80,100 Q85,65 75,25" stroke="hsl(var(--grass-blade))" strokeWidth="2" fill="none" />
        </svg>
      </div>
      
      {/* Blurred vines - right */}
      <div 
        className="absolute top-0 h-[40%] w-[10%] opacity-30 blur-sm"
        style={{
          right: `${-3 - (offsetRef.current.fg % 40) * 0.5}%`,
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <path d="M30,0 Q40,30 25,60 Q10,90 30,100" stroke="hsl(var(--vine-color))" strokeWidth="4" fill="none" />
          <path d="M70,0 Q60,40 75,70 Q90,100 70,100" stroke="hsl(var(--vine-color))" strokeWidth="3" fill="none" />
        </svg>
      </div>

      {/* ========== FLOATING PARTICLES (Desktop only) ========== */}
      {!isMobile && particlesRef.current.map(p => (
        <div
          key={`spore-${p.id}`}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: 'radial-gradient(circle, hsl(var(--spore-glow)), transparent)',
            boxShadow: `0 0 ${p.size * 2}px hsl(var(--spore-glow) / ${p.opacity})`,
            opacity: p.opacity,
          }}
        />
      ))}
      
      {/* Fireflies (Desktop only) */}
      {!isMobile && firefliesRef.current.map(f => {
        const blinkIntensity = Math.max(0, Math.sin((f.blinkPhase || 0) * Math.PI / 180));
        return (
          <div
            key={`firefly-${f.id}`}
            className="absolute rounded-full"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              width: f.size,
              height: f.size,
              background: `radial-gradient(circle, hsl(var(--firefly-glow)), transparent)`,
              boxShadow: `0 0 ${f.size * 3}px hsl(var(--firefly-glow) / ${blinkIntensity * 0.8})`,
              opacity: f.opacity * blinkIntensity,
            }}
          />
        );
      })}

      {/* ========== ATMOSPHERIC OVERLAY ========== */}
      {/* Subtle fog at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[20%] pointer-events-none"
        style={{
          background: 'linear-gradient(to top, hsl(var(--fog-color) / 0.3), transparent)',
        }}
      />
    </div>
  );
});

ParallaxBackground.displayName = 'ParallaxBackground';
