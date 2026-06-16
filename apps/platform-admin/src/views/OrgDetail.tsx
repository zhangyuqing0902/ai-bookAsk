import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { Dropdown, TextInput, InfoDot, CurrentSubCard, DateTimeRangeField, Modal, ConfirmDialog, SubPackDrawer, type PackForm, DataGrid, type Col, pickFile, pickImageColor, ACCEPT, UNIT_NOTE } from '@aba/ui-admin';
import { MY_ORG_SUBS, currentSubCard, subStatus, type Subscription } from '@aba/mock';

// 0613-2：套餐 / 配额独立成 Tab；用量看板重排（配额进度重点 + 2×2）；微信配置分区卡片
// 0615：「套餐 / 配额」Tab 改造为订阅闭环（当前生效订阅只读 + 订阅记录 + 新建续签 / 升级）
const TABS = ['基本资料', '订阅 / 配额', '机构配置', '用量看板', '品牌外观'];
const SUBTABS = ['LLM 配置', '联网配置', '微信配置'];

// 机构套餐预设（KP 数 / 存储 GB / 月度 Token 亿）；0614c：Token 值只填数字、单位「亿」放后缀 / 单位标（与 KP「个」、存储「GB」一致）；定制版手填
const PLAN_NAMES = ['基础版', '专业版', '旗舰版', '定制版'];
const PLANS: Record<string, { kp: string; storage: string; token: string }> = {
  基础版: { kp: '10', storage: '20', token: '0.5' },
  专业版: { kp: '50', storage: '100', token: '2' },
  旗舰版: { kp: '200', storage: '500', token: '10' },
  定制版: { kp: '', storage: '', token: '' },
};
const PLAN_CLS_D: Record<string, string> = { 基础版: 'tag-line', 专业版: 'tag-indigo', 旗舰版: 'tag-amber', 定制版: 'tag-jade' };
const SUB_ST_CLS: Record<string, string> = { 生效: 'ok', 未生效: 'none', 已过期: 'expired' };

