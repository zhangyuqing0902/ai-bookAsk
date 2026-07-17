// 0714：订单管理导出 spec（纯函数）。
// 退款状态是页面运行时 store（useRefundStore）里的现值，通过 refundStatusOf 注入；
// 模板脚本侧无 store，缺省一律 '未退款'。
import type { ExportSpec } from '@aba/ui-admin';
import { MY_ORG } from '../../../../packages/mock/src/data/adminOrders.ts';
import type { AOrder } from '@aba/mock';

export interface OrdersExportInput {
  rows: AOrder[];
  filters: {
    q: string;
    type: string;
    status: string;
    rfStatus: string;
    orderRange: string; // 下单时间区间 label（不限 / 近 7 天 / …）
    payRange: string; // 支付时间区间 label
    redeemRange: string; // 兑换时间区间 label
  };
  refundStatusOf?: (r: AOrder) => string;
}

export function buildOrdersSpec({ rows, filters, refundStatusOf = () => '未退款' }: OrdersExportInput): ExportSpec {
  return {
    context: {
      scope: MY_ORG,
      business: '订单管理',
      filters: [
        ['关键词', filters.q || '无'],
        ['类型', filters.type],
        ['订单状态', filters.status],
        ['退款状态', filters.rfStatus],
        ['下单时间', filters.orderRange],
        ['支付时间', filters.payRange],
        ['兑换时间', filters.redeemRange],
      ],
    },
    sheets: [
      {
        name: '订单明细',
        title: '机构订单管理',
        headers: ['订单号', '类型', '知识产品', '金额', '支付方式', '订单状态', '退款状态', '用户', '下单时间', '支付时间', '兑换时间'],
        rows: rows.map((r) => [r.id, r.type, r.kp ?? '—', `¥${r.amount}`, r.payMethod, r.status, refundStatusOf(r), r.user, r.orderTime, r.payTime, r.redeemTime ?? '—']),
        widths: [24, 12, 22, 12, 16, 14, 14, 18, 22, 22, 22],
      },
    ],
  };
}
