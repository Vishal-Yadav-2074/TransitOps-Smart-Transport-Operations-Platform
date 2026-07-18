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
          500: '#4f46e5', // Royal indigo primary
          600: '#4338ca',
          700: '#3730a3',
          800: '#312e81',
          900: '#1e1b4b',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          150: '#e2e8f0',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          450: '#64748b',
          500: '#64748b',
          505: '#64748b',
          600: '#475569',
          650: '#334155',
          700: '#334155',
          800: '#1d1b38', // Glowing dark violet border
          850: '#1e293b',
          900: '#131224', // Card panel dark background
          950: '#0b0a12', // Main canvas background
          955: '#0b0a12',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
