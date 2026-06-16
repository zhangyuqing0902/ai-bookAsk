import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { Search, Dropdown, Modal, ConfirmDialog, TextInput, DataGrid, type Col } from '@aba/ui-admin';

interface Org {
  i: number;
  id: string;
  name: string;
  status: string;
  statusCls: string;
  /** 上级机构 ID；null = 顶级机构（V1 只允许一层：集团→分社） */
  parentId: string | null;
  llm: string;
  pay: string;
  payCls: string;
  /** 0614c：套餐 + 三项配额「已用」（上限由套餐推断；定制版上限单列） */
  plan: '基础版' | '专业版' | '旗舰版' | '定制版';
  kpUsed: number;
  stUsed: number; // 存储 GB
  tkUsed: number; // 月度 Token，单位亿
  /** 定制版上限（其余套餐由 PLAN_Q 推断） */
  custom?: { kp: number; storage: number; token: number };
}
// 套餐预设上限（KP 个 / 存储 GB / 月度 Token 亿），与机构详情套餐一致
const PLAN_Q: Record<string, { kp: number; storage: number; token: number }> = {
  基础版: { kp: 10, storage: 20, token: 0.5 },
  专业版: { kp: 50, storage: 100, token: 2 },
  旗舰版: { kp: 200, storage: 500, token: 10 },
};
const PLAN_RANK: Record<string, number> = { 基础版: 1, 专业版: 2, 旗舰版: 3, 定制版: 4 };
const PLAN_CLS: Record<string, string> = { 基础版: 'tag-line', 专业版: 'tag-indigo', 旗舰版: 'tag-amber', 定制版: 'tag-jade' };
const limitOf = (r: Org) => r.custom ?? PLAN_Q[r.plan];
const INIT: Org[] = [
  { i: 1, id: 'ORG001', name: 'XX 出版集团', status: '正常', statusCls: 'tag-jade', parentId: null, llm: '平台默认', pay: '已配置', payCls: 'tag-indigo', plan: '专业版', kpUsed: 30, stUsed: 62, tkUsed: 1.76 },
  { i: 2, id: 'ORG002', name: 'YY 教育', status: '停用', statusCls: 'tag-terra', parentId: 'ORG001', llm: '自配 · 通义', pay: '未配置', payCls: 'tag-line', plan: '基础版', kpUsed: 8, stUsed: 15, tkUsed: 0.32 },
  { i: 3, id: 'ORG003', name: 'ZZ 少儿', status: '正常', statusCls: 'tag-jade', parentId: 'ORG001', llm: '平台默认', pay: '已配置', payCls: 'tag-indigo', plan: '专业版', kpUsed: 22, stUsed: 40, tkUsed: 1.1 },
  { i: 4, id: 'ORG004', name: 'AA 文化集团', status: '正常', statusCls: 'tag-jade', parentId: null, llm: '平台默认', pay: '已配置', payCls: 'tag-indigo', plan: '旗舰版', kpUsed: 120, stUsed: 300, tkUsed: 6.4 },
  { i: 5, id: 'ORG005', name: 'AA 少儿分社', status: '正常', statusCls: 'tag-jade', parentId: 'ORG004', llm: '平台默认', pay: '未配置', payCls: 'tag-line', plan: '基础版', kpUsed: 6, stUsed: 12, tkUsed: 0.28 },
  { i: 6, id: 'ORG006', name: 'AA 教辅分社', status: '停用', statusCls: 'tag-terra', parentId: 'ORG004', llm: '自配 · 通义', pay: '已配置', payCls: 'tag-indigo', plan: '专业版', kpUsed: 35, stUsed: 70, tkUsed: 1.5 },
  { i: 7, id: 'ORG007', name: 'BB 数字出版', status: '正常', statusCls: 'tag-jade', parentId: null, llm: '平台默认', pay: '已配置', payCls: 'tag-indigo', plan: '旗舰版', kpUsed: 90, stUsed: 220, tkUsed: 4.8 },
  { i: 8, id: 'ORG008', name: 'BB 期刊中心', status: '正常', statusCls: 'tag-jade', parentId: 'ORG007', llm: '平台默认', pay: '已配置', payCls: 'tag-indigo', plan: '基础版', kpUsed: 9, stUsed: 18, tkUsed: 0.46 },
  { i: 9, id: 'ORG009', name: 'CC 科技出版', status: '正常', statusCls: 'tag-jade', parentId: null, llm: '自配 · 通义', pay: '未配置', payCls: 'tag-line', plan: '定制版', kpUsed: 60, stUsed: 250, tkUsed: 3.6, custom: { kp: 80, storage: 300, token: 5 } },
  { i: 10, id: 'ORG010', name: 'CC 医学分社', status: '正常', statusCls: 'tag-jade', parentId: 'ORG009', llm: '平台默认', pay: '已配置', payCls: 'tag-indigo', plan: '专业版', kpUsed: 44, stUsed: 88, tkUsed: 1.9 },
  { i: 11, id: 'ORG011', name: 'DD 教育研究院', status: '停用', statusCls: 'tag-terra', parentId: null, llm: '平台默认', pay: '未配置', payCls: 'tag-line', plan: '基础版', kpUsed: 5, stUsed: 10, tkUsed: 0.2 },
  { i: 12, id: 'ORG012', name: 'DD 考试中心', status: '正常', statusCls: 'tag-jade', parentId: 'ORG011', llm: '平台默认', pay: '已配置', payCls: 'tag-indigo', plan: '专业版', kpUsed: 28, stUsed: 55, tkUsed: 1.3 },
  { i: 13, id: 'ORG013', name: 'EE 美术出版', status: '正常', statusCls: 'tag-jade', parentId: null, llm: '平台默认', pay: '已配置', payCls: 'tag-indigo', plan: '旗舰版', kpUsed: 75, stUsed: 180, tkUsed: 3.2 },
];

