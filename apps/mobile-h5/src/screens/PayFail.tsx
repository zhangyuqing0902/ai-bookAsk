import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';

// 7.3 微信支付结果 · 失败
export function PayFail() {
  const nav = useNavigate();
  return (
    <div className="lg" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 32px' }}>
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: '50%',
          background: 'var(--terra-soft)',
          color: 'var(--terra)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          fontSize: 34,
          fontWeight: 700,
        }}
      >
        ✕
      </div>
      <div style={{ fontFamily: 'var(--serif-cjk)', fontWeight: 700, fontSize: 21 }}>支付失败</div>
      <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 9 }}>未扣款,可重新支付或稍后再试</div>
      <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
        <button className="btn btn-amber" style={{ justifyContent: 'center', padding: '14px 28px' }} onClick={() => toast('重新发起微信支付')}>
          重新支付
        </button>
        <button className="btn btn-ghost" style={{ justifyContent: 'center', padding: '14px 28px' }} onClick={() => nav('/chat')}>
          返回
        </button>
      </div>
    </div>
  );
}
