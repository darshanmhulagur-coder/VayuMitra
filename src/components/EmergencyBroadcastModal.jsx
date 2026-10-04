import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  ExternalLink, 
  Flame, 
  Droplets, 
  Snowflake, 
  Wind,
  Layers,
  ChevronRight
} from 'lucide-react';
import { NATIONAL_EMERGENCY_ALERTS } from '../data/emergencyAlerts';

export default function EmergencyBroadcastModal({ isOpen, onClose, onSelectDistrict }) {
  const [activeCategory, setActiveCategory] = useState('ALL');

  if (!isOpen) return null;

  const categories = [
    { id: 'ALL', label: 'All Emergencies (13)' },
    { id: 'FLOOD', label: '🌊 Floods & Landslides' },
    { id: 'HEATWAVE', label: '🔥 Extreme Heatwaves' },
    { id: 'COLD', label: '❄️ Winter & Dense Fog' },
    { id: 'CYCLONE', label: '🌀 Cyclonic Storms' }
  ];

  const filteredAlerts = NATIONAL_EMERGENCY_ALERTS.filter(alert => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'FLOOD') return alert.category.includes('FLOOD');
    if (activeCategory === 'HEATWAVE') return alert.category === 'HEATWAVE';
    if (activeCategory === 'COLD') return alert.category.includes('COLD');
    if (activeCategory === 'CYCLONE') return alert.category === 'CYCLONE';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl glass-panel-glow bg-slate-900/95 border border-amber-500/40 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-amber-950/40 via-rose-950/40 to-slate-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-extrabold text-slate-100 font-display">
                  National Disaster & Extreme Climate Intelligence
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  LIVE IMD / NDMA FEED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Verified meteorological hazards across all Indian States & Districts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Category Chips */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/50 flex items-center space-x-2 overflow-x-auto scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 glass-panel-subtle'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Alerts Grid List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {filteredAlerts.map(alert => {
            const isRed = alert.severity === 'RED';
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all hover:border-cyan-500/50 ${
                  isRed 
                    ? 'border-rose-500/40 bg-rose-950/15' 
                    : 'border-amber-500/40 bg-amber-950/15'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold text-xs tracking-wider font-mono">
                      {alert.type}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-cyan-300 font-mono">
                      📍 {alert.state}: {alert.district}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    Season: <strong className="text-slate-200">{alert.season}</strong>
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  <h4 className="text-sm font-bold text-slate-100 leading-snug">
                    {alert.headline}
                  </h4>
                  <p className="text-xs text-slate-300/90 leading-relaxed">
                    {alert.details}
                  </p>
                  
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-amber-200/90 font-mono">
                    ⚠️ <strong>Advisory:</strong> {alert.precautions}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    Control: <strong className="text-slate-200">{alert.helpline}</strong>
                  </span>

                  <button
                    onClick={() => {
                      onSelectDistrict(alert.state, alert.district);
                      onClose();
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all"
                  >
                    <span>Load {alert.district} Telemetry</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Official Sync: IMD National Cyclone Warning Centre & CWC Flood Telemetry</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
          >
            Close Feed
          </button>
        </div>

      </div>
    </div>
  );
}
