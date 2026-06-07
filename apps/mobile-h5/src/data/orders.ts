import type { PreviewItem } from '@aba/ui-mobile';

export type OrderType = '会员' | '永享' | '兑换码';
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
  memberFrom?: string;
  memberTo?: string;
  kp?: string;
  media?: PreviewItem;
  code?: string;
}

export const ORDERS: Order[] = [
  { id: 'OD20260530140208', type: '会员', tag: 'tag-amber', title: '月度会员', amount: '¥19.9', status: '已支付', payTime: '2026-05-30 14:02:08', orderTime: '2026-05-30 14:01:50', payMethod: '微信支付', memberFrom: '2026-05-30', memberTo: '2026-06-30' },
  { id: 'OD20260530152133', type: '永享', tag: 'tag-indigo', title: '永久解锁', amount: '¥9.9', status: '已支付', payTime: '2026-05-30 15:21:33', orderTime: '2026-05-30 15:21:20', payMethod: '微信支付', kp: '心血管分册', media: { kind: 'image', name: '心电图示例' } },
  { id: 'OD20260529091307', type: '兑换码', tag: 'tag-jade', title: '会员 3 个月', amount: '¥0', status: '已核销', payTime: '2026-05-29 09:13:07', orderTime: '2026-05-29 09:13:07', payMethod: '兑换码核销', code: 'A7K9QP' },
  { id: 'OD20260520101103', type: '永享', tag: 'tag-indigo', title: '永久解锁', amount: '¥29.9', status: '已支付', payTime: '2026-05-20 10:11:03', orderTime: '2026-05-20 10:10:55', payMethod: '微信支付', kp: '外科学', media: { kind: 'video', name: '手术演示视频' } },
];

// 按付款时间降序（所有 tab 通用）
export const byPayDesc = (a: Order, b: Order) => (a.payTime < b.payTime ? 1 : -1);
