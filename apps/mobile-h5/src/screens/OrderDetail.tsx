import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { MediaPreview, type PreviewItem } from '@aba/ui-mobile';
import { ORDERS } from '../data/orders';

// 我的订单 · 订单详情
export function OrderDetail() {
  const nav = useNavigate();
  const { id } = useParams();
  const [preview, setPreview] = useState<PreviewItem | null>(null);
  const o = ORDERS.find((x) => x.id === id);

  if (!o) {
    return (
      <>
        <div className="h5-top">
          <div className="ic tap" onClick={() => nav(-1)}>
            <Icon id="i-chevL" w={22} h={22} />
          </div>
          <div className="center">
            <div className="ttl">订单详情</div>
          </div>
          <div className="grp" />
        </div>
        <div className="pg">
          <div style={{ textAlign: 'center', color: 'var(--ink-3)', padding: '60px 24px' }}>订单不存在</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="h5-top">
        <div className="ic tap" onClick={() => nav(-1)}>
          <Icon id="i-chevL" w={22} h={22} />
        </div>
        <div className="center">
          <div className="ttl">订单详情</div>
        </div>
        <div className="grp" />
      </div>
      <div className="pg">
        <div className="scrollY">
          <div style={{ textAlign: 'center', padding: '22px 0 6px' }}>
            <span className={'tag-s ' + o.tag}>{o.type}</span>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 500, marginTop: 10 }}>{o.amount}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 4 }}>{o.title} · {o.status}</div>
          </div>

          <div className="od-card">
            <div className="od-h">基础信息</div>
            <div className="od-row">
              <span className="k">订单编号</span>
              <span className="v">{o.id}</span>
            </div>
            <div className="od-row">
              <span className="k">支付方式</span>
              <span className="v">{o.payMethod}</span>
            </div>
            <div className="od-row">
              <span className="k">下单时间</span>
              <span className="v">{o.orderTime}</span>
            </div>
            <div className="od-row">
              <span className="k">付款时间</span>
              <span className="v">{o.payTime}</span>
            </div>
          </div>

          {o.type === '会员' && (
            <div className="od-card">
              <div className="od-h">会员权益</div>
              <div className="od-row">
                <span className="k">会员有效期</span>
                <span className="v">{o.memberFrom} 至 {o.memberTo}</span>
              </div>
            </div>
          )}

          {o.type === '永享' && o.media && (
            <div className="od-card">
              <div className="od-h">永享内容</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px' }}>
                <div className="od-cover" onClick={() => setPreview(o.media!)}>
                  <Icon id={o.media.kind === 'image' ? 'i-image' : 'i-play'} w={26} h={26} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{o.media.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>关联知识产品 · {o.kp}</div>
                  <div style={{ fontSize: 12, color: 'var(--indigo-ink)', marginTop: 6 }}>点击封面预览 ›</div>
                </div>
              </div>
            </div>
          )}

          {o.type === '兑换码' && (
            <div className="od-card">
              <div className="od-h">兑换码</div>
              <div className="od-row">
                <span className="k">兑换码</span>
                <span className="v" style={{ color: 'var(--ink)', fontWeight: 600 }}>{o.code}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <MediaPreview item={preview} onClose={() => setPreview(null)} />
    </>
  );
}
