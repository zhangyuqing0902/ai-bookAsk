import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';

const GRAD_BG = 'linear-gradient(176deg,#F0F3FE 0%,#F4F1FC 46%,#FDF4F1 100%)';

// 12 会员中心（会员态）
export function MemberCenter() {
  const nav = useNavigate();
  const [autoRenew, setAutoRenew] = useState(true);
  const [confirm, setConfirm] = useState(false);

  const doCancel = () => {
    setConfirm(false);
    setAutoRenew(false);
    toast('已取消成功,会员有效期至 2026.12.31 后将不再自动续费');
  };
  const reopen = () => {
    setAutoRenew(true);
    toast('已开启自动续费');
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
          <div className="my-sec">会员权益</div>
          <div className="mlist">
            <div className="benefit">
              <Icon id="i-check" />
              解锁全部受限图 / 音 / 视内容
            </div>
            <div className="benefit">
              <Icon id="i-check" />
              实时电话语音问答
            </div>
            <div className="benefit" style={{ borderBottom: 'none' }}>
              <Icon id="i-check" />
              更快的响应与优先排队
            </div>
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
                onClick={reopen}
              >
                自动续费
              </button>
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
    </>
  );
}
