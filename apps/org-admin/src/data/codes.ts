export interface Batch {
  id: string;
  name: string;
  redeemed: number;
  total: number;
  duration: string;
  createdAt: string;
}
export const BATCHES: Batch[] = [
  { id: 'B2026SBH', name: '2026 数博会活动', redeemed: 128, total: 500, duration: '3 个月', createdAt: '2026-05-18 09:30' },
  { id: 'B2026NCS', name: '内部测试批次', redeemed: 2, total: 10, duration: '6 个月', createdAt: '2026-05-20 14:10' },
  { id: 'B2026VIP', name: 'VIP 客户回馈', redeemed: 46, total: 100, duration: '12 个月', createdAt: '2026-04-29 16:02' },
];

export interface Code {
  code: string;
  status: string;
  statusCls: string;
  redeemAt: string;
  user: string;
  phone: string;
  expire: string;
}
// 演示：按批次生成若干兑换码
export function batchCodes(b: Batch): Code[] {
  const sample: Code[] = [
    { code: 'A7K9QP', status: '已兑换', statusCls: 'tag-jade', redeemAt: '2026-05-20 10:11', user: '微信昵称A · wx_abc', phone: '138****8888', expire: '2026-08-20' },
    { code: 'M3X2RT', status: '未兑换', statusCls: 'tag-line', redeemAt: '—', user: '—', phone: '—', expire: '—' },
    { code: 'Q8P2LN', status: '已兑换', statusCls: 'tag-jade', redeemAt: '2026-05-22 18:30', user: '微信昵称C · wx_c01', phone: '139****0000', expire: '2026-08-22' },
    { code: 'Z4W1KD', status: '未兑换', statusCls: 'tag-line', redeemAt: '—', user: '—', phone: '—', expire: '—' },
  ];
  return sample;
}
