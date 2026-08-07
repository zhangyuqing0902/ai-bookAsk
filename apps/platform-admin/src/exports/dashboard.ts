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
  /** 0806-4：机构多选联动系数（0~1]，绝对量按系数缩放、率类不缩放；缺省 1 = 全平台口径 */
  factor?: number;
  /** 0806-4：机构筛选后的机构数量（父机构含子机构）；缺省 = 全平台入驻机构数 */
  orgCount?: number;
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

/** 率值环比：方向箭头 + ±x.x%（0806-2 起率类差值统一 % 符号展示，语义为绝对差） */
const deltaRateText = (cur: number, prev: number) => {
  const c = compareMetric(cur, prev, 'rate');
  if (!c.comparable) return c.label;
  const v = c.value ?? 0;
  if (v > 0) return `↑ +${v.toFixed(1)}%`;
  if (v < 0) return `↓ -${Math.abs(v).toFixed(1)}%`;
  return '— 持平';
};

export function buildDashboardSpec(args: DashboardExportArgs = {}): ExportSpec {
  const { org = '全部机构', days = 7, rangeLabel = '近 7 天', factor = 1, orgCount } = args;
  // 区间起止：自定义时用传入值，预设按 今天-(days-1) ~ 今天 折算
  const end = args.end ?? new Date();
  const start = args.start ?? new Date(end.getTime() - (Math.max(days, 1) - 1) * 86400000);
  const scope = org === '全部机构' ? '全平台' : org;
  const cur = rangeMetrics(platformDaily, days);
  const prev = rangeMetrics(platformDaily, days, days);
  const chartSlice = days <= 1 ? platformDaily.slice(-7) : cur.slice;
  // 0806-4：机构多选联动——绝对量按系数缩放（取整），率类（续费率）不缩放；全选 = 系数 1
  const sc = (v: number) => Math.round(v * factor);
  const storageTb = platformSnapshot.kbStorageTb * factor;

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
          ['入驻机构数', orgCount ?? platformSnapshot.orgs, '家', orgCount == null ? '已创建且未删除' : '机构筛选所选（父机构含子机构）'],
          ['累计用户', sc(platformSnapshot.totalUsers), '人', '按用户 ID 精确去重'],
          ['累计 GMV', sc(platformSnapshot.totalGmv), '元', '历史已支付订单'],
          ['净 GMV', sc(platformSnapshot.totalGmv - 18100), '元', '累计 GMV - 成功退款'],
          ['提问总量', sc(platformSnapshot.totalQuestions), '条', '历史累计含追问'],
          // 0806-2：内容供给三指标（实时总览第二行）
          ['知识产品 KP 总数', sc(platformSnapshot.kpTotal), '个', `含草稿与已下架（已发布 ${sc(platformSnapshot.kpPublished)} · 草稿 ${sc(platformSnapshot.kpDraft)} · 已下架 ${sc(platformSnapshot.kpUnlisted)}）`],
          ['知识库文件总数', sc(platformSnapshot.kbFiles), '个', `不含已删除（文档 ${sc(platformSnapshot.kbDoc)} · 图片 ${sc(platformSnapshot.kbImage)} · 音频 ${sc(platformSnapshot.kbAudio)} · 视频 ${sc(platformSnapshot.kbVideo)}）`],
          ['知识库存储总量', storageTb.toFixed(1), 'TB', `原始文件合计，不含向量索引；文档 ${(storageTb * (100 - platformSnapshot.kbMediaPct) / 100).toFixed(1)}TB（${100 - platformSnapshot.kbMediaPct}%）· 媒体资源 ${(storageTb * platformSnapshot.kbMediaPct / 100).toFixed(1)}TB（${platformSnapshot.kbMediaPct}%）`],
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
          ['KPI', '活跃用户', sc(cur.activeUsers), '人', deltaText(sc(cur.activeUsers), sc(prev.activeUsers)), '区间内按用户 ID 去重'],
          ['KPI', '新增会员', sc(cur.newMembers), '人', deltaText(sc(cur.newMembers), sc(prev.newMembers)), '历史首次开通，按用户 ID 去重；续费/回流不计入'],
          ['KPI', '续费率', `${cur.renewRate.toFixed(1)}%`, '—', deltaRateText(cur.renewRate, prev.renewRate), '到期完成续费 ÷ 到期会员'],
          ['KPI', '回流会员', sc(cur.reflow), '人', deltaText(sc(cur.reflow), sc(prev.reflow)), '过期后重新开通，按用户 ID 去重；不算新增/续费'],
          ['KPI', '区间 GMV', sc(cur.gmv), '元', deltaText(sc(cur.gmv), sc(prev.gmv)), '区间已支付（待支付/已失效不计入）'],
          ['KPI', '区间提问数', sc(cur.questions), '条', deltaText(sc(cur.questions), sc(prev.questions)), '含追问'],
          ...chartSlice.map((d) => ['趋势', d.mmdd, sc(d.questions), '条', '—', days <= 1 ? '小时趋势展示近7日演示数据' : '自然日趋势']),
        ],
        widths: [12, 20, 16, 10, 22, 40],
      },
    ],
  };
}
