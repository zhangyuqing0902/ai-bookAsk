import { useState } from 'react';
import { Icon } from '@aba/ui';
import { MediaView, type MediaItem } from './MediaView';

export interface OrderDetailOrder {
  id: string;
  org?: string;
  type: string;
  tag: string;
  title?: string;
  amount: number;
  status: string;
  payMethod: string;
  orderTime: string;
  payTime: string;
  user: string;
  autoRenew?: boolean;
  redeemTime?: string;
  kp?: string;
  media?: MediaItem;
  code?: string;
  memberFrom?: string;
  memberTo?: string;
}
export interface OrderDetailRefund {
  status: string;
  refundedAmount: number;
  by: string;
  account: string;
  timeline: { time: string; label: string }[];
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="fm-row">
      <div className="lab">{k}</div>
      <div className="ctl">
        <span style={{ fontSize: 13.5, color: 'var(--ink)', ...(mono ? { fontFamily: 'var(--mono)' } : null) }}>{v}</span>
      </div>
    </div>
  );
}

// 订单详情正文（机构后台「订单详情」+ 平台后台「全域订单详情」共用，0614b 抽公共组件）。
// showOrg=true 时多展示「归属机构」（平台视角）。
export function OrderDetailView({ order: o, refund: rf, showOrg }: { order: OrderDetailOrder; refund?: OrderDetailRefund; showOrg?: boolean }) {
  const [preview, setPreview] = useState<MediaItem | null>(null);

  if (o.type === '兑换码') {
    return (
      <div style={{ maxWidth: 640 }}>
        <div className="fm-card">
          {showOrg && o.org && <Row k="归属机构" v={o.org} />}
          <Row k="类型" v="兑换码核销" />
          <Row k="兑换码" v={o.code || ''} mono />
          <Row k="兑换时间" v={o.redeemTime || ''} mono />
        </div>
        <div className="fm-card">
          <div className="fh">兑换权益</div>
          <Row k="权益" v={o.title ?? ''} />
          <Row k="会员时间区间" v={`${o.memberFrom} 至 ${o.memberTo}`} mono />
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="fm-card">
        <div className="fh">基础信息</div>
        {showOrg && o.org && <Row k="归属机构" v={o.org} />}
        <Row k="订单编号" v={o.id} mono />
        <Row k="订单类型" v={o.type} />
        <Row k="金额" v={'¥' + o.amount} mono />
        <Row k="支付方式" v={o.payMethod} />
        {o.type === '会员' && <Row k="续费方式" v={o.autoRenew ? '自动续费' : '手动支付'} />}
        <Row k="订单状态" v={o.status} />
        <Row k="用户" v={o.user} mono />
        <Row k="下单时间" v={o.orderTime} mono />
        <Row k="付款时间" v={o.payTime} mono />
      </div>

      {rf && (
        <div className="fm-card">
          <div className="fh">退款信息</div>
          <Row k="退款状态" v={rf.status} />
          <Row k="已退金额" v={'¥' + rf.refundedAmount.toFixed(2)} mono />
          <Row k="发起人" v={rf.by} />
          <Row k="退回账户" v={rf.account} />
          <div className="fm-row" style={{ alignItems: 'flex-start' }}>
            <div className="lab">退款时间线</div>
            <div className="ctl">
              <div className="rf-timeline">
                {rf.timeline.slice().reverse().map((e, i) => (
                  <div className="rf-ev" key={i}>
                    <span className="rf-dot" />
                    <div>
                      <div className="rf-label">{e.label}</div>
                      <div className="rf-time mono">{e.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {o.type === '会员' && (
        <div className="fm-card">
          <div className="fh">会员权益</div>
          <Row k="会员有效期" v={`${o.memberFrom} 至 ${o.memberTo}`} mono />
        </div>
      )}
      {o.type === '永享' && o.media && (
        <div className="fm-card">
          <div className="fh">永享内容</div>
          <div className="od-yx tap" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 4px', cursor: 'pointer' }} onClick={() => setPreview(o.media!)}>
            <div className="od-cover" style={{ width: 96, height: 96, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, background: 'var(--surface-warm)', border: '1px solid var(--line-2)', color: 'var(--ink-3)' }}>
              <Icon id={o.media.kind === 'image' ? 'i-image' : 'i-play'} w={28} h={28} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{o.media.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>关联知识产品 · {o.kp}</div>
            </div>
            <Icon id="i-chevR" w={18} h={18} style={{ marginLeft: 'auto', color: 'var(--ink-3)' }} />
          </div>
        </div>
      )}
      <MediaView item={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
