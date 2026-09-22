import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '375px',
      },
      colors: {
        white: '#fffdf9',
        gray: {
          50:  '#f7f3ec',
          100: '#ede7db',
          200: '#e0d8ca',
          300: '#cabfab',
          400: '#9a8d80',
          500: '#7a6f63',
          600: '#5c544a',
          700: '#3d3730',
          800: '#2c2520',
          900: '#211d18',
        },
        green: {
          50:  '#e7f1ea',
          100: '#cde5d5',
          200: '#a8ccb6',
          400: '#5fa87a',
          500: '#4e9468',
          600: '#3f7a5a',
          700: '#2f6448',
          800: '#1f4d35',
        },
        amber: {
          50:  '#f6e9e1',
          100: '#edcfbe',
          200: '#dba98a',
          400: '#c97348',
          500: '#c4622f',
          600: '#b0532b',
          700: '#9a4520',
          800: '#7d3318',
        },
        red: {
          50:  '#f5e7e7',
          100: '#ecc8c8',
          200: '#d99090',
          400: '#b34040',
          500: '#a02828',
          600: '#8b2020',
          700: '#7a1818',
          800: '#631212',
        },
        blue: {
          50:  '#e8f0f5',
          100: '#cad9e4',
          200: '#9db8cc',
          400: '#4a84a8',
          500: '#3d71a0',
          600: '#2f5d7c',
          700: '#24506e',
          800: '#1a3d54',
        },
        purple: {
          50:  '#f0eaf7',
          100: '#ddd0ef',
          600: '#6b3fa0',
          700: '#5a3285',
        },
        farm: {
          green: {
            50:  '#e7f1ea',
            100: '#cde5d5',
            500: '#4e9468',
            600: '#3f7a5a',
            700: '#2f6448',
          },
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans:  ['var(--font-sans)',  'system-ui', 'sans-serif'],
        mono:  ['var(--font-mono)',  'monospace'],
      },
      boxShadow: {
        card:  '0 1px 4px 0 rgba(33,29,24,.06), 0 1px 2px -1px rgba(33,29,24,.04)',
        float: '0 4px 20px -4px rgba(33,29,24,.16)',
        nav:   '0 -1px 6px 0 rgba(33,29,24,.06)',
        warm:  '-6px 6px 0 #e0d8ca',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}

export default config
