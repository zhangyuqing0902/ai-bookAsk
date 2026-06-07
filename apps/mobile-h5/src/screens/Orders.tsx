import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { ORDERS, byPayDesc } from '../data/orders';

const TABS = ['全部', '会员', '永享', '兑换码'] as const;

// 16 我的订单（4 Tab；按付款时间降序；点击进详情）
export function Orders() {
  const nav = useNavigate();
  const [tab, setTab] = useState(0);
  const list = ORDERS.filter((o) => tab === 0 || o.type === TABS[tab]).slice().sort(byPayDesc);
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
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
