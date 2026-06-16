import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
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

// 12 会员中心（会员态）
export function MemberCenter() {
  const nav = useNavigate();
  const { guard, gate } = usePhoneGate();
  const [autoRenew, setAutoRenew] = useState(true);
  const [confirm, setConfirm] = useState(false);

  const doCancel = () => {
    setConfirm(false);
    setAutoRenew(false);
    toast('已取消成功,会员有效期至 2026.12.31 后将不再自动续费');
  };
  const reopen = () => {
    setAutoRenew(true);
    // 0613：开启自动续费 → 3 秒 tips，告知提前 3 天短信提醒
    toast('已开启自动续费 · 将于到期前 3 天短信提醒', 3000);
  };

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
          <div className="mc-card">
            <div className="mc-top">
              <div className="mc-brand">
                <span className="mc-logo">AI 问书</span>
                <span className="mc-tier">会员</span>
              </div>
              <div className="mc-emblem">
                <div className="orb float" style={{ width: 50, height: 50 }} />
              </div>
            </div>
            <div className="mc-bottom">
              <div className="mc-valid">
                <div className="lab">有效期至</div>
                <div className="date">2026.12.31</div>
              </div>
              <div className="mc-auto" style={!autoRenew ? { color: 'var(--ink-3)' } : undefined}>
                {autoRenew ? '按月自动续费' : '到期不再续费'}
              </div>
            </div>
          </div>
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
            {autoRenew ? (
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
            )}
            <div className="auto-tip">自动续费将于到期前 3 天短信提醒，可随时取消</div>
          </div>
        </div>
      </div>

      {/* 二次确认 sheet */}
      <div className={'ov' + (confirm ? ' open' : '')}>
        <div className="scrim" onClick={() => setConfirm(false)} />
        <div className="pw">
          <div className="pw-h">
            <div className="t">确认取消自动续费?</div>
            <div className="s">取消后会员有效期至 2026.12.31，到期将不再自动续费。</div>
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
      {/* 0614：续费(自动续费)前置手机号绑定校验——未绑先引导绑定，再续费 */}
      {gate}
    </>
  );
}
