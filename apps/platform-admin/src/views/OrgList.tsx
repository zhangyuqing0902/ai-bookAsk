import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, Modal, ConfirmDialog, TextInput, DomainInput, DataGrid, exportWorkbook, type Col } from '@aba/ui-admin';
import { PLATFORM_ORGS, platformOrgRole, secondaryTenantDomain, suspensionImpact, tenantDomainSuffix, validateDomainPrefix, type PlatformOrg } from '@aba/mock';
import { limitOf } from '../data/orgPlans';
import { buildOrgListSpec } from '../exports/orgList';
import { applyOrgOverrides, useOrgTree } from '../stores/orgTree';

// 机构主数据（含父/子机构树）已下沉到 @aba/mock（PLATFORM_ORGS），机构列表与机构详情共用同一份，
// 不再在页面里本地维护一份 INIT。父/子/普通三态标签统一由 platformOrgRole 从机构树推导。
// 0714：套餐预设上限下移 ../data/orgPlans（与导出 spec 共用）；层级读 orgTree 覆盖（#1 子机构改父 / 取消关联
// 后上级机构列与父机构 tag 即时联动）；新增筛选行「导出」（exports/orgList.ts spec）。
const PLAN_RANK: Record<string, number> = { 基础版: 1, 专业版: 2, 旗舰版: 3, 定制版: 4 };
const PLAN_CLS: Record<string, string> = { 基础版: 'tag-line', 专业版: 'tag-indigo', 旗舰版: 'tag-amber', 定制版: 'tag-jade' };

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
  const [data, setData] = useState<PlatformOrg[]>(PLATFORM_ORGS);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('全部');
  const [parent, setParent] = useState('全部');
  const [plan, setPlan] = useState('全部');
  const [confirm, setConfirm] = useState<PlatformOrg | null>(null);
  const [newName, setNewName] = useState('');
  const [domainPrefix, setDomainPrefix] = useState('');
  const [newParent, setNewParent] = useState('无（顶级机构）');
  const domainCheck = validateDomainPrefix(domainPrefix, data.map((r) => r.domainPrefix));
  const domainSuffix = tenantDomainSuffix(window.location.hostname);
  // 0714 #1：应用「子机构改父 / 取消关联」层级覆盖后的机构数据（列表展示 / 角色推导 / 导出统一读它）
  const overrides = useOrgTree((s) => s.parentOverrides);
  const effData = applyOrgOverrides(data, overrides);

  const nameOf = (id: string | null) => (id ? effData.find((r) => r.id === id)?.name ?? '—' : '—');
  // 候选上级 = 顶级机构（自身无上级），保证只有「集团→分社」两层
  const topLevelNames = effData.filter((r) => r.parentId === null).map((r) => r.name);
  // 上级机构筛选项 = 实际作为上级出现过的机构名（去重）
  const parentNames = [...new Set(effData.filter((r) => r.parentId !== null).map((r) => nameOf(r.parentId)))];

  const rows = effData.filter((r) => {
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

  const toggleStatus = (target: PlatformOrg) => {
    const next = target.status === '正常' ? '停用' : '正常';
    setData((d) =>
      d.map((r) => (r.id === target.id ? { ...r, status: next, statusCls: next === '正常' ? 'tag-jade' : 'tag-terra' } : r)),
    );
  };

  const columns: Col<PlatformOrg>[] = [
    { header: '机构 ID', className: 'mono', cell: (r) => r.id },
    { header: '机构名称', className: 'strong', cell: (r) => <>{r.name}{platformOrgRole(r, effData) === 'parent' && <span className="tag-s tag-indigo" style={{ marginLeft: 6 }}>父机构</span>}</> },
    { header: '二级机构域名', className: 'mono', cell: (r) => secondaryTenantDomain(r.domainPrefix) },
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
        <div className="grow" />
        <button className="btn btn-ghost btn-sm" onClick={() => { void exportWorkbook(buildOrgListSpec({ rows, all: effData, filters: [['关键词', q || '无'], ['机构状态', status], ['套餐', plan], ['上级机构', parent]] })); toast('正在导出'); }}>
          <Icon id="i-dl" w={14} h={14} />
          导出
        </button>
      </div>
      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的机构', sub: '换个名称或状态试试' }} minWidth={1480} pageUnit="家" />

      <Modal
        title="创建机构"
        open={open}
        onClose={() => setOpen(false)}
        width={620}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
              取消
            </button>
            <button className="btn btn-primary btn-sm" disabled={!newName.trim() || !domainCheck.valid} onClick={() => {
              if (!newName.trim() || !domainCheck.valid) return;
              const i = Math.max(...data.map((r) => r.i)) + 1;
              const parentName = newParent.replace(/（父机构）$/, '');
              const parentId = newParent === '无（顶级机构）' ? null : data.find((r) => r.name === parentName)?.id ?? null;
              setData((rows) => [...rows, { i, id: `ORG${String(i).padStart(3, '0')}`, name: newName.trim(), domainPrefix: domainCheck.normalized, status: '正常', statusCls: 'tag-jade', parentId, llm: '平台默认', pay: '未配置', payCls: 'tag-line', plan: '基础版', kpUsed: 0, stUsed: 0, tkUsed: 0 }]);
              setNewName(''); setDomainPrefix(''); setNewParent('无（顶级机构）'); setOpen(false);
            }}>
              创建
            </button>
          </>
        }
      >
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 4 }}>
          <div className="lab">机构名称<span className="req">*</span></div>
          <div className="ctl"><TextInput placeholder="请输入机构名称" value={newName} onChange={(e) => setNewName(e.target.value)} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">机构域名前缀<span className="req">*</span></div>
          <div className="ctl">
            <DomainInput value={domainPrefix} onChange={setDomainPrefix} suffix={domainSuffix} invalid={!!domainPrefix && !domainCheck.valid} />
            {!!domainPrefix && !domainCheck.valid && <div style={{ fontSize: 12, marginTop: 5, color: 'var(--terra)' }}>{domainCheck.error}</div>}
          </div>
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
          <div className="ctl">
            <Dropdown label="无（顶级机构）" options={['无（顶级机构）', ...topLevelNames.map((name) => effData.some((x) => x.parentId === effData.find((r) => r.name === name)?.id) ? `${name}（父机构）` : name)]} onSelect={setNewParent} style={{ width: 260 }} />
            {/* 提示紧贴字段，不再放到弹窗最底部远离控件 */}
            <div className="hint">仅顶级机构可被选为上级；选定后本机构将成为其子机构（仅支持父 / 子两层）。</div>
          </div>
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
        {/* 0613-2：创建弹窗不含套餐，套餐 / 配额在机构详情的「套餐 / 配额」Tab 设置；
            0712：上级机构提示移至字段下方（原在弹窗底部远离控件） */}
      </Modal>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.status === '正常' ? '停用机构' : '恢复机构'}
        danger={confirm?.status === '正常'}
        confirmText={confirm?.status === '正常' ? '确认停用' : '确认恢复'}
        desc={
          confirm?.status === '正常' ? (
            <>停用「{confirm?.name}」后，仅该机构后台与前台暂停。{confirm ? suspensionImpact(effData.some((x) => x.parentId === confirm.id)).message : ''}</>
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
