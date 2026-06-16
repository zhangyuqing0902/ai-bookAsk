// 后台订单数据（机构后台「订单管理」+ 平台后台「全域订单」+ 用户详情「全部订单」共用同一份，
// 不再各写一套）。0614b 下沉到 @aba/mock，并新增 org（归属机构）字段供平台视角展示 / 筛选。
export interface OrderMedia {
  kind: 'image' | 'audio' | 'video';
  name: string;
}

export interface AOrder {
  id: string;
  /** 归属机构（平台视角用；机构后台固定看自己） */
  org: string;
  type: '会员' | '永享' | '兑换码';
  tag: string;
  title: string;
  amount: number;
  status: string;
  payMethod: string;
  orderTime: string;
  payTime: string;
  user: string;
  /** 会员订单：自动续费 / 手动支付 */
  autoRenew?: boolean;
  /** 兑换码订单：兑换时间 */
  redeemTime?: string;
  kp?: string;
  media?: OrderMedia;
  code?: string;
  memberFrom?: string;
  memberTo?: string;
}

// 本机构（机构后台登录方）= XX 出版社；平台后台另含其他机构订单
export const MY_ORG = 'XX 出版社';

export const AORDERS: AOrder[] = [
  { id: 'OD20260530140208', org: 'XX 出版社', type: '会员', tag: 'tag-amber', title: '月度会员', amount: 19.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-30 14:01:50', payTime: '2026-05-30 14:02:08', user: '138****8888', autoRenew: true, memberFrom: '2026-05-30', memberTo: '2026-06-30' },
  { id: 'OD20260530152133', org: 'XX 出版社', type: '永享', tag: 'tag-indigo', title: '永久解锁', amount: 9.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-30 15:21:20', payTime: '2026-05-30 15:21:33', user: 'wx_abc', kp: '心血管分册', media: { kind: 'image', name: '心电图示例' } },
  { id: 'OD20260529091307', org: 'XX 出版社', type: '兑换码', tag: 'tag-jade', title: '会员 3 个月', amount: 0, status: '已核销', payMethod: '兑换码核销', orderTime: '2026-05-29 09:13:07', payTime: '2026-05-29 09:13:07', user: '139****0000', code: 'A7K9QP', redeemTime: '2026-05-29 09:13:07', memberFrom: '2026-05-29', memberTo: '2026-08-29' },
  { id: 'OD20260520101103', org: 'XX 出版社', type: '永享', tag: 'tag-indigo', title: '永久解锁', amount: 29.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-20 10:10:55', payTime: '2026-05-20 10:11:03', user: 'wx_c01', kp: '外科学', media: { kind: 'video', name: '手术演示视频' } },
  { id: 'OD20260528103412', org: 'XX 出版社', type: '会员', tag: 'tag-amber', title: '年度会员', amount: 198, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-28 10:33:58', payTime: '2026-05-28 10:34:12', user: '138****1234', autoRenew: false, memberFrom: '2026-05-28', memberTo: '2027-05-28' },
  { id: 'OD20260528164509', org: 'XX 出版社', type: '永享', tag: 'tag-indigo', title: '永久解锁', amount: 9.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-28 16:44:50', payTime: '2026-05-28 16:45:09', user: 'wx_d22', kp: '儿科学', media: { kind: 'audio', name: '专题讲座音频' } },
  { id: 'OD20260527093320', org: 'XX 出版社', type: '会员', tag: 'tag-amber', title: '月度会员', amount: 19.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-27 09:33:05', payTime: '2026-05-27 09:33:20', user: '137****5678', autoRenew: true, memberFrom: '2026-05-27', memberTo: '2026-06-27' },
  { id: 'OD20260527141855', org: 'XX 出版社', type: '兑换码', tag: 'tag-jade', title: '会员 6 个月', amount: 0, status: '已核销', payMethod: '兑换码核销', orderTime: '2026-05-27 14:18:55', payTime: '2026-05-27 14:18:55', user: '135****1357', code: 'M3X2RT', redeemTime: '2026-05-27 14:18:55', memberFrom: '2026-05-27', memberTo: '2026-11-27' },
  { id: 'OD20260526112047', org: 'XX 出版社', type: '永享', tag: 'tag-indigo', title: '永久解锁', amount: 9.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-26 11:20:31', payTime: '2026-05-26 11:20:47', user: 'wx_f44', kp: '内科精要', media: { kind: 'image', name: '血压监测记录表' } },
  { id: 'OD20260526085533', org: 'XX 出版社', type: '会员', tag: 'tag-amber', title: '月度会员', amount: 19.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-26 08:55:18', payTime: '2026-05-26 08:55:33', user: '133****2024', autoRenew: true, memberFrom: '2026-05-26', memberTo: '2026-06-26' },
  { id: 'OD20260525170612', org: 'XX 出版社', type: '永享', tag: 'tag-indigo', title: '永久解锁', amount: 19.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-25 17:05:55', payTime: '2026-05-25 17:06:12', user: 'wx_i77', kp: '心血管分册', media: { kind: 'video', name: '示范 · 家庭血压测量' } },
  { id: 'OD20260525134428', org: 'XX 出版社', type: '会员', tag: 'tag-amber', title: '月度会员', amount: 19.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-25 13:44:10', payTime: '2026-05-25 13:44:28', user: '130****8080', autoRenew: false, memberFrom: '2026-05-25', memberTo: '2026-06-25' },
  { id: 'OD20260524101739', org: 'XX 出版社', type: '兑换码', tag: 'tag-jade', title: '会员 12 个月', amount: 0, status: '已核销', payMethod: '兑换码核销', orderTime: '2026-05-24 10:17:39', payTime: '2026-05-24 10:17:39', user: '136****2468', code: 'Q8P2LN', redeemTime: '2026-05-24 10:17:39', memberFrom: '2026-05-24', memberTo: '2027-05-24' },
  { id: 'OD20260524092214', org: 'XX 出版社', type: '永享', tag: 'tag-indigo', title: '永久解锁', amount: 29.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-24 09:21:58', payTime: '2026-05-24 09:22:14', user: 'wx_abc', kp: '外科学', media: { kind: 'video', name: '手术演示视频' } },
  { id: 'OD20260523155902', org: 'XX 出版社', type: '会员', tag: 'tag-amber', title: '年度会员', amount: 198, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-23 15:58:46', payTime: '2026-05-23 15:59:02', user: '137****5678', autoRenew: true, memberFrom: '2026-05-23', memberTo: '2027-05-23' },
  // —— 其他机构订单（仅平台后台「全域订单」可见，用于演示归属机构筛选）——
  { id: 'OD20260530173044', org: 'YY 教育', type: '会员', tag: 'tag-amber', title: '年度会员', amount: 198, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-30 17:30:22', payTime: '2026-05-30 17:30:44', user: '150****3322', autoRenew: true, memberFrom: '2026-05-30', memberTo: '2027-05-30' },
  { id: 'OD20260529142611', org: 'YY 教育', type: '永享', tag: 'tag-indigo', title: '永久解锁', amount: 12.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-29 14:25:50', payTime: '2026-05-29 14:26:11', user: 'wx_yy01', kp: '高中物理', media: { kind: 'video', name: '受力分析讲解' } },
  { id: 'OD20260528111903', org: 'ZZ 少儿', type: '会员', tag: 'tag-amber', title: '月度会员', amount: 19.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-28 11:18:47', payTime: '2026-05-28 11:19:03', user: '188****6677', autoRenew: false, memberFrom: '2026-05-28', memberTo: '2026-06-28' },
  { id: 'OD20260527160215', org: 'ZZ 少儿', type: '兑换码', tag: 'tag-jade', title: '会员 6 个月', amount: 0, status: '已核销', payMethod: '兑换码核销', orderTime: '2026-05-27 16:02:15', payTime: '2026-05-27 16:02:15', user: '199****1020', code: 'KID6MO', redeemTime: '2026-05-27 16:02:15', memberFrom: '2026-05-27', memberTo: '2026-11-27' },
  { id: 'OD20260526094530', org: 'YY 教育', type: '永享', tag: 'tag-indigo', title: '永久解锁', amount: 9.9, status: '已支付', payMethod: '微信支付', orderTime: '2026-05-26 09:45:12', payTime: '2026-05-26 09:45:30', user: 'wx_yy88', kp: '初中数学', media: { kind: 'image', name: '函数图像示例' } },
];

export const byPayDesc = (a: AOrder, b: AOrder) => (a.payTime < b.payTime ? 1 : -1);
