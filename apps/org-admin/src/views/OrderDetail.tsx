import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { OrderDetailView } from '@aba/ui-admin';
import { AORDERS } from '../data/orders';
import { useRefundStore } from '../refundStore';

// 机构后台 · 订单详情（共用 OrderDetailView；退款状态 + 退款时间线）
export function OrderDetail() {
  const nav = useNavigate();
  const { id } = useParams();
  const o = AORDERS.find((x) => x.id === id);
  const rf = useRefundStore((s) => (o ? s.refunds[o.id] : undefined));

  return (
    <>
      <div className="kpd-head">
        <span className="kpd-back" onClick={() => nav(-1)}>
          <Icon id="i-chevL" />
          返回
        </span>
        <span className="kpd-name">{o?.type === '兑换码' ? '详情' : '订单详情'}</span>
        {o && <span className={'tag-s ' + o.tag}>{o.type}</span>}
      </div>

      {!o ? (
        <div className="card card-pad" style={{ textAlign: 'center', color: 'var(--ink-3)', padding: '60px 24px' }}>订单不存在</div>
      ) : (
        <OrderDetailView order={o} refund={rf} />
      )}
    </>
  );
}
