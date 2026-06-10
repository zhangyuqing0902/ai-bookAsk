import { type ReactNode } from 'react';
import { Modal } from './Modal';

// 通用二次确认弹窗：居中，标题 + 描述 + 取消/确认。
// 后台所有不可逆 / 高风险操作（停用、删除、下架、取消分享、重试等）统一走此组件，
// 不再用一行 toast 顶替确认。danger=true 时确认按钮用警示色（珊瑚红）。
export function ConfirmDialog({
  open,
  title,
  desc,
  confirmText = '确认',
  cancelText = '取消',
  danger = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  desc?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      title={title}
      open={open}
      onClose={onClose}
      width={400}
      footer={
        <>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className={'btn btn-sm' + (danger ? '' : ' btn-primary')}
            style={danger ? { background: 'var(--terra)', borderColor: 'var(--terra)', color: '#fff' } : undefined}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </>
      }
    >
      {desc && <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.7 }}>{desc}</div>}
    </Modal>
  );
}
