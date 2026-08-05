/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        marine: {
          50: '#F0F5FA',
          100: '#DDEAF3',
          200: '#BCD6EA',
          300: '#8DA9C4',
          400: '#547B9E',
          500: '#134074',
          600: '#0E3057',
          700: '#0B2545',
          800: '#07162A',
          900: '#030811',
        },
        sand: {
          50: '#FDFBF7',
          100: '#FAF4E8',
          200: '#F4E7CE',
          300: '#EBD4AA',
          400: '#DFBA7E',
          500: '#EEB902',
          600: '#CA9602',
          700: '#9E7201',
        }
      },
      backgroundImage: {
        'ocean-pattern': 'radial-gradient(ellipse at top right, rgba(141, 169, 196, 0.15), transparent), radial-gradient(ellipse at bottom left, rgba(19, 64, 116, 0.05), transparent)',
      }
    },
  },
  plugins: [],
}
