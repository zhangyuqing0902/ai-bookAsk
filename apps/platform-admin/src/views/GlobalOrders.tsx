import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, DataGrid, RangePicker, type Col } from '@aba/ui-admin';
import { AORDERS, byPayDesc, useRefundStore, type AOrder } from '@aba/mock';

// 平台超管 · 全域订单（0614b：复用机构后台订单的列表 / 详情字段，仅多一列「归属机构」+ 机构筛选；
// 补齐机构后台已有的「退款状态」列；数据与机构后台同一份 @aba/mock，不再各写一套）。
const TYPES = ['全部', '会员', '永享', '兑换码'];
const ORDER_CLS: Record<string, string> = { 已支付: 'ok', 已核销: 'none' };
const RF_CLS: Record<string, string> = { 未退款: 'none', 退款中: 'ing', 部分退款: 'wait', 全额退款: 'fail' };

export function GlobalOrders() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [org, setOrg] = useState('全部');
  const [type, setType] = useState('全部');
  const [status, setStatus] = useState('全部');
  const [rfStatus, setRfStatus] = useState('全部');
  const refunds = useRefundStore((s) => s.refunds);
  const refundStatusOf = (r: AOrder) => refunds[r.id]?.status ?? '未退款';

  const orgNames = [...new Set(AORDERS.map((r) => r.org))];

  const rows = AORDERS.filter(
    (r) =>
      (!q || r.id.includes(q) || r.user.includes(q)) &&
      (org === '全部' || r.org === org) &&
      (type === '全部' || r.type === type) &&
      (status === '全部' || r.status === status) &&
      (rfStatus === '全部' || refundStatusOf(r) === rfStatus),
  ).slice().sort(byPayDesc);

  const columns: Col<AOrder>[] = [
    { header: '订单号', className: 'mono', cell: (r) => r.id },
    { header: '归属机构', cell: (r) => r.org, sortValue: (r) => r.org },
    { header: '类型', cell: (r) => <span className={'tag-s ' + r.tag}>{r.type}</span>, sortValue: (r) => r.type },
    { header: '关联知识产品', cell: (r) => (r.kp ? r.kp : <span className="muted">—</span>) },
    { header: '金额', className: 'mono', cell: (r) => '¥' + r.amount, sortValue: (r) => r.amount },
    { header: '支付方式', cell: (r) => r.payMethod, sortValue: (r) => r.payMethod },
    {
      header: '订单状态',
      sortValue: (r) => r.status,
      cell: (r) => (
        <span className={'fstat ' + (ORDER_CLS[r.status] ?? 'ok')}>
          <span className="dt" />
          {r.status}
        </span>
      ),
    },
    {
      header: '退款状态',
      sortValue: (r) => refundStatusOf(r),
      cell: (r) => {
        const s = refundStatusOf(r);
        return (
          <span className={'fstat ' + RF_CLS[s]}>
            <span className="dt" />
            {s}
          </span>
        );
      },
    },
    { header: '用户', className: 'mono', cell: (r) => r.user },
    { header: '下单时间', className: 'mono', cell: (r) => (r.type === '兑换码' ? <span className="muted">—</span> : r.orderTime), sortValue: (r) => r.orderTime },
    { header: '付款时间', className: 'mono', cell: (r) => (r.type === '兑换码' ? <span className="muted">—</span> : r.payTime), sortValue: (r) => r.payTime },
    { header: '兑换时间', className: 'mono', cell: (r) => (r.redeemTime ? r.redeemTime : <span className="muted">—</span>), sortValue: (r) => r.redeemTime ?? '' },
    { header: '操作', cell: (r) => <div className="op-cell"><span className="op" onClick={() => nav('/orders/' + r.id)}>详情</span></div> },
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
      <div className="orders-filter">
        <Search placeholder="微信号 / 手机号 / 订单号" minWidth={240} value={q} onChange={setQ} />
        <Dropdown label="归属机构" options={['全部', ...orgNames]} onSelect={setOrg} style={{ width: 160 }} />
        <Dropdown label="类型" options={TYPES} onSelect={setType} />
        <Dropdown label="订单状态" options={['全部', '已支付', '已核销']} onSelect={setStatus} />
        <Dropdown label="退款状态" options={['全部', '未退款', '退款中', '部分退款', '全额退款']} onSelect={setRfStatus} />
        <div className="grow" />
        <RangePicker label="付款时间" />
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的订单' }} minWidth={1480} pageUnit="单" />
    </>
  );
}
