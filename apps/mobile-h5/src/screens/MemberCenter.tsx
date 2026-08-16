import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { useDemoStore, graceRemainHours, graceRemainText, GRACE_HOURS } from '@aba/mock';
import { usePhoneGate } from '../usePhoneGate';

const GRAD_BG = 'linear-gradient(176deg,#F0F3FE 0%,#F4F1FC 46%,#FDF4F1 100%)';

// 0613：免费 vs 会员 权益对比，强化付费价值感
const CMP_ROWS: { label: string; free: boolean | string; member: boolean | string }[] = [
  { label: '基础文字知识问答', free: true, member: true },
  { label: '图音视频深度知识精讲', free: false, member: true },
  { label: 'VIP 极速优先通道', free: false, member: true },
  { label: '实时电话即时问答', free: false, member: true },
  { label: '永享名家典藏知识', free: '单独购买', member: '单独购买' },
];

function Cell({ v }: { v: boolean | string }) {
  if (typeof v === 'string') return <span className="c sm">{v}</span>;
  return v ? <span className="c yes">✓</span> : <span className="c no">✗</span>;
}

const dot = (d?: string) => (d ? d.replace(/-/g, '.') : '—');

// 12 会员中心
// 0814-2：本页原先脱离 store（autoRenew 是本地 state、到期日写死 2026.12.31、只有一种会员形态），
//   过期/未开通用户进来会看到一张假的有效会员卡。本次接入 user.membership，按四态渲染。
//   宽限期＝到期后 72 小时会员缓冲使用期，权益仍生效——所以卡片保持「会员卡」形态（降级成空态
//   等于告诉用户他不是会员，是撒谎），只换琥珀色调 + 倒计时 + 续费主按钮。
//   琥珀而非赤陶：赤陶＝已失效，琥珀＝还能用但需行动，与后台四态标签色一致。
//   C 端不出现「宽限期」这个名词——见 memberState.ts graceRemainText 的说明。
export function MemberCenter() {
  const nav = useNavigate();
  const { guard, gate } = usePhoneGate();
  const membership = useDemoStore((s) => s.user.membership);
  const setMembershipRenewal = useDemoStore((s) => s.setMembershipRenewal);
  const [confirm, setConfirm] = useState(false);
  const [explain, setExplain] = useState(false); // 0814-3：缓冲期说明半屏 sheet

  const { state, expiresAt, autoRenew } = membership;
  const isGrace = state === 'grace';
  const isActive = state === 'active';
  const expireDot = dot(expiresAt);
  const remainH = isGrace && expiresAt ? graceRemainHours(expiresAt) : 0;

  const doCancel = () => {
    setConfirm(false);
    setMembershipRenewal(false);
    toast(`已取消成功，会员有效期至 ${expireDot} 后将不再自动续费`);
  };
  const reopen = () => {
    setMembershipRenewal(true);
    // 0613：开启自动续费 → 3 秒 tips；0812：提醒时点定版为「扣费前 5 天」（扣费日=到期日前 1 天）
    toast('已开启自动续费 · 将于扣费前 5 天短信提醒', 3000);
  };

  // 卡片形态：有效＝靛紫原样；宽限＝琥珀（权益还在，待行动）；过期/未开通＝灰（权益已停）
  const cardCls = 'mc-card' + (isGrace ? ' grace' : isActive ? '' : ' off');

  return (
    <>
      <div className="h5-top">
        <div className="ic tap" onClick={() => nav(-1)}>
          <Icon id="i-chevL" w={22} h={22} />
        </div>
        <div className="center">
          <div className="ttl">会员中心</div>
        </div>
        <div className="grp" />
      </div>
      <div className="pg" style={{ background: GRAD_BG }}>
        <div className="scrollY">
          <div className={cardCls}>
            <div className="mc-top">
              <div className="mc-brand">
                <span className="mc-logo">AI 问书</span>
                <span className="mc-tier-row">
                  <span className="mc-tier">会员</span>
                  {isGrace && <span className="mc-flag">已到期</span>}
                  {state === 'expired' && <span className="mc-flag">已失效</span>}
                  {state === 'none' && <span className="mc-flag">未开通</span>}
                </span>
              </div>
              <div className="mc-emblem">
                <div className="orb float" style={{ width: 50, height: 50 }} />
              </div>
            </div>
            <div className="mc-bottom">
              <div className="mc-valid">
                {/* 宽限期首先回答「我现在还能用吗、还剩多久」——这是用户唯一真正关心的事，
                    到期日退为次要信息。其余三态维持「有效期至 / 到期日」的原语义。 */}
                <div className="lab">{isGrace ? '权益还可使用' : isActive ? '有效期至' : state === 'expired' ? '会员已到期' : '尚未开通'}</div>
                <div className="date">{isGrace ? graceRemainText(remainH) : state === 'none' ? '—' : expireDot}</div>
              </div>
              <div className="mc-auto" style={isActive && !autoRenew ? { color: 'var(--ink-3)' } : undefined}>
                {isGrace
                  ? `已于 ${expireDot} 到期`
                  : isActive
                    ? autoRenew
                      ? '按月自动续费'
                      : '到期不再续费'
                    : state === 'expired'
                      ? '权益已暂停'
                      : '开通后即刻生效'}
              </div>
            </div>
          </div>
          {/* 0814-3：缓冲期机制说明从卡内段落改为卡外可点链接。卡片是身份凭证，不是条款栏——
              「已到期」+「权益还可使用 剩 N 小时」两个标签已把「到期了但还能用、还剩多久」说完，
              再写一段机制介绍是同一句话说第二遍。链接文案直接用用户的原始疑问，不用「缓冲期」这个机制名词。 */}
          {isGrace && (
            <div className="mc-explain" onClick={() => setExplain(true)}>
              为什么到期了还能用？
            </div>
          )}
          <div className="my-sec">免费 vs 会员 · 权益对比</div>
          <div className="cmp">
            <div className="cmp-row head">
              <span>权益</span>
              <span className="cmp-col" style={{ color: 'var(--ink-3)' }}>免费</span>
              <span className="cmp-col" style={{ color: 'var(--amber)' }}>会员</span>
            </div>
            {CMP_ROWS.map((r) => (
              <div className="cmp-row" key={r.label}>
                <span>{r.label}</span>
                <Cell v={r.free} />
                <Cell v={r.member} />
              </div>
            ))}
          </div>
          <div style={{ padding: '20px 16px' }}>
            {isActive ? (
              autoRenew ? (
                <button
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'center', color: 'var(--terra)', borderColor: 'var(--terra-soft)' }}
                  onClick={() => setConfirm(true)}
                >
                  取消自动续费
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={guard(reopen)}
                >
                  自动续费
                </button>
              )
            ) : (
              // 宽限/过期/未开通：主按钮只有一个动作——去续费。不给第二选项分散注意力。
              <button
                className="btn btn-amber"
                style={{ width: '100%', justifyContent: 'center', padding: 14 }}
                onClick={guard(() => nav('/member'))}
              >
                {isGrace ? '立即续费 · 恢复会员' : state === 'expired' ? '重新开通会员' : '开通会员'}
              </button>
            )}
            {/* 0814-3：宽限期与已过期两态的底部说明按评审删除——宽限期该说的已在卡内说明里说完，
                重复一遍反而稀释「立即续费」这个唯一动作；已过期态那句是常识，不需要占一行。 */}
            {(isActive || state === 'none') && (
              <div className="auto-tip">
                {isActive
                  ? '自动续费将于扣费前 5 天短信提醒，可随时取消'
                  : `开通后受限内容即刻解锁；到期额外赠送 ${GRACE_HOURS} 小时缓冲使用期`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 二次确认 sheet */}
      <div className={'ov' + (confirm ? ' open' : '')}>
        <div className="scrim" onClick={() => setConfirm(false)} />
        <div className="pw">
          <div className="pw-h">
            <div className="t">确认取消自动续费?</div>
            <div className="s">取消后会员有效期至 {expireDot}，到期将不再自动续费。</div>
          </div>
          <div className="pw-btns">
            {/* 主操作=暂不取消(挽留),弱化确认取消为文字次按钮 */}
            <button className="btn btn-primary" onClick={() => setConfirm(false)}>
              暂不取消
            </button>
            <button className="btn btn-text-weak" onClick={doCancel}>
              确认取消
            </button>
          </div>
        </div>
      </div>
      {/* 0814-3：缓冲期说明 sheet——按需展开，不占卡面。三段分别回答：还能用吗 / 会不会白付 / 之后怎样 */}
      <div className={'ov' + (explain ? ' open' : '')}>
        <div className="scrim" onClick={() => setExplain(false)} />
        <div className="pw">
          <div className="pw-h">
            <div className="t">关于到期缓冲期</div>
            {/* 三段说明左对齐——.pw-h .s 默认居中是为一行确认副标题设计的，多段居中很难读 */}
            <div className="s pw-s-left">
              会员到期享 {GRACE_HOURS} 小时缓冲期，全部会员权益正常可用。
              <br />
              <br />
              缓冲时长不计会员有效期，缓冲期续费，新时长从缴费当日起算。
              <br />
              <br />
              缓冲期满权益暂停，续费后即可立即恢复使用。
            </div>
          </div>
          <div className="pw-btns">
            <button className="btn btn-primary" onClick={() => setExplain(false)}>
              知道了
            </button>
          </div>
        </div>
      </div>
      {/* 0614：续费(自动续费)前置手机号绑定校验——未绑先引导绑定，再续费 */}
      {gate}
    </>
  );
}
