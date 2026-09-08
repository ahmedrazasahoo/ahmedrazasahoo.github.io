/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./script.js"],
  theme: {
    extend: {
      colors: {
        accent: {
          blue: "#3B82F6",
          green: "#22C55E",
          purple: "#7C3AED",
          cyan: "#06B6D4",
        },
      },
      fontFamily: {
        mono: ["Fira Code", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(6deg)" },
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
