/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        plot: {
          available: '#4CAF50',
          booked: '#E53935',
          hold: '#F9A825',
          ninfo: '#757575',
          selected: '#60BAFF',
        },
        dark: {
          900: '#111111',
          800: '#1a1a1a',
          700: '#222222',
          600: '#2a2a2a',
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
