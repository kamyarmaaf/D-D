/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        // High contrast text colors
        'ink': {
          DEFAULT: 'var(--ink)',
          light: 'var(--ink-light)',
          muted: 'var(--ink-muted)',
        },
        'parchment': {
          DEFAULT: 'var(--parchment)',
          dark: 'var(--parchment-dark)',
        },
        'gold': {
          DEFAULT: 'var(--gold)',
          dark: 'var(--gold-dark)',
        },
        'forest': 'var(--forest)',
        'mystic': 'var(--mystic)',
        'crimson': 'var(--crimson)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'slide-in': 'slide-in 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%': { boxShadow: '0 0 20px rgba(168,85,247,0.4)' },
          '100%': { boxShadow: '0 0 30px rgba(168,85,247,0.8), 0 0 40px rgba(168,85,247,0.4)' },
        },
        'slide-in': {
          'from': { transform: 'translateX(-100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
