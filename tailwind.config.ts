import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'var(--font-poppins)',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
        logo: ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f9f0ff',
          100: '#f3e0ff',
          200: '#e6c1ff',
          300: '#d4a3ff',
          400: '#B069DB',
          500: '#9747c7',
          600: '#7d3aad',
          700: '#632d8a',
          800: '#4a2167',
          900: '#3C0061',
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(39, 39, 87, 0.5)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 30px rgba(39, 39, 87, 0.8)',
          },
        },
      },
    },
  },
  plugins: [],
}
export default config
