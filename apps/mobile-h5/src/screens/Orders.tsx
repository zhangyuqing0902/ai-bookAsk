import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { ORDERS, byPayDesc } from '../data/orders';

const TABS = ['全部', '会员', '永享', '兑换码'] as const;
// 0722：订单四态——发起支付即落库为「待支付」（0812-e：支付有效期全平台统一 15 分钟），到期转「已失效」；退款售后为独立分组。
const STATUS_CHIPS = ['全部', '待支付', '已支付', '已失效', '退款/售后'] as const;
// 0812：筛选改双维谓词（订单状态 × 退款状态，与后台同模型）——一单可命中多个筛选：
// 「已支付」＝付款曾成功（含其后退款中 / 部分 / 全额退款的单，钱的事实由卡片退款标记表达）；
// 「退款/售后」＝发生过退款动作。全额退款的单不再从「已支付」里消失，避免用户"找不到付过钱的订单"。
const REFUNDISH = ['退款中', '部分退款', '全额退款'];
const matchesChip = (s: string, chip: string): boolean => {
  if (chip === '全部') return true;
  if (chip === '待支付' || chip === '已失效') return s === chip;
  if (chip === '退款/售后') return REFUNDISH.includes(s);
  return s === '已支付' || s === '已核销' || REFUNDISH.includes(s); // chip=已支付
};
const fmtCd = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// 16 我的订单（类型 Tab + 状态 chips 双维度过滤；按付款时间降序；点击进详情）
export function Orders() {
  const nav = useNavigate();
  const [tab, setTab] = useState(0);
  const [statusChip, setStatusChip] = useState<(typeof STATUS_CHIPS)[number]>('全部');
  // 0722：待支付倒计时（演示值从 payRemainSec 起算）；0724b：按进入页面的时间戳计算流逝，
  // 后台标签页 / 锁屏节流 setInterval 时切回即校准（逐秒 +1 的写法会在页面后台时变慢）
  const mountTs = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const hasPending = ORDERS.some((o) => o.status === '待支付');
  useEffect(() => {
    if (!hasPending) return;
    const tick = () => setElapsed(Math.floor((Date.now() - mountTs.current) / 1000));
    const t = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [hasPending]);
  // 0716 #5：兑换码 tab 不做状态筛选（能显示的兑换码必为已核销），忽略 statusChip
  const isRedeemTab = tab === 3;
  const list = ORDERS.filter(
    (o) => (tab === 0 || o.type === TABS[tab]) && (isRedeemTab || matchesChip(o.status, statusChip)),
  ).slice().sort(byPayDesc);
  return (
    <>
      <div className="h5-top">
        <div className="ic tap" onClick={() => nav(-1)}>
          <Icon id="i-chevL" w={22} h={22} />
        </div>
        <div className="center">
          <div className="ttl">我的订单</div>
        </div>
        <div className="grp" />
      </div>
      <div className="pg">
        <div className="otabs">
          {TABS.map((t, i) => (
            <div className={'otab' + (tab === i ? ' on' : '')} key={t} onClick={() => setTab(i)}>
              {t}
            </div>
          ))}
        </div>
        {/* 0715 #7：订单状态 chips（第二维度）；0716 #5：兑换码 tab 隐藏状态筛选；0724：五档单行不换行 */}
        {!isRedeemTab && (
          <div className="fchips fchips-line">
            {STATUS_CHIPS.map((s) => (
              <span key={s} className={'fchip' + (statusChip === s ? ' on' : '')} onClick={() => setStatusChip(s)}>
                {s}
              </span>
            ))}
          </div>
        )}
        <div className="scrollY" style={{ paddingTop: 8 }}>
          {list.map((o) => (
            <div className="order tap" key={o.id} onClick={() => nav('/me/orders/' + o.id)}>
              <div className="order-top">
                <span className="order-type">
                  <span className={'tg tag-s ' + o.tag}>{o.type}</span>
                  {o.title}
                </span>
                <span className="order-amt">{o.amount}</span>
              </div>
              {o.type === '永享' && <div className="order-kp">关联知识产品 · {o.kp} · {o.media?.name}</div>}
              {o.type === '兑换码' && (
                <div className="order-kp">
                  兑换码 <span style={{ fontFamily: 'var(--mono)', color: 'var(--ink)', fontWeight: 600 }}>{o.code}</span>
                </div>
              )}
              <div className="order-meta">
                <span>{o.status}</span>
                {/* 0722：待支付 / 已失效无付款时间，显示下单时间 */}
                <span>{o.payTime || o.orderTime}</span>
              </div>
              {/* 0722：待支付条——剩余支付时间倒计时 + 去支付（15 分钟未支付自动失效） */}
              {o.status === '待支付' && (
                <div className="pay-pending-strip" onClick={(e) => e.stopPropagation()}>
                  <span>剩余支付时间</span>
                  <span className="cd">{fmtCd(Math.max(0, (o.payRemainSec ?? 0) - elapsed))}</span>
                  <span className="go-pay tap" onClick={() => nav('/pay/wechat')}>去支付</span>
                </div>
              )}
              {!!o.refunds?.length && (
                <div className="refund-strip">
                  {/* 展示全部退款记录（同一订单可多笔），不静默截断 */}
                  {o.refunds.map((refund) => (
                    <div className="refund-strip-row" key={refund.id}>
                      <span className={'refund-state ' + (refund.status === '退款成功' ? 'success' : refund.status === '退款失败' ? 'failed' : 'processing')}>{refund.status}</span>
                      <span>{refund.amount}</span>
                      <span>{refund.createdAt.slice(0, 10)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
