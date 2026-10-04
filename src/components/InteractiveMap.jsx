import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Play, 
  Pause, 
  CloudRain, 
  Flame, 
  Activity, 
  CheckCircle2, 
  ThumbsUp, 
  MapPin,
  Compass,
  Layers,
  ExternalLink,
  Crosshair
} from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

// Fix Leaflet's default icon path issues in bundled environments
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// High-precision Tile Server Definitions
const MAP_PROVIDERS = {
  roadmap: {
    name: 'Google Maps',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '© Google Maps',
    maxZoom: 20
  },
  satellite: {
    name: 'Google Satellite',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '© Google Maps Satellite Imagery',
    maxZoom: 20
  },
  terrain: {
    name: 'Google Terrain',
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    attribution: '© Google Maps Physical Terrain',
    maxZoom: 20
  },
  dark: {
    name: 'Dark Radar',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri, HERE, Garmin',
    maxZoom: 16
  }
};

export default function InteractiveMap({ weatherData, language, onLocationChange }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const currentTileLayerRef = useRef(null);
  const districtMarkerRef = useRef(null);
  const userGpsMarkerRef = useRef(null);
  const radarOverlayRef = useRef(null);

  const [mapStyle, setMapStyle] = useState('roadmap'); // 'roadmap', 'satellite', 'terrain', 'dark'
  const [activeWeatherLayer, setActiveWeatherLayer] = useState('radar'); // 'radar', 'temp', 'aqi', 'none'
  const [timeOffset, setTimeOffset] = useState(0); // -2 to +2 hours
  const [isPlaying, setIsPlaying] = useState(false);
  const [spotterFeedback, setSpotterFeedback] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      } catch (e) {
        // ignore
      }
    }

    if (mapContainerRef.current._leaflet_id) {
      delete mapContainerRef.current._leaflet_id;
    }

    const initialLat = weatherData?.profile?.lat || 15.8497;
    const initialLng = weatherData?.profile?.lng || 74.4977;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 11, // Google Maps city/district resolution
      minZoom: 4,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: false
    });

    // Add Base Tile Layer (Default: Google Maps Roadmap)
    const provider = MAP_PROVIDERS[mapStyle] || MAP_PROVIDERS.roadmap;
    const tileLayer = L.tileLayer(provider.url, {
      maxZoom: provider.maxZoom,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    currentTileLayerRef.current = tileLayer;

    // Zoom control on top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    // Invalidate size to guarantee crisp rendering
    const timer1 = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 150);

    const timer2 = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 450);

    const handleResize = () => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // 2. Switch Map Tile Layers (Google Roads, Satellite, Terrain, Dark)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const provider = MAP_PROVIDERS[mapStyle] || MAP_PROVIDERS.roadmap;
    const newTileLayer = L.tileLayer(provider.url, {
      maxZoom: provider.maxZoom,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    // If using dark theme, also add borders reference layer for maximum crispness
    if (mapStyle === 'dark') {
      const refLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        opacity: 0.9
      }).addTo(map);
      currentTileLayerRef.current = L.layerGroup([newTileLayer, refLayer]).addTo(map);
    } else {
      currentTileLayerRef.current = newTileLayer;
    }
  }, [mapStyle]);

  // 3. Update District Pin and Fly directly to Exact Location (Zoom 11)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !weatherData) return;

    const lat = weatherData.profile.lat;
    const lng = weatherData.profile.lng;

    // Fly to the exact GPS location with smooth Google Maps camera transition
    map.flyTo([lat, lng], 11, {
      animate: true,
      duration: 1.2
    });

    // Remove previous district marker
    if (districtMarkerRef.current) {
      map.removeLayer(districtMarkerRef.current);
    }

    // Google Maps Authentic Red Marker Pin with pulsing radar ring
    const googlePinIcon = L.divIcon({
      className: 'google-maps-pin-container',
      html: `
        <div style="position: relative; width: 34px; height: 42px; display: flex; flex-direction: column; align-items: center; cursor: pointer; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.45));">
          <!-- Pulse Ring -->
          <div style="position: absolute; bottom: 0; width: 18px; height: 8px; border-radius: 50%; background: rgba(234, 67, 53, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          
          <!-- Google Maps Classic Teardrop Pin -->
          <svg viewBox="0 0 24 24" width="34" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.373 0 0 5.373 0 12C0 19.5 10.5 32 12 32C13.5 32 24 19.5 24 12C24 5.373 18.627 0 12 0Z" fill="#EA4335"/>
            <path d="M12 0C5.373 0 0 5.373 0 12C0 14.5 1.5 17.5 3.5 20.5L12 32L20.5 20.5C22.5 17.5 24 14.5 24 12C24 5.373 18.627 0 12 0Z" fill="url(#pinGradient)"/>
            <circle cx="12" cy="11" r="5" fill="#FFFFFF"/>
            <circle cx="12" cy="11" r="2.8" fill="#B31412"/>
            <defs>
              <linearGradient id="pinGradient" x1="0" y1="0" x2="24" y2="32" gradientUnits="userSpaceOnUse">
                <stop stop-color="#FF5252"/>
                <stop offset="1" stop-color="#C5221F"/>
              </linearGradient>
            </defs>
          </svg>

          <!-- Floating Info Pill -->
          <div style="position: absolute; top: -30px; white-space: nowrap; padding: 3px 8px; border-radius: 6px; background: rgba(15, 23, 42, 0.95); color: #f8fafc; font-family: system-ui, sans-serif; font-size: 11px; font-weight: 700; border: 1px solid rgba(234, 67, 53, 0.6); box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
            📍 ${weatherData.district}: ${weatherData.current.temp}°C
          </div>
        </div>
      `,
      iconSize: [34, 42],
      iconAnchor: [17, 42],
      popupAnchor: [0, -42]
    });

    const gmapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

    const marker = L.marker([lat, lng], { icon: googlePinIcon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 13px; line-height: 1.5; padding: 6px; color: #1e293b; min-width: 220px;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
          <div>
            <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0;">${weatherData.district}</h4>
            <span style="font-size: 11px; color: #64748b;">${weatherData.state}, India</span>
          </div>
          <span style="background: #eff6ff; color: #2563eb; font-weight: 700; font-size: 12px; padding: 2px 6px; border-radius: 4px; border: 1px solid #bfdbfe;">
            ${weatherData.current.temp}°C
          </span>
        </div>

        <div style="font-size: 12px; color: #334155; margin-bottom: 8px;">
          <div style="margin-bottom: 3px;">🛰️ <strong>GPS:</strong> ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E</div>
          <div style="margin-bottom: 3px;">🌤️ <strong>Condition:</strong> ${weatherData.current.condition.desc}</div>
          <div style="margin-bottom: 3px;">💧 <strong>Humidity:</strong> ${weatherData.current.humidity}% | 💨 <strong>Wind:</strong> ${weatherData.current.windSpeed} km/h</div>
          <div>🌧️ <strong>Precipitation Odds:</strong> ${weatherData.hourly[0]?.pop || 20}%</div>
        </div>

        <a 
          href="${gmapsUrl}" 
          target="_blank" 
          rel="noopener noreferrer" 
          style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 6px 10px; border-radius: 6px; background: #2563eb; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"
        >
          <span>Open in Google Maps</span>
          <span>↗</span>
        </a>
      </div>
    `);

    // Open popup initially so the user immediately sees the verified GPS coordinates
    marker.openPopup();
    districtMarkerRef.current = marker;

  }, [weatherData]);

  // 4. Weather Overlays (Radar, Heatmap, AQI)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !weatherData) return;

    if (radarOverlayRef.current) {
      map.removeLayer(radarOverlayRef.current);
    }

    if (activeWeatherLayer === 'none') return;

    const overlayGroup = L.layerGroup();
    const lat = weatherData.profile.lat;
    const lng = weatherData.profile.lng;

    const shiftLat = timeOffset * 0.05;
    const shiftLng = timeOffset * 0.08;

    if (activeWeatherLayer === 'radar') {
      const radarEchoes = [
        { lat: lat + shiftLat, lng: lng + shiftLng, radius: 25000, color: '#06b6d4', opacity: 0.45 },
        { lat: lat + 0.15 + shiftLat, lng: lng - 0.12 + shiftLng, radius: 18000, color: '#0284c7', opacity: 0.5 },
        { lat: lat - 0.12 + shiftLat, lng: lng + 0.15 + shiftLng, radius: 30000, color: '#06b6d4', opacity: 0.4 },
      ];

      radarEchoes.forEach(pt => {
        L.circle([pt.lat, pt.lng], {
          radius: pt.radius,
          color: pt.color,
          fillColor: pt.color,
          fillOpacity: pt.opacity,
          weight: 1.5
        }).addTo(overlayGroup);
      });
    } else if (activeWeatherLayer === 'temp') {
      const tempZones = [
        { lat: lat, lng: lng, radius: 40000, color: '#f59e0b', opacity: 0.35 }
      ];
      tempZones.forEach(pt => {
        L.circle([pt.lat, pt.lng], {
          radius: pt.radius,
          color: pt.color,
          fillColor: pt.color,
          fillOpacity: pt.opacity,
          weight: 0
        }).addTo(overlayGroup);
      });
    } else if (activeWeatherLayer === 'aqi') {
      const aqiVal = weatherData.current.aqi?.value || 65;
      const aqiColor = aqiVal > 150 ? '#ef4444' : aqiVal > 100 ? '#f59e0b' : '#10b981';
      L.circle([lat, lng], {
        radius: 30000,
        color: aqiColor,
        fillColor: aqiColor,
        fillOpacity: 0.4,
        weight: 1.5
      }).addTo(overlayGroup);
    }

    overlayGroup.addTo(map);
    radarOverlayRef.current = overlayGroup;

  }, [activeWeatherLayer, timeOffset, weatherData]);

  // 5. Time Slider Playback Loop
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeOffset((prev) => (prev >= 2 ? -2 : prev + 1));
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // 6. Native Browser GPS Geolocation (Google Blue Dot)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        const map = mapInstanceRef.current;
        if (!map) return;

        // Fly directly to user's exact coordinates at high zoom (zoom 14)
        map.flyTo([latitude, longitude], 14, {
          animate: true,
          duration: 1.5
        });

        // Remove old GPS marker if any
        if (userGpsMarkerRef.current) {
          map.removeLayer(userGpsMarkerRef.current);
        }

        // Iconic Google Maps Pulsing Blue Location Dot
        const blueDotIcon = L.divIcon({
          className: 'google-blue-dot-container',
          html: `
            <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: rgba(66, 133, 244, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 14px; height: 14px; border-radius: 50%; background: #4285F4; border: 2.5px solid #FFFFFF; box-shadow: 0 0 10px rgba(66, 133, 244, 0.8);"></div>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const gpsMarker = L.marker([latitude, longitude], { icon: blueDotIcon }).addTo(map);
        const circle = L.circle([latitude, longitude], {
          radius: Math.min(accuracy, 200),
          color: '#4285F4',
          fillColor: '#4285F4',
          fillOpacity: 0.15,
          weight: 1
        }).addTo(map);

        const gpsGroup = L.layerGroup([gpsMarker, circle]).addTo(map);
        userGpsMarkerRef.current = gpsGroup;

        gpsMarker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 12px; padding: 4px; color: #1e293b;">
            <strong style="color: #4285F4; font-size: 13px;">📍 Your Exact Device Location</strong><br/>
            <span>Lat: ${latitude.toFixed(5)}° N</span><br/>
            <span>Lng: ${longitude.toFixed(5)}° E</span><br/>
            <span style="font-size: 11px; color: #64748b;">GPS Accuracy: ±${Math.round(accuracy)}m</span>
          </div>
        `).openPopup();
      },
      (err) => {
        setIsLocating(false);
        console.warn("GPS Location error:", err.message);
        setGpsError(err.code === 1 ? "Location permission denied" : "Unable to retrieve device GPS");
        setTimeout(() => setGpsError(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSpotterClick = (isRaining) => {
    setSpotterFeedback(isRaining ? 'yes' : 'no');
  };

  const getTimeOffsetLabel = (offset) => {
    if (offset === 0) return t.nowcastLive || 'Live Nowcast';
    if (offset > 0) return `+${offset}h (${t.predictiveForecast || 'Predictive Radar'})`;
    return `${offset}h (${t.historicalRadar || 'Historical Radar'})`;
  };

  return (
    <div className="p-4 lg:p-6 rounded-2xl glass-panel space-y-4">
      
      {/* Map Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-bold font-display text-slate-100 flex items-center space-x-2">
              <span>{t.interactiveMap}</span>
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Google Maps Engine</span>
            </span>
            {(weatherData?.isCachedOffline || (typeof navigator !== 'undefined' && !navigator.onLine)) && (
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                📡 Offline Spatial Pin
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Exact Location: <span className="text-cyan-300 font-mono font-semibold">{weatherData?.district}, {weatherData?.state}</span> ({weatherData?.profile?.lat?.toFixed(4)}° N, {weatherData?.profile?.lng?.toFixed(4)}° E)
          </p>
        </div>

        {/* Map Style & Layer Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Google Maps Base Provider Toggle */}
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
            <button
              onClick={() => setMapStyle('roadmap')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                mapStyle === 'roadmap'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Google Maps Standard Roads"
            >
              🗺️ Roadmap
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                mapStyle === 'satellite'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Google Satellite Hybrid"
            >
              🛰️ Satellite
            </button>
            <button
              onClick={() => setMapStyle('terrain')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                mapStyle === 'terrain'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Google Physical Terrain"
            >
              ⛰️ Terrain
            </button>
            <button
              onClick={() => setMapStyle('dark')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                mapStyle === 'dark'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dark Radar Mode"
            >
              🌙 Dark
            </button>
          </div>

          {/* GPS "Locate Me" Button */}
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              isLocating
                ? 'bg-blue-500/20 text-blue-300 border-blue-400/40 animate-pulse'
                : 'bg-slate-900/90 hover:bg-slate-800 text-blue-400 border-blue-500/30 hover:border-blue-400'
            }`}
            title="Locate my device on Google Maps"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : '🎯 My GPS'}</span>
          </button>

          {/* Open in Google Maps External Link */}
          {weatherData?.profile?.lat && (
            <a
              href={`https://www.google.com/maps?q=${weatherData.profile.lat},${weatherData.profile.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all"
              title="Verify location in Google Maps app"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Google Maps</span>
            </a>
          )}

        </div>
      </div>

      {gpsError && (
        <div className="px-3 py-1.5 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg animate-fadeIn">
          ⚠️ {gpsError}
        </div>
      )}

      {/* Map Canvas Container */}
      <div 
        className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl w-full z-10"
        style={{ minHeight: '460px', height: '460px', background: '#0b0f19' }}
      >
        <div 
          ref={mapContainerRef} 
          style={{ width: '100%', height: '100%', minHeight: '460px', background: '#0b0f19' }} 
        />

        {/* Floating Weather Overlay Toggles (Top Left) */}
        <div className="absolute top-3 left-3 z-[1000] flex items-center space-x-1 p-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 shadow-xl">
          <button
            onClick={() => setActiveWeatherLayer(activeWeatherLayer === 'radar' ? 'none' : 'radar')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeWeatherLayer === 'radar'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Radar</span>
          </button>

          <button
            onClick={() => setActiveWeatherLayer(activeWeatherLayer === 'temp' ? 'none' : 'temp')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeWeatherLayer === 'temp'
                ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Heat</span>
          </button>

          <button
            onClick={() => setActiveWeatherLayer(activeWeatherLayer === 'aqi' ? 'none' : 'aqi')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeWeatherLayer === 'aqi'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>AQI</span>
          </button>
        </div>

        {/* Floating Playback Controls Overlay on Map (Bottom) */}
        <div className="absolute bottom-3 left-3 right-3 z-[1000] p-2.5 sm:p-3 rounded-xl glass-panel-glow bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-all border border-cyan-500/40"
              title={isPlaying ? "Pause Timeline" : "Play Timeline"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
                {t.timeSlider}
              </div>
              <div className="text-xs font-mono font-bold text-cyan-300">
                {getTimeOffsetLabel(timeOffset)}
              </div>
            </div>
          </div>

          {/* Time Slider */}
          <div className="flex items-center space-x-2 flex-1 max-w-xs sm:mx-4">
            <span className="text-[10px] font-mono text-slate-400">-2h</span>
            <input
              type="range"
              min="-2"
              max="2"
              step="1"
              value={timeOffset}
              onChange={(e) => {
                setTimeOffset(parseInt(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-[10px] font-mono text-slate-400">+2h</span>
          </div>

          <div className="text-[10px] font-mono text-slate-400 hidden md:block">
            📍 City Resolution: Level 11 Zoom
          </div>

        </div>
      </div>

      {/* Crowdsourced "Weather Spotter" Ground-Truth Widget */}
      <div className="p-4 rounded-xl glass-panel-subtle border-cyan-500/20 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 text-left w-full sm:w-auto">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
            <ThumbsUp className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-bold text-xs text-slate-200">
              {t.weatherSpotter}: <span className="text-cyan-300">{weatherData?.district}</span>
            </h5>
            <p className="text-[11px] text-slate-400">
              {t.spotterQuestion}
            </p>
          </div>
        </div>

        {spotterFeedback ? (
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.spotterThanks}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => handleSpotterClick(true)}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all"
            >
              {t.spotterYes}
            </button>
            <button
              onClick={() => handleSpotterClick(false)}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
            >
              {t.spotterNo}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
