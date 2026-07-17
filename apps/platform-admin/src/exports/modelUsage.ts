// 全域模型用量导出 spec（0714）——纯函数，视图与模板生成共用（node 可运行，约束同 dashboard.ts）。
import type { ExportSpec } from '@aba/ui-admin';
import { MODEL_USAGE_ORG_BASE, MODEL_USAGE_RANGE, MODEL_USAGE_TOTALS } from '../data/modelUsage.ts';

export interface ModelUsageExportArgs {
  org?: string;
  rangeLabel?: string;
}

const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function buildModelUsageSpec(args: ModelUsageExportArgs = {}): ExportSpec {
  const { org = '全部', rangeLabel = '近 7 天' } = args;
  const d = MODEL_USAGE_RANGE[rangeLabel] ?? MODEL_USAGE_RANGE['近 7 天'];
  const days = rangeLabel === '今日' ? 1 : rangeLabel === '30 天' ? 30 : 7;
  const end = new Date();
  const start = new Date(end.getTime() - (days - 1) * 86400000);
  const orgSeries = (MODEL_USAGE_ORG_BASE[org] ?? MODEL_USAGE_ORG_BASE['XX 出版社']).map((v) => Math.max(1, Math.round(v * d.orgFactor)));

  return {
    context: {
      scope: '全域',
      business: '模型用量',
      filters: [['机构范围', org], ['时间区间', rangeLabel]],
      period: { label: rangeLabel, start: fmtDate(start), end: fmtDate(end) },
    },
    sheets: [
      {
        name: '实时总览',
        title: '平台全域模型用量 · 实时总览',
        subtitle: '平台开通至今累计，实时快照、不参与环比',
        kind: 'realtime',
        headers: ['指标', '数值', '单位', '统计口径'],
        rows: [
          ['累计 tokens', MODEL_USAGE_TOTALS.tokens, 'token', '平台默认 LLM 输入+输出累计'],
          ['累计调用次数', MODEL_USAGE_TOTALS.calls, '次', '平台默认 LLM 被请求总次数'],
        ],
        widths: [24, 20, 14, 42],
      },
      {
        name: '区间指标',
        title: `平台全域模型用量 · 区间指标（${rangeLabel}）`,
        subtitle: `机构范围=${org}`,
        kind: 'range',
        headers: ['指标', '数值', '单位', '较上一周期', '统计口径'],
        rows: [
          ['区间 tokens', d.tokens, 'token', d.tkDelta, '输入+输出'],
          ['区间调用次数', d.callVal, '次', d.callDelta, '模型请求'],
          ['平均响应', d.resp, '秒', d.respNote, '请求到首字'],
        ],
        widths: [22, 18, 12, 24, 36],
      },
      {
        name: '用量趋势',
        title: `模型用量趋势 · ${rangeLabel}`,
        kind: 'range',
        headers: ['时间', '总 tokens', '机构范围'],
        rows: d.x.map((x, i) => [x, `${(org === '全部' ? d.total[i] : orgSeries[i]).toLocaleString('en-US')}万`, org]),
        widths: [20, 20, 24],
      },
      {
        name: '机构排行',
        title: `Top 机构 token 排行 · ${rangeLabel}`,
        kind: 'range',
        headers: ['机构', 'Token 用量'],
        rows: d.top.map((r) => [r.nm, r.pv]),
        widths: [24, 20],
      },
    ],
  };
}
