import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, Modal, ConfirmDialog, TextInput, DataGrid, type Col } from '@aba/ui-admin';

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
  { id: 'AC001', name: 'admin01', person: '张三', org: 'XX 出版集团', parent: '—', role: '管理员', roleCls: 'tag-indigo', status: '正常', statusCls: 'tag-jade', contact: '138****8888' },
  { id: 'AC002', name: 'view01', person: '李四', org: 'YY 教育', parent: 'XX 出版集团', role: '只读', roleCls: 'tag-line', status: '停用', statusCls: 'tag-terra', contact: '139****0000' },
  { id: 'AC003', name: 'ops01', person: '王五', org: 'ZZ 少儿', parent: 'XX 出版集团', role: '运营', roleCls: 'tag-jade', status: '正常', statusCls: 'tag-jade', contact: 'wang@zz.com' },
  { id: 'AC004', name: 'admin02', person: '赵敏', org: 'YY 教育', parent: 'XX 出版集团', role: '管理员', roleCls: 'tag-indigo', status: '正常', statusCls: 'tag-jade', contact: '137****1122' },
  { id: 'AC005', name: 'ops02', person: '钱进', org: 'XX 出版集团', parent: '—', role: '运营', roleCls: 'tag-jade', status: '正常', statusCls: 'tag-jade', contact: 'qian@xx.com' },
  { id: 'AC006', name: 'view02', person: '孙莉', org: 'ZZ 少儿', parent: 'XX 出版集团', role: '只读', roleCls: 'tag-line', status: '正常', statusCls: 'tag-jade', contact: '136****3344' },
  { id: 'AC007', name: 'ops03', person: '周涛', org: 'YY 教育', parent: 'XX 出版集团', role: '运营', roleCls: 'tag-jade', status: '停用', statusCls: 'tag-terra', contact: 'zhou@yy.com' },
  { id: 'AC008', name: 'admin03', person: '吴芳', org: 'ZZ 少儿', parent: 'XX 出版集团', role: '管理员', roleCls: 'tag-indigo', status: '正常', statusCls: 'tag-jade', contact: '135****5566' },
  { id: 'AC009', name: 'view03', person: '郑昊', org: 'XX 出版集团', parent: '—', role: '只读', roleCls: 'tag-line', status: '正常', statusCls: 'tag-jade', contact: '134****7788' },
  { id: 'AC010', name: 'ops04', person: '冯雪', org: 'YY 教育', parent: 'XX 出版集团', role: '运营', roleCls: 'tag-jade', status: '正常', statusCls: 'tag-jade', contact: 'feng@yy.com' },
  { id: 'AC011', name: 'admin04', person: '陈晨', org: 'ZZ 少儿', parent: 'XX 出版集团', role: '管理员', roleCls: 'tag-indigo', status: '停用', statusCls: 'tag-terra', contact: '133****9900' },
  { id: 'AC012', name: 'view04', person: '褚岩', org: 'YY 教育', parent: 'XX 出版集团', role: '只读', roleCls: 'tag-line', status: '正常', statusCls: 'tag-jade', contact: '132****2233' },
  { id: 'AC013', name: 'ops05', person: '卫东', org: 'XX 出版集团', parent: '—', role: '运营', roleCls: 'tag-jade', status: '正常', statusCls: 'tag-jade', contact: 'wei@xx.com' },
  { id: 'AC014', name: 'admin05', person: '蒋琳', org: 'ZZ 少儿', parent: 'XX 出版集团', role: '管理员', roleCls: 'tag-indigo', status: '正常', statusCls: 'tag-jade', contact: '131****4455' },
];

// 平台后台 · 机构账户（新建 / 编辑复用同一弹窗 + 停用/恢复二次确认）
export function Accounts() {
  const [data, setData] = useState<Acct[]>(ROWS);
  const [modal, setModal] = useState<{ mode: 'new' | 'edit'; row?: Acct } | null>(null);
  const [confirm, setConfirm] = useState<Acct | null>(null);
  const [q, setQ] = useState('');
  const [org, setOrg] = useState('全部');
  const [parent, setParent] = useState('全部');
  const [role, setRole] = useState('全部');
  const [status, setStatus] = useState('全部');

  // 上级机构筛选项 = 实际作为上级出现过的机构名（去重，剔除 — 顶级）
  const parentNames = [...new Set(ROWS.filter((r) => r.parent !== '—').map((r) => r.parent))];

  const toggleStatus = (t: Acct) => {
    const next = t.status === '正常' ? '停用' : '正常';
    setData((d) => d.map((r) => (r.id === t.id ? { ...r, status: next, statusCls: next === '正常' ? 'tag-jade' : 'tag-terra' } : r)));
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
    { header: '所属机构', cell: (r) => r.org },
    { header: '上级机构', cell: (r) => (r.parent === '—' ? <span className="muted">—</span> : r.parent) },
    { header: '角色', cell: (r) => <span className={'tag-s ' + r.roleCls}>{r.role}</span> },
    { header: '状态', cell: (r) => <span className={'tag-s ' + r.statusCls}>{r.status}</span> },
    {
      header: '操作',
      cell: (r) => (
        <div className="op-cell">
          <span className="op" onClick={() => setModal({ mode: 'edit', row: r })}>
            编辑
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
          <button className="btn btn-primary btn-sm" onClick={() => setModal({ mode: 'new' })}>
            <Icon id="i-plus" w={14} h={14} />
            新建账户
          </button>
        </div>
      </div>
      <div className="filter">
        <Search placeholder="搜索账户名 / 姓名" minWidth={220} value={q} onChange={setQ} />
        <Dropdown label="所属机构" options={['全部', 'XX 出版集团', 'YY 教育', 'ZZ 少儿']} onSelect={setOrg} />
        <Dropdown label="上级机构" options={['全部', ...parentNames]} onSelect={setParent} style={{ width: 180 }} />
        <Dropdown label="角色" options={['全部', '管理员', '运营', '只读']} onSelect={setRole} />
        <Dropdown label="状态" options={['全部', '正常', '停用']} onSelect={setStatus} />
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
          <div className="ctl"><Dropdown label={edit?.org || '选择机构'} options={['XX 出版集团', 'YY 教育', 'ZZ 少儿']} style={{ width: 200 }} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">角色<span className="req">*</span></div>
          <div className="ctl"><Dropdown label={edit?.role || '选择角色'} options={['管理员', '运营', '只读']} style={{ width: 200 }} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">联系方式</div>
          <div className="ctl"><TextInput defaultValue={edit?.contact} placeholder="手机号 / 邮箱" /></div>
        </div>
      </Modal>
    </>
  );
}
