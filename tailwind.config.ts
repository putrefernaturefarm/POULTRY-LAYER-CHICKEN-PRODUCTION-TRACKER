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
        brand: {
          50:  '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        farm: {
          green: {
            50:  '#f0fdf4',
            100: '#dcfce7',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
          },
        },
      },
      boxShadow: {
        card:  '0 1px 3px 0 rgba(0,0,0,.07), 0 1px 2px -1px rgba(0,0,0,.05)',
        float: '0 4px 12px -2px rgba(0,0,0,.1)',
        nav:   '0 -1px 6px 0 rgba(0,0,0,.06)',
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
