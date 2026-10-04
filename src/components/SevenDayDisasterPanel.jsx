import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Sun, 
  CloudRain, 
  Cloud, 
  CloudLightning, 
  Droplets
} from 'lucide-react';

export default function SevenDayDisasterPanel({
  weatherData,
  isFahrenheit
}) {
  const [expandedDay, setExpandedDay] = useState(null);

  if (!weatherData?.daily || weatherData.daily.length === 0) return null;

  const days = weatherData.daily;
  const unit = isFahrenheit ? '°F' : '°C';

  // Find min and max across whole week for range slider
  const allMins = days.map(d => isFahrenheit ? Math.round((d.minTemp * 9) / 5 + 32) : d.minTemp);
  const allMaxs = days.map(d => isFahrenheit ? Math.round((d.maxTemp * 9) / 5 + 32) : d.maxTemp);
  const weekMin = Math.min(...allMins);
  const weekMax = Math.max(...allMaxs);
  const weekSpan = Math.max(1, weekMax - weekMin);

  const getWeatherIcon = (condition) => {
    const main = condition?.main?.toLowerCase() || '';
    if (main.includes('rain')) return CloudRain;
    if (main.includes('storm')) return CloudLightning;
    if (main.includes('cloud') || main.includes('fog')) return Cloud;
    return Sun;
  };

  return (
    <div className="w-full">
      
      {/* 7-Day Forecast Panel with Staggered Entrance & Range Sliders */}
      <div className="rounded-3xl backdrop-blur-xl bg-white/10 dark:bg-black/25 border border-white/20 shadow-2xl p-5 sm:p-6 space-y-4">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2 text-slate-200">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm sm:text-base font-sans tracking-wide">
              7-Day Synoptic Outlook & Temperature Spans
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            ECMWF 9km Grid Model
          </span>
        </div>

        {/* Staggered Day Rows */}
        <div className="space-y-2.5">
          {days.map((dayItem, idx) => {
            const Icon = getWeatherIcon(dayItem.condition);
            const isExpanded = expandedDay === idx;
            const minT = isFahrenheit ? Math.round((dayItem.minTemp * 9) / 5 + 32) : dayItem.minTemp;
            const maxT = isFahrenheit ? Math.round((dayItem.maxTemp * 9) / 5 + 32) : dayItem.maxTemp;

            // Calculate min/max percentage within week range for slider
            const leftPct = ((minT - weekMin) / weekSpan) * 100;
            const widthPct = Math.max(12, ((maxT - minT) / weekSpan) * 100);

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-cyan-400/30 transition-all overflow-hidden"
              >
                <div
                  onClick={() => setExpandedDay(isExpanded ? null : idx)}
                  className="p-3.5 sm:px-5 flex items-center justify-between cursor-pointer gap-3"
                >
                  {/* Left: Day & Icon */}
                  <div className="flex items-center space-x-3 w-32 sm:w-40 shrink-0">
                    <div className="p-1.5 rounded-xl bg-white/5 shrink-0">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {idx === 0 ? 'Today' : (idx === 1 ? 'Tomorrow' : dayItem.day)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {dayItem.date}
                      </div>
                    </div>
                  </div>

                  {/* Rain Probability Pill */}
                  <div className="hidden sm:flex items-center space-x-1 text-[11px] font-mono text-cyan-300 w-16 shrink-0">
                    <Droplets className="w-3 h-3 text-cyan-400" />
                    <span>{dayItem.pop}%</span>
                  </div>

                  {/* Center: Visual Min/Max Range Slider */}
                  <div className="flex-1 max-w-xs sm:max-w-md mx-2 flex items-center space-x-2">
                    <span className="text-xs font-mono font-medium text-slate-400 w-7 text-right">
                      {minT}°
                    </span>
                    <div className="relative flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`
                        }}
                        className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-400 shadow-sm"
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-100 w-7">
                      {maxT}°
                    </span>
                  </div>

                  {/* Right: Expand arrow */}
                  <div className="text-slate-400 hover:text-white shrink-0 pl-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expandable Accordion Drawer with Deep Synoptic Metrics */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-white/5 bg-slate-950/40 p-4 text-xs space-y-2 font-mono text-slate-300"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-2 rounded-xl bg-white/5">
                          <span className="text-[10px] text-slate-400 block">Condition</span>
                          <span className="text-slate-100 font-bold capitalize">{dayItem.condition?.desc}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5">
                          <span className="text-[10px] text-slate-400 block">Precipitation Chance</span>
                          <span className="text-cyan-300 font-bold">{dayItem.pop}%</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5">
                          <span className="text-[10px] text-slate-400 block">Temperature High</span>
                          <span className="text-amber-300 font-bold">{maxT}{unit}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5">
                          <span className="text-[10px] text-slate-400 block">Temperature Low</span>
                          <span className="text-sky-300 font-bold">{minT}{unit}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans pt-1">
                        Physical Ensemble Projection: Synoptic winds maintain steady relative humidity levels with standard diurnal boundary-layer cooling.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
