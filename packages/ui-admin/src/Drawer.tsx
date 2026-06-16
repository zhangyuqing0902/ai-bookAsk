import { type ReactNode } from 'react';

// 0615-3：右侧抽屉（机构详情订阅记录「加油包」按钮 → 展示该订阅的加油包列表 + 新建）。
export function Drawer({
  open,
  title,
  onClose,
  children,
  footer,
  width = 460,
}: {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  if (!open) return null;
  return (
    <div className="drawer-scrim" onClick={onClose}>
      <div className="drawer-panel" style={{ width }} onClick={(e) => e.stopPropagation()}>
        <div className="drawer-h">
          {title}
          <span className="modal-x" onClick={onClose}>✕</span>
        </div>
        <div className="drawer-b">{children}</div>
        {footer && <div className="drawer-f">{footer}</div>}
      </div>
    </div>
  );
}
