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
        primary: '#5B5BD6',
        secondary: '#9969C7',
        background: '#1A202C',
        iris: {
          1: '#13131E',
          2: '#171625',
          3: '#202248',
          4: '#262A65',
          5: '#303374',
          6: '#3D3E82',
          7: '#4A4A95',
          8: '#5958B1',
          9: {
            DEFAULT: '#5B5BD6',
            contrast: '#FFFFFF',
          },
          10: '#6E6ADE',
          11: '#B1A9FF',
          12: '#E0DFFE',
        },
      }
    },
  },
  plugins: [],
}
