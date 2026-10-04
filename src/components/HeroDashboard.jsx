import React, { useState } from 'react';
import { 
  Sun, 
  CloudRain, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudLightning, 
  Snowflake, 
  Wind, 
  Droplets, 
  Gauge, 
  Compass, 
  Volume2, 
  VolumeX, 
  Radio, 
  ShieldCheck, 
  AlertCircle, 
  Activity,
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { speechService } from '../services/speechService';

export default function HeroDashboard({ 
  weatherData, 
  language, 
  isFahrenheit, 
  onAskChat 
}) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  if (!weatherData) return null;

  const { current, weatherWindows, profile, district, state } = weatherData;

  const displayTemp = (celsius) => {
    if (isFahrenheit) {
      return `${Math.round((celsius * 9/5) + 32)}°F`;
    }
    return `${celsius}°C`;
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      speechService.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      const script = speechService.generateDailyBulletinScript(weatherData, language);
      setIsPlayingAudio(true);
      speechService.speak(
        script, 
        language, 
        () => setIsPlayingAudio(true), 
        () => setIsPlayingAudio(false)
      );
    }
  };

  const getWeatherIcon = (iconName, className = "w-8 h-8") => {
    switch (iconName) {
      case 'Sun': return <Sun className={`${className} text-amber-400`} />;
      case 'CloudSun': return <CloudSun className={`${className} text-amber-300`} />;
      case 'Cloud': return <Cloud className={`${className} text-slate-300`} />;
      case 'CloudFog': return <CloudFog className={`${className} text-slate-400`} />;
      case 'CloudRain': return <CloudRain className={`${className} text-cyan-400`} />;
      case 'CloudLightning': return <CloudLightning className={`${className} text-violet-400 animate-pulse`} />;
      case 'Snowflake': return <Snowflake className={`${className} text-sky-300`} />;
      default: return <Sun className={`${className} text-amber-400`} />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top District Header & Audio Bulletin Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 lg:p-6 rounded-2xl glass-panel-glow bg-slate-900/70 border border-cyan-500/30">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              {state}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              📍 {profile?.lat?.toFixed(2)}°N, {profile?.lng?.toFixed(2)}°E
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              ⛰️ {profile?.elevation}m MSL
            </span>
            {weatherData.isCachedOffline && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                ⚡ Offline Cached
              </span>
            )}
          </div>
          
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
            {district}
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
            <span>{current.date}</span>
            <span>•</span>
            <span className="font-mono text-cyan-400">{current.time} IST</span>
            <span>•</span>
            <span className="text-slate-300 font-medium">{profile?.riverBasin}</span>
          </p>
        </div>

        {/* 1-Minute Daily Audio Bulletin Player */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
          <button
            onClick={handleToggleAudio}
            className={`w-full sm:w-auto flex items-center justify-center space-x-2.5 px-5 py-3 rounded-xl font-semibold text-xs transition-all shadow-lg ${
              isPlayingAudio 
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/60 shadow-rose-500/20 ring-2 ring-rose-500/30' 
                : 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 hover:from-cyan-500/30 hover:to-violet-500/30 text-cyan-200 border border-cyan-400/40 shadow-cyan-500/10'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>{t.stopAudioUpdate}</span>
                <span className="flex space-x-1 items-end h-3 ml-1">
                  <span className="w-1 bg-rose-400 h-2 animate-bounce"></span>
                  <span className="w-1 bg-rose-400 h-3 animate-bounce [animation-delay:0.15s]"></span>
                  <span className="w-1 bg-rose-400 h-1.5 animate-bounce [animation-delay:0.3s]"></span>
                  <span className="w-1 bg-rose-400 h-2.5 animate-bounce [animation-delay:0.45s]"></span>
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>{t.playAudioUpdate}</span>
                <Radio className="w-3.5 h-3.5 text-cyan-400/80" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Audio Teleprompter & Visualizer Drawer */}
      {isPlayingAudio && (
        <div className="p-4 rounded-xl border border-cyan-500/40 bg-slate-950/90 shadow-2xl space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <span className="flex space-x-1 items-end h-3.5">
                <span className="w-1 bg-cyan-400 h-3 animate-bounce"></span>
                <span className="w-1 bg-cyan-400 h-4 animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1 bg-cyan-400 h-2 animate-bounce [animation-delay:0.3s]"></span>
                <span className="w-1 bg-cyan-400 h-3.5 animate-bounce [animation-delay:0.45s]"></span>
              </span>
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                📡 Broadcasting 1-Minute Meteorological Briefing ({language.toUpperCase()})
              </span>
            </div>
            <button
              onClick={() => {
                speechService.stopSpeaking();
                setIsPlayingAudio(false);
              }}
              className="text-[11px] font-mono text-slate-400 hover:text-rose-400 transition-colors"
            >
              [Dismiss]
            </button>
          </div>

          <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            {speechService.getNativeTranscript(weatherData, language)}
          </p>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
            <span className="text-emerald-400">✓ Multi-Tier Audio Engine Active</span>
            <span>Indian IMD & Agro-Telemetry Calibrated</span>
          </div>
        </div>
      )}

      {/* Hero Primary Temperature & Condition Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Temperature Card (Left 5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between group hover:border-cyan-500/40 transition-all">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all"></div>
          
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
                Live Microclimate Telemetry
              </span>
              <div className="flex items-baseline space-x-3 mt-2">
                <span className="text-6xl lg:text-7xl font-extrabold font-hud tracking-tight text-white drop-shadow-md">
                  {displayTemp(current.temp)}
                </span>
                <div className="space-y-0.5">
                  <p className="text-xs text-slate-400">
                    {t.feelsLike}: <span className="font-semibold text-cyan-300 font-mono">{displayTemp(current.feelsLike)}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    H: <span className="text-amber-300 font-mono">{displayTemp(weatherData.daily[0]?.maxTemp || current.temp + 3)}</span> L: <span className="text-sky-300 font-mono">{displayTemp(weatherData.daily[0]?.minTemp || current.temp - 4)}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-inner">
              {getWeatherIcon(current.condition.icon, "w-12 h-12")}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {current.condition.desc}
              </h2>
              <p className="text-xs text-slate-400">
                {profile?.agroZone}
              </p>
            </div>
            <button
              onClick={() => onAskChat(`Will it rain today in ${district}?`)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ask AI</span>
            </button>
          </div>
        </div>

        {/* AI "Weather Window" Countdown Banner (Right 7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between border-slate-700/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
                {t.weatherWindow}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Inferred from Radar + Convective Modeling
            </span>
          </div>

          <div className="space-y-3">
            {weatherWindows.map((win, idx) => {
              const borderStyles = win.badgeColor === 'emerald' 
                ? 'border-emerald-500/30 bg-emerald-950/20' 
                : win.badgeColor === 'cyan' 
                  ? 'border-cyan-500/30 bg-cyan-950/20' 
                  : 'border-amber-500/30 bg-amber-950/20';

              const textColors = win.badgeColor === 'emerald' 
                ? 'text-emerald-300' 
                : win.badgeColor === 'cyan' 
                  ? 'text-cyan-300' 
                  : 'text-amber-300';

              return (
                <div 
                  key={idx}
                  className={`p-3.5 rounded-xl border ${borderStyles} transition-all hover:scale-[1.01]`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <Clock className={`w-4 h-4 ${textColors}`} />
                      <h4 className="text-xs md:text-sm font-bold text-slate-100">
                        {win.title}
                      </h4>
                    </div>
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900/80 ${textColors}`}>
                      {win.probability}% Risk
                    </span>
                  </div>
                  <p className="text-xs text-slate-300/90 mt-1 pl-6">
                    {win.sub}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Grid of Key Meteorological Sensors */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        
        {/* Humidity */}
        <div className="p-4 rounded-xl glass-panel-subtle border-slate-800/80 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>{t.humidity}</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-hud font-bold text-slate-100">
            {current.humidity}%
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">
            Dew point: {current.temp - Math.round((100 - current.humidity) / 5)}°C
          </p>
        </div>

        {/* Wind Speed & Direction */}
        <div className="p-4 rounded-xl glass-panel-subtle border-slate-800/80 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>{t.windSpeed}</span>
            <Wind className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-hud font-bold text-slate-100">
            {current.windSpeed} <span className="text-xs font-normal text-slate-400">km/h</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono flex items-center space-x-1">
            <Compass className="w-3 h-3 text-sky-400" />
            <span>SW • {current.windDirection}°</span>
          </p>
        </div>

        {/* Barometric Pressure */}
        <div className="p-4 rounded-xl glass-panel-subtle border-slate-800/80 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>{t.pressure}</span>
            <Gauge className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-2xl font-hud font-bold text-slate-100">
            {current.pressure} <span className="text-xs font-normal text-slate-400">hPa</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">
            {current.pressure < 1008 ? 'Depression / Low' : 'Stable Gradient'}
          </p>
        </div>

        {/* UV Index */}
        <div className="p-4 rounded-xl glass-panel-subtle border-slate-800/80 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>{t.uvIndex}</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-hud font-bold text-slate-100">
            {current.uvIndex} <span className="text-xs font-normal text-slate-400">/ 11</span>
          </p>
          <p className={`text-[10px] font-mono mt-1 ${current.uvIndex > 7 ? 'text-rose-400' : current.uvIndex > 4 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {current.uvIndex > 7 ? 'Very High • Wear Hat' : current.uvIndex > 4 ? 'Moderate Protection' : 'Low Sun Exposure'}
          </p>
        </div>

        {/* Air Quality Index (AQI) */}
        <div className="p-4 rounded-xl glass-panel-subtle border-slate-800/80 hover:border-cyan-500/30 transition-all col-span-2 md:col-span-1 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>{t.aqi}</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <p className="text-2xl font-hud font-bold text-slate-100">
              {current.aqi.value}
            </p>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
              current.aqi.category === 'Good' || current.aqi.category === 'Satisfactory' 
                ? 'bg-emerald-500/20 text-emerald-300' 
                : current.aqi.category === 'Moderate' 
                  ? 'bg-amber-500/20 text-amber-300' 
                  : 'bg-rose-500/20 text-rose-300'
            }`}>
              {current.aqi.category}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">
            PM2.5: {current.aqi.pm25} µg/m³
          </p>
        </div>

        {/* Soil Moisture */}
        <div className="p-4 rounded-xl glass-panel-subtle border-slate-800/80 hover:border-cyan-500/30 transition-all col-span-2 md:col-span-1 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Soil Moisture</span>
            <Droplets className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-hud font-bold text-emerald-400">
            {weatherData.agriculture.soilMoisture}%
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">
            ET₀: {weatherData.agriculture.et0} mm/day
          </p>
        </div>

      </div>

    </div>
  );
}
