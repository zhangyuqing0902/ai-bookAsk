import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, Modal, ConfirmDialog, TextInput, DataGrid, CredentialDialog, exportWorkbook, genPassword, type Col, type Credential } from '@aba/ui-admin';
import { orgOptionLabel, orgOptionValue, revealPhone } from '@aba/mock';
import { ACCOUNT_ROWS, type Acct } from '../data/accounts';
import { buildAccountsSpec } from '../exports/accounts';

// 平台后台 · 机构账户（新建 / 编辑复用同一弹窗 + 停用/恢复二次确认）
// 0714：mock 数据下移 ../data/accounts；「所属机构」统一为「机构」；#19 编辑态账户名不可改；
//       新增筛选行「导出」（exports/accounts.ts spec）。
export function Accounts() {
  const [data, setData] = useState<Acct[]>(ACCOUNT_ROWS);
  const [modal, setModal] = useState<{ mode: 'new' | 'edit'; row?: Acct } | null>(null);
  const [confirm, setConfirm] = useState<Acct | null>(null);
  const [q, setQ] = useState('');
  const [org, setOrg] = useState('全部');
  const [parent, setParent] = useState('全部');
  const [role, setRole] = useState('全部');
  const [status, setStatus] = useState('全部');
  // 0615-3：创建 / 重置密码后弹凭证；新建 / 编辑表单改受控以捕获值
  const [cred, setCred] = useState<Credential | null>(null);
  const [fAccount, setFAccount] = useState('');
  const [fName, setFName] = useState('');
  const [fOrg, setFOrg] = useState('XX 出版集团');
  const [fRole, setFRole] = useState('管理员');
  const [fContact, setFContact] = useState('');

  // 上级机构筛选项 = 实际作为上级出现过的机构名（去重，剔除 — 顶级）
  const parentNames = [...new Set(ACCOUNT_ROWS.filter((r) => r.parent !== '—').map((r) => r.parent))];

  const toggleStatus = (t: Acct) => {
    const next = t.status === '正常' ? '停用' : '正常';
    setData((d) => d.map((r) => (r.id === t.id ? { ...r, status: next, statusCls: next === '正常' ? 'tag-jade' : 'tag-terra' } : r)));
  };
  const openNew = () => {
    setFAccount(''); setFName(''); setFOrg('XX 出版集团'); setFRole('管理员'); setFContact('');
    setModal({ mode: 'new' });
  };
  const openEdit = (r: Acct) => {
    setFAccount(r.name); setFName(r.person); setFOrg(r.org); setFRole(r.role); setFContact(revealPhone(r.contact));
    setModal({ mode: 'edit', row: r });
  };
  const roleClsOf = (r: string) => (r === '管理员' ? 'tag-indigo' : r === '运营' ? 'tag-jade' : 'tag-line');
  const save = () => {
    if (!fAccount.trim() || !fName.trim()) return toast('请填写账户名称与姓名');
    if (modal?.mode === 'edit' && modal.row) {
      const id = modal.row.id;
      setData((d) => d.map((r) => (r.id === id ? { ...r, name: fAccount.trim(), person: fName.trim(), org: fOrg, role: fRole, roleCls: roleClsOf(fRole), contact: fContact.trim() } : r)));
      setModal(null);
      toast('已保存账户');
      return;
    }
    // 新建：加一行 + 弹凭证（账号 + 系统生成密码）
    const id = 'AC' + String(100 + data.length + 1);
    const row: Acct = { id, name: fAccount.trim(), person: fName.trim(), org: fOrg, parent: '—', role: fRole, roleCls: roleClsOf(fRole), status: '正常', statusCls: 'tag-jade', contact: fContact.trim() || '—' };
    setData((d) => [row, ...d]);
    setModal(null);
    setCred({ account: row.name, password: genPassword(), name: row.person, org: row.org, role: row.role });
  };
  const resetPwd = (r: Acct) => {
    setCred({ account: r.name, password: genPassword(), name: r.person, org: r.org, role: r.role });
    toast('已重置密码');
  };

  const rows = data.filter(
    (r) =>
      (!q || r.name.includes(q) || r.person.includes(q)) &&
      (org === '全部' || r.org === org) &&
      (parent === '全部' || r.parent === parent) &&
      (role === '全部' || r.role === role) &&
      (status === '全部' || r.status === status),
  );
  const edit = modal?.mode === 'edit' ? modal.row : undefined;

  const columns: Col<Acct>[] = [
    { header: '账户 ID', className: 'mono', cell: (r) => r.id },
    { header: '账户名', className: 'strong', cell: (r) => r.name },
    { header: '姓名', cell: (r) => r.person },
    { header: '机构', cell: (r) => r.org },
    { header: '联系电话', className: 'mono', cell: (r) => revealPhone(r.contact) },
    // 0610:上级机构 / 角色 / 状态 三列支持点击表头排序
    { header: '上级机构', cell: (r) => (r.parent === '—' ? <span className="muted">—</span> : r.parent), sortValue: (r) => r.parent },
    { header: '角色', cell: (r) => <span className={'tag-s ' + r.roleCls}>{r.role}</span>, sortValue: (r) => r.role },
    { header: '状态', cell: (r) => <span className={'tag-s ' + r.statusCls}>{r.status}</span>, sortValue: (r) => r.status },
    {
      header: '操作',
      cell: (r) => (
        <div className="op-cell">
          <span className="op" onClick={() => openEdit(r)}>
            编辑
          </span>
          <span className="op" onClick={() => resetPwd(r)}>
            重置密码
          </span>
          <span className={'op' + (r.status === '正常' ? ' op-danger' : '')} onClick={() => setConfirm(r)}>
            {r.status === '正常' ? '停用' : '恢复'}
          </span>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">机构账户</div>
        </div>
        <div className="pa">
          <button className="btn btn-primary btn-sm" onClick={openNew}>
            <Icon id="i-plus" w={14} h={14} />
            新建账户
          </button>
        </div>
      </div>
      <div className="filter">
        <Search placeholder="搜索账户名 / 姓名" minWidth={220} value={q} onChange={setQ} />
        <Dropdown label="机构" options={['全部', ...['XX 出版集团', 'YY 教育', 'ZZ 少儿'].map(orgOptionLabel)]} onSelect={(v) => setOrg(orgOptionValue(v))} style={{ width: 190 }} />
        <Dropdown label="上级机构" options={['全部', ...parentNames]} onSelect={setParent} style={{ width: 180 }} />
        <Dropdown label="角色" options={['全部', '管理员', '运营', '只读']} onSelect={setRole} />
        <Dropdown label="状态" options={['全部', '正常', '停用']} onSelect={setStatus} />
        <div className="grow" />
        <button className="btn btn-ghost btn-sm" onClick={() => { void exportWorkbook(buildAccountsSpec({ rows, filters: [['关键词', q || '无'], ['机构', org], ['上级机构', parent], ['角色', role], ['状态', status]] })); toast('正在导出'); }}>
          <Icon id="i-dl" w={14} h={14} />
          导出
        </button>
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的账户' }} pageUnit="个" />

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.status === '正常' ? '停用账户' : '恢复账户'}
        danger={confirm?.status === '正常'}
        confirmText={confirm?.status === '正常' ? '确认停用' : '确认恢复'}
        desc={confirm?.status === '正常'
          ? `停用账户「${confirm?.name}（${confirm?.person}）」后，该账户将无法登录机构后台，提示「账户服务已暂停」。可随时恢复。`
          : `恢复账户「${confirm?.name}（${confirm?.person}）」后，可重新登录机构后台。`}
        onConfirm={() => confirm && toggleStatus(confirm)}
        onClose={() => setConfirm(null)}
      />

      <Modal
        title={modal?.mode === 'edit' ? '编辑机构账户' : '新建机构账户'}
        open={!!modal}
        onClose={() => setModal(null)}
        width={480}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>
              取消
            </button>
            <button className="btn btn-primary btn-sm" onClick={save}>
              {edit ? '保存' : '创建'}
            </button>
          </>
        }
      >
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 4 }}>
          <div className="lab">账户名称<span className="req">*</span></div>
          <div className="ctl">
            {/* 0714 #19：编辑态账户名锁定（登录标识创建后不可改），新建态可填不变 */}
            <TextInput value={fAccount} onChange={(e) => setFAccount(e.target.value)} placeholder="登录账户名" disabled={!!edit} />
          </div>
        </div>
        <div className="fm-row">
          <div className="lab">姓名<span className="req">*</span></div>
          <div className="ctl"><TextInput value={fName} onChange={(e) => setFName(e.target.value)} placeholder="真实姓名" /></div>
        </div>
        <div className="fm-row">
          <div className="lab">机构<span className="req">*</span></div>
          <div className="ctl"><Dropdown label={fOrg} options={['XX 出版集团', 'YY 教育', 'ZZ 少儿']} onSelect={setFOrg} style={{ width: 200 }} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">角色<span className="req">*</span></div>
          <div className="ctl"><Dropdown label={fRole} options={['管理员', '运营', '只读']} onSelect={setFRole} style={{ width: 200 }} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">联系电话</div>
          <div className="ctl"><TextInput value={fContact} onChange={(e) => setFContact(e.target.value)} placeholder="请输入手机号" /></div>
        </div>
        {!edit && <div className="sub-tip">初始密码由系统生成，创建后弹窗展示并支持复制，本页不设置密码。</div>}
      </Modal>

      <CredentialDialog open={!!cred} cred={cred} title="账户凭证" onClose={() => setCred(null)} />
    </>
  );
}
