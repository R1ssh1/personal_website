import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light Mode: Modern Minimalist
        'light-primary': '#FFFFFF',
        'light-secondary': '#F8F9FA',
        'light-text': '#1B2951',
        'light-accent': '#3B82F6',
        'light-muted': '#6B7280',

        // Dark Mode: Dark Premium  
        'dark-primary': '#1F1F23',
        'dark-secondary': '#2A2A2F',
        'dark-text': '#F8F9FA',
        'dark-accent': '#8B5CF6',
        'dark-muted': '#9CA3AF',

        // Dynamic theme colors (will switch based on theme)
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        text: 'var(--color-text)',
        accent: 'var(--color-accent)',
        muted: 'var(--color-muted)',
      },
      fontFamily: {
        'logo': ['Playfair Display', 'serif'], // Distinctive font for "Rishi Jha"
        'nav': ['Inter', 'sans-serif'], // Clean font for navigation
      },
      backdropBlur: {
        'glass': '12px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'theme-transition': 'theme-transition 0.3s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0px)', opacity: '1' },
        },
        'theme-transition': {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
