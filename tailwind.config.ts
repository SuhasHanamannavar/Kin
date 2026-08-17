import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        kin: {
          bg: '#FAFAF7',
          text: '#1A1A1E',
          muted: '#5A5D6B',
          subtle: '#8A8D9A',
          accent: '#2D5F8A',
          border: 'rgba(0,0,0,0.08)',
          borderHover: 'rgba(0,0,0,0.14)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'card-hover': '0 4px 20px rgba(0,0,0,0.06)',
        'soft': '0 2px 12px rgba(0,0,0,0.05)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'kin-bob': 'kinBob 3s ease-in-out infinite',
        'kin-blink': 'kinBlink 4s ease-in-out infinite',
        'wing-flap': 'wingFlap 2s ease-in-out infinite',
        'overlay-in': 'overlayIn 0.2s ease-out',
        'modal-in': 'modalIn 0.25s ease-out',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        kinBob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        kinBlink: {
          '0%, 92%, 100%': { transform: 'scaleY(1)' },
          '95%': { transform: 'scaleY(0.1)' },
        },
        wingFlap: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(-5deg)' },
        },
        overlayIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        modalIn: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
