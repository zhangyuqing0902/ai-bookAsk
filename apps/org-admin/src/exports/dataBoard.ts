// 0714：数据看板导出 spec（纯函数）——7 个 Sheet 覆盖四主题域全部页面指标：
// 区间指标 / 留存率 / 提问趋势 / 分布明细 / 关键词云 / 转化漏斗 / 热门KP榜单。
import type { ExportSpec, ExportSheet } from '@aba/ui-admin';
import { MY_ORG } from '../../../../packages/mock/src/data/adminOrders.ts';
import { comparisonPeriodLabel } from '../../../../packages/mock/src/rules.ts';
import type { RangeData, Bar, RetentionNode, TOPKP } from '../data/dataBoard.ts';
import { periodOf, fmtCnLite } from './shared.ts';

export interface DataBoardExportInput {
  rangeLabel: string; // 今日 / 7 日 / 30 日
  periodDays: number; // 1 / 7 / 30
  d: RangeData; // 当前区间的看板数据
  retentionRange: string; // 注册批次（最新可统计 / 近 7 个注册日 / 近 30 个注册日 / 自定义日期）
  retention: { nodes: RetentionNode[]; updatedAt: string }; // 按注册批次的留存节点
  active: { dau: string; wau: string; mau: string }; // DAU/WAU/MAU 实时快照
  topkp: typeof TOPKP;
}

// 给裸数字补量纲单位（人 / 条 / 轮 / 单 等），使每个数值单元格自解释。
const u = (val: string | number, unit: string) => `${val} ${unit}`;

