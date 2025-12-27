import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontSize: {
      'xs': ['0.6rem', { lineHeight: '0.8rem' }],      // 9.6px (was 12px) - 20% reduction
      'sm': ['0.7rem', { lineHeight: '1rem' }],        // 11.2px (was 14px)
      'base': ['0.8rem', { lineHeight: '1.2rem' }],    // 12.8px (was 16px)
      'lg': ['0.9rem', { lineHeight: '1.4rem' }],      // 14.4px (was 18px)
      'xl': ['1rem', { lineHeight: '1.5rem' }],        // 16px (was 20px)
      '2xl': ['1.2rem', { lineHeight: '1.6rem' }],     // 19.2px (was 24px)
      '3xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px (was 30px)
      '4xl': ['1.8rem', { lineHeight: '2.25rem' }],    // 28.8px (was 36px)
      '5xl': ['2.4rem', { lineHeight: '1' }],          // 38.4px (was 48px)
      '6xl': ['3rem', { lineHeight: '1' }],            // 48px (was 60px)
    },
    extend: {
      fontFamily: {
        // Primary typeface - Inter (similar to Open Sauce)
        // Used for: headings, UI labels, navigation, and core interface copy
        // Weights: Regular (400), Medium (500), Semi-bold (600), Bold (700)
        sans: [
          'var(--font-inter)',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
        // Secondary typeface - Bricolage Grotesque
        // Used selectively for: marketing headers, highlights, or emphasis where personality is needed
        // Weights: Regular (400), Medium (500), Semi-bold (600), Bold (700)
        heading: [
          'var(--font-bricolage)',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
        // Logo font (using primary)
        logo: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fffad6',      // Quotla light
          100: '#f5f5dc',
          200: '#e8e8cc',
          300: '#d1d1aa',
          400: '#8a8a66',
          500: '#445642',     // Quotla green
          600: '#2a2f2f',
          700: '#1a1f1f',
          800: '#0e1616',     // Quotla dark
          900: '#080b0b',
        },
        secondary: {
          50: '#fff5e6',
          100: '#ffe8cc',
          200: '#ffd199',
          300: '#ffba66',
          400: '#f59e0b',
          500: '#ce6203',     // Quotla orange
          600: '#a34f02',
          700: '#783b02',
          800: '#4d2601',
          900: '#221200',
        },
        quotla: {
          dark: '#0e1616',
          green: '#445642',
          light: '#fffad6',
          orange: '#ce6203',
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(206, 98, 3, 0.3)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 30px rgba(206, 98, 3, 0.5)',
          },
        },
      },
    },
  },
  plugins: [],
}
export default config
