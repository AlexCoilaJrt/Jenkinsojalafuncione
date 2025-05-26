/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./src/**/*",'./node_modules/flowbite/**/*.js',
  ],
  theme: {
    extend: {
      colors:{
        'custom-green': '#233D2C',
      },


    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

