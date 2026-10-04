import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Calendar, Clock, CloudRain, Sun, Cloud, Thermometer, Wind } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ForecastCharts({ weatherData, language, isFahrenheit }) {
  const [activeMetric, setActiveMetric] = useState('temp'); // 'temp', 'pop', 'cloud'
  const [forecastTab, setForecastTab] = useState('hourly'); // 'hourly' or 'daily'
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  if (!weatherData) return null;

  const { hourly, daily } = weatherData;

  const toDisplayTemp = (celsius) => {
    return isFahrenheit ? Math.round((celsius * 9/5) + 32) : celsius;
  };

  // Hourly Chart Data
  const hourlyLabels = hourly.slice(0, 16).map(h => h.time);
  const hourlyTemps = hourly.slice(0, 16).map(h => toDisplayTemp(h.temp));
  const hourlyPops = hourly.slice(0, 16).map(h => h.pop);
  const hourlyClouds = hourly.slice(0, 16).map(h => h.cloudCover);

  const chartData = {
    labels: hourlyLabels,
    datasets: [
      activeMetric === 'temp' && {
        label: `${t.temperature} (${isFahrenheit ? '°F' : '°C'})`,
        data: hourlyTemps,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.12)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#0b0f19',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      activeMetric === 'pop' && {
        label: `${t.rainProbability} (%)`,
        data: hourlyPops,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#38bdf8',
        pointBorderColor: '#0b0f19',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      activeMetric === 'cloud' && {
        label: `${t.cloudCover} (%)`,
        data: hourlyClouds,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#a855f7',
        pointBorderColor: '#0b0f19',
        pointBorderWidth: 2,
        pointRadius: 4,
      }
    ].filter(Boolean)
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#38bdf8',
        borderColor: 'rgba(6, 182, 212, 0.4)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const unit = activeMetric === 'temp' ? (isFahrenheit ? '°F' : '°C') : '%';
            return `${context.dataset.label}: ${context.parsed.y}${unit}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 10, family: 'Inter' }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.06)',
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 10, family: 'Inter' }
        }
      }
    }
  };

  return (
    <div className="p-6 rounded-2xl glass-panel space-y-5">
      
      {/* Header with Tabs & Metric Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        
        {/* Hourly vs 7-Day Tabs */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 w-fit">
          <button
            onClick={() => setForecastTab('hourly')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              forecastTab === 'hourly' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t.hourlyForecast}</span>
          </button>
          <button
            onClick={() => setForecastTab('daily')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              forecastTab === 'daily' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t.sevenDayForecast}</span>
          </button>
        </div>

        {/* Metric Toggles (For Hourly Chart) */}
        {forecastTab === 'hourly' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveMetric('temp')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeMetric === 'temp'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'glass-panel-subtle text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.temperature}
            </button>
            <button
              onClick={() => setActiveMetric('pop')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeMetric === 'pop'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'glass-panel-subtle text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.rainProbability}
            </button>
            <button
              onClick={() => setActiveMetric('cloud')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeMetric === 'cloud'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                  : 'glass-panel-subtle text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.cloudCover}
            </button>
          </div>
        )}

      </div>

      {/* Main View: Either Hourly Chart or 7-Day Grid */}
      {forecastTab === 'hourly' ? (
        <div className="h-64 w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        /* 7-Day Outlook Cards */
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {daily.map((day, idx) => (
            <div 
              key={idx}
              className={`p-3.5 rounded-xl glass-panel-subtle flex flex-col items-center justify-between text-center transition-all hover:scale-[1.02] ${
                idx === 0 ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-slate-800'
              }`}
            >
              <div className="text-xs font-bold text-slate-300">
                {idx === 0 ? 'Today' : day.day}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {day.date}
              </div>

              <div className="my-2.5">
                {day.condition.theme === 'rain' ? (
                  <CloudRain className="w-7 h-7 text-cyan-400" />
                ) : day.condition.theme === 'fog' ? (
                  <Cloud className="w-7 h-7 text-slate-300" />
                ) : (
                  <Sun className="w-7 h-7 text-amber-400" />
                )}
              </div>

              <div className="space-y-0.5 w-full">
                <div className="flex items-center justify-center space-x-1.5 font-hud text-sm">
                  <span className="font-bold text-slate-100">{toDisplayTemp(day.maxTemp)}°</span>
                  <span className="text-slate-400 text-xs">{toDisplayTemp(day.minTemp)}°</span>
                </div>

                <div className="flex items-center justify-center space-x-1 text-[10px] text-sky-400 font-mono">
                  <CloudRain className="w-2.5 h-2.5" />
                  <span>{day.pop}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Micro-insight footer */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>Forecast Model: ECMWF IFS High-Resolution + IMD Micro-Ensemble</span>
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          Updated: Live Synced
        </span>
      </div>

    </div>
  );
}
