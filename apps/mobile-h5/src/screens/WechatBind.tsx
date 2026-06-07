import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';

// 3 微信绑定手机号（可暂不绑定）
export function WechatBind() {
  const nav = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const submit = () => {
    if (!/^\d{11}$/.test(phone)) return toast('请输入正确的 11 位手机号');
    if (!/^\d{6}$/.test(code)) return toast('请输入 6 位验证码');
    nav('/chat');
  };
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
          <div className="lg-h">绑定手机号更安全</div>
          <div className="lg-s">微信登录成功 · 绑定后可跨端同步会话与权益</div>
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
            绑定并进入
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 12.5 }}>
            <span className="tap" style={{ color: 'var(--ink-2)' }} onClick={() => nav('/chat')}>
              暂不绑定 · 直接进入
            </span>
            <span className="tap" style={{ color: 'var(--indigo-ink)' }} onClick={() => nav('/login/conflict')}>
              手机号已被占用?
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
