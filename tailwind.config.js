/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#060911',
          900: '#0b0f19',
          850: '#0f172a',
          800: '#141e33',
          700: '#1e293b',
        },
        neon: {
          cyan: '#06b6d4',
          amber: '#f59e0b',
          emerald: '#10b981',
          violet: '#8b5cf6',
          rose: '#f43f5e',
          sky: '#38bdf8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        hud: ['Rajdhani', 'sans-serif']
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%': { opacity: '0.6', filter: 'drop-shadow(0 0 4px rgba(6, 182, 212, 0.4))' },
          '100%': { opacity: '1', filter: 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.8))' },
        }
      }
    },
  },
  plugins: [],
}
