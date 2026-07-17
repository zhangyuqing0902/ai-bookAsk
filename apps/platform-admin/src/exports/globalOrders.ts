// 全域订单导出 spec（0714）——纯函数，视图与模板生成共用（node 可运行，约束同 dashboard.ts）。
// 退款状态依赖 zustand store（不可进 node 闭包），由视图作为参数传入；模板默认按「未退款」。
import type { ExportSpec } from '@aba/ui-admin';
import { AORDERS, byPayDesc, type AOrder } from '../../../../packages/mock/src/data/adminOrders.ts';
import { revealPhone } from '../../../../packages/mock/src/rules.ts';

export interface GlobalOrdersExportArgs {
  rows?: AOrder[];
  refundStatusOf?: (o: AOrder) => string;
  /** 导出时刻的筛选条件（含 #3 三个时间区间） */
  filters?: Array<[string, string]>;
}

export function buildGlobalOrdersSpec(args: GlobalOrdersExportArgs = {}): ExportSpec {
  const {
    rows = AORDERS.slice().sort(byPayDesc),
    refundStatusOf = () => '未退款',
    filters = [
      ['关键词', '无'], ['机构', '全部'], ['类型', '全部'], ['订单状态', '全部'], ['退款状态', '全部'],
      ['下单时间', '不限'], ['支付时间', '不限'], ['兑换时间', '不限'],
    ],
  } = args;

  return {
    context: { scope: '全域', business: '订单', filters },
    sheets: [
      {
        name: '订单明细',
        title: '平台全域订单',
        headers: ['订单号', '机构', '类型', '知识产品', '金额', '支付方式', '订单状态', '退款状态', '用户', '下单时间', '支付时间', '兑换时间'],
        rows: rows.map((r) => [
          r.id, r.org, r.type, r.kp ?? '—', `¥${r.amount}`, r.payMethod, r.status, refundStatusOf(r),
          revealPhone(r.user),
          r.type === '兑换码' ? '—' : r.orderTime,
          r.type === '兑换码' ? '—' : r.payTime,
          r.redeemTime ?? '—',
        ]),
        widths: [24, 22, 12, 22, 12, 16, 14, 14, 18, 22, 22, 22],
      },
    ],
  };
}
