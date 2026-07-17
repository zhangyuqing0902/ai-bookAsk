import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { Dropdown, Search, TextInput, DomainInput, InfoDot, CurrentSubCard, DateTimeRangeField, RangePicker, Modal, ConfirmDialog, SubPackDrawer, type PackForm, QtyStepper, DataGrid, type Col, pickFile, pickImageColor, ACCEPT, UNIT_NOTE } from '@aba/ui-admin';
import { MY_ORG_SUBS, PLATFORM_ORGS, platformOrgRole, comparisonPeriodLabel, currentSubCard, metricHelp, subStatus, tenantDomainSuffix, validateDomainPrefix, type Subscription } from '@aba/mock';
import { applyOrgOverrides, useOrgTree } from '../stores/orgTree';

// 0613-2：套餐 / 配额独立成 Tab；用量看板重排（配额进度重点 + 2×2）；微信配置分区卡片
// 0615：「套餐 / 配额」Tab 改造为订阅闭环（当前生效订阅只读 + 订阅记录 + 新建续签 / 升级）
const TABS = ['基本资料', '订阅配额', '机构配置', '用量看板', '品牌外观'];
const SUBTABS = ['LLM 配置', '联网配置', '微信配置'];

// 机构套餐预设（KP 数 / 存储 GB / 当前订阅周期 Token 亿）；Token 值只填数字、单位「亿」放后缀 / 单位标；定制版手填
const PLAN_NAMES = ['体验版', '基础版', '专业版', '旗舰版', '定制版', '不限版'];
const PLANS: Record<string, { kp: string; storage: string; token: string }> = {
  体验版: { kp: '3', storage: '5', token: '0.1' }, // 付费前试用,额度整体最小
  基础版: { kp: '10', storage: '20', token: '0.5' },
  专业版: { kp: '50', storage: '100', token: '2' },
  旗舰版: { kp: '200', storage: '500', token: '10' },
  不限版: { kp: '不限', storage: '不限', token: '不限' }, // 深度合作机构,三额度均不限
  定制版: { kp: '', storage: '', token: '' }, // 每额度可填数字或单独设「不限」
};
const PLAN_CLS_D: Record<string, string> = { 体验版: 'tag-line', 基础版: 'tag-line', 专业版: 'tag-indigo', 旗舰版: 'tag-amber', 不限版: 'tag-jade', 定制版: 'tag-jade' };
const SUB_ST_CLS: Record<string, string> = { 生效: 'ok', 未生效: 'none', 已过期: 'expired' };
const USAGE_BY_RANGE: Record<string, { active: string; added: string; questions: string; gmv: string; payUsers: string; token: string; calls: string; response: string }> = {
  今日: { active: '1,240 人', added: '48 人', questions: '1,180 条', gmv: '¥1.1万', payUsers: '32 人', token: '62万 token', calls: '1.8万 次', response: '1.7s' },
  '近 7 天': { active: '5,600 人', added: '320 人', questions: '3.2万 条', gmv: '¥25.6万', payUsers: '210 人', token: '860万 token', calls: '24万 次', response: '1.8s' },
  '30 天': { active: '1.2万 人', added: '1,280 人', questions: '12.8万 条', gmv: '¥104.7万', payUsers: '860 人', token: '3,620万 token', calls: '102万 次', response: '1.9s' },
};

