import { useState } from 'react';
import { Icon, toast } from '@aba/ui';
import { LineChart, RangePicker, Dropdown, InfoDot, exportWorkbook, fmtCn, UNIT_NOTE } from '@aba/ui-admin';
import { compareMetric, comparisonPeriodLabel, metricHelp, orgOptionValue, PLATFORM_ORGS, platformDaily, platformSnapshot, platformOrgRole, rangeMetrics } from '@aba/mock';
import { applyOrgOverrides, useOrgTree } from '../stores/orgTree';
import { buildDashboardSpec } from '../exports/dashboard';

// 平台后台 · 主控台（0609 方案 1：实时总览 + 经营分析 分区）
// 0614b：数值统一中文万进制（fmtCn），KPI 显单位后缀，页脚加单位规范说明
// 0714：#5.1 机构下拉改用机构主数据全量（父机构带后缀；选中父机构显示「已汇总子机构」口径说明行）；
//       导出迁移到 exports/dashboard.ts spec 纯函数（与 docs/export-templates 模板同源）。
export function Dashboard() {
  const [days, setDays] = useState(7);
  const [rangeLabel, setRangeLabel] = useState('近 7 天');
  const [range, setRange] = useState<{ start?: Date; end?: Date }>({});
  const [org, setOrg] = useState('全部机构');
  // 机构主数据（应用「子机构改父 / 取消关联」层级覆盖），父机构口径与机构管理一致
  const overrides = useOrgTree((s) => s.parentOverrides);
  const orgs = applyOrgOverrides(PLATFORM_ORGS, overrides);
  // 下拉选项文案：父机构带「（父机构）」后缀（基于覆盖后的机构树实时判定）
  const orgLabel = (name: string) => {
    const o = orgs.find((x) => x.name === name);
    return o && platformOrgRole(o, orgs) === 'parent' ? `${name}（父机构）` : name;
  };
  const selected = orgs.find((o) => o.name === org);
  // 选中父机构 → 汇总口径 = 父机构自身 + 全部子机构（mock 数值不变，说明行到位即可）
  const childNames = selected && platformOrgRole(selected, orgs) === 'parent' ? orgs.filter((o) => o.parentId === selected.id).map((o) => o.name) : [];
  const scope = org === '全部机构' ? '全平台' : org;
  const cur = rangeMetrics(platformDaily, days);
  const prev = rangeMetrics(platformDaily, days, days);
  const n = fmtCn;
  const chartSlice = days <= 1 ? platformDaily.slice(-7) : cur.slice;
  const periodKind = days <= 1 ? 'today' as const : 'range' as const;

  // 0722：支持率值指标（unit='rate' 时环比按「个百分点」展示）
  const Delta = ({ c, p, unit = 'count' }: { c: number; p: number; unit?: 'count' | 'rate' }) => {
    const comparison = compareMetric(c, p, unit);
    if (!comparison.comparable) return <div className="delta">{comparison.label}</div>;
    const v = comparison.value ?? 0;
    const up = v >= 0;
    return (
      <div className={'delta ' + (up ? 'up' : 'down')}>
        <span style={up ? undefined : { display: 'inline-flex', transform: 'rotate(180deg)' }}>
          <Icon id="i-up" w={11} h={11} />
        </span>
        {Math.abs(v).toFixed(1)}{unit === 'rate' ? ' 个百分点' : '%'} 较上一周期 <span className="period-compare">{comparisonPeriodLabel(days)}</span>
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
          {/* 0715 #6：收起态默认文案改回「全部机构」（首项即全平台口径）；选项首项、state / scope 判断值不变 */}
          <Dropdown label="全部机构" options={['全部机构', ...orgs.map((o) => orgLabel(o.name))]} onSelect={(v) => setOrg(orgOptionValue(v))} style={{ minWidth: 190 }} />
          <button className="btn btn-ghost btn-sm" onClick={() => { void exportWorkbook(buildDashboardSpec({ org, days, rangeLabel, start: range.start, end: range.end })); toast('正在导出 报表'); }}>
            <Icon id="i-dl" w={14} h={14} />
            导出
          </button>
        </div>
      </div>

      {/* 0714 #5.1：选中父机构时显示汇总口径说明（父机构自身 + 全部子机构） */}
      {childNames.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 12px', padding: '8px 12px', background: 'var(--indigo-soft)', border: '1px solid var(--line)', borderRadius: 10, fontSize: 12.5, color: 'var(--indigo-ink)' }}>
          <Icon id="i-building" w={14} h={14} />
          <span>「{org}」为父机构，以下数据已汇总子机构：{childNames.join('、')}（口径 = 父机构自身 + 全部子机构）</span>
        </div>
      )}

      {/* 实时总览（累计 / 存量，不随时间筛选变化） */}
      <div className="dash-section-title">
        实时总览
        <span className="dash-realtime-tag">实时</span>
        <span className="dash-section-sub">· {scope}截至今日的累计 / 存量数据，不随下方时间筛选变化</span>
      </div>
      {/* 0614：单行 5 列（含净 GMV），避免末卡换行后向左展开的 tooltip 被裁切露出侧栏 */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
        <div className="kpi">
          <div className="lab">
            入驻机构数
            <InfoDot text={metricHelp('平台已创建且未删除的机构总数。', 'snapshot')} />
          </div>
          <div className="val">{n(platformSnapshot.orgs)}<span className="uu">家</span></div>
          <div className="ic" style={{ background: 'var(--indigo-soft)', color: 'var(--indigo-ink)' }}>
            <Icon id="i-building" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            累计用户
            <InfoDot text={metricHelp('全平台各机构 C 端注册用户数合计。去重：按用户 ID 去重。', 'snapshot')} />
          </div>
          <div className="val">{n(platformSnapshot.totalUsers)}<span className="uu">人</span></div>
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-user" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            累计 GMV（成交总额）
            <InfoDot text={metricHelp('全平台各机构已支付订单金额合计，资金 100% 进入各机构账户。', 'snapshot', 'money')} />
          </div>
          <div className="val">
            <span className="u">¥</span>
            {n(platformSnapshot.totalGmv)}
          </div>
          <div className="ic" style={{ background: 'var(--amber-soft)', color: 'var(--amber-ink)' }}>
            <Icon id="i-chart" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            净 GMV（扣退款）
            <InfoDot text={metricHelp('全平台累计 GMV 减累计成功退款金额，即各机构净收入合计；平台不参与分账。', 'snapshot', 'money')} />
          </div>
          <div className="val">
            <span className="u">¥</span>
            {n(platformSnapshot.totalGmv - 18100)}
          </div>
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-chart" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            提问总量
            <InfoDot text={metricHelp('全平台 C 端历史累计提问条数合计。', 'snapshot')} />
          </div>
          <div className="val">{n(platformSnapshot.totalQuestions)}<span className="uu">条</span></div>
          <div className="ic" style={{ background: 'var(--indigo-soft)', color: 'var(--indigo-ink)' }}>
            <Icon id="i-msg" w={16} h={16} />
          </div>
        </div>
      </div>

      {/* 经营分析（随时间筛选联动） */}
      <div className="dash-section-head">
        <div className="dash-section-title" style={{ margin: 0 }}>
          经营分析
          <span className="dash-section-sub">· {scope} · {rangeLabel}</span>
        </div>
        <RangePicker
          presets={['今日', '近 7 天', '30 天']}
          presetDays={[1, 7, 30]}
          defaultActive={1}
          onChange={(r) => {
            setDays(r.days);
            setRangeLabel(r.label);
            setRange({ start: r.start, end: r.end });
          }}
        />
      </div>
      {/* 0722：6 张 KPI 改 3 列两行，避免 4+2 断行不齐 */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="kpi">
          <div className="lab">
            活跃用户
            <InfoDot text={metricHelp('所选区间内有登录或提问行为的用户数；今日为截至当前时刻的 DAU。去重：按用户 ID 去重，跨天重复只计 1 人。', periodKind)} />
          </div>
          <div className="val">{n(cur.activeUsers)}<span className="uu">人</span></div>
          <Delta c={cur.activeUsers} p={prev.activeUsers} />
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
          <div className="val">{n(cur.newMembers)}<span className="uu">人</span></div>
          <Delta c={cur.newMembers} p={prev.newMembers} />
          <div className="ic" style={{ background: 'var(--amber-soft)', color: 'var(--amber-ink)' }}>
            <Icon id="i-user" w={16} h={16} />
          </div>
        </div>
        {/* 0722：平台侧补齐会员三分口径——续费率 / 回流会员（与机构后台数据看板口径一致） */}
        <div className="kpi">
          <div className="lab">
            续费率
            <InfoDot text={metricHelp('所选区间内到期且完成续费的会员数 ÷ 同区间到期会员数。去重：分子分母均按会员（用户 ID）去重。', periodKind, 'rate')} />
          </div>
          <div className="val">{cur.renewRate.toFixed(1)}<span className="uu">%</span></div>
          <Delta c={cur.renewRate} p={prev.renewRate} unit="rate" />
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-refresh" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            回流会员
            <InfoDot text={metricHelp('所选区间内开通会员、且开通时会员状态为已过期的用户数；不计入新增会员与续费率。去重：按用户 ID 去重。', periodKind)} />
          </div>
          <div className="val">{n(cur.reflow)}<span className="uu">人</span></div>
          <Delta c={cur.reflow} p={prev.reflow} />
          <div className="ic" style={{ background: 'var(--indigo-soft)', color: 'var(--indigo-ink)' }}>
            <Icon id="i-user" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            区间 GMV
            <InfoDot text={metricHelp('所选区间内全平台已支付订单金额合计；待支付、已失效订单不计入。', periodKind, 'money')} />
          </div>
          <div className="val">
            <span className="u">¥</span>
            {n(cur.gmv)}
          </div>
          <Delta c={cur.gmv} p={prev.gmv} />
          <div className="ic" style={{ background: 'var(--jade-soft)', color: 'var(--jade)' }}>
            <Icon id="i-chart" w={16} h={16} />
          </div>
        </div>
        <div className="kpi">
          <div className="lab">
            区间提问数
            <InfoDot text={metricHelp('所选区间内全平台 C 端新增提问条数，包含追问。', periodKind)} />
          </div>
          <div className="val">{n(cur.questions)}<span className="uu">条</span></div>
          <Delta c={cur.questions} p={prev.questions} />
          <div className="ic" style={{ background: 'var(--indigo-soft)', color: 'var(--indigo-ink)' }}>
            <Icon id="i-msg" w={16} h={16} />
          </div>
        </div>
      </div>
      <div className="chart-card">
        <div className="chart-head">
          <div className="chart-title">平台提问量趋势 · {days <= 1 ? '近 7 日' : rangeLabel}</div>
          <div className="legend">
            <span>
              <i style={{ background: 'var(--indigo)' }} />
              提问量
            </span>
          </div>
        </div>
        <LineChart
          cfg={{
            x: chartSlice.map((d) => d.mmdd),
            area: true,
            series: [{ name: '提问量', color: '#4B57E8', values: chartSlice.map((d) => d.questions) }],
          }}
        />
      </div>
      <div className="unit-note">{UNIT_NOTE}</div>
    </>
  );
}
