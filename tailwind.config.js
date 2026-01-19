/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme
        dark: {
          primary: '#0a0a0f',
          secondary: '#12121a',
          tertiary: '#1a1a24',
        },
        // Light theme
        light: {
          primary: '#f5f5fa',
          secondary: '#ffffff',
          tertiary: '#e8e8f0',
        },
        // Accent colors
        accent: {
          primary: '#7c5cff',
          secondary: '#5c9cff',
        },
        // Category colors
        category: {
          pdf: '#ff6b6b',
          pdfOps: '#4ecdc4',
          archive: '#a855f7',
          video: '#f59e0b',
        },
        // Status colors
        success: '#10b981',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Outfit', 'Noto Sans JP', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-arrow': 'bounceArrow 0.5s ease',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceArrow: {
          '0%, 100%': { transform: 'translateX(0)' },
          '40%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [],
}
