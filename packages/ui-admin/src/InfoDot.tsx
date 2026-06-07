import { type ReactNode } from 'react';

// 指标说明：名称右侧小问号,悬浮显示计算规则/统计区间;移开自动消失（hover 由 CSS 控制）。
export function InfoDot({ text, width }: { text: ReactNode; width?: number }) {
  return (
    <span className="info">
      <span className="info-dot">?</span>
      <span className="info-pop" style={width ? { width } : undefined}>
        {text}
      </span>
    </span>
  );
}
