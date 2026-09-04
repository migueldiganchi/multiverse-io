import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['Space Mono', 'monospace'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        void: '#030305',
        deep: '#07070f',
        surface: '#0c0c1a',
        aurora: '#6c63ff',
        gold: '#c8a96e',
        pulse: '#ff6b9d',
        cyan: '#4dd9e0',
      },
    },
  },
  plugins: [],
}

export default config
