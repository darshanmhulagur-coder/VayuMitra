import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sprout, 
  Droplets, 
  Bug, 
  ShieldCheck, 
  AlertCircle, 
  Calendar, 
  Waves, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function AgriUtilityDrawer({ weatherData, isOpen, onClose }) {
  if (!isOpen || !weatherData) return null;

  const agri = weatherData?.agriculture;
  const pestAlert = agri?.pestAlert;
  const soilMoisture = agri?.soilMoisture ?? null;
  const et0 = agri?.et0 ?? 3.8;
  const irrigationAdvice = agri?.irrigationAdvice ?? 'Maintain standard drip irrigation schedule.';

  const isHighRisk = pestAlert?.riskLevel === 'HIGH';
  const isModRisk = pestAlert?.riskLevel === 'MODERATE';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/40 to-teal-950/40 border-2 border-emerald-400/40 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden"
      >
        {/* Ambient emerald backlight glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-teal-500/15 blur-[120px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shadow-lg shadow-emerald-500/20">
              <Sprout className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-lg sm:text-xl text-white font-sans tracking-wide">
                  Agricultural Intelligence & Precision Farming Hub
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-mono font-black uppercase">
                  X-Factor
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 font-mono">
                ICAR & IMD Agromet Advisory Directorate • Calibrated for {weatherData?.district}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-mono text-emerald-400 hover:text-white px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 transition-colors"
          >
            [Close Mode]
          </button>
        </div>

        {/* 3-Column Utility Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Soil Moisture & Evapotranspiration */}
          <div className="p-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-emerald-500/25 space-y-3">
            <div className="flex items-center justify-between text-emerald-300">
              <span className="flex items-center space-x-1.5 text-xs font-mono font-bold uppercase">
                <Droplets className="w-4 h-4 text-emerald-400" />
                <span>Soil Moisture (0-1cm Hydrology)</span>
              </span>
              <span className="text-xs font-mono font-bold">
                {soilMoisture !== null ? `${soilMoisture}%` : 'Unavailable'}
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden border border-white/10">
              <div
                style={{ width: `${soilMoisture !== null ? Math.min(100, Math.max(0, soilMoisture)) : 0}%` }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 shadow-sm"
              />
            </div>

            <div className="text-[11px] font-mono text-slate-300 space-y-1 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Evapotranspiration (ET₀):</span>
                <span className="text-white font-bold">{et0} mm/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">River Basin:</span>
                <span className="text-emerald-300 font-bold">{weatherData?.profile?.riverBasin}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Precision Irrigation Advisory */}
          <div className="p-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-emerald-500/25 space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-mono font-bold uppercase text-teal-300">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Precision Irrigation Schedule</span>
            </div>

            <p className="text-xs text-slate-200 font-sans leading-relaxed">
              {irrigationAdvice}
            </p>

            <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-emerald-400/90 border-t border-emerald-500/10">
              <span>Optimal Window: 04:30 PM - 06:30 PM</span>
              <span>Prevents Evaporation</span>
            </div>
          </div>

          {/* Card 3: AI Crop Pest & Pathogen Risk Engine */}
          <div className={`p-5 rounded-2xl backdrop-blur-xl border space-y-3 ${
            isHighRisk 
              ? 'bg-rose-950/30 border-rose-500/40 text-rose-200' 
              : isModRisk 
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' 
                : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-xs font-mono font-bold uppercase">
                <Bug className="w-4 h-4" />
                <span>AI Pest & Pathogen Alert</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase ${
                isHighRisk 
                  ? 'bg-rose-500 text-white' 
                  : isModRisk 
                    ? 'bg-amber-500 text-slate-950' 
                    : 'bg-emerald-500 text-slate-950'
              }`}>
                {pestAlert?.riskLevel || 'LOW RISK'}
              </span>
            </div>

            <div>
              <h5 className="font-bold text-xs text-white">
                {pestAlert?.diseaseName}
              </h5>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {pestAlert?.actionAdvice}
              </p>
            </div>

            <div className="text-[10px] font-mono text-slate-400 border-t border-white/5 pt-1">
              Crops: {pestAlert?.cropsAffected}
            </div>
          </div>

        </div>

      </motion.div>
    </AnimatePresence>
  );
}
