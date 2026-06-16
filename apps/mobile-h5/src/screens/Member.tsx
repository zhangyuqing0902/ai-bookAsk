import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { usePhoneGate } from '../usePhoneGate';

// 11 开通会员（两档互斥，无年付）。0613：充值会员前校验手机号绑定。
export function Member() {
  const nav = useNavigate();
  const { guard, gate } = usePhoneGate();
  const [plan, setPlan] = useState(0);
  const amount = plan === 0 ? '9.9' : '19.9';
  const pay = () => {
    // 走模拟微信支付页(与永享买断同一套收银台)
    nav(`/pay/wechat?amount=${amount}&subject=${encodeURIComponent('AI 问书会员 · ' + (plan === 0 ? '首月特惠' : '月度'))}`);
  };
  return (
    <>
      <div className="h5-top">
        <div className="ic tap" onClick={() => nav(-1)}>
          <Icon id="i-chevL" w={22} h={22} />
        </div>
        <div className="center">
          <div className="ttl">开通会员</div>
        </div>
        <div className="grp" />
      </div>
      <div className="h5">
        <div className="h5-scroll">
          <div className="member">
            <div className="member-hero">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="orb float" style={{ width: 72, height: 72 }} />
              </div>
              <div className="member-h">
                解锁全部受限内容 · <span className="grad">畅享问答</span>
              </div>
              <div className="member-sub">图音视频深度精讲 · 实时电话即时问答 · VIP 极速优先</div>
            </div>
            <div className={'plan' + (plan === 0 ? ' sel' : '')} onClick={() => setPlan(0)}>
              <div className="radio" />
              <div>
                <div className="pn">首月特惠</div>
                <div className="pd">次月起 ¥19.9 / 月</div>
              </div>
              <div className="pp">
                <div className="big">¥9.9</div>
                <div className="sm">首月</div>
              </div>
            </div>
            <div className={'plan' + (plan === 1 ? ' sel' : '')} onClick={() => setPlan(1)}>
              <div className="radio" />
              <div>
                <div className="pn">月度</div>
                <div className="pd">按月自动续费</div>
              </div>
              <div className="pp">
                <div className="big">¥19.9</div>
                <div className="sm">/ 月</div>
              </div>
            </div>
            <div className="member-foot">
              <div className="agree">
                <span className="bx">
                  <Icon id="i-check" />
                </span>
                <span className="agree-txt">
                  已阅读并同意<a href="#">《自动续费协议》</a>
                </span>
              </div>
              <button className="btn btn-amber" style={{ width: '100%', justifyContent: 'center', padding: 14 }} onClick={guard(pay)}>
                立即开通
              </button>
              <div className="grace-note">可随时退订 · 到期前 72h 宽限期</div>
            </div>
          </div>
        </div>
      </div>
      {gate}
    </>
  );
}
