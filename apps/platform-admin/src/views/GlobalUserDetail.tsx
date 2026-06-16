import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { DataGrid, MediaView, type Col, type MediaItem } from '@aba/ui-admin';
import { AORDERS, byPayDesc, useRefundStore, type AOrder } from '@aba/mock';

interface GUser {
  nick: string;
  wx: string;
  phone: string;
  org: string;
  member: boolean;
  yx: number;
  gmv: number;
  lastLogin: string;
}

const FALLBACK: GUser = { nick: '微信昵称A', wx: 'wx_abc', phone: '138****8888', org: 'XX 出版社', member: true, yx: 3, gmv: 129.6, lastLogin: '2026-06-06 21:30:11' };
const YX: MediaItem[] = [
  { kind: 'image', name: '心电图示例' },
  { kind: 'audio', name: '专题讲座音频' },
  { kind: 'video', name: '手术演示' },
];
const RF_CLS: Record<string, string> = { 未退款: 'none', 退款中: 'ing', 部分退款: 'wait', 全额退款: 'fail' };
const ORDER_CLS: Record<string, string> = { 已支付: 'ok', 已核销: 'none' };

// 平台后台 · 全域用户详情（结构对齐机构后台用户详情，多展示「机构」字段；
// 0614b：全部订单复用全域订单同一份数据 @aba/mock，按当前用户过滤，不再单写一套）
export function GlobalUserDetail() {
  const nav = useNavigate();
  const loc = useLocation();
  const u = (loc.state as GUser) ?? FALLBACK;
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const refunds = useRefundStore((s) => s.refunds);
  const refundStatusOf = (r: AOrder) => refunds[r.id]?.status ?? '未退款';

  // 复用全域订单数据，按当前用户（微信号 / 手机号）过滤
  const myOrders = AORDERS.filter((r) => r.user === u.wx || r.user === u.phone).slice().sort(byPayDesc);

  const columns: Col<AOrder>[] = [
    { header: '订单号', className: 'mono', cell: (r) => r.id },
    { header: '类型', cell: (r) => <span className={'tag-s ' + r.tag}>{r.type}</span> },
    { header: '金额', className: 'mono', cell: (r) => '¥' + r.amount, sortValue: (r) => r.amount },
    { header: '支付方式', cell: (r) => r.payMethod },
    { header: '订单状态', cell: (r) => <span className={'fstat ' + (ORDER_CLS[r.status] ?? 'ok')}><span className="dt" />{r.status}</span> },
    {
      header: '退款状态',
      cell: (r) => {
        const s = refundStatusOf(r);
        return <span className={'fstat ' + RF_CLS[s]}><span className="dt" />{s}</span>;
      },
    },
    { header: '付款时间', className: 'mono', cell: (r) => r.payTime, sortValue: (r) => r.payTime },
    { header: '操作', cell: (r) => (
      <div className="op-cell">
        <span className="op" onClick={() => nav('/orders/' + r.id)}>详情</span>
      </div>
    ) },
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
            {u.nick} <span className={'tag-s ' + (u.member ? 'tag-amber' : 'tag-line')}>{u.member ? '会员' : '非会员'}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6, fontFamily: 'var(--mono)' }}>
            机构 {u.org} · 手机号 {u.phone} · 微信号 {u.wx === '—' ? '—' : u.wx}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 5 }}>活跃度：近 30 天提问 42 次 · 累计 GMV ¥{u.gmv} · 最近活跃 {u.lastLogin.slice(0, 10)}</div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 16 }}>
        <div className="block-t">已购永享 ({u.yx}) <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: 12 }}>点击查看具体内容</span></div>
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
        <DataGrid columns={columns} rows={myOrders} empty={{ title: '暂无订单' }} minWidth={920} />
      </div>
      <MediaView item={preview} onClose={() => setPreview(null)} />
    </>
  );
}
