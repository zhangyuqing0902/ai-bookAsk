import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { useDemoStore } from '@aba/mock';

// 0812：H5/MWEB 支付权限被微信审核拒绝，非微信浏览器通道改为 Native 扫码——
// 生成支付二维码 → 保存 / 截图 → 微信扫一扫从相册选图 → 支付；页面轮询查单，成功自动跳转。
// 伪二维码图案：按订单摘要确定性生成（仅演示视觉，非真实可扫码）；订单详情 Native 待支付卡复用。
export function FakeQr({ seed }: { seed: string }) {
  const N = 21;
  const cells: boolean[] = [];
  let h = 5381;
  for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) >>> 0;
  for (let i = 0; i < N * N; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push(((h >> 16) & 1) === 1);
  }
  const inFinder = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= N - 7) || (r >= N - 7 && c < 7);
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} fill="#111" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="#111" />
    </g>
  );
  return (
    <svg viewBox={`0 0 ${N} ${N}`} className="wxqr-svg" shapeRendering="crispEdges">
      <rect width={N} height={N} fill="#fff" />
      {cells.map((on, i) => {
        const r = Math.floor(i / N); const c = i % N;
        return on && !inFinder(r, c) ? <rect key={i} x={c} y={r} width={1} height={1} fill="#111" /> : null;
      })}
      {finder(0, 0)}
      {finder(N - 7, 0)}
      {finder(0, N - 7)}
    </svg>
  );
}

// 模拟微信支付收银台（会员开通 / 永享买断 共用）。
// 0615：按打开环境区分支付通道——微信内走 JSAPI（公众号支付，应内直接调起）；
// 0812：微信外由 H5/MWEB 改为 Native 扫码（权限被拒预案），流程见上。
export function WechatPay() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const amount = sp.get('amount') ?? '0.00';
  const subject = sp.get('subject') ?? 'AI 问书';
  const wechatEnv = useDemoStore((s) => s.wechatEnv);
  const polled = useRef(false);

  const payInWechat = () => nav('/pay/success', { replace: true }); // JSAPI：微信内直接完成
  // Native：页面持续轮询查单（演示 20s 后视为已在微信完成支付，自动跳转——回流零操作）
  useEffect(() => {
    if (wechatEnv || polled.current) return;
    polled.current = true;
    const t = setTimeout(() => nav('/pay/success', { replace: true }), 20000);
    return () => clearTimeout(t);
  }, [wechatEnv, nav]);
  const saveQr = () => toast('二维码已保存到相册');
  const checkPaid = () => {
    toast('已确认到账');
    setTimeout(() => nav('/pay/success', { replace: true }), 600);
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
        {/* 0812-d：去掉商户 logo 区，金额上移；「等待支付中」条提到价格下方（仅非微信扫码分支） */}
        <div className="wxpay-amount">¥{amount}</div>
        <div className="wxpay-subject">{subject}</div>

        {!wechatEnv && (
          <div className="wxqr-wait">
            <span className="wxqr-dot" />
            等待支付中 · 支付成功后本页自动跳转
            <span className="wxqr-check tap" onClick={checkPaid}>我已完成支付</span>
          </div>
        )}

        {/* 环境标签：微信内保留；0812-b：非微信分支不显示（二维码形态已自解释，删标签减噪） */}
        {wechatEnv && (
          <div className="wxpay-env">
            <Icon id="i-spark" w={13} h={13} />
            微信内支付 · 公众号 JSAPI
          </div>
        )}

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
            {/* 0812：Native 扫码卡——大二维码 + 一键保存 + 三步引导 + 轮询回流；长按/截图兜底行删除
                0812-e：支付有效期全平台统一 15 分钟——二维码与订单同生共死（下单传 time_expire，码随单失效） */}
            <div className="wxqr-card">
              <FakeQr seed={`${subject}|${amount}`} />
              <div className="wxqr-expire"><Icon id="i-clock" w={12} h={12} />二维码 15 分钟内有效 · 过期可返回重新下单</div>
            </div>
            <button className="wxpay-btn" onClick={saveQr}>
              <Icon id="i-dl" w={15} h={15} /> 保存二维码到相册
            </button>
            <div className="wxqr-steps">
              <div className="wxqr-step"><i>1</i>保存二维码</div>
              <div className="wxqr-step"><i>2</i>微信扫一扫，点击相册</div>
              <div className="wxqr-step"><i>3</i>选择二维码完成支付</div>
            </div>
          </>
        )}

        <div className="wxpay-foot">
          <Icon id="i-shield" w={13} h={13} />
          模拟支付环境 · 不会产生真实扣款
        </div>
      </div>
    </div>
  );
}
