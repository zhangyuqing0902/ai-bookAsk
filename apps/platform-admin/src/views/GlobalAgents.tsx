import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { Search, Dropdown, EmptyState } from '@aba/ui-admin';

// 平台超管 · 全域 Agent 人设（0614b 新增）：跨机构 Agent 聚合只读视图，复用机构后台 Agent 卡片视觉；每卡显示归属机构。
interface GAgent {
  name: string;
  org: string;
  type: '机构' | '普通';
  cls: string;
  kp: number;
  voice: string;
  grad: string;
}
const AGENTS: GAgent[] = [
  { name: '李医生', org: 'XX 出版社', type: '普通', cls: 'tag-line', kp: 3, voice: '已设音色', grad: 'linear-gradient(155deg,#7c8bf5,#5562d8)' },
  { name: '王老师', org: 'XX 出版社', type: '普通', cls: 'tag-line', kp: 1, voice: '已设音色', grad: 'linear-gradient(155deg,#19c08c,#12996e)' },
  { name: '机构 Agent', org: 'XX 出版社', type: '机构', cls: 'tag-indigo', kp: 8, voice: '默认音色', grad: 'linear-gradient(155deg,#7c8bf5,#5562d8)' },
  { name: '赵老师', org: 'YY 教育', type: '普通', cls: 'tag-line', kp: 2, voice: '已设音色', grad: 'linear-gradient(155deg,#f5a623,#f5912b)' },
  { name: '机构 Agent', org: 'YY 教育', type: '机构', cls: 'tag-indigo', kp: 5, voice: '默认音色', grad: 'linear-gradient(155deg,#7c8bf5,#5562d8)' },
  { name: '童老师', org: 'ZZ 少儿', type: '普通', cls: 'tag-line', kp: 4, voice: '已设音色', grad: 'linear-gradient(155deg,#19c08c,#12996e)' },
  { name: '机构 Agent', org: 'ZZ 少儿', type: '机构', cls: 'tag-indigo', kp: 3, voice: '默认音色', grad: 'linear-gradient(155deg,#7c8bf5,#5562d8)' },
  { name: '文博士', org: 'AA 文化集团', type: '普通', cls: 'tag-line', kp: 6, voice: '已设音色', grad: 'linear-gradient(155deg,#f5a623,#f5912b)' },
  { name: '机构 Agent', org: 'BB 数字出版', type: '机构', cls: 'tag-indigo', kp: 2, voice: '默认音色', grad: 'linear-gradient(155deg,#7c8bf5,#5562d8)' },
];

export function GlobalAgents() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [org, setOrg] = useState('全部');
  const orgNames = [...new Set(AGENTS.map((a) => a.org))];
  const list = AGENTS.filter((a) => (!q || a.name.includes(q)) && (org === '全部' || a.org === org));

  return (
    <div id="org-agent">
      <div className="page-head">
        <div>
          <div className="pt">全域 Agent 人设</div>
        </div>
      </div>
      <div className="filter">
        <Search placeholder="搜索 Agent 名称" minWidth={220} value={q} onChange={setQ} />
        <Dropdown label="机构" options={['全部', ...orgNames]} onSelect={setOrg} style={{ width: 180 }} />
      </div>
      {list.length === 0 ? (
        <div className="card card-pad">
          <EmptyState icon="i-robot" title="没有匹配的 Agent" sub="换个名称或机构试试" />
        </div>
      ) : (
        <div className="kp-grid">
          {list.map((a, i) => (
            <div className="kp-card" key={a.org + a.name + i} style={{ cursor: 'pointer' }} onClick={() => nav('/global-agents/' + i)} title={`查看「${a.name}」详情`}>
              <div className="kp-cover agent-cover" style={{ background: a.grad }}>
                <div className="ic">
                  <Icon id="i-robot" />
                </div>
              </div>
              <div className="kp-info">
                <div className="kp-info-top">
                  <span className="kp-name">{a.name}</span>
                </div>
                <div className="kp-agent">
                  <span className="av" />
                  机构 · {a.org}
                </div>
                <div className="kp-tags">
                  <span className={'kp-tag-st ' + (a.type === '机构' ? 'tag-jade' : 'tag-line')}>{a.type}</span>
                </div>
                <div className="kp-stat">
                  <span>关联 KP {a.kp} 个</span>
                  <span>{a.voice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
