import React, { useEffect, useRef } from 'react';

export default function ParticleBackground({ weatherTheme = 'clear' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const isRain = weatherTheme === 'rain' || weatherTheme === 'rainy';
    const isStorm = weatherTheme === 'storm' || weatherTheme === 'stormy';
    const isCloudy = weatherTheme === 'cloudy' || weatherTheme === 'clouds' || weatherTheme === 'fog';
    const isSunset = weatherTheme === 'sunset';

    // Particle pool setup
    const particles = [];
    const count = isStorm ? 160 : isRain ? 120 : isCloudy ? 45 : isSunset ? 55 : 50;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 25 + 12,
        speed: (isRain || isStorm) 
          ? Math.random() * 9 + (isStorm ? 12 : 9) 
          : isCloudy 
            ? Math.random() * 0.5 + 0.2 
            : Math.random() * 0.8 + 0.3,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        drift: Math.random() * 1.5 - 0.75,
        radius: Math.random() * 80 + 30
      });
    }

    // Splash ripples pool for rain/storm
    const splashes = [];
    let lightningOpacity = 0;
    let nextLightningTime = Date.now() + 3000 + Math.random() * 4000;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Ambient Lightning Flash (Stormy mode)
      if (isStorm) {
        const now = Date.now();
        if (now > nextLightningTime) {
          lightningOpacity = 0.35 + Math.random() * 0.25;
          nextLightningTime = now + 4000 + Math.random() * 6000;
        }

        if (lightningOpacity > 0.01) {
          ctx.fillStyle = `rgba(224, 231, 255, ${lightningOpacity})`;
          ctx.fillRect(0, 0, width, height);
          lightningOpacity *= 0.85; // fast decay
        }
      }

      // 2. Rain & Storm particle streaks with ground splashes
      if (isRain || isStorm) {
        ctx.strokeStyle = isStorm ? 'rgba(147, 197, 253, 0.65)' : 'rgba(34, 211, 238, 0.45)';
        ctx.lineWidth = isStorm ? 1.5 : 1.2;
        ctx.beginPath();

        for (let p of particles) {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 1.8, p.y + p.length);
          p.y += p.speed;
          p.x -= 0.9;

          if (p.y > height) {
            // Spawn splash ripple occasionally
            if (splashes.length < 30 && Math.random() < 0.4) {
              splashes.push({
                x: p.x,
                y: height - Math.random() * 25,
                r: 1,
                maxR: Math.random() * 8 + 4,
                alpha: 0.5
              });
            }
            p.y = -20;
            p.x = Math.random() * (width + 100);
          }
        }
        ctx.stroke();

        // Render animated splashes
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          ctx.strokeStyle = `rgba(186, 230, 253, ${s.alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.stroke();
          s.r += 0.8;
          s.alpha -= 0.035;
          if (s.alpha <= 0) {
            splashes.splice(i, 1);
          }
        }
      } else if (isCloudy) {
        // Drifting volumetric mist particles
        for (let p of particles) {
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          gradient.addColorStop(0, `rgba(148, 163, 184, ${p.opacity * 0.12})`);
          gradient.addColorStop(1, 'rgba(148, 163, 184, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          p.x += p.speed;
          if (p.x - p.radius > width) {
            p.x = -p.radius;
            p.y = Math.random() * height;
          }
        }
      } else if (isSunset) {
        // Warm floating sunset dust particles (violet-rose-amber)
        for (let p of particles) {
          ctx.fillStyle = `rgba(251, 146, 60, ${p.opacity * 0.4})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.6, 0, Math.PI * 2);
          ctx.fill();

          p.y -= p.speed * 0.5;
          p.x += Math.sin(p.y * 0.015) * 0.5;

          if (p.y < 0) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        }
      } else {
        // Golden sunlight floating solar dust orbs
        for (let p of particles) {
          ctx.fillStyle = `rgba(250, 204, 21, ${p.opacity * 0.35})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
          ctx.fill();

          p.y -= p.speed * 0.4;
          p.x += Math.sin(p.y * 0.01) * 0.4;

          if (p.y < 0) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [weatherTheme]);

  // Dynamic atmospheric gradient mesh background classes
  const getGradientMesh = () => {
    switch (weatherTheme) {
      case 'rain':
      case 'rainy':
        return 'from-[#081220] via-[#0b172a] to-[#040914]';
      case 'storm':
      case 'stormy':
        return 'from-[#0b0c1e] via-[#09101f] to-[#03050c]';
      case 'cloudy':
      case 'clouds':
      case 'fog':
        return 'from-[#0c1424] via-[#11192e] to-[#080d19]';
      case 'sunset':
        return 'from-[#1a0c24] via-[#1a0f1e] to-[#0a0714]';
      case 'clear':
      case 'sun':
      default:
        return 'from-[#08152c] via-[#061826] to-[#040c18]';
    }
  };

  const getGlowOrbs = () => {
    switch (weatherTheme) {
      case 'rain':
      case 'rainy':
        return (
          <>
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-600/15 blur-[120px] pointer-events-none animate-pulse-slow" />
            <div className="absolute top-1/3 -right-24 w-[30rem] h-[30rem] rounded-full bg-blue-700/15 blur-[140px] pointer-events-none" />
          </>
        );
      case 'storm':
      case 'stormy':
        return (
          <>
            <div className="absolute -top-32 left-1/4 w-[32rem] h-[32rem] rounded-full bg-indigo-700/20 blur-[130px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-[28rem] h-[28rem] rounded-full bg-violet-800/15 blur-[140px] pointer-events-none" />
          </>
        );
      case 'cloudy':
      case 'clouds':
      case 'fog':
        return (
          <>
            <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-slate-500/15 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-20 right-10 w-[28rem] h-[28rem] rounded-full bg-cyan-800/15 blur-[140px] pointer-events-none" />
          </>
        );
      case 'sunset':
        return (
          <>
            <div className="absolute -top-24 left-1/3 w-[34rem] h-[34rem] rounded-full bg-rose-600/20 blur-[130px] pointer-events-none" />
            <div className="absolute top-1/2 -left-20 w-96 h-96 rounded-full bg-amber-600/20 blur-[130px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[28rem] h-[28rem] rounded-full bg-violet-600/20 blur-[140px] pointer-events-none" />
          </>
        );
      case 'clear':
      case 'sun':
      default:
        return (
          <>
            <div className="absolute -top-36 -left-20 w-[36rem] h-[36rem] rounded-full bg-cyan-500/20 blur-[130px] pointer-events-none animate-pulse-slow" />
            <div className="absolute top-1/4 -right-28 w-[32rem] h-[32rem] rounded-full bg-amber-500/15 blur-[140px] pointer-events-none" />
            <div className="absolute bottom-10 left-1/3 w-[26rem] h-[26rem] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
          </>
        );
    }
  };

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 transition-colors duration-1000 bg-gradient-to-br ${getGradientMesh()}`}>
      {getGlowOrbs()}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-85"
      />
    </div>
  );
}
