import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, DataGrid, type Col } from '@aba/ui-admin';

interface U {
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
}
const USERS: U[] = [
  // 昵称规则:微信登录取微信昵称;手机号登录取「用户+手机号后四位」(可重复)。0613：地区/性别微信授权带回,非微信为 —
  { i: 1, nick: '微信昵称A', phone: '138****8888', wx: 'wx_abc', gender: '女', region: '上海 · 浦东', member: true, yx: 3, gmv: 129.6, lastLogin: '2026-06-06 21:30:11' },
  { i: 2, nick: '微信昵称B', phone: '—', wx: 'wx_xyz', gender: '男', region: '北京 · 朝阳', member: false, yx: 0, gmv: 0, lastLogin: '2026-06-01 10:02:45' },
  { i: 3, nick: '用户0000', phone: '139****0000', wx: '—', gender: '—', region: '—', member: true, yx: 1, gmv: 39.8, lastLogin: '2026-06-05 08:14:20' },
  { i: 4, nick: '微信昵称C', phone: '138****1234', wx: 'wx_c01', gender: '女', region: '广州 · 天河', member: true, yx: 2, gmv: 59.7, lastLogin: '2026-06-06 18:22:03' },
  { i: 5, nick: '用户5678', phone: '137****5678', wx: '—', gender: '—', region: '—', member: false, yx: 0, gmv: 0, lastLogin: '2026-06-04 12:41:55' },
  { i: 6, nick: '微信昵称D', phone: '136****2468', wx: 'wx_d22', gender: '男', region: '深圳 · 南山', member: true, yx: 5, gmv: 219.4, lastLogin: '2026-06-06 09:05:18' },
  { i: 7, nick: '微信昵称E', phone: '—', wx: 'wx_e33', gender: '女', region: '杭州 · 西湖', member: false, yx: 0, gmv: 0, lastLogin: '2026-05-30 22:13:40' },
  { i: 8, nick: '用户1357', phone: '135****1357', wx: '—', gender: '—', region: '—', member: true, yx: 1, gmv: 19.9, lastLogin: '2026-06-05 16:48:27' },
  { i: 9, nick: '微信昵称F', phone: '134****8642', wx: 'wx_f44', gender: '男', region: '成都 · 武侯', member: true, yx: 4, gmv: 159.2, lastLogin: '2026-06-06 07:30:09' },
  { i: 10, nick: '微信昵称G', phone: '—', wx: 'wx_g55', gender: '女', region: '武汉 · 洪山', member: false, yx: 0, gmv: 0, lastLogin: '2026-05-28 11:19:51' },
  { i: 11, nick: '用户2024', phone: '133****2024', wx: '—', gender: '—', region: '—', member: true, yx: 2, gmv: 79.6, lastLogin: '2026-06-04 20:02:33' },
  { i: 12, nick: '微信昵称H', phone: '132****9753', wx: 'wx_h66', gender: '男', region: '南京 · 鼓楼', member: false, yx: 0, gmv: 0, lastLogin: '2026-06-02 14:55:12' },
  { i: 13, nick: '微信昵称I', phone: '131****3690', wx: 'wx_i77', gender: '女', region: '西安 · 雁塔', member: true, yx: 6, gmv: 289.3, lastLogin: '2026-06-06 23:11:47' },
  { i: 14, nick: '用户8080', phone: '130****8080', wx: '—', gender: '—', region: '—', member: true, yx: 1, gmv: 9.9, lastLogin: '2026-06-03 08:44:21' },
];

// 机构后台 · C 端用户列表（搜索 + 会员筛选 + 地区/性别 + 累计GMV/最新登录 + 排序 + 导出）
export function CUsers() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [member, setMember] = useState('全部');

  const rows = USERS.filter(
    (u) => (!q || u.nick.includes(q) || u.phone.includes(q) || u.wx.includes(q)) && (member === '全部' || (member === '会员') === u.member),
  );

  const dash = (v: string) => (v === '—' ? <span className="muted">—</span> : v);

  const columns: Col<U>[] = [
    { header: '用户昵称', className: 'strong', cell: (u) => u.nick },
    { header: '手机号', cell: (u) => (u.phone === '—' ? <span className="muted">—</span> : <span className="mono">{u.phone}</span>) },
    { header: '微信号', className: 'mono', cell: (u) => (u.wx === '—' ? <span className="muted">—</span> : u.wx) },
    { header: '地区', cell: (u) => dash(u.region) },
    { header: '性别', cell: (u) => dash(u.gender) },
    { header: '会员状态', cell: (u) => <span className={'tag-s ' + (u.member ? 'tag-amber' : 'tag-line')}>{u.member ? '会员' : '非会员'}</span>, sortValue: (u) => (u.member ? 1 : 0) },
    { header: '已购永享', className: 'mono', cell: (u) => u.yx, sortValue: (u) => u.yx },
    { header: '累计 GMV', className: 'mono', cell: (u) => '¥' + u.gmv, sortValue: (u) => u.gmv },
    { header: '最新登录时间', className: 'mono', cell: (u) => u.lastLogin, sortValue: (u) => u.lastLogin },
    { header: '操作', cell: (u) => <span className="op" onClick={() => nav('/users/' + u.i)}>详情</span> },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">C 端用户</div>
        </div>
      </div>
      <div className="filter">
        <Search placeholder="搜索手机号 / 微信号 / 昵称" minWidth={240} value={q} onChange={setQ} />
        <Dropdown label="会员状态" options={['全部', '会员', '非会员']} onSelect={setMember} />
        <div className="grow" />
        <button className="btn btn-ghost btn-sm" onClick={() => toast('导出用户（当前筛选结果）')}>
          <Icon id="i-dl" w={14} h={14} />
          导出
        </button>
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的用户' }} minWidth={1100} pageUnit="人" />
    </>
  );
}
