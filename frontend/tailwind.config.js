/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "'Segoe UI'", "sans-serif"],
      },
      colors: {
        navy: {
          DEFAULT: "#023E8A",
          dark: "#011f54",
          mid: "#034fa6",
        },
        brand: {
          indigo: "#4C6EF5",
          slate: "#4A5568",
          green: "#0E7C5B",
          amber: "#B45309",
          bg: "#F7F9FC",
          border: "#DDE3ED",
        },
      },
      keyframes: {
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "spin-slow": "spin-slow 0.8s linear infinite",
      },
    },
  },
  plugins: [],
};
