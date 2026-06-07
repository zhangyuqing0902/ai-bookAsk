// Tailwind preset 与 src/index.ts 保持手动同步（CJS 让所有 app 的 tailwind.config.cjs 都能 require）
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: '#f6f4f0',
        surface: '#ffffff',
        surface2: '#fbf9f4',
        ink: '#14182a',
        'ink-2': '#2c3046',
        muted: '#797d8c',
        subtle: '#c1c3cc',
        indigo: {
          DEFAULT: '#4f46e5',
          deep: '#3730a3',
          soft: '#e7e8ff',
        },
        coral: {
          DEFAULT: '#ff7a5c',
          soft: '#ffe4dd',
        },
        success: '#1f9d70',
        warning: '#d97706',
        danger: '#d92d20',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '-apple-system', 'BlinkMacSystemFont', '"PingFang SC"', '"Helvetica Neue"', 'sans-serif'],
        display: ['Manrope', '"Noto Sans SC"', 'sans-serif'],
        mono: ['"DM Mono"', '"SF Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        DEFAULT: '12px',
        md: '12px',
        lg: '14px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        xs: '0 1px 0 rgba(20,24,42,.04)',
        sm: '0 1px 2px rgba(20,24,42,.06), 0 1px 0 rgba(20,24,42,.04)',
        DEFAULT: '0 1px 0 rgba(20,24,42,.04), 0 4px 14px rgba(20,24,42,.05)',
        md: '0 1px 0 rgba(20,24,42,.04), 0 4px 14px rgba(20,24,42,.05)',
        lg: '0 1px 0 rgba(20,24,42,.04), 0 8px 28px rgba(20,24,42,.07)',
        xl: '0 12px 40px rgba(20,24,42,.10)',
        glow: '0 6px 28px rgba(79,70,229,.28)',
        'glow-coral': '0 6px 28px rgba(255,122,92,.28)',
      },
      borderColor: {
        hairline: 'rgba(20,24,42,0.10)',
        'hairline-2': 'rgba(20,24,42,0.06)',
      },
      backgroundImage: {
        'brand-grad': 'linear-gradient(95deg, #4f46e5, #3730a3)',
        'brand-grad-warm': 'linear-gradient(95deg, #4f46e5, #ff7a5c)',
        'hero-glow': 'radial-gradient(ellipse at 50% 0%, #e7e8ff, transparent 70%), radial-gradient(ellipse at 100% 30%, rgba(255,228,221,0.53), transparent 60%)',
      },
    },
  },
};