// 用量看板卡片（顶部色条 + 标题 + 指标行分隔 + 数值强调）
function UsageCard({ title, rows }: { title: string; rows: [string, string, string][] }) {
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
              <InfoDot text={info} />
            </span>
            <span className="uc-v mono">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 平台后台 · 机构详情
export function OrgDetail() {
  const nav = useNavigate();
  const [tab, setTab] = useState(0);
  const [sub, setSub] = useState(0);
  const [net, setNet] = useState(true);
  const [plan, setPlan] = useState('专业版');
  const [quota, setQuota] = useState(PLANS['专业版']);
  const [custom, setCustom] = useState(false); // 0614：手动改动配额后偏离套餐预设 → 标记「自定义套餐」
  const [primary, setPrimary] = useState('#4B57E8');
  const [secondary, setSecondary] = useState('#8B6CF6');

  const matchesPlan = (q: { kp: string; storage: string; token: string }, name: string) =>
    name !== '定制版' && q.kp === PLANS[name].kp && q.storage === PLANS[name].storage && q.token === PLANS[name].token;
  const selectPlan = (name: string) => {
    setPlan(name);
    setCustom(false);
    setQuota(PLANS[name]);
  };
  // 0614：手动微调任一配额值 → 若偏离所选套餐预设，套餐标签自动变「自定义套餐」（消除"选了基础版却改了配额"的歧义）
  const editQuota = (patch: Partial<typeof quota>) => {
    const nq = { ...quota, ...patch };
    setQuota(nq);
    setCustom(plan !== '定制版' && !matchesPlan(nq, plan));
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
  // 0615-7：误建删除（仅"零用量、无加油包、非已过期"可删，保留服务 / 计费历史）
  const [delSub, setDelSub] = useState<Subscription | null>(null);
  const deletable = (s: Subscription) =>
    subStatus(s) !== '已过期' &&
    (parseFloat(s.kpUsed ?? '0') || 0) === 0 &&
    (parseFloat(s.storageUsed ?? '0') || 0) === 0 &&
    (parseFloat(s.tokenUsed ?? '0') || 0) === 0 &&
    packsOf(s.id).length === 0;
  const doDelete = () => {
    if (!delSub) return;
    setSubs((arr) => arr.filter((s) => s.id !== delSub.id && s.parentId !== delSub.id));
    setDelSub(null);
    toast('已删除订阅订单');
  };
  // 订阅维度筛选
  const [fPlan, setFPlan] = useState('全部');
  const [fOwner, setFOwner] = useState('全部');
  const [fStatus, setFStatus] = useState('全部');
  const owners = [...new Set(subs.filter((s) => s.type === '订阅').map((s) => s.owner).filter(Boolean))] as string[];
  const recRows = subs
    .filter(
      (s) =>
        s.type === '订阅' &&
        (fPlan === '全部' || s.plan === fPlan) &&
        (fOwner === '全部' || s.owner === fOwner) &&
        (fStatus === '全部' || subStatus(s) === fStatus),
    )
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)); // 默认按创建时间倒序

  const openNew = () => {
    setPlan('专业版');
    setCustom(false);
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
      setCustom(false);
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
        <span className="kpd-name">XX 出版社</span>
        <span className="tag-s tag-jade">正常</span>
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
            <div className="ctl"><TextInput defaultValue="XX 出版社" style={{ maxWidth: 320 }} /></div>
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
            <div className="ctl" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Dropdown label="无" options={['无', 'XX 出版集团']} style={{ width: 200 }} />
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>选填，仅顶级机构可作上级（集团→分社两层）</span>
            </div>
          </div>
          <div className="fm-row">
            <div className="lab">备注</div>
            <div className="ctl"><TextInput placeholder="选填" style={{ maxWidth: 420 }} /></div>
          </div>
          <div className="fm-row">
            <div className="lab">状态</div>
            <div className="ctl" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="tag-s tag-jade">正常</span>
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
            <Dropdown label="套餐" options={['全部', ...PLAN_NAMES]} onSelect={setFPlan} />
            <Dropdown label="商务负责人" options={['全部', ...owners]} onSelect={setFOwner} style={{ width: 150 }} />
            <Dropdown label="状态" options={['全部', '未生效', '生效', '已过期']} onSelect={setFStatus} />
          </div>
          <DataGrid columns={subCols} rows={recRows} empty={{ title: '暂无订阅订单' }} minWidth={1240} pageUnit="笔" />

          {/* 新建 / 复制 订阅弹窗（仅订阅） */}
          <Modal
            title="新建订阅"
            open={subModal}
            onClose={() => setSubModal(false)}
            width={520}
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
                    const on = !custom && plan === name;
                    return (
                      <div key={name} className={'sub-plan-row' + (on ? ' on' : '')} onClick={() => selectPlan(name)}>
                        <span className="spr-name">{name}</span>
                        <span className="spr-spec">{name === '定制版' ? '配额自定义' : `KP ${p.kp} 个 · 存储 ${p.storage} GB · Token ${p.token} 亿`}</span>
                        {on && <Icon id="i-check" w={15} h={15} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="fm-row">
              <div className="lab">额度 {custom && <span className="plan-badge custom">自定义</span>}</div>
              <div className="ctl" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><TextInput value={quota.kp} onChange={(e) => editQuota({ kp: e.target.value })} style={{ width: 84 }} /><span style={{ fontSize: 13, color: 'var(--ink-3)' }}>个</span></span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><TextInput value={quota.storage} onChange={(e) => editQuota({ storage: e.target.value })} style={{ width: 84 }} /><span style={{ fontSize: 13, color: 'var(--ink-3)' }}>GB</span></span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><TextInput value={quota.token} onChange={(e) => editQuota({ token: e.target.value })} style={{ width: 84 }} /><span style={{ fontSize: 13, color: 'var(--ink-3)' }}>亿</span></span>
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
            <div className="sub-tip" style={{ marginLeft: 106 }}>
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

          {/* 0615-7：误建删除二次确认（仅零用量、无加油包、非已过期的订阅可删） */}
          <ConfirmDialog
            open={!!delSub}
            danger
            title="删除订阅订单"
            confirmText="删除"
            desc={delSub ? <>确认删除订阅订单 <b>{delSub.id}</b>（{delSub.plan} · {delSub.startDate} ~ {delSub.endDate}）？该订单尚无任何用量消耗，删除后不可恢复。</> : undefined}
            onConfirm={doDelete}
            onClose={() => setDelSub(null)}
          />
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
                    <div className="lab">网页授权回调域名</div>
                    <div className="ctl"><TextInput defaultValue="ai-book-ask-mobile-h5.zhangyuqing.top" style={{ maxWidth: 380 }} /></div>
                  </div>
                  <ul className="wx-lim">
                    <li>须为「已认证服务号」，订阅号不支持网页授权获取用户信息。</li>
                    <li>回调域名须与公众号后台「设置与开发 → 网页授权域名」完全一致（不含 http:// 与路径）。</li>
                    <li>AppSecret 仅在公众号后台可见，重置后需同步更新此处。</li>
                  </ul>
                  <div style={{ marginTop: 4 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => toast('已保存公众号配置')}>保存</button>
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
          {/* 0615-6：用量看板顶部配额改用当前生效订阅卡（与订阅 Tab、机构后台主控台同款；此处不显商务负责人 / 新建按钮） */}
          <CurrentSubCard data={currentSubCard(subs)} showOwner={false} />
          {/* 0614：阈值预警短信演示（达 70/80/90/95% 给机构联系人发短信） */}
          <div className="quota-alert">
            <Icon id="i-warn" w={15} h={15} />
            <span>
              本月 Token 已用 <b>88%</b>，已于 06-12、06-13 向机构联系人（张三 · 138****8888）发送 <b>70% / 80%</b> 预警短信；达 <b>90% / 95%</b> 将再次提醒。配额可在「套餐 / 配额」调整。
            </span>
          </div>
          <div className="grid2" style={{ marginTop: 16 }}>
            <UsageCard
              title="活跃度"
              rows={[
                ['DAU', '1,240 人', '当日去重活跃用户(登录或提问)。统计区间：自然日 0:00 至当前。'],
                ['WAU', '5,600 人', '近 7 个自然日内去重活跃用户。统计区间：近 7 天滚动。'],
                ['MAU', '1.2万 人', '近 30 个自然日内去重活跃用户。统计区间：近 30 天滚动。'],
                ['累计 C 端', '1.25万 人', '该机构 C 端去重注册用户总数。统计区间：开通至今。'],
                ['新增 C 端', '320 人', '所选区间内首次注册的 C 端用户数。统计区间：随时间区间(默认今日)。'],
              ]}
            />
            <UsageCard
              title="内容"
              rows={[
                ['KP 总数', '40 个', '该机构已创建且未删除的 KP 总数(含已发/未发/已下架)。'],
                ['已发 / 未发 / 下架', '30 / 8 / 2 个', '按 KP 当前状态拆分。仅已发布参与 C 端检索。'],
                ['累计提问', '32万 条', 'C 端历史累计提问条数(含追问)。统计区间：开通至今。'],
              ]}
            />
          </div>
          <div className="grid2" style={{ marginTop: 16 }}>
            <UsageCard
              title="商业化"
              rows={[
                ['累计 GMV', '¥8.6万', '已支付订单金额合计(会员+永享)。统计区间：开通至今。'],
                ['当前会员', '860 人', '当前拥有有效会员权益的去重用户数。实时快照。'],
                ['永享订单', '540 单', '永享买断已支付订单数。统计区间：开通至今。'],
                ['付费转化', '6.9%', '付费用户 / 累计用户。统计区间：开通至今。'],
                ['退款金额', '¥1,860', '已成功退款金额合计。统计区间：开通至今。'],
                ['退款率', '2.1%', '退款金额 / 累计 GMV。'],
              ]}
            />
            <UsageCard
              title="LLM 用量（平台默认）"
              rows={[
                ['tokens', '0.3亿 token', '该机构消耗的平台默认 LLM token 数（单位统一为亿）。统计区间：近 7 天。'],
                ['调用次数', '3.2万 次', '模型被请求次数。统计区间：近 7 天。'],
                ['平均响应', '1.8s', '单次调用首字返回平均耗时。统计区间：近 7 天。'],
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
