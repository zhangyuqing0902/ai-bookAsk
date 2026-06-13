import { useState } from 'react';
import { Search, Dropdown, DataGrid, type Col } from '@aba/ui-admin';
import { KPS, ORGS } from '@aba/mock';

// 平台超管 · 全域 KP（0613 新增）：跨机构知识产品聚合只读视图，供平台监管 / 统计。
const GRAN: Record<string, string> = { book: '书籍', series: '系列', expert: '专家库', domain: '领域', custom: '自定义' };
const STAT: Record<string, { t: string; cls: string }> = {
  published: { t: '已发布', cls: 'tag-jade' },
  draft: { t: '草稿', cls: 'tag-line' },
  archived: { t: '已下架', cls: 'tag-amber' },
};

type Kp = (typeof KPS)[number];

export function GlobalKps() {
  const [q, setQ] = useState('');
  const [org, setOrg] = useState('全部');
  const [status, setStatus] = useState('全部');

  const orgName = (id: string) => ORGS.find((o) => o.id === id)?.name ?? id;
  const orgNames = [...new Set(KPS.map((k) => orgName(k.orgId)))];

  const rows = KPS.filter(
    (k) =>
      (!q || k.name.includes(q)) &&
      (org === '全部' || orgName(k.orgId) === org) &&
      (status === '全部' || STAT[k.status]?.t === status),
  );

  const columns: Col<Kp>[] = [
    { header: '机构', cell: (k) => orgName(k.orgId) },
    { header: 'KP 名称', className: 'strong', cell: (k) => k.name },
    { header: '颗粒度', cell: (k) => GRAN[k.granularity] ?? k.granularity },
    { header: '基础标', cell: (k) => (k.baseTag ? <span className={'tag-s ' + (k.baseTag === 'member' ? 'tag-amber' : 'tag-jade')}>{k.baseTag === 'member' ? '会员' : '免费'}</span> : <span className="muted">—</span>) },
    { header: '永享', cell: (k) => (k.hasForever ? <span className="tag-s tag-indigo">有</span> : <span className="muted">—</span>) },
    { header: '状态', cell: (k) => { const s = STAT[k.status]; return <span className={'tag-s ' + (s?.cls ?? 'tag-line')}>{s?.t ?? k.status}</span>; }, sortValue: (k) => k.status },
    { header: '创建时间', className: 'mono', cell: (k) => k.createdAt, sortValue: (k) => k.createdAt },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">全域 KP</div>
        </div>
      </div>
      <div className="filter">
        <Search placeholder="搜索 KP 名称" minWidth={240} value={q} onChange={setQ} />
        <Dropdown label="机构" options={['全部', ...orgNames]} onSelect={setOrg} style={{ width: 180 }} />
        <Dropdown label="状态" options={['全部', '已发布', '草稿', '已下架']} onSelect={setStatus} />
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--ink-3)', margin: '0 0 12px 2px' }}>
        平台视角跨机构知识产品聚合（只读，供监管 / 统计）。Agent / 用户反馈 / 兑换码不在此平铺，可从「机构详情」下钻查看。
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的 KP' }} minWidth={960} pageUnit="个" />
    </>
  );
}
