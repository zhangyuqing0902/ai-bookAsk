// 0714：C 端用户 mock 从 CUsers.tsx 下移为纯数据文件（导出 spec / 模板脚本需在 node 直接 import，不能连着 view 一起拉进来）。
export interface U {
  i: number;
  nick: string;
  phone: string;
  wx: string;
  gender: string; // 微信授权带回；非微信 / 未填为 —
  region: string;
  /** 0806：数据归属机构（父机构视角展示 / 筛选用；子、独立机构视角仅可见本机构行） */
  org: string;
  /** 0806：会员状态四态（有效/宽限/过期/未开通），替换原 member: boolean 二分 */
  memberState: 'active' | 'grace' | 'expired' | 'none';
  /** 0806：会员到期时间（active＝有效期至；grace/expired＝已于该日到期；none＝无） */
  memberExpire?: string;
  yx: number;
  gmv: number;
  lastLogin: string;
  /** 0716 二批 #4：注册时间（最新登录时间之后新增列，支持排序） */
  regAt: string;
}

export const USERS: U[] = [
  // 昵称规则:微信登录取微信昵称;手机号登录取「用户+手机号后四位」(可重复)。0613：地区/性别微信授权带回,非微信为 —
  { i: 1, nick: '微信昵称A', phone: '138****8888', wx: 'wx_abc', gender: '女', region: '上海 · 浦东', org: 'XX 出版社', memberState: 'active', memberExpire: '2026-09-12', yx: 3, gmv: 129.6, lastLogin: '2026-06-06 21:30:11', regAt: '2026-01-12 10:03:22' },
  { i: 2, nick: '微信昵称B', phone: '—', wx: 'wx_xyz', gender: '男', region: '北京 · 朝阳', org: 'XX 出版社', memberState: 'none', yx: 0, gmv: 0, lastLogin: '2026-06-01 10:02:45', regAt: '2026-03-05 14:22:10' },
  { i: 3, nick: '用户0000', phone: '139****0000', wx: '—', gender: '—', region: '—', org: 'XX 出版社', memberState: 'active', memberExpire: '2026-08-30', yx: 1, gmv: 39.8, lastLogin: '2026-06-05 08:14:20', regAt: '2025-12-20 09:41:35' },
  { i: 4, nick: '微信昵称C', phone: '138****1234', wx: 'wx_c01', gender: '女', region: '广州 · 天河', org: 'XX 出版社', memberState: 'grace', memberExpire: '2026-08-01', yx: 2, gmv: 59.7, lastLogin: '2026-06-06 18:22:03', regAt: '2026-02-14 20:15:08' },
  { i: 5, nick: '用户5678', phone: '137****5678', wx: '—', gender: '—', region: '—', org: 'XX 出版社', memberState: 'expired', memberExpire: '2026-06-10', yx: 0, gmv: 0, lastLogin: '2026-06-04 12:41:55', regAt: '2026-04-01 08:30:54' },
  { i: 6, nick: '微信昵称D', phone: '136****2468', wx: 'wx_d22', gender: '男', region: '深圳 · 南山', org: 'XX 出版社', memberState: 'active', memberExpire: '2027-01-15', yx: 5, gmv: 219.4, lastLogin: '2026-06-06 09:05:18', regAt: '2025-11-08 16:47:29' },
  { i: 7, nick: '微信昵称E', phone: '—', wx: 'wx_e33', gender: '女', region: '杭州 · 西湖', org: 'XX 出版社', memberState: 'none', yx: 0, gmv: 0, lastLogin: '2026-05-30 22:13:40', regAt: '2026-05-02 12:09:17' },
  { i: 8, nick: '用户1357', phone: '135****1357', wx: '—', gender: '—', region: '—', org: 'XX 出版社', memberState: 'grace', memberExpire: '2026-07-29', yx: 1, gmv: 19.9, lastLogin: '2026-06-05 16:48:27', regAt: '2026-01-28 19:33:46' },
  { i: 9, nick: '微信昵称F', phone: '134****8642', wx: 'wx_f44', gender: '男', region: '成都 · 武侯', org: 'XX 出版社', memberState: 'active', memberExpire: '2026-10-02', yx: 4, gmv: 159.2, lastLogin: '2026-06-06 07:30:09', regAt: '2025-12-02 07:56:03' },
  { i: 10, nick: '微信昵称G', phone: '—', wx: 'wx_g55', gender: '女', region: '武汉 · 洪山', org: 'XX 出版社', memberState: 'expired', memberExpire: '2026-05-06', yx: 0, gmv: 0, lastLogin: '2026-05-28 11:19:51', regAt: '2026-03-19 22:24:38' },
  { i: 11, nick: '用户2024', phone: '133****2024', wx: '—', gender: '—', region: '—', org: 'XX 出版社', memberState: 'active', memberExpire: '2026-09-06', yx: 2, gmv: 79.6, lastLogin: '2026-06-04 20:02:33', regAt: '2026-02-06 11:18:52' },
  { i: 12, nick: '微信昵称H', phone: '132****9753', wx: 'wx_h66', gender: '男', region: '南京 · 鼓楼', org: 'XX 出版社', memberState: 'none', yx: 0, gmv: 0, lastLogin: '2026-06-02 14:55:12', regAt: '2026-04-27 15:40:26' },
  { i: 13, nick: '微信昵称I', phone: '131****3690', wx: 'wx_i77', gender: '女', region: '西安 · 雁塔', org: 'XX 出版社', memberState: 'active', memberExpire: '2026-12-16', yx: 6, gmv: 289.3, lastLogin: '2026-06-06 23:11:47', regAt: '2025-10-16 13:27:44' },
  { i: 14, nick: '用户8080', phone: '130****8080', wx: '—', gender: '—', region: '—', org: 'XX 出版社', memberState: 'expired', memberExpire: '2026-07-21', yx: 1, gmv: 9.9, lastLogin: '2026-06-03 08:44:21', regAt: '2026-05-21 18:02:59' },
  // 0806：子机构演示数据（仅父机构视角可见；子 / 独立机构视角自动隐藏，界面保持现状）
  { i: 15, nick: '微信昵称J', phone: '186****3321', wx: 'wx_j88', gender: '女', region: '上海 · 徐汇', org: 'XX 少儿分社', memberState: 'active', memberExpire: '2026-11-20', yx: 2, gmv: 99.4, lastLogin: '2026-08-05 20:12:40', regAt: '2026-03-11 09:20:31' },
  { i: 16, nick: '用户6611', phone: '185****6611', wx: '—', gender: '—', region: '—', org: 'XX 少儿分社', memberState: 'grace', memberExpire: '2026-07-31', yx: 0, gmv: 29.9, lastLogin: '2026-08-04 15:41:02', regAt: '2026-04-18 11:05:44' },
  { i: 17, nick: '微信昵称K', phone: '158****9902', wx: 'wx_k99', gender: '男', region: '苏州 · 园区', org: 'XX 教辅分社', memberState: 'none', yx: 0, gmv: 0, lastLogin: '2026-08-02 10:33:15', regAt: '2026-06-01 17:28:09' },
  { i: 18, nick: '用户7745', phone: '150****7745', wx: '—', gender: '—', region: '—', org: 'XX 教辅分社', memberState: 'expired', memberExpire: '2026-06-28', yx: 1, gmv: 19.9, lastLogin: '2026-07-30 21:09:58', regAt: '2026-02-25 08:52:17' },
];
