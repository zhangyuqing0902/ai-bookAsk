import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { usePhoneGate } from '../usePhoneGate';

// 15 兑换码（手输 + 拍照 OCR）。0613：核销前校验手机号绑定。
export function Redeem() {
  const nav = useNavigate();
  const { guard, gate } = usePhoneGate();
  const [code, setCode] = useState('');
  const [blocked, setBlocked] = useState<string | null>(null);
  const doRedeem = () => {
    const value = code.trim();
    if (!value) return toast('请先输入兑换码');
    if (value === 'FUTURE') return setBlocked('该兑换码尚未到生效时间，请于 2026-07-20 00:00 后再试');
    if (value === 'EXPIRED') return setBlocked('该兑换码已过期，请联系发码机构');
    if (value === 'STOPPED') return setBlocked('机构服务已暂停，请联系发码机构');
    toast('兑换成功 · 会员已到账');
  };
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && code.trim()) guard(doRedeem)();
                }}
              />
              <div className="cam tap" onClick={() => toast('调起相机 / 相册')}>
                <Icon id="i-camera" />
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: 14, opacity: code.trim() ? 1 : 0.5 }}
              onClick={guard(doRedeem)}
            >
              立即兑换
            </button>
            <div className="redeem-hint">兑换码区分大小写 · 需在批次可兑换时间内使用</div>
            <div className="redeem-hint">演示码：FUTURE（未生效）· EXPIRED（已过期）· STOPPED（机构停用）</div>
          </div>
        </div>
      </div>
      {gate}
      <div className={'ov' + (blocked ? ' open' : '')}>
        <div className="scrim" onClick={() => setBlocked(null)} />
        <div className="pw">
          <div className="pw-h"><div className="t">暂时无法兑换</div><div className="s">{blocked}</div></div>
          <div className="pw-btns"><button className="btn btn-primary" onClick={() => setBlocked(null)}>我知道了</button></div>
        </div>
      </div>
    </>
  );
}
