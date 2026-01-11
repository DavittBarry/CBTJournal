/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          150: '#eeeeec',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
        sage: {
          50: '#f6f7f6',
          100: '#e3e7e3',
          200: '#c7d0c7',
          300: '#a3b2a3',
          400: '#7d8f7d',
          500: '#617161',
          600: '#4d5a4d',
          700: '#3f493f',
          800: '#353c35',
          900: '#2d322d',
        },
        warm: {
          50: '#fdfcfb',
          100: '#f9f6f3',
          200: '#f3ede7',
          300: '#e8ddd2',
          400: '#d4c4b0',
          500: '#b8a08a',
        },
        coral: {
          100: '#fdf2f0',
          200: '#f9ddd8',
          300: '#f0b8ad',
          400: '#e89485',
          500: '#d97567',
        },
        helpful: {
          50: '#f0f7f0',
          100: '#dcebdc',
          500: '#5a8a5a',
          600: '#4a724a',
        },
        critical: {
          50: '#fdf4f3',
          100: '#f9e2df',
          500: '#c97b70',
          600: '#a86358',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 4px 12px -2px rgba(0, 0, 0, 0.06), 0 8px 24px -4px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
      }
    },
  },
  plugins: [],
}
