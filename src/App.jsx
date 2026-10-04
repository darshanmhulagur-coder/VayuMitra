import React, { useState, useEffect } from 'react';
import ParticleBackground from './components/ParticleBackground';
import ModernHeader from './components/ModernHeader';
import ModernHeroStage from './components/ModernHeroStage';
import HourlyScrubber from './components/HourlyScrubber';
import MetricGrid from './components/MetricGrid';
import SevenDayDisasterPanel from './components/SevenDayDisasterPanel';
import DisasterManagementPanel from './components/DisasterManagementPanel';
import AgriUtilityDrawer from './components/AgriUtilityDrawer';
import InteractiveMap from './components/InteractiveMap';
import WeatherChatAgent from './components/WeatherChatAgent';
import EmergencyBroadcastModal from './components/EmergencyBroadcastModal';
import { fetchDistrictWeather, getLastSavedDistrict } from './services/weatherService';
import { getLocalNow, getUserTimezone, getLocalISODate } from './services/networkTime';
import { TRANSLATIONS } from './data/translations';
import { 
  CloudRain, 
  WifiOff, 
  Download, 
  CheckCircle,
  ShieldAlert,
  Compass,
  Cpu,
  Sparkles
} from 'lucide-react';

export default function App() {
  const initialLoc = getLastSavedDistrict();
  const [selectedState, setSelectedState] = useState(initialLoc.state || 'Karnataka');
  const [selectedDistrict, setSelectedDistrict] = useState(initialLoc.district || 'Belagavi');
  const [language, setLanguage] = useState('en');
  const [isFahrenheit, setIsFahrenheit] = useState(false);
  const [agriMode, setAgriMode] = useState(false);
  const [conditionOverride, setConditionOverride] = useState(null); // 'clear', 'rain', 'storm', 'cloudy', 'sunset'
  const [hourlyPreviewItem, setHourlyPreviewItem] = useState(null);
  const [activeHoverHourIndex, setActiveHoverHourIndex] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatPromptTrigger, setChatPromptTrigger] = useState('');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  // PWA Offline states
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [justReconnected, setJustReconnected] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Listen for Online/Offline & PWA Install Prompts
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 5000);
      fetchDistrictWeather(selectedState, selectedDistrict).then((data) => {
        if (data) setWeatherData(data);
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [selectedState, selectedDistrict]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Load weather data on district/state change, with midnight day-change detector and periodic live sync
  useEffect(() => {
    let isCancelled = false;

    async function loadData(force = false) {
      if (!weatherData) setIsLoading(true);
      try {
        const data = await fetchDistrictWeather(selectedState, selectedDistrict, force);
        if (!isCancelled) {
          setWeatherData(data);
        }
      } catch (err) {
        console.error("Failed to load weather data:", err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData(false);

    // 1. Midnight / Calendar Day Change Detector (checks every 10 seconds)
    const userTz = getUserTimezone();
    let lastRecordedDay = getLocalISODate(getLocalNow(), userTz);
    const dayCheckInterval = setInterval(() => {
      const currentDay = getLocalISODate(getLocalNow(), userTz);
      if (currentDay !== lastRecordedDay) {
        console.log("Calendar day rolled over from", lastRecordedDay, "to", currentDay, "- Fetching fresh daily weather!");
        lastRecordedDay = currentDay;
        loadData(true); // force fresh API fetch for the new day
      }
    }, 10000);

    // 2. Periodic Live Weather Sync (every 10 minutes)
    const periodicSync = setInterval(() => {
      loadData(false);
    }, 10 * 60 * 1000);

    return () => {
      isCancelled = true;
      clearInterval(dayCheckInterval);
      clearInterval(periodicSync);
    };
  }, [selectedState, selectedDistrict]);

  const handleLocationChange = (state, district) => {
    setSelectedState(state);
    setSelectedDistrict(district);
    setHourlyPreviewItem(null);
    setActiveHoverHourIndex(null);
  };

  const handleAskChat = (prompt) => {
    setChatPromptTrigger(prompt);
    const chatElement = document.getElementById('weathergpt-chat-section');
    if (chatElement) {
      chatElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Active theme calculation (Live Auto, Preset Override, or Scrubbing Hourly Preview)
  const rawTheme = weatherData?.current?.condition?.theme || 'clear';
  const effectiveTheme = conditionOverride || (hourlyPreviewItem ? (hourlyPreviewItem.theme || 'clear') : rawTheme);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col relative selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden font-sans">
      
      {/* Dynamic Animated Gradient Mesh & Canvas Weather Particles */}
      <ParticleBackground weatherTheme={effectiveTheme} />

      {/* Reconnected Sync Toast */}
      {justReconnected && (
        <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900/90 to-emerald-950/90 border-b border-emerald-500/40 px-4 py-2 text-xs text-emerald-200 flex items-center justify-center space-x-2 sticky top-0 z-50 backdrop-blur-md animate-fadeIn shadow-lg">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
          <span className="font-semibold">Back Online: Live IMD Doppler radar & satellite data synced!</span>
        </div>
      )}

      {/* Persistent Offline Status Banner */}
      {(!isOnline || weatherData?.isCachedOffline) && (
        <div className="bg-gradient-to-r from-amber-950/95 via-slate-900/95 to-amber-950/95 border-b border-amber-500/40 px-4 py-2.5 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 backdrop-blur-md shadow-xl animate-fadeIn">
          <div className="flex items-center space-x-2.5">
            <span className="p-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <WifiOff className="w-3.5 h-3.5" />
            </span>
            <span className="font-bold uppercase tracking-wider font-mono text-[11px] text-amber-300">
              {!isOnline ? 'Offline Mode Active' : 'Offline Cache Telemetry'}
            </span>
            <span className="text-amber-500/60 hidden sm:inline">•</span>
            <span className="text-slate-200 text-[11px] leading-tight">
              {!isOnline
                ? 'Network disconnected. Local microclimate engine & offline cache active.'
                : `Showing verified offline cache (${weatherData?.cachedAt || 'saved sync'}). All 779 districts accessible.`}
            </span>
          </div>

          <div className="flex items-center space-x-2.5 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              ⚡ AI Chat & Analytics 100% Active
            </span>
            {deferredPrompt && (
              <button
                type="button"
                onClick={handleInstallApp}
                className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md flex items-center space-x-1"
                title="Install WeatherGPT on this device for offline access"
              >
                <Download className="w-3 h-3 text-slate-950" />
                <span>Install App</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modern Frosted Header */}
      <ModernHeader
        selectedState={selectedState}
        selectedDistrict={selectedDistrict}
        onLocationChange={handleLocationChange}
        activeConditionOverride={conditionOverride}
        onConditionOverrideChange={setConditionOverride}
        isFahrenheit={isFahrenheit}
        onUnitToggle={() => setIsFahrenheit(!isFahrenheit)}
        agriMode={agriMode}
        onAgriModeToggle={setAgriMode}
        language={language}
        onLanguageChange={setLanguage}
        isOnline={isOnline}
        weatherData={weatherData}
      />

      {/* Main Hackathon Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-7 relative z-10">
        
        {isLoading && !weatherData ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
            <div className="relative p-5 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 shadow-2xl">
              <CloudRain className="w-12 h-12 text-cyan-400 animate-bounce" />
              <div className="w-4 h-4 rounded-full bg-cyan-400 animate-ping absolute top-3 right-3" />
            </div>
            <p className="font-mono text-sm text-cyan-300 animate-pulse">
              Fusing IMD Doppler Radar & Microclimate Telemetry for {selectedDistrict}...
            </p>
          </div>
        ) : (
          weatherData && (
            <>
              {/* SECTION 1: AGRICULTURAL UTILITY DRAWER (X-FACTOR) */}
              <AgriUtilityDrawer
                weatherData={weatherData}
                isOpen={agriMode}
                onClose={() => setAgriMode(false)}
              />

              {/* SECTION 2: HERO STAGE WITH 3D TILT & GLYPH */}
              <section aria-label="Weather Stage">
                <ModernHeroStage
                  weatherData={weatherData}
                  activeConditionOverride={conditionOverride}
                  isFahrenheit={isFahrenheit}
                  hourlyPreviewItem={hourlyPreviewItem}
                />
              </section>

              {/* SECTION 3: 24-HOUR HOURLY INTERACTIVE TIMELINE & CURVE */}
              <section aria-label="Hourly Timeline & Scrubbing Curve">
                <HourlyScrubber
                  hourlyData={weatherData.hourly}
                  isFahrenheit={isFahrenheit}
                  activeHoverHourIndex={activeHoverHourIndex}
                  onHoverHour={(item, idx) => {
                    setHourlyPreviewItem(item);
                    setActiveHoverHourIndex(idx);
                  }}
                />
              </section>

              {/* SECTION 4: 2x2 METRIC DETAIL GRID (AQI, WIND COMPASS, HUMIDITY, UV) */}
              <section aria-label="Microclimate Metric Details">
                <MetricGrid weatherData={weatherData} />
              </section>

              {/* SECTION 5: 7-DAY FORECAST PANEL */}
              <section aria-label="7-Day Synoptic Forecast">
                <SevenDayDisasterPanel
                  weatherData={weatherData}
                  isFahrenheit={isFahrenheit}
                  onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
                />
              </section>

              {/* SECTION 6: DISASTER MANAGEMENT & HYDROLOGICAL TELEMETRY (CWC • INDIA-WRIS • NDMA • NDRF) */}
              <section id="disaster-telemetry-section" aria-label="Disaster Management & Hydrological Telemetry">
                <DisasterManagementPanel
                  weatherData={weatherData}
                  language={language}
                  onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
                />
              </section>

              {/* SECTION 6: INTERACTIVE CLIMATE RADAR & GOOGLE MAPS ENGINE */}
              <section aria-label="Interactive Climate Map">
                <InteractiveMap
                  weatherData={weatherData}
                  language={language}
                  onLocationChange={handleLocationChange}
                />
              </section>

              {/* SECTION 7: MULTILINGUAL AI ASSISTANT (TEXT & VOICE CHAT) */}
              <section id="weathergpt-chat-section" aria-label="WeatherGPT Multilingual Conversational Agent">
                <WeatherChatAgent
                  weatherData={weatherData}
                  language={language}
                  activeDistrict={selectedDistrict}
                  activeState={selectedState}
                  initialPrompt={chatPromptTrigger}
                />
              </section>
            </>
          )
        )}

      </main>

      {/* National Emergency Alert Modal */}
      <EmergencyBroadcastModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onSelectDistrict={(state, district) => {
          handleLocationChange(state, district);
          setIsEmergencyModalOpen(false);
        }}
      />

      {/* Production-Grade Hackathon Frosted Footer */}
      <footer className="w-full border-t border-white/10 bg-slate-950/90 backdrop-blur-2xl py-7 px-4 sm:px-8 mt-14 relative z-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center space-x-3">
            <span className="font-extrabold text-slate-100 text-sm tracking-tight font-sans">
              WeatherGPT Pro
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-400 text-[11px] font-mono">
            <span>ISRO INSAT-3DR</span>
            <span>•</span>
            <span>IMD Doppler Weather Radar</span>
            <span>•</span>
            <span>ECMWF 9km Grid</span>
            <span>•</span>
            <span>PWA Offline Engine</span>
            <span>•</span>
            <span>Web Speech API</span>
          </div>

          <div className="font-mono text-[10px] text-slate-500">
            Smart India Hackathon • Meteorological Intelligence Prototype v3.0
          </div>
        </div>
      </footer>

    </div>
  );
}
