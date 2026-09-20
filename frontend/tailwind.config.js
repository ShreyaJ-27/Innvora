/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Innvora warm palette — the primary design language
        sand: {
          50:  '#FDFAF5',
          100: '#F8F4EC',
          200: '#F2ECE2',
          300: '#EDE5D8',
          400: '#E2D9C8',
          500: '#D7CABB',
          600: '#C4B49F',
          700: '#A89580',
          800: '#8C7A65',
          900: '#6F5F4D',
        },
        stone: {
          50:  '#F9F7F4',
          100: '#EDE5D8',
          200: '#D9CCB9',
          300: '#C5B49E',
          400: '#A89880',
          500: '#8C7B63',
          600: '#705F4C',
          700: '#574838',
          800: '#3D3228',
          900: '#272522',
        },
        charcoal: {
          50:  '#F4F3F1',
          100: '#E8E6E3',
          200: '#CCC8C2',
          300: '#A8A39B',
          400: '#7D776F',
          500: '#6F675D',
          600: '#5A5349',
          700: '#45413B',
          800: '#32302B',
          900: '#272522',
        },
        // Muted operational accent — olive/moss (used sparingly)
        olive: {
          50:  '#F5F6F0',
          100: '#ECEEDD',
          200: '#D5D9BB',
          300: '#B8BE93',
          400: '#969D68',
          500: '#767D46',
          600: '#5E6437',
          700: '#484E2B',
          800: '#33371E',
          900: '#1F2012',
        },
        // Alert colors — muted terracotta/rust/amber (used sparingly)
        terracotta: {
          50:  '#FBF3F0',
          100: '#F5E3DB',
          200: '#E9C4B5',
          300: '#D99E88',
          400: '#C6745A',
          500: '#B05A3E',
          600: '#8E4530',
          700: '#6E3424',
          800: '#4E2419',
          900: '#31160F',
        },
        // Keep status colors accessible
        status: {
          healthy: {
            bg: '#F0F4EC',
            text: '#3D5A2B',
            border: '#C5D4B5',
            dot: '#7A9E5D',
          },
          reorder: {
            bg: '#FBF3F0',
            text: '#7D3D24',
            border: '#E9C4B5',
            dot: '#C6745A',
          },
          critical: {
            bg: '#FBF0EE',
            text: '#7A2A22',
            border: '#E8B9B4',
            dot: '#B84E44',
          },
          overstocked: {
            bg: '#F0F4EE',
            text: '#2D4A36',
            border: '#B5D0BC',
            dot: '#5A8E6A',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        // Innvora: extremely subtle, warm-tinted shadows
        subtle: '0 1px 2px 0 rgba(39, 37, 34, 0.04)',
        card:   '0 1px 3px 0 rgba(39, 37, 34, 0.06), 0 1px 2px -1px rgba(39, 37, 34, 0.04)',
        panel:  '0 2px 8px 0 rgba(39, 37, 34, 0.08)',
        drawer: '0 20px 40px -8px rgba(39, 37, 34, 0.18)',
        dropdown: '0 4px 12px -2px rgba(39, 37, 34, 0.12)',
        inset: 'inset 0 1px 2px 0 rgba(39, 37, 34, 0.06)',
      },
      backgroundImage: {
        'warm-gradient': 'linear-gradient(135deg, #F8F4EC 0%, #EDE5D8 100%)',
        'sand-gradient': 'linear-gradient(180deg, #F2ECE2 0%, #E9E0D2 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
