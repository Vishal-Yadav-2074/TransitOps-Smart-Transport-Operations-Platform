/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7fe',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#7c3aed', // Primary Accent
          600: '#8b5cf6', // Secondary Accent
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          150: '#e2e8f0',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#b8b8c5', // Secondary Text
          450: '#71717a', // Muted Text
          500: '#71717a',
          505: '#71717a',
          600: '#475569',
          650: '#334155',
          700: '#181d28', // Secondary Surface
          800: 'rgba(255,255,255,0.08)', // Border
          850: '#181d28', // Secondary Surface
          900: '#131722', // Cards background
          910: '#10131a', // Navbar background
          920: '#0d1018', // Sidebar background
          950: '#09090b', // Canvas background
          955: '#09090b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
