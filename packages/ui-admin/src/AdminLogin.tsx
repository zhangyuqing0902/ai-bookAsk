import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';

// 图形验证码：随机 4 位，排除易混字符（0/O/1/I/L）。
const VC_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const genCode = () => Array.from({ length: 4 }, () => VC_ALPHABET[Math.floor(Math.random() * VC_ALPHABET.length)]).join('');

// 后台登录 · 动态毛玻璃（机构后台 / 平台超管共用,仅标题不同）。结构取自「主视觉.html」,样式见 styles.css .login。
export function AdminLogin({ title, redirect = '/' }: { title: string; redirect?: string }) {
  const nav = useNavigate();
  const [account, setAccount] = useState('');
  const [pwd, setPwd] = useState('');
  const [vcode, setVcode] = useState('');
  // 0615：图形验证码随机生成 + 点击「换一张」刷新（原为硬编码固定值）
  const [vc, setVc] = useState(genCode);
  const refreshVc = () => setVc(genCode());

  return (
    <div className="login">
      <div className="login-blob lb1" />
      <div className="login-blob lb2" />
      <div className="login-blob lb3" />
      <div className="login-blob lb4" />
      <div className="login-noise" />

      <div className="login-left">
        <div className="brand-orb">
          <div className="ring r1" />
          <div className="ring r2" />
          <div className="orbit">
            <span className="dot" />
          </div>
          <div className="orb float core" />
        </div>
        <div className="login-wm">
          AI <span className="grad">问书</span>
        </div>
        <div className="login-tag">
          答案有出处<span className="login-dot" />知识更可信
        </div>
      </div>

      <div className="login-card">
        <div className="lc-h">{title}</div>
        <div className="lc-s">输入账号与密码进入工作台</div>
        <div className="field">
          <label>账号</label>
          <div className="inp">
            <Icon id="i-user" />
            <input
              className="inp-field"
              placeholder="请输入账号 / 手机号"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label>密码</label>
          <div className="inp">
            <Icon id="i-lock" />
            <input
              className="inp-field"
              type="password"
              placeholder="请输入密码"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label>验证码</label>
          <div className="inp">
            <Icon id="i-check" />
            <input
              className="inp-field"
              placeholder="4 位图形验证码"
              value={vcode}
              maxLength={4}
              onChange={(e) => setVcode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && nav(redirect)}
            />
            <span className="vcode-box" onClick={refreshVc} title="看不清？点击换一张" role="button" aria-label="刷新验证码">
              <b className="vcode">{vc}</b>
              <Icon id="i-refresh" />
            </span>
          </div>
        </div>
        <button className="btn btn-primary login-btn" onClick={() => nav(redirect)}>
          登 录
        </button>
        <div className="login-foot login-foot-end">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              toast('请联系管理员');
            }}
          >
            登录遇到问题?
          </a>
        </div>
      </div>
    </div>
  );
}
