// AI 问书 · 方向 B 设计 token（与 design/project/direction-b.jsx 对齐）

export const colors = {
  bg: '#f6f4f0',
  surface: '#ffffff',
  surface2: '#fbf9f4',
  ink: '#14182a',
  ink2: '#2c3046',
  muted: '#797d8c',
  subtle: '#c1c3cc',
  hairline: 'rgba(20,24,42,0.10)',
  hairline2: 'rgba(20,24,42,0.06)',
  indigo: '#4f46e5',
  indigoDeep: '#3730a3',
  indigoSoft: '#e7e8ff',
  coral: '#ff7a5c',
  coralSoft: '#ffe4dd',
  // 状态语义色（PRD 验收用）
  success: '#1f9d70',
  warning: '#d97706',
  danger: '#d92d20',
  // 半透
  scrim: 'rgba(20,24,42,0.42)',
} as const;

export const fonts = {
  sans: '"Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif',
  display: '"Manrope", "Noto Sans SC", sans-serif',
  mono: '"DM Mono", "SF Mono", ui-monospace, monospace',
} as const;

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const shadows = {
  xs: '0 1px 0 rgba(20,24,42,.04)',
  sm: '0 1px 2px rgba(20,24,42,.06), 0 1px 0 rgba(20,24,42,.04)',
  md: '0 1px 0 rgba(20,24,42,.04), 0 4px 14px rgba(20,24,42,.05)',
  lg: '0 1px 0 rgba(20,24,42,.04), 0 8px 28px rgba(20,24,42,.07)',
  xl: '0 12px 40px rgba(20,24,42,.10)',
  glow: '0 6px 28px rgba(79,70,229,.28)',
  glowCoral: '0 6px 28px rgba(255,122,92,.28)',
} as const;

// 标签语义（free 中性灰 / member 靛蓝 / forever 永享朝霞橙）
export const tagSemantics = {
  free: { fg: colors.muted, bg: 'rgba(20,24,42,0.05)' },
  member: { fg: colors.indigo, bg: colors.indigoSoft },
  forever: { fg: colors.coral, bg: colors.coralSoft },
} as const;

export type TagKind = keyof typeof tagSemantics;
