/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eq-bg': '#0d0b08',
        'eq-panel': '#1a1510',
        'eq-border': '#8b6914',
        'eq-border-light': '#c4982a',
        'eq-text': '#e8dcc8',
        'eq-text-dim': '#9a8870',
        'eq-gold': '#d4a520',
        'eq-orange': '#c86400',
        'eq-red': '#8b1a1a',
        'eq-blue': '#1a3a8b',
        'eq-green': '#1a6b1a',
      },
      fontFamily: {
        eq: ['"Palatino Linotype"', 'Palatino', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
