/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        sand: {
          50: '#FAF7F2',
          100: '#F5EDE0',
          200: '#EDDCC4',
          300: '#E0C9A3',
          400: '#D4A574',
          500: '#C48E55',
          600: '#A87040',
          700: '#8B5A33',
          800: '#6E4729',
          900: '#52351E',
        },
        forest: {
          50: '#EDF5F0',
          100: '#D4E8DC',
          200: '#A8D1B9',
          300: '#7DB996',
          400: '#4FA273',
          500: '#2D5A3D',
          600: '#244A32',
          700: '#1B3A27',
          800: '#132B1C',
          900: '#0A1B11',
        },
        sunset: {
          50: '#FEF3EE',
          100: '#FDE4D5',
          200: '#FBC9AB',
          300: '#F9AE81',
          400: '#E8724A',
          500: '#D4592E',
          600: '#B04423',
          700: '#8C331B',
          800: '#682512',
          900: '#44180C',
        },
        slate: {
          750: '#4A5568',
        },
      },
      fontFamily: {
        display: ['"Noto Serif SC"', 'serif'],
        body: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
