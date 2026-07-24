// 0714：机构后台导出模板注册表——docs 模板脚本以「默认筛选 + 全量数据」构造每页 spec，
// 与页面导出按钮共用同一份 buildXxxSpec，保证模板与真实导出永不走样。
// 本文件须 node --experimental-strip-types 可运行：不 import react / .tsx / css / window。
// 运行时 import 一律相对 .ts 路径（node ESM 不吃无扩展名相对导入；@aba/mock 包入口 node 解析不了，
// 直取其中零依赖的数据/规则源文件）；type 引用编译期擦除，可用包名。
import type { ExportSpec } from '@aba/ui-admin';
import { AORDERS, byPayDesc, MY_ORG } from '../../../../packages/mock/src/data/adminOrders.ts';
import { orgDaily, orgSnapshot, rangeMetrics } from '../../../../packages/mock/src/data/dashboard.ts';
import { MY_ORG_SUBS, currentSubCard } from '../../../../packages/mock/src/data/subscriptions.ts';
import { USERS } from '../data/cusers.ts';
import { BATCHES, batchCodes } from '../data/codes.ts';
import { ACTIVE_SNAPSHOT, RANGE, retentionFor, TOPKP } from '../data/dataBoard.ts';
import { FEEDBACKS } from '../data/feedback.ts';
import { buildDashboardSpec } from './dashboard.ts';
import { buildCUsersSpec } from './cusers.ts';
import { buildOrdersSpec } from './orders.ts';
import { buildCodesSpec } from './codes.ts';
import { buildDataBoardSpec } from './dataBoard.ts';
import { buildFeedbackSpec } from './feedback.ts';

export { buildDashboardSpec, buildCUsersSpec, buildOrdersSpec, buildCodesSpec, buildDataBoardSpec, buildFeedbackSpec };

export const TEMPLATE_SPECS: Array<{ page: string; build: () => ExportSpec }> = [
  {
    page: '主控台',
    build: () =>
      buildDashboardSpec({
        days: 7,
        rangeLabel: '近 7 天',
        snapshot: orgSnapshot,
        sub: currentSubCard(MY_ORG_SUBS),
        cur: rangeMetrics(orgDaily, 7),
        prev: rangeMetrics(orgDaily, 7, 7),
        chartSlice: rangeMetrics(orgDaily, 7).slice,
      }),
  },
  {
    page: 'C端用户',
    build: () => buildCUsersSpec({ rows: USERS, q: '', member: '全部' }),
  },
  {
    page: '订单管理',
    build: () =>
      buildOrdersSpec({
        rows: AORDERS.filter((r) => r.org === MY_ORG).slice().sort(byPayDesc),
        filters: { q: '', type: '全部', status: '全部', rfStatus: '全部', orderRange: '不限', payRange: '不限', redeemRange: '不限' },
        // 模板侧无 refund store，退款状态缺省 '未退款'
      }),
  },
  {
    page: '兑换码批次详情',
    build: () => buildCodesSpec({ batch: BATCHES[0], codeRows: batchCodes(BATCHES[0]), cStatus: '全部', cUser: '', cPhone: '' }),
  },
  {
    page: '数据看板',
    build: () =>
      buildDataBoardSpec({
        rangeLabel: '7 日',
        periodDays: 7,
        d: RANGE['7 日'],
        retentionRange: '最新可统计',
        retention: retentionFor('最新可统计', null),
        // 0724：活跃概览改固定滚动窗口快照，模板样张取 ACTIVE_SNAPSHOT
        active: { dau: ACTIVE_SNAPSHOT.dau, wau: ACTIVE_SNAPSHOT.wau, mau: ACTIVE_SNAPSHOT.mau },
        topkp: TOPKP,
      }),
  },
  {
    page: '答案反馈',
    build: () => buildFeedbackSpec({ rows: FEEDBACKS, q: '', tag: '全部', timeLabel: '近 7 天' }),
  },
];
