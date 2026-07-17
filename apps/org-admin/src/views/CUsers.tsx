import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, DataGrid, exportWorkbook, type Col } from '@aba/ui-admin';
import { USERS, type U } from '../data/cusers';
import { buildCUsersSpec } from '../exports/cusers';

// 机构后台 · C 端用户列表（搜索 + 会员筛选 + 地区/性别 + 累计GMV/最新登录 + 排序 + 导出）
// 0714：mock 数据下移 data/cusers.ts；导出走 spec 纯函数（exports/cusers.ts），与 docs 模板脚本同源
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
    { header: '地区', cell: (u) => dash(u.region), sortValue: (u) => u.region },
    { header: '性别', cell: (u) => dash(u.gender), sortValue: (u) => u.gender },
    { header: '会员状态', cell: (u) => <span className={'tag-s ' + (u.member ? 'tag-amber' : 'tag-line')}>{u.member ? '会员' : '非会员'}</span>, sortValue: (u) => (u.member ? 1 : 0) },
    { header: '已购永享', className: 'mono', cell: (u) => u.yx, sortValue: (u) => u.yx },
    { header: '累计 GMV', className: 'mono', cell: (u) => '¥' + u.gmv, sortValue: (u) => u.gmv },
    { header: '最新登录时间', className: 'mono', cell: (u) => u.lastLogin, sortValue: (u) => u.lastLogin },
    // 0716 二批 #4：注册时间列（支持升 / 降序）
    { header: '注册时间', className: 'mono', cell: (u) => u.regAt, sortValue: (u) => u.regAt },
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
        {/* 0714：导出走 spec 纯函数，rows 为当前过滤结果 */}
        <button className="btn btn-ghost btn-sm" onClick={() => { void exportWorkbook(buildCUsersSpec({ rows, q, member })); toast('正在导出'); }}>
          <Icon id="i-dl" w={14} h={14} />
          导出
        </button>
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的用户' }} minWidth={1100} pageUnit="人" />
    </>
  );
}
