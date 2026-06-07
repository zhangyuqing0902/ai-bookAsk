import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';

// 4 手机号冲突 · 本人验证
export function Conflict() {
  const nav = useNavigate();
  const [code, setCode] = useState('');
  const submit = () => {
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
          <div className="ttl">验证本人</div>
        </div>
        <div className="grp" />
      </div>
      <div className="lg lg-auth">
        <div className="lg-form">
          <div className="lg-h">该手机号已存在</div>
          <div className="lg-s">是否为本人?通过验证码校验后将合并绑定</div>
          <div className="pf">
            <label>手机号</label>
            <div className="pin" style={{ color: 'var(--ink)' }}>
              <Icon id="i-phone" />
              138****8888
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
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 8 }} disabled={!code} onClick={submit}>
            确认本人 · 合并绑定
          </button>
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12.5 }} className="tap" onClick={() => nav(-1)}>
            <span style={{ color: 'var(--ink-2)' }}>不是本人 · 重填手机号</span>
          </div>
        </div>
      </div>
    </>
  );
}
