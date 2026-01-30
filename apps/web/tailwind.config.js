/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Dynamic colors that change with theme (using CSS variables)
        bg: {
          primary: 'var(--color-bg-primary)',
          surface: 'var(--color-bg-surface)',
          card: 'var(--color-bg-card)',
          elevated: 'var(--color-bg-elevated)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          subtle: 'var(--color-border-subtle)',
          accent: 'var(--color-border-accent)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        gold: {
          DEFAULT: 'var(--color-accent-gold)',
          light: 'var(--color-accent-gold-light)',
          dim: 'var(--color-accent-gold-dim)',
        },
        win: {
          DEFAULT: 'var(--color-win)',
          bg: 'var(--color-win-bg)',
        },
        loss: {
          DEFAULT: 'var(--color-loss)',
          bg: 'var(--color-loss-bg)',
        },
        // Legacy support - these will be overridden by component styles
        gray: {
          900: '#0A0A0B',
          800: '#141416',
          700: '#1A1A1D',
          600: '#222225',
          500: '#2A2A2E',
          400: '#5A5A5D',
          300: '#8B8B8E',
          200: '#BBBBBE',
          100: '#F5F5F5',
        },
        emerald: {
          400: 'var(--color-win)',
          500: 'var(--color-win)',
          600: 'var(--color-win)',
          700: 'var(--color-win)',
        },
        red: {
          400: 'var(--color-loss)',
          500: 'var(--color-loss)',
          600: 'var(--color-loss)',
          700: 'var(--color-loss)',
        },
        blue: {
          400: 'var(--color-accent-gold)',
          500: 'var(--color-accent-gold)',
          600: 'var(--color-accent-gold)',
          700: 'var(--color-accent-gold-dim)',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'SF Mono', 'monospace'],
        body: ['IBM Plex Mono', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-sm': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'label': ['0.7rem', { lineHeight: '1.4', letterSpacing: '0.1em' }],
      },
      boxShadow: {
        'luxe-sm': 'var(--shadow-sm)',
        'luxe-md': 'var(--shadow-md)',
        'luxe-lg': 'var(--shadow-lg)',
        'glow': 'var(--shadow-glow)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      transitionTimingFunction: {
        'elegant': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-gold': 'var(--gradient-gold)',
        'gradient-surface': 'var(--gradient-surface)',
        'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
