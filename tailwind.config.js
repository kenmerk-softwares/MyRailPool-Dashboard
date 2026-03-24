/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F1F9F3',
          100: '#DDF0E3',
          200: '#BDE3C9',
          300: '#8ED2A6',
          400: '#5FBE80',
          500: '#34A85F',
          600: '#1FAF5B', // Vibrant green from Sign In button
          700: '#168B46',
          800: '#08694E', // Dark green from MyRailPool text
          900: '#064F3B', // Dark sidebar background
        }
      }
    },
  },
  plugins: [],
}
