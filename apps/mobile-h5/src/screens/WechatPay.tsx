import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { useDemoStore } from '@aba/mock';

// 模拟微信支付收银台（会员开通 / 永享买断 共用）。
// 0615：按打开环境区分两种支付通道——微信内走 JSAPI（公众号支付，应内直接调起）；微信外走 H5/MWEB（唤起微信 → 回跳）。
export function WechatPay() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const amount = sp.get('amount') ?? '0.00';
  const subject = sp.get('subject') ?? 'AI 问书';
  const wechatEnv = useDemoStore((s) => s.wechatEnv);
  const [hopping, setHopping] = useState(false); // 微信外：模拟唤起微信的中间过场

  const payInWechat = () => nav('/pay/success', { replace: true }); // JSAPI：微信内直接完成
  const payViaH5 = () => {
    // MWEB：浏览器内点击 → 唤起微信 → 支付完回跳；原型用 1.4s 过场模拟
    setHopping(true);
    setTimeout(() => nav('/pay/success', { replace: true }), 1400);
  };

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

        {/* 环境标签：一眼看出当前走的支付通道（随落地页「微信内 / 浏览器」开关联动） */}
        <div className="wxpay-env">
          <Icon id={wechatEnv ? 'i-spark' : 'i-globe'} w={13} h={13} />
          {wechatEnv ? '微信内支付 · 公众号 JSAPI' : '浏览器支付 · 微信 H5（MWEB）'}
        </div>

        {wechatEnv ? (
          <>
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
            <button className="wxpay-btn" onClick={payInWechat}>
              确认支付
            </button>
          </>
        ) : (
          <>
            <div className="wxpay-h5tip">
              <Icon id="i-warn" w={14} h={14} />
              跳转微信支付，付款成功自动返回当前页面
            </div>
            <button className="wxpay-btn" onClick={payViaH5}>
              唤起微信支付
            </button>
          </>
        )}

        <div className="wxpay-foot">
          <Icon id="i-shield" w={13} h={13} />
          模拟支付环境 · 不会产生真实扣款
        </div>
      </div>

      {/* 微信外：唤起微信的过场（模拟 MWEB 跳转微信中间页） */}
      {hopping && (
        <div className="wxpay-hop">
          <div className="wxpay-hop-card">
            <div className="wxpay-logo orb float" />
            <div className="wxpay-hop-t">正在唤起微信支付…</div>
            <div className="wxpay-hop-s">支付完成后将自动返回</div>
          </div>
        </div>
      )}
    </div>
  );
}
