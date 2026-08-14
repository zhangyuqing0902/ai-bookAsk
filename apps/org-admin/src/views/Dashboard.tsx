import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { LineChart, RangePicker, InfoDot, CurrentSubCard, MultiSelect, exportWorkbook, fmtCn, UNIT_NOTE } from '@aba/ui-admin';
import { compareMetric, comparisonPeriodLabel, metricHelp, orgDaily, orgSnapshot, rangeMetrics, MY_ORG_SUBS, MY_ORG_SUBS_EXPIRED, MY_ORG_SUBS_UNLIMITED, MY_ORG_SUBS_OVER, currentSubCard, lastExpiredSub, CURRENT_ORG, CHILD_ORGS, orgWeightOf, RANGE_SCOPE_NOTE } from '@aba/mock';
import { buildDashboardSpec } from '../exports/dashboard';
import { useOrgScope } from '../stores/orgScope';
import { useSubDemo, SUB_DEMO_LABEL, SUB_DEMO_SUBS, type SubDemo } from '../stores/subDemo';

// 0812-e：〔演示〕订阅状态——正常 / 全部过期（有过期史）/ 未开通（从未签约，无过期史）
// 0812-g：补「不限」态（不限版套餐：三项额度均不设上限）
// 0813-2：补「降档超额」态，且状态提升到共享 store（stores/subDemo.ts）——
//   配额是跨页面的机构级事实，这里切了 KP 列表必须同步，否则两个页面显示自相矛盾的额度。

