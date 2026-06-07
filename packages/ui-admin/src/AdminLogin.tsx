import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';

// 后台登录 · 动态毛玻璃（机构后台 / 平台超管共用,仅标题不同）。结构取自「主视觉.html」,样式见 styles.css .login。
export function AdminLogin({ title, redirect = '/' }: { title: string; redirect?: string }) {
  const nav = useNavigate();
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
        <div className="login-tag">答案有出处 · 知识更可信</div>
      </div>

      <div className="login-card">
        <div className="lc-h">{title}</div>
        <div className="lc-s">输入账号与密码进入工作台</div>
        <div className="field">
          <label>账号</label>
          <div className="inp">
            <Icon id="i-user" />
            请输入账号 / 手机号
          </div>
        </div>
        <div className="field">
          <label>密码</label>
          <div className="inp">
            <Icon id="i-lock" />
            请输入密码
          </div>
        </div>
        <div className="field">
          <label>验证码</label>
          <div className="inp">
            <Icon id="i-check" />
            4 位图形验证码<span className="vcode">A7K9</span>
          </div>
        </div>
        <button className="btn btn-primary login-btn" onClick={() => nav(redirect)}>
          登 录
        </button>
        <div className="login-foot">
          <span>记住登录 30 天</span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              toast('请联系平台管理员重置');
            }}
          >
            登录遇到问题?
          </a>
        </div>
      </div>
    </div>
  );
}
