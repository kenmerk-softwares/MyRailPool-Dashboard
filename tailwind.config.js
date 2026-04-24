/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#F1F9F3',
          100: '#DDF0E3',
          200: '#BDE3C9',
          300: '#8ED2A6',
          400: '#5FBE80',
          500: '#34A85F',
          600: '#1FAF5B', 
          700: '#168B46',
          800: '#08694E', 
          900: '#064F3B', 
        }
      },
      keyframes: {
        slideIn: {
          'from': { transform: 'translateX(400px)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        }
      },
      animation: {
        slideIn: 'slideIn 0.3s ease-out',
      }
    },
  },
  plugins: [],
}
