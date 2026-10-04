import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Droplets, 
  Sun, 
  Compass, 
  Activity, 
  Navigation2,
  Radio,
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { getNetworkNow } from '../services/networkTime';

/**
 * Real-Time Diurnal Phase Detection
 * Morning:   06:00 AM – 11:59 AM
 * Afternoon: 12:00 PM – 04:59 PM
 * Evening:   05:00 PM – 08:59 PM
 * Night:     09:00 PM – 05:59 AM
 */
function getSystemDiurnalPhase(hour = getNetworkNow().getHours()) {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

const PHASES = [
  { id: 'morning', label: 'Morning', subLabel: '06:00 AM – 11:59 AM', icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon', subLabel: '12:00 PM – 04:59 PM', icon: '☀️' },
  { id: 'evening', label: 'Evening', subLabel: '05:00 PM – 08:59 PM', icon: '🌇' },
  { id: 'night', label: 'Night', subLabel: '09:00 PM – 05:59 AM', icon: '🌙' }
];

// Cardinal direction helper
export function getCardinal(angle) {
  if (angle == null || isNaN(angle)) return 'N/A';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(((angle % 360) / 45)) % 8];
}

// Vapor Pressure Deficit (VPD in kPa) using Magnus-Tetens formula
function calcVpd(t, h) {
  if (t == null || h == null || isNaN(t) || isNaN(h)) return null;
  const svp = 0.61078 * Math.exp((17.27 * t) / (t + 237.3));
  const vpd = svp * (1 - Math.max(0, Math.min(100, h)) / 100);
  return Math.max(0, Number(vpd.toFixed(2)));
}

// AQI category styling helper
function getAqiCategory(val) {
  if (val == null || isNaN(val)) {
    return { label: 'Data unavailable', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
  }
  if (val <= 50) return { label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  if (val <= 100) return { label: 'Satisfactory', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' };
  if (val <= 200) return { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
  if (val <= 300) return { label: 'Poor', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
  if (val <= 400) return { label: 'Very Poor', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
  return { label: 'Severe', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
}

// WHO UV Index category styling helper
function getUvRisk(val) {
  if (val == null || isNaN(val)) return { bracket: 'Unavailable', color: 'text-slate-400', bg: 'bg-slate-500/10' };
  if (val < 0.5) return { bracket: 'Zero Solar Risk', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  if (val <= 2) return { bracket: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  if (val <= 5) return { bracket: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10' };
  if (val <= 7) return { bracket: 'High', color: 'text-orange-400', bg: 'bg-orange-500/10' };
  if (val <= 10) return { bracket: 'Very High', color: 'text-rose-400', bg: 'bg-rose-500/10' };
  return { bracket: 'Extreme', color: 'text-purple-400', bg: 'bg-purple-500/10' };
}

export default function MetricGrid({ weatherData }) {
  if (!weatherData) return null;

  // Active view: 'live' (real-time live sensor data) or specific diurnal preview
  const [activePhaseTab, setActivePhaseTab] = useState('live');

  // Real-time current hour and phase synchronized with local time
  const currentHour = getNetworkNow().getHours();
  const currentLivePhase = getSystemDiurnalPhase(currentHour);

  // Multi-Phase Calculations based strictly on real Open-Meteo & CPCB observations
  const phaseMetrics = useMemo(() => {
    const current = weatherData?.current || {};
    const hourly = weatherData?.allTodayHourly || weatherData?.hourly || [];

    // Real-time current observations
    const liveHumidity = current.humidity ?? null;
    const liveTemp = current.temp ?? null;
    const liveDewPoint = current.dewPoint ?? (liveTemp != null && liveHumidity != null ? Math.round(liveTemp - ((100 - liveHumidity) / 5)) : null);
    const liveVpd = current.vpd ?? (liveTemp != null && liveHumidity != null ? calcVpd(liveTemp, liveHumidity) : null);
    const liveAqiObj = current.aqi || null;
    const liveAqiVal = liveAqiObj?.value ?? null;
    const liveWindSpeed = current.windSpeed ?? null;
    const liveWindGust = current.windGust ?? null;
    const liveWindDir = current.windDirection ?? null;
    const liveUvIndex = current.uvIndex ?? null;
    const liveSolarRad = current.shortwaveRadiation ?? null;

    // Filter actual hourly data into diurnal windows
    const morningHours = hourly.filter(h => h.hour24 >= 6 && h.hour24 < 12);
    const afternoonHours = hourly.filter(h => h.hour24 >= 12 && h.hour24 < 17);
    const eveningHours = hourly.filter(h => h.hour24 >= 17 && h.hour24 < 21);
    const nightHours = hourly.filter(h => h.hour24 >= 21 || h.hour24 < 6);

    // Compute genuine arithmetic average from real non-null forecast numbers
    const getAvg = (list, key) => {
      if (!list || list.length === 0) return null;
      const valid = list.map(item => typeof key === 'function' ? key(item) : item[key]).filter(v => v != null && !isNaN(v));
      if (valid.length === 0) return null;
      const sum = valid.reduce((acc, v) => acc + v, 0);
      return Math.round(sum / valid.length);
    };

    // Helper to build genuine phase profile from hourly slice
    const buildDiurnalProfile = (id, phaseName, timeRange, hours) => {
      if (!hours || hours.length === 0) {
        return {
          id,
          phaseName,
          timeRange,
          humidity: { val: null, dewPoint: null, vpd: null, qualityBadge: 'Data unavailable', status: 'Diurnal Period Model', desc: 'No forecast data available for this diurnal period.' },
          aqi: { val: null, pm25: null, pm10: null, category: getAqiCategory(null), qualityBadge: 'Data unavailable', status: 'CAMS Air Quality Model', desc: 'Air quality forecast unavailable for this period.' },
          wind: { speed: null, gust: null, dir: null, qualityBadge: 'Data unavailable', status: '10m Forecast Vector', desc: 'Wind forecast unavailable for this period.' },
          uv: { val: null, bracket: 'N/A', color: 'text-slate-400', qualityBadge: 'Data unavailable', status: 'Solar Radiation Model', solarRad: null, desc: 'Solar radiation unavailable.' }
        };
      }

      const hum = getAvg(hours, 'humidity');
      const temp = getAvg(hours, 'temp');
      const dew = getAvg(hours, 'dewPoint');
      const vpd = (temp != null && hum != null) ? calcVpd(temp, hum) : null;
      const windSpeed = getAvg(hours, 'windSpeed');
      const windGust = getAvg(hours, 'windGust');
      const windDir = getAvg(hours, 'windDirection');
      
      const uvList = hours.map(h => h.uvIndex).filter(v => v != null);
      const uv = uvList.length > 0 ? Number(Math.max(...uvList).toFixed(1)) : (id === 'night' ? 0.0 : null);
      const uvRiskInfo = getUvRisk(uv);
      const solarRad = getAvg(hours, 'solarGhi');

      // Genuine AQI average from real hourly air quality data
      const aqiVals = hours.map(h => h.aqi?.value).filter(v => v != null);
      const aqiVal = aqiVals.length > 0 ? Math.round(aqiVals.reduce((a, b) => a + b, 0) / aqiVals.length) : null;
      const pm25 = getAvg(hours, h => h.aqi?.pm25);
      const pm10 = getAvg(hours, h => h.aqi?.pm10);
      const dominant = hours.find(h => h.aqi?.dominantPollutant)?.aqi?.dominantPollutant || 'PM2.5';
      const aqiCat = getAqiCategory(aqiVal);

      return {
        id,
        phaseName,
        timeRange,
        humidity: {
          val: hum,
          dewPoint: dew,
          vpd,
          qualityBadge: 'Hourly Forecast Avg',
          status: `${phaseName} Forecast Model`,
          desc: hum > 80 
            ? `High boundary layer moisture (${hum}% RH). Condensation and dew formation expected.`
            : hum < 40 
              ? `Dry atmospheric window (${hum}% RH). Vapor pressure deficit increases transpirational demand.`
              : `Optimal relative humidity (${hum}% RH) with balanced ambient vapor pressure.`
        },
        aqi: {
          val: aqiVal,
          pm25,
          pm10,
          category: aqiCat,
          dominantPollutant: dominant,
          qualityBadge: 'CPCB NAQI Forecast',
          status: 'CAMS Atmospheric Dispersion',
          desc: aqiVal !== null
            ? `Mean predicted AQI of ${aqiVal} (${aqiCat.label}). Calibrated against Indian CPCB NAQI standard.`
            : 'Air quality telemetry is currently unavailable from source.'
        },
        wind: {
          speed: windSpeed,
          gust: windGust,
          dir: windDir,
          qualityBadge: 'Hourly Forecast Avg',
          status: '10m Surface Vector Model',
          desc: `Predicted surface wind averaging ${windSpeed ?? 'N/A'} km/h${windGust ? ` with gusts up to ${windGust} km/h` : ''}.`
        },
        uv: {
          val: uv,
          bracket: uvRiskInfo.bracket,
          color: uvRiskInfo.color,
          solarRad,
          qualityBadge: 'Hourly Forecast Peak',
          status: 'CAMS Solar Irradiance Model',
          desc: uv >= 7 
            ? 'Intense direct actinic solar radiation. Eye and skin UV protection recommended.' 
            : (uv > 0 ? 'Low to moderate actinic solar flux. Safe for outdoor field activity.' : 'Zero actinic UV radiation during nocturnal cycle.')
        }
      };
    };

    // 1. Live Profile (EXACT Current Live Observations from API)
    const uvRiskInfo = getUvRisk(liveUvIndex);
    const liveProfile = {
      id: 'live',
      phaseName: `Live Real-Time (${PHASES.find(p => p.id === currentLivePhase)?.label || 'Current'})`,
      timeRange: 'Real-Time Synchronized',
      humidity: {
        val: liveHumidity,
        dewPoint: liveDewPoint,
        vpd: liveVpd,
        qualityBadge: 'Live API Observation',
        status: 'Live Weather API',
        desc: liveHumidity !== null
          ? (liveHumidity > 80 
              ? 'Elevated atmospheric humidity flux. High boundary layer moisture condensation.' 
              : 'Optimal relative humidity balance. Comfortable ambient vapor pressure.')
          : 'Relative humidity data unavailable from current weather source.'
      },
      aqi: {
        val: liveAqiVal,
        pm25: liveAqiObj?.pm25 ?? null,
        pm10: liveAqiObj?.pm10 ?? null,
        co: liveAqiObj?.co ?? null,
        no2: liveAqiObj?.no2 ?? null,
        category: liveAqiObj?.category || getAqiCategory(liveAqiVal),
        dominantPollutant: liveAqiObj?.dominantPollutant || 'PM2.5',
        qualityBadge: 'CPCB NAQI Standard',
        status: 'CAMS Air Quality Model',
        desc: liveAqiObj?.healthAlert || (liveAqiVal !== null ? `Current air quality index is ${liveAqiVal}.` : 'Air quality telemetry is currently unavailable from source.')
      },
      wind: {
        speed: liveWindSpeed,
        gust: liveWindGust,
        dir: liveWindDir,
        qualityBadge: '10m Surface Observation',
        status: 'Dynamic Vector Compass',
        desc: liveWindSpeed !== null 
          ? `Surface wind blowing at ${liveWindSpeed} km/h${liveWindGust ? ` (gusts ${liveWindGust} km/h)` : ''}.` 
          : 'Wind speed data unavailable from current weather source.'
      },
      uv: {
        val: liveUvIndex,
        bracket: uvRiskInfo.bracket,
        color: uvRiskInfo.color,
        solarRad: liveSolarRad,
        qualityBadge: 'WHO UV Index Standard',
        status: 'Open-Meteo Solar Model',
        desc: liveUvIndex !== null
          ? (liveUvIndex >= 7 
              ? 'Intense actinic solar irradiance. High erythemal exposure; sunscreen advised.' 
              : (liveUvIndex > 0 ? 'Low to moderate actinic solar flux. Safe for outdoor fieldwork.' : 'Zero actinic UV radiation during nocturnal cycle.'))
          : 'UV solar index data unavailable from current source.'
      }
    };

    return {
      live: liveProfile,
      morning: buildDiurnalProfile('morning', 'Morning Phase', '06:00 AM – 11:59 AM', morningHours),
      afternoon: buildDiurnalProfile('afternoon', 'Afternoon Phase', '12:00 PM – 04:59 PM', afternoonHours),
      evening: buildDiurnalProfile('evening', 'Evening Phase', '05:00 PM – 08:59 PM', eveningHours),
      night: buildDiurnalProfile('night', 'Night Phase', '09:00 PM – 05:59 AM', nightHours)
    };
  }, [weatherData, currentHour, currentLivePhase]);

  // Current selected profile
  const activeMetrics = phaseMetrics[activePhaseTab] || phaseMetrics.live;

  // AQI Radial calculation
  const aqiCircumference = 2 * Math.PI * 38;
  const aqiValSafe = activeMetrics.aqi.val ?? 0;
  const aqiNormalized = Math.min(1, aqiValSafe / 300);
  const aqiOffset = aqiCircumference - aqiNormalized * aqiCircumference;

  // Freshness and Data Sources from normalized layer
  const freshness = weatherData?.freshness || 'LIVE';
  const freshnessLabel = weatherData?.freshnessLabel || 'Live Real-Time (< 1m)';
  const dataSources = weatherData?.dataSources || {};
  const soilMoisture = weatherData?.agriculture?.soilMoisture;

  return (
    <div className="w-full space-y-4">
      
      {/* DIURNAL TELEMETRY ENGINE CONTROL BAR */}
      <div className="rounded-2xl backdrop-blur-xl bg-white/10 dark:bg-black/25 border border-white/20 p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold tracking-wide text-white uppercase font-mono">
                Diurnal Telemetry & Environmental Engine
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1 border ${
                freshness === 'LIVE' 
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                  : (freshness === 'RECENT' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30')
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${freshness === 'LIVE' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'} inline-block`} />
                <span>{freshnessLabel}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Synchronized meteorological telemetry across Morning, Afternoon, Evening & Night cycles.
            </p>
          </div>
        </div>

        {/* Phase Mode Selector Tabs (English Only) */}
        <div className="flex items-center bg-black/40 border border-white/15 rounded-xl p-1 gap-1 text-xs font-mono w-full md:w-auto overflow-x-auto">
          {/* Live Auto Pill */}
          <button
            onClick={() => setActivePhaseTab('live')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activePhaseTab === 'live'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>⚡ Live Real-Time</span>
          </button>

          {/* Diurnal Phase Pills */}
          {PHASES.map((p) => {
            const isSelected = activePhaseTab === p.id;
            const isLiveNow = currentLivePhase === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePhaseTab(p.id)}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-white/20 text-white border border-white/30 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={p.subLabel}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
                {isLiveNow && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-0.5" title="Current Live Period" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2x2 METRIC CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 w-full">
        
        {/* CARD 1: HUMIDITY & MOISTURE DYNAMICS */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl backdrop-blur-xl bg-white/10 dark:bg-black/25 border border-white/20 shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden group"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2 text-slate-300">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider font-mono">
                Humidity & Moisture Dynamics
              </h4>
            </div>

            {/* Quality / Verification Badge */}
            <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-emerald-300">
                {activeMetrics.humidity.qualityBadge}
              </span>
            </div>
          </div>

          {/* Phase Banner */}
          <div className="flex items-center justify-between pt-3 pb-1 text-[11px] font-mono">
            <div className="flex items-center space-x-1.5 text-cyan-300 font-bold">
              <span>{activePhaseTab === 'morning' ? '🌅' : activePhaseTab === 'afternoon' ? '☀️' : activePhaseTab === 'evening' ? '🌇' : activePhaseTab === 'night' ? '🌙' : '⚡'}</span>
              <span>{activeMetrics.phaseName}</span>
              <span className="text-slate-500 text-[10px]">({activeMetrics.timeRange})</span>
            </div>
            <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
              {activeMetrics.humidity.status}
            </span>
          </div>

          {/* Main Metric Value & Wave */}
          <div className="py-3 space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black font-mono text-white tracking-tight">
                  {activeMetrics.humidity.val !== null ? `${activeMetrics.humidity.val}%` : 'N/A'}
                </span>
                <span className="text-xs font-mono text-cyan-300 font-bold uppercase">
                  Relative Humidity
                </span>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs text-slate-200">
                  Dew Point: <strong className="text-cyan-300 font-bold">{activeMetrics.humidity.dewPoint !== null ? `${activeMetrics.humidity.dewPoint}°C` : 'N/A'}</strong>
                </div>
                <div className="text-[10px] text-slate-400" title="Calculated using Magnus-Tetens Equation">
                  Calculated VPD: <strong className="text-slate-300">{activeMetrics.humidity.vpd !== null ? `${activeMetrics.humidity.vpd} kPa` : 'N/A'}</strong>
                </div>
              </div>
            </div>

            {/* Fluid Wave Interactive Progress Bar */}
            <div className="relative w-full h-4 rounded-full bg-white/10 overflow-hidden border border-white/10">
              <motion.div
                key={`hum-bar-${activePhaseTab}`}
                initial={{ width: 0 }}
                animate={{ width: `${activeMetrics.humidity.val ?? 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-sky-300 relative rounded-full"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {activeMetrics.humidity.desc}
            </p>
          </div>

          {/* Diurnal Mini-Matrix Breakdown */}
          <div className="pt-2 pb-3 border-t border-white/5 space-y-1.5">
            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span className="font-semibold uppercase tracking-wider text-slate-300">Diurnal Cycle Forecast:</span>
              <span className="text-cyan-400">Hourly Forecast Avg</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
              {PHASES.map((p) => {
                const data = phaseMetrics[p.id]?.humidity;
                const isSelected = activePhaseTab === p.id;
                const isLive = currentLivePhase === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePhaseTab(p.id)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isSelected 
                        ? 'bg-cyan-500/20 border-cyan-400/50 text-white shadow-sm' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-center space-x-1">
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />}
                    </div>
                    <div className="text-xs font-black text-cyan-300 mt-0.5">
                      {data?.val !== null ? `${data.val}%` : 'N/A'}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">
                      {isLive ? 'Live Window' : 'Forecast Avg'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-white/10 pt-2">
            <span>Model: Tetens / Magnus VPD</span>
            <span className="text-cyan-400">
              {soilMoisture !== null && soilMoisture !== undefined
                ? `${soilMoisture}% Soil Moisture (0-1cm)`
                : 'Soil moisture: Data unavailable'}
            </span>
          </div>
        </motion.div>

        {/* CARD 2: AIR QUALITY INDEX (AQI) */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl backdrop-blur-xl bg-white/10 dark:bg-black/25 border border-white/20 shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden group"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2 text-slate-300">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider font-mono">
                Air Quality Index (AQI)
              </h4>
            </div>

            {/* Quality / Standard Badge */}
            <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-emerald-300">
                {activeMetrics.aqi.qualityBadge}
              </span>
            </div>
          </div>

          {/* Phase Banner */}
          <div className="flex items-center justify-between pt-3 pb-1 text-[11px] font-mono">
            <div className="flex items-center space-x-1.5 text-cyan-300 font-bold">
              <span>{activePhaseTab === 'morning' ? '🌅' : activePhaseTab === 'afternoon' ? '☀️' : activePhaseTab === 'evening' ? '🌇' : activePhaseTab === 'night' ? '🌙' : '⚡'}</span>
              <span>{activeMetrics.phaseName}</span>
              <span className="text-slate-500 text-[10px]">({activeMetrics.timeRange})</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${activeMetrics.aqi.category.bg} ${activeMetrics.aqi.category.color} ${activeMetrics.aqi.category.border}`}>
              {activeMetrics.aqi.category.label}
            </span>
          </div>

          {/* Gauge & Particulate Details */}
          <div className="py-2 flex items-center justify-around gap-4">
            {/* Animated Radial SVG Circle */}
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="38"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="8"
                />
                <motion.circle
                  key={`aqi-circ-${activePhaseTab}`}
                  cx="56"
                  cy="56"
                  r="38"
                  fill="none"
                  stroke={
                    activeMetrics.aqi.val == null ? '#64748b' :
                    activeMetrics.aqi.val <= 50 ? '#10b981' : 
                    activeMetrics.aqi.val <= 100 ? '#06b6d4' : 
                    activeMetrics.aqi.val <= 200 ? '#f59e0b' : 
                    activeMetrics.aqi.val <= 300 ? '#f97316' : '#ef4444'
                  }
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={aqiCircumference}
                  initial={{ strokeDashoffset: aqiCircumference }}
                  animate={{ strokeDashoffset: activeMetrics.aqi.val !== null ? aqiOffset : aqiCircumference }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black font-mono text-white tracking-tighter">
                  {activeMetrics.aqi.val !== null ? activeMetrics.aqi.val : 'N/A'}
                </span>
                <span className="text-[9px] font-mono text-slate-400 uppercase">
                  AQI
                </span>
              </div>
            </div>

            <div className="space-y-1.5 max-w-[210px]">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                {activeMetrics.aqi.status}
              </span>
              <p className="text-xs text-slate-200 font-medium leading-relaxed font-sans">
                {activeMetrics.aqi.desc}
              </p>
              <div className="text-[10px] font-mono text-slate-300 pt-1 flex items-center space-x-2">
                <span>PM2.5: <strong className="text-white">{activeMetrics.aqi.pm25 !== null ? `${activeMetrics.aqi.pm25}` : 'N/A'}</strong> µg/m³</span>
                <span>•</span>
                <span>PM10: <strong className="text-white">{activeMetrics.aqi.pm10 !== null ? `${activeMetrics.aqi.pm10}` : 'N/A'}</strong> µg/m³</span>
              </div>
            </div>
          </div>

          {/* Diurnal Mini-Matrix Breakdown */}
          <div className="pt-2 pb-3 border-t border-white/5 space-y-1.5">
            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span className="font-semibold uppercase tracking-wider text-slate-300">Diurnal AQI Forecast:</span>
              <span className="text-cyan-400">CPCB Sub-Index Engine</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
              {PHASES.map((p) => {
                const data = phaseMetrics[p.id]?.aqi;
                const isSelected = activePhaseTab === p.id;
                const isLive = currentLivePhase === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePhaseTab(p.id)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isSelected 
                        ? 'bg-cyan-500/20 border-cyan-400/50 text-white shadow-sm' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-center space-x-1">
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />}
                    </div>
                    <div className="text-xs font-black text-white mt-0.5">
                      {data?.val !== null ? `${data.val} AQI` : 'N/A'}
                    </div>
                    <div className="text-[9px] text-cyan-300 font-semibold">
                      {data?.category?.label || 'Forecast'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-white/10 pt-2">
            <span>Standard: CPCB NAQI (India)</span>
            <span className="text-cyan-400">
              {activeMetrics.aqi.dominantPollutant ? `Dominant: ${activeMetrics.aqi.dominantPollutant}` : 'Open-Meteo CAMS Model'}
            </span>
          </div>
        </motion.div>

        {/* CARD 3: WIND VELOCITY & COMPASS */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl backdrop-blur-xl bg-white/10 dark:bg-black/25 border border-white/20 shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden group"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2 text-slate-300">
              <Compass className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider font-mono">
                Wind Velocity & Compass
              </h4>
            </div>

            {/* Quality Badge */}
            <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-emerald-300">
                {activeMetrics.wind.qualityBadge}
              </span>
            </div>
          </div>

          {/* Phase Banner */}
          <div className="flex items-center justify-between pt-3 pb-1 text-[11px] font-mono">
            <div className="flex items-center space-x-1.5 text-cyan-300 font-bold">
              <span>{activePhaseTab === 'morning' ? '🌅' : activePhaseTab === 'afternoon' ? '☀️' : activePhaseTab === 'evening' ? '🌇' : activePhaseTab === 'night' ? '🌙' : '⚡'}</span>
              <span>{activeMetrics.phaseName}</span>
              <span className="text-slate-500 text-[10px]">({activeMetrics.timeRange})</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-cyan-500/10 text-cyan-300 border-cyan-500/30">
              {getCardinal(activeMetrics.wind.dir)} ({activeMetrics.wind.dir !== null ? `${activeMetrics.wind.dir}°` : 'N/A'})
            </span>
          </div>

          {/* Compass Dial & Velocity Details */}
          <div className="py-2 flex items-center justify-around gap-4">
            {/* Animated 3D Compass Dial */}
            <div className="relative w-28 h-28 rounded-full border-2 border-white/15 bg-white/5 flex items-center justify-center shadow-inner shrink-0">
              <span className="absolute top-1 text-[9px] font-mono font-bold text-slate-400">N</span>
              <span className="absolute bottom-1 text-[9px] font-mono font-bold text-slate-400">S</span>
              <span className="absolute left-1.5 text-[9px] font-mono font-bold text-slate-400">W</span>
              <span className="absolute right-1.5 text-[9px] font-mono font-bold text-slate-400">E</span>
              
              {/* Center pointer with animated rotation matching real wind direction */}
              <motion.div
                animate={{ rotate: activeMetrics.wind.dir ?? 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="w-full h-full flex items-center justify-center pointer-events-none"
              >
                <Navigation2 className="w-8 h-8 text-cyan-400 fill-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              </motion.div>
            </div>

            <div className="space-y-1.5 max-w-[210px]">
              <div className="flex items-baseline space-x-1.5 font-mono">
                <span className="text-3xl font-black text-white tracking-tight">
                  {activeMetrics.wind.speed !== null ? activeMetrics.wind.speed : 'N/A'}
                </span>
                <span className="text-sm font-semibold text-cyan-300">km/h</span>
                {activeMetrics.wind.gust !== null && (
                  <span className="text-[10px] text-slate-400 ml-1">
                    (Gust {activeMetrics.wind.gust} km/h)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {activeMetrics.wind.desc}
              </p>
              <div className="text-[10px] font-mono text-slate-400 pt-0.5">
                Vector: <strong className="text-white">{getCardinal(activeMetrics.wind.dir)}</strong> • {activeMetrics.wind.status}
              </div>
            </div>
          </div>

          {/* Diurnal Mini-Matrix Breakdown */}
          <div className="pt-2 pb-3 border-t border-white/5 space-y-1.5">
            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span className="font-semibold uppercase tracking-wider text-slate-300">Diurnal Wind Velocity:</span>
              <span className="text-cyan-400">10m Model Vector</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
              {PHASES.map((p) => {
                const data = phaseMetrics[p.id]?.wind;
                const isSelected = activePhaseTab === p.id;
                const isLive = currentLivePhase === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePhaseTab(p.id)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isSelected 
                        ? 'bg-cyan-500/20 border-cyan-400/50 text-white shadow-sm' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-center space-x-1">
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />}
                    </div>
                    <div className="text-xs font-black text-cyan-300 mt-0.5">
                      {data?.speed !== null ? `${data.speed} km/h` : 'N/A'}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">
                      {data?.dir !== null ? getCardinal(data.dir) : 'Forecast'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-white/10 pt-2">
            <span>Provider: {weatherData?.provider || 'Open-Meteo'}</span>
            <span className="text-emerald-400">10m Agromet Model</span>
          </div>
        </motion.div>

        {/* CARD 4: UV SOLAR RADIATION */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl backdrop-blur-xl bg-white/10 dark:bg-black/25 border border-white/20 shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden group"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2 text-slate-300">
              <Sun className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider font-mono">
                UV Solar Radiation
              </h4>
            </div>

            {/* Quality Badge */}
            <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-emerald-300">
                {activeMetrics.uv.qualityBadge}
              </span>
            </div>
          </div>

          {/* Phase Banner */}
          <div className="flex items-center justify-between pt-3 pb-1 text-[11px] font-mono">
            <div className="flex items-center space-x-1.5 text-amber-300 font-bold">
              <span>{activePhaseTab === 'morning' ? '🌅' : activePhaseTab === 'afternoon' ? '☀️' : activePhaseTab === 'evening' ? '🌇' : activePhaseTab === 'night' ? '🌙' : '⚡'}</span>
              <span>{activeMetrics.phaseName}</span>
              <span className="text-slate-500 text-[10px]">({activeMetrics.timeRange})</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border bg-white/5 ${activeMetrics.uv.color} border-current`}>
              {activeMetrics.uv.bracket}
            </span>
          </div>

          {/* UV Value & Stepped Arc Slider */}
          <div className="py-2 space-y-2.5">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline space-x-2 font-mono">
                <span className="text-4xl font-black text-white tracking-tight">
                  {activeMetrics.uv.val !== null ? activeMetrics.uv.val : 'N/A'}
                </span>
                <span className="text-xs font-semibold text-slate-400">/ 11+ UV Index</span>
              </div>
              <span className="text-xs font-mono text-amber-300 font-bold">
                {activeMetrics.uv.val >= 7 ? 'Peak Zenith Window' : (activeMetrics.uv.val >= 2 ? 'Low-Mod Sun Window' : 'Zero Solar Risk')}
              </span>
            </div>

            {/* Stepped Arc Slider for UV Bracket */}
            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden flex border border-white/10">
              <div 
                className={`w-1/4 h-full ${activeMetrics.uv.val != null && activeMetrics.uv.val >= 0.5 ? 'bg-emerald-500' : 'bg-white/10'}`} 
                title="Low 0-2" 
              />
              <div 
                className={`w-1/4 h-full ${activeMetrics.uv.val != null && activeMetrics.uv.val >= 3 ? 'bg-amber-500' : 'bg-white/10'}`} 
                title="Moderate 3-5" 
              />
              <div 
                className={`w-1/4 h-full ${activeMetrics.uv.val != null && activeMetrics.uv.val >= 6 ? 'bg-orange-500' : 'bg-white/10'}`} 
                title="High 6-7" 
              />
              <div 
                className={`w-1/4 h-full ${activeMetrics.uv.val != null && activeMetrics.uv.val >= 8 ? 'bg-rose-500' : 'bg-white/10'}`} 
                title="Very High 8-10+" 
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {activeMetrics.uv.desc}
            </p>
          </div>

          {/* Diurnal Mini-Matrix Breakdown */}
          <div className="pt-2 pb-3 border-t border-white/5 space-y-1.5">
            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span className="font-semibold uppercase tracking-wider text-slate-300">Diurnal UV Index Cycle:</span>
              <span className="text-amber-400">WHO Index Standard</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
              {PHASES.map((p) => {
                const data = phaseMetrics[p.id]?.uv;
                const isSelected = activePhaseTab === p.id;
                const isLive = currentLivePhase === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePhaseTab(p.id)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isSelected 
                        ? 'bg-amber-500/20 border-amber-400/50 text-white shadow-sm' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-center space-x-1">
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />}
                    </div>
                    <div className="text-xs font-black text-amber-300 mt-0.5">
                      {data?.val !== null ? `${data.val} UV` : 'N/A'}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">
                      {data?.bracket || 'Forecast'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-white/10 pt-2">
            <span>Model: CAMS Global Irradiance</span>
            <span className="text-amber-400">
              {activeMetrics.uv.solarRad !== null && activeMetrics.uv.solarRad !== undefined
                ? `${activeMetrics.uv.solarRad} W/m² Irradiance`
                : (weatherData?.renewable?.solarGhi ? `${weatherData.renewable.solarGhi} kWh/m² GHI` : 'Solar: Data unavailable')}
            </span>
          </div>
        </motion.div>

      </div>

      {/* DATA PROVENANCE & TRANSPARENCY PANEL (Requirement 9 & 18) */}
      <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/15 p-4 shadow-lg text-xs font-mono text-slate-300 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              Data Freshness & Provenance Transparency
            </span>
          </div>
          <div className="flex items-center space-x-2 text-[10px]">
            <span className="text-slate-400">Freshness Status:</span>
            <span className={`px-2 py-0.5 rounded font-bold ${
              freshness === 'LIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {freshness} • {freshnessLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] pt-1">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-cyan-400 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Surface Meteorology</span>
            </div>
            <div className="text-slate-300 text-[10px]">
              {dataSources.weather || 'Open-Meteo High-Resolution Model'}
            </div>
            <div className="text-slate-400 text-[9px]">
              Temp, Humidity, Pressure, 10m Wind, Gusts
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-emerald-400 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Air Quality Index</span>
            </div>
            <div className="text-slate-300 text-[10px]">
              {dataSources.airQuality || 'Open-Meteo CAMS Air Quality API'}
            </div>
            <div className="text-slate-400 text-[9px]">
              Indian CPCB NAQI Standard (PM2.5, PM10, O3, NO2, CO)
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-amber-400 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Solar Radiation</span>
            </div>
            <div className="text-slate-300 text-[10px]">
              {dataSources.solar || 'Open-Meteo Irradiance Model'}
            </div>
            <div className="text-slate-400 text-[9px]">
              Shortwave Radiation (W/m²), Direct & Diffuse
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="text-teal-400 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Soil & Agromet</span>
            </div>
            <div className="text-slate-300 text-[10px]">
              {dataSources.soil || 'Open-Meteo Land Surface Hydrology'}
            </div>
            <div className="text-slate-400 text-[9px]">
              0-1cm Volumetric Moisture & Calculated VPD
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
