import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { MediaView, type MediaItem } from '@aba/ui-admin';
import { AORDERS } from '../data/orders';
import { useRefundStore } from '../refundStore';

// 机构后台 · 订单详情（共性基础信息 + 类型个性化信息）。0613：退款状态 + 退款时间线。
export function OrderDetail() {
  const nav = useNavigate();
  const { id } = useParams();
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const o = AORDERS.find((x) => x.id === id);
  const rf = useRefundStore((s) => (o ? s.refunds[o.id] : undefined));

  return (
    <>
      <div className="kpd-head">
        <span className="kpd-back" onClick={() => nav(-1)}>
          <Icon id="i-chevL" />
          返回
        </span>
        {/* 兑换码叫「详情」,其余叫「订单详情」 */}
        <span className="kpd-name">{o?.type === '兑换码' ? '详情' : '订单详情'}</span>
        {o && <span className={'tag-s ' + o.tag}>{o.type}</span>}
      </div>

      {!o ? (
        <div className="card card-pad" style={{ textAlign: 'center', color: 'var(--ink-3)', padding: '60px 24px' }}>订单不存在</div>
      ) : o.type === '兑换码' ? (
        // 9.4:兑换码详情对齐前台 —— 极简字段,无订单编号/支付方式/下单付款时间/金额
        <div style={{ maxWidth: 640 }}>
          <div className="fm-card">
            <Row k="类型" v="兑换码核销" />
            <Row k="兑换码" v={o.code || ''} mono />
            <Row k="兑换时间" v={o.redeemTime || ''} mono />
          </div>
          <div className="fm-card">
            <div className="fh">兑换权益</div>
            <Row k="权益" v={o.title} />
            <Row k="会员时间区间" v={`${o.memberFrom} 至 ${o.memberTo}`} mono />
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 640 }}>
          <div className="fm-card">
            <div className="fh">基础信息</div>
            <Row k="订单编号" v={o.id} mono />
            <Row k="订单类型" v={o.type} />
            <Row k="金额" v={'¥' + o.amount} mono />
            <Row k="支付方式" v={o.payMethod} />
            {/* 9.4:会员订单在支付方式下方标识续费方式 */}
            {o.type === '会员' && <Row k="续费方式" v={o.autoRenew ? '自动续费' : '手动支付'} />}
            <Row k="订单状态" v={rf ? rf.status : o.status} />
            <Row k="用户" v={o.user} mono />
            <Row k="下单时间" v={o.orderTime} mono />
            <Row k="付款时间" v={o.payTime} mono />
          </div>

          {rf && (
            <div className="fm-card">
              <div className="fh">退款信息</div>
              <Row k="退款状态" v={rf.status} />
              <Row k="已退金额" v={'¥' + rf.refundedAmount.toFixed(2)} mono />
              <Row k="退回账户" v={rf.account} />
              <div className="fm-row" style={{ alignItems: 'flex-start' }}>
                <div className="lab">退款时间线</div>
                <div className="ctl">
                  <div className="rf-timeline">
                    {rf.timeline.map((e, i) => (
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
              {/* 9.4:整行可点直接预览,去掉「点击封面预览」文字按钮;8.3:图片与右侧文字垂直对齐 */}
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
        </div>
      )}
      <MediaView item={preview} onClose={() => setPreview(null)} />
    </>
  );
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
