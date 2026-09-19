/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        status: {
          healthy: {
            bg: '#f0fdf4',
            text: '#166534',
            border: '#bbf7d0',
            dot: '#22c55e',
          },
          reorder: {
            bg: '#fffbeb',
            text: '#92400e',
            border: '#fde68a',
            dot: '#f59e0b',
          },
          critical: {
            bg: '#fef2f2',
            text: '#991b1b',
            border: '#fecaca',
            dot: '#ef4444',
          },
          overstocked: {
            bg: '#f5f3ff',
            text: '#5b21b6',
            border: '#ddd6fe',
            dot: '#8b5cf6',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.07)',
        dropdown: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        drawer: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
