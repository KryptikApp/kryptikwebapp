const plugin = require("tailwindcss/plugin")


module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {},
  },
  plugins: [
    plugin(function({ addUtilities }) {
    addUtilities({
      /* Hide scrollbar for Chrome, Safari and Opera */
      '.no-scrollbar::-webkit-scrollbar': {
        'display': 'none'
      },

      /* Hide scrollbar for IE, Edge and Firefox */
      '.no-scrollbar': {
        '-ms-overflow-style': 'none',  /* IE and Edge */
        'scrollbar-width': 'none'  /* Firefox */
      },
    })
  })
  ],
}