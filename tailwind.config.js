/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      colors: {
        moram: {
          blue: "#5482b4",
          navy: "#123263",
          logo: "#06275a",
          sky: "#c3e9fe",
        },
      },
    },
  },
  plugins: [],
};
