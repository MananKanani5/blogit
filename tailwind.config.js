/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs", "./public/**/*.js"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        light: "var(--light)",
        dark: "var(--dark)",
        text: "var(--text)",
        form: "var(--form)",
      },
    },
  },
  plugins: [require("tailwindcss"), require("autoprefixer")],
};
