import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, DataGrid, type Col, InfoDot, SubPackDrawer, type PackForm } from '@aba/ui-admin';
import { SUBSCRIPTIONS, subStatus, type Subscription } from '@aba/mock';

// 平台超管 · 全域订阅订单（0615 新增）。
// B 端订阅订单（机构→平台）：跨机构汇总所有「订阅」；加油包不在列表展示，挂在各订阅下、经操作列「加油包」抽屉查看 / 新建。
// 与 C 端「全域订单」（终端用户→机构）两套体系，互不混淆。
const PLAN_CLS: Record<string, string> = { 基础版: 'tag-line', 专业版: 'tag-indigo', 旗舰版: 'tag-amber', 定制版: 'tag-jade' };
const ST_CLS: Record<string, string> = { 生效: 'ok', 未生效: 'none', 已过期: 'expired' };

const tidy = (n: number) => Number(n.toFixed(2));
const daysLeft = (end: string) => Math.ceil((new Date(end + 'T00:00:00').getTime() - Date.now()) / 86400000);
const expiringSoon = (s: Subscription) => s.type === '订阅' && subStatus(s) === '生效' && daysLeft(s.endDate) > 0 && daysLeft(s.endDate) <= 90;

export function Subscriptions() {
  const nav = useNavigate();
  const [subs, setSubs] = useState<Subscription[]>(SUBSCRIPTIONS);
  const [q, setQ] = useState('');
  const [org, setOrg] = useState('全部');
  const [plan, setPlan] = useState('全部');
  const [status, setStatus] = useState('全部');
  const [drawerSub, setDrawerSub] = useState<Subscription | null>(null);

  const orgNames = [...new Set(subs.map((s) => s.orgName))];
  // 某订阅名下的加油包
  const packsOf = (subId: string) => subs.filter((s) => s.type === '加油包' && s.parentId === subId);

  // 总额度（已用 / 上限，含加油包）：订阅基础额度 + 其名下「生效」加油包累加
  const totalQuotaText = (s: Subscription) => {
    const ps = packsOf(s.id).filter((p) => p.status === '生效');
    const sum = (k: 'kp' | 'storage' | 'token' | 'kpUsed' | 'storageUsed' | 'tokenUsed') =>
      ps.reduce((n, p) => n + (parseFloat((p[k] as string) ?? '0') || 0), 0);
    const t = (base: string | undefined, k: 'kp' | 'storage' | 'token' | 'kpUsed' | 'storageUsed' | 'tokenUsed') =>
      tidy((parseFloat(base ?? '0') || 0) + sum(k));
    return `${t(s.kpUsed, 'kpUsed')}/${t(s.kp, 'kp')} 个 · ${t(s.storageUsed, 'storageUsed')}/${t(s.storage, 'storage')} GB · ${t(s.tokenUsed, 'tokenUsed')}/${t(s.token, 'token')} 亿`;
  };

  // 列表只展示「订阅」，不混入加油包（#6）
  const rows = subs
    .filter(
      (s) =>
        s.type === '订阅' &&
        (!q || s.orgName.includes(q) || (s.owner ?? '').includes(q)) &&
        (org === '全部' || s.orgName === org) &&
        (plan === '全部' || s.plan === plan) &&
        (status === '全部' || subStatus(s) === status),
    )
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  // 抽屉内为该订阅新建加油包（即时生效、额度累加）
  const addPack = (form: PackForm) => {
    if (!drawerSub) return;
    const newPack: Subscription = {
      id: 'PKG2026061514' + String(30 + subs.length) + '-' + drawerSub.orgId.toUpperCase().slice(0, 3),
      orgId: drawerSub.orgId,
      orgName: drawerSub.orgName,
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
      status: '生效',
      createdAt: '2026-06-15 14:30:00',
      createdBy: 'superadmin',
    };
    setSubs((arr) => [newPack, ...arr]);
  };

  // 顶部汇总（kpi 风格，与主控台一致；#7：每个指标加说明 icon 悬浮面板）
  const stats = [
    { k: '订阅总数', v: subs.filter((s) => s.type === '订阅').length, unit: '笔', icon: 'i-doc', bg: 'var(--indigo-soft)', fg: 'var(--indigo-ink)', info: '平台全部机构的「订阅」订单总数（不含加油包；加油包单列统计）。统计区间：开通至今。' },
    { k: '生效', v: subs.filter((s) => s.type === '订阅' && subStatus(s) === '生效').length, unit: '笔', icon: 'i-check', bg: 'var(--jade-soft)', fg: 'var(--jade)', info: '当前处于「生效」状态（生效日 ≤ 今天 ≤ 到期日）的订阅数。同一机构同时仅一笔生效订阅，其与生效加油包共同决定机构当前可用额度。' },
    { k: '未生效', v: subs.filter((s) => s.type === '订阅' && subStatus(s) === '未生效').length, unit: '笔', icon: 'i-lock2', bg: 'var(--surface-warm)', fg: 'var(--ink-3)', info: '已创建但今天 < 生效日的订阅数（如提前预建的下一期续约），到生效日自动转生效，暂不计入当前可用额度。（状态由有效期自动判定：未生效 / 生效 / 已过期）' },
    { k: '加油包', v: subs.filter((s) => s.type === '加油包').length, unit: '个', icon: 'i-spark', bg: 'var(--amber-soft)', fg: 'var(--amber-ink)', info: '全部机构的加油包总数。加油包为期中加量，即时生效、额度累加到机构当前可用额度，不改变套餐。' },
    { k: '90 天内到期', v: subs.filter(expiringSoon).length, unit: '笔', icon: 'i-warn', bg: 'rgba(229,83,59,.12)', fg: 'var(--terra)', info: '生效中且距到期日不足 90 天的订阅数，需重点跟进续费。计算：到期日 − 今天 ∈ (0, 90] 天。' },
  ];

  const columns: Col<Subscription>[] = [
    { header: '订阅订单 ID', className: 'mono', cell: (s) => s.id, sortValue: (s) => s.id },
    { header: '机构', className: 'strong', cell: (s) => s.orgName, sortValue: (s) => s.orgName },
    { header: '套餐', cell: (s) => (s.plan ? <span className={'tag-s ' + (PLAN_CLS[s.plan] ?? 'tag-line')}>{s.plan}</span> : <span className="muted">—</span>), sortValue: (s) => s.plan ?? '' },
    { header: '总额度（已用 / 上限，含加油包）', className: 'mono', cell: (s) => totalQuotaText(s) },
    {
      header: '有效期',
      className: 'mono',
      sortValue: (s) => s.endDate,
      cell: (s) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {s.startDate} ~ {s.endDate}
          {expiringSoon(s) && <span className="tag-s tag-amber">{daysLeft(s.endDate)} 天后到期</span>}
        </span>
      ),
    },
    { header: '商务负责人', cell: (s) => (s.owner ? s.owner : <span className="muted">—</span>), sortValue: (s) => s.owner ?? '' },
    { header: '状态', sortValue: (s) => subStatus(s), cell: (s) => { const st = subStatus(s); return <span className={'fstat ' + (ST_CLS[st] ?? 'none')}><span className="dt" />{st}</span>; } },
    { header: '加油包', sortValue: (s) => packsOf(s.id).length, cell: (s) => { const n = packsOf(s.id).length; return n ? <span className="tag-s tag-amber">{n} 个</span> : <span className="muted">—</span>; } },
    { header: '创建时间', className: 'mono', cell: (s) => s.createdAt, sortValue: (s) => s.createdAt },
    { header: '操作', cell: (s) => <div className="op-cell"><span className="op" onClick={() => setDrawerSub(s)}>加油包</span> <span className="op" onClick={() => nav('/orgs/' + s.orgId)}>查看机构</span></div> },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">订阅订单</div>
        </div>
        <div className="pa">
          <button className="btn btn-ghost btn-sm" onClick={() => toast('导出订阅订单')}>
            <Icon id="i-dl" w={14} h={14} />
            导出
          </button>
        </div>
      </div>

      {/* 顶部汇总（kpi 风格，与主控台一致；含 90 天内到期 + 指标说明） */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginBottom: 18 }}>
        {stats.map((s) => (
          <div className="kpi" key={s.k}>
            <div className="lab">
              {s.k}
              <InfoDot text={s.info} />
            </div>
            <div className="val">
              {s.v}
              <span className="uu">{s.unit}</span>
            </div>
            <div className="ic" style={{ background: s.bg, color: s.fg }}>
              <Icon id={s.icon} w={16} h={16} />
            </div>
          </div>
        ))}
      </div>

      <div className="orders-filter">
        <Search placeholder="机构 / 商务负责人" minWidth={220} value={q} onChange={setQ} />
        <Dropdown label="机构" options={['全部', ...orgNames]} onSelect={setOrg} style={{ width: 160 }} />
        <Dropdown label="套餐" options={['全部', '基础版', '专业版', '旗舰版', '定制版']} onSelect={setPlan} />
        <Dropdown label="状态" options={['全部', '未生效', '生效', '已过期']} onSelect={setStatus} />
      </div>

      <DataGrid columns={columns} rows={rows} empty={{ title: '没有匹配的订阅订单' }} minWidth={1320} pageUnit="笔" />

      {/* 加油包右抽屉（与机构详情订阅记录同一组件、同一交互） */}
      <SubPackDrawer
        sub={drawerSub}
        packs={drawerSub ? packsOf(drawerSub.id) : []}
        onClose={() => setDrawerSub(null)}
        onAdd={addPack}
      />
    </>
  );
}
