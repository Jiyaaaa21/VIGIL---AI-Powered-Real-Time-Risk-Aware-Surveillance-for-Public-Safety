/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette for surveillance dashboard
        slate: {
          950: '#0a0e1a',
          900: '#151b2e',
          850: '#1a2332',
          800: '#1e293b',
          750: '#283548',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
        },
        blue: {
          950: '#0a1929',
          900: '#0f1f2e',
          800: '#1e3a52',
          500: '#3b82f6',
          400: '#60a5fa',
        },
        status: {
          normal: '#10b981',
          suspicious: '#f59e0b',
          critical: '#ef4444',
        }
      },
      backgroundColor: {
        'map-base': '#0a1929',
        'map-street': '#1e3a52',
        'map-building': '#162b3d',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}



