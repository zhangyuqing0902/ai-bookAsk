import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { ORDERS, byPayDesc } from '../data/orders';

const TABS = ['全部', '会员', '永享', '兑换码'] as const;
// 0716 #4：订单支付成功才落库，故无「待支付」态；状态维度只留 已支付 / 退款售后。
const STATUS_CHIPS = ['全部', '已支付', '退款/售后'] as const;
// 把自由文本的 o.status 归并到两类状态分组（供状态 chips 过滤）
const statusGroup = (s: string): string => {
  if (s === '部分退款' || s === '全额退款' || s === '退款中') return '退款/售后';
  return '已支付'; // 已支付 / 已核销 等均归「已支付」
};

// 16 我的订单（类型 Tab + 状态 chips 双维度过滤；按付款时间降序；点击进详情）
export function Orders() {
  const nav = useNavigate();
  const [tab, setTab] = useState(0);
  const [statusChip, setStatusChip] = useState<(typeof STATUS_CHIPS)[number]>('全部');
  // 0716 #5：兑换码 tab 不做状态筛选（能显示的兑换码必为已核销），忽略 statusChip
  const isRedeemTab = tab === 3;
  const list = ORDERS.filter(
    (o) => (tab === 0 || o.type === TABS[tab]) && (isRedeemTab || statusChip === '全部' || statusGroup(o.status) === statusChip),
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
        {/* 0715 #7：订单状态 chips（第二维度）；0716 #5：兑换码 tab 隐藏状态筛选 */}
        {!isRedeemTab && (
          <div className="fchips">
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
                <span>{o.payTime}</span>
              </div>
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
