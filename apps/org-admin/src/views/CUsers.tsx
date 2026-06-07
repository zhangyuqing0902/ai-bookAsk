import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Dropdown, DataGrid, type Col } from '@aba/ui-admin';

interface U {
  i: number;
  nick: string;
  phone: string;
  wx: string;
  member: boolean;
  yx: number;
  gmv: number;
  lastLogin: string;
}
const USERS: U[] = [
  { i: 1, nick: '微信昵称A', phone: '138****8888', wx: 'wx_abc', member: true, yx: 3, gmv: 129.6, lastLogin: '2026-06-06 21:30:11' },
  { i: 2, nick: '微信昵称B', phone: '—', wx: 'wx_xyz', member: false, yx: 0, gmv: 0, lastLogin: '2026-06-01 10:02:45' },
  { i: 3, nick: '微信昵称C', phone: '139****0000', wx: 'wx_c01', member: true, yx: 1, gmv: 39.8, lastLogin: '2026-06-05 08:14:20' },
];

// 机构后台 · C 端用户列表（搜索 + 会员筛选 + 累计GMV/最新登录 + 排序）
export function CUsers() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [member, setMember] = useState('全部');

  const rows = USERS.filter(
    (u) => (!q || u.nick.includes(q) || u.phone.includes(q) || u.wx.includes(q)) && (member === '全部' || (member === '会员') === u.member),
  );

  const columns: Col<U>[] = [
    { header: '用户', className: 'strong', cell: (u) => u.nick },
    { header: '手机号', cell: (u) => (u.phone === '—' ? <span className="muted">—</span> : <span className="mono">{u.phone}</span>) },
    { header: '微信号', className: 'mono', cell: (u) => u.wx },
    { header: '会员状态', cell: (u) => <span className={'tag-s ' + (u.member ? 'tag-amber' : 'tag-line')}>{u.member ? '会员' : '非会员'}</span> },
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
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的用户' }} minWidth={860} />
    </>
  );
}
