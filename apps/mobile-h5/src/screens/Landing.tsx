import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { useDemoStore } from '@aba/mock';

// 1 登录落地页：知识核动效 + 名称 + slogan + 机构来源 + 协议勾选
// 0613：按打开环境分流微信登录——微信内 → 官方授权弹窗；浏览器 → 扫码授权页。
export function Landing() {
  const nav = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const wechatEnv = useDemoStore((s) => s.wechatEnv);
  const setWechatEnv = useDemoStore((s) => s.setWechatEnv);
  const orgTokenExceeded = useDemoStore((s) => s.orgTokenExceeded);
  const setOrgTokenExceeded = useDemoStore((s) => s.setOrgTokenExceeded);

  const guard = (fn: () => void) => () => {
    if (!agreed) {
      toast('请先阅读并同意《用户协议》与《隐私政策》');
      return;
    }
    fn();
  };
  const wechat = guard(() => nav(wechatEnv ? '/login/wechat-auth' : '/login/wechat-scan'));

  return (
    <div className="lg lg-landing">
      <div className="brand-orb">
        <div className="ring r1" />
        <div className="ring r2" />
        <div className="orbit">
          <span className="dot" />
        </div>
        <div className="orb float core" />
      </div>
      <div className="login-wm2" style={{ marginTop: 30 }}>
        AI <span className="grad">问书</span>
      </div>
      <div className="sgn2" style={{ marginTop: 12 }}>
        答案有出处<span className="sgn-dot" />知识更可信
      </div>

      <div className="lg-bottom">
        <div className="lg-btns">
          <button className="btn btn-wechat" style={{ justifyContent: 'center', padding: 14 }} onClick={wechat}>
            <Icon id="i-msg" w={17} h={17} />
            微信授权登录
          </button>
          <button
            className="btn btn-primary"
            style={{ justifyContent: 'center', padding: 14 }}
            onClick={guard(() => nav('/login/phone'))}
          >
            <Icon id="i-phone" w={17} h={17} />
            手机号登录
          </button>
        </div>
        <div className="lg-inst">
          知识由 <b>中国医学临床百家</b> 提供
        </div>
        <div className="lg-agree" onClick={() => setAgreed((a) => !a)}>
          <span className={'lg-cbx' + (agreed ? ' on' : '')}>
            <Icon id="i-check" />
          </span>
          <span>
            已阅读并同意
            <a onClick={(e) => { e.stopPropagation(); nav('/agreement/terms'); }}>《用户协议》</a>与
            <a onClick={(e) => { e.stopPropagation(); nav('/agreement/privacy'); }}>《隐私政策》</a>
          </span>
        </div>
        {/* 演示环境切换：放在协议下方、不抢主流程；明确标注仅演示用，避免业务方误会为上线功能 */}
        <div className="env-demo">
          <span className="env-demo-tag">仅用于演示 · 环境切换（非上线功能）</span>
          <div className="env-seg">
            <b className={wechatEnv ? 'on' : ''} onClick={() => setWechatEnv(true)}>微信内打开</b>
            <b className={!wechatEnv ? 'on' : ''} onClick={() => setWechatEnv(false)}>浏览器打开</b>
          </div>
          {/* 0614：演示「机构本月 Token 超额度」→ 会话顶部出现给 C 端的友好提示 */}
          <div className="env-seg">
            <b className={!orgTokenExceeded ? 'on' : ''} onClick={() => setOrgTokenExceeded(false)}>Token 正常</b>
            <b className={orgTokenExceeded ? 'on' : ''} onClick={() => setOrgTokenExceeded(true)}>机构 Token 超限</b>
          </div>
        </div>
      </div>
    </div>
  );
}
