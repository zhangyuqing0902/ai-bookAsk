import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { useDemoStore } from '@aba/mock';

// 3 绑定手机号（统一「手机号 + 验证码」，可暂不绑定）
// 复用三处：微信登录后绑定(from=login) / 我的主动绑定(from=me) / 敏感操作门槛引导绑定(from=gate)
export function WechatBind() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const from = sp.get('from') || 'login';
  const bindPhone = useDemoStore((s) => s.bindPhone);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  const done = () => (from === 'login' ? nav('/chat') : nav(-1));
  const submit = () => {
    if (!/^\d{11}$/.test(phone)) return toast('请输入正确的 11 位手机号');
    if (!/^\d{6}$/.test(code)) return toast('请输入 6 位验证码');
    bindPhone();
    toast('手机号绑定成功');
    setTimeout(done, 600);
  };

  const sub =
    from === 'login'
      ? '微信登录成功 · 绑定后可跨端同步会话与权益'
      : from === 'gate'
        ? '支付下单、兑换码与开通会员需先完成手机号绑定'
        : '绑定后可使用支付、兑换码与会员等权益';

  return (
    <>
      <div className="h5-top">
        <div className="ic tap" onClick={() => nav(-1)}>
          <Icon id="i-chevL" w={22} h={22} />
        </div>
        <div className="center">
          <div className="ttl">绑定手机号</div>
        </div>
        <div className="grp" />
      </div>
      <div className="lg lg-auth">
        <div className="lg-form">
          <div className="lg-h">绑定手机号</div>
          <div className="lg-s">{sub}</div>
          <div className="pf">
            <label>手机号</label>
            <div className="pin">
              <Icon id="i-phone" />
              <input inputMode="numeric" maxLength={11} placeholder="请输入手机号" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
            </div>
          </div>
          <div className="pf">
            <label>验证码</label>
            <div className="pin">
              <Icon id="i-lock" />
              <input inputMode="numeric" maxLength={6} placeholder="请输入验证码" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
              <span className="get" onClick={() => toast('验证码已发送')}>获取验证码</span>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 8 }} disabled={!phone || !code} onClick={submit}>
            {from === 'login' ? '绑定并进入' : '完成绑定'}
          </button>
          <div style={{ display: 'flex', justifyContent: from === 'login' ? 'space-between' : 'center', marginTop: 16, fontSize: 12.5 }}>
            {from === 'login' && (
              <span className="tap" style={{ color: 'var(--ink-2)' }} onClick={() => nav('/chat')}>
                暂不绑定 · 直接进入
              </span>
            )}
            <span className="tap" style={{ color: 'var(--indigo-ink)' }} onClick={() => nav('/login/conflict')}>
              手机号已被占用?
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
