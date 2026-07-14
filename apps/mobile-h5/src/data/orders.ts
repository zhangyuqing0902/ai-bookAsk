import type { PreviewItem } from '@aba/ui-mobile';

export type OrderType = '会员' | '永享' | '兑换码';
export interface RefundRecord { id: string; amount: string; status: '退款中' | '退款成功' | '退款失败'; createdAt: string }
export interface Order {
  id: string;
  type: OrderType;
  tag: string;
  title: string;
  amount: string;
  status: string;
  payTime: string; // 付款时间（排序键）
  orderTime: string;
  payMethod: string;
  /** 会员订单：是否自动续费（用于支付方式下方的「自动续费 / 手动支付」标识） */
  autoRenew?: boolean;
  /** 兑换码订单：兑换时间 */
  redeemTime?: string;
  memberFrom?: string;
  memberTo?: string;
  kp?: string;
  media?: PreviewItem;
  code?: string;
  refunds?: RefundRecord[];
}

export const ORDERS: Order[] = [
  { id: 'OD20260530140208', type: '会员', tag: 'tag-amber', title: '月度会员', amount: '¥19.9', status: '部分退款', payTime: '2026-05-30 14:02:08', orderTime: '2026-05-30 14:01:50', payMethod: '微信支付', autoRenew: true, memberFrom: '2026-05-30', memberTo: '2026-06-30', refunds: [{ id: 'RF202606011030', amount: '¥5.00', status: '退款成功', createdAt: '2026-06-01 10:30:12' }, { id: 'RF202606021205', amount: '¥2.00', status: '退款成功', createdAt: '2026-06-02 12:05:36' }] },
  { id: 'OD20260530152133', type: '永享', tag: 'tag-indigo', title: '永久解锁', amount: '¥9.9', status: '全额退款', payTime: '2026-05-30 15:21:33', orderTime: '2026-05-30 15:21:20', payMethod: '微信支付', kp: '心血管分册', media: { kind: 'image', name: '心电图示例' }, refunds: [{ id: 'RF202606031430', amount: '¥9.90', status: '退款成功', createdAt: '2026-06-03 14:30:08' }] },
  { id: 'OD20260529091307', type: '兑换码', tag: 'tag-jade', title: '会员 3 个月', amount: '¥0', status: '已核销', payTime: '2026-05-29 09:13:07', orderTime: '2026-05-29 09:13:07', payMethod: '兑换码核销', code: 'A7K9QP', redeemTime: '2026-05-29 09:13:07', memberFrom: '2026-05-29', memberTo: '2026-08-29' },
  { id: 'OD20260520101103', type: '永享', tag: 'tag-indigo', title: '永久解锁', amount: '¥29.9', status: '退款中', payTime: '2026-05-20 10:11:03', orderTime: '2026-05-20 10:10:55', payMethod: '微信支付', kp: '外科学', media: { kind: 'video', name: '手术演示视频' }, refunds: [{ id: 'RF202606041116', amount: '¥10.00', status: '退款中', createdAt: '2026-06-04 11:16:22' }, { id: 'RF202606041210', amount: '¥3.00', status: '退款失败', createdAt: '2026-06-04 12:10:03' }] },
];

// 按付款时间降序（所有 tab 通用）
export const byPayDesc = (a: Order, b: Order) => (a.payTime < b.payTime ? 1 : -1);
