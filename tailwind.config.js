/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        green: "#00ff00",
        blue: "#0000ff",
        magenta: "#ff00ff",
        "pastel-blue": "#a0ced9",
        "pastel-green": "#adf7b6",
        "pastel-red": "#ffc09f",
        "pastel-yellow": "#ffee93",
      },
      fontFamily: {
        Righteous: ["Righteous", "cursive"],
      },
    },
  },
  plugins: [],
};
