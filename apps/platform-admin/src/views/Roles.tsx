import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { Modal, TextInput } from '@aba/ui-admin';

// 平台超管 · 角色权限。0613：每个功能点改为「无 / 只读 / 可操作」三态，替代角色级只读，按功能粒度控制读写。
const PERM_MODULES: { g: string; items: [string, string, string][] }[] = [
  { g: '主控台', items: [['dashboard.view', '查看主控台', 'i-grid']] },
  {
    g: '产品中心',
    items: [
      ['kp.manage', '知识产品 KP', 'i-cube'],
      ['agent.manage', 'Agent 人设', 'i-robot'],
      ['agent.prompt.edit', 'Agent 回答 Prompt 编辑', 'i-robot'],
    ],
  },
  {
    g: '运营中心',
    items: [
      ['user.view', 'C 端用户', 'i-user'],
      ['order.view', '订单管理', 'i-doc'],
      ['code.manage', '兑换码', 'i-ticket'],
    ],
  },
  { g: '数据中心', items: [['board.view', '数据看板', 'i-chart']] },
  {
    g: '系统设置',
    items: [
      ['cs.config', '客服配置', 'i-headset'],
      ['sys.config', '系统配置', 'i-gear'],
    ],
  },
];
const ALL = PERM_MODULES.flatMap((m) => m.items.map((i) => i[0]));

type Lvl = 'none' | 'read' | 'write';
const LVLS: { k: Lvl; t: string }[] = [
  { k: 'none', t: '无' },
  { k: 'read', t: '只读' },
  { k: 'write', t: '可操作' },
];
const fill = (keys: string[], lvl: Lvl): Record<string, Lvl> => Object.fromEntries(keys.map((k) => [k, lvl]));

// 各内置角色的功能点三态（缺省 = 无权限）
const INIT: Record<string, Record<string, Lvl>> = {
  超级管理员: fill(ALL, 'write'),
  机构管理员: fill(ALL.filter((k) => k !== 'agent.prompt.edit'), 'write'),
  运营: { 'dashboard.view': 'read', 'kp.manage': 'write', 'agent.manage': 'write', 'user.view': 'read', 'order.view': 'read', 'code.manage': 'write', 'board.view': 'read' },
  // 原「只读角色」= 所有可见功能均设为「仅查看」的普通角色（不再特殊硬编码）
  上级机构管理员: { 'dashboard.view': 'read', 'board.view': 'read', 'order.view': 'read', 'user.view': 'read' },
};
const INIT_ROLES = ['上级机构管理员', '运营', '机构管理员', '超级管理员'];

export function Roles() {
  const [roles, setRoles] = useState(INIT_ROLES);
  const [cur, setCur] = useState('超级管理员');
  const [newRole, setNewRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [state, setState] = useState<Record<string, Record<string, Lvl>>>(() => {
    const o: Record<string, Record<string, Lvl>> = {};
    for (const r of INIT_ROLES) o[r] = { ...INIT[r] };
    return o;
  });

  const createRole = () => {
    const nm = newRoleName.trim();
    if (!nm) return toast('请输入角色名称');
    if (roles.includes(nm)) return toast('角色名称已存在');
    setRoles((rs) => [rs[0], nm, ...rs.slice(1)]);
    setState((prev) => ({ ...prev, [nm]: {} }));
    setCur(nm);
    setNewRoleName('');
    setNewRole(false);
    toast('已创建角色，请在右侧逐项设置权限');
  };

  const st = state[cur] ?? {};
  const setLvl = (k: string, lvl: Lvl) => setState((prev) => ({ ...prev, [cur]: { ...prev[cur], [k]: lvl } }));

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">角色权限</div>
        </div>
      </div>
      <div className="rolep">
        <div className="role-side">
          <div className="rhead">
            <button className="btn btn-primary btn-sm" onClick={() => setNewRole(true)}>
              <Icon id="i-plus" w={14} h={14} />
              新建角色
            </button>
          </div>
          <div className="rlist">
            {roles.map((r) => (
              <div key={r} className={'role' + (cur === r ? ' on' : '')} onClick={() => setCur(r)}>
                {r}
              </div>
            ))}
          </div>
        </div>
        <div className="perm-panel">
          <div className="pp-h">
            <div className="pp-role">{cur} · 权限</div>
            <button className="btn btn-primary btn-sm" onClick={() => toast('已保存权限')}>
              保存
            </button>
          </div>
          <div style={{ color: 'var(--ink-3)', fontSize: 12 }}>
            每个功能点可设「无 / 只读 / 可操作」三态 —— 按功能粒度控制读写，替代角色级只读。
          </div>
          {PERM_MODULES.map((m) => (
            <div className="perm-group" key={m.g}>
              <div className="pg-h">{m.g}</div>
              <div className="pg-grid">
                {m.items.map((it) => {
                  const lvl = st[it[0]] ?? 'none';
                  return (
                    <div className="perm-item" key={it[0]}>
                      <div className="pi-l">
                        <span className="pi-ic">
                          <Icon id={it[2]} />
                        </span>
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
        onClose={() => { setNewRole(false); setNewRoleName(''); }}
        width={440}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => { setNewRole(false); setNewRoleName(''); }}>
              取消
            </button>
            <button className="btn btn-primary btn-sm" onClick={createRole}>
              创建
            </button>
          </>
        }
      >
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 4 }}>
          <div className="lab">角色名称<span className="req">*</span></div>
          <div className="ctl"><TextInput value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="请输入角色名称" /></div>
        </div>
        <div className="fm-row">
          <div className="lab">备注</div>
          <div className="ctl"><TextInput placeholder="选填" /></div>
        </div>
      </Modal>
    </>
  );
}
