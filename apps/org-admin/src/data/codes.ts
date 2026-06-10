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
  { id: 'B2026SPR', name: '春季读书月', redeemed: 210, total: 300, duration: '1 个月', createdAt: '2026-04-15 10:20' },
  { id: 'B2026EDU', name: '校园合作派发', redeemed: 88, total: 200, duration: '6 个月', createdAt: '2026-04-08 15:45' },
  { id: 'B2026NEW', name: '新用户拉新', redeemed: 320, total: 1000, duration: '1 个月', createdAt: '2026-03-28 11:12' },
  { id: 'B2026LIV', name: '直播间专属', redeemed: 64, total: 80, duration: '3 个月', createdAt: '2026-03-20 20:08' },
  { id: 'B2026GFT', name: '老客回馈礼包', redeemed: 30, total: 150, duration: '12 个月', createdAt: '2026-03-12 09:00' },
  { id: 'B2026EXP', name: '展会扫码领取', redeemed: 156, total: 400, duration: '3 个月', createdAt: '2026-02-26 13:30' },
  { id: 'B2026PRT', name: '渠道合作分发', redeemed: 12, total: 50, duration: '6 个月', createdAt: '2026-02-18 16:40' },
  { id: 'B2026OLD', name: '会员续费召回', redeemed: 78, total: 120, duration: '1 个月', createdAt: '2026-02-05 08:55' },
  { id: 'B2026YER', name: '年货节活动', redeemed: 240, total: 600, duration: '3 个月', createdAt: '2026-01-22 10:05' },
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
// 演示：按批次生成若干兑换码（超过 10 个，批次详情页可演示真实分页）
export function batchCodes(_b: Batch): Code[] {
  const sample: Code[] = [
    { code: 'A7K9QP', status: '已兑换', statusCls: 'tag-jade', redeemAt: '2026-05-20 10:11', user: '微信昵称A · wx_abc', phone: '138****8888', expire: '2026-08-20' },
    { code: 'M3X2RT', status: '未兑换', statusCls: 'tag-line', redeemAt: '—', user: '—', phone: '—', expire: '—' },
    { code: 'Q8P2LN', status: '已兑换', statusCls: 'tag-jade', redeemAt: '2026-05-22 18:30', user: '微信昵称C · wx_c01', phone: '139****0000', expire: '2026-08-22' },
    { code: 'Z4W1KD', status: '未兑换', statusCls: 'tag-line', redeemAt: '—', user: '—', phone: '—', expire: '—' },
    { code: 'H6N8YB', status: '已兑换', statusCls: 'tag-jade', redeemAt: '2026-05-23 09:02', user: '微信昵称D · wx_d22', phone: '136****2468', expire: '2026-08-23' },
    { code: 'L2C5VF', status: '未兑换', statusCls: 'tag-line', redeemAt: '—', user: '—', phone: '—', expire: '—' },
    { code: 'T9R3WX', status: '已兑换', statusCls: 'tag-jade', redeemAt: '2026-05-24 14:47', user: '用户1357', phone: '135****1357', expire: '2026-08-24' },
    { code: 'K4D7QM', status: '未兑换', statusCls: 'tag-line', redeemAt: '—', user: '—', phone: '—', expire: '—' },
    { code: 'P8F1ZN', status: '已兑换', statusCls: 'tag-jade', redeemAt: '2026-05-25 11:19', user: '微信昵称F · wx_f44', phone: '134****8642', expire: '2026-08-25' },
    { code: 'B3W6KD', status: '未兑换', statusCls: 'tag-line', redeemAt: '—', user: '—', phone: '—', expire: '—' },
    { code: 'X7L2PC', status: '已兑换', statusCls: 'tag-jade', redeemAt: '2026-05-26 20:33', user: '用户2024', phone: '133****2024', expire: '2026-08-26' },
    { code: 'V5M9RT', status: '未兑换', statusCls: 'tag-line', redeemAt: '—', user: '—', phone: '—', expire: '—' },
  ];
  return sample;
}
