import { type ReactNode } from 'react';
import { Icon } from '@aba/ui';

// 空态：插画 + 文案 + 主操作。illust 提供时用自定义插画替代「圆圈 + icon」（0615-6）
export function EmptyState({
  icon = 'i-cube',
  illust,
  title,
  sub,
  action,
}: {
  icon?: string;
  illust?: ReactNode;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="estate">
      {illust ? <div className="eart">{illust}</div> : <div className="eill"><Icon id={icon} /></div>}
      <div className="et">{title}</div>
      {sub && <div className="es">{sub}</div>}
      {action && <div className="ea">{action}</div>}
    </div>
  );
}

// 错误态：加载失败 + 重试
export function ErrorRetry({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="estate">
      <div className="eill" style={{ color: 'var(--terra)', background: 'var(--terra-soft)' }}>
        <Icon id="i-bell" />
      </div>
      <div className="et">加载失败</div>
      <div className="es">网络异常,请重试</div>
      <div className="ea">
        <button className="btn btn-ghost btn-sm" onClick={onRetry}>
          重试
        </button>
      </div>
    </div>
  );
}

// 表格骨架屏
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="tbl-wrap" style={{ padding: 18 }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: 16, padding: '12px 6px', alignItems: 'center' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="skel"
              style={{ height: 14, flex: c === 0 ? 2 : 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
