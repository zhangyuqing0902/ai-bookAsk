import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { Modal, TextInput, Dropdown, InfoDot } from '@aba/ui-admin';

// 平台超管 · 角色权限（0615-3 重构）：移入「系统设置」，按「角色类型 = 机构 / 平台」分别管理。
// 机构角色与平台角色的权限点不同；新建角色时选类型，机构账户选机构角色、平台账户选平台角色。
// 功能点三态：无 / 只读 / 可操作。
type Kind = 'org' | 'plat';
type Lvl = 'none' | 'read' | 'write';

const ORG_MODULES: { g: string; items: [string, string, string][] }[] = [
  { g: '主控台', items: [['dashboard.view', '查看主控台', 'i-grid']] },
  { g: '产品中心', items: [['kp.manage', '知识产品 KP', 'i-cube'], ['agent.manage', 'Agent 人设', 'i-robot'], ['agent.prompt.edit', 'Agent 回答 Prompt 编辑', 'i-robot']] },
  { g: '运营中心', items: [['user.view', 'C 端用户', 'i-user'], ['order.view', '订单管理', 'i-doc'], ['code.manage', '兑换码', 'i-ticket']] },
  { g: '数据中心', items: [['board.view', '数据看板', 'i-chart']] },
  { g: '系统设置', items: [['cs.config', '客服配置', 'i-headset'], ['sys.config', '系统配置', 'i-gear']] },
];
// 平台角色的权限点（与机构不同）
const PLAT_MODULES: { g: string; items: [string, string, string][] }[] = [
  { g: '主控台', items: [['p.dashboard', '查看主控台', 'i-grid']] },
  { g: '机构管理', items: [['p.org', '机构管理', 'i-building'], ['p.account', '机构账户', 'i-user'], ['p.sub', '订阅订单', 'i-ticket']] },
  { g: '产品中心', items: [['p.gkp', '全域知识产品 KP', 'i-cube'], ['p.gagent', '全域 Agent 人设', 'i-robot']] },
  { g: '运营中心', items: [['p.guser', '全域用户', 'i-user'], ['p.gorder', '全域订单', 'i-doc']] },
  { g: '数据中心', items: [['p.gfeedback', '全域答案反馈', 'i-msg'], ['p.gmodel', '全域模型用量', 'i-chip']] },
  { g: '系统设置', items: [['p.platacct', '平台账户', 'i-shield'], ['p.role', '角色权限', 'i-key'], ['p.llm', '默认 LLM', 'i-chip']] },
];
const MODULES: Record<Kind, typeof ORG_MODULES> = { org: ORG_MODULES, plat: PLAT_MODULES };

const LVLS: { k: Lvl; t: string }[] = [{ k: 'none', t: '无' }, { k: 'read', t: '只读' }, { k: 'write', t: '可操作' }];
const keysOf = (k: Kind) => MODULES[k].flatMap((m) => m.items.map((i) => i[0]));
const fill = (keys: string[], lvl: Lvl): Record<string, Lvl> => Object.fromEntries(keys.map((k) => [k, lvl]));

const INIT_ROLES: Record<Kind, string[]> = {
  org: ['只读', '客服', '运营', '机构管理员'],
  plat: ['平台财务', '平台运营', '平台超级管理员'],
};
const ORG_KEYS = keysOf('org');
const PLAT_KEYS = keysOf('plat');
const INIT_PERMS: Record<Kind, Record<string, Record<string, Lvl>>> = {
  org: {
    机构管理员: fill(ORG_KEYS.filter((k) => k !== 'agent.prompt.edit'), 'write'),
    运营: { 'dashboard.view': 'read', 'kp.manage': 'write', 'agent.manage': 'write', 'user.view': 'read', 'order.view': 'read', 'code.manage': 'write', 'board.view': 'read' },
    客服: { 'dashboard.view': 'read', 'order.view': 'read', 'user.view': 'read', 'cs.config': 'read' },
    只读: fill(ORG_KEYS, 'read'),
  },
  plat: {
    平台超级管理员: fill(PLAT_KEYS, 'write'),
    平台运营: { 'p.dashboard': 'read', 'p.org': 'write', 'p.account': 'write', 'p.sub': 'write', 'p.gkp': 'write', 'p.gagent': 'write', 'p.guser': 'read', 'p.gorder': 'read', 'p.gfeedback': 'write', 'p.gmodel': 'read' },
    平台财务: { 'p.dashboard': 'read', 'p.sub': 'read', 'p.gorder': 'read', 'p.gmodel': 'read' },
  },
};

