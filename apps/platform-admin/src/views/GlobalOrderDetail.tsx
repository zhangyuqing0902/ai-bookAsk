import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { OrderDetailView } from '@aba/ui-admin';
import { AORDERS, useRefundStore } from '@aba/mock';

// 平台后台 · 全域订单详情（0614b：复用机构后台订单详情 OrderDetailView，多展示「归属机构」；
// 数据与退款状态同机构后台一份，按订单号查询）。
export function GlobalOrderDetail() {
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
        <OrderDetailView order={o} refund={rf} showOrg />
      )}
    </>
  );
}
