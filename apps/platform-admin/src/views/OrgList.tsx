import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { Search, Dropdown, Modal, TextInput, DataGrid, Pager, type Col } from '@aba/ui-admin';

interface Org {
  i: number;
  id: string;
  name: string;
  status: string;
  statusCls: string;
  parent: string;
  llm: string;
  pay: string;
  payCls: string;
}
const ROWS: Org[] = [
  { i: 1, id: 'ORG001', name: 'XX 出版社', status: '正常', statusCls: 'tag-jade', parent: '—', llm: '平台默认', pay: '已配置', payCls: 'tag-indigo' },
  { i: 2, id: 'ORG002', name: 'YY 教育', status: '停用', statusCls: 'tag-terra', parent: 'XX 集团', llm: '自配 · 通义', pay: '未配置', payCls: 'tag-line' },
  { i: 3, id: 'ORG003', name: 'ZZ 少儿', status: '正常', statusCls: 'tag-jade', parent: 'XX 集团', llm: '平台默认', pay: '已配置', payCls: 'tag-indigo' },
];

// 平台超管 · 机构列表（搜索 + 状态筛选 + 排序 + 空态 + 创建弹窗）
export function OrgList() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('全部');

  const rows = ROWS.filter(
    (r) =>
      (!q || r.name.includes(q) || r.id.toLowerCase().includes(q.toLowerCase())) &&
      (status === '全部' || r.status === status),
  );

  const columns: Col<Org>[] = [
    { header: '#', className: 'mono', cell: (r) => r.i, sortValue: (r) => r.i },
    { header: '机构 ID', className: 'mono', cell: (r) => r.id },
    { header: '机构名称', className: 'strong', cell: (r) => r.name },
    { header: '状态', cell: (r) => <span className={'tag-s ' + r.statusCls}>{r.status}</span> },
    { header: '上级机构', cell: (r) => (r.parent === '—' ? <span className="muted">—</span> : r.parent) },
    { header: 'LLM 配置', cell: (r) => r.llm },
    { header: '微信支付', cell: (r) => <span className={'tag-s ' + r.payCls}>{r.pay}</span> },
    {
      header: '操作',
      cell: (r) => (
        <span className="op" onClick={() => nav('/orgs/' + r.i)}>
          详情
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">机构列表</div>
        </div>
        <div className="pa">
          <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
            <Icon id="i-plus" w={14} h={14} />
            创建机构
          </button>
        </div>
      </div>
      <div className="filter">
        <Search placeholder="搜索机构名称 / ID" minWidth={220} value={q} onChange={setQ} />
        <Dropdown label="状态" options={['全部', '正常', '停用']} onSelect={setStatus} />
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的机构', sub: '换个名称或状态试试' }} />
      <Pager total={36} unit="家" pages={3} />

      <Modal
        title="创建机构"
        open={open}
        onClose={() => setOpen(false)}
        width={460}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
              取消
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
              创建
            </button>
          </>
        }
      >
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 4 }}>
          <div className="lab">机构名称<span className="req">*</span></div>
          <div className="ctl"><TextInput placeholder="请输入机构名称" /></div>
        </div>
        <div className="fm-row">
          <div className="lab">上级机构</div>
          <div className="ctl"><Dropdown label="选填" options={['无', 'XX 集团']} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">备注</div>
          <div className="ctl"><TextInput placeholder="选填" /></div>
        </div>
        <div className="fm-row">
          <div className="lab">LLM 配置</div>
          <div className="ctl">
            <div className="seg">
              <b className="on">平台默认</b>
              <b style={{ opacity: 0.45, cursor: 'not-allowed' }} title="暂未开放">自配 · 暂未开放</b>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>机构 ID 创建后自动生成。</div>
      </Modal>
    </>
  );
}
