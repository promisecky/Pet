/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f97316', // Orange-500
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#fbbf24', // Amber-400
          foreground: '#000000',
        },
        background: '#fff7ed', // Orange-50
      }
    },
  },
  plugins: [],
}
