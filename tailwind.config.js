/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#12181F',
        surface: '#FFFFFF',
        subtle: '#F4F5F7',
        border: '#E3E6EA',
        torque: {
          DEFAULT: '#F5620E',
          50: '#FFF3EC',
          100: '#FFE3D1',
          600: '#DB5308',
          700: '#B84406',
        },
        diag: {
          DEFAULT: '#2563EB',
          50: '#EFF4FF',
        },
        success: { DEFAULT: '#16A34A', 50: '#EFFBF3' },
        warn: { DEFAULT: '#D97706', 50: '#FFF7EB' },
        danger: { DEFAULT: '#DC2626', 50: '#FEF1F1' },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(18,24,31,0.06), 0 1px 1px rgba(18,24,31,0.04)',
        pop: '0 8px 24px rgba(18,24,31,0.12)',
      },
    },
  },
  plugins: [],
}
