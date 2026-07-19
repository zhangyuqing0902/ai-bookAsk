import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { usePhoneGate } from '../usePhoneGate';

// 11 开通会员（两种购买方式互斥，无年付）。0613：充值会员前校验手机号绑定。
// 0718 #8：按「先权益、再套餐、后协议」重构交互（第一性原理：先确认买到什么，再选怎么付钱）——
//   ① 标题下三枚权益速览 chip；② 套餐卡层级重排：卡名 + 续费语义 pill + 一行说明 + 右侧大价签，
//     选中态＝左侧对勾圆点（琥珀填充）+ 琥珀描边淡底；③ 协议勾选真实可点（未勾选拦截并 toast 引导）；
//   ④ 按钮随所选方式联动；0718 #4：按钮下方补充说明文案删除（续费规则由套餐卡承载）。
//   价格语义不变（0717 二批 #9：连续包月＝首月 ¥9.9、次月起 ¥19.9/月 自动续费可退订；单月＝¥19.9 一次性、到期自动失效）。
export function Member() {
  const nav = useNavigate();
  const { guard, gate } = usePhoneGate();
  const [plan, setPlan] = useState(0); // 0=连续包月 1=单月
  // 0719：协议默认「未勾选」，须用户手动勾选。含《自动续费协议》的场景默认代勾不合规，
  // 且与登录落地页「默认未勾选」的口径保持一致。
  const [agree, setAgree] = useState(false);
  const monthly = plan === 0;
  const amount = monthly ? '9.9' : '19.9';
  const pay = () => {
    // 走模拟微信支付页(与永享买断同一套收银台)
    nav(`/pay/wechat?amount=${amount}&subject=${encodeURIComponent('AI 问书会员 · ' + (monthly ? '连续包月（首月特惠）' : '单月'))}`);
  };
  // 0718 #8③：协议未勾选 → 拦截并引导；已勾选 → 过手机号绑定门槛后进收银台
  const onPay = () => {
    if (!agree) return toast('请先阅读并同意相关协议');
    guard(pay)();
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
              <div className="member-sub">一次开通，全站权益即刻生效</div>
            </div>
            {/* 0718 #8①：权益速览——先建立「买到什么」的预期，再选套餐 */}
            <div className="mb-perks">
              <span className="mb-perk">
                <Icon id="i-crown" w={13} h={13} />
                受限内容全解锁
              </span>
              <span className="mb-perk">
                <Icon id="i-play" w={13} h={13} />
                图音视频精讲
              </span>
              <span className="mb-perk">
                <Icon id="i-phone" w={13} h={13} />
                电话问答 · VIP 优先
              </span>
            </div>
            {/* 0718 #8②：套餐卡——续费语义 pill 直接写在卡名旁，不再藏进小字；整卡可点 */}
            <div className="mb-plans">
              <div className={'mb-plan' + (monthly ? ' sel' : '')} onClick={() => setPlan(0)}>
                <span className="mb-plan-badge">首月特惠</span>
                <span className="mb-check">{monthly && <Icon id="i-check" />}</span>
                <div className="mb-plan-main">
                  <div className="mb-plan-t">
                    连续包月
                    <span className="mb-plan-renew">自动续费 · 可随时取消</span>
                  </div>
                  <div className="mb-plan-d">首月 ¥9.9（原价 ¥19.9），次月起 ¥19.9/月 自动续费；退订后当期仍可用至期满</div>
                </div>
                <div className="mb-plan-price">
                  <div className="mb-plan-now">¥9.9</div>
                  <div className="mb-plan-old">首月</div>
                </div>
              </div>
              <div className={'mb-plan' + (!monthly ? ' sel' : '')} onClick={() => setPlan(1)}>
                <span className="mb-check">{!monthly && <Icon id="i-check" />}</span>
                <div className="mb-plan-main">
                  <div className="mb-plan-t">
                    单月会员
                    <span className="mb-plan-renew gray">一次性购买 · 不自动续费</span>
                  </div>
                  <div className="mb-plan-d">¥19.9 / 1 个月，到期自动失效不扣款，适合先体验一个月</div>
                </div>
                <div className="mb-plan-price">
                  <div className="mb-plan-now">¥19.9</div>
                  <div className="mb-plan-old">/ 1 个月</div>
                </div>
              </div>
            </div>
            <div className="member-foot">
              {/* 0718 #8③：协议勾选真实可点；协议随方式联动——连续包月多一份《自动续费协议》 */}
              <div className="agree" onClick={() => setAgree((a) => !a)}>
                <span className={'bx' + (agree ? '' : ' off')}>{agree && <Icon id="i-check" />}</span>
                <span className="agree-txt">
                  已阅读并同意
                  <a onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>《会员服务协议》</a>
                  {monthly && (
                    <a onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>《自动续费协议》</a>
                  )}
                </span>
              </div>
              <button className={'btn btn-amber' + (agree ? '' : ' btn-dim')} style={{ width: '100%', justifyContent: 'center', padding: 14 }} onClick={onPay}>
                {monthly ? '¥9.9 开通连续包月' : '¥19.9 购买单月会员'}
              </button>
              {/* 0718 #4：按钮下方补充说明文案删除（续费规则由套餐卡内的续费语义 pill 与说明承载，不再页底重复） */}
            </div>
          </div>
        </div>
      </div>
      {gate}
    </>
  );
}
