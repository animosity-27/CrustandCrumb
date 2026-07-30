/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        crust: {
          50: '#faf3ea',
          100: '#f3e4cf',
          200: '#e6c9a0',
          300: '#d4a373',
          400: '#c89665',
          500: '#a87c4f',
          600: '#8b5e3c',
          700: '#6b4423',
          800: '#4a2f18',
          900: '#321f0f',
          950: '#1c1207',
        },
        ocean: {
          50: '#eaf1f8',
          100: '#c9dcef',
          200: '#97bcdb',
          300: '#5f8fc4',
          400: '#3a6ea5',
          500: '#2c5282',
          600: '#1f3f68',
          700: '#163050',
          800: '#0e2238',
          900: '#081627',
          950: '#040d1a',
        },
        cream: '#f9f3ea',
        sand: '#f5ebe0',
        parchment: '#fbf6ee',
        gold: '#d4a373',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        script: ['Caveat', 'cursive'],
      },
      boxShadow: {
        crust: '0 20px 60px -15px rgba(50, 31, 15, 0.45)',
        glow: '0 0 40px -5px rgba(212, 163, 115, 0.5)',
        soft: '0 10px 40px -10px rgba(8, 22, 39, 0.25)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'steam-rise': {
          '0%': { transform: 'translateY(0) scaleX(1)', opacity: '0' },
          '15%': { opacity: '0.6' },
          '100%': { transform: 'translateY(-120px) scaleX(2.5)', opacity: '0' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-18px) rotate(2deg)' },
        },
        'float-slower': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-30px) rotate(-3deg)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'draw-line': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'rise-up': {
          '0%': { transform: 'scaleY(0.85) translateY(20px)', opacity: '0' },
          '100%': { transform: 'scaleY(1) translateY(0)', opacity: '1' },
        },
        'dough-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'steam-rise': 'steam-rise 4s ease-out infinite',
        'float-slow': 'float-slow 7s ease-in-out infinite',
        'float-slower': 'float-slower 11s ease-in-out infinite',
        'shimmer': 'shimmer 4s linear infinite',
        'draw-line': 'draw-line 3s ease forwards',
        'spin-slow': 'spin-slow 30s linear infinite',
        'rise-up': 'rise-up 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'dough-pulse': 'dough-pulse 5s ease-in-out infinite',
        'marquee': 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
};
