import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, DataGrid, Modal, TextInput, CredentialDialog, genPassword, type Col, type Credential } from '@aba/ui-admin';

// 平台超管 · 平台账户（0615-2 新增）。
// 与「机构账户」明显区分：平台账户是平台方人员（平台超管 / 运营 / 财务），平台级角色、无所属机构；
// 机构账户归属某机构、用机构级角色。两者各自独立菜单（机构账户在「机构管理」组，平台账户在「系统设置」组）。
const PLAT_ROLES = ['平台超级管理员', '平台运营', '平台财务'];
const ROLE_CLS: Record<string, string> = { 平台超级管理员: 'tag-indigo', 平台运营: 'tag-jade', 平台财务: 'tag-amber' };

interface PAccount {
  id: string;
  account: string;
  name: string;
  role: string;
  phone: string;
  status: '启用' | '停用';
  createdAt: string;
}
const SEED: PAccount[] = [
  { id: 'p1', account: 'superadmin', name: '超级管理员', role: '平台超级管理员', phone: '188****0000', status: '启用', createdAt: '2025-12-01 09:00:00' },
  { id: 'p2', account: 'ops_lina', name: '李娜', role: '平台运营', phone: '139****5678', status: '启用', createdAt: '2026-01-20 10:12:30' },
  { id: 'p3', account: 'fin_wang', name: '王财务', role: '平台财务', phone: '137****2222', status: '停用', createdAt: '2026-02-15 14:30:05' },
];

export function PlatformAccounts() {
  const [list, setList] = useState<PAccount[]>(SEED);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('全部');
  const [status, setStatus] = useState('全部');

  const [modal, setModal] = useState(false);
  const [fAccount, setFAccount] = useState('');
  const [fName, setFName] = useState('');
  const [fRole, setFRole] = useState('平台运营');
  const [fPhone, setFPhone] = useState('');
  // 凭证弹窗（创建 / 重置密码后展示账号密码，方便发给使用人）
  const [cred, setCred] = useState<Credential | null>(null);

  const rows = list.filter(
    (a) =>
      (!q || a.account.includes(q) || a.name.includes(q)) &&
      (role === '全部' || a.role === role) &&
      (status === '全部' || a.status === status),
  );

  const create = () => {
    if (!fAccount.trim() || !fName.trim()) {
      toast('请填写账户名称与姓名');
      return;
    }
    const account = fAccount.trim();
    const name = fName.trim();
    setList((arr) => [
      { id: 'p' + (arr.length + 1), account, name, role: fRole, phone: fPhone.trim() || '—', status: '启用', createdAt: '2026-06-15 14:30:00' },
      ...arr,
    ]);
    setModal(false);
    setFAccount('');
    setFName('');
    setFRole('平台运营');
    setFPhone('');
    // 创建后弹凭证（账号 + 系统生成密码），方便发给使用人
    setCred({ account, password: genPassword(), name, org: '平台（无所属机构）', role: fRole });
  };
  const resetPwd = (a: PAccount) => {
    setCred({ account: a.account, password: genPassword(), name: a.name, org: '平台（无所属机构）', role: a.role });
    toast('已重置密码');
  };
  const toggle = (a: PAccount) =>
    setList((arr) => {
      const next = arr.map((x) => (x.id === a.id ? { ...x, status: (x.status === '启用' ? '停用' : '启用') as PAccount['status'] } : x));
      toast(a.status === '启用' ? '已停用账户' : '已启用账户', 3000);
      return next;
    });

  const columns: Col<PAccount>[] = [
    { header: '账户名称', className: 'mono strong', cell: (a) => a.account, sortValue: (a) => a.account },
    { header: '姓名', cell: (a) => a.name, sortValue: (a) => a.name },
    { header: '角色', cell: (a) => <span className={'tag-s ' + (ROLE_CLS[a.role] ?? 'tag-line')}>{a.role}</span>, sortValue: (a) => a.role },
    { header: '联系方式', className: 'mono', cell: (a) => a.phone },
    { header: '状态', sortValue: (a) => a.status, cell: (a) => <span className={'fstat ' + (a.status === '启用' ? 'ok' : 'none')}><span className="dt" />{a.status}</span> },
    { header: '创建时间', className: 'mono', cell: (a) => a.createdAt, sortValue: (a) => a.createdAt },
    { header: '操作', cell: (a) => <div className="op-cell"><span className="op" onClick={() => resetPwd(a)}>重置密码</span> <span className="op" onClick={() => toggle(a)}>{a.status === '启用' ? '停用' : '启用'}</span></div> },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">平台账户</div>
          <div className="ps">平台方人员账户（平台超管 / 运营 / 财务），平台级角色、无所属机构；机构账户请在「机构管理 → 机构账户」维护。</div>
        </div>
        <div className="pa">
          <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>
            <Icon id="i-plus" w={14} h={14} />
            新建平台账户
          </button>
        </div>
      </div>

      <div className="orders-filter">
        <Search placeholder="账户名称 / 姓名" minWidth={220} value={q} onChange={setQ} />
        <Dropdown label="角色" options={['全部', ...PLAT_ROLES]} onSelect={setRole} style={{ width: 160 }} />
        <Dropdown label="状态" options={['全部', '启用', '停用']} onSelect={setStatus} />
      </div>

      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的平台账户' }} minWidth={900} pageUnit="个" />

      <Modal
        title="新建平台账户"
        open={modal}
        onClose={() => setModal(false)}
        width={460}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>取消</button>
            <button className="btn btn-primary" onClick={create}>确认创建</button>
          </>
        }
      >
        <div className="fm-row" style={{ borderTop: 'none' }}>
          <div className="lab">账户名称<span className="req">*</span></div>
          <div className="ctl"><TextInput value={fAccount} onChange={(e) => setFAccount(e.target.value)} placeholder="登录账号" style={{ maxWidth: 240 }} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">姓名<span className="req">*</span></div>
          <div className="ctl"><TextInput value={fName} onChange={(e) => setFName(e.target.value)} style={{ maxWidth: 200 }} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">角色<span className="req">*</span></div>
          <div className="ctl"><Dropdown label={fRole} options={PLAT_ROLES} onSelect={setFRole} style={{ width: 200 }} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">联系方式</div>
          <div className="ctl"><TextInput value={fPhone} onChange={(e) => setFPhone(e.target.value)} placeholder="手机号（选填）" style={{ maxWidth: 200 }} /></div>
        </div>
        <div className="sub-tip">
          <ul>
            <li>平台账户无所属机构，仅用平台级角色</li>
            <li>初始密码由系统生成，创建后弹窗展示并支持复制，本页不设置密码</li>
          </ul>
        </div>
      </Modal>

      <CredentialDialog open={!!cred} cred={cred} title="账户凭证" onClose={() => setCred(null)} />
    </>
  );
}
