import { type ReactNode } from 'react';

// 通用弹窗：scrim + 卡片 + 标题/内容/底部操作。
export function Modal({
  title,
  open,
  onClose,
  children,
  footer,
  width = 440,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  if (!open) return null;
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-card" style={{ width }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          {title}
          <span className="modal-x" onClick={onClose}>
            ✕
          </span>
        </div>
        <div className="modal-b">{children}</div>
        {footer && <div className="modal-f">{footer}</div>}
      </div>
    </div>
  );
}
