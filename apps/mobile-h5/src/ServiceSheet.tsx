import { Icon } from '@aba/ui';

// 联系客服弹窗（共享）：含客服企微二维码 + 电话 + 邮箱。0613-2：「我的」与「手机号占用」页复用同一弹窗。
export function ServiceSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div className={'ov' + (open ? ' open' : '')}>
      <div className="scrim" onClick={onClose} />
      <div className="pw">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--serif-cjk)', fontWeight: 700, fontSize: 16 }}>联系客服</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 6 }}>扫码添加客服企微，或电话 / 邮件联系</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 0 8px' }}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 14,
              background: 'repeating-linear-gradient(135deg,#E7EAF2 0 8px,#EEF1F7 8px 16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ink-3)',
            }}
          >
            <Icon id="i-qr" w={40} h={40} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>客服电话 400-800-8888</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>客服邮箱 help@aiwenshu.com</div>
        </div>
      </div>
    </div>
  );
}
