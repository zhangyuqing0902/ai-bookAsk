import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';

// 1 登录落地页：知识核动效 + 名称 + slogan + 机构来源 + 协议勾选
export function Landing() {
  const nav = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const guard = (fn: () => void) => () => {
    if (!agreed) {
      toast('请先阅读并同意《用户协议》与《隐私政策》');
      return;
    }
    fn();
  };
  const wechat = guard(() => nav('/login/wechat-auth'));

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
        <div className="lg-scan tap" onClick={() => nav('/login/wechat-scan')}>
          在浏览器中打开？扫码登录
        </div>
      </div>
    </div>
  );
}
