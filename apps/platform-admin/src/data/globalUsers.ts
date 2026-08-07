// 全域 C 端用户 mock（0714 从 GlobalUsers.tsx 视图下移，供视图与导出 spec 共用）。
// 本文件须保持 node 可运行（不 import react / .tsx / css / window）。

export interface GUser {
  nick: string;
  wx: string;
  phone: string;
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

export const GLOBAL_USERS: GUser[] = [
  { nick: '微信昵称A', wx: 'wx_abc', phone: '13800138888', org: 'XX 出版集团', memberState: 'active', memberExpire: '2026-09-12', yx: 3, gmv: 129.6, lastLogin: '2026-06-06 21:30:11', regAt: '2026-01-12 10:03:22' },
  { nick: '微信昵称B', wx: 'wx_xyz', phone: '—', org: 'YY 教育', memberState: 'none', yx: 0, gmv: 0, lastLogin: '2026-06-01 10:02:45', regAt: '2026-03-05 14:22:10' },
  { nick: '用户0000', wx: '—', phone: '13900000000', org: 'ZZ 少儿', memberState: 'active', memberExpire: '2026-08-30', yx: 1, gmv: 39.8, lastLogin: '2026-06-05 08:14:20', regAt: '2025-12-20 09:41:35' },
  { nick: '微信昵称C', wx: 'wx_c01', phone: '13800131234', org: 'XX 出版集团', memberState: 'grace', memberExpire: '2026-08-01', yx: 2, gmv: 59.7, lastLogin: '2026-06-06 18:22:03', regAt: '2026-02-14 20:15:08' },
  { nick: '用户5678', wx: '—', phone: '13712345678', org: 'YY 教育', memberState: 'expired', memberExpire: '2026-06-10', yx: 0, gmv: 0, lastLogin: '2026-06-04 12:41:55', regAt: '2026-04-01 08:30:54' },
  { nick: '微信昵称D', wx: 'wx_d22', phone: '13600242468', org: 'ZZ 少儿', memberState: 'active', memberExpire: '2027-01-15', yx: 5, gmv: 219.4, lastLogin: '2026-06-06 09:05:18', regAt: '2025-11-08 16:47:29' },
  { nick: '微信昵称E', wx: 'wx_e33', phone: '—', org: 'XX 出版集团', memberState: 'none', yx: 0, gmv: 0, lastLogin: '2026-05-30 22:13:40', regAt: '2026-05-02 12:09:17' },
  { nick: '用户1357', wx: '—', phone: '13500131357', org: 'YY 教育', memberState: 'grace', memberExpire: '2026-07-29', yx: 1, gmv: 19.9, lastLogin: '2026-06-05 16:48:27', regAt: '2026-01-28 19:33:46' },
  { nick: '微信昵称F', wx: 'wx_f44', phone: '13400868642', org: 'ZZ 少儿', memberState: 'active', memberExpire: '2026-10-02', yx: 4, gmv: 159.2, lastLogin: '2026-06-06 07:30:09', regAt: '2025-12-02 07:56:03' },
  { nick: '微信昵称G', wx: 'wx_g55', phone: '—', org: 'XX 出版集团', memberState: 'expired', memberExpire: '2026-05-06', yx: 0, gmv: 0, lastLogin: '2026-05-28 11:19:51', regAt: '2026-03-19 22:24:38' },
  { nick: '用户2024', wx: '—', phone: '13300202024', org: 'YY 教育', memberState: 'active', memberExpire: '2026-09-06', yx: 2, gmv: 79.6, lastLogin: '2026-06-04 20:02:33', regAt: '2026-02-06 11:18:52' },
  { nick: '微信昵称H', wx: 'wx_h66', phone: '13200979753', org: 'ZZ 少儿', memberState: 'none', yx: 0, gmv: 0, lastLogin: '2026-06-02 14:55:12', regAt: '2026-04-27 15:40:26' },
  { nick: '微信昵称I', wx: 'wx_i77', phone: '13100363690', org: 'XX 出版集团', memberState: 'active', memberExpire: '2026-12-16', yx: 6, gmv: 289.3, lastLogin: '2026-06-06 23:11:47', regAt: '2025-10-16 13:27:44' },
  { nick: '用户8080', wx: '—', phone: '13000808080', org: 'YY 教育', memberState: 'expired', memberExpire: '2026-07-21', yx: 1, gmv: 9.9, lastLogin: '2026-06-03 08:44:21', regAt: '2026-05-21 18:02:59' },
];