export function Roles() {
  const [kind, setKind] = useState<Kind>('org');
  const [roles, setRoles] = useState<Record<Kind, string[]>>(INIT_ROLES);
  const [cur, setCur] = useState<Record<Kind, string>>({ org: '机构管理员', plat: '平台超级管理员' });
  const [perms, setPerms] = useState<Record<Kind, Record<string, Record<string, Lvl>>>>(() => ({
    org: Object.fromEntries(INIT_ROLES.org.map((r) => [r, { ...(INIT_PERMS.org[r] ?? {}) }])),
    plat: Object.fromEntries(INIT_ROLES.plat.map((r) => [r, { ...(INIT_PERMS.plat[r] ?? {}) }])),
  }));

  const [newRole, setNewRole] = useState(false);
  const [newName, setNewName] = useState('');
  const [newKind, setNewKind] = useState<Kind>('org');

  const curRole = cur[kind];
  const st = perms[kind][curRole] ?? {};
  const setLvl = (k: string, lvl: Lvl) => setPerms((p) => ({ ...p, [kind]: { ...p[kind], [curRole]: { ...p[kind][curRole], [k]: lvl } } }));

  const createRole = () => {
    const nm = newName.trim();
    if (!nm) return toast('请输入角色名称');
    if (roles[newKind].includes(nm)) return toast('该类型下角色名称已存在');
    setRoles((rs) => ({ ...rs, [newKind]: [nm, ...rs[newKind]] }));
    setPerms((p) => ({ ...p, [newKind]: { ...p[newKind], [nm]: {} } }));
    setKind(newKind);
    setCur((c) => ({ ...c, [newKind]: nm }));
    setNewName('');
    setNewRole(false);
    toast('已创建角色，请在右侧逐项设置权限');
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">角色权限</div>
          <div className="ps">按「角色类型」分别管理机构角色与平台角色（两者权限点不同）；机构账户选机构角色、平台账户选平台角色。</div>
        </div>
      </div>

      {/* 角色类型切换 */}
      <div className="seg" style={{ marginBottom: 16 }}>
        <b className={kind === 'org' ? 'on' : ''} onClick={() => setKind('org')}>机构角色</b>
        <b className={kind === 'plat' ? 'on' : ''} onClick={() => setKind('plat')}>平台角色</b>
      </div>

      <div className="rolep">
        <div className="role-side">
          <div className="rhead">
            <button className="btn btn-primary btn-sm" onClick={() => { setNewKind(kind); setNewRole(true); }}>
              <Icon id="i-plus" w={14} h={14} />
              新建角色
            </button>
          </div>
          <div className="rlist">
            {roles[kind].map((r) => (
              <div key={r} className={'role' + (curRole === r ? ' on' : '')} onClick={() => setCur((c) => ({ ...c, [kind]: r }))}>
                {r}
              </div>
            ))}
          </div>
        </div>
        <div className="perm-panel">
          <div className="pp-h">
            <div className="pp-role" style={{ display: 'inline-flex', alignItems: 'center' }}>
              {curRole} · 权限
              <InfoDot
                width={330}
                text={
                  <div className="lvl-pop">
                    <div className="lvl-pop-row"><i className="none" />无：看不见该菜单</div>
                    <div className="lvl-pop-row"><i className="read" />只读：可进入查看，不能编辑 / 操作</div>
                    <div className="lvl-pop-row"><i className="write" />可操作：该功能全部操作可用</div>
                  </div>
                }
              />
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => toast('已保存权限')}>保存</button>
          </div>
          {MODULES[kind].map((m) => (
            <div className="perm-group" key={m.g}>
              <div className="pg-h">{m.g}</div>
              <div className="pg-grid">
                {m.items.map((it) => {
                  const lvl = st[it[0]] ?? 'none';
                  return (
                    <div className="perm-item" key={it[0]}>
                      <div className="pi-l">
                        <span className="pi-ic"><Icon id={it[2]} /></span>
                        <div>
                          <div className="pi-t">{it[1]}</div>
                          <div className="pi-k">{it[0]}</div>
                        </div>
                      </div>
                      <div className="lvl-seg">
                        {LVLS.map((L) => (
                          <b key={L.k} className={lvl === L.k ? 'on ' + L.k : ''} onClick={() => setLvl(it[0], L.k)}>
                            {L.t}
                          </b>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        title="新建角色"
        open={newRole}
        onClose={() => { setNewRole(false); setNewName(''); }}
        width={440}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => { setNewRole(false); setNewName(''); }}>取消</button>
            <button className="btn btn-primary btn-sm" onClick={createRole}>创建</button>
          </>
        }
      >
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 4 }}>
          <div className="lab">角色类型<span className="req">*</span></div>
          <div className="ctl"><Dropdown label={newKind === 'org' ? '机构角色' : '平台角色'} options={['机构角色', '平台角色']} onSelect={(v) => setNewKind(v === '平台角色' ? 'plat' : 'org')} style={{ width: 160 }} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">角色名称<span className="req">*</span></div>
          <div className="ctl"><TextInput value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="请输入角色名称" /></div>
        </div>
        <div className="fm-row">
          <div className="lab">备注</div>
          <div className="ctl"><TextInput placeholder="选填" /></div>
        </div>
        <div className="sub-tip">机构角色用于机构账户、平台角色用于平台账户，两者权限点不同；创建后请在右侧逐项设置权限。</div>
      </Modal>
    </>
  );
}
