export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      spacing: {
        22: "5.5rem",
        30: "7.5rem",
        120: "30rem",
      },
      colors: {
        primary: "rgb(226, 106, 34)",
        "primary-light": "rgb(232, 136, 78)",
        "primary-extra-light": "rgb(240, 180, 144)",
        secondary: "rgba(6, 140, 193, 0.25)",
        "secondary-light": "rgb(225, 225, 223)",
        "secondary-dark": "rgb(96, 96, 96)",
      },
    },
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
