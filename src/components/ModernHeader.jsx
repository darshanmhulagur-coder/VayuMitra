import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Crosshair, 
  Globe, 
  Sprout, 
  Sun, 
  CloudRain, 
  CloudLightning, 
  Cloud, 
  Sunset, 
  WifiOff, 
  ShieldCheck,
  X
} from 'lucide-react';
import { ALL_DISTRICTS_SEARCH_INDEX } from '../data/indiaDistricts';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../data/translations';

export default function ModernHeader({
  selectedState,
  selectedDistrict,
  onLocationChange,
  activeConditionOverride,
  onConditionOverrideChange,
  isFahrenheit,
  onUnitToggle,
  agriMode,
  onAgriModeToggle,
  language,
  onLanguageChange,
  isOnline,
  onRequestMicPermission,
  weatherData
}) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const searchRef = useRef(null);
  const langRef = useRef(null);

  // Search autocomplete filter
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    const matches = ALL_DISTRICTS_SEARCH_INDEX.filter(item =>
      item.searchText.includes(q)
    ).slice(0, 7);

    setSearchResults(matches);
    setIsSearchOpen(matches.length > 0);
  }, [searchQuery]);

  // Click outside listener for search & language dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // GPS Device Locator
  const handleGPSLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        // Find closest district in index
        let closest = null;
        let minDist = Infinity;
        ALL_DISTRICTS_SEARCH_INDEX.forEach(item => {
          const d = Math.hypot(item.lat - latitude, item.lng - longitude);
          if (d < minDist) {
            minDist = d;
            closest = item;
          }
        });
        if (closest) {
          onLocationChange(closest.state, closest.district);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn("GPS location error:", err.message);
      },
      { timeout: 8000 }
    );
  };

  const conditionPresets = [
    { id: 'auto', label: 'Auto (Live)', icon: null },
    { id: 'clear', label: 'Clear', icon: Sun, color: 'text-amber-400' },
    { id: 'rain', label: 'Rainy', icon: CloudRain, color: 'text-cyan-400' },
    { id: 'storm', label: 'Stormy', icon: CloudLightning, color: 'text-indigo-400' },
    { id: 'cloudy', label: 'Cloudy', icon: Cloud, color: 'text-slate-300' },
    { id: 'sunset', label: 'Sunset', icon: Sunset, color: 'text-rose-400' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-6 lg:px-8 pt-3 pb-2 backdrop-blur-2xl bg-slate-950/40 border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        
        {/* Left: Brand & Location Indicator */}
        <div className="flex items-center justify-between w-full lg:w-auto space-x-3">
          <div className="flex items-center space-x-2.5">
            <div className="relative p-2 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-400/30 shadow-lg shadow-cyan-500/10">
              <Sun className="w-5 h-5 text-cyan-400 animate-spin-slow" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent font-sans">
                  WeatherGPT
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                  PRO
                </span>
              </div>
              <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="font-medium text-slate-200 truncate max-w-[140px] sm:max-w-[200px]">
                  {selectedDistrict}, {selectedState}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Condition Switcher on Mobile (Judges Demo Pill) */}
          <div className="lg:hidden flex items-center space-x-1">
            <button
              onClick={() => onAgriModeToggle(!agriMode)}
              className={`p-1.5 rounded-xl border text-xs transition-all ${
                agriMode 
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/20' 
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
              title="Toggle Agri Mode"
            >
              <Sprout className="w-4 h-4" />
            </button>
            <button
              onClick={onUnitToggle}
              className="px-2 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold text-slate-200"
            >
              {isFahrenheit ? '°F' : '°C'}
            </button>
          </div>
        </div>

        {/* Center: Search Bar with Autocomplete & GPS */}
        <div ref={searchRef} className="relative w-full lg:max-w-md">
          <div className="relative flex items-center rounded-2xl backdrop-blur-xl bg-white/10 dark:bg-black/25 border border-white/15 focus-within:border-cyan-400/60 focus-within:ring-2 focus-within:ring-cyan-500/20 shadow-xl transition-all">
            <Search className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 779+ districts, cities, or pincodes..."
              className="w-full bg-transparent px-3 py-2 text-xs md:text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="p-1 mr-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleGPSLocate}
              disabled={isLocating}
              className="mr-2 p-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-400/40 transition-all text-xs flex items-center space-x-1 shrink-0"
              title="Locate via GPS"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden sm:inline text-[11px] font-mono">GPS</span>
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl backdrop-blur-2xl bg-slate-950/90 border border-white/15 shadow-2xl overflow-hidden divide-y divide-white/5"
              >
                <div className="p-2 text-[10px] font-mono uppercase text-slate-400 px-3 flex items-center justify-between">
                  <span>Indian Meteorological Search Results</span>
                  <span>779 Districts</span>
                </div>
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onLocationChange(item.state, item.district);
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-cyan-500/15 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-xs font-semibold text-slate-100 group-hover:text-cyan-200">
                          {item.district}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.state} • Elevation: {item.elevation}m
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400/70 group-hover:text-cyan-300">
                      Select ➔
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Quick Condition Switcher (Judges Demo) + Toggles */}
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-end gap-2 w-full lg:w-auto">
          
          {/* Judges Demo Condition Switcher Pills */}
          <div className="flex items-center p-1 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-inner overflow-x-auto scrollbar-none">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 px-2 shrink-0">
              Preview:
            </span>
            {conditionPresets.map((preset) => {
              const Icon = preset.icon;
              const isActive = activeConditionOverride === preset.id || (!activeConditionOverride && preset.id === 'auto');
              const liveLabel = preset.id === 'auto' 
                ? (weatherData?.current?.condition?.main ? `Auto (${weatherData.current.condition.main})` : 'Auto (Live)') 
                : preset.label;

              return (
                <button
                  key={preset.id}
                  onClick={() => onConditionOverrideChange(preset.id === 'auto' ? null : preset.id)}
                  className={`px-2 py-1 rounded-xl text-xs font-medium transition-all flex items-center space-x-1 shrink-0 ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                  title={`Simulate ${preset.label} condition`}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  <span>{liveLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Agri / Farmer Mode Toggle (Hackathon X-Factor) */}
          <button
            onClick={() => onAgriModeToggle(!agriMode)}
            className={`px-3 py-1.5 rounded-2xl border text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              agriMode 
                ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 border-emerald-400/60 text-emerald-200 shadow-lg shadow-emerald-500/20' 
                : 'backdrop-blur-xl bg-white/5 border-white/10 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300'
            }`}
            title="Toggle Agricultural Intelligence & Pest Advisory"
          >
            <Sprout className={`w-3.5 h-3.5 ${agriMode ? 'text-emerald-400 animate-bounce' : 'text-slate-400'}`} />
            <span>Agri Mode</span>
            {agriMode && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
          </button>

          {/* °C / °F Unit Pill Switcher */}
          <div className="flex items-center p-1 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
            <button
              onClick={() => isFahrenheit && onUnitToggle()}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                !isFahrenheit 
                  ? 'bg-white/20 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => !isFahrenheit && onUnitToggle()}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                isFahrenheit 
                  ? 'bg-white/20 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °F
            </button>
          </div>

          {/* Multilingual Selector */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="p-2 rounded-2xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex items-center space-x-1"
              title="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-mono uppercase">{language}</span>
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-40 rounded-2xl backdrop-blur-2xl bg-slate-950/95 border border-white/15 shadow-2xl p-1.5 z-50 divide-y divide-white/5"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        language === lang.code
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{lang.native}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </header>
  );
}
