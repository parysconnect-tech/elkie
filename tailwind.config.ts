import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-sec': 'var(--bg-sec)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        accent: 'var(--accent)',
        accent2: 'var(--accent2)',
        'accent-glow': 'var(--accent-glow)',
        'accent-dim': 'var(--accent-dim)',
        'card-bg': 'var(--card-bg)',
        'card-border': 'var(--card-border)',
        'input-bg': 'var(--input-bg)',
        'nav-bg': 'var(--nav-bg)',
      },
      fontFamily: {
        heading: ['"Clash Display"', 'sans-serif'],
        body: ['Sora', 'sans-serif'],
      },
      animation: {
        gradient: 'gradientShift 5s ease infinite',
        'spin-border': 'spinBorder 4s linear infinite',
        marquee: 'marquee 30s linear infinite',
        shimmer: 'shimmer 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.7s ease-out both',
        'scale-in': 'scaleIn 0.6s ease-out both',
        'slide-in-left': 'slideInLeft 0.6s ease-out both',
        'slide-in-right': 'slideInRight 0.6s ease-out both',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
        float1: 'float1 18s ease-in-out infinite',
        float2: 'float2 22s ease-in-out infinite',
        float3: 'float3 16s ease-in-out infinite',
        float4: 'float4 24s linear infinite',
        blink: 'blink 0.8s step-end infinite',
      },
    },
  },
  plugins: [],
}

export default config
