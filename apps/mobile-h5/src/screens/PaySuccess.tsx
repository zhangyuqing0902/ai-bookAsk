import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';

// 7.3 微信支付结果 · 成功
export function PaySuccess() {
  const nav = useNavigate();
  return (
    <div className="lg" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 32px' }}>
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: '50%',
          background: 'var(--jade-soft)',
          color: 'var(--jade)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Icon id="i-check" w={38} h={38} />
      </div>
      <div style={{ fontFamily: 'var(--serif-cjk)', fontWeight: 700, fontSize: 21 }}>支付成功</div>
      <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 9 }}>会员已开通 / 永享已解锁</div>
      <button
        className="btn btn-primary"
        style={{ marginTop: 30, justifyContent: 'center', padding: '14px 46px' }}
        onClick={() => nav('/chat')}
      >
        返回会话
      </button>
    </div>
  );
}
