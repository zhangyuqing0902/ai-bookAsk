import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, DataGrid, RangePicker, exportWorkbook, type Col } from '@aba/ui-admin';
import { AORDERS, byPayDesc, orgOptionLabel, orgOptionValue, revealPhone, useRefundStore, type AOrder } from '@aba/mock';
import { buildGlobalOrdersSpec } from '../exports/globalOrders';

// 平台超管 · 全域订单（0614b：复用机构后台订单的列表 / 详情字段，仅多一列「机构」+ 机构筛选；
// 补齐机构后台已有的「退款状态」列；数据与机构后台同一份 @aba/mock，不再各写一套）。
// 0714：#3 时间筛选对齐机构侧——下单 / 支付 / 兑换三个时间区间（真过滤），删原「付款时间」单筛选；
//       导出迁移到 exports/globalOrders.ts spec，按钮从页头下移到筛选行（对齐机构后台订单形态）。
const TYPES = ['全部', '会员', '永享', '兑换码'];
// 0722 订单四态配色（与机构后台一致）：待支付=wait、已支付=ok、已核销/已失效=灰
const ORDER_CLS: Record<string, string> = { 待支付: 'wait', 已支付: 'ok', 已核销: 'none', 已失效: 'none' };
const RF_CLS: Record<string, string> = { 未退款: 'none', 退款中: 'ing', 部分退款: 'wait', 全额退款: 'fail' };

// 时间区间筛选载荷（RangePicker onChange）：days=0 为「不限」不过滤
interface TimeRange {
  days: number;
  label: string;
  start?: Date;
  end?: Date;
}
const NO_LIMIT: TimeRange = { days: 0, label: '不限' };

// 行时间字段命中判定：区间未启用 → 全通过；启用后无该字段的行排除
function hitRange(raw: string | undefined, r: TimeRange) {
  if (!r.days || !r.start || !r.end) return true;
  if (!raw) return false;
  const t = new Date(raw.replace(' ', 'T')).getTime();
  if (Number.isNaN(t)) return false;
  return t >= r.start.getTime() && t <= r.end.getTime();
}

export function GlobalOrders() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [org, setOrg] = useState('全部');
  const [type, setType] = useState('全部');
  const [status, setStatus] = useState('全部');
  const [rfStatus, setRfStatus] = useState('全部');
  // #3：下单 / 支付 / 兑换 三个时间区间（默认「不限」）
  const [orderRange, setOrderRange] = useState<TimeRange>(NO_LIMIT);
  const [payRange, setPayRange] = useState<TimeRange>(NO_LIMIT);
  const [redeemRange, setRedeemRange] = useState<TimeRange>(NO_LIMIT);
  const refunds = useRefundStore((s) => s.refunds);
  const refundStatusOf = (r: AOrder) => refunds[r.id]?.status ?? '未退款';

  const orgNames = [...new Set(AORDERS.map((r) => r.org))];

  // 兑换码订单无下单 / 支付时间（列表显 —），启用对应区间筛选时按「无该字段」排除
  const orderTimeOf = (r: AOrder) => (r.type === '兑换码' ? undefined : r.orderTime);
  const payTimeOf = (r: AOrder) => (r.type === '兑换码' ? undefined : r.payTime);

  const rows = AORDERS.filter(
    (r) =>
      (!q || r.id.includes(q) || r.user.includes(q)) &&
      (org === '全部' || r.org === org) &&
      (type === '全部' || r.type === type) &&
      (status === '全部' || r.status === status) &&
      (rfStatus === '全部' || refundStatusOf(r) === rfStatus) &&
      hitRange(orderTimeOf(r), orderRange) &&
      hitRange(payTimeOf(r), payRange) &&
      hitRange(r.redeemTime, redeemRange),
  ).slice().sort(byPayDesc);

  const doExport = () => {
    void exportWorkbook(buildGlobalOrdersSpec({
      rows,
      refundStatusOf,
      filters: [
        ['关键词', q || '无'], ['机构', org], ['类型', type], ['订单状态', status], ['退款状态', rfStatus],
        ['下单时间', orderRange.label], ['支付时间', payRange.label], ['兑换时间', redeemRange.label],
      ],
    }));
    toast('正在导出');
  };

  const columns: Col<AOrder>[] = [
    { header: '订单号', className: 'mono', cell: (r) => r.id },
    { header: '机构', cell: (r) => r.org, sortValue: (r) => r.org },
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
    { header: '用户', className: 'mono', cell: (r) => revealPhone(r.user) },
    { header: '下单时间', className: 'mono', cell: (r) => (r.type === '兑换码' ? <span className="muted">—</span> : r.orderTime), sortValue: (r) => r.orderTime },
    { header: '付款时间', className: 'mono', cell: (r) => (r.type === '兑换码' || !r.payTime ? <span className="muted">—</span> : r.payTime), sortValue: (r) => r.payTime },
    { header: '兑换时间', className: 'mono', cell: (r) => (r.redeemTime ? r.redeemTime : <span className="muted">—</span>), sortValue: (r) => r.redeemTime ?? '' },
    { header: '操作', cell: (r) => <div className="op-cell"><span className="op" onClick={() => nav('/orders/' + r.id)}>详情</span></div> },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">全域订单</div>
        </div>
      </div>
      <div className="orders-filter">
        <Search placeholder="微信号 / 手机号 / 订单号" minWidth={240} value={q} onChange={setQ} />
        <Dropdown label="机构" options={['全部', ...orgNames.map(orgOptionLabel)]} onSelect={(v) => setOrg(orgOptionValue(v))} style={{ width: 190 }} />
        <Dropdown label="类型" options={TYPES} onSelect={setType} />
        {/* 0722：订单四态筛选（与机构后台一致） */}
        <Dropdown label="订单状态" options={['全部', '待支付', '已支付', '已核销', '已失效']} onSelect={setStatus} />
        <Dropdown label="退款状态" options={['全部', '未退款', '退款中', '部分退款', '全额退款']} onSelect={setRfStatus} />
        <div className="grow" />
        <button className="btn btn-ghost btn-sm" onClick={doExport}>
          <Icon id="i-dl" w={14} h={14} />
          导出
        </button>
      </div>
      {/* #3：三个时间区间（对齐机构后台订单），默认「不限」，选中后真参与列表过滤 */}
      <div className="orders-ranges">
        <div className="range-col"><RangePicker label="下单时间" presets={['不限', '近 7 天', '30 天']} presetDays={[0, 7, 30]} defaultActive={0} onChange={setOrderRange} /></div>
        <div className="range-col"><RangePicker label="支付时间" presets={['不限', '近 7 天', '30 天']} presetDays={[0, 7, 30]} defaultActive={0} onChange={setPayRange} /></div>
        <div className="range-col"><RangePicker label="兑换时间" presets={['不限', '近 7 天', '30 天']} presetDays={[0, 7, 30]} defaultActive={0} onChange={setRedeemRange} /></div>
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的订单' }} minWidth={1480} pageUnit="单" />
    </>
  );
}
