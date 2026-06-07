import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, Modal, TextInput, DataGrid, type Col } from '@aba/ui-admin';

interface Acct {
  id: string;
  name: string;
  person: string;
  org: string;
  parent: string;
  role: string;
  roleCls: string;
  status: string;
  statusCls: string;
  contact: string;
}
const ROWS: Acct[] = [
  { id: 'AC001', name: 'admin01', person: '张三', org: 'XX 出版社', parent: '—', role: '管理员', roleCls: 'tag-indigo', status: '正常', statusCls: 'tag-jade', contact: '138****8888' },
  { id: 'AC002', name: 'view01', person: '李四', org: 'YY 教育', parent: 'XX 集团', role: '只读', roleCls: 'tag-line', status: '停用', statusCls: 'tag-terra', contact: '139****0000' },
  { id: 'AC003', name: 'ops01', person: '王五', org: 'ZZ 少儿', parent: 'XX 集团', role: '运营', roleCls: 'tag-jade', status: '正常', statusCls: 'tag-jade', contact: 'wang@zz.com' },
];

// 平台后台 · 机构账户（新建 / 编辑复用同一弹窗）
export function Accounts() {
  const [modal, setModal] = useState<{ mode: 'new' | 'edit'; row?: Acct } | null>(null);
  const [q, setQ] = useState('');
  const [org, setOrg] = useState('全部');
  const [role, setRole] = useState('全部');

  const rows = ROWS.filter(
    (r) =>
      (!q || r.name.includes(q) || r.person.includes(q)) &&
      (org === '全部' || r.org === org) &&
      (role === '全部' || r.role === role),
  );
  const edit = modal?.mode === 'edit' ? modal.row : undefined;

  const columns: Col<Acct>[] = [
    { header: '账户 ID', className: 'mono', cell: (r) => r.id },
    { header: '账户名', className: 'strong', cell: (r) => r.name },
    { header: '姓名', cell: (r) => r.person },
    { header: '所属机构', cell: (r) => r.org },
    { header: '上级机构', cell: (r) => (r.parent === '—' ? <span className="muted">—</span> : r.parent) },
    { header: '角色', cell: (r) => <span className={'tag-s ' + r.roleCls}>{r.role}</span> },
    { header: '状态', cell: (r) => <span className={'tag-s ' + r.statusCls}>{r.status}</span> },
    {
      header: '操作',
      cell: (r) => (
        <span className="op" onClick={() => setModal({ mode: 'edit', row: r })}>
          编辑
        </span>
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
          <button className="btn btn-primary btn-sm" onClick={() => setModal({ mode: 'new' })}>
            <Icon id="i-plus" w={14} h={14} />
            新建账户
          </button>
        </div>
      </div>
      <div className="filter">
        <Search placeholder="搜索账户名 / 姓名" minWidth={220} value={q} onChange={setQ} />
        <Dropdown label="所属机构" options={['全部', 'XX 出版社', 'YY 教育', 'ZZ 少儿']} onSelect={setOrg} />
        <Dropdown label="角色" options={['全部', '管理员', '运营', '只读']} onSelect={setRole} />
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的账户' }} />

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
            <button className="btn btn-primary btn-sm" onClick={() => { setModal(null); toast(edit ? '已保存账户' : '已创建账户'); }}>
              {edit ? '保存' : '创建'}
            </button>
          </>
        }
      >
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 4 }}>
          <div className="lab">账户名称<span className="req">*</span></div>
          <div className="ctl"><TextInput defaultValue={edit?.name} placeholder="登录账户名" /></div>
        </div>
        <div className="fm-row">
          <div className="lab">姓名<span className="req">*</span></div>
          <div className="ctl"><TextInput defaultValue={edit?.person} placeholder="真实姓名" /></div>
        </div>
        <div className="fm-row">
          <div className="lab">所属机构<span className="req">*</span></div>
          <div className="ctl"><Dropdown label={edit?.org || '选择机构'} options={['XX 出版社', 'YY 教育', 'ZZ 少儿']} style={{ maxWidth: 280 }} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">角色<span className="req">*</span></div>
          <div className="ctl"><Dropdown label={edit?.role || '选择角色'} options={['管理员', '运营', '只读']} style={{ maxWidth: 280 }} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">联系方式</div>
          <div className="ctl"><TextInput defaultValue={edit?.contact} placeholder="手机号 / 邮箱" /></div>
        </div>
      </Modal>
    </>
  );
}