export function buildDataBoardSpec(input: DataBoardExportInput): ExportSpec {
  const { rangeLabel, periodDays, d, retentionRange, retention, active, topkp } = input;
  const snapshotNote = '实时快照（固定窗口，不随区间联动）';

  // Sheet 1 · 区间指标：页面四主题域 KPI 全量
  const rangeSheet: ExportSheet = {
    name: '区间指标',
    title: '机构数据看板 · 区间指标',
    kind: 'range',
    subtitle: `环比口径：${comparisonPeriodLabel(periodDays)}`,
    headers: ['主题', '指标', '数值', '统计说明'],
    rows: [
      ['用户', 'DAU（日活跃用户）', u(active.dau, '人'), snapshotNote],
      ['用户', 'WAU（周活跃用户）', u(active.wau, '人'), snapshotNote],
      ['用户', 'MAU（月活跃用户）', u(active.mau, '人'), snapshotNote],
      ['用户', '新增用户', u(d.newUsers, '人'), '区间首次注册，按用户 ID 精确去重'],
      ['提问', '总提问', u(d.totalAsk, '条'), '含追问'],
      ['提问', '人均提问', u(d.perUser, '条/人'), '总提问 ÷ 活跃用户'],
      ['提问', '平均会话轮次', u(d.rounds, '轮'), '总提问 ÷ 总会话数'],
      ['提问', '答案点赞率', d.likeRate, '点赞答案 ÷ 已完成答案'],
      ['提问', '答案反馈率', d.fbRate, '收到反馈的答案 ÷ 已完成答案'],
      ['营收', '区间 GMV', d.gmv, '区间已支付（会员 + 永享）'],
      ['营收', '付费用户', u(d.payUsers, '人'), '区间有效支付，去重'],
      ['营收', '付费转化率', d.payRate, '付费用户 ÷ 活跃用户'],
      ['营收', 'ARPPU', d.arppu, '支付收入 ÷ 付费用户'],
      ['营收', '续费率', d.renew, '到期完成续费会员 ÷ 到期会员'],
      ['营收', '退款金额', d.refundAmt, '区间成功退款'],
      ['营收', '退款率', d.refundRate, '退款金额 ÷ 同区间 GMV'],
      ['营收', '退款订单数', u(d.refundOrders, '单'), '发生成功退款（含部分）的去重订单'],
      ['营收', '净 GMV', d.netGmv, 'GMV − 成功退款'],
      ['营收', '受限触发率', d.limit, '触发付费墙 ÷ 总提问（转化漏斗入口）'],
    ],
    widths: [12, 24, 16, 44],
  };

  // Sheet 2 · 用户留存：按「注册批次」观察注册后第 N 天是否回来，口径独立于页面全局时间区间。
  // 每行一个节点，留存率/样本数/注册截止日/状态各列独立；待成熟节点不写 0%，状态列如实标注。
  const retentionSheet: ExportSheet = {
    name: '留存率',
    title: '用户留存 · 按注册批次',
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

  // Sheet 3 · 提问趋势
  const trendSheet: ExportSheet = {
    name: '提问趋势',
    title: `提问量趋势 · ${rangeLabel}`,
    kind: 'range',
    headers: ['时间', '提问量（条）'],
    rows: d.askTrend.x.map((x, i) => [x, d.askTrend.v[i]]),
    widths: [20, 18],
  };

  // Sheet 4 · 分布明细：来源 / 地区 / 性别 / Agent / 领域 五组拍平
  const flat = (theme: string, bars: Bar[]) => bars.map((b) => [theme, b.nm, b.pv] as Array<string | number>);
  const distSheet: ExportSheet = {
    name: '分布明细',
    title: `分布明细 · ${rangeLabel}`,
    kind: 'range',
    headers: ['分布主题', '项目', '占比'],
    rows: [
      ['来源', '扫码进入', `${d.saoma}%`],
      ['来源', '直接访问', `${100 - d.saoma}%`],
      ...flat('地区', d.region),
      ...flat('性别', d.gender),
      ...flat('Agent', d.agent),
      ...flat('领域', d.domain),
    ],
    widths: [14, 22, 14],
  };

  // Sheet 5 · 关键词云：区间提问次数 = 热度等级 × kwMult（与页面 hover 口径一致）
  const kwSheet: ExportSheet = {
    name: '关键词云',
    title: `提问关键词云 · ${rangeLabel}`,
    kind: 'range',
    headers: ['关键词', '热度等级(1-5)', '区间提问次数'],
    rows: d.keywords.map((k) => [k.w, k.s, k.s * d.kwMult]),
    widths: [20, 16, 18],
  };

  // Sheet 6 · 转化漏斗：受限触发率（入口）+ 会员漏斗三段 + 永享转化
  const funnelSheet: ExportSheet = {
    name: '转化漏斗',
    title: `转化漏斗 · ${rangeLabel}`,
    kind: 'range',
    headers: ['漏斗', '阶段', '数值'],
    rows: [
      ['受限内容触发率', '触发付费墙 ÷ 总提问', d.limit],
      ...d.memberFunnel.map((b) => ['会员漏斗', b.nm, b.pv] as Array<string | number>),
      ...d.yxFunnel.map((b) => ['永享转化', b.nm, b.pv] as Array<string | number>),
    ],
    widths: [20, 24, 14],
  };

  // Sheet 7 · 热门 KP 榜单：三榜 ×10，数值按页面 kpFactor 缩放 + 中文万进制
  const topkpSheet: ExportSheet = {
    name: '热门KP榜单',
    title: `热门 KP 榜单 · ${rangeLabel}`,
    kind: 'range',
    headers: ['榜单', '排名', 'KP 名称', '数值'],
    rows: topkp.flatMap((board) =>
      board.rows.map((r, i) => [board.t, i + 1, r[0], board.pre + fmtCnLite(Math.round(r[1] * d.kpFactor)) + board.suf] as Array<string | number>),
    ),
    widths: [22, 10, 20, 16],
  };

  return {
    context: {
      scope: MY_ORG,
      business: '数据看板',
      filters: [
        ['时间区间', rangeLabel],
        ['注册批次', retentionRange],
      ],
      period: periodOf(periodDays, rangeLabel),
    },
    sheets: [rangeSheet, retentionSheet, trendSheet, distSheet, kwSheet, funnelSheet, topkpSheet],
  };
}
