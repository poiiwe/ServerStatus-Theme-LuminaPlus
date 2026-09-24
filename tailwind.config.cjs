/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx,vue}', 'index.html'],
  theme: {
    extend: {
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        online: {
          DEFAULT: 'rgb(var(--online) / <alpha-value>)',
          foreground: 'rgb(var(--online-foreground) / <alpha-value>)',
        },
        offline: {
          DEFAULT: 'rgb(var(--offline) / <alpha-value>)',
          foreground: 'rgb(var(--offline-foreground) / <alpha-value>)',
        },
        /* LuminaPlus 度量强调色 */
        'metric-cpu': 'var(--metric-cpu)',
        'metric-memory': 'var(--metric-memory)',
        'metric-disk': 'var(--metric-disk)',
        'metric-load': 'var(--metric-load)',
        'metric-network': 'var(--metric-network)',
        'metric-swap': 'var(--metric-swap)',
        'traffic-up': 'var(--traffic-up)',
        'traffic-down': 'var(--traffic-down)',
        'progress-bg': 'var(--progress-bg)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--reka-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--reka-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
