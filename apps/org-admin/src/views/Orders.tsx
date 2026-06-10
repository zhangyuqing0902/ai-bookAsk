import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, DataGrid, RangePicker, type Col } from '@aba/ui-admin';
import { AORDERS, byPayDesc, type AOrder } from '../data/orders';

const TYPES = ['全部', '会员', '永享', '兑换码'];

// 机构后台 · 订单管理（共性字段列表 + 点击进详情；按付款时间降序）
export function Orders() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [type, setType] = useState('全部');
  const [status, setStatus] = useState('全部');

  const rows = AORDERS.filter(
    (r) => (!q || r.id.includes(q) || r.user.includes(q)) && (type === '全部' || r.type === type) && (status === '全部' || r.status === status),
  ).slice().sort(byPayDesc);

  const columns: Col<AOrder>[] = [
    { header: '订单号', className: 'mono', cell: (r) => r.id },
    { header: '类型', cell: (r) => <span className={'tag-s ' + r.tag}>{r.type}</span> },
    { header: '关联知识产品', cell: (r) => (r.kp ? r.kp : <span className="muted">—</span>) },
    { header: '金额', className: 'mono', cell: (r) => '¥' + r.amount, sortValue: (r) => r.amount },
    { header: '支付方式', cell: (r) => r.payMethod },
    { header: '状态', cell: (r) => <span className="fstat ok"><span className="dt" />{r.status}</span> },
    { header: '用户', className: 'mono', cell: (r) => r.user },
    // 9.5:兑换码类型无下单/付款时间(显示 —),单列展示兑换时间
    { header: '下单时间', className: 'mono', cell: (r) => (r.type === '兑换码' ? <span className="muted">—</span> : r.orderTime), sortValue: (r) => r.orderTime },
    { header: '付款时间', className: 'mono', cell: (r) => (r.type === '兑换码' ? <span className="muted">—</span> : r.payTime), sortValue: (r) => r.payTime },
    { header: '兑换时间', className: 'mono', cell: (r) => (r.redeemTime ? r.redeemTime : <span className="muted">—</span>), sortValue: (r) => r.redeemTime ?? '' },
    { header: '操作', cell: (r) => <span className="op" onClick={() => nav('/orders/' + r.id)}>详情</span> },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">订单管理</div>
        </div>
      </div>
      {/* 9:导出按钮移到模糊匹配同一行最右侧,与列表右对齐 */}
      <div className="orders-filter">
        <Search placeholder="搜索订单号 / 用户" minWidth={220} value={q} onChange={setQ} />
        <Dropdown label="类型" options={TYPES} onSelect={setType} />
        <Dropdown label="状态" options={['全部', '已支付', '已核销']} onSelect={setStatus} />
        <div className="grow" />
        <button className="btn btn-ghost btn-sm" onClick={() => toast('导出订单')}>
          <Icon id="i-dl" w={14} h={14} />
          导出
        </button>
      </div>
      {/* 9.6:三个独立时间筛选,各支持单选 1 天或区间;9:自定义回显 chip 落到各自时间筛选下方(仅本页) */}
      <div className="orders-ranges">
        <div className="range-col"><RangePicker label="下单时间" /></div>
        <div className="range-col"><RangePicker label="支付时间" /></div>
        <div className="range-col"><RangePicker label="兑换时间" /></div>
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的订单' }} minWidth={1260} pageUnit="单" />
    </>
  );
}
