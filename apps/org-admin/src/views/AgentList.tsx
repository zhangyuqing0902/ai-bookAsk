import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { Search, Dropdown, Pager } from '@aba/ui-admin';
import { ORG_FILTER_ALL, orgScopeOptions, orgScopeValue, visibleOrgs, CURRENT_ORG } from '@aba/mock';
import { useOrgScope } from '../stores/orgScope';

// 0806：加 org 归属（父机构视角展示 / 筛选）+ 子机构演示 Agent（仅父机构视角可见、只读）
const AGENTS = [
  { name: '李医生', type: '普通', cls: 'tag-line', kp: '3', voice: '已设音色', grad: '', org: 'XX 出版社' },
  { name: '王老师', type: '普通', cls: 'tag-line', kp: '1', voice: '已设音色', grad: 'linear-gradient(155deg,#19c08c,#12996e)', org: 'XX 出版社' },
  { name: '机构 Agent', type: '机构', cls: 'tag-indigo', kp: '8', voice: '默认音色', grad: 'linear-gradient(155deg,#7c8bf5,#5562d8)', org: 'XX 出版社' },
  { name: '故事姐姐', type: '普通', cls: 'tag-line', kp: '2', voice: '已设音色', grad: 'linear-gradient(155deg,#f5a86b,#e07f3a)', org: 'XX 少儿分社' },
  { name: '解题助手', type: '普通', cls: 'tag-line', kp: '2', voice: '默认音色', grad: 'linear-gradient(155deg,#6bb8f5,#3a86e0)', org: 'XX 教辅分社' },
];

// 机构后台 · Agent 人设列表（机构/普通 类型标签 + 名称模糊筛选）
export function AgentList() {
  const nav = useNavigate();
  // 0806：父机构视角——机构单选筛选 + 卡片归属机构 + 子机构 Agent 只读
  const orgType = useOrgScope((s) => s.orgType);
  const isParent = orgType === 'parent';
  const [orgSel, setOrgSel] = useState(ORG_FILTER_ALL);
  const [q, setQ] = useState('');
  const scope = visibleOrgs(orgType);
  const list = AGENTS.filter((a) => scope.includes(a.org) && (!isParent || orgSel === ORG_FILTER_ALL || a.org === orgSel) && (!q || a.name.includes(q)));
  return (
    <div id="org-agent">
      <div className="page-head">
        <div>
          <div className="pt">Agent 人设</div>
        </div>
        <div className="pa">
          {/* 8.6:新建直接进入空白编辑页 */}
          <button className="btn btn-primary btn-sm" onClick={() => nav('/agents/new')}>
            <Icon id="i-plus" w={14} h={14} />
            新建 Agent
          </button>
        </div>
      </div>
      {/* 二-7:Agent 名称模糊筛选 */}
      <div className="filter">
        <Search placeholder="搜索 Agent 名称" minWidth={220} value={q} onChange={setQ} />
        {/* 0806：父机构视角——机构单选筛选 */}
        {isParent && <Dropdown label="机构" options={orgScopeOptions()} onSelect={(v) => setOrgSel(v === ORG_FILTER_ALL ? ORG_FILTER_ALL : orgScopeValue(v))} style={{ width: 200 }} />}
      </div>
      <div className="kp-grid">
        {/* 0806：子机构 Agent 详情带 owner=child 进只读态 */}
        {list.map((a, i) => (
          <div className="kp-card" key={a.name} onClick={() => nav('/agents/' + (i + 1) + (a.org !== CURRENT_ORG ? '?owner=child&org=' + encodeURIComponent(a.org) : ''))}>
            <div className="kp-cover agent-cover" style={a.grad ? { background: a.grad } : undefined}>
              <div className="ic">
                <Icon id="i-robot" />
              </div>
            </div>
            <div className="kp-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
                <span className="kp-name">{a.name}</span>
                <span className={'tag-s ' + a.cls}>{a.type}</span>
              </div>
              {/* 0806：父机构视角显示数据归属机构 */}
              {isParent && <div className="kp-org-row">{a.org}{a.org !== CURRENT_ORG && <span className="kp-org-ro">仅可查看</span>}</div>}
              <div className="kp-agent">关联 KP · {a.kp}</div>
              <div className="kp-stat">
                <span>
                  <Icon id="i-sound" />
                  {a.voice}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {list.length > 10 && <Pager total={list.length} unit="个" />}
    </div>
  );
}
