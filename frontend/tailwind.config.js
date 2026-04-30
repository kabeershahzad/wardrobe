/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        gold: {
          50: '#edfeff',
          100: '#cbfcff',
          200: '#9ef8ff',
          300: '#67f4ff',
          400: '#23f0ff',
          500: '#09d7e8',
          600: '#05a8b9',
          700: '#067d8a',
          800: '#0a5e68',
          900: '#0b434a',
        },
        obsidian: {
          50: '#edf3ff',
          100: '#dce7ff',
          200: '#beceff',
          300: '#95abff',
          400: '#6b82f8',
          500: '#4d62da',
          600: '#3e4eb0',
          700: '#313c8c',
          800: '#21295f',
          900: '#13183a',
          950: '#050814',
        },
      },
      backgroundImage: {
        'accent-soft': 'linear-gradient(145deg, rgba(35,240,255,0.2), rgba(5,8,20,0))',
      },
      animation: {
        shimmer: 'shimmer 2.2s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.45s ease-out',
        float: 'float 5.5s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-180% center' },
          '100%': { backgroundPosition: '180% center' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(35,240,255,0.25), 0 0 24px rgba(35,240,255,0.3)',
        glass: '0 16px 34px rgba(2, 8, 29, 0.38)',
      },
    },
  },
  plugins: [],
};

