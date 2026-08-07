import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, DataGrid, exportWorkbook, type Col } from '@aba/ui-admin';
import { orgOptionLabel, orgOptionValue, MEMBER_FILTER_OPTIONS, MEMBER_STATE_LABEL, MEMBER_STATE_TAG, MEMBER_STATE_ORDER, memberStateByLabel } from '@aba/mock';
import { GLOBAL_USERS, type GUser } from '../data/globalUsers';
import { buildGlobalUsersSpec } from '../exports/globalUsers';

// 平台后台 · 全域用户（搜索 + 会员/机构筛选 + 排序 + 详情 + 分页）
// 0806：会员状态由「会员/非会员」二分改四态五档（口径见 @aba/mock memberState.ts）
// 0714：mock 数据下移 ../data/globalUsers；导出迁移到 exports/globalUsers.ts spec，
//       按钮从页头下移到筛选行（对齐机构后台形态）；「归属机构」统一为「机构」。
export function GlobalUsers() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [member, setMember] = useState('全部');
  const [org, setOrg] = useState('全部');

  const rows = GLOBAL_USERS.filter(
    (r) =>
      (!q || r.nick.includes(q) || r.wx.includes(q) || r.phone.includes(q)) &&
      (member === '全部' || memberStateByLabel(member) === r.memberState) &&
      (org === '全部' || r.org === org),
  );

  // 0716 二批 #3：导出＝当前筛选下的全量数据（非仅当前页）。无任何筛选时全域用户共 12,480 人，
  // 超过单次导出上限 10000 条 → 弹超限提示（演示）；加任一筛选缩小范围后可正常导出。
  const FULL_USER_COUNT = 12480;
  const noFilter = !q && member === '全部' && org === '全部';
  const doExport = () => {
    const exportRows = noFilter
      ? Array.from({ length: FULL_USER_COUNT }, (_, i) => GLOBAL_USERS[i % GLOBAL_USERS.length])
      : rows;
    void exportWorkbook(buildGlobalUsersSpec({
      rows: exportRows,
      filters: [['关键词', q || '无'], ['机构', org], ['会员状态', member]],
    }));
    if (!noFilter) toast('正在导出');
  };

  const columns: Col<GUser>[] = [
    { header: '用户昵称', className: 'strong', cell: (r) => r.nick },
    { header: '微信号', className: 'mono', cell: (r) => (r.wx === '—' ? <span className="muted">—</span> : r.wx) },
    { header: '手机号', cell: (r) => (r.phone === '—' ? <span className="muted">—</span> : <span className="mono">{r.phone}</span>) },
    { header: '机构', cell: (r) => r.org, sortValue: (r) => r.org },
    // 0806：会员状态四态标签（有效=玉绿 / 宽限=琥珀 / 过期=赤陶 / 未开通=灰描边）
    { header: '会员状态', cell: (r) => <span className={'tag-s ' + MEMBER_STATE_TAG[r.memberState]}>{MEMBER_STATE_LABEL[r.memberState]}</span>, sortValue: (r) => MEMBER_STATE_ORDER[r.memberState] },
    { header: '已购永享', className: 'mono', cell: (r) => r.yx, sortValue: (r) => r.yx },
    { header: '累计 GMV', className: 'mono', cell: (r) => '¥' + r.gmv, sortValue: (r) => r.gmv },
    { header: '最新登录时间', className: 'mono', cell: (r) => r.lastLogin, sortValue: (r) => r.lastLogin },
    // 0716 二批 #4：注册时间列（支持升 / 降序）
    { header: '注册时间', className: 'mono', cell: (r) => r.regAt, sortValue: (r) => r.regAt },
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
        {/* 0806：五档筛选＝全部＋四态 */}
        <Dropdown label="会员状态" options={MEMBER_FILTER_OPTIONS} onSelect={setMember} style={{ width: 190 }} />
        <Dropdown label="机构" options={['全部', ...['XX 出版集团', 'YY 教育', 'ZZ 少儿'].map(orgOptionLabel)]} onSelect={(v) => setOrg(orgOptionValue(v))} style={{ width: 190 }} />
        <div className="grow" />
        <button className="btn btn-ghost btn-sm" onClick={doExport}>
          <Icon id="i-dl" w={14} h={14} />
          导出
        </button>
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的用户' }} minWidth={900} pageUnit="人" />
    </>
  );
}
