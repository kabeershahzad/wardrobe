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
          50: '#f5efe8',
          100: '#eadfce',
          200: '#d7c0a0',
          300: '#c39f75',
          400: '#ae8256',
          500: '#9a6b42',
          600: '#7d5534',
          700: '#634229',
          800: '#49301d',
          900: '#2e1d12',
        },
        obsidian: {
          50: '#f4f3f1',
          100: '#e5e2de',
          200: '#cdc8c0',
          300: '#aea69a',
          400: '#8b8174',
          500: '#71675d',
          600: '#564e47',
          700: '#413b36',
          800: '#2c2825',
          900: '#1a1816',
          950: '#11100f',
        },
      },
      backgroundImage: {
        'accent-soft': 'linear-gradient(145deg, rgba(154,107,66,0.12), rgba(17,16,15,0))',
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
        gold: '0 12px 28px rgba(154,107,66,0.18)',
        glass: '0 16px 34px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};

