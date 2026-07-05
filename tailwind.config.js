/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 星空主题色板
        space: {
          deep: '#03030a',
          dark: '#0a0a1a',
          mid: '#141428',
          light: '#1f1f3d',
        },
        nebula: {
          blue: '#4a9eff',
          purple: '#9d6bff',
          pink: '#ff6b9d',
          cyan: '#6bfff0',
        },
        star: {
          white: '#ffffff',
          yellow: '#ffd966',
          orange: '#ff9d4a',
          red: '#ff4a4a',
        },
      },
      fontFamily: {
        display: ['"NB Architekt Std"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        cn: ['"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      animation: {
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          'from': { textShadow: '0 0 10px rgba(157, 107, 255, 0.5)' },
          'to': { textShadow: '0 0 20px rgba(157, 107, 255, 0.9), 0 0 30px rgba(74, 158, 255, 0.5)' },
        },
      },
    },
  },
  plugins: [],
};
