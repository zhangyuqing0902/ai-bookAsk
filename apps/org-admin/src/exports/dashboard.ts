// 0714：主控台导出 spec（纯函数）——页面导出与 docs 模板脚本共用同一份口径。
// 0806-3：Sheet 结构对齐页面栏目——当前订阅 / 实时总览 / 经营分析 三个 Sheet；
// 父机构视角数据随页面机构多选联动（多选＝合并、单选＝单机构），不再单独产出分机构明细（0806-3 撤销）。
// 数据一律由调用方传入：页面传当前区间 state；模板脚本传全量 + 默认筛选（见 exports/index.ts）。
// 运行时 import 走相对 .ts 路径（@aba/mock 包入口含 zustand store 且内部相对导入无扩展名，node 解析不了；
// 下列 mock 数据/规则文件自身零运行时依赖，node 可直载）；type 引用编译期擦除，可用包名。
import type { ExportSpec } from '@aba/ui-admin';
import type { RangeMetrics, DailyPoint, SubCardVM } from '@aba/mock';
import { MY_ORG } from '../../../../packages/mock/src/data/adminOrders.ts';
import { compareMetric, comparisonPeriodLabel, currentPeriodLabel } from '../../../../packages/mock/src/rules.ts';
import { periodOf, deltaArrow } from './shared.ts';

// 累计退款沿用页面硬编码演示值（实时总览「累计退款 / 退款率 2.1%」同源）
const TOTAL_REFUND = 1860;
const TOTAL_REFUND_RATE = '2.1%';

export interface DashboardExportInput {
  days: number;
  rangeLabel: string; // 当前区间 label（今日 / 近 7 天 / 30 天 / 自定义回显）
  /** 0806-2：父机构视角所选机构集合（子/独立视角不传）——头部注明机构范围，数据已随选择联动 */
  orgs?: string[];
  snapshot: { totalGmv: number; currentMembers: number; totalRegistered: number };
  sub: SubCardVM | null; // 当前生效订阅卡（配额行并入实时总览）
  cur: RangeMetrics;
  prev: RangeMetrics;
  chartSlice: DailyPoint[]; // 趋势图当前展示的日序列（今日档为近 7 日）
}

// 环比列：与页面 Delta 同源（compareMetric，count 口径；上期为 0 显示不可比文案）。
// 带 ↑/↓/— 方向箭头，读数人一眼看出升降。
function deltaText(c: number, p: number): string {
  const cmp = compareMetric(c, p, 'count');
  if (!cmp.comparable) return cmp.label;
  return deltaArrow(cmp.value ?? 0);
}

export function buildDashboardSpec(input: DashboardExportInput): ExportSpec {
  const { days, rangeLabel, snapshot, sub, cur, prev, chartSlice, orgs } = input;
  // 0806-2：父机构视角——scope 标注父机构身份，筛选条件注明机构范围（导出与界面所选集合一致）
  const isParentScope = !!orgs && orgs.length > 0;
  const scopeLabel = isParentScope ? `${MY_ORG}（父机构）` : MY_ORG;
  return {
    context: {
      scope: scopeLabel,
      business: '主控台',
      filters: [
        ...(isParentScope ? [['机构范围', orgs!.join('、')] as [string, string]] : []),
        ['经营分析区间', rangeLabel],
      ],
      period: periodOf(days, rangeLabel),
    },
    sheets: [
      // 0806-3：当前订阅独立成 Sheet（页面首栏「当前生效订阅卡」；订阅是本机构合同信息，不随机构筛选联动）
      {
        name: '当前订阅',
        title: '机构主控台 · 当前生效订阅（本机构）',
        kind: 'realtime',
        subtitle: '本机构订阅与配额 · 不随机构筛选变化',
        headers: ['分类', '配额项', '数值', '单位', '统计口径'],
        rows: (sub?.rows.map((r) => [r.kind === 'occupancy' ? '资源占用' : '周期消耗', r.k, r.used, r.unit, r.info] as Array<string | number>) ?? []),
        widths: [16, 22, 18, 12, 48],
      },
      {
        name: '实时总览',
        title: '机构主控台 · 实时总览',
        kind: 'realtime',
        subtitle: '截至导出时刻的实时快照，不参与环比',
        headers: ['分类', '指标', '数值', '单位', '统计口径'],
        rows: [
          ['经营', '累计 GMV', snapshot.totalGmv, '元', '历史已支付订单（会员 + 永享；兑换码计 0）'],
          ['经营', '累计退款', TOTAL_REFUND, '元', '历史成功退款'],
          ['经营', '退款率', TOTAL_REFUND_RATE, '—', '累计退款 ÷ 累计 GMV'],
          ['经营', '净 GMV', snapshot.totalGmv - TOTAL_REFUND, '元', '累计 GMV − 成功退款'],
          ['用户', '当前会员数', snapshot.currentMembers, '人', '实时权益快照，按用户 ID 精确去重'],
          ['用户', '累计注册用户', snapshot.totalRegistered, '人', '按用户 ID 精确去重'],
        ],
        widths: [16, 22, 18, 12, 48],
      },
      {
        name: '经营分析',
        title: '机构主控台 · 经营分析',
        kind: 'range',
        subtitle: `当前区间 ${currentPeriodLabel(days)} · ${comparisonPeriodLabel(days)}`,
        headers: ['数据类型', '指标或日期', '本期值', '单位', '较上一周期(环比)', '统计口径'],
        rows: [
          ['KPI', '活跃用户', cur.activeUsers, '人', deltaText(cur.activeUsers, prev.activeUsers), '区间内按用户 ID 去重'],
          ['KPI', '新增会员', cur.newMembers, '人', deltaText(cur.newMembers, prev.newMembers), '历史首次开通，按用户 ID 去重；续费/回流不计入'],
          ['KPI', '区间 GMV', cur.gmv, '元', deltaText(cur.gmv, prev.gmv), '区间已支付（待支付/已失效不计入）'],
          ['KPI', '区间提问数', cur.questions, '条', deltaText(cur.questions, prev.questions), '含追问'],
          ...chartSlice.flatMap((d) => [
            ['趋势-DAU', d.mmdd, d.dau, '人', '—', '自然日'],
            ['趋势-新增会员', d.mmdd, d.newMembers, '人', '—', '自然日'],
          ] as Array<Array<string | number>>),
        ],
        widths: [18, 22, 16, 12, 22, 32],
      },
    ],
  };
}
