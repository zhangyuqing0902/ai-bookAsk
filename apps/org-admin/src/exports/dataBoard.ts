// 0714：数据看板导出 spec（纯函数）。
// 0806-3：Sheet 结构对齐页面栏目——活跃概览 / 用户留存 / 区间分析 三个 Sheet（与页面三个区块一一对应）；
// 「区间分析」把四个主题 Tab 合并为一个 Sheet，行首列标注主题 Tab 名。
// 父机构视角：头部 scope 标（父机构）+ 筛选条件注明机构范围；数据随页面机构多选联动（多选＝合并、单选＝单机构），
// 不再单独产出分机构明细（0806-3 撤销）。
import type { ExportSpec, ExportSheet } from '@aba/ui-admin';
import { MY_ORG } from '../../../../packages/mock/src/data/adminOrders.ts';
import { comparisonPeriodLabel } from '../../../../packages/mock/src/rules.ts';
import type { RangeData, Bar, RetentionNode, TOPKP } from '../data/dataBoard.ts';
import { periodOf, fmtCnLite } from './shared.ts';

export interface DataBoardExportInput {
  rangeLabel: string; // 今日 / 7 日 / 30 日
  periodDays: number; // 1 / 7 / 30
  d: RangeData; // 当前区间的看板数据（父机构视角为所选机构集合的联动值）
  retentionRange: string; // 注册批次（最新可统计 / 自定义日期）
  retention: { nodes: RetentionNode[]; updatedAt: string }; // 按注册批次的留存节点
  active: { dau: string; wau: string; mau: string }; // DAU/WAU/MAU 实时快照
  topkp: typeof TOPKP;
  /** 0806-2：父机构视角所选机构集合（子/独立视角不传）——头部注明机构范围，数据已随选择联动 */
  orgs?: string[];
}

// 给裸数字补量纲单位（人 / 条 / 轮 / 单 等），使每个数值单元格自解释。
const u = (val: string | number, unit: string) => `${val} ${unit}`;

