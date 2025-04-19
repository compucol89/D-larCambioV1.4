/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        'dark-bg': '#111827',
        'dark-card': '#1f2937',
        'md-sys-color-primary': '#6750A4',
        'md-sys-color-on-primary': '#FFFFFF',
        'md-sys-color-primary-container': '#EADDFF',
        'md-sys-color-on-primary-container': '#21005D',
        'md-sys-color-secondary': '#625B71',
        'md-sys-color-on-secondary': '#FFFFFF',
        'md-sys-color-secondary-container': '#E8DEF8',
        'md-sys-color-on-secondary-container': '#1D192B',
        'md-sys-color-tertiary': '#7D5260',
        'md-sys-color-on-tertiary': '#FFFFFF',
        'md-sys-color-tertiary-container': '#FFD8E4',
        'md-sys-color-on-tertiary-container': '#31111D',
        'md-sys-color-error': '#B3261E',
        'md-sys-color-on-error': '#FFFFFF',
        'md-sys-color-error-container': '#F9DEDC',
        'md-sys-color-on-error-container': '#410E0B',
        'md-sys-color-outline': '#79747E',
        'md-sys-color-background': '#FFFBFE',
        'md-sys-color-on-background': '#1C1B1F',
        'md-sys-color-surface': '#FFFBFE',
        'md-sys-color-on-surface': '#1C1B1F',
        'md-sys-color-surface-variant': '#E7E0EC',
        'md-sys-color-on-surface-variant': '#49454F',
        'md-sys-color-inverse-surface': '#313033',
        'md-sys-color-inverse-on-surface': '#F4EFF4',
        'md-sys-color-inverse-primary': '#D0BCFF',
        'md-sys-color-shadow': '#000000',
        'md-sys-color-surface-tint': '#6750A4',
        'md-sys-color-outline-variant': '#CAC4D0',
        'md-sys-color-scrim': '#000000',
        'vibrant-primary': '#2962ff',
        'vibrant-secondary': '#00bcd4',
        'vibrant-accent': '#ffc107',
        'vibrant-success': '#4caf50',
        'vibrant-error': '#f44336',
      },
      fontFamily: {
        sans: ['Roboto', 'Inter var', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
