import { type ReactNode } from 'react';

// 指标说明：名称右侧小问号,悬浮显示计算规则/统计区间;移开自动消失（hover 由 CSS 控制）。
// 二-17：统计规则与统计区间换行用无序符号展示,不再是一整段。
// 兼容：优先用显式 lines；否则把形如「<规则>。统计区间：<区间>。」的 text 自动拆成两条。
export function InfoDot({ text, lines, width }: { text?: ReactNode; lines?: string[]; width?: number }) {
  let bullets: string[] | null = lines ?? null;
  if (!bullets && typeof text === 'string') {
    // 按句号拆成多条(规则 / 统计区间 / 统计口径…),每条一个无序符号
    const parts = text.split(/[。]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) bullets = parts;
  }
  return (
    <span className="info">
      <span className="info-dot">?</span>
      <span className="info-pop" style={width ? { width } : undefined}>
        {bullets ? (
          <ul className="info-list">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        ) : (
          text
        )}
      </span>
    </span>
  );
}
