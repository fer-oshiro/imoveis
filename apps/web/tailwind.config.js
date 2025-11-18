module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          800: '#DE0632',
          600: '#FAE7E9',
          400: '#FAE7E9',
          200: '#FAE7E9',
          100: '#FAE7E9',
        },
        secondary: {
          800: '#B70B52',
          600: '#DE0632',
          400: '#ECE8DD',
          200: '#F5F5ED',
        },
        gray: {
          950: '#1C1C1C',
          900: '#3D3D3D',
          800: '#454545',
          700: '#4F4F4F',
          600: '#5D5D5D',
          500: '#6D6D6D',
          400: '#888888',
          300: '#B0B0B0',
          200: '#D1D1D1',
          100: '#E7E7E7',
        },
      },
    },
  },
  plugins: [],
}
