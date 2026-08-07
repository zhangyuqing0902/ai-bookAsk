// 0614b：订单数据已下沉到 @aba/mock（机构后台 / 平台后台 / 用户详情共用一份），此处仅再导出。
export { AORDERS, byPayDesc, MY_ORG } from '@aba/mock';
export type { AOrder, OrderMedia } from '@aba/mock';

import type { AOrder as _AOrder } from '@aba/mock';

// 0806：子机构演示订单（仅机构后台父机构视角可见；本地扩展、不进 @aba/mock，避免出现在平台全域订单）
export const CHILD_ORG_ORDERS: _AOrder[] = [
  { id: 'OD20260805218804', org: 'XX 少儿分社', type: '会员', tag: 'tag-amber', title: 'AI 会员 · 连续包月', amount: 19.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-08-05 20:11:02', payTime: '2026-08-05 20:11:20', user: 'wx_j88', autoRenew: true, memberFrom: '2026-08-05', memberTo: '2026-09-05' },
  { id: 'OD20260803771230', org: 'XX 少儿分社', type: '永享', tag: 'tag-jade', title: '拼音王国 · 启蒙音频合集', amount: 29.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-08-03 15:40:11', payTime: '2026-08-03 15:40:35', user: '186****3321', kp: '拼音王国 · 启蒙篇' },
  { id: 'OD20260802009417', org: 'XX 教辅分社', type: '会员', tag: 'tag-amber', title: 'AI 会员 · 单月', amount: 25, status: '待支付', payMethod: '—', orderTime: '2026-08-02 21:03:44', payTime: '', user: '158****9902' },
];
