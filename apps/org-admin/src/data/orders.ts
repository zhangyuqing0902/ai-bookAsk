import type { MediaItem } from '@aba/ui-admin';

export interface AOrder {
  id: string;
  type: '会员' | '永享' | '兑换码';
  tag: string;
  title: string;
  amount: number;
  status: string;
  payMethod: string;
  orderTime: string;
  payTime: string;
  user: string;
  /** 会员订单：自动续费 / 手动支付（支付方式下方标识，9.4） */
  autoRenew?: boolean;
  /** 兑换码订单：兑换时间（9.5/9.6） */
  redeemTime?: string;
  kp?: string;
  media?: MediaItem;
  code?: string;
  memberFrom?: string;
  memberTo?: string;
}

export const AORDERS: AOrder[] = [
  { id: 'OD20260530140208', type: '会员', tag: 'tag-amber', title: '月度会员', amount: 19.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-30 14:01:50', payTime: '2026-05-30 14:02:08', user: '138****8888', autoRenew: true, memberFrom: '2026-05-30', memberTo: '2026-06-30' },
  { id: 'OD20260530152133', type: '永享', tag: 'tag-indigo', title: '永久解锁', amount: 9.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-30 15:21:20', payTime: '2026-05-30 15:21:33', user: 'wx_abc', kp: '心血管分册', media: { kind: 'image', name: '心电图示例' } },
  { id: 'OD20260529091307', type: '兑换码', tag: 'tag-jade', title: '会员 3 个月', amount: 0, status: '已核销', payMethod: '兑换码核销', orderTime: '2026-05-29 09:13:07', payTime: '2026-05-29 09:13:07', user: '139****0000', code: 'A7K9QP', redeemTime: '2026-05-29 09:13:07', memberFrom: '2026-05-29', memberTo: '2026-08-29' },
  { id: 'OD20260520101103', type: '永享', tag: 'tag-indigo', title: '永久解锁', amount: 29.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-20 10:10:55', payTime: '2026-05-20 10:11:03', user: 'wx_c01', kp: '外科学', media: { kind: 'video', name: '手术演示视频' } },
  { id: 'OD20260528103412', type: '会员', tag: 'tag-amber', title: '年度会员', amount: 198, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-28 10:33:58', payTime: '2026-05-28 10:34:12', user: '138****1234', autoRenew: false, memberFrom: '2026-05-28', memberTo: '2027-05-28' },
  { id: 'OD20260528164509', type: '永享', tag: 'tag-indigo', title: '永久解锁', amount: 9.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-28 16:44:50', payTime: '2026-05-28 16:45:09', user: 'wx_d22', kp: '儿科学', media: { kind: 'audio', name: '专题讲座音频' } },
  { id: 'OD20260527093320', type: '会员', tag: 'tag-amber', title: '月度会员', amount: 19.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-27 09:33:05', payTime: '2026-05-27 09:33:20', user: '137****5678', autoRenew: true, memberFrom: '2026-05-27', memberTo: '2026-06-27' },
  { id: 'OD20260527141855', type: '兑换码', tag: 'tag-jade', title: '会员 6 个月', amount: 0, status: '已核销', payMethod: '兑换码核销', orderTime: '2026-05-27 14:18:55', payTime: '2026-05-27 14:18:55', user: '135****1357', code: 'M3X2RT', redeemTime: '2026-05-27 14:18:55', memberFrom: '2026-05-27', memberTo: '2026-11-27' },
  { id: 'OD20260526112047', type: '永享', tag: 'tag-indigo', title: '永久解锁', amount: 9.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-26 11:20:31', payTime: '2026-05-26 11:20:47', user: 'wx_f44', kp: '内科精要', media: { kind: 'image', name: '血压监测记录表' } },
  { id: 'OD20260526085533', type: '会员', tag: 'tag-amber', title: '月度会员', amount: 19.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-26 08:55:18', payTime: '2026-05-26 08:55:33', user: '133****2024', autoRenew: true, memberFrom: '2026-05-26', memberTo: '2026-06-26' },
  { id: 'OD20260525170612', type: '永享', tag: 'tag-indigo', title: '永久解锁', amount: 19.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-25 17:05:55', payTime: '2026-05-25 17:06:12', user: 'wx_i77', kp: '心血管分册', media: { kind: 'video', name: '示范 · 家庭血压测量' } },
  { id: 'OD20260525134428', type: '会员', tag: 'tag-amber', title: '月度会员', amount: 19.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-25 13:44:10', payTime: '2026-05-25 13:44:28', user: '130****8080', autoRenew: false, memberFrom: '2026-05-25', memberTo: '2026-06-25' },
  { id: 'OD20260524101739', type: '兑换码', tag: 'tag-jade', title: '会员 12 个月', amount: 0, status: '已核销', payMethod: '兑换码核销', orderTime: '2026-05-24 10:17:39', payTime: '2026-05-24 10:17:39', user: '136****2468', code: 'Q8P2LN', redeemTime: '2026-05-24 10:17:39', memberFrom: '2026-05-24', memberTo: '2027-05-24' },
  { id: 'OD20260524092214', type: '永享', tag: 'tag-indigo', title: '永久解锁', amount: 29.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-24 09:21:58', payTime: '2026-05-24 09:22:14', user: 'wx_abc', kp: '外科学', media: { kind: 'video', name: '手术演示视频' } },
  { id: 'OD20260523155902', type: '会员', tag: 'tag-amber', title: '年度会员', amount: 198, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-23 15:58:46', payTime: '2026-05-23 15:59:02', user: '137****5678', autoRenew: true, memberFrom: '2026-05-23', memberTo: '2027-05-23' },
];

export const byPayDesc = (a: AOrder, b: AOrder) => (a.payTime < b.payTime ? 1 : -1);
