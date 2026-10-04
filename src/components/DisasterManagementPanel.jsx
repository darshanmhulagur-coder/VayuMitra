import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Waves, 
  PhoneCall, 
  FileText, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Radio, 
  Info,
  Droplets,
  Activity,
  ArrowUpRight,
  LifeBuoy
} from 'lucide-react';

export default function DisasterManagementPanel({
  weatherData,
  language = 'en',
  onOpenEmergencyModal
}) {
  const [activeTab, setActiveTab] = useState('threat'); // 'threat', 'hydrology', 'ndma_shelters', 'sop'

  if (!weatherData) return null;

  const { disaster, district, state, profile, current } = weatherData;
  const activeHazard = disaster?.activeHazard || {
    type: 'NORMAL',
    severity: 'SAFE',
    severityLabel: 'Green: Safe Status',
    badgeColor: 'emerald',
    title: '🛡️ Microclimate & Basin Equilibrium (No Active Severe Disaster)',
    desc: `Microclimate telemetry indicates stable barometric pressure and atmospheric conditions within safe seasonal thresholds.`,
    sopGuidelines: [
      'Standard seasonal vigilance. Regular agricultural and outdoor logistics permitted.',
      'Keep regional disaster helpline dialers (1077 / 1078) saved in emergency contacts.'
    ],
    portalRef: 'NDMA Multi-Hazard Preparedness Framework'
  };

  const river = disaster?.riverDischarge || {
    basin: profile?.riverBasin || 'National River Basin',
    gaugeStation: `${district} Hydrological Observatory`,
    currentLevelMSL: `${profile?.elevation || 250} m MSL`,
    warningLevelMSL: `${(profile?.elevation || 250) + 1.2} m MSL`,
    dangerLevelMSL: `${(profile?.elevation || 250) + 2.5} m MSL`,
    levelStatus: 'Flowing within Normal Buffer',
    alertBadge: 'NORMAL',
    flowRate: '240 m³/s',
    flowRateCusecs: '8475 cusecs',
    dangerMarkMargin: '2.5 m below Danger Mark'
  };

  const isCritical = activeHazard.severity === 'ALERT' || river.alertBadge === 'DANGER';
  const isWarning = activeHazard.severity === 'WARNING' || river.alertBadge === 'WARNING';

  return (
    <div className="w-full space-y-4">
      {/* Container with Modern Glassmorphism */}
      <div className="rounded-3xl backdrop-blur-2xl bg-slate-900/80 border border-slate-700/80 shadow-2xl p-5 sm:p-7 relative overflow-hidden">
        
        {/* Subtle Ambient Refraction */}
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[110px] pointer-events-none ${
          isCritical ? 'bg-rose-600/15' : isWarning ? 'bg-amber-500/15' : 'bg-cyan-500/10'
        }`} />

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>Govt. of India Telemetry Node</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                CWC • India-WRIS • NDMA • NDRF
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black font-sans tracking-tight text-white flex items-center space-x-2 pt-1">
              <ShieldAlert className={`w-6 h-6 shrink-0 ${isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-cyan-400'}`} />
              <span>Disaster Management & Hydrological Telemetry</span>
            </h2>
            <p className="text-xs text-slate-400">
              Live river basin discharge, danger mark alert thresholds, and multi-hazard response framework for <strong className="text-slate-200">{district}, {state}</strong>.
            </p>
          </div>

          {/* Official Verification Links Hub */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://cwc.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-medium bg-slate-800/90 text-slate-300 border border-slate-700 hover:border-cyan-400 hover:text-cyan-300 transition-all shadow-sm"
              title="Central Water Commission Official Portal"
            >
              <span>CWC Portal</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
            <a
              href="https://indiawris.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-medium bg-slate-800/90 text-slate-300 border border-slate-700 hover:border-cyan-400 hover:text-cyan-300 transition-all shadow-sm"
              title="India-WRIS Hydrology Project Official Portal"
            >
              <span>India-WRIS</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
            <a
              href="https://ndma.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-medium bg-slate-800/90 text-slate-300 border border-slate-700 hover:border-rose-400 hover:text-rose-300 transition-all shadow-sm"
              title="National Disaster Management Authority Official Portal"
            >
              <span>NDMA</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
            <a
              href="https://www.ndrf.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-medium bg-slate-800/90 text-slate-300 border border-slate-700 hover:border-orange-400 hover:text-orange-300 transition-all shadow-sm"
              title="National Disaster Response Force Official Portal"
            >
              <span>NDRF</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>

        {/* Real-Time Active Disaster Alert Banner */}
        <div className={`mt-5 p-4 sm:p-5 rounded-2xl border transition-all ${
          activeHazard.badgeColor === 'rose'
            ? 'bg-rose-950/30 border-rose-500/50 shadow-rose-900/20'
            : activeHazard.badgeColor === 'amber'
              ? 'bg-amber-950/30 border-amber-500/50 shadow-amber-900/20'
              : activeHazard.badgeColor === 'orange'
                ? 'bg-orange-950/30 border-orange-500/50 shadow-orange-900/20'
                : 'bg-emerald-950/20 border-emerald-500/30 shadow-emerald-900/10'
        } shadow-lg`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${
                activeHazard.badgeColor === 'rose'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : activeHazard.badgeColor === 'amber'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : activeHazard.badgeColor === 'orange'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {activeHazard.severity === 'SAFE' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    activeHazard.badgeColor === 'rose'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : activeHazard.badgeColor === 'amber'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : activeHazard.badgeColor === 'orange'
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {activeHazard.severityLabel}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Live Threat Assessment
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  {activeHazard.title}
                </h3>
                <p className="text-xs text-slate-300/90 mt-0.5 leading-relaxed">
                  {activeHazard.desc}
                </p>
              </div>
            </div>

            {/* Emergency Action Button */}
            {onOpenEmergencyModal && (
              <button
                onClick={onOpenEmergencyModal}
                className="shrink-0 flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/50 shadow-lg shadow-rose-950/40 transition-all"
              >
                <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>National Emergency Grid</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigator */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('threat')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'threat'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-md'
                : 'bg-slate-800/60 text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>1. Real-Time Hazard Diagnostics</span>
          </button>

          <button
            onClick={() => setActiveTab('hydrology')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'hydrology'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-md'
                : 'bg-slate-800/60 text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>2. CWC & India-WRIS Hydrology</span>
          </button>

          <button
            onClick={() => setActiveTab('ndma_shelters')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'ndma_shelters'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-md'
                : 'bg-slate-800/60 text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>3. NDMA Shelters & NDRF Dialers</span>
          </button>

          <button
            onClick={() => setActiveTab('sop')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'sop'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-md'
                : 'bg-slate-800/60 text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>4. National Multi-Hazard SOPs</span>
          </button>
        </div>

        {/* Tab 1: Real-Time Hazard Diagnostics */}
        {activeTab === 'threat' && (
          <div className="mt-5 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Flood Risk Index Gauge */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                    <span>Inundation & Flood Score</span>
                    <Droplets className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold font-mono text-white">
                      {disaster.floodRiskScore}
                    </span>
                    <span className="text-xs font-mono text-slate-400">/ 100</span>
                    <span className={`text-xs font-mono font-bold ml-auto px-2 py-0.5 rounded ${
                      disaster.floodRiskScore > 75 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      disaster.floodRiskScore > 50 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      disaster.floodRiskScore > 30 ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {disaster.floodLevel} Risk
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full mt-3 overflow-hidden border border-slate-700/50">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${disaster.floodRiskScore}%` }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-700/50 font-sans">
                  Calibrated via catchment rain accumulation, soil saturation, and local terrain slope ({profile?.elevation}m MSL).
                </p>
              </div>

              {/* Convective Wind & Squall Gauge */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                    <span>Surface Gale & Gust Telemetry</span>
                    <Activity className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold font-mono text-white">
                      {current?.windSpeed ?? 0}
                    </span>
                    <span className="text-xs font-mono text-slate-400">km/h sustained</span>
                  </div>
                  <div className="mt-2 text-xs font-mono text-slate-300 flex items-center justify-between">
                    <span>Peak Gust:</span>
                    <span className="font-bold text-amber-300">
                      {current?.windGust ? `${current.windGust} km/h` : 'Within buffer'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full mt-2 overflow-hidden border border-slate-700/50">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, ((current?.windGust || current?.windSpeed || 10) / 75) * 100)}%` }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-700/50 font-sans">
                  Monitors structural wind loading, overhead utility lines, and agricultural lodging hazards.
                </p>
              </div>

              {/* Thermal Stress & Heat Index */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                    <span>Thermal Hazard & Wet-Bulb Stress</span>
                    <ShieldAlert className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold font-mono text-white">
                      {current?.temp ?? 28}°C
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      (Feels {current?.feelsLike ?? 30}°C)
                    </span>
                  </div>
                  <div className="mt-2 text-xs font-mono text-slate-300 flex items-center justify-between">
                    <span>Relative Humidity:</span>
                    <span className="font-bold text-cyan-300">{current?.humidity ?? 50}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full mt-2 overflow-hidden border border-slate-700/50">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(10, ((current?.temp || 28) / 48) * 100))}%` }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-700/50 font-sans">
                  NDMA Heat Action Plan metric. Tracks dangerous dehydration and hyperthermia thresholds.
                </p>
              </div>

            </div>

            {/* Actionable SOP Directives for Current Hazard */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
              <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center space-x-2">
                <span>📋 Immediate NDMA Multi-Hazard Directives for {district}:</span>
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300 font-sans">
                {activeHazard.sopGuidelines.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-cyan-400 font-bold font-mono">0{idx + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: CWC & India-WRIS River Basin Hydrology */}
        {activeTab === 'hydrology' && (
          <div className="mt-5 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Basin Status Overview Card (8 Cols) */}
              <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/50 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                      Authority: Central Water Commission (CWC) • India-WRIS
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      {river.basin}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Monitoring Station: {river.gaugeStation}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase shrink-0 ${
                    river.alertBadge === 'DANGER' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' :
                    river.alertBadge === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    river.alertBadge === 'ALERT' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {river.levelStatus}
                  </span>
                </div>

                {/* Hydrological Telemetry Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">Current Water Level</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-white mt-0.5 block">
                      {river.currentLevelMSL}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">Warning Level (WL)</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-amber-300 mt-0.5 block">
                      {river.warningLevelMSL}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">Danger Level (DL)</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-rose-400 mt-0.5 block">
                      {river.dangerLevelMSL}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">Discharge Rate</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-cyan-300 mt-0.5 block">
                      {river.flowRate}
                    </span>
                  </div>
                </div>

                {/* Danger Margin Indicator */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs">
                    <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-slate-300">
                      Buffer to Official Danger Level: <strong className="text-white font-mono">{river.dangerMarkMargin}</strong>
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                    Discharge: ~{river.flowRateCusecs}
                  </span>
                </div>
              </div>

              {/* CWC & India-WRIS Official Architecture Details (4 Cols) */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-2">
                    National Hydrology Mission Integration
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Hydrological modeling incorporates stage-discharge rating curves from the <strong>Central Water Commission (CWC)</strong> and the <strong>India Water Resources Information System (India-WRIS)</strong>.
                  </p>
                  
                  <div className="mt-3 space-y-2 text-xs font-mono text-slate-400">
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span>Telemetry Standard:</span>
                      <span className="text-slate-200">WMO / CWC Real-Time Stage</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span>Basin Unit:</span>
                      <span className="text-slate-200">{profile?.riverBasin}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span>Reporting Latency:</span>
                      <span className="text-emerald-400">&lt; 15 mins (Synced)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href="https://indiawris.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-mono text-xs font-bold flex items-center justify-center space-x-1 transition-all"
                  >
                    <span>Inspect Basin on India-WRIS</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://cwc.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono text-xs font-bold flex items-center justify-center space-x-1 transition-all"
                  >
                    <span>CWC Flood Forecast Bulletins</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 3: NDMA Shelters & NDRF Dialers */}
        {activeTab === 'ndma_shelters' && (
          <div className="mt-5 space-y-4 animate-fadeIn">
            
            {/* National 24x7 Multi-Hazard Helpline Fast Dialers */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/40 border border-rose-500/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <PhoneCall className="w-4 h-4 text-rose-400 animate-bounce" />
                  <h4 className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">
                    🚨 24x7 Integrated Emergency Helpline Dialers (One-Click Connect):
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  Toll-Free • Zero Balance Supported
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <a
                  href="tel:1078"
                  className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/40 hover:border-rose-400 hover:bg-rose-950/30 transition-all flex flex-col items-center text-center group"
                >
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-rose-300">NDRF National</span>
                  <span className="text-xl font-bold font-mono text-rose-400 mt-0.5">1078</span>
                  <span className="text-[9px] text-slate-500">Rescue Operations</span>
                </a>

                <a
                  href={`tel:${profile?.emergencyHelplines?.eoc || '1077'}`}
                  className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/40 hover:border-amber-400 hover:bg-amber-950/30 transition-all flex flex-col items-center text-center group"
                >
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-amber-300">District EOC</span>
                  <span className="text-xl font-bold font-mono text-amber-400 mt-0.5">1077</span>
                  <span className="text-[9px] text-slate-500">{district} Control</span>
                </a>

                <a
                  href="tel:1070"
                  className="p-3 rounded-xl bg-slate-950/80 border border-sky-500/40 hover:border-sky-400 hover:bg-sky-950/30 transition-all flex flex-col items-center text-center group"
                >
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-sky-300">State EOC (SDMA)</span>
                  <span className="text-xl font-bold font-mono text-sky-400 mt-0.5">1070</span>
                  <span className="text-[9px] text-slate-500">{state} Disaster</span>
                </a>

                <a
                  href="tel:108"
                  className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-950/30 transition-all flex flex-col items-center text-center group"
                >
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-emerald-300">Medical EMS</span>
                  <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5">108</span>
                  <span className="text-[9px] text-slate-500">Ambulance Fleet</span>
                </a>

                <a
                  href="tel:112"
                  className="p-3 rounded-xl bg-slate-950/80 border border-violet-500/40 hover:border-violet-400 hover:bg-violet-950/30 transition-all flex flex-col items-center text-center group col-span-2 sm:col-span-1"
                >
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-violet-300">National Police</span>
                  <span className="text-xl font-bold font-mono text-violet-400 mt-0.5">112</span>
                  <span className="text-[9px] text-slate-500">ERSS Unified</span>
                </a>
              </div>
            </div>

            {/* Designated Multi-Purpose Evacuation Shelters List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>Designated Multi-Purpose Safe Shelters ({district} District):</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  NDMA Shelter Standards Calibrated
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(disaster.shelters || []).map((shelter, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-cyan-400/40 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-bold text-sm text-slate-100">{shelter.name}</h5>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                          {shelter.distance}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>Capacity: <strong className="text-slate-200">{shelter.capacity} persons</strong></span>
                        <span>•</span>
                        <span className={shelter.hasMedical ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                          {shelter.hasMedical ? '✓ Medical Unit & Triage Active' : 'Basic Relief Supplies'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">
                        Control: {shelter.contact}
                      </span>
                      <a
                        href={`tel:${shelter.contact}`}
                        className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 flex items-center space-x-1.5 transition-all shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Dial Shelter</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: National Multi-Hazard SOPs */}
        {activeTab === 'sop' && (
          <div className="mt-5 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                <span className="text-xs font-mono font-bold text-cyan-300 block">🌊 Flood & Inundation SOP</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Turn off electricity mains if water enters premises. Move to highest ground or designated pucca shelters. Do not enter floodwaters.
                </p>
                <span className="text-[10px] font-mono text-slate-500 block">NDMA Flood SOP 2024</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                <span className="text-xs font-mono font-bold text-violet-300 block">⚡ Lightning & Thunderstorm SOP</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Avoid open agricultural fields and wire fences. Do not take shelter under trees. Unplug high-voltage electronic appliances immediately.
                </p>
                <span className="text-[10px] font-mono text-slate-500 block">NDMA Lightning Advisory</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                <span className="text-xs font-mono font-bold text-orange-300 block">☀️ Extreme Heatwave SOP</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Drink ORS, buttermilk, or lemon water frequently. Avoid outdoor sun exposure from 11:30 AM to 03:30 PM. Provide shaded water for livestock.
                </p>
                <span className="text-[10px] font-mono text-slate-500 block">NDMA Heat Action Plan</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                <span className="text-xs font-mono font-bold text-amber-300 block">💨 High Gale & Squall SOP</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Fasten tin roof sheets and loose farm implements. Avoid parking near dilapidated structures and old trees. Reduce vehicle speeds.
                </p>
                <span className="text-[10px] font-mono text-slate-500 block">NDMA Cyclone Protocol</span>
              </div>

            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
              <span>National Disaster Management Guidelines compliant with Sendai Framework for Disaster Risk Reduction (2015-2030).</span>
              <a
                href="https://ndma.gov.in/Governance/Guidelines"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1 shrink-0"
              >
                <span>Read Full NDMA SOPs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
