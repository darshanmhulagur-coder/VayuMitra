import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Sun, 
  CloudRain, 
  CloudLightning, 
  Cloud, 
  Sunset, 
  Moon,
  ArrowUp, 
  ArrowDown, 
  Clock, 
  Sparkles,
  MapPin,
  Calendar,
  Eye,
  Droplets
} from 'lucide-react';
import { getLocalNow, getUserTimezone, formatLocalTime, formatLocalDate } from '../services/networkTime';

export default function ModernHeroStage({
  weatherData,
  activeConditionOverride = null,
  isFahrenheit,
  hourlyPreviewItem = null
}) {
  // Live ticking clock & dynamic rolling date synchronized with user's local timezone
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const userTz = getUserTimezone();
      const now = getLocalNow();
      setCurrentTime(formatLocalTime(now, userTz, true));
      setCurrentDate(formatLocalDate(now, userTz));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 3D Card Tilt Effect using Framer Motion Springs
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7.5deg', '-7.5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7.5deg', '7.5deg']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Temperature calculations
  const rawTemp = hourlyPreviewItem ? hourlyPreviewItem.temp : (weatherData?.current?.temp ?? 27);
  const currentTemp = isFahrenheit ? Math.round((rawTemp * 9) / 5 + 32) : rawTemp;
  const unit = isFahrenheit ? '°F' : '°C';

  const rawFeels = hourlyPreviewItem ? (hourlyPreviewItem.temp + 1) : (weatherData?.current?.feelsLike ?? (rawTemp + 1));
  const feelsLike = isFahrenheit ? Math.round((rawFeels * 9) / 5 + 32) : rawFeels;

  const rawHigh = weatherData?.daily?.[0]?.maxTemp ?? (rawTemp + 4);
  const highTemp = isFahrenheit ? Math.round((rawHigh * 9) / 5 + 32) : rawHigh;

  const rawLow = weatherData?.daily?.[0]?.minTemp ?? (rawTemp - 5);
  const lowTemp = isFahrenheit ? Math.round((rawLow * 9) / 5 + 32) : rawLow;

  const isNight = hourlyPreviewItem 
    ? Boolean(hourlyPreviewItem.isNight)
    : Boolean(weatherData?.current?.condition?.isNight ?? (getLocalNow().getHours() >= 20 || getLocalNow().getHours() < 5));

  // Resolved condition name directly from live API / scrubbed hour
  const activeConditionName = hourlyPreviewItem 
    ? (hourlyPreviewItem.condition?.main || 'Live')
    : (activeConditionOverride 
        ? (activeConditionOverride.charAt(0).toUpperCase() + activeConditionOverride.slice(1)) 
        : (weatherData?.current?.condition?.main || 'Sunny'));

  // Condition 3D Glyph Builder
  const render3DGlyph = () => {
    const activeCondObj = hourlyPreviewItem?.condition 
      || (activeConditionOverride ? { theme: activeConditionOverride, main: activeConditionOverride } : weatherData?.current?.condition);

    const mainLower = (activeCondObj?.main || '').toLowerCase();
    const themeLower = (activeCondObj?.theme || '').toLowerCase();
    const iconName = activeCondObj?.icon || '';

    // Thunderstorm
    if (mainLower.includes('storm') || mainLower.includes('thunder') || themeLower === 'storm' || iconName === 'CloudLightning') {
      return (
        <div className="relative flex items-center justify-center w-36 h-36 md:w-44 md:h-44">
          <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-3xl animate-pulse" />
          <motion.div
            animate={{ y: [-8, 8, -8], scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            className="relative z-10"
          >
            <CloudLightning className="w-28 h-28 md:w-36 md:h-36 text-indigo-300 drop-shadow-[0_15px_35px_rgba(99,102,241,0.7)]" />
          </motion.div>
        </div>
      );
    }

    // Rain / Heavy Rain / Showers
    if (mainLower.includes('rain') || mainLower.includes('drizzle') || themeLower === 'rain' || iconName === 'CloudRain') {
      return (
        <div className="relative flex items-center justify-center w-36 h-36 md:w-44 md:h-44">
          <div className="absolute inset-0 rounded-full bg-cyan-500/25 blur-3xl animate-pulse" />
          <motion.div
            animate={{ y: [-6, 6, -6], rotate: [-1, 1, -1] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            className="relative z-10"
          >
            <CloudRain className="w-28 h-28 md:w-36 md:h-36 text-cyan-300 drop-shadow-[0_15px_30px_rgba(6,182,212,0.6)]" />
          </motion.div>
        </div>
      );
    }

    // Sunset Golden Hour
    if (mainLower.includes('sunset') || themeLower === 'sunset' || iconName === 'Sunset') {
      return (
        <div className="relative flex items-center justify-center w-36 h-36 md:w-44 md:h-44">
          <div className="absolute inset-0 rounded-full bg-rose-500/30 blur-3xl animate-pulse" />
          <motion.div
            animate={{ y: [-6, 6, -6], rotate: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="relative z-10"
          >
            <Sunset className="w-28 h-28 md:w-36 md:h-36 text-rose-300 drop-shadow-[0_15px_35px_rgba(244,63,94,0.6)]" />
          </motion.div>
        </div>
      );
    }

    // Clear Night Sky / Moon
    if (iconName === 'Moon' || themeLower === 'night' || (isNight && (mainLower.includes('clear') || mainLower.includes('sun')))) {
      return (
        <div className="relative flex items-center justify-center w-36 h-36 md:w-44 md:h-44">
          <div className="absolute inset-0 rounded-full bg-indigo-500/25 blur-3xl animate-pulse" />
          <div className="absolute -top-1 -right-1 w-10 h-10 rounded-full bg-cyan-400/20 blur-xl" />
          <motion.div
            animate={{ y: [-6, 6, -6], rotate: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="relative z-10"
          >
            <Moon className="w-28 h-28 md:w-36 md:h-36 text-cyan-200 drop-shadow-[0_15px_35px_rgba(6,182,212,0.6)]" />
          </motion.div>
        </div>
      );
    }

    // Dense Overcast / Fog & Mist
    if (mainLower.includes('overcast') || mainLower.includes('fog') || (mainLower.includes('cloud') && !mainLower.includes('partly'))) {
      return (
        <div className="relative flex items-center justify-center w-36 h-36 md:w-44 md:h-44">
          <div className="absolute inset-0 rounded-full bg-slate-400/20 blur-3xl" />
          <motion.div
            animate={{ y: [-6, 6, -6], x: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="relative z-10"
          >
            <Cloud className="w-28 h-28 md:w-36 md:h-36 text-slate-200 drop-shadow-[0_15px_30px_rgba(203,213,225,0.4)]" />
          </motion.div>
        </div>
      );
    }

    // Partly Cloudy (Sun with Cloud)
    if (mainLower.includes('partly')) {
      return (
        <div className="relative flex items-center justify-center w-36 h-36 md:w-44 md:h-44">
          <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-3xl animate-pulse-slow" />
          <motion.div
            animate={{ y: [-6, 6, -6], rotate: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="relative z-10 flex items-center justify-center"
          >
            <Sun className="w-24 h-24 md:w-30 md:h-30 text-amber-300 drop-shadow-[0_10px_25px_rgba(245,158,11,0.6)]" />
            <Cloud className="w-16 h-16 md:w-20 md:h-20 text-slate-200 absolute -bottom-2 -right-2 drop-shadow-[0_8px_20px_rgba(203,213,225,0.5)]" />
          </motion.div>
        </div>
      );
    }

    // Default: Clear Sunshine / Bright Sunny Sky
    return (
      <div className="relative flex items-center justify-center w-36 h-36 md:w-44 md:h-44">
        <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-3xl animate-pulse-slow" />
        <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-yellow-300/40 blur-xl" />
        <motion.div
          animate={{ y: [-8, 8, -8], rotate: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut" }}
          className="relative z-10"
        >
          <Sun className="w-28 h-28 md:w-36 md:h-36 text-amber-300 drop-shadow-[0_15px_40px_rgba(245,158,11,0.65)]" />
        </motion.div>
      </div>
    );
  };

  return (
    <div style={{ perspective: 1000 }} className="w-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        className="relative overflow-hidden rounded-3xl backdrop-blur-2xl bg-white/10 dark:bg-black/25 border border-white/20 shadow-2xl p-6 sm:p-8 lg:p-10 transition-shadow duration-300 hover:shadow-cyan-500/10"
      >
        {/* Subtle Ambient Refraction Gradients */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-400/10 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Column: Location, Date, Live Clock & Scrub Status */}
          <div className="flex-1 space-y-4 text-center lg:text-left">
            
            {/* Scrubber Preview Alert Badge / Live Status (Fixed Height - Zero Layout Shift) */}
            <div className="h-7 flex items-center justify-center lg:justify-start">
              {hourlyPreviewItem ? (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-semibold animate-pulse">
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Simulating Today: {hourlyPreviewItem.time}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-mono">
                  <Clock className="w-3.5 h-3.5 text-cyan-400/80 shrink-0" />
                  <span>Live Real-Time Radar Sync</span>
                </div>
              )}
            </div>

            {/* City & State Title */}
            <div>
              <div className="flex items-center justify-center lg:justify-start space-x-2 text-xs font-mono uppercase tracking-widest text-cyan-300/80">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{weatherData?.district || 'Belagavi'}, {weatherData?.state || 'Karnataka'}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-sans tracking-tight text-white mt-1">
                {weatherData?.district || 'Belagavi'}
              </h1>
            </div>

            {/* Live Clock & Dynamic Live Date Chips */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-xs text-slate-300 font-medium">
              <span className="flex items-center space-x-1.5 px-3 py-1 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 font-mono">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentTime || '12:00:00 PM'}</span>
              </span>
              <span className="flex items-center space-x-1.5 px-3 py-1 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 font-mono">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {currentDate || weatherData?.current?.date || 'Today'}
                </span>
              </span>
            </div>

            {/* Condition Phrase & High/Low Pills */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 min-h-[32px]">
              <span className="text-base sm:text-xl font-bold tracking-wide text-slate-100 capitalize">
                {activeConditionName}
              </span>
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="flex items-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                  <ArrowUp className="w-3 h-3 mr-0.5" />
                  H: {highTemp}{unit}
                </span>
                <span className="flex items-center text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-lg">
                  <ArrowDown className="w-3 h-3 mr-0.5" />
                  L: {lowTemp}{unit}
                </span>
              </div>
            </div>

          </div>

          {/* Center/Right: Temperature Number Ticker & 3D Floating Weather Glyph */}
          <div className="flex items-center space-x-6 sm:space-x-10">
            
            {/* Animated Temperature Big Display */}
            <div className="text-right">
              <div className="flex items-start justify-end font-mono h-20 sm:h-24">
                <motion.span
                  key={currentTemp}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white drop-shadow-2xl tabular-nums"
                >
                  {currentTemp}
                </motion.span>
                <span className="text-2xl sm:text-4xl font-extralight text-cyan-300 ml-1 mt-1">
                  {unit}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Feels like <span className="text-cyan-300 font-bold">{feelsLike}{unit}</span>
              </p>
            </div>

            {/* 3D Floating Weather Glyph */}
            <div className="shrink-0">
              {render3DGlyph()}
            </div>

          </div>

        </div>

      </motion.div>
    </div>
  );
}
