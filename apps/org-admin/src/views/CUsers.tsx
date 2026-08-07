import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, DataGrid, exportWorkbook, type Col } from '@aba/ui-admin';
import {
  MEMBER_FILTER_OPTIONS, MEMBER_STATE_LABEL, MEMBER_STATE_TAG, MEMBER_STATE_ORDER, memberStateByLabel,
  ORG_FILTER_ALL, orgScopeOptions, orgScopeValue, visibleOrgs,
} from '@aba/mock';
import { USERS, type U } from '../data/cusers';
import { buildCUsersSpec } from '../exports/cusers';
import { useOrgScope } from '../stores/orgScope';

// 机构后台 · C 端用户列表（搜索 + 会员筛选 + 地区/性别 + 累计GMV/最新登录 + 排序 + 导出）
// 0714：mock 数据下移 data/cusers.ts；导出走 spec 纯函数（exports/cusers.ts），与 docs 模板脚本同源
// 0806：会员状态四态五档筛选；父机构视角新增「机构」单选筛选 + 归属机构列（子 / 独立视角保持现状）
export function CUsers() {
  const nav = useNavigate();
  const orgType = useOrgScope((s) => s.orgType);
  const isParent = orgType === 'parent';
  const [q, setQ] = useState('');
  const [member, setMember] = useState('全部');
  const [orgSel, setOrgSel] = useState(ORG_FILTER_ALL);

  const scope = visibleOrgs(orgType);
  const rows = USERS.filter(
    (u) =>
      scope.includes(u.org) &&
      (!isParent || orgSel === ORG_FILTER_ALL || u.org === orgSel) &&
      (!q || u.nick.includes(q) || u.phone.includes(q) || u.wx.includes(q)) &&
      (member === '全部' || memberStateByLabel(member) === u.memberState),
  );

  const dash = (v: string) => (v === '—' ? <span className="muted">—</span> : v);

  const columns: Col<U>[] = [
    { header: '用户昵称', className: 'strong', cell: (u) => u.nick },
    { header: '手机号', cell: (u) => (u.phone === '—' ? <span className="muted">—</span> : <span className="mono">{u.phone}</span>) },
    { header: '微信号', className: 'mono', cell: (u) => (u.wx === '—' ? <span className="muted">—</span> : u.wx) },
    // 0806：父机构视角展示数据归属机构
    ...(isParent ? [{ header: '归属机构', cell: (u: U) => u.org, sortValue: (u: U) => u.org } as Col<U>] : []),
    { header: '地区', cell: (u) => dash(u.region), sortValue: (u) => u.region },
    { header: '性别', cell: (u) => dash(u.gender), sortValue: (u) => u.gender },
    { header: '会员状态', cell: (u) => <span className={'tag-s ' + MEMBER_STATE_TAG[u.memberState]}>{MEMBER_STATE_LABEL[u.memberState]}</span>, sortValue: (u) => MEMBER_STATE_ORDER[u.memberState] },
    { header: '已购永享', className: 'mono', cell: (u) => u.yx, sortValue: (u) => u.yx },
    { header: '累计 GMV', className: 'mono', cell: (u) => '¥' + u.gmv, sortValue: (u) => u.gmv },
    { header: '最新登录时间', className: 'mono', cell: (u) => u.lastLogin, sortValue: (u) => u.lastLogin },
    // 0716 二批 #4：注册时间列（支持升 / 降序）
    { header: '注册时间', className: 'mono', cell: (u) => u.regAt, sortValue: (u) => u.regAt },
    // 0806：详情携行数据（详情页随所点行真实渲染，替换原硬编码演示数据）
    { header: '操作', cell: (u) => <span className="op" onClick={() => nav('/users/' + u.i, { state: u })}>详情</span> },
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
        {/* 0806：父机构视角——机构单选筛选（全部机构 / 本机构（父机构）/ 各子机构） */}
        {isParent && <Dropdown label="机构" options={orgScopeOptions()} onSelect={(v) => setOrgSel(v === ORG_FILTER_ALL ? ORG_FILTER_ALL : orgScopeValue(v))} style={{ width: 200 }} />}
        <Dropdown label="会员状态" options={MEMBER_FILTER_OPTIONS} onSelect={setMember} style={{ width: 190 }} />
        <div className="grow" />
        {/* 0714：导出走 spec 纯函数，rows 为当前过滤结果 */}
        <button className="btn btn-ghost btn-sm" onClick={() => { void exportWorkbook(buildCUsersSpec({ rows, q, member, org: isParent ? orgSel : undefined })); toast('正在导出'); }}>
          <Icon id="i-dl" w={14} h={14} />
          导出
        </button>
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的用户' }} minWidth={isParent ? 1220 : 1100} pageUnit="人" />
    </>
  );
}
