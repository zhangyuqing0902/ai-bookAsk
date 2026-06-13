import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { DataGrid, MediaView, type Col, type MediaItem } from '@aba/ui-admin';
import { AORDERS, byPayDesc, type AOrder } from '../data/orders';

const YX: MediaItem[] = [
  { kind: 'image', name: '心电图示例' },
  { kind: 'audio', name: '专题讲座音频' },
  { kind: 'video', name: '手术演示' },
];

// 机构后台 · C 端用户详情
export function CUserDetail() {
  const nav = useNavigate();
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const rows = AORDERS.slice().sort(byPayDesc);

  const columns: Col<AOrder>[] = [
    { header: '订单号', className: 'mono', cell: (r) => r.id },
    { header: '类型', cell: (r) => <span className={'tag-s ' + r.tag}>{r.type}</span> },
    { header: '金额', className: 'mono', cell: (r) => '¥' + r.amount, sortValue: (r) => r.amount },
    { header: '支付方式', cell: (r) => r.payMethod },
    { header: '状态', cell: (r) => <span className="fstat ok"><span className="dt" />{r.status}</span> },
    { header: '付款时间', className: 'mono', cell: (r) => r.payTime, sortValue: (r) => r.payTime },
    { header: '操作', cell: (r) => <span className="op" onClick={() => nav('/orders/' + r.id)}>详情</span> },
  ];

  return (
    <>
      <div className="kpd-head">
        <span className="kpd-back" onClick={() => nav(-1)}>
          <Icon id="i-chevL" />
          返回
        </span>
        <span className="kpd-name">用户详情</span>
      </div>

      <div className="card card-pad" style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', flex: 'none', background: 'radial-gradient(120% 120% at 30% 25%,#fff,rgba(255,255,255,0) 40%),linear-gradient(150deg,#7c8bf5,#4b57e8)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, fontWeight: 700 }}>
            微信昵称A <span className="tag-s tag-amber">会员</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6, fontFamily: 'var(--mono)' }}>手机号 138****8888 · 微信号 wx_abc</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 5 }}>地区 上海 · 浦东 ｜ 性别 女 ｜ 活跃度：近 30 天提问 42 次 · 最近活跃 2026-06-06</div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 16 }}>
        <div className="block-t">已购永享 (3) <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: 12 }}>点击查看具体内容</span></div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {YX.map((m) => (
            <div
              key={m.name}
              onClick={() => setPreview(m)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 10, cursor: 'pointer', fontSize: 13 }}
            >
              <Icon id={m.kind === 'image' ? 'i-image' : 'i-play'} w={15} h={15} style={{ color: 'var(--indigo-ink)' }} />
              {m.name}
              <Icon id="i-chevR" w={13} h={13} style={{ color: 'var(--ink-3)' }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="block-t" style={{ marginBottom: 10 }}>全部订单</div>
        <DataGrid columns={columns} rows={rows} empty={{ title: '暂无订单' }} minWidth={760} />
      </div>
      <MediaView item={preview} onClose={() => setPreview(null)} />
    </>
  );
}
