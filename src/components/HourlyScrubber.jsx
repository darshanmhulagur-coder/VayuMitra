import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, 
  CloudSun,
  CloudRain, 
  Cloud, 
  CloudFog,
  CloudLightning, 
  Moon, 
  Sunset,
  Clock, 
  Droplets,
  Wind
} from 'lucide-react';

export default function HourlyScrubber({
  hourlyData = [],
  isFahrenheit,
  onHoverHour,
  activeHoverHourIndex
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [internalHoverIndex, setInternalHoverIndex] = useState(null);

  if (!hourlyData || hourlyData.length === 0) return null;

  // Active index prioritized: prop or local state
  const effectiveIndex = (activeHoverHourIndex !== undefined && activeHoverHourIndex !== null)
    ? activeHoverHourIndex
    : internalHoverIndex;

  // Compute SVG Points for Temperature Curve (24 hours)
  const width = 860;
  const height = 120;
  const paddingX = 35;
  const paddingY = 25;

  const temps = hourlyData.map(h => isFahrenheit ? Math.round((h.temp * 9) / 5 + 32) : h.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = Math.max(1, maxTemp - minTemp);

  const points = hourlyData.map((h, i) => {
    const x = paddingX + (i / (hourlyData.length - 1)) * (width - 2 * paddingX);
    const normalizedY = (temps[i] - minTemp) / tempRange;
    const y = height - paddingY - normalizedY * (height - 2 * paddingY);
    return { x, y, temp: temps[i], data: h, index: i };
  });

  // Create smooth bezier curve path
  const createSmoothPath = (pts) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  // Resolves accurate meteorological icon per hour
  const getWeatherIcon = (h) => {
    if (h.condition?.icon === 'Sunset' || h.theme === 'sunset') return Sunset;
    if (h.condition?.icon === 'CloudLightning' || h.theme === 'storm') return CloudLightning;
    if (h.condition?.icon === 'CloudRain' || h.theme === 'rain') return CloudRain;
    if (h.condition?.icon === 'CloudFog' || h.condition?.main?.includes('Fog')) return CloudFog;
    if (h.condition?.icon === 'Cloud' || h.condition?.main === 'Overcast') return Cloud;
    if (h.condition?.icon === 'CloudSun' || h.condition?.main === 'Partly Cloudy') return CloudSun;
    if (h.condition?.icon === 'Moon' || h.isNight) return Moon;
    if (h.condition?.icon === 'Sun' || h.condition?.main === 'Sunny' || h.condition?.main === 'Mainly Clear') return Sun;
    return h.isNight ? Moon : Sun;
  };

  const getIconColor = (h) => {
    if (h.condition?.icon === 'Sunset' || h.theme === 'sunset') return 'text-rose-400';
    if (h.condition?.icon === 'CloudLightning' || h.theme === 'storm') return 'text-indigo-400';
    if (h.condition?.icon === 'CloudRain' || h.theme === 'rain') return 'text-cyan-400';
    if (h.condition?.icon === 'CloudFog' || h.condition?.main?.includes('Fog')) return 'text-slate-400';
    if (h.condition?.icon === 'Cloud' || h.condition?.main === 'Overcast') return 'text-slate-300';
    if (h.condition?.icon === 'CloudSun' || h.condition?.main === 'Partly Cloudy') return 'text-amber-300';
    if (h.condition?.icon === 'Moon' || h.isNight) return 'text-cyan-200';
    return 'text-amber-400';
  };

  // Smooth pointer scrubber over entire SVG area (no individual rect jitter!)
  const handleSvgPointer = (e) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    if (clientX === undefined) return;

    // Normalizing to SVG coordinates
    const relativeX = clientX - rect.left;
    const svgX = (relativeX / rect.width) * width;

    // Nearest point search
    let nearestIdx = 0;
    let minDistance = Infinity;
    points.forEach((pt, idx) => {
      const dist = Math.abs(pt.x - svgX);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = idx;
      }
    });

    if (effectiveIndex !== nearestIdx) {
      setInternalHoverIndex(nearestIdx);
      if (onHoverHour) {
        onHoverHour(points[nearestIdx].data, nearestIdx);
      }
    }
  };

  const handleSvgLeave = () => {
    setInternalHoverIndex(null);
    if (onHoverHour) {
      onHoverHour(null, null);
    }
  };

  // Safely auto-scroll the horizontal pill container without shifting the page window
  useEffect(() => {
    if (effectiveIndex !== null && containerRef.current) {
      const container = containerRef.current;
      const targetPill = container.children[effectiveIndex];
      if (targetPill) {
        const targetLeft = targetPill.offsetLeft;
        const targetWidth = targetPill.offsetWidth;
        const containerWidth = container.offsetWidth;
        container.scrollTo({
          left: targetLeft - containerWidth / 2 + targetWidth / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [effectiveIndex]);

  const activePoint = effectiveIndex !== null && effectiveIndex !== undefined ? points[effectiveIndex] : null;

  return (
    <div className="w-full rounded-3xl backdrop-blur-xl bg-white/10 dark:bg-black/25 border border-white/20 shadow-2xl p-5 sm:p-6 space-y-4 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-sm sm:text-base text-slate-100 font-sans tracking-wide">
            Today's 24-Hour Weather Timeline
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-300/80 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          Hover / Drag Curve to Scrub
        </span>
      </div>

      {/* SVG Smooth Curve Area Chart with Unified Scrubbing */}
      <div className="relative w-full overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[860px] relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-32 overflow-visible cursor-crosshair touch-none"
            onMouseMove={handleSvgPointer}
            onMouseLeave={handleSvgLeave}
            onTouchMove={handleSvgPointer}
            onTouchEnd={handleSvgLeave}
          >
            <defs>
              <linearGradient id="tempGradientArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0b0f19" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="tempLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>

            {/* Gradient Area Fill */}
            <path d={areaPath} fill="url(#tempGradientArea)" className="pointer-events-none" />

            {/* Glowing Main Curve */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#tempLineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              className="pointer-events-none"
            />

            {/* Static Data Dots & Numbers */}
            {points.map((pt, idx) => {
              const isSelected = effectiveIndex === idx;
              return (
                <g key={idx} className="pointer-events-none">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 5.5 : 3}
                    className={`transition-all duration-150 ${
                      isSelected 
                        ? 'fill-cyan-300 stroke-white stroke-2' 
                        : 'fill-cyan-400/75'
                    }`}
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    className={`text-[10px] font-mono font-bold transition-colors ${
                      isSelected ? 'fill-cyan-300 font-extrabold' : 'fill-slate-300'
                    }`}
                  >
                    {pt.temp}°
                  </text>
                </g>
              );
            })}

            {/* Interactive Vertical Scrubber Needle & Indicator */}
            {activePoint && (
              <g className="pointer-events-none">
                {/* Vertical Guide Line */}
                <line
                  x1={activePoint.x}
                  y1={8}
                  x2={activePoint.x}
                  y2={height}
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.85"
                />

                {/* Animated Glowing Ring */}
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="12"
                  className="fill-cyan-400/20 animate-ping"
                />
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="6"
                  className="fill-cyan-300 stroke-2 stroke-white shadow-lg"
                />

                {/* Floating Tag */}
                <g transform={`translate(${Math.min(width - 65, Math.max(65, activePoint.x))}, ${Math.max(16, activePoint.y - 24)})`}>
                  <rect
                    x="-60"
                    y="-13"
                    width="120"
                    height="22"
                    rx="11"
                    className="fill-slate-950/95 stroke-cyan-400 stroke-1 shadow-2xl"
                  />
                  <text
                    x="0"
                    y="1"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[10px] font-mono font-bold fill-cyan-200"
                  >
                    {activePoint.data.time} • {activePoint.temp}° • {activePoint.data.condition?.main || 'Live'}
                  </text>
                </g>
              </g>
            )}

            {/* Full-width transparent hit overlay */}
            <rect
              x="0"
              y="0"
              width={width}
              height={height}
              fill="transparent"
              className="cursor-crosshair"
            />
          </svg>
        </div>
      </div>

      {/* Horizontal Scrollable Hour Pills */}
      <div 
        ref={containerRef}
        className="flex items-center space-x-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-cyan-500/30"
      >
        {hourlyData.map((item, idx) => {
          const Icon = getWeatherIcon(item);
          const iconColor = getIconColor(item);
          const isSelected = effectiveIndex === idx;
          const displayT = isFahrenheit ? Math.round((item.temp * 9) / 5 + 32) : item.temp;

          return (
            <motion.div
              key={idx}
              whileHover={{ y: -2, scale: 1.02 }}
              onMouseEnter={() => {
                setInternalHoverIndex(idx);
                onHoverHour && onHoverHour(item, idx);
              }}
              onMouseLeave={() => {
                setInternalHoverIndex(null);
                onHoverHour && onHoverHour(null, null);
              }}
              onClick={() => {
                setInternalHoverIndex(idx);
                onHoverHour && onHoverHour(item, idx);
              }}
              className={`p-3 rounded-2xl border transition-all cursor-pointer min-w-[78px] flex flex-col items-center justify-between text-center select-none ${
                isSelected
                  ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 scale-105'
                  : 'backdrop-blur-md bg-white/5 border-white/10 text-slate-300 hover:border-cyan-400/40 hover:bg-white/10'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                  {item.time}
                </span>
                {item.isCurrentHour && (
                  <span className="text-[8px] font-mono font-bold text-cyan-300 bg-cyan-500/15 px-1 py-0.2 rounded border border-cyan-500/25 mt-0.5">
                    Now
                  </span>
                )}
              </div>

              <div className="my-1.5 p-1 rounded-xl bg-white/5">
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>

              <span className="text-sm font-mono font-bold text-slate-100">
                {displayT}°
              </span>

              {/* Condition Name Tag */}
              <span className="mt-0.5 text-[9px] font-mono text-slate-300/80 truncate max-w-[70px]">
                {item.condition?.main || (item.isNight ? 'Night' : 'Clear')}
              </span>

              {/* Rain Chance Tag */}
              <div className="mt-1 flex items-center space-x-0.5 text-[9px] font-mono text-cyan-300">
                <Droplets className="w-2.5 h-2.5" />
                <span>{item.pop}%</span>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