export function buildDataBoardSpec(input: DataBoardExportInput): ExportSpec {
  const { rangeLabel, periodDays, d, retentionRange, retention, active, topkp, orgs } = input;
  const isParentScope = !!orgs && orgs.length > 0;
  // 0724：活跃概览定稿为固定滚动窗口实时快照（不随区间联动），去重规则独立标注
  const dauNote = '今日截至当前时刻快照；去重：单日内按用户 ID 去重；环比昨日同时段；不随区间联动';
  const windowNote = (w: string) => `截至今日${w}滚动窗口快照；去重：窗口内按用户 ID 去重（跨天只计 1 人）；环比上一个等长窗口；不随区间联动`;

  // Sheet 1 · 活跃概览（页级常驻区块，固定滚动窗口实时快照）
  const activeSheet: ExportSheet = {
    name: '活跃概览',
    title: '机构数据看板 · 活跃概览（实时滚动窗口快照）',
    subtitle: '页级常驻区块 · 不随时间区间筛选联动',
    headers: ['指标', '数值', '统计说明'],
    rows: [
      ['DAU（日活跃用户）', u(active.dau, '人'), dauNote],
      ['WAU（周活跃用户）', u(active.wau, '人'), windowNote('近 7 日')],
      ['MAU（月活跃用户）', u(active.mau, '人'), windowNote('近 30 日')],
    ],
    widths: [24, 16, 56],
  };

  // Sheet 2 · 用户留存（页级常驻区块，独立注册批次口径）
  const retentionSheet: ExportSheet = {
    name: '用户留存',
    title: '机构数据看板 · 用户留存（按注册批次）',
    subtitle: `注册批次=${retentionRange} · 数据更新至 ${retention.updatedAt} · 活跃口径：注册后第 N 天发生登录或提问行为`,
    headers: ['留存节点', '留存率', '样本数', '注册截止日', '状态'],
    rows: retention.nodes.map((n) => [
      n.label,
      n.rate ?? '—',
      n.status === '可统计' ? u(n.sample, '人') : '—',
      n.cutoff,
      n.status === '待成熟' && n.readyDate ? `待成熟 · 预计 ${n.readyDate} 可统计` : n.status,
    ]),
    widths: [18, 12, 14, 24, 26],
  };

  // Sheet 3 · 区间分析（四个主题 Tab 合一，行首列标注 Tab 名）
  const flat = (tab: string, block: string, bars: Bar[]) => bars.map((b) => [tab, block, b.nm, b.pv, ''] as Array<string | number>);
  const rangeSheet: ExportSheet = {
    name: '区间分析',
    title: `机构数据看板 · 区间分析（四主题 Tab） · ${rangeLabel}`,
    kind: 'range',
    subtitle: `环比口径：${comparisonPeriodLabel(periodDays)}`,
    headers: ['主题 Tab', '板块', '指标 / 项目', '数值', '统计说明'],
    rows: [
      // —— 用户分析 Tab ——
      ['用户分析', 'KPI', '新增用户', u(d.newUsers, '人'), '区间首次注册，按用户 ID 精确去重'],
      ['用户分析', '来源分布', '扫码进入', `${d.saoma}%（${d.saomaCnt} 人）`, '链接带 KP 二维码参数'],
      ['用户分析', '来源分布', '直接访问', `${100 - d.saoma}%（${d.directCnt} 人）`, '直链 / 无码进入'],
      ...flat('用户分析', '地区分布', d.region),
      ...flat('用户分析', '性别分布', d.gender),
      // —— 提问分析 Tab ——
      ['提问分析', 'KPI', '总提问', u(d.totalAsk, '条'), '含追问'],
      ['提问分析', 'KPI', '人均提问', u(d.perUser, '条/人'), '总提问 ÷ 活跃用户（活跃按用户 ID 去重）'],
      ['提问分析', 'KPI', '平均会话轮次', u(d.rounds, '轮'), '总提问 ÷ 总会话数'],
      ['提问分析', 'KPI', '答案点赞率', d.likeRate, '点赞答案 ÷ 已完成答案'],
      ['提问分析', 'KPI', '答案反馈率', d.fbRate, '收到反馈的答案 ÷ 已完成答案'],
      ...d.askTrend.x.map((x, i) => ['提问分析', '提问量趋势', x, u(d.askTrend.v[i], '条'), ''] as Array<string | number>),
      ...flat('提问分析', 'Agent 分布', d.agent),
      ...flat('提问分析', '领域分布', d.domain),
      ...d.keywords.map((k) => ['提问分析', '关键词云', k.w, u(k.s * d.kwMult, '次'), `热度等级 ${k.s}/5`] as Array<string | number>),
      // —— 营收分析 Tab ——
      ['营收分析', '收入与转化', '区间 GMV', d.gmv, '区间已支付（会员 + 永享；待支付/已失效不计入）'],
      ['营收分析', '收入与转化', '付费用户', u(d.payUsers, '人'), '区间有效支付，按用户 ID 去重'],
      ['营收分析', '收入与转化', '付费转化率', d.payRate, '付费用户 ÷ 活跃用户（均按用户 ID 去重）'],
      ['营收分析', '收入与转化', 'ARPPU', d.arppu, '支付收入 ÷ 付费用户'],
      ['营收分析', '收入与转化', '续费率', d.renew, '到期完成续费会员 ÷ 到期会员'],
      ['营收分析', '收入与转化', '回流会员', u(d.reflow, '人'), '过期后重新开通，按用户 ID 去重；不算新增/续费'],
      ['营收分析', '退款', '退款金额', d.refundAmt, '区间成功退款'],
      ['营收分析', '退款', '退款率', d.refundRate, '退款金额 ÷ 同区间 GMV'],
      ['营收分析', '退款', '退款订单数', u(d.refundOrders, '单'), '发生成功退款（含部分）的去重订单'],
      ['营收分析', '退款', '净 GMV', d.netGmv, 'GMV − 成功退款'],
      ['营收分析', '转化漏斗', '受限内容触发率', d.limit, '触发付费墙 ÷ 总提问（漏斗入口）'],
      ...d.memberFunnel.map((b) => ['营收分析', '转化漏斗 · 会员', b.nm, b.pv, ''] as Array<string | number>),
      ...d.yxFunnel.map((b) => ['营收分析', '转化漏斗 · 永享', b.nm, b.pv, ''] as Array<string | number>),
      // —— 热门 KP Tab ——
      ...topkp.flatMap((board) =>
        board.rows.map((r, i) => ['热门 KP', board.t, `No.${i + 1} ${r[0]}`, board.pre + fmtCnLite(Math.round(r[1] * d.kpFactor)) + board.suf, '数值随区间缩放'] as Array<string | number>),
      ),
    ],
    widths: [14, 18, 24, 20, 40],
  };

  return {
    context: {
      scope: isParentScope ? `${MY_ORG}（父机构）` : MY_ORG,
      business: '数据看板',
      filters: [
        ...(isParentScope ? [['机构范围', orgs!.join('、')] as [string, string]] : []),
        ['时间区间', rangeLabel],
        ['注册批次', retentionRange],
      ],
      period: periodOf(periodDays, rangeLabel),
    },
    sheets: [activeSheet, retentionSheet, rangeSheet],
  };
}
