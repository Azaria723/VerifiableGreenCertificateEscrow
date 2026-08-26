/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: '#F3F1EC',
        surface: '#E8E5DE',
        surfaceDark: '#D8D4CC',
        textMain: '#1E2021',
        mutedText: '#6E706F',
        borderLine: '#C9C5BC',
        orangeAccent: '#D9673A',
        orangeSoft: '#E9A17F',
        greenStatus: '#4F8061',
        redStatus: '#B94A3D',
        blueNeutral: '#5E7488',
      },
      fontFamily: {
        editorial: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
