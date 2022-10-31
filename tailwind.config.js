/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.{html,js,pug}", "./public/**/*.js"],
  darkMode: 'class',
  theme: {
    fontFamily: {
      'body': ['"Noto Sans"', 'sans-serif']
    },
    extend: {},
  },
  plugins: [],
}