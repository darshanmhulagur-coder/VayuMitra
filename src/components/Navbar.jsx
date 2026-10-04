import React, { useState, useRef, useEffect } from 'react';
import { 
  CloudRain, 
  Search, 
  MapPin, 
  Globe, 
  AlertTriangle, 
  Thermometer, 
  ChevronDown, 
  Sparkles,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { INDIA_STATES_DATA, ALL_DISTRICTS_SEARCH_INDEX } from '../data/indiaDistricts';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../data/translations';
import { NATIONAL_EMERGENCY_ALERTS } from '../data/emergencyAlerts';
import EmergencyBroadcastModal from './EmergencyBroadcastModal';

export default function Navbar({ 
  selectedState, 
  selectedDistrict, 
  onLocationChange, 
  language, 
  onLanguageChange, 
  isFahrenheit, 
  onUnitToggle,
  weatherData
}) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const availableDistricts = INDIA_STATES_DATA[selectedState] || [];

  // Handle Search Input & Auto-suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    const matches = ALL_DISTRICTS_SEARCH_INDEX.filter(item => 
      item.searchText.includes(q)
    ).slice(0, 8);

    setSearchResults(matches);
    setIsSearchOpen(matches.length > 0);
  }, [searchQuery]);

  // Click outside search listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSearchResult = (item) => {
    onLocationChange(item.state, item.district);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleStateSelect = (e) => {
    const newState = e.target.value;
    const districts = INDIA_STATES_DATA[newState] || [];
    const firstDistrict = districts[0] || '';
    onLocationChange(newState, firstDistrict);
  };

  const handleDistrictSelect = (e) => {
    onLocationChange(selectedState, e.target.value);
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top Main Navigation Bar */}
      <div className="glass-panel border-b border-cyan-500/20 bg-slate-950/85 backdrop-blur-xl px-4 lg:px-8 py-3 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => onLocationChange('Karnataka', 'Belagavi')}>
              <div className="relative p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600/30 to-violet-600/30 border border-cyan-400/40 shadow-lg shadow-cyan-500/10 group-hover:border-cyan-400 transition-all">
                <CloudRain className="w-6 h-6 text-cyan-400 animate-pulse-slow" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-sky-200 to-violet-400 bg-clip-text text-transparent">
                    WeatherGPT
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/20">
                    {t.sihBadge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
                  {t.tagline}
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center space-x-2">
              <button
                onClick={onUnitToggle}
                className="px-2 py-1 text-xs font-mono rounded-lg bg-slate-800 border border-slate-700 text-cyan-300"
              >
                {isFahrenheit ? '°F' : '°C'}
              </button>
            </div>
          </div>

          {/* Cascading State & District Selector + Search Bar */}
          <div className="flex flex-1 flex-wrap lg:flex-nowrap items-center gap-2.5 w-full lg:max-w-3xl">
            
            {/* Universal Search Bar */}
            <div ref={searchRef} className="relative flex-1 min-w-[240px]">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/70" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 text-xs md:text-sm rounded-xl glass-input bg-slate-900/80 text-slate-100 placeholder-slate-400 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>

              {/* Autocomplete Dropdown */}
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 py-1.5 rounded-xl glass-panel-glow bg-slate-900/95 border border-cyan-500/30 shadow-2xl z-50 max-h-72 overflow-y-auto">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
                    Matching Districts & Pincodes
                  </div>
                  {searchResults.map((item, idx) => (
                    <button
                      key={`${item.state}-${item.district}-${idx}`}
                      onClick={() => handleSelectSearchResult(item)}
                      className="w-full text-left px-3.5 py-2 hover:bg-cyan-500/15 flex items-center justify-between text-xs transition-colors group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                        <div>
                          <span className="font-semibold text-slate-100 group-hover:text-cyan-300">
                            {item.district}
                          </span>
                          <span className="text-slate-400 text-[11px] ml-1.5">
                            ({item.state})
                          </span>
                        </div>
                      </div>
                      {item.pincode && (
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                          {item.pincode}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* State Cascading Dropdown */}
            <div className="relative w-full sm:w-auto min-w-[160px]">
              <select
                value={selectedState}
                onChange={handleStateSelect}
                aria-label={t.selectState}
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs rounded-xl glass-input bg-slate-900/80 text-slate-200 border border-slate-700/80 focus:border-cyan-400 cursor-pointer font-medium"
              >
                {Object.keys(INDIA_STATES_DATA).map((state) => (
                  <option key={state} value={state} className="bg-slate-900 text-slate-200">
                    {state}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* District Cascading Dropdown */}
            <div className="relative w-full sm:w-auto min-w-[150px]">
              <select
                value={selectedDistrict}
                onChange={handleDistrictSelect}
                aria-label={t.selectDistrict}
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs rounded-xl glass-input bg-slate-900/80 text-cyan-300 border border-cyan-500/30 focus:border-cyan-400 cursor-pointer font-semibold"
              >
                {availableDistricts.map((dist) => (
                  <option key={dist} value={dist} className="bg-slate-900 text-slate-200">
                    {dist}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-400 pointer-events-none" />
            </div>

          </div>

          {/* Right Controls: Language Selector & Unit Toggle */}
          <div className="flex items-center space-x-2.5 w-full lg:w-auto justify-end">
            
            {/* Language Selector */}
            <div className="relative">
              <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl glass-input bg-slate-900/80 border border-slate-700 hover:border-violet-500/50 transition-colors">
                <Globe className="w-3.5 h-3.5 text-violet-400" />
                <select
                  value={language}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  aria-label="Language Selector"
                  className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer font-medium pr-1"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                      {lang.native} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Metric/Imperial toggle */}
            <button
              onClick={onUnitToggle}
              title="Toggle Celsius / Fahrenheit"
              className="hidden lg:flex items-center space-x-1 px-3 py-1.5 rounded-xl glass-panel text-xs font-mono font-medium text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all"
            >
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isFahrenheit ? '°F (US)' : '°C (Metric)'}</span>
            </button>

          </div>

        </div>
      </div>

            {/* Real-Time Color-Coded Meteorological Alert Bar (Red Alert, Orange Alert, Green Alert) */}
      {(() => {
        const getLiveDistrictAlert = () => {
          if (!weatherData) return null;
          const { current, disaster, weatherWindows } = weatherData;
          const temp = current?.temp ?? 28;
          const windSpeed = current?.windSpeed ?? 12;
          const floodScore = disaster?.floodRiskScore || 0;
          const pop = weatherData.hourly?.[0]?.pop ?? 20;
          const precipitation = current?.precipitation ?? 0;
          const aqiVal = current?.aqi?.value ?? 60;
          const heavyRain = weatherWindows?.find(w => w.type === 'rain' && w.probability >= 80);
          const moderateRain = weatherWindows?.find(w => w.type === 'rain' && w.probability >= 55) || (pop >= 55);

          const lang = ['kn', 'hi', 'te', 'ta', 'mr', 'en'].includes(language) ? language : 'en';

          // 1. 🔴 RED ALERT: Severe Meteorological Hazards (Take Action)
          if (floodScore >= 75 || heavyRain || precipitation >= 30 || temp >= 42 || windSpeed >= 45 || temp <= 4) {
            const badgeTitle = {
              en: '🔴 RED ALERT (Take Action)',
              kn: '🔴 ರೆಡ್ ಅಲರ್ಟ್ (ತಕ್ಷಣ ಕ್ರಮವಹಿಸಿ)',
              hi: '🔴 रेड अलर्ट (सावधान रहें)',
              te: '🔴 రెడ్ అలర్ట్ (తక్షణ చర్యలు)',
              ta: '🔴 ரெட் அலர்ட் (பாதுகாப்பு எச்சரிக்கை)',
              mr: '🔴 रेड अलर्ट (तातडीने सतर्क राहा)'
            }[lang];

            let message = '';
            if (floodScore >= 75) {
              message = {
                en: `[${selectedState}: ${selectedDistrict}] River basin flood risk index at ${floodScore}/100. Severe flash flood red alert active. Avoid riverbanks and low-lying sectors.`,
                kn: `[${selectedState}: ${selectedDistrict}] ನದಿ ಪಾತ್ರದಲ್ಲಿ ಪ್ರವಾಹ ಅಪಾಯ ಸೂಚ್ಯಂಕ ${floodScore}/100 ದಾಖಲಾಗಿದೆ. ತೀವ್ರ ಪ್ರವಾಹ ರೆಡ್ ಅಲರ್ಟ್ ಜಾರಿಯಲ್ಲಿದೆ. ತಗ್ಗು ಪ್ರದೇಶಗಳಿಂದ ದೂರವಿರಿ.`,
                hi: `[${selectedState}: ${selectedDistrict}] नदी बेसिन में बाढ़ जोखिम सूचकांक ${floodScore}/100 दर्ज किया गया है। भीषण बाढ़ रेड अलर्ट सक्रिय। निचले इलाकों से बचें।`,
                te: `[${selectedState}: ${selectedDistrict}] నదీ పరివాహక ప్రాంతంలో వరద ప్రమాద సూచిక ${floodScore}/100 నమోదైంది. తీవ్ర వరద రెడ్ అలర్ట్ జారీ చేయబడింది.`,
                ta: `[${selectedState}: ${selectedDistrict}] ஆற்றுப் படுகையில் வெள்ள அபாயக் குறியீடு ${floodScore}/100 பதிவாகியுள்ளது. தீவிர வெள்ள அபாய ரெட் அலர்ட் விடுக்கப்பட்டுள்ளது.`,
                mr: `[${selectedState}: ${selectedDistrict}] नदी पात्रात पूर धोका निर्देशांक ${floodScore}/100 नोंदवला गेला आहे. तीव्र पूर रेड अलर्ट जारी.`
              }[lang];
            } else if (heavyRain || precipitation >= 30) {
              message = {
                en: `[${selectedState}: ${selectedDistrict}] Extremely heavy rainfall expected (${heavyRain?.probability || 85}% odds). Severe waterlogging watch. Road travel caution.`,
                kn: `[${selectedState}: ${selectedDistrict}] ಭಾರಿ ಮಳೆ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ (ಮಳೆ ಸಾಧ್ಯತೆ ${heavyRain?.probability || 85}%). ರಸ್ತೆ ಜಲಾವೃತ ಮತ್ತು ಗುಡುಗು ಮಿಂಚಿನ ರೆಡ್ ಅಲರ್ಟ್.`,
                hi: `[${selectedState}: ${selectedDistrict}] अत्यंत भारी बारिश की संभावना (${heavyRain?.probability || 85}%). जलभराव और आकाशीय बिजली का रेड अलर्ट।`,
                te: `[${selectedState}: ${selectedDistrict}] అత్యంత భారీ వర్ష సూచన (వర్ష సంభావ్యత ${heavyRain?.probability || 85}%). రోడ్లు జలమయమయ్యే ప్రమాదం.`,
                ta: `[${selectedState}: ${selectedDistrict}] அதீத கனமழை எச்சரிக்கை (மழை வாய்ப்பு ${heavyRain?.probability || 85}%). நீர் தேங்கும் அபாயம்.`,
                mr: `[${selectedState}: ${selectedDistrict}] अति मुसळधार पावसाची शक्यता (${heavyRain?.probability || 85}%). रस्त्यांवर पाणी साचण्याचा रेड अलर्ट.`
              }[lang];
            } else if (temp >= 42) {
              message = {
                en: `[${selectedState}: ${selectedDistrict}] Severe heatwave red alert. Surface temperature at ${temp}°C. Avoid direct sun exposure between 12:00 PM and 04:00 PM.`,
                kn: `[${selectedState}: ${selectedDistrict}] ತೀವ್ರ ಬಿಸಿಗಾಳಿ ರೆಡ್ ಅಲರ್ಟ್. ತಾಪಮಾನ ${temp}°C ತಲುಪಿದೆ. ಮಧ್ಯಾಹ್ನ 12 ರಿಂದ 4 ರವರೆಗೆ ಬಿಸಿಲಿನಲ್ಲಿ ಓಡಾಟ ಬೇಡ.`,
                hi: `[${selectedState}: ${selectedDistrict}] भीषण लू रेड अलर्ट। सतह का तापमान ${temp}°C पहुंच गया है। दोपहर में सीधी धूप से बचें।`,
                te: `[${selectedState}: ${selectedDistrict}] తీవ్ర వడగాల్పుల రెడ్ అలర్ట్. ఉష్ణోగ్రత ${temp}°C కి చేరింది. మధ్యాహ్నం ఎండలో తిరగవద్దు.`,
                ta: `[${selectedState}: ${selectedDistrict}] தீவிர அனல்காற்று ரெட் அலர்ட். வெப்பநிலை ${temp}°C எட்டியுள்ளது. பிற்பகல் நேரங்களில் வெயிலில் செல்ல வேண்டாம்.`,
                mr: `[${selectedState}: ${selectedDistrict}] तीव्र उष्णतेची लाट रेड अलर्ट. तापमान ${temp}°C वर पोहोचले आहे. दुपारच्या उन्हात बाहेर पडणे टाळा.`
              }[lang];
            } else if (windSpeed >= 45) {
              message = {
                en: `[${selectedState}: ${selectedDistrict}] High gale winds at ${windSpeed} km/h. Danger of falling trees and loose overhead cables. Secure outdoor equipment.`,
                kn: `[${selectedState}: ${selectedDistrict}] ಬಿರುಗಾಳಿ ವೇಗ ${windSpeed} km/h ದಾಖಲಾಗಿದೆ. ಮರಗಳು ಮತ್ತು ವಿದ್ಯುತ್ ಕಂಬಗಳ ಬಳಿ ಎಚ್ಚರ ವಹಿಸಿ.`,
                hi: `[${selectedState}: ${selectedDistrict}] तेज आंधी की गति ${windSpeed} किमी/घंटा। पेड़ों और बिजली के तारों से दूर रहें।`,
                te: `[${selectedState}: ${selectedDistrict}] బలమైన ఈదురు గాలులు ${windSpeed} కి.మీ/గం. చెట్లు మరియు విద్యుత్ లైన్ల వద్ద జాగ్రత్తగా ఉండండి.`,
                ta: `[${selectedState}: ${selectedDistrict}] பலத்த சூறாவளி காற்று ${windSpeed} கிமீ/மணி. மரங்கள் மற்றும் மின் கம்பிகள் அருகில் எச்சரிக்கையாக இருக்கவும்.`,
                mr: `[${selectedState}: ${selectedDistrict}] वादळी वाऱ्याचा वेग ${windSpeed} किमी/तास. झाडे आणि विजेच्या तारांपासून सावध राहा.`
              }[lang];
            } else {
              message = {
                en: `[${selectedState}: ${selectedDistrict}] Severe cold wave red alert. Temperature dropped to ${temp}°C. Hypothermia advisory in effect.`,
                kn: `[${selectedState}: ${selectedDistrict}] ತೀವ್ರ ಶೀತಗಾಳಿ ರೆಡ್ ಅಲರ್ಟ್. ತಾಪಮಾನ ${temp}°C ಗೆ ಇಳಿದಿದೆ. ಶೀತದಿಂದ ರಕ್ಷಣೆ ಪಡೆಯಿರಿ.`,
                hi: `[${selectedState}: ${selectedDistrict}] भीषण शीतलहर रेड अलर्ट। तापमान ${temp}°C तक गिर गया है। ठंड से बचाव करें।`,
                te: `[${selectedState}: ${selectedDistrict}] తీవ్ర శీతల గాలుల రెಡ್ అలర్ట్. ఉష్ణోగ్రత ${temp}°C కి పడిపోయింది.`,
                ta: `[${selectedState}: ${selectedDistrict}] கடும் குளிர் அலை ரெட் அலர்ட். வெப்பநிலை ${temp}°C ஆக குறைந்துள்ளது.`,
                mr: `[${selectedState}: ${selectedDistrict}] तीव्र थंडीची लाट रेड अलर्ट. तापमान ${temp}°C पर्यंत घसरले आहे.`
              }[lang];
            }

            return {
              level: 'red',
              badge: badgeTitle,
              message,
              bgClass: 'bg-gradient-to-r from-rose-950/95 via-red-900/90 to-rose-950/95 border-rose-500/50',
              badgeClass: 'bg-rose-500/30 text-rose-200 border-rose-500/60 shadow-rose-500/20',
              textClass: 'text-rose-100'
            };
          }

          // 2. 🟠 ORANGE ALERT: Moderate-Severe Hazards (Be Prepared)
          if (floodScore >= 45 || moderateRain || precipitation >= 8 || (temp >= 38 && temp < 42) || (windSpeed >= 28 && windSpeed < 45) || aqiVal >= 200 || (temp <= 8 && temp > 4)) {
            const badgeTitle = {
              en: '🟠 ORANGE ALERT (Be Prepared)',
              kn: '🟠 ಆರೆಂಜ್ ಅಲರ್ಟ್ (ಸಿದ್ಧರಾಗಿರಿ)',
              hi: '🟠 ऑरेंज अलर्ट (तैयार रहें)',
              te: '🟠 ఆరెంజ్ అలర్ట్ (సిద్ధంగా ఉండండి)',
              ta: '🟠 ஆரஞ்சு அலர்ட் (தயாராக இருங்கள்)',
              mr: '🟠 ऑरेंज अलर्ट (तयार राहा)'
            }[lang];

            let message = '';
            if (moderateRain || precipitation >= 8) {
              message = {
                en: `[${selectedState}: ${selectedDistrict}] Moderate to heavy rainfall likely (${pop}% odds, ${precipitation}mm). Be prepared for localized waterlogging and traffic delays.`,
                kn: `[${selectedState}: ${selectedDistrict}] ಸಾಧಾರಣದಿಂದ ಭಾರಿ ಮಳೆ ಸಂಭವನೀಯತೆ (${pop}%, ${precipitation}mm). ಸ್ಥಳೀಯ ಜಲಾವೃತ ಮತ್ತು ಸಂಚಾರ ವ್ಯತ್ಯಯಕ್ಕೆ ಸಿದ್ಧರಾಗಿರಿ.`,
                hi: `[${selectedState}: ${selectedDistrict}] मध्यम से भारी बारिश की संभावना (${pop}%, ${precipitation}मिमी)। यातायात में रुकावट के लिए तैयार रहें।`,
                te: `[${selectedState}: ${selectedDistrict}] మోస్తరు నుండి భారీ వర్ష సూచన (${pop}%, ${precipitation}మి.మీ). ట్రాఫిక్ అంతరాయాలకు సిద్ధంగా ఉండండి.`,
                ta: `[${selectedState}: ${selectedDistrict}] மிதமான முதல் கனமழை வாய்ப்பு (${pop}%, ${precipitation}மிமீ). நீர் தேங்கும் பகுதிகளுக்கு தயாராக இருங்கள்.`,
                mr: `[${selectedState}: ${selectedDistrict}] मध्यम ते मुसळधार पावसाची शक्यता (${pop}%, ${precipitation}मिमी). खबरदारी बाळगा.`
              }[lang];
            } else if (temp >= 38) {
              message = {
                en: `[${selectedState}: ${selectedDistrict}] Elevated heat conditions (${temp}°C). Stay hydrated, avoid excessive afternoon exertion, and monitor updates.`,
                kn: `[${selectedState}: ${selectedDistrict}] ತಾಪಮಾನ ಹೆಚ್ಚಳ (${temp}°C). ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ ಮತ್ತು ಮಧ್ಯಾಹ್ನದ ಬಿಸಿಲಿನಲ್ಲಿ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸಿ.`,
                hi: `[${selectedState}: ${selectedDistrict}] बढ़ता तापमान (${temp}°C)। पर्याप्त पानी पिएं और दोपहर में सीधी धूप से बचें।`,
                te: `[${selectedState}: ${selectedDistrict}] పెరుగుతున్న ఉష్ణోగ్రత (${temp}°C). తగినంత నీరు త్రాగండి మరియు అప్రమత్తంగా ఉండండి.`,
                ta: `[${selectedState}: ${selectedDistrict}] வெப்பம் அதிகரிப்பு (${temp}°C). நீர்ச்சத்து குறையாமல் பார்த்துக் கொள்ளவும்.`,
                mr: `[${selectedState}: ${selectedDistrict}] वाढते तापमान (${temp}°C). पुरेसे पाणी प्या आणि काळजी घ्या.`
              }[lang];
            } else if (windSpeed >= 28) {
              message = {
                en: `[${selectedState}: ${selectedDistrict}] Gusty surface winds at ${windSpeed} km/h. Exercise caution during outdoor commutes and high-speed highway transit.`,
                kn: `[${selectedState}: ${selectedDistrict}] ಬಿರುಗಾಳಿ ಬೀಸುವ ಸಾಧ್ಯತೆ (${windSpeed} km/h). ರಸ್ತೆ ಪ್ರಯಾಣ ಮತ್ತು ವಾಹನ ಚಾಲನೆಯಲ್ಲಿ ಜಾಗರೂಕರಾಗಿರಿ.`,
                hi: `[${selectedState}: ${selectedDistrict}] तेज हवाएं (${windSpeed} किमी/घंटा)। यात्रा के दौरान सावधानी बरतें।`,
                te: `[${selectedState}: ${selectedDistrict}] ఈదురు గాలులు (${windSpeed} కి.మీ/గం). ప్రయాణంలో జాగ్రత్త వహించండి.`,
                ta: `[${selectedState}: ${selectedDistrict}] பலத்த காற்று (${windSpeed} கிமீ/மணி). பயணத்தின் போது எச்சரிக்கையாக இருக்கவும்.`,
                mr: `[${selectedState}: ${selectedDistrict}] सोसाट्याचा वारा (${windSpeed} किमी/तास). प्रवासात काळजी घ्या.`
              }[lang];
            } else if (aqiVal >= 200) {
              message = {
                en: `[${selectedState}: ${selectedDistrict}] Unhealthy air quality (AQI ${aqiVal}). Sensitive groups and senior citizens advised to use protective N95 masks outdoors.`,
                kn: `[${selectedState}: ${selectedDistrict}] ವಾಯು ಗುಣಮಟ್ಟ ಕಳಪೆ (AQI ${aqiVal}). ಉಸಿರಾಟದ ಸಮಸ್ಯೆ ಇರುವವರು ಮತ್ತು ಹಿರಿಯರು ಮಾಸ್ಕ್ ಧರಿಸಲು ಸಲಹೆ.`,
                hi: `[${selectedState}: ${selectedDistrict}] खराब वायु गुणवत्ता (AQI ${aqiVal})। संवेदनशील लोग मास्क का उपयोग करें।`,
                te: `[${selectedState}: ${selectedDistrict}] గాలి నాణ్యత క్షీణత (AQI ${aqiVal}). శ్వాసకోశ సమస్యలు ఉన్నవారు మాస్క్ ధరించండి.`,
                ta: `[${selectedState}: ${selectedDistrict}] காற்றின் தரம் மோசம் (AQI ${aqiVal}). முகக்கவசம் அணியவும்.`,
                mr: `[${selectedState}: ${selectedDistrict}] हवेची गुणवत्ता खालावली (AQI ${aqiVal}). मास्कचा वापर करा.`
              }[lang];
            } else {
              message = {
                en: `[${selectedState}: ${selectedDistrict}] Catchment runoff warning. River basin score at ${floodScore}/100. Be prepared for localized drain overflows.`,
                kn: `[${selectedState}: ${selectedDistrict}] ನದಿ ಪಾತ್ರದಲ್ಲಿ ನೀರಿನ ಮಟ್ಟ ಹೆಚ್ಚಳ (ಸೂಚ್ಯಂಕ ${floodScore}/100). ಜಲಮೂಲಗಳ ಬಳಿ ಜಾಗರೂಕರಾಗಿರಿ.`,
                hi: `[${selectedState}: ${selectedDistrict}] नदी बेसिन में जलस्तर वृद्धि (सूचकांक ${floodScore}/100)। जलस्रोतों के पास सतर्क रहें।`,
                te: `[${selectedState}: ${selectedDistrict}] నదీ పరివాహక ప్రాంతంలో నీటి ప్రవాహం పెరుగుదల (సూచిక ${floodScore}/100).`,
                ta: `[${selectedState}: ${selectedDistrict}] நீர்வரத்து அதிகரிப்பு (குறியீடு ${floodScore}/100). நீர்நிலைகள் அருகில் எச்சரிக்கையாக இருக்கவும்.`,
                mr: `[${selectedState}: ${selectedDistrict}] नदी पात्रातील पाणी पातळीत वाढ (निर्देशांक ${floodScore}/100). खबरदारी घ्या.`
              }[lang];
            }

            return {
              level: 'orange',
              badge: badgeTitle,
              message,
              bgClass: 'bg-gradient-to-r from-amber-950/95 via-orange-950/90 to-amber-950/95 border-amber-500/50',
              badgeClass: 'bg-amber-500/30 text-amber-200 border-amber-500/60 shadow-amber-500/20',
              textClass: 'text-amber-100'
            };
          }

          // 3. 🟢 GREEN ALERT: Normal / Safe Weather Conditions (No Warning Active)
          const greenBadge = {
            en: '🟢 GREEN ALERT (Normal Weather)',
            kn: '🟢 ಗ್ರೀನ್ ಅಲರ್ಟ್ (ಸುರಕ್ಷಿತ ವಾತಾವರಣ)',
            hi: '🟢 ग्रीन अलर्ट (सामान्य मौसम)',
            te: '🟢 గ్రీన్ అలర్ట్ (సాధారణ వాతావరణం)',
            ta: '🟢 கிரீன் அலர்ட் (இயல்பான வானிலை)',
            mr: '🟢 ग्रीन अलर्ट (सामान्य हवामान)'
          }[lang];

          const greenMessage = {
            en: `[${selectedState}: ${selectedDistrict}] Normal Weather: Conditions safe for agriculture, transportation, and outdoor activities. No severe weather warning active (Temp: ${temp}°C, Humidity: ${current?.humidity ?? 48}%, Wind: ${windSpeed} km/h, Rain Prob: ${pop}%).`,
            kn: `[${selectedState}: ${selectedDistrict}] ಸಹಜ ವಾತಾವರಣ: ಕೃಷಿ, ಸಾರಿಗೆ ಮತ್ತು ಹೊರಾಂಗಣ ಚಟುವಟಿಕೆಗಳಿಗೆ ಸೂಕ್ತ ಮತ್ತು ಸುರಕ್ಷಿತ. ಯಾವುದೇ ತೀವ್ರ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ ಇಲ್ಲ (ತಾಪಮಾನ: ${temp}°C, ಆರ್ದ್ರತೆ: ${current?.humidity ?? 48}%, ಗಾಳಿ: ${windSpeed} km/h, ಮಳೆ ಸಾಧ್ಯತೆ: ${pop}%).`,
            hi: `[${selectedState}: ${selectedDistrict}] सामान्य मौसम: कृषि, परिवहन और बाहरी गतिविधियों के लिए अनुकूल स्थिति। कोई गंभीर मौसम चेतावनी नहीं (तापमान: ${temp}°C, आर्द्रता: ${current?.humidity ?? 48}%, हवा: ${windSpeed} किमी/घंटा)।`,
            te: `[${selectedState}: ${selectedDistrict}] సాధారణ వాతావరణం: వ్యవసాయం, రవాణా మరియు బాహ్య కార్యకలాపాలకు అనుకూలమైన వాతావరణం. ఎటువంటి తీవ్ర హెచ్చరికలు లేవు (ఉష్ణోగ్రత: ${temp}°C, తేమ: ${current?.humidity ?? 48}%).`,
            ta: `[${selectedState}: ${selectedDistrict}] இயல்பான வானிலை: விவசாயம் மற்றும் பயணங்களுக்கு உகந்த நிலை. எந்தவொரு தீவிர வானிலை எச்சரிக்கையும் இல்லை (வெப்பநிலை: ${temp}°C, காற்றின் ஈரப்பதம்: ${current?.humidity ?? 48}%).`,
            mr: `[${selectedState}: ${selectedDistrict}] सामान्य हवामान: शेती, वाहतूक आणि बाहेरील कामांसाठी अनुकूल परिस्थिती. कोणताही गंभीर हवामान इशारा नाही (तापमान: ${temp}°C, आर्द्रता: ${current?.humidity ?? 48}%, वारा: ${windSpeed} किमी/तास).`
          }[lang];

          return {
            level: 'green',
            badge: greenBadge,
            message: greenMessage,
            bgClass: 'bg-gradient-to-r from-emerald-950/90 via-slate-900/90 to-emerald-950/90 border-emerald-500/40',
            badgeClass: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20',
            textClass: 'text-emerald-100'
          };
        };

        const liveAlert = getLiveDistrictAlert();
        if (!liveAlert) return null;

        return (
          <div className={`w-full ${liveAlert.bgClass} border-b px-3 lg:px-6 py-2 flex items-center justify-between overflow-hidden shadow-lg animate-fadeIn`}>
            <div className={`flex items-center space-x-2 shrink-0 ${liveAlert.badgeClass} px-2.5 py-1 rounded-lg border mr-3`}>
              {liveAlert.level === 'red' && <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />}
              {liveAlert.level === 'orange' && <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />}
              {liveAlert.level === 'green' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase whitespace-nowrap">
                {liveAlert.badge}
              </span>
            </div>

            <div className="overflow-hidden whitespace-nowrap flex-1">
              <div className={`animate-marquee inline-block text-xs ${liveAlert.textClass} tracking-wide`}>
                <span>{liveAlert.message}</span>
              </div>
            </div>
          </div>
        );
      })()}
    </header>
  );
}