// 机构后台 · 主控台（0609 方案 1：实时总览 + 经营分析 分区）
// 0614b：数值统一中文万进制（fmtCn），KPI 显单位后缀，页脚加单位规范说明
export function Dashboard() {
  const [days, setDays] = useState(7);
  const [rangeLabel, setRangeLabel] = useState('近 7 天');
  // 0806：父机构视角——机构多选筛选（默认全选＝现状数值）。绝对量按所选机构集合系数聚合，率类不缩放。
  const orgType = useOrgScope((s) => s.orgType);
  const isParent = orgType === 'parent';
  const ALL_ORGS = [CURRENT_ORG, ...CHILD_ORGS];
  const [orgs, setOrgs] = useState<string[]>(ALL_ORGS);
  // 0812：〔演示〕订阅状态切换——预览无生效套餐空态（上线后由真实订阅数据决定，非用户可切换项）
  // 0812-e：由两态扩为三态，补「未开通」（从未签过订阅，无过期史）——与「全部过期」的空态文案 / 引导不同
  // 0813-2：改用共享 store，五态（补「降档超额」），与 KP 列表联动
  const subDemo = useSubDemo((s) => s.subDemo);
  const setSubDemo = useSubDemo((s) => s.setSubDemo);
  const subsInUse = SUB_DEMO_SUBS[subDemo];
  const w = isParent ? orgWeightOf(orgs) : 1;
  const s = (v: number) => Math.round(v * w);
  const cur = rangeMetrics(orgDaily, days);
  const prev = rangeMetrics(orgDaily, days, days);
  const n = fmtCn;
  const chartSlice = days <= 1 ? orgDaily.slice(-7) : cur.slice;
  const periodKind = days <= 1 ? 'today' as const : 'range' as const;

  const Delta = ({ c, p }: { c: number; p: number }) => {
    const comparison = compareMetric(c, p, 'count');
    if (!comparison.comparable) return <div className="delta">{comparison.label}</div>;
    const v = comparison.value ?? 0;
    const up = v >= 0;
    return (
      <div className={'delta ' + (up ? 'up' : 'down')}>
        <span style={up ? undefined : { display: 'inline-flex', transform: 'rotate(180deg)' }}>
          <Icon id="i-up" w={11} h={11} />
        </span>
        {Math.abs(v).toFixed(1)}% 较上一周期 <span className="period-compare">{comparisonPeriodLabel(days)}</span>
      </div>
    );
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">主控台</div>
        </div>
        <div className="pa">
          {/* 0812：〔演示〕订阅状态切换——预览「无生效套餐」空态（样式复用顶栏机构类型 seg）；0812-e 扩为三态 */}
          <div className="org-type-seg" title="仅用于演示 · 预览订阅正常 / 不限 / 全部过期 / 未开通 / 降档超额五种状态的展示（非上线功能）">
            <span className="ots-tag">演示 · 订阅状态</span>
            {(Object.keys(SUB_DEMO_LABEL) as SubDemo[]).map((k) => (
              <b key={k} className={subDemo === k ? 'on' : ''} onClick={() => setSubDemo(k)}>{SUB_DEMO_LABEL[k]}</b>
            ))}
          </div>
          {/* 0806：父机构视角——「机构」多选筛选（默认全选，支持跨机构任意组合；联动下方全部指标） */}
          {isParent && <MultiSelect label="机构" options={[`${CURRENT_ORG}（父机构）`, ...CHILD_ORGS]} value={orgs} onChange={setOrgs} style={{ width: 240 }} />}
          {/* 0714：导出走 spec 纯函数（exports/dashboard.ts），与 docs 模板脚本同源；机构名由 spec 内 MY_ORG 提供 */}
          <button className="btn btn-ghost btn-sm" onClick={() => { void exportWorkbook(buildDashboardSpec({ days, rangeLabel, orgs: isParent ? orgs : undefined, snapshot: { ...orgSnapshot, totalGmv: s(orgSnapshot.totalGmv), currentMembers: s(orgSnapshot.currentMembers), totalRegistered: s(orgSnapshot.totalRegistered) }, sub: currentSubCard(subsInUse), cur: { ...cur, activeUsers: s(cur.activeUsers), newMembers: s(cur.newMembers), gmv: s(cur.gmv), questions: s(cur.questions) }, prev: { ...prev, activeUsers: s(prev.activeUsers), newMembers: s(prev.newMembers), gmv: s(prev.gmv), questions: s(prev.questions) }, chartSlice })); toast('正在导出 报表'); }}>
            <Icon id="i-dl" w={14} h={14} />
            导出
          </button>
        </div>
      </div>

      {/* 0615 / 0615-6：机构配额前置——进后台先看「当前订阅 + 额度是否吃紧」，再看经营数据；
          复用平台机构详情同款「当前生效订阅卡」（机构侧只读：不显商务负责人 / 不显新建订阅按钮） */}
      {/* 0806-2：订阅是机构级合同（各机构各自签、配额上限不同、聚合无意义）——父机构视角固定显示本机构订阅，
          与下方机构筛选解耦；右上角灰字注明，避免「选了子机构却显示父机构套餐」的误读 */}
      <div style={{ position: 'relative' }}>
        {isParent && (
          <span className="sub-scope-note">本机构（{CURRENT_ORG}）订阅 · 不随机构筛选变化</span>
        )}
        <CurrentSubCard data={currentSubCard(subsInUse)} lastExpired={lastExpiredSub(subsInUse)} showOwner={false} />
      </div>

      {/* 实时总览（累计 / 存量，不随时间筛选变化） */}
      <div className="dash-section-title">
        实时总览
        <span className="dash-realtime-tag">实时</span>
        <span className="dash-section-sub">· 截至今日的累计 / 存量数据，不随下方时间筛选变化</span>
      </div>
      {/* 0614：实时总览聚焦「钱 + 规模」——钱(累计GMV / 累计退款 / 净GMV) 连在一起，再规模(会员 / 注册)；去掉累计提问(归数据看板·提问分析)。
          单行 5 列：避免 5 卡换行后末卡落到第二行左列、其向左展开的 tooltip 被 admin-body 横向裁切而露出侧栏（修复累计退款 tooltip 遮挡） */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
        <div className="kpi">
          <div className="lab">
            累计 GMV（成交总额）
            <InfoDot text={metricHelp('历史累计已支付订单实付金额合计（会员 + 永享；兑换码计 0）；待支付、已失效订单不计入。', 'snapshot', 'money')} />
          </div>
          <div className="val">
            <span className="u">¥</span>
            {n(s(orgSnapshot.totalGmv))}
          </div>
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-chart" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            累计退款 / 退款率
            <InfoDot text={metricHelp('历史累计成功退款金额；退款率 = 退款金额 ÷ GMV。', 'snapshot', 'money')} />
          </div>
          <div className="val">
            <span className="u">¥</span>
            {n(s(1860))}
            <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 400, marginLeft: 6 }}>· 2.1%</span>
          </div>
          <div className="ic" style={{ background: 'rgba(229,83,59,.12)', color: 'var(--terra)' }}>
            <Icon id="i-dl" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            净 GMV（扣退款）
            <InfoDot text={metricHelp('累计 GMV 减累计成功退款金额，反映实际到账净收入。', 'snapshot', 'money')} />
          </div>
          <div className="val">
            <span className="u">¥</span>
            {n(s(orgSnapshot.totalGmv - 1860))}
          </div>
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-chart" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            当前会员数
            <InfoDot text={metricHelp('当前处于付费期或赠送 72 小时缓冲使用期的会员人数，实时快照；缓冲期内权益仍生效，故计入。去重：按用户 ID 去重。', 'snapshot')} />
          </div>
          <div className="val">{n(s(orgSnapshot.currentMembers))}<span className="uu">人</span></div>
          <div className="ic" style={{ background: 'var(--amber-soft)', color: 'var(--amber-ink)' }}>
            <Icon id="i-user" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            累计注册用户
            <InfoDot text={metricHelp('本机构 C 端注册用户数。去重：按用户 ID 去重。', 'snapshot')} />
          </div>
          <div className="val">{n(s(orgSnapshot.totalRegistered))}<span className="uu">人</span></div>
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-user" w={16} h={16} />
          </div>
        </div>
      </div>

      {/* 经营分析（随时间筛选联动） */}
      <div className="dash-section-head">
        <div className="dash-section-title" style={{ margin: 0 }}>
          经营分析
          {/* 0813-2：区间口径写进副标题——今日为实时，近 N 天为截至昨日的完整自然日 */}
          <span className="dash-section-sub">· {rangeLabel} · {days > 1 ? RANGE_SCOPE_NOTE : '今日为 00:00 至当前时刻，对比昨日同时段'}</span>
        </div>
        <RangePicker
          presets={['今日', '近 7 天', '30 天']}
          presetDays={[1, 7, 30]}
          defaultActive={1}
          onChange={(r) => {
            setDays(r.days);
            setRangeLabel(r.label);
          }}
        />
      </div>
      <div className="kpi-row">
        <div className="kpi">
          <div className="lab">
            活跃用户
            <InfoDot text={metricHelp('所选区间内有登录或提问行为的用户数；今日为截至当前时刻的 DAU。去重：按用户 ID 去重，跨天重复只计 1 人。', periodKind)} />
          </div>
          <div className="val">{n(s(cur.activeUsers))}<span className="uu">人</span></div>
          <Delta c={s(cur.activeUsers)} p={s(prev.activeUsers)} />
          <div className="ic" style={{ background: 'var(--indigo-soft)', color: 'var(--indigo-ink)' }}>
            <Icon id="i-grid" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            新增会员
            {/* 0722：口径定稿——历史首次开通；续费、回流均不计入 */}
            <InfoDot text={metricHelp('所选区间内历史首次开通会员的用户数；续费与回流不计入。去重：按用户 ID 去重。', periodKind)} />
          </div>
          <div className="val">{n(s(cur.newMembers))}<span className="uu">人</span></div>
          <Delta c={s(cur.newMembers)} p={s(prev.newMembers)} />
          <div className="ic" style={{ background: 'var(--amber-soft)', color: 'var(--amber-ink)' }}>
            <Icon id="i-user" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            区间 GMV
            <InfoDot text={metricHelp('所选区间内已支付订单金额合计（会员 + 永享）；待支付、已失效订单不计入。', periodKind, 'money')} />
          </div>
          <div className="val">
            <span className="u">¥</span>
            {n(s(cur.gmv))}
          </div>
          <Delta c={s(cur.gmv)} p={s(prev.gmv)} />
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-chart" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            区间提问数
            <InfoDot text={metricHelp('所选区间内 C 端新增提问条数，包含追问。', periodKind)} />
          </div>
          <div className="val">{n(s(cur.questions))}<span className="uu">条</span></div>
          <Delta c={s(cur.questions)} p={s(prev.questions)} />
          <div className="ic" style={{ background: 'var(--indigo-soft)', color: 'var(--indigo-ink)' }}>
            <Icon id="i-msg" w={16} h={16} />
          </div>
        </div>
      </div>
      <div className="chart-card">
        <div className="chart-head">
          <div className="chart-title">活跃与会员趋势 · {days <= 1 ? '近 7 日' : rangeLabel}</div>
          <div className="legend">
            <span>
              <i style={{ background: 'var(--indigo)' }} />
              DAU
            </span>
            <span>
              <i style={{ background: 'var(--amber)' }} />
              新增会员
            </span>
          </div>
        </div>
        <LineChart
          cfg={{
            x: chartSlice.map((d) => d.mmdd),
            area: true,
            series: [
              { name: 'DAU', color: '#4B57E8', values: chartSlice.map((d) => s(d.dau)) },
              { name: '新增会员', color: '#FF6F55', dash: true, values: chartSlice.map((d) => s(d.newMembers)) },
            ],
          }}
        />
      </div>
      <div className="unit-note">{UNIT_NOTE}</div>
    </>
  );
}
