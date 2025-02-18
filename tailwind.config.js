/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/**/*.edge',
    './resources/**/*.{js,ts,jsx,tsx}',
    './inertia/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          1: '#FDFCFF',
          2: '#FAF8FE',
          3: '#F4EEFD',
          4: '#EDE3FB',
          5: '#E5D7F7',
          6: '#DAC8F0',
          7: '#CBB4E8',
          8: '#B99BDD',
          9: '#52366F',
          10: '#634781',
          11: '#765996',
          12: '#42265D',
        },
      },
    },
  },
  plugins: [],
}