// 用量看板卡片（顶部色条 + 标题 + 指标行分隔 + 数值强调）
function UsageCard({ title, rows, periodDays }: { title: string; rows: [string, string, string][]; periodDays?: number }) {
  return (
    <div className="usage-card">
      <div className="uc-title">
        <span className="uc-dot" />
        {title}
      </div>
      <div className="uc-rows">
        {rows.map(([k, v, info]) => (
          <div className="uc-row" key={k}>
            <span className="uc-k">
              {k}
              <InfoDot text={metricHelp(info, periodDays ? (periodDays === 1 ? 'today' : 'range') : 'snapshot', k.includes('率') ? 'rate' : k.includes('响应') ? 'duration' : 'count')} />
            </span>
            {/* 0716 #13：数值与对比周期之间增加水平间距，避免过于紧凑 */}
            <span className="uc-v mono">{v}{periodDays && <span className="period-compare" style={{ marginLeft: 10 }}>{comparisonPeriodLabel(periodDays)}</span>}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 平台后台 · 机构详情
export function OrgDetail() {
  const nav = useNavigate();
  // 从列表带过来的机构编号（r.i）读取当前机构；机构主数据与列表共用同一份 PLATFORM_ORGS。
  // 0714 #1：层级读 orgTree 覆盖（子机构改父 / 取消关联后，头部 tag 与三态提示即时联动）。
  const { id } = useParams();
  const overrides = useOrgTree((s) => s.parentOverrides);
  const setParent = useOrgTree((s) => s.setParent);
  const allOrgs = applyOrgOverrides(PLATFORM_ORGS, overrides);
  const org = allOrgs.find((o) => String(o.i) === id) ?? allOrgs[0];
  const role = platformOrgRole(org, allOrgs); // 'parent' | 'child' | 'ordinary'
  const parentName = org.parentId ? allOrgs.find((o) => o.id === org.parentId)?.name ?? '—' : null;
  // 可选上级 = 其它顶级机构（无上级者，排除自身）；选中后对方即成为父机构（两层制）
  const topLevelOthers = allOrgs.filter((o) => o.parentId === null && o.id !== org.id).map((o) => o.name);
  const superiorOptions = ['无（顶级机构）', ...topLevelOthers];
  // #1：改上级 / 取消关联二次确认
  const [pendingParent, setPendingParent] = useState<string | null>(null); // 目标上级机构名
  const [unlinkOpen, setUnlinkOpen] = useState(false);
  const confirmParentChange = () => {
    if (!pendingParent) return;
    const target = allOrgs.find((o) => o.name === pendingParent);
    if (!target) return;
    setParent(org.id, target.id);
    setPendingParent(null);
    toast('已更改上级机构');
  };
  const doUnlink = () => {
    setParent(org.id, null);
    setUnlinkOpen(false);
    toast('已取消关联，本机构已转为独立机构');
  };
  const [tab, setTab] = useState(0);
  const [sub, setSub] = useState(0);
  const [net, setNet] = useState(true);
  const [plan, setPlan] = useState('专业版');
  const [quota, setQuota] = useState(PLANS['专业版']);
  const [primary, setPrimary] = useState('#4B57E8');
  const [secondary, setSecondary] = useState('#8B6CF6');
  const [domainPrefix, setDomainPrefix] = useState(org.domainPrefix);
  const [usageRange, setUsageRange] = useState('近 7 天');
  const domainCheck = validateDomainPrefix(domainPrefix);
  const domainSuffix = tenantDomainSuffix(window.location.hostname);
  const usage = USAGE_BY_RANGE[usageRange] ?? USAGE_BY_RANGE['近 7 天'];
  const usagePeriodDays = usageRange === '今日' ? 1 : usageRange === '30 天' ? 30 : 7;

  const matchesPlan = (q: { kp: string; storage: string; token: string }, name: string) =>
    name !== '定制版' && q.kp === PLANS[name].kp && q.storage === PLANS[name].storage && q.token === PLANS[name].token;
  const selectPlan = (name: string) => {
    setPlan(name);
    setQuota(PLANS[name]);
  };
  // 2：改额度后自动匹配套餐——命中某预设则选中它，否则自动变「定制版」（不再用额度旁 badge）
  const editQuota = (patch: Partial<typeof quota>) => {
    const nq = { ...quota, ...patch };
    setQuota(nq);
    setPlan(PLAN_NAMES.find((n) => matchesPlan(nq, n)) ?? '定制版');
  };

  // 0615-3 / 0615-6：订阅 / 配额 Tab —— 当前生效订阅卡（共享 CurrentSubCard，数据用 currentSubCard 计算）+ 订阅记录 + 加油包右抽屉
  const [subs, setSubs] = useState<Subscription[]>(MY_ORG_SUBS);
  const packsOf = (subId: string) => subs.filter((s) => s.type === '加油包' && s.parentId === subId);
  const tidy = (n: number) => Number(n.toFixed(2)); // 浮点求和后修整（1.76+0.12 → 1.88）
  // 0615-6 新建订阅生效规则（A+C）日期工具
  const fmtLocal = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  const todayStr = fmtLocal(new Date());
  const shift = (d: string, days: number, years = 0) => { const dt = new Date(d + 'T00:00:00'); dt.setFullYear(dt.getFullYear() + years); dt.setDate(dt.getDate() + days); return fmtLocal(dt); };
  const orderSubs = subs.filter((s) => s.type === '订阅');
  const overlaps = (aS: string, aE: string, bS: string, bE: string) => aS <= bE && bS <= aE;
  // 默认有效期：从最晚订阅到期次日衔接一年（天然不重叠）
  const latestEnd = orderSubs.reduce((m, s) => (s.endDate > m ? s.endDate : m), todayStr);
  const defStart = shift(latestEnd, 1);
  const defEnd = shift(defStart, -1, 1);

  // 新建 / 复制 订阅弹窗（仅「订阅」；加油包从抽屉内新建）
  const [subModal, setSubModal] = useState(false);
  const [owner, setOwner] = useState('');
  const [note, setNote] = useState('');
  const [newStart, setNewStart] = useState(defStart);
  const [newEnd, setNewEnd] = useState(defEnd);
  const [detail, setDetail] = useState<Subscription | null>(null);
  // 加油包右抽屉（针对某个订阅；表单与校验在共享 SubPackDrawer 内）
  const [drawerSub, setDrawerSub] = useState<Subscription | null>(null);
  // 0714 #17：删除放开到「未生效 / 生效」均可删（已过期不出删除入口），确认弹窗分层护栏：
  // 基础文案 + 已产生用量的红色强警告 + 「删除≠退款」灰字说明；连带删除名下加油包（doDelete 不变）。
  const [delSub, setDelSub] = useState<Subscription | null>(null);
  const deletable = (s: Subscription) => subStatus(s) !== '已过期';
  const usedOf = (s: Subscription) => ({
    kp: parseFloat(s.kpUsed ?? '0') || 0,
    storage: parseFloat(s.storageUsed ?? '0') || 0,
    token: parseFloat(s.tokenUsed ?? '0') || 0,
  });
  const hasUsage = (s: Subscription) => {
    const u = usedOf(s);
    return u.kp > 0 || u.storage > 0 || u.token > 0;
  };
  const doDelete = () => {
    if (!delSub) return;
    setSubs((arr) => arr.filter((s) => s.id !== delSub.id && s.parentId !== delSub.id));
    setDelSub(null);
    toast('已删除订阅订单');
  };
  // 订阅维度筛选（0714 #15：商务负责人改模糊搜索，位置提前到套餐之前）
  const [fPlan, setFPlan] = useState('全部');
  const [fOwner, setFOwner] = useState('');
  const [fStatus, setFStatus] = useState('全部');
  const recRows = subs
    .filter(
      (s) =>
        s.type === '订阅' &&
        (fPlan === '全部' || s.plan === fPlan) &&
        (!fOwner || (s.owner ?? '').includes(fOwner)) &&
        (fStatus === '全部' || subStatus(s) === fStatus),
    )
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)); // 默认按创建时间倒序

  const openNew = () => {
    setPlan('专业版');
    setQuota(PLANS['专业版']);
    setOwner('');
    setNote('');
    setNewStart(defStart);
    setNewEnd(defEnd);
    setSubModal(true);
  };
  const openCopy = (s: Subscription) => {
    // 复制该订阅数据进入新建表单，便于快速填写（有效期仍取衔接默认，避免与被复制订阅重叠）
    if (s.plan) {
      setPlan(s.plan);
    }
    setQuota({ kp: s.kp, storage: s.storage, token: s.token });
    setOwner(s.owner ?? '');
    setNote(s.note ?? '');
    setNewStart(defStart);
    setNewEnd(defEnd);
    setSubModal(true);
  };
  const confirmSub = () => {
    // 0615-6 A+C 生效规则校验
    if (orderSubs.some((s) => s.startDate > todayStr)) {
      toast('已有 1 期未生效订阅，最多只能预建一期续约');
      return;
    }
    const hit = orderSubs.find((s) => overlaps(newStart, newEnd, s.startDate, s.endDate));
    if (hit) {
      toast(`有效期与订阅 ${hit.id}（${hit.startDate} ~ ${hit.endDate}）重叠，同一时间段只能有一个订阅`);
      return;
    }
    const autoStatus: Subscription['status'] = newStart > todayStr ? '未生效' : '生效';
    const newSub: Subscription = {
      id: 'SUB2026061514' + String(30 + subs.length) + '-XX',
      orgId: 'xx',
      orgName: 'XX 出版社',
      type: '订阅',
      plan,
      kp: quota.kp,
      storage: quota.storage,
      token: quota.token,
      kpUsed: '0',
      storageUsed: '0',
      tokenUsed: '0',
      startDate: newStart,
      endDate: newEnd,
      owner: owner.trim() || undefined,
      note: note.trim() || undefined,
      status: autoStatus, // 由有效期自动判定（起始 > 今天 = 未生效，到期自动生效）
      createdAt: '2026-06-15 14:30:00',
      createdBy: 'superadmin',
    };
    setSubs((arr) => [newSub, ...arr]);
    setSubModal(false);
    toast(autoStatus === '未生效' ? '已创建订阅（未生效，到生效日期自动生效）' : '已创建订阅');
  };
  const addPack = (form: PackForm) => {
    if (!drawerSub) return;
    const newPack: Subscription = {
      id: 'PKG2026061514' + String(30 + subs.length) + '-XX',
      orgId: 'xx',
      orgName: 'XX 出版社',
      type: '加油包',
      parentId: drawerSub.id,
      kp: form.kp,
      storage: form.storage,
      token: form.token,
      kpUsed: '0',
      storageUsed: '0',
      tokenUsed: '0',
      startDate: '2026-06-15',
      endDate: drawerSub.endDate,
      note: form.note || undefined,
      status: '生效', // 加油包即时生效
      createdAt: '2026-06-15 14:30:00',
      createdBy: 'superadmin',
    };
    setSubs((arr) => [newPack, ...arr]);
  };

  // 总额度（已用 / 上限，含加油包）：订阅基础额度 + 其名下「生效」加油包累加（#3）
  const totalQuotaText = (s: Subscription) => {
    const ps = packsOf(s.id).filter((p) => p.status === '生效');
    const sum = (k: 'kp' | 'storage' | 'token' | 'kpUsed' | 'storageUsed' | 'tokenUsed') =>
      ps.reduce((n, p) => n + (parseFloat((p[k] as string) ?? '0') || 0), 0);
    const t = (base: string | undefined, k: 'kp' | 'storage' | 'token' | 'kpUsed' | 'storageUsed' | 'tokenUsed') =>
      tidy((parseFloat(base ?? '0') || 0) + sum(k));
    return `${t(s.kpUsed, 'kpUsed')}/${t(s.kp, 'kp')} 个 · ${t(s.storageUsed, 'storageUsed')}/${t(s.storage, 'storage')} GB · ${t(s.tokenUsed, 'tokenUsed')}/${t(s.token, 'token')} 亿`;
  };

  const subCols: Col<Subscription>[] = [
    { header: '订阅订单 ID', className: 'mono', cell: (s) => s.id, sortValue: (s) => s.id },
    { header: '套餐', cell: (s) => (s.plan ? <span className={'tag-s ' + (PLAN_CLS_D[s.plan] ?? 'tag-line')}>{s.plan}</span> : <span className="muted">—</span>), sortValue: (s) => s.plan ?? '' },
    { header: '总额度（已用 / 上限，含加油包）', className: 'mono', cell: (s) => totalQuotaText(s) },
    { header: '有效期', className: 'mono', cell: (s) => `${s.startDate} ~ ${s.endDate}`, sortValue: (s) => s.endDate },
    { header: '商务负责人', cell: (s) => (s.owner ? s.owner : <span className="muted">—</span>), sortValue: (s) => s.owner ?? '' },
    { header: '状态', sortValue: (s) => subStatus(s), cell: (s) => { const st = subStatus(s); return <span className={'fstat ' + (SUB_ST_CLS[st] ?? 'none')}><span className="dt" />{st}</span>; } },
    { header: '加油包', sortValue: (s) => packsOf(s.id).length, cell: (s) => { const n = packsOf(s.id).length; return n ? <span className="tag-s tag-amber">{n} 个</span> : <span className="muted">—</span>; } },
    { header: '创建时间', className: 'mono', cell: (s) => s.createdAt, sortValue: (s) => s.createdAt },
    { header: '创建人', className: 'mono', cell: (s) => s.createdBy },
    { header: '操作', cell: (s) => <div className="op-cell"><span className="op" onClick={() => setDetail(s)}>详情</span> <span className="op" onClick={() => openCopy(s)}>复制</span> <span className="op" onClick={() => setDrawerSub(s)}>加油包</span>{deletable(s) && <span className="op op-danger" onClick={() => setDelSub(s)}>删除</span>}</div> },
  ];

  return (
    <>
      <div className="kpd-head">
        <span className="kpd-back" onClick={() => nav('/orgs')}>
          <Icon id="i-chevL" />
          返回
        </span>
        <span className="kpd-name">{org.name}</span>
        <span className={'tag-s ' + org.statusCls}>{org.status}</span>
        {role === 'parent' && <span className="tag-s tag-indigo">父机构</span>}
        {tab === 0 && (
          <span className="kpd-status">
            <button className="btn btn-primary btn-sm" onClick={() => toast('已保存')}>
              保存
            </button>
          </span>
        )}
      </div>
      <div className="kpd-tabs">
        {TABS.map((t, i) => (
          <div key={t} className={'kpd-tab' + (tab === i ? ' on' : '')} onClick={() => setTab(i)}>
            {t}
          </div>
        ))}
      </div>

      {/* —— 基本资料 —— */}
      {tab === 0 && (
        <div className="fm-card">
          <div className="fm-row">
            <div className="lab">机构名称<span className="req">*</span></div>
            <div className="ctl"><TextInput key={org.id} defaultValue={org.name} style={{ maxWidth: 360 }} /></div>
          </div>
          <div className="fm-row">
            <div className="lab">机构域名前缀<span className="req">*</span></div>
            <div className="ctl">
              <DomainInput value={domainPrefix} onChange={setDomainPrefix} suffix={domainSuffix} invalid={!!domainPrefix && !domainCheck.valid} />
              {!!domainPrefix && !domainCheck.valid && <div style={{ fontSize: 12, color: 'var(--terra)', marginTop: 5 }}>{domainCheck.error}</div>}
            </div>
          </div>
          {/* 0614b：机构联系人手机号——平台后台直接明文展示（不加密）；小问号说明重复规则 */}
          <div className="fm-row">
            <div className="lab">
              联系人手机号<span className="req">*</span>
              <InfoDot
                width={340}
                lines={[
                  '必填；用于配额阈值预警短信通知',
                  '机构联系人手机号可重复，可与其他机构 / 机构账户相同',
                  'C 端用户手机号仅「机构内唯一」，全平台可重复——同一号可在不同机构各注册一个账户',
                ]}
              />
            </div>
            <div className="ctl" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <TextInput defaultValue="13800138888" style={{ maxWidth: 200 }} />
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>可与其他机构重复</span>
            </div>
          </div>
          <div className="fm-row">
            <div className="lab">联系人姓名<span className="req">*</span></div>
            <div className="ctl"><TextInput defaultValue="张三" style={{ maxWidth: 200 }} /></div>
          </div>
          <div className="fm-row">
            <div className="lab">上级机构</div>
            {role === 'child' ? (
              // 0714 #1：子机构上级可编辑——可改挂其它顶级机构，或取消关联转为独立机构（均二次确认）
              <div className="ctl">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Dropdown
                    key={parentName ?? 'none'}
                    label={parentName ?? '—'}
                    options={topLevelOthers}
                    onSelect={(v) => { if (v !== parentName) setPendingParent(v); }}
                    style={{ width: 240 }}
                  />
                  <button
                    className="btn btn-sm"
                    style={{ background: 'var(--surface)', border: '1px solid var(--indigo)', color: 'var(--indigo)' }}
                    onClick={() => setUnlinkOpen(true)}
                  >
                    取消关联，转为独立机构
                  </button>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>更改仅调整层级关系；子机构数据归属与域名不变（仅支持父 / 子两层）</div>
              </div>
            ) : role === 'parent' ? (
              // 父机构：已有下级，不能再挂上级（否则超过父 / 子两层）——字段禁用并说明原因
              <div className="ctl" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <TextInput value="无（本机构为父机构）" disabled style={{ width: 240 }} />
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>该机构已是父机构，不能再设上级机构（仅支持父 / 子两层）</span>
              </div>
            ) : (
              // 普通机构：可选一个顶级机构作为上级（选后自身成为子机构，二次确认，与 #1 同一链路）
              <div className="ctl" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Dropdown label="无（顶级机构）" options={superiorOptions} onSelect={(v) => { if (v !== '无（顶级机构）') setPendingParent(v); }} style={{ width: 240 }} />
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>仅顶级机构可被选为上级；设定后本机构将成为其子机构</span>
              </div>
            )}
          </div>

          {/* 0714 #1：改上级二次确认 */}
          <ConfirmDialog
            open={!!pendingParent}
            title="更改上级机构"
            confirmText="确认更改"
            desc={<>将「{org.name}」的上级机构改为「{pendingParent}」？子机构数据归属与域名不变，仅调整层级关系。</>}
            onConfirm={confirmParentChange}
            onClose={() => setPendingParent(null)}
          />
          {/* 0714 #1：取消关联二次确认（中等 danger） */}
          <ConfirmDialog
            open={unlinkOpen}
            danger
            title="取消关联"
            confirmText="确认取消关联"
            desc={<>解除后本机构成为独立机构；原父机构「{parentName}」若再无其他子机构，其父机构身份同步解除。机构数据与用户服务不受影响。</>}
            onConfirm={doUnlink}
            onClose={() => setUnlinkOpen(false)}
          />
          <div className="fm-row">
            <div className="lab">备注</div>
            <div className="ctl"><TextInput placeholder="选填" style={{ maxWidth: 420 }} /></div>
          </div>
          <div className="fm-row">
            <div className="lab">状态</div>
            <div className="ctl" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className={'tag-s ' + org.statusCls}>{org.status}</span>
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>状态变更请在机构管理的操作列进行</span>
            </div>
          </div>
        </div>
      )}

      {/* —— 订阅 / 配额（0615-3：当前生效订阅卡 + 订阅记录按订阅维度 + 加油包右抽屉）—— */}
      {tab === 1 && (
        <>
          {/* 当前生效订阅卡（共享组件；订阅 Tab 显示商务负责人 + 新建订阅按钮） */}
          <CurrentSubCard data={currentSubCard(subs)} showOwner showNew onNew={openNew} />

          {/* 订阅订单（按订阅维度；加油包通过操作列「加油包」进右抽屉查看 / 新建） */}
          <div className="dash-section-head" style={{ marginTop: 20 }}>
            <div className="dash-section-title" style={{ margin: 0 }}>
              订阅订单 <span className="dash-section-sub">· 按订阅维度，每行可查看 / 新建其加油包；状态由有效期自动判定</span>
            </div>
          </div>
          <div className="orders-filter">
            {/* 0714 #15：商务负责人由下拉改模糊搜索，且放在套餐之前 */}
            <Search placeholder="商务负责人" minWidth={170} value={fOwner} onChange={setFOwner} />
            <Dropdown label="套餐" options={['全部', ...PLAN_NAMES]} onSelect={setFPlan} />
            <Dropdown label="状态" options={['全部', '未生效', '生效', '已过期']} onSelect={setFStatus} />
          </div>
          <DataGrid columns={subCols} rows={recRows} empty={{ title: '暂无订阅订单' }} minWidth={1240} pageUnit="笔" />

          {/* 新建 / 复制 订阅弹窗（仅订阅） */}
          <Modal
            title="新建订阅"
            open={subModal}
            onClose={() => setSubModal(false)}
            width={850}
            footer={
              <>
                <button className="btn btn-ghost" onClick={() => setSubModal(false)}>取消</button>
                <button className="btn btn-primary" onClick={confirmSub}>确认创建</button>
              </>
            }
          >
            <div className="fm-row" style={{ borderTop: 'none' }}>
              <div className="lab">套餐</div>
              <div className="ctl">
                <div className="sub-plan-list">
                  {PLAN_NAMES.map((name) => {
                    const p = PLANS[name];
                    const on = plan === name;
                    return (
                      <div key={name} className={'sub-plan-row' + (on ? ' on' : '')} onClick={() => selectPlan(name)}>
                        <span className="spr-name">{name}</span>
                        <span className="spr-spec">{name === '定制版' ? '配额自定义' : name === '不限版' ? 'KP / 存储 / Token 均不限' : `KP ${p.kp} 个 · 存储 ${p.storage} GB · Token ${p.token} 亿`}</span>
                        {on && <Icon id="i-check" w={15} h={15} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="fm-row">
              <div className="lab">额度</div>
              <div className="ctl">
                <div className="quota-edit">
                  {/* 0715 #8：三张横排指标卡——顶部圆形图标 + 指标名 + 占用/消耗标签，下方步进器 + 单位。
                      步进器 onChange 仍走 editQuota 保持套餐联动；选「不限版」时步进器禁用显静态「不限」。
                      图标：KP=i-cube、存储=i-file2（无 i-db/i-server，取文件件近似）、Token=i-chip。
                      KP · 存储为占用型（占用量），Token 为消耗型（消耗量）。 */}
                  {([['kp', 'KP 数', '个', '占用量', 'i-cube'], ['storage', '存储', 'GB', '占用量', 'i-file2'], ['token', 'Token', '亿', '消耗量', 'i-chip']] as const).map(([field, metric, unit, kind, icon]) => {
                    const unlim = quota[field] === '不限';
                    return (
                      <div key={field} className="quota-card">
                        <div className="qc-head">
                          <span className="qc-ic"><Icon id={icon} /></span>
                          <span className="qc-name">{metric}</span>
                          <span className={'tag-s ' + (kind === '消耗量' ? 'tag-indigo' : 'tag-line')}>{kind}</span>
                        </div>
                        <QtyStepper value={unlim ? '不限' : quota[field]} onChange={(v) => editQuota({ [field]: v })} unit={unit} disabled={unlim} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>占用量（KP · 存储）随内容删除可释放；消耗量（Token）只增不退、订阅周期结束清零重计</div>
              </div>
            </div>
            <div className="fm-row">
              <div className="lab">有效期<span className="req">*</span></div>
              <div className="ctl"><DateTimeRangeField key={subModal ? 'open' : 'closed'} defaultStart={newStart} defaultEnd={newEnd} onChange={(s, e) => { setNewStart(s); setNewEnd(e); }} /></div>
            </div>
            <div className="fm-row">
              <div className="lab">商务负责人</div>
              <div className="ctl"><TextInput value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="选填" style={{ maxWidth: 200 }} /></div>
            </div>
            <div className="fm-row">
              <div className="lab">备注</div>
              <div className="ctl"><TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="选填" style={{ maxWidth: 320 }} /></div>
            </div>
            {/* 0615-6：去掉状态手动开关——状态由有效期自动判定；说明块用无序列表、不换行依次展示（左对齐控件列） */}
            <div className="sub-tip" style={{ marginLeft: 86 }}>
              <ul style={{ whiteSpace: 'nowrap' }}>
                <li>同一时间段只能有一个生效订阅</li>
                <li>有生效订阅时最多再预建 1 期未生效订阅</li>
                <li>新建有效期不可与已有订阅重叠</li>
                <li>未生效订阅到生效日期自动转生效</li>
              </ul>
            </div>
          </Modal>

          {/* 订阅详情弹窗 */}
          <Modal
            title="订阅详情"
            open={!!detail}
            onClose={() => setDetail(null)}
            width={500}
            footer={<button className="btn btn-primary" onClick={() => setDetail(null)}>关闭</button>}
          >
            {detail && (
              <div className="pc-fields" style={{ padding: 0 }}>
                <div className="pc-row"><span className="pc-label">订阅订单 ID</span><span className="pc-value mono">{detail.id}</span></div>
                {detail.plan && <div className="pc-row"><span className="pc-label">套餐</span><span className="pc-value">{detail.plan}</span></div>}
                <div className="pc-row"><span className="pc-label">额度</span><span className="pc-value mono">{detail.kp} 个 · {detail.storage} GB · {detail.token} 亿</span></div>
                <div className="pc-row"><span className="pc-label">已用</span><span className="pc-value mono">{detail.kpUsed ?? 0} 个 · {detail.storageUsed ?? 0} GB · {detail.tokenUsed ?? 0} 亿</span></div>
                <div className="pc-row"><span className="pc-label">有效期</span><span className="pc-value mono">{detail.startDate} ~ {detail.endDate}</span></div>
                <div className="pc-row"><span className="pc-label">商务负责人</span><span className="pc-value">{detail.owner ?? '—'}</span></div>
                <div className="pc-row"><span className="pc-label">状态</span><span className="pc-value">{subStatus(detail)}</span></div>
                <div className="pc-row"><span className="pc-label">加油包</span><span className="pc-value">{packsOf(detail.id).length} 个</span></div>
                <div className="pc-row"><span className="pc-label">创建时间</span><span className="pc-value mono">{detail.createdAt}</span></div>
                <div className="pc-row"><span className="pc-label">创建人</span><span className="pc-value mono">{detail.createdBy}</span></div>
                <div className="pc-row"><span className="pc-label">备注</span><span className="pc-value">{detail.note || '—'}</span></div>
              </div>
            )}
          </Modal>

          {/* 加油包右抽屉（共享组件：列表 + 顶部新建 + 全 0 校验） */}
          <SubPackDrawer
            sub={drawerSub}
            packs={drawerSub ? packsOf(drawerSub.id) : []}
            onClose={() => setDrawerSub(null)}
            onAdd={addPack}
          />

          {/* 0714 #17 / #14：删除二次确认（未生效 / 生效均可删）。
              #14：文案改无序列表结构化呈现、每条一行不折，并把弹窗加宽——ConfirmDialog 无 width prop，
              故直接用 Modal（width 560）承载并复刻 danger 底部按钮，护栏逻辑（用量>0 才显红警条）不变。 */}
          <Modal
            title="删除订阅订单"
            open={!!delSub}
            width={560}
            onClose={() => setDelSub(null)}
            footer={
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => setDelSub(null)}>取消</button>
                <button
                  className="btn btn-sm"
                  style={{ background: 'var(--terra)', borderColor: 'var(--terra)', color: '#fff' }}
                  onClick={() => { doDelete(); }}
                >
                  删除
                </button>
              </>
            }
          >
            {delSub && (
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                <div style={{ marginBottom: 8 }}>
                  确认删除订阅订单 <b>{delSub.id}</b>（{delSub.plan} · {delSub.startDate} ~ {delSub.endDate}）？
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, listStyle: 'disc' }}>
                  <li style={{ whiteSpace: 'nowrap' }}>删除后不可恢复</li>
                  <li style={{ whiteSpace: 'nowrap' }}>连带删除该订阅下全部加油包（{packsOf(delSub.id).length} 个）</li>
                  <li style={{ whiteSpace: 'nowrap' }}>机构将立即失去该订阅的配额</li>
                </ul>
                {hasUsage(delSub) && (
                  <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(229,83,59,.10)', color: 'var(--terra)', fontWeight: 600 }}>
                    ⚠ 该订阅已产生用量（KP {usedOf(delSub).kp} 个 · 存储 {usedOf(delSub).storage} GB · Token {usedOf(delSub).token} 亿），删除将立即中断机构服务
                  </div>
                )}
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-3)' }}>删除≠退款：不产生退款单，如涉退费走线下商务流程</div>
              </div>
            )}
          </Modal>
        </>
      )}

      {/* —— 机构配置 —— */}
      {tab === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 18 }}>
          <div className="card" style={{ padding: 8, alignSelf: 'start' }}>
            {SUBTABS.map((s, i) => (
              <div key={s} className={'cfg-sub' + (sub === i ? ' on' : '')} onClick={() => setSub(i)}>
                {s}
              </div>
            ))}
          </div>
          <div>
            {sub === 0 && (
              <div className="fm-card" style={{ margin: 0 }}>
                <div className="fh">LLM 配置</div>
                <div className="radio-list" style={{ padding: '6px 0 14px' }}>
                  <div className="radio-opt on">
                    <div className="rd" />
                    <div>
                      <div className="rt">平台默认</div>
                      <div className="rs">使用平台统一模型与额度</div>
                    </div>
                  </div>
                  <div className="radio-opt" style={{ opacity: 0.5, cursor: 'not-allowed' }} title="暂未开放">
                    <div className="rd" />
                    <div>
                      <div className="rt">自配厂商 · 暂未开放</div>
                      <div className="rs">机构自有 API Key 接入（敬请期待）</div>
                    </div>
                  </div>
                </div>
                <div>
                  <button className="btn btn-primary btn-sm" onClick={() => toast('已保存')}>保存</button>
                </div>
              </div>
            )}
            {sub === 1 && (
              <div className="fm-card" style={{ margin: 0 }}>
                <div className="fh">联网配置</div>
                <div className="fm-row" style={{ borderTop: 'none' }}>
                  <div className="lab">允许联网检索</div>
                  <div className="ctl" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className={'switch' + (net ? ' on' : '')} onClick={() => { setNet((n) => !n); toast(net ? '已关闭联网检索' : '已开启联网检索'); }} />
                    <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>开启后,知识库未命中时可联网补充检索（标注来源）· 开关即时生效。</span>
                  </div>
                </div>
              </div>
            )}
            {/* 0613-2：微信配置改为「公众号 / 支付」分区卡片 + 后台标准 + 结构化限制提示 */}
            {sub === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="fm-card" style={{ margin: 0 }}>
                  {/* 0614：用途说明改行内灰色小号字（去单独大字行）；公众号为必填 */}
                  <div className="fh">
                    微信公众号<span className="req">*</span>
                    <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: 12, marginLeft: 8 }}>用于微信登录 / 网页授权（自动带回头像 · 昵称 · 性别 · 地区），必填</span>
                    <span className="tag-s tag-indigo" style={{ marginLeft: 8 }}>已配置</span>
                  </div>
                  <div className="fm-row">
                    <div className="lab">公众号 AppID</div>
                    <div className="ctl"><TextInput defaultValue="wx0123456789abcdef" style={{ maxWidth: 320 }} /></div>
                  </div>
                  <div className="fm-row">
                    <div className="lab">AppSecret</div>
                    <div className="ctl"><TextInput defaultValue="••••••••••••••6c2e" style={{ maxWidth: 320 }} /></div>
                  </div>
                  <div className="fm-row">
                    <div className="lab">网页授权回调地址</div>
                    <div className="ctl"><TextInput defaultValue="ai-book-ask-mobile-h5.zhangyuqing.top" style={{ maxWidth: 380 }} /></div>
                  </div>
                  <ul className="wx-lim">
                    <li>须为「已认证服务号」，订阅号不支持网页授权获取用户信息。</li>
                    <li>回调地址须与公众号后台配置完全一致，并包含协议与实际回调路径。</li>
                    <li>AppSecret 仅在公众号后台可见，重置后需同步更新此处。</li>
                  </ul>
                  <div style={{ marginTop: 4 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => toast('已保存公众号配置')}>保存</button>
                  </div>
                </div>

                {/* 5.2:微信开放平台——非微信浏览器扫码登录 / PC 扫码支付依赖,补充配置 */}
                <div className="fm-card" style={{ margin: 0 }}>
                  <div className="fh">
                    微信开放平台<span className="req">*</span>
                    <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: 12, marginLeft: 8 }}>用于非微信浏览器的扫码登录与 PC 扫码支付，必填（外部浏览器打开时依赖）</span>
                    <span className="tag-s tag-indigo" style={{ marginLeft: 8 }}>已配置</span>
                  </div>
                  <div className="fm-row">
                    <div className="lab">网站应用 AppID</div>
                    <div className="ctl"><TextInput defaultValue="wxopen0123456789ab" style={{ maxWidth: 320 }} /></div>
                  </div>
                  <div className="fm-row">
                    <div className="lab">AppSecret</div>
                    <div className="ctl"><TextInput defaultValue="••••••••••••9d4f" style={{ maxWidth: 320 }} /></div>
                  </div>
                  <div className="fm-row">
                    <div className="lab">授权回调地址</div>
                    <div className="ctl"><TextInput defaultValue="ai-book-ask-mobile-h5.zhangyuqing.top" style={{ maxWidth: 380 }} /></div>
                  </div>
                  <ul className="wx-lim">
                    <li>用于「非微信浏览器」打开时唤起微信扫码登录（开放平台网站应用 / 二维码授权）。</li>
                    <li>须在微信开放平台创建「网站应用」并通过审核，与公众号为不同 AppID。</li>
                    <li>授权回调地址须与开放平台网站应用配置完全一致，并包含协议与实际回调路径。</li>
                  </ul>
                  <div style={{ marginTop: 4 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => toast('已保存微信开放平台配置')}>保存</button>
                  </div>
                </div>

                <div className="fm-card" style={{ margin: 0 }}>
                  {/* 0614：用途说明改行内灰色小号字；支付为必填 */}
                  <div className="fh">
                    微信支付<span className="req">*</span>
                    <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: 12, marginLeft: 8 }}>用于支付 / 退款 / 自动续费，必填（未配置前台无法下单）</span>
                    <span className="tag-s tag-indigo" style={{ marginLeft: 8 }}>已配置</span>
                  </div>
                  <div className="fm-row">
                    <div className="lab">商户号 MchID</div>
                    <div className="ctl"><TextInput defaultValue="1900012345" style={{ maxWidth: 320 }} /></div>
                  </div>
                  <div className="fm-row">
                    <div className="lab">APIv3 密钥</div>
                    <div className="ctl"><TextInput defaultValue="••••••••••••3a7f" style={{ maxWidth: 320 }} /></div>
                  </div>
                  <div className="fm-row">
                    <div className="lab">商户证书</div>
                    <div className="ctl">
                      <div className="upbox" style={{ maxWidth: 360 }} onClick={() => pickFile(ACCEPT.cert, (n) => toast('已选择 ' + n))}>
                        <Icon id="i-up" />
                        <div className="nowrap">apiclient_cert.pem（已上传 · 点击替换）</div>
                      </div>
                    </div>
                  </div>
                  <ul className="wx-lim">
                    <li>商户号须与上方公众号 AppID 完成「关联绑定」（JSAPI 支付 / 退款前置条件）。</li>
                    <li>需上传 API 证书 apiclient_cert.pem；APIv3 密钥在商户平台「API 安全」设置。</li>
                    <li>退款 / 自动续费依赖支付能力，未配置支付则前台无法下单。</li>
                  </ul>
                  <div style={{ marginTop: 4 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => toast('已保存微信支付配置')}>保存</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* —— 用量看板（配额进度重点 + 2×2） —— */}
      {tab === 3 && (
        <>
          <div className="dash-section-title">实时订阅与资源占用 <span className="dash-realtime-tag">实时</span><span className="dash-section-sub">· 不随时间筛选变化</span></div>
          <CurrentSubCard data={currentSubCard(subs)} showOwner={false} />
          {/* 0614：阈值预警短信演示（达 70/80/90/95% 给机构联系人发短信） */}
          <div className="quota-alert">
            <Icon id="i-warn" w={15} h={15} />
            <span>
              Token 本订阅周期消耗已达 <b>88%</b>，已向机构联系人（张三 · 13800138888）发送 <b>70% / 80%</b> 预警；KP 数与存储展示当前真实占用，Token 展示本周期不可回收消耗。
            </span>
          </div>
          <div className="grid2" style={{ marginTop: 16 }}>
            {/* 0714 #10：卡片标题去「（实时快照）」——分区标题已有「实时」标 */}
            <UsageCard
              title="内容存量"
              rows={[
                ['KP 当前占用', '40 个', '机构当前实际占用 = 自建 KP + 独立快照导入；实时同步导入不占 KP 名额。跨订阅延续，删除符合释放条件后才回收。'],
                ['已发 / 未发 / 下架', '30 / 8 / 2 个', '当前状态快照；仅已发布参与新用户检索。'],
                ['存储当前占用', '62 GB', '机构当前全部文件的真实存储占用，跨订阅延续；删除文件后回收。'],
              ]}
            />
            <UsageCard
              title="用户存量"
              rows={[
                ['累计 C 端', '1.25万 人', '开通至今注册用户数，按用户 ID 精确去重，不参与环比。'],
                ['当前会员', '860 人', '当前处于付费期或赠送 72 小时缓冲使用期的会员人数，实时快照。'],
              ]}
            />
          </div>
          <div className="dash-section-head" style={{ marginTop: 24 }}>
            <div className="dash-section-title" style={{ margin: 0 }}>区间运营分析 <span className="dash-section-sub">· {usageRange} · 指标随筛选联动</span></div>
            <RangePicker presets={['今日', '近 7 天', '30 天']} defaultActive={1} onChange={(r) => setUsageRange(r.label)} />
          </div>
          <div className="grid2" style={{ marginTop: 16 }}>
            <UsageCard
              title="活跃与内容使用"
              periodDays={usagePeriodDays}
              rows={[
                ['活跃用户', usage.active, `所选${usageRange}内登录或提问的用户，按用户 ID 精确去重。`],
                ['新增 C 端', usage.added, `所选${usageRange}内首次注册的用户数。`],
                ['区间提问', usage.questions, `所选${usageRange}内新增提问条数，包含追问。`],
              ]}
            />
            <UsageCard
              title="商业化与 LLM 消耗"
              periodDays={usagePeriodDays}
              rows={[
                ['区间 GMV', usage.gmv, `所选${usageRange}内已支付会员与永享订单金额。`],
                ['付费用户', usage.payUsers, `所选${usageRange}内产生有效支付的用户，按用户 ID 精确去重。`],
                ['Token 消耗量', usage.token, `所选${usageRange}内平台默认 LLM 输入与输出 token 消耗；属于不可回收消耗量。`],
                ['调用次数', usage.calls, `所选${usageRange}内模型请求次数。`],
                ['平均响应', usage.response, `所选${usageRange}内从请求到首字返回的平均耗时。`],
              ]}
            />
          </div>
          <div className="unit-note">{UNIT_NOTE}</div>
        </>
      )}

      {/* —— 品牌外观（0613-2：canvas 真实智能取色） —— */}
      {tab === 4 && (
        <div className="fm-card">
          <div className="fm-row" style={{ borderTop: 'none' }}>
            <div className="lab">机构 Logo</div>
            <div className="ctl" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg,${primary},${secondary})` }} />
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => pickImageColor((p, s, name) => { setPrimary(p); setSecondary(s); toast(`已上传 ${name} · 智能取色 ${p} / ${s}`); })}
              >
                <Icon id="i-up" w={14} h={14} />
                上传 Logo（智能取色）
              </button>
            </div>
          </div>
          <div className="fm-row">
            <div className="lab">主视觉色</div>
            <div className="ctl" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input className="color-dot" type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} />
              <span className="mono" style={{ fontSize: 13 }}>{primary}</span>
            </div>
          </div>
          <div className="fm-row">
            <div className="lab">辅助视觉色</div>
            <div className="ctl" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input className="color-dot" type="color" value={secondary} onChange={(e) => setSecondary(e.target.value)} />
              <span className="mono" style={{ fontSize: 13 }}>{secondary}</span>
            </div>
          </div>
          <div className="fm-row">
            <div className="lab">渐变预览</div>
            <div className="ctl">
              {/* 0614：渐变预览整体缩小，球 / 条更紧凑 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', flex: 'none', background: `radial-gradient(120% 120% at 30% 25%,#fff,rgba(255,255,255,0) 42%),linear-gradient(150deg,${primary},${secondary})` }} />
                <div style={{ flex: 1, maxWidth: 200, height: 26, borderRadius: 8, background: `linear-gradient(90deg,${primary},${secondary})` }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>主→辅渐变应用于该机构前台品牌球与主强调色。上传 Logo 后将自动读取像素主色 / 次色填充，可再手动微调。</div>
            </div>
          </div>
          <div style={{ marginTop: 6 }}>
            <button className="btn btn-primary btn-sm" onClick={() => toast('已保存品牌外观')}>保存</button>
          </div>
        </div>
      )}
    </>
  );
}
