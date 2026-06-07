import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { MediaView, type MediaItem } from '@aba/ui-admin';
import { AORDERS } from '../data/orders';

// 机构后台 · 订单详情（共性基础信息 + 类型个性化信息）
export function OrderDetail() {
  const nav = useNavigate();
  const { id } = useParams();
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const o = AORDERS.find((x) => x.id === id);

  return (
    <>
      <div className="kpd-head">
        <span className="kpd-back" onClick={() => nav(-1)}>
          <Icon id="i-chevL" />
          返回
        </span>
        <span className="kpd-name">订单详情</span>
        {o && <span className={'tag-s ' + o.tag}>{o.type}</span>}
      </div>

      {!o ? (
        <div className="card card-pad" style={{ textAlign: 'center', color: 'var(--ink-3)', padding: '60px 24px' }}>订单不存在</div>
      ) : (
        <div style={{ maxWidth: 640 }}>
          <div className="fm-card">
            <div className="fh">基础信息</div>
            <Row k="订单编号" v={o.id} mono />
            <Row k="订单类型" v={o.type} />
            <Row k="金额" v={'¥' + o.amount} mono />
            <Row k="支付方式" v={o.payMethod} />
            <Row k="订单状态" v={o.status} />
            <Row k="用户" v={o.user} mono />
            <Row k="下单时间" v={o.orderTime} mono />
            <Row k="付款时间" v={o.payTime} mono />
          </div>

          {o.type === '会员' && (
            <div className="fm-card">
              <div className="fh">会员权益</div>
              <Row k="会员有效期" v={`${o.memberFrom} 至 ${o.memberTo}`} mono />
            </div>
          )}
          {o.type === '永享' && o.media && (
            <div className="fm-card">
              <div className="fh">永享内容</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
                <div className="od-cover" style={{ width: 96, height: 96 }} onClick={() => setPreview(o.media!)}>
                  <Icon id={o.media.kind === 'image' ? 'i-image' : 'i-play'} w={28} h={28} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{o.media.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>关联知识产品 · {o.kp}</div>
                  <div style={{ fontSize: 12, color: 'var(--indigo-ink)', marginTop: 6, cursor: 'pointer' }} onClick={() => setPreview(o.media!)}>点击封面预览 ›</div>
                </div>
              </div>
            </div>
          )}
          {o.type === '兑换码' && (
            <div className="fm-card">
              <div className="fh">兑换码</div>
              <Row k="兑换码" v={o.code || ''} mono />
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
        <span style={mono ? { fontFamily: 'var(--mono)' } : undefined}>{v}</span>
      </div>
    </div>
  );
}
