import { useState } from 'react';
import { Search, Dropdown, DataGrid, type Col } from '@aba/ui-admin';

interface U {
  nick: string;
  wx: string;
  phone: string;
  org: string;
  member: boolean;
  yx: number;
  gmv: number;
  lastLogin: string;
}
const ROWS: U[] = [
  { nick: '微信昵称A', wx: 'wx_abc', phone: '138****8888', org: 'XX 出版社', member: true, yx: 3, gmv: 129.6, lastLogin: '2026-06-06 21:30:11' },
  { nick: '微信昵称B', wx: 'wx_xyz', phone: '—', org: 'YY 教育', member: false, yx: 0, gmv: 0, lastLogin: '2026-06-01 10:02:45' },
  { nick: '微信昵称C', wx: 'wx_c01', phone: '139****0000', org: 'ZZ 少儿', member: true, yx: 1, gmv: 39.8, lastLogin: '2026-06-05 08:14:20' },
];

// 平台后台 · 全域用户（搜索 + 会员/机构筛选 + 排序 + 累计GMV/最新登录）
export function GlobalUsers() {
  const [q, setQ] = useState('');
  const [member, setMember] = useState('全部');
  const [org, setOrg] = useState('全部');

  const rows = ROWS.filter(
    (r) =>
      (!q || r.nick.includes(q) || r.wx.includes(q) || r.phone.includes(q)) &&
      (member === '全部' || (member === '会员') === r.member) &&
      (org === '全部' || r.org === org),
  );

  const columns: Col<U>[] = [
    { header: '用户', className: 'strong', cell: (r) => r.nick },
    { header: '微信号', className: 'mono', cell: (r) => r.wx },
    { header: '手机号', cell: (r) => (r.phone === '—' ? <span className="muted">—</span> : <span className="mono">{r.phone}</span>) },
    { header: '归属机构', cell: (r) => r.org },
    { header: '会员状态', cell: (r) => <span className={'tag-s ' + (r.member ? 'tag-amber' : 'tag-line')}>{r.member ? '会员' : '非会员'}</span> },
    { header: '已购永享', className: 'mono', cell: (r) => r.yx, sortValue: (r) => r.yx },
    { header: '累计 GMV', className: 'mono', cell: (r) => '¥' + r.gmv, sortValue: (r) => r.gmv },
    { header: '最新登录时间', className: 'mono', cell: (r) => r.lastLogin, sortValue: (r) => r.lastLogin },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">全域用户</div>
        </div>
      </div>
      <div className="filter">
        <Search placeholder="账户名 / 微信号 / 手机号" minWidth={260} value={q} onChange={setQ} />
        <Dropdown label="会员状态" options={['全部', '会员', '非会员']} onSelect={setMember} />
        <Dropdown label="归属机构" options={['全部', 'XX 出版社', 'YY 教育', 'ZZ 少儿']} onSelect={setOrg} />
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的用户' }} minWidth={820} />
    </>
  );
}
