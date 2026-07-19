import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, EmptyState, exportWorkbook } from '@aba/ui-admin';
import { KPS, ORGS, KP_SOURCE_LABEL, orgOptionLabel, orgOptionValue } from '@aba/mock';
import { KP_STAT } from '../data/kpStatus';
import { buildGlobalKpsSpec } from '../exports/globalKps';

// 平台超管 · 全域知识 KP（0614b：表格 → 卡片，复用机构后台 KP 列表视觉；每卡显示归属机构；只读监管）。
// 0714：状态映射下移 ../data/kpStatus（与导出 spec 共用）；筛选行右侧新增「导出」（exports/globalKps.ts spec）。
const COVERS = ['', 'c2', 'c3', 'c4'];

type Kp = (typeof KPS)[number];

export function GlobalKps() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [org, setOrg] = useState('全部');
  const [status, setStatus] = useState('全部');

  const orgName = (id: string) => ORGS.find((o) => o.id === id)?.name ?? id;
  const orgNames = [...new Set(KPS.map((k) => orgName(k.orgId)))];

  // 0717 #1.5：已删除（逻辑删除）的 KP 不在三端界面展示，数据库保留数据
  const rows = KPS.filter(
    (k) =>
      k.status !== 'deleted' &&
      (!q || k.name.includes(q)) &&
      (org === '全部' || orgName(k.orgId) === org) &&
      (status === '全部' || KP_STAT[k.status]?.t === status),
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
        <Dropdown label="机构" options={['全部', ...orgNames.map(orgOptionLabel)]} onSelect={(v) => setOrg(orgOptionValue(v))} style={{ width: 190 }} />
        <Dropdown label="状态" options={['全部', '已发布', '草稿', '已下架']} onSelect={setStatus} />
        <div className="grow" />
        <button className="btn btn-ghost btn-sm" onClick={() => { void exportWorkbook(buildGlobalKpsSpec({ rows, filters: [['关键词', q || '无'], ['机构', org], ['状态', status]] })); toast('正在导出'); }}>
          <Icon id="i-dl" w={14} h={14} />
          导出
        </button>
      </div>
      {rows.length === 0 ? (
        <div className="card card-pad">
          <EmptyState icon="i-cube" title="没有匹配的 KP" sub="换个名称、机构或状态试试" />
        </div>
      ) : (
        <div className="kp-grid">
          {rows.map((k, i) => {
            const s = KP_STAT[k.status] ?? { t: k.status, cls: 'tag-line' };
            // 0717 #2.3：路由改带 KP 真实 id,详情按同一份 @aba/mock 数据渲染,列表与详情一致
            return (
              <div className="kp-card" key={k.orgId + k.name} style={{ cursor: 'pointer' }} onClick={() => nav('/global-kps/' + k.id)} title={`查看「${k.name}」详情`}>
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
                  {/* 0718 #7：平台卡片补齐来源标签（自建 / 分享导入·实时 / 分享导入·快照），与机构后台同源同规、统一灰色；
                      0718 #3：去掉「永享」标（平台监管视角不再展示权益标），标签规则与颜色与机构后台完全一致 */}
                  <div className="kp-tags">
                    <span className="kp-tag-src">{KP_SOURCE_LABEL[k.shareMode ?? 'own']}</span>
                    <span className={'kp-tag-st ' + s.cls}>{s.t}</span>
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
