/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        snow: '#FFFFFF',
        white: '#F7F9FC',
        paleSlate: '#DDE3ED',
        techBlue: '#023E8A',
        lilacAsh: '#4C6EF5',
        blueSlate: '#4A5568',
        success: '#0E7C5B',
        warn: '#B45309',
        danger: '#C0392B',
      }
    },
  },
  plugins: [],
}
