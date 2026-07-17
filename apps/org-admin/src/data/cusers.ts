// 0714：C 端用户 mock 从 CUsers.tsx 下移为纯数据文件（导出 spec / 模板脚本需在 node 直接 import，不能连着 view 一起拉进来）。
export interface U {
  i: number;
  nick: string;
  phone: string;
  wx: string;
  gender: string; // 微信授权带回；非微信 / 未填为 —
  region: string;
  member: boolean;
  yx: number;
  gmv: number;
  lastLogin: string;
  /** 0716 二批 #4：注册时间（最新登录时间之后新增列，支持排序） */
  regAt: string;
}

export const USERS: U[] = [
  // 昵称规则:微信登录取微信昵称;手机号登录取「用户+手机号后四位」(可重复)。0613：地区/性别微信授权带回,非微信为 —
  { i: 1, nick: '微信昵称A', phone: '138****8888', wx: 'wx_abc', gender: '女', region: '上海 · 浦东', member: true, yx: 3, gmv: 129.6, lastLogin: '2026-06-06 21:30:11', regAt: '2026-01-12 10:03:22' },
  { i: 2, nick: '微信昵称B', phone: '—', wx: 'wx_xyz', gender: '男', region: '北京 · 朝阳', member: false, yx: 0, gmv: 0, lastLogin: '2026-06-01 10:02:45', regAt: '2026-03-05 14:22:10' },
  { i: 3, nick: '用户0000', phone: '139****0000', wx: '—', gender: '—', region: '—', member: true, yx: 1, gmv: 39.8, lastLogin: '2026-06-05 08:14:20', regAt: '2025-12-20 09:41:35' },
  { i: 4, nick: '微信昵称C', phone: '138****1234', wx: 'wx_c01', gender: '女', region: '广州 · 天河', member: true, yx: 2, gmv: 59.7, lastLogin: '2026-06-06 18:22:03', regAt: '2026-02-14 20:15:08' },
  { i: 5, nick: '用户5678', phone: '137****5678', wx: '—', gender: '—', region: '—', member: false, yx: 0, gmv: 0, lastLogin: '2026-06-04 12:41:55', regAt: '2026-04-01 08:30:54' },
  { i: 6, nick: '微信昵称D', phone: '136****2468', wx: 'wx_d22', gender: '男', region: '深圳 · 南山', member: true, yx: 5, gmv: 219.4, lastLogin: '2026-06-06 09:05:18', regAt: '2025-11-08 16:47:29' },
  { i: 7, nick: '微信昵称E', phone: '—', wx: 'wx_e33', gender: '女', region: '杭州 · 西湖', member: false, yx: 0, gmv: 0, lastLogin: '2026-05-30 22:13:40', regAt: '2026-05-02 12:09:17' },
  { i: 8, nick: '用户1357', phone: '135****1357', wx: '—', gender: '—', region: '—', member: true, yx: 1, gmv: 19.9, lastLogin: '2026-06-05 16:48:27', regAt: '2026-01-28 19:33:46' },
  { i: 9, nick: '微信昵称F', phone: '134****8642', wx: 'wx_f44', gender: '男', region: '成都 · 武侯', member: true, yx: 4, gmv: 159.2, lastLogin: '2026-06-06 07:30:09', regAt: '2025-12-02 07:56:03' },
  { i: 10, nick: '微信昵称G', phone: '—', wx: 'wx_g55', gender: '女', region: '武汉 · 洪山', member: false, yx: 0, gmv: 0, lastLogin: '2026-05-28 11:19:51', regAt: '2026-03-19 22:24:38' },
  { i: 11, nick: '用户2024', phone: '133****2024', wx: '—', gender: '—', region: '—', member: true, yx: 2, gmv: 79.6, lastLogin: '2026-06-04 20:02:33', regAt: '2026-02-06 11:18:52' },
  { i: 12, nick: '微信昵称H', phone: '132****9753', wx: 'wx_h66', gender: '男', region: '南京 · 鼓楼', member: false, yx: 0, gmv: 0, lastLogin: '2026-06-02 14:55:12', regAt: '2026-04-27 15:40:26' },
  { i: 13, nick: '微信昵称I', phone: '131****3690', wx: 'wx_i77', gender: '女', region: '西安 · 雁塔', member: true, yx: 6, gmv: 289.3, lastLogin: '2026-06-06 23:11:47', regAt: '2025-10-16 13:27:44' },
  { i: 14, nick: '用户8080', phone: '130****8080', wx: '—', gender: '—', region: '—', member: true, yx: 1, gmv: 9.9, lastLogin: '2026-06-03 08:44:21', regAt: '2026-05-21 18:02:59' },
];
