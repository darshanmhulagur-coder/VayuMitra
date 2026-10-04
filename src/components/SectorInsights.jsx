import React, { useState } from 'react';
import { 
  Sprout, 
  Truck, 
  Zap, 
  ShieldAlert, 
  Droplet, 
  AlertTriangle, 
  Sun, 
  Wind, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  ThermometerSnowflake,
  LifeBuoy
} from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { analyzeRouteWeather } from '../services/weatherService';

export default function SectorInsights({ weatherData, language, isFahrenheit }) {
  const [activeTab, setActiveTab] = useState('agri'); // 'agri', 'logistics', 'renewable', 'disaster'
  const [routeSource, setRouteSource] = useState(weatherData?.district || 'Belagavi');
  const [routeDest, setRouteDest] = useState('Nashik');
  const [routeAnalysis, setRouteAnalysis] = useState(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  if (!weatherData) return null;

  const { agriculture, renewable, disaster, district, state, profile } = weatherData;

  const handleRunRouteAnalysis = () => {
    const result = analyzeRouteWeather(routeSource, routeDest);
    setRouteAnalysis(result);
  };

  return (
    <div className="p-6 rounded-2xl glass-panel space-y-6">
      
      {/* Header and Sector Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-xl font-bold font-display text-slate-100 flex items-center space-x-2">
            <span>{t.sectorInsights}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Targeted decision-support models calibrated for {district} ({profile?.agroZone})
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('agri')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'agri'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.tabAgri}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('logistics');
              if (!routeAnalysis) handleRunRouteAnalysis();
            }}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'logistics'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.tabLogistics}</span>
          </button>

          <button
            onClick={() => setActiveTab('renewable')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'renewable'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.tabRenewable}</span>
          </button>

          <button
            onClick={() => setActiveTab('disaster')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'disaster'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>{t.tabDisaster}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AGRICULTURE & FARMERS */}
      {activeTab === 'agri' && (
        <div className="space-y-6">
          
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-xl glass-panel-subtle border-emerald-500/30 bg-emerald-950/10">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span className="font-semibold">{t.soilMoisture}</span>
                <Droplet className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-hud font-bold text-emerald-300">
                {agriculture.soilMoisture}%
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Root-zone saturation. Soil type: {profile?.soilType}.
              </p>
            </div>

            <div className="p-4 rounded-xl glass-panel-subtle border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span className="font-semibold">{t.evapotranspiration}</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-3xl font-hud font-bold text-amber-300">
                {agriculture.et0} <span className="text-sm font-normal text-slate-400">mm/day</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Penman-Monteith crop canopy water consumption rate.
              </p>
            </div>

            <div className="p-4 rounded-xl glass-panel-subtle border-cyan-500/30 bg-cyan-950/10">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span className="font-semibold">{t.irrigationAdvice}</span>
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-xs text-cyan-200 mt-1 leading-relaxed font-medium">
                {agriculture.irrigationAdvice}
              </p>
            </div>

          </div>

          {/* AI Pest & Disease Alert Card */}
          <div className={`p-5 rounded-xl border ${
            agriculture.pestAlert.riskLevel === 'HIGH' 
              ? 'border-rose-500/40 bg-rose-950/20' 
              : agriculture.pestAlert.riskLevel === 'MODERATE' 
                ? 'border-amber-500/40 bg-amber-950/20' 
                : 'border-emerald-500/40 bg-emerald-950/20'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className={`w-5 h-5 ${
                  agriculture.pestAlert.riskLevel === 'HIGH' ? 'text-rose-400' : 'text-amber-400'
                }`} />
                <h4 className="font-bold text-sm md:text-base text-slate-100">
                  {t.aiPestAlert}: <span className="text-cyan-300">{agriculture.pestAlert.diseaseName}</span>
                </h4>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider ${
                agriculture.pestAlert.riskLevel === 'HIGH'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {agriculture.pestAlert.riskLevel} RISK
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Crops Vulnerable:</span>
                <p className="text-slate-200 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  {agriculture.pestAlert.cropsAffected}
                </p>

                <span className="text-slate-400 font-semibold block mt-3 mb-1">Field Symptoms:</span>
                <p className="text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  {agriculture.pestAlert.symptoms}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Recommended Preventive Action:</span>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-cyan-500/20 text-slate-200 leading-relaxed">
                  <p className="text-cyan-300 font-medium mb-1">
                    🔬 Agro-Chemical Prescription:
                  </p>
                  <p>{agriculture.pestAlert.actionAdvice}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: LOGISTICS & ROUTE WEATHER */}
      {activeTab === 'logistics' && (
        <div className="space-y-6">
          
          {/* Origin / Destination Selector */}
          <div className="p-4 rounded-xl glass-panel-subtle border-slate-700 flex flex-col md:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                {t.sourceDistrict}
              </label>
              <input
                type="text"
                value={routeSource}
                onChange={(e) => setRouteSource(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg glass-input bg-slate-900 text-slate-100 border border-slate-700"
              />
            </div>

            <ArrowRight className="w-5 h-5 text-cyan-400 hidden md:block shrink-0 mt-5" />

            <div className="flex-1 w-full">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                {t.destDistrict}
              </label>
              <input
                type="text"
                value={routeDest}
                onChange={(e) => setRouteDest(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg glass-input bg-slate-900 text-slate-100 border border-slate-700"
              />
            </div>

            <button
              onClick={handleRunRouteAnalysis}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all shrink-0 mt-5"
            >
              {t.calculateRoute}
            </button>
          </div>

          {/* Route Milestones & Weather Breakdown */}
          {routeAnalysis && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono">
                <span className="text-slate-300">Total Distance: <strong className="text-cyan-300">{routeAnalysis.totalDistance}</strong></span>
                <span className="text-slate-300">Transit ETA: <strong className="text-amber-300">{routeAnalysis.estimatedDriveTime}</strong></span>
                <span className="text-slate-300">Highway Risk: <strong className="text-amber-400">{routeAnalysis.overallRisk}</strong></span>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-amber-500 before:to-emerald-500">
                {routeAnalysis.waypoints.map((wp, i) => (
                  <div key={i} className="relative p-4 rounded-xl glass-panel-subtle border-slate-800 hover:border-slate-700 transition-all">
                    <span className={`absolute -left-[27px] top-4 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                      wp.status === 'green' ? 'bg-emerald-400 ring-2 ring-emerald-500/20' : 'bg-amber-400 ring-2 ring-amber-500/20'
                    }`}></span>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h5 className="font-bold text-sm text-slate-100">{wp.name}</h5>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {wp.distance} • {wp.elevation}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          ETA: <span className="font-mono text-cyan-300 font-semibold">{wp.eta}</span> • {wp.condition} ({wp.temp})
                        </p>
                      </div>

                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full w-fit ${
                        wp.status === 'green' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {wp.status === 'green' ? 'Clear Passage' : 'Weather Alert'}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-300 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      ⚠️ <strong className="text-slate-200">Hazard Flag:</strong> {wp.hazard}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 3: RENEWABLE ENERGY */}
      {activeTab === 'renewable' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-xl glass-panel-subtle border-amber-500/30 bg-amber-950/10">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>{t.solarIrradiance}</span>
                <Sun className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-3xl font-hud font-bold text-amber-300">
                {renewable.solarGhi} <span className="text-xs font-normal text-slate-400">kWh/m²</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Daily surface solar radiation.
              </p>
            </div>

            <div className="p-4 rounded-xl glass-panel-subtle border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>{t.peakSolarHours}</span>
                <Sun className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-3xl font-hud font-bold text-slate-100">
                {renewable.peakHours} <span className="text-xs font-normal text-slate-400">Hours/day</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                10kW Rooftop Yield: ~{renewable.rooftopYield10kW} kWh.
              </p>
            </div>

            <div className="p-4 rounded-xl glass-panel-subtle border-sky-500/30 bg-sky-950/10">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>{t.windPotential}</span>
                <Wind className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-3xl font-hud font-bold text-sky-300">
                {renewable.windPotentialMW} <span className="text-xs font-normal text-slate-400">MW/km²</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Capacity factor: {renewable.windCapacityFactor}%.
              </p>
            </div>

            <div className="p-4 rounded-xl glass-panel-subtle border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Optimal Solar Tilt</span>
                <Zap className="w-4 h-4 text-violet-400" />
              </div>
              <p className="text-3xl font-hud font-bold text-violet-300">
                {Math.round(profile?.lat || 15)}° <span className="text-xs font-normal text-slate-400">South</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Fixed-tilt annual optimization angle.
              </p>
            </div>

          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>⚡ Grid Ingestion Forecast: High afternoon solar generation window expected between 11:30 AM – 03:00 PM.</span>
            <span className="font-mono text-cyan-400">Inverter Efficiency: 96.4%</span>
          </div>
        </div>
      )}

      {/* TAB 4: DISASTER MANAGEMENT & SAFE SHELTERS */}
      {activeTab === 'disaster' && (
        <div className="space-y-6">
          
          {/* Flood Vulnerability & River Telemetry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-xl glass-panel-subtle border-rose-500/30 bg-rose-950/10">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span className="font-semibold">{t.floodRating}</span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-hud font-bold text-rose-300">
                  {disaster.floodRiskScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </p>
                <span className="text-xs font-mono font-bold text-rose-400 uppercase">
                  ({disaster.floodLevel} Vulnerability)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-full rounded-full transition-all"
                  style={{ width: `${disaster.floodRiskScore}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 rounded-xl glass-panel-subtle border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span className="font-semibold">{t.riverDischarge}</span>
                <LifeBuoy className="w-4 h-4 text-cyan-400" />
              </div>
              <h5 className="text-sm font-bold text-slate-100">{disaster.riverDischarge.basin}</h5>
              <div className="mt-2 space-y-1 text-xs text-slate-300">
                <p>Status: <span className="font-semibold text-amber-300">{disaster.riverDischarge.levelStatus}</span></p>
                <p>Flow Rate: <span className="font-mono text-cyan-300">{disaster.riverDischarge.flowRate}</span> ({disaster.riverDischarge.dangerMarkMargin})</p>
              </div>
            </div>

          </div>

          {/* Designated Emergency Shelters List */}
          <div>
            <h4 className="text-sm font-bold text-slate-100 mb-3 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>{t.safeSheltersNearby} ({district} District)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {disaster.shelters.map((shelter, idx) => (
                <div key={idx} className="p-4 rounded-xl glass-panel-subtle border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <h5 className="font-bold text-xs text-slate-100">{shelter.name}</h5>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 shrink-0 ml-2">
                        {shelter.distance}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center space-x-3 text-[11px] text-slate-400">
                      <span>Capacity: <strong className="text-slate-200">{shelter.capacity} persons</strong></span>
                      <span>•</span>
                      <span className={shelter.hasMedical ? 'text-emerald-400' : 'text-slate-400'}>
                        {shelter.hasMedical ? '✓ Medical Unit Active' : 'Basic Relief Supplies'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">Control: {shelter.contact}</span>
                    <a
                      href={`tel:${shelter.contact}`}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 flex items-center space-x-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Center</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Helplines Quick Dial Bar */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-amber-950/40 to-rose-950/40 border border-rose-500/30 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
              🚨 24x7 Multi-Hazard National Helplines:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <a href="tel:1077" className="px-3 py-1 rounded-lg bg-slate-900 text-xs font-mono font-bold text-slate-200 border border-slate-700 hover:border-cyan-400">
                District EOC: 1077
              </a>
              <a href="tel:1078" className="px-3 py-1 rounded-lg bg-slate-900 text-xs font-mono font-bold text-slate-200 border border-slate-700 hover:border-cyan-400">
                NDRF: 1078
              </a>
              <a href="tel:108" className="px-3 py-1 rounded-lg bg-slate-900 text-xs font-mono font-bold text-slate-200 border border-slate-700 hover:border-cyan-400">
                Ambulance: 108
              </a>
              <a href="tel:101" className="px-3 py-1 rounded-lg bg-slate-900 text-xs font-mono font-bold text-slate-200 border border-slate-700 hover:border-cyan-400">
                Fire: 101
              </a>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
