// 平台主控台导出 spec（0714）——纯函数，视图与 docs/export-templates 模板生成共用。
// 须保持 node 可运行：不 import react / .tsx / css / window；跨包运行时依赖走带 .ts 后缀的相对路径。
import type { ExportSpec } from '@aba/ui-admin';
import { platformDaily, platformSnapshot, rangeMetrics } from '../../../../packages/mock/src/data/dashboard.ts';
import { compareMetric, comparisonPeriodLabel, currentPeriodLabel } from '../../../../packages/mock/src/rules.ts';

export interface DashboardExportArgs {
  /** 机构范围（下拉当前选中） */
  org?: string;
  days?: number;
  rangeLabel?: string;
  /** 自定义区间起止（预设区间可不传，按 days 折算） */
  start?: Date;
  end?: Date;
}

const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** 环比列文案：可比 → 带 ↑/↓/— 方向箭头 + ±x.x%；不可比（上期为 0）→ 规则文案 */
const deltaText = (cur: number, prev: number) => {
  const c = compareMetric(cur, prev, 'count');
  if (!c.comparable) return c.label;
  const v = c.value ?? 0;
  if (v > 0) return `↑ +${v.toFixed(1)}%`;
  if (v < 0) return `↓ -${Math.abs(v).toFixed(1)}%`;
  return '— 持平';
};

export function buildDashboardSpec(args: DashboardExportArgs = {}): ExportSpec {
  const { org = '全部机构', days = 7, rangeLabel = '近 7 天' } = args;
  // 区间起止：自定义时用传入值，预设按 今天-(days-1) ~ 今天 折算
  const end = args.end ?? new Date();
  const start = args.start ?? new Date(end.getTime() - (Math.max(days, 1) - 1) * 86400000);
  const scope = org === '全部机构' ? '全平台' : org;
  const cur = rangeMetrics(platformDaily, days);
  const prev = rangeMetrics(platformDaily, days, days);
  const chartSlice = days <= 1 ? platformDaily.slice(-7) : cur.slice;

  return {
    context: {
      scope: '全域',
      business: '主控台',
      filters: [['机构范围', org]],
      period: { label: rangeLabel, start: fmtDate(start), end: fmtDate(end) },
    },
    sheets: [
      {
        name: '实时总览',
        title: '平台主控台 · 实时总览',
        subtitle: `${scope} · 截至导出时刻的实时快照，不参与环比`,
        kind: 'realtime',
        headers: ['指标', '数值', '单位', '统计口径'],
        rows: [
          ['入驻机构数', platformSnapshot.orgs, '家', '已创建且未删除'],
          ['累计用户', platformSnapshot.totalUsers, '人', '按用户 ID 精确去重'],
          ['累计 GMV', platformSnapshot.totalGmv, '元', '历史已支付订单'],
          ['净 GMV', platformSnapshot.totalGmv - 18100, '元', '累计 GMV - 成功退款'],
          ['提问总量', platformSnapshot.totalQuestions, '条', '历史累计含追问'],
        ],
        widths: [22, 18, 12, 42],
      },
      {
        name: '经营分析',
        title: '平台主控台 · 经营分析',
        subtitle: `${scope} · 当前区间 ${currentPeriodLabel(days)} · ${comparisonPeriodLabel(days)}`,
        kind: 'range',
        headers: ['数据类型', '指标或日期', '数值', '单位', '较上一周期', '统计口径'],
        rows: [
          ['KPI', '活跃用户', cur.activeUsers, '人', deltaText(cur.activeUsers, prev.activeUsers), '区间内按用户 ID 去重'],
          ['KPI', '新增会员', cur.newMembers, '人', deltaText(cur.newMembers, prev.newMembers), '历史首次开通，按用户 ID 去重；续费/回流不计入'],
          ['KPI', '续费率', `${cur.renewRate.toFixed(1)}%`, '—', `${(cur.renewRate - prev.renewRate).toFixed(1)} 个百分点`, '到期完成续费 ÷ 到期会员'],
          ['KPI', '回流会员', cur.reflow, '人', deltaText(cur.reflow, prev.reflow), '过期后重新开通，按用户 ID 去重；不算新增/续费'],
          ['KPI', '区间 GMV', cur.gmv, '元', deltaText(cur.gmv, prev.gmv), '区间已支付（待支付/已失效不计入）'],
          ['KPI', '区间提问数', cur.questions, '条', deltaText(cur.questions, prev.questions), '含追问'],
          ...chartSlice.map((d) => ['趋势', d.mmdd, d.questions, '条', '—', days <= 1 ? '小时趋势展示近7日演示数据' : '自然日趋势']),
        ],
        widths: [12, 20, 16, 10, 22, 40],
      },
    ],
  };
}
