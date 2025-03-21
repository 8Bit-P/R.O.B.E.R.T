/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {gridColumn: {
      'span-20': 'span 20 / span 20',
    },},
  },
  plugins: [],
  fontFamily: {
    sans: ['nothing', ...defaultTheme.fontFamily.sans],
 },
}