// 配额单元格：已用 / 上限。0615-6：去掉按使用率变色（整列太花）——统一普通文字，
// 已用黑字、「/ 上限」灰字；用量预警仍由机构详情用量看板进度条体现。
function QuotaCell({ used, limit, unit }: { used: number; limit: number; unit?: string }) {
  return (
    <span className="mono" style={{ whiteSpace: 'nowrap' }}>
      <b style={{ color: 'var(--ink)', fontWeight: 500 }}>{used}</b>
      <span style={{ color: 'var(--ink-3)' }}> / {limit}{unit}</span>
    </span>
  );
}

// 平台超管 · 机构列表（搜索 + 状态筛选 + 排序 + 空态 + 创建弹窗 + 状态变更二次确认）
export function OrgList() {
  const nav = useNavigate();
  const [data, setData] = useState<Org[]>(INIT);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('全部');
  const [parent, setParent] = useState('全部');
  const [plan, setPlan] = useState('全部');
  const [confirm, setConfirm] = useState<Org | null>(null);

  const nameOf = (id: string | null) => (id ? data.find((r) => r.id === id)?.name ?? '—' : '—');
  // 候选上级 = 顶级机构（自身无上级），保证只有「集团→分社」两层
  const topLevelNames = data.filter((r) => r.parentId === null).map((r) => r.name);
  // 上级机构筛选项 = 实际作为上级出现过的机构名（去重）
  const parentNames = [...new Set(data.filter((r) => r.parentId !== null).map((r) => nameOf(r.parentId)))];

  const rows = data.filter((r) => {
    const parentName = nameOf(r.parentId);
    return (
      // 模糊匹配同时命中：机构名称、机构 ID、上级机构名称
      (!q ||
        r.name.includes(q) ||
        r.id.toLowerCase().includes(q.toLowerCase()) ||
        (r.parentId !== null && parentName.includes(q))) &&
      (status === '全部' || r.status === status) &&
      (parent === '全部' || parentName === parent) &&
      (plan === '全部' || r.plan === plan)
    );
  });

  const toggleStatus = (target: Org) => {
    const next = target.status === '正常' ? '停用' : '正常';
    setData((d) =>
      d.map((r) => (r.id === target.id ? { ...r, status: next, statusCls: next === '正常' ? 'tag-jade' : 'tag-terra' } : r)),
    );
  };

  const columns: Col<Org>[] = [
    { header: '机构 ID', className: 'mono', cell: (r) => r.id },
    { header: '机构名称', className: 'strong', cell: (r) => r.name },
    { header: '状态', cell: (r) => <span className={'tag-s ' + r.statusCls}>{r.status}</span>, sortValue: (r) => r.status },
    { header: '上级机构', cell: (r) => (r.parentId === null ? <span className="muted">—</span> : nameOf(r.parentId)) },
    // 0614c：套餐（可排序——按档位 基础<专业<旗舰<定制）
    { header: '套餐', cell: (r) => <span className={'tag-s ' + PLAN_CLS[r.plan]}>{r.plan}</span>, sortValue: (r) => PLAN_RANK[r.plan] },
    // 0614c：三项配额「已用 / 上限」（均为服务有效期内配额；可按使用率排序）
    { header: 'KP 用量', cell: (r) => <QuotaCell used={r.kpUsed} limit={limitOf(r).kp} unit=" 个" />, sortValue: (r) => r.kpUsed / limitOf(r).kp },
    { header: 'Token 额度', cell: (r) => <QuotaCell used={r.tkUsed} limit={limitOf(r).token} unit=" 亿" />, sortValue: (r) => r.tkUsed / limitOf(r).token },
    { header: '存储空间', cell: (r) => <QuotaCell used={r.stUsed} limit={limitOf(r).storage} unit=" GB" />, sortValue: (r) => r.stUsed / limitOf(r).storage },
    { header: 'LLM 配置', cell: (r) => r.llm, sortValue: (r) => r.llm },
    { header: '微信配置', cell: (r) => <span className={'tag-s ' + r.payCls}>{r.pay}</span>, sortValue: (r) => r.pay },
    {
      header: '操作',
      cell: (r) => (
        <div className="op-cell">
          <span className="op" onClick={() => nav('/orgs/' + r.i)}>
            详情
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
          <div className="pt">机构管理</div>
        </div>
        <div className="pa">
          <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
            <Icon id="i-plus" w={14} h={14} />
            创建机构
          </button>
        </div>
      </div>
      <div className="filter">
        <Search placeholder="搜索机构名称 / 上级机构 / ID" minWidth={260} value={q} onChange={setQ} />
        <Dropdown label="机构状态" options={['全部', '正常', '停用']} onSelect={setStatus} />
        <Dropdown label="套餐" options={['全部', '基础版', '专业版', '旗舰版', '定制版']} onSelect={setPlan} />
        <Dropdown label="上级机构" options={['全部', ...parentNames]} onSelect={setParent} style={{ width: 180 }} />
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的机构', sub: '换个名称或状态试试' }} minWidth={1320} pageUnit="家" />

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
        {/* 0614：机构联系人（用于配额阈值预警短信；手机号可重复） */}
        <div className="fm-row">
          <div className="lab">联系人手机号<span className="req">*</span></div>
          <div className="ctl"><TextInput placeholder="如 13812345678（可与其他机构重复）" /></div>
        </div>
        <div className="fm-row">
          <div className="lab">联系人姓名<span className="req">*</span></div>
          <div className="ctl"><TextInput placeholder="如 张三" /></div>
        </div>
        <div className="fm-row">
          <div className="lab">上级机构</div>
          <div className="ctl"><Dropdown label="无（顶级机构）" options={['无（顶级机构）', ...topLevelNames]} style={{ width: 200 }} /></div>
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
        {/* 0613-2：创建弹窗不含套餐，套餐 / 配额在机构详情的「套餐 / 配额」Tab 设置 */}
        {/* 0614：说明文案精简为单句 */}
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>仅顶级机构可被选为上级。</div>
      </Modal>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.status === '正常' ? '停用机构' : '恢复机构'}
        danger={confirm?.status === '正常'}
        confirmText={confirm?.status === '正常' ? '确认停用' : '确认恢复'}
        desc={
          confirm?.status === '正常' ? (
            <>停用「{confirm?.name}」后，该机构的后台与前台均会提示「机构服务已暂停」，C 端用户将无法访问。可随时恢复。</>
          ) : (
            <>恢复「{confirm?.name}」后，该机构的后台与前台访问将立即解封。</>
          )
        }
        onConfirm={() => confirm && toggleStatus(confirm)}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}
