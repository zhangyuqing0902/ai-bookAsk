import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';

// 15 兑换码（手输 + 拍照 OCR）
export function Redeem() {
  const nav = useNavigate();
  const [code, setCode] = useState('');
  return (
    <>
      <div className="h5-top">
        <div className="ic tap" onClick={() => nav(-1)}>
          <Icon id="i-chevL" w={22} h={22} />
        </div>
        <div className="center">
          <div className="ttl">兑换码</div>
        </div>
        <div className="grp" />
      </div>
      <div className="pg">
        <div className="scrollY">
          <div className="redeem">
            <div className="lg-h" style={{ fontSize: 18 }}>
              兑换会员权益
            </div>
            <div className="lg-s">输入兑换码,或拍照自动识别</div>
            <div className="redeem-box">
              <input
                className="ipt"
                placeholder="输入兑换码"
                value={code}
                autoFocus
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && code.trim() && toast('兑换成功 · 会员已到账')}
              />
              <div className="cam tap" onClick={() => toast('调起相机 / 相册')}>
                <Icon id="i-camera" />
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: 14, opacity: code.trim() ? 1 : 0.5 }}
              onClick={() => (code.trim() ? toast('兑换成功 · 会员已到账') : toast('请先输入兑换码'))}
            >
              立即兑换
            </button>
            <div className="redeem-hint">兑换码区分大小写 · 兑换后权益立即生效</div>
          </div>
        </div>
      </div>
    </>
  );
}
