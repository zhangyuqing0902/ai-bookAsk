import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, DataGrid, RangePicker, Modal, ConfirmDialog, TextInput, exportWorkbook, type Col } from '@aba/ui-admin';
import { AORDERS, byPayDesc, MY_ORG, CHILD_ORG_ORDERS, type AOrder } from '../data/orders';
import { ORG_FILTER_ALL, orgScopeOptions, orgScopeValue, visibleOrgs } from '@aba/mock';
import { useOrgScope } from '../stores/orgScope';
import { useRefundStore, operatorLabel } from '../refundStore';
import { buildOrdersSpec } from '../exports/orders';

// 0714 #3：三个时间筛选（下单 / 支付 / 兑换）接真过滤的区间载荷；days=0 表示「不限」
type TimeRange = { days: number; label: string; start?: Date; end?: Date };
const RANGE_UNLIMITED: TimeRange = { days: 0, label: '不限' };
// 字符串日期（yyyy-MM-dd HH:mm:ss）落在区间内；无该字段的行在启用筛选时排除
const inRange = (v: string | undefined, r: TimeRange) => {
  if (!r.days || !r.start || !r.end) return true;
  if (!v) return false;
  const t = new Date(v.replace(/-/g, '/')).getTime();
  return !isNaN(t) && t >= r.start.getTime() && t <= r.end.getTime();
};

const TYPES = ['全部', '会员', '永享', '兑换码'];
// 0722 订单四态配色：待支付=wait(橙)、已支付=ok(青)、已核销=none(灰)、已失效=none(灰)
const ORDER_CLS: Record<string, string> = { 待支付: 'wait', 已支付: 'ok', 已核销: 'none', 已失效: 'none' };
// 退款状态独立成列，复用 .fstat 配色：未退款=灰、退款中=处理中(靛)、部分退款=提醒(橙)、全额退款=已退出资金(珊瑚)
const RF_CLS: Record<string, string> = { 未退款: 'none', 退款中: 'ing', 部分退款: 'wait', 全额退款: 'fail' };

// 0614 退款对象 = C 端客户「昵称（手机号）」：手机号登录用户昵称取「用户+后四位」；wx 昵称用户无手机号则不显括号
function refundTarget(user: string): { nick: string; phone: string } {
  const m = user.match(/\d{3}\*{4}(\d{4})/);
  if (m) return { nick: '用户' + m[1], phone: user };
  return { nick: user, phone: '' };
}

