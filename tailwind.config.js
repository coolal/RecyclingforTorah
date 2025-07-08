/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#16a34a', // green-600
        'primary-hover': '#15803d', // green-700
        secondary: '#475569', // slate-600
        light: '#f1f5f9', // slate-100
        background: '#e2e8f0', // slate-200
      }
    },
  },
  plugins: [],
}
