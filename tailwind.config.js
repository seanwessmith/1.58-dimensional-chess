/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      sky: colors.sky,
      yellow: colors.yellow,
      gray: colors.gray,
      black: colors.black,
      white: colors.white,
      "ethereum-blue": "#8AA8F3",
      "ethereum-blue-two": "#B8FAF4",
      "ethereum-purple": "#C8AFF7",
      "ethereum-purple-two": "#CDC3F7",
      "ethereum-orange": "#FAE4D5",
      "ethereum-pink": "#FBE6F8",
    },
  },
  plugins: [],
};
