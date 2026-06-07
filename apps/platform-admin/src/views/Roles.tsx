import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { Modal, TextInput } from '@aba/ui-admin';

// 平台超管 · 角色权限（按模块分组、一行两个、上级机构管理员只读）。逻辑移植自 proto-admin.js。
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
const INIT: Record<string, string[]> = {
  超级管理员: ALL,
  机构管理员: ALL.filter((k) => k !== 'agent.prompt.edit'),
  运营: ['dashboard.view', 'kp.manage', 'agent.manage', 'user.view', 'order.view', 'code.manage', 'board.view'],
  上级机构管理员: ['dashboard.view', 'board.view', 'order.view', 'user.view'],
};
const ROLES = ['超级管理员', '机构管理员', '运营', '上级机构管理员'];
const READONLY = new Set(['上级机构管理员']);

export function Roles() {
  const [cur, setCur] = useState('超级管理员');
  const [newRole, setNewRole] = useState(false);
  const [state, setState] = useState<Record<string, Set<string>>>(() => {
    const o: Record<string, Set<string>> = {};
    for (const r of ROLES) o[r] = new Set(INIT[r]);
    return o;
  });
  const ro = READONLY.has(cur);
  const st = state[cur];
  const toggle = (k: string) => {
    if (ro) return;
    setState((prev) => {
      const s = new Set(prev[cur]);
      if (s.has(k)) s.delete(k);
      else s.add(k);
      return { ...prev, [cur]: s };
    });
  };
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
            {ROLES.map((r) => (
              <div key={r} className={'role' + (cur === r ? ' on' : '')} onClick={() => setCur(r)}>
                {r}
                {READONLY.has(r) && <span className="lock">只读</span>}
              </div>
            ))}
          </div>
        </div>
        <div className={'perm-panel' + (ro ? ' ro' : '')}>
          <div className="pp-h">
            <div className="pp-role">
              {cur} · 权限 {ro && <span className="ro-badge">只读</span>}
            </div>
            {!ro && (
              <button className="btn btn-primary btn-sm" onClick={() => toast('已保存权限')}>
                保存
              </button>
            )}
          </div>
          <div style={{ color: 'var(--ink-3)', fontSize: 12 }}>
            {ro ? '该角色为只读 · 仅展示其拥有的权限' : '按机构后台模块勾选该角色可用的权限点'}
          </div>
          {PERM_MODULES.map((m) => {
            const items = ro ? m.items.filter((it) => st.has(it[0])) : m.items;
            if (!items.length) return null;
            return (
              <div className="perm-group" key={m.g}>
                <div className="pg-h">{m.g}</div>
                <div className="pg-grid">
                  {items.map((it) => {
                    const on = st.has(it[0]);
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
                        <div className={'cbx' + (on ? ' on' : '')} onClick={() => toggle(it[0])}>
                          <Icon id="i-check" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Modal
        title="新建角色"
        open={newRole}
        onClose={() => setNewRole(false)}
        width={440}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setNewRole(false)}>
              取消
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => { setNewRole(false); toast('已创建角色,请在右侧配置权限'); }}>
              创建
            </button>
          </>
        }
      >
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 4 }}>
          <div className="lab">角色名称<span className="req">*</span></div>
          <div className="ctl"><TextInput placeholder="请输入角色名称" /></div>
        </div>
        <div className="fm-row">
          <div className="lab">备注</div>
          <div className="ctl"><TextInput placeholder="选填" /></div>
        </div>
      </Modal>
    </>
  );
}
