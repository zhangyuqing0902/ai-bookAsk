import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { Search, Dropdown, EmptyState } from '@aba/ui-admin';
import { KPS, ORGS } from '@aba/mock';

// 平台超管 · 全域知识 KP（0614b：表格 → 卡片，复用机构后台 KP 列表视觉；每卡显示归属机构；只读监管）。
const STAT: Record<string, { t: string; cls: string }> = {
  published: { t: '已发布', cls: 'tag-jade' },
  draft: { t: '草稿', cls: 'tag-line' },
  archived: { t: '已下架', cls: 'tag-amber' },
};
const COVERS = ['', 'c2', 'c3', 'c4'];

type Kp = (typeof KPS)[number];

export function GlobalKps() {
  const nav = useNavigate();
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

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">全域知识产品 KP</div>
        </div>
      </div>
      <div className="filter">
        <Search placeholder="搜索 KP 名称" minWidth={240} value={q} onChange={setQ} />
        <Dropdown label="机构" options={['全部', ...orgNames]} onSelect={setOrg} style={{ width: 180 }} />
        <Dropdown label="状态" options={['全部', '已发布', '草稿', '已下架']} onSelect={setStatus} />
      </div>
      {rows.length === 0 ? (
        <div className="card card-pad">
          <EmptyState icon="i-cube" title="没有匹配的 KP" sub="换个名称、机构或状态试试" />
        </div>
      ) : (
        <div className="kp-grid">
          {rows.map((k, i) => {
            const s = STAT[k.status] ?? { t: k.status, cls: 'tag-line' };
            return (
              <div className="kp-card" key={k.orgId + k.name} style={{ cursor: 'pointer' }} onClick={() => nav('/global-kps/' + (i + 1))} title={`查看「${k.name}」详情`}>
                <div className={'kp-cover ' + COVERS[i % COVERS.length]}>
                  <div className="ct">{k.name}</div>
                </div>
                <div className="kp-info">
                  <div className="kp-info-top">
                    <span className="kp-name">{k.name}</span>
                  </div>
                  {/* 归属机构（平台视角必显） */}
                  <div className="kp-agent">
                    <span className="av" />
                    机构 · {orgName(k.orgId)}
                  </div>
                  {/* 0614b：删去 书籍/系列/专家库 粒度标、免费/会员、创建时间——平台只读监管只看名称/机构/状态 */}
                  <div className="kp-tags">
                    <span className={'kp-tag-st ' + s.cls}>{s.t}</span>
                    {k.hasForever && <span className="kp-tag-src">永享</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
