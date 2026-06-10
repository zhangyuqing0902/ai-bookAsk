import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  { nick: '微信昵称A', wx: 'wx_abc', phone: '138****8888', org: 'XX 出版集团', member: true, yx: 3, gmv: 129.6, lastLogin: '2026-06-06 21:30:11' },
  { nick: '微信昵称B', wx: 'wx_xyz', phone: '—', org: 'YY 教育', member: false, yx: 0, gmv: 0, lastLogin: '2026-06-01 10:02:45' },
  { nick: '用户0000', wx: '—', phone: '139****0000', org: 'ZZ 少儿', member: true, yx: 1, gmv: 39.8, lastLogin: '2026-06-05 08:14:20' },
  { nick: '微信昵称C', wx: 'wx_c01', phone: '138****1234', org: 'XX 出版集团', member: true, yx: 2, gmv: 59.7, lastLogin: '2026-06-06 18:22:03' },
  { nick: '用户5678', wx: '—', phone: '137****5678', org: 'YY 教育', member: false, yx: 0, gmv: 0, lastLogin: '2026-06-04 12:41:55' },
  { nick: '微信昵称D', wx: 'wx_d22', phone: '136****2468', org: 'ZZ 少儿', member: true, yx: 5, gmv: 219.4, lastLogin: '2026-06-06 09:05:18' },
  { nick: '微信昵称E', wx: 'wx_e33', phone: '—', org: 'XX 出版集团', member: false, yx: 0, gmv: 0, lastLogin: '2026-05-30 22:13:40' },
  { nick: '用户1357', wx: '—', phone: '135****1357', org: 'YY 教育', member: true, yx: 1, gmv: 19.9, lastLogin: '2026-06-05 16:48:27' },
  { nick: '微信昵称F', wx: 'wx_f44', phone: '134****8642', org: 'ZZ 少儿', member: true, yx: 4, gmv: 159.2, lastLogin: '2026-06-06 07:30:09' },
  { nick: '微信昵称G', wx: 'wx_g55', phone: '—', org: 'XX 出版集团', member: false, yx: 0, gmv: 0, lastLogin: '2026-05-28 11:19:51' },
  { nick: '用户2024', wx: '—', phone: '133****2024', org: 'YY 教育', member: true, yx: 2, gmv: 79.6, lastLogin: '2026-06-04 20:02:33' },
  { nick: '微信昵称H', wx: 'wx_h66', phone: '132****9753', org: 'ZZ 少儿', member: false, yx: 0, gmv: 0, lastLogin: '2026-06-02 14:55:12' },
  { nick: '微信昵称I', wx: 'wx_i77', phone: '131****3690', org: 'XX 出版集团', member: true, yx: 6, gmv: 289.3, lastLogin: '2026-06-06 23:11:47' },
  { nick: '用户8080', wx: '—', phone: '130****8080', org: 'YY 教育', member: true, yx: 1, gmv: 9.9, lastLogin: '2026-06-03 08:44:21' },
];

// 平台后台 · 全域用户（搜索 + 会员/机构筛选 + 排序 + 详情 + 分页）
export function GlobalUsers() {
  const nav = useNavigate();
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
    { header: '用户昵称', className: 'strong', cell: (r) => r.nick },
    { header: '微信号', className: 'mono', cell: (r) => (r.wx === '—' ? <span className="muted">—</span> : r.wx) },
    { header: '手机号', cell: (r) => (r.phone === '—' ? <span className="muted">—</span> : <span className="mono">{r.phone}</span>) },
    { header: '归属机构', cell: (r) => r.org, sortValue: (r) => r.org },
    { header: '会员状态', cell: (r) => <span className={'tag-s ' + (r.member ? 'tag-amber' : 'tag-line')}>{r.member ? '会员' : '非会员'}</span>, sortValue: (r) => (r.member ? 1 : 0) },
    { header: '已购永享', className: 'mono', cell: (r) => r.yx, sortValue: (r) => r.yx },
    { header: '累计 GMV', className: 'mono', cell: (r) => '¥' + r.gmv, sortValue: (r) => r.gmv },
    { header: '最新登录时间', className: 'mono', cell: (r) => r.lastLogin, sortValue: (r) => r.lastLogin },
    { header: '操作', cell: (r) => <div className="op-cell"><span className="op" onClick={() => nav('/users/' + encodeURIComponent(r.nick), { state: r })}>详情</span></div> },
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
        <Dropdown label="归属机构" options={['全部', 'XX 出版集团', 'YY 教育', 'ZZ 少儿']} onSelect={setOrg} />
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的用户' }} minWidth={900} pageUnit="人" />
    </>
  );
}
