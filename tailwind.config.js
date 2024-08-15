/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs", "./public/**/*.js"],
  theme: {
    extend: {
      colors: {
        primary: "#8D493A",
        light: "#F8EDE3",
        dark: "#D0B8A8",
        text: "#202020",
      },
    },
  },
  plugins: [require("tailwindcss"), require("autoprefixer")],
};
