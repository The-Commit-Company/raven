/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
    },
  },
  darkMode: 'class',
  plugins: [
    require("tailwindcss-animate"),
  ],
  corePlugins: {
    preflight: false,
  }
}

