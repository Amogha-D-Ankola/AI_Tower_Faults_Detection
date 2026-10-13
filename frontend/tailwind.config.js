/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B1A',
          900: '#0A1128', // Primary dark background
          850: '#0F1A3A',
          800: '#15224D',
          700: '#1E326E',
          600: '#2A4595',
        },
        cyan: {
          DEFAULT: '#22D3EE',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          glow: 'rgba(34, 211, 238, 0.25)',
        },
        slate: {
          850: '#141E33',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -2px rgba(34, 211, 238, 0.25)',
        'glow-cyan-lg': '0 0 35px -5px rgba(34, 211, 238, 0.35)',
        'card-glow': '0 4px 20px 0 rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(34, 211, 238, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2.5s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(90%)' },
        }
      }
    },
  },
  plugins: [],
}
