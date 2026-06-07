import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';

// 2 手机号登录（主题色底 + 真实输入 + 校验）
export function PhoneLogin() {
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
          <div className="ttl">手机号登录</div>
        </div>
        <div className="grp" />
      </div>
      <div className="lg lg-auth">
        <div className="lg-form">
          <div className="lg-h">欢迎使用 AI 问书</div>
          <div className="lg-s">输入手机号与验证码即可登录</div>
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
            登 录
          </button>
        </div>
      </div>
    </>
  );
}
