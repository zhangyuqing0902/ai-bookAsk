import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { MediaView, type MediaItem } from '@aba/ui-admin';

interface GOrder {
  no: string;
  org: string;
  type: string;
  typeCls: string;
  amount: number;
  status: string;
  user: string;
  time: string;
}
const FALLBACK: GOrder = { no: 'OD20260530140208', org: 'XX 出版集团', type: '会员', typeCls: 'tag-amber', amount: 19.9, status: '已支付', user: '138****8888', time: '2026-05-30 14:02:08' };

// 平台后台 · 全域订单详情（结构对齐机构后台订单详情,多展示一个「机构」字段；三类差异化）
export function GlobalOrderDetail() {
  const nav = useNavigate();
  const loc = useLocation();
  const o = (loc.state as GOrder) ?? FALLBACK;
  const [preview, setPreview] = useState<MediaItem | null>(null);

  const isCode = o.type === '兑换码';
  const media: MediaItem = { kind: 'video', name: '手术演示视频' };

  return (
    <>
      <div className="kpd-head">
        <span className="kpd-back" onClick={() => nav(-1)}>
          <Icon id="i-chevL" />
          返回
        </span>
        <span className="kpd-name">{isCode ? '详情' : '订单详情'}</span>
        <span className={'tag-s ' + o.typeCls}>{o.type}</span>
      </div>

      {isCode ? (
        // 兑换码：极简字段(对齐机构后台/前台) + 机构
        <div style={{ maxWidth: 640 }}>
          <div className="fm-card">
            <Row k="所属机构" v={o.org} />
            <Row k="类型" v="兑换码核销" />
            <Row k="兑换码" v="A7K9QP" mono />
            <Row k="兑换时间" v={o.time} mono />
          </div>
          <div className="fm-card">
            <div className="fh">兑换权益</div>
            <Row k="权益" v="会员 3 个月" />
            <Row k="会员时间区间" v="2026-05-29 至 2026-08-29" mono />
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 640 }}>
          <div className="fm-card">
            <div className="fh">基础信息</div>
            <Row k="订单编号" v={o.no} mono />
            {/* 多一个「所属机构」字段(平台视角) */}
            <Row k="所属机构" v={o.org} />
            <Row k="订单类型" v={o.type} />
            <Row k="金额" v={'¥' + o.amount} mono />
            <Row k="支付方式" v="微信支付" />
            {o.type === '会员' && <Row k="续费方式" v="自动续费" />}
            <Row k="订单状态" v={o.status} />
            <Row k="用户" v={o.user} mono />
            <Row k="下单时间" v={o.time} mono />
            <Row k="付款时间" v={o.time} mono />
          </div>

          {o.type === '会员' && (
            <div className="fm-card">
              <div className="fh">会员权益</div>
              <Row k="会员有效期" v="2026-05-30 至 2026-06-30" mono />
            </div>
          )}
          {o.type === '永享' && (
            <div className="fm-card">
              <div className="fh">永享内容</div>
              <div className="od-yx" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 4px', cursor: 'pointer' }} onClick={() => setPreview(media)}>
                <div className="od-cover" style={{ width: 96, height: 96 }}>
                  <Icon id="i-play" w={28} h={28} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{media.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>关联知识产品 · 外科学</div>
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