// 机构后台 · 订单管理（共性字段列表 + 点击进详情；按付款时间降序）。0613-2：退款状态独立成列、与订单状态解耦。
export function Orders() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [type, setType] = useState('全部');
  const [status, setStatus] = useState('全部');
  const [rfStatus, setRfStatus] = useState('全部');
  // 0714 #3：下单 / 支付 / 兑换时间区间（默认不限）
  const [orderRange, setOrderRange] = useState<TimeRange>(RANGE_UNLIMITED);
  const [payRange, setPayRange] = useState<TimeRange>(RANGE_UNLIMITED);
  const [redeemRange, setRedeemRange] = useState<TimeRange>(RANGE_UNLIMITED);
  // 0806：父机构视角
  const orgType = useOrgScope((s) => s.orgType);
  const isParent = orgType === 'parent';
  const [orgSel, setOrgSel] = useState(ORG_FILTER_ALL);
  const refunds = useRefundStore((s) => s.refunds);
  const startRefund = useRefundStore((s) => s.startRefund);
  const [refundOrder, setRefundOrder] = useState<AOrder | null>(null);
  const [refundAmt, setRefundAmt] = useState('');
  const [confirmRefund, setConfirmRefund] = useState(false);

  const refundStatusOf = (r: AOrder) => refunds[r.id]?.status ?? '未退款';
  // 0722：仅「已支付」订单可退款（待支付 / 已失效未产生资金，已核销无资金）
  const refundable = (r: AOrder) => r.status === '已支付' && r.amount > 0 && !['退款中', '全额退款'].includes(refunds[r.id]?.status ?? '');
  const remaining = refundOrder ? refundOrder.amount - (refunds[refundOrder.id]?.refundedAmount ?? 0) : 0;

  // 0806：父机构视角——「仅显本机构订单」放宽为本机构＋全部子机构（子机构订单为本地演示扩展）
  const scope = visibleOrgs(orgType);
  const pool = isParent ? [...AORDERS, ...CHILD_ORG_ORDERS] : AORDERS;
  const rows = pool.filter(
    (r) =>
      scope.includes(r.org) &&
      (!isParent || orgSel === ORG_FILTER_ALL || r.org === orgSel) &&
      (!q || r.id.includes(q) || r.user.includes(q)) &&
      (type === '全部' || r.type === type) &&
      (status === '全部' || r.status === status) &&
      (rfStatus === '全部' || refundStatusOf(r) === rfStatus) &&
      // 0714 #3：三个时间区间真过滤（days=0 不限；无对应字段的行在启用筛选时排除）
      inRange(r.orderTime, orderRange) &&
      inRange(r.payTime, payRange) &&
      inRange(r.redeemTime, redeemRange),
  ).slice().sort(byPayDesc);

  const openRefund = (r: AOrder) => {
    setRefundOrder(r);
    setRefundAmt((r.amount - (refunds[r.id]?.refundedAmount ?? 0)).toFixed(2));
  };
  const toConfirm = () => {
    const amt = Number(refundAmt);
    if (!(amt > 0)) return toast('请输入退款金额');
    if (amt > remaining + 1e-6) return toast('退款金额不能超过可退余额 ¥' + remaining.toFixed(2));
    setConfirmRefund(true);
  };
  const doRefund = () => {
    if (!refundOrder) return;
    const amt = Number(refundAmt);
    startRefund(refundOrder.id, amt, refundOrder.amount, '原路退回 · ' + refundOrder.payMethod, () => toast('退款成功 · 资金已原路退回'));
    setConfirmRefund(false);
    setRefundOrder(null);
    toast('退款处理中 · 资金将原路退回');
  };

  const columns: Col<AOrder>[] = [
    { header: '订单号', className: 'mono', cell: (r) => r.id },
    // 0806：父机构视角显示数据归属机构
    ...(isParent ? [{ header: '归属机构', cell: (r: AOrder) => r.org, sortValue: (r: AOrder) => r.org } as Col<AOrder>] : []),
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
    { header: '付款时间', className: 'mono', cell: (r) => (r.type === '兑换码' || !r.payTime ? <span className="muted">—</span> : r.payTime), sortValue: (r) => r.payTime },
    { header: '兑换时间', className: 'mono', cell: (r) => (r.redeemTime ? r.redeemTime : <span className="muted">—</span>), sortValue: (r) => r.redeemTime ?? '' },
    {
      header: '操作',
      cell: (r) => (
        <div className="op-cell">
          <span className="op" onClick={() => nav('/orders/' + r.id)}>详情</span>
          {/* 0806：子机构订单退款置灰——机构角色「可操作」仅针对本机构数据 */}
          {refundable(r) && (r.org === MY_ORG ? (
            <span className="op op-danger" onClick={() => openRefund(r)}>
              退款
            </span>
          ) : (
            <span className="op off" onClick={() => toast('仅可操作本机构数据 · 子机构订单请在其后台处理')}>
              退款
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">订单管理</div>
        </div>
      </div>
      <div className="orders-filter">
        <Search placeholder="搜索订单号 / 用户" minWidth={220} value={q} onChange={setQ} />
        {/* 0806：父机构视角——机构单选筛选 */}
        {isParent && <Dropdown label="机构" options={orgScopeOptions()} onSelect={(v) => setOrgSel(v === ORG_FILTER_ALL ? ORG_FILTER_ALL : orgScopeValue(v))} style={{ width: 200 }} />}
        <Dropdown label="类型" options={TYPES} onSelect={setType} />
        {/* 0722：订单四态筛选（待支付 / 已支付 / 已核销 / 已失效），退款为独立维度 */}
        <Dropdown label="订单状态" options={['全部', '待支付', '已支付', '已核销', '已失效']} onSelect={setStatus} />
        <Dropdown label="退款状态" options={['全部', '未退款', '退款中', '部分退款', '全额退款']} onSelect={setRfStatus} />
        <div className="grow" />
        {/* 0714：导出走 spec 纯函数（exports/orders.ts）；退款状态注入 refund store 现值 */}
        <button className="btn btn-ghost btn-sm" onClick={() => { void exportWorkbook(buildOrdersSpec({ rows, filters: { q, type, status, rfStatus, orderRange: orderRange.label, payRange: payRange.label, redeemRange: redeemRange.label }, refundStatusOf })); toast('正在导出'); }}>
          <Icon id="i-dl" w={14} h={14} />
          导出
        </button>
      </div>
      {/* 0714 #3：三个时间筛选接真过滤（预设 不限 / 近 7 天 / 30 天，自定义走日历） */}
      <div className="orders-ranges">
        <div className="range-col"><RangePicker label="下单时间" presets={['不限', '近 7 天', '30 天']} presetDays={[0, 7, 30]} defaultActive={0} onChange={setOrderRange} /></div>
        <div className="range-col"><RangePicker label="支付时间" presets={['不限', '近 7 天', '30 天']} presetDays={[0, 7, 30]} defaultActive={0} onChange={setPayRange} /></div>
        <div className="range-col"><RangePicker label="兑换时间" presets={['不限', '近 7 天', '30 天']} presetDays={[0, 7, 30]} defaultActive={0} onChange={setRedeemRange} /></div>
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的订单' }} minWidth={1440} pageUnit="单" />

      {/* 退款金额弹窗 */}
      <Modal
        title="订单退款"
        open={!!refundOrder}
        onClose={() => setRefundOrder(null)}
        width={440}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setRefundOrder(null)}>取消</button>
            <button className="btn btn-sm" style={{ background: 'var(--terra)', color: '#fff', borderColor: 'var(--terra)' }} onClick={toConfirm}>
              确认退款
            </button>
          </>
        }
      >
        {refundOrder && (
          <>
            <div className="fm-row" style={{ borderTop: 'none', paddingTop: 4 }}>
              <div className="lab">订单号</div>
              <div className="ctl"><span className="mono">{refundOrder.id}</span></div>
            </div>
            <div className="fm-row">
              <div className="lab">订单实付</div>
              <div className="ctl">
                <span className="mono" style={{ fontWeight: 600 }}>¥{refundOrder.amount.toFixed(2)}</span>
                {(refunds[refundOrder.id]?.refundedAmount ?? 0) > 0 && (
                  <span style={{ color: 'var(--ink-3)', fontSize: 12, marginLeft: 8 }}>
                    已退 ¥{refunds[refundOrder.id]!.refundedAmount.toFixed(2)} · 可退 ¥{remaining.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <div className="fm-row">
              <div className="lab">退款金额</div>
              <div className="ctl">
                <TextInput value={refundAmt} onChange={(e) => setRefundAmt(e.target.value)} placeholder="请输入退款金额" style={{ maxWidth: 180 }} />
              </div>
            </div>
            <ul className="rf-warn">
              <li>支持部分退款</li>
              <li>确认后资金原路退回原支付账户，操作不可撤销</li>
            </ul>
          </>
        )}
      </Modal>

      {/* 二次确认 */}
      <ConfirmDialog
        open={confirmRefund}
        title="确认退款？"
        danger
        confirmText="确认退款"
        desc={
          refundOrder ? (
            <div className="rf-confirm">
              <div className="rf-cf-row">
                <span className="k">发起人</span>
                <span className="v">{operatorLabel}</span>
              </div>
              <div className="rf-cf-row">
                <span className="k">退款对象</span>
                <span className="v">
                  {(() => {
                    const t = refundTarget(refundOrder.user);
                    return t.phone ? `${t.nick}（${t.phone}）` : t.nick;
                  })()}
                </span>
              </div>
              <div className="rf-cf-row">
                <span className="k">订单号</span>
                <span className="v mono">{refundOrder.id}</span>
              </div>
              <div className="rf-cf-row">
                <span className="k">退款金额</span>
                <span className="v" style={{ color: 'var(--terra)', fontWeight: 700 }}>
                  ¥{Number(refundAmt || 0).toFixed(2)}
                </span>
              </div>
              <div className="rf-cf-row">
                <span className="k">资金路径</span>
                <span className="v">原路退回客户原支付账户</span>
              </div>
              <div className="rf-cf-row">
                <span className="k">备注</span>
                <span className="v">操作一经确认无法撤销</span>
              </div>
            </div>
          ) : undefined
        }
        onConfirm={doRefund}
        onClose={() => setConfirmRefund(false)}
      />
    </>
  );
}
