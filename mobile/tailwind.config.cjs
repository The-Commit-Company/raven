/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: '#B589D6',
        secondary: '#9969C7',
        background: '#1A202C'
      }
    },
  },
  plugins: [],
}
