import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';

// 14.3 二维码失效落地页（3 秒后跳首页）
export function QrInvalid() {
  const nav = useNavigate();
  const [n, setN] = useState(3);
  useEffect(() => {
    const tick = setInterval(() => setN((v) => v - 1), 1000);
    const to = setTimeout(() => nav('/'), 3000);
    return () => {
      clearInterval(tick);
      clearTimeout(to);
    };
  }, [nav]);
  return (
    <div className="lg" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 32px' }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          background: 'var(--surface-warm)',
          color: 'var(--ink-3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
        }}
      >
        <Icon id="i-qr" w={34} h={34} />
      </div>
      <div style={{ fontFamily: 'var(--serif-cjk)', fontWeight: 700, fontSize: 19 }}>二维码已失效</div>
      <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 9 }}>
        {Math.max(n, 0)} 秒后自动跳转首页…
      </div>
      <button className="btn btn-ghost" style={{ marginTop: 24, justifyContent: 'center', padding: '12px 32px' }} onClick={() => nav('/')}>
        立即前往首页
      </button>
    </div>
  );
}
