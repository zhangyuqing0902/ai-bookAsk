import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@aba/ui';

// 模拟微信支付收银台（会员开通 / 永享买断 共用同一套交互）
export function WechatPay() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const amount = sp.get('amount') ?? '0.00';
  const subject = sp.get('subject') ?? 'AI 问书';

  return (
    <div className="wxpay">
      <div className="wxpay-top">
        <div className="ic tap" onClick={() => nav(-1)}>
          <Icon id="i-chevL" w={22} h={22} />
        </div>
        <div className="wxpay-title">微信支付</div>
        <div className="grp" />
      </div>

      <div className="wxpay-body">
        <div className="wxpay-merchant">
          <div className="wxpay-logo orb float" />
          <div className="wxpay-mname">AI 问书</div>
        </div>

        <div className="wxpay-amount">¥{amount}</div>
        <div className="wxpay-subject">{subject}</div>

        <div className="wxpay-method">
          <div className="wxpay-m-left">
            <span className="wxpay-m-ic">零</span>
            <div>
              <div className="wxpay-m-name">零钱</div>
              <div className="wxpay-m-bal">余额 ¥128.50</div>
            </div>
          </div>
          <span className="wxpay-m-check">
            <Icon id="i-check" w={15} h={15} />
          </span>
        </div>

        <button className="wxpay-btn" onClick={() => nav('/pay/success', { replace: true })}>
          确认支付
        </button>
        <div className="wxpay-foot">
          <Icon id="i-shield" w={13} h={13} />
          模拟支付环境 · 不会产生真实扣款
        </div>
      </div>
    </div>
  );
}
