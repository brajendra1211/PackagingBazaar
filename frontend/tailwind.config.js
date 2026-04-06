/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        sans: ["DM Sans", "sans-serif"],
      },
      colors: {
        accent:  "#e05c2a",
        accent2: "#f0a500",
        ink:     "#0f1923",
        ink2:    "#2d3d4f",
        ink3:    "#6a7a8a",
        surface: "#f5f2ed",
      },
    },
  },
  plugins: [],
};
