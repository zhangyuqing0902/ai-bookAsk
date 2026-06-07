import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, DataGrid, type Col } from '@aba/ui-admin';

interface O {
  no: string;
  org: string;
  type: string;
  typeCls: string;
  amount: number;
  status: string;
  user: string;
  time: string;
}
const ROWS: O[] = [
  { no: 'OD20260530140208', org: 'XX 出版社', type: '会员', typeCls: 'tag-amber', amount: 19.9, status: '已支付', user: '138****8888', time: '2026-05-30 14:02:08' },
  { no: 'OD20260530152133', org: 'ZZ 少儿', type: '永享', typeCls: 'tag-indigo', amount: 9.9, status: '已支付', user: 'wx_abc', time: '2026-05-30 15:21:33' },
  { no: 'OD20260529091307', org: 'YY 教育', type: '兑换码', typeCls: 'tag-jade', amount: 0, status: '已核销', user: '139****0000', time: '2026-05-29 09:13:07' },
];

// 平台超管 · 全域订单（搜索 + 机构/状态筛选 + 金额/时间排序）
export function GlobalOrders() {
  const [q, setQ] = useState('');
  const [org, setOrg] = useState('全部');
  const [status, setStatus] = useState('全部');

  const rows = ROWS.filter(
    (r) =>
      (!q || r.user.includes(q) || r.no.includes(q)) &&
      (org === '全部' || r.org === org) &&
      (status === '全部' || r.status === status),
  );

  const columns: Col<O>[] = [
    { header: '订单号', className: 'mono', cell: (r) => r.no },
    { header: '机构', cell: (r) => r.org },
    { header: '类型', cell: (r) => <span className={'tag-s ' + r.typeCls}>{r.type}</span> },
    { header: '金额', className: 'mono', cell: (r) => '¥' + r.amount, sortValue: (r) => r.amount },
    {
      header: '状态',
      cell: (r) => (
        <span className="fstat ok">
          <span className="dt" />
          {r.status}
        </span>
      ),
    },
    { header: '用户', className: 'mono', cell: (r) => r.user },
    { header: '创建时间', className: 'mono', cell: (r) => r.time, sortValue: (r) => r.time },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">全域订单</div>
        </div>
        <div className="pa">
          <button className="btn btn-ghost btn-sm" onClick={() => toast('导出订单')}>
            <Icon id="i-dl" w={14} h={14} />
            导出
          </button>
        </div>
      </div>
      <div className="filter">
        <Search placeholder="微信号 / 手机号 / 订单号" minWidth={240} value={q} onChange={setQ} />
        <Dropdown label="机构" options={['全部', 'XX 出版社', 'YY 教育', 'ZZ 少儿']} onSelect={setOrg} />
        <Dropdown label="订单状态" options={['全部', '已支付', '已核销']} onSelect={setStatus} />
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的订单' }} minWidth={920} />
    </>
  );
}
