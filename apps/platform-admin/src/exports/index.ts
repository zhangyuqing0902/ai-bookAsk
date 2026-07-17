// 平台超管后台 · 导出模板注册表（0714）。
// scripts/gen-export-templates.ts 用 node --experimental-strip-types 直接 import 本文件，
// 按「默认筛选 + 全量数据」生成 docs/export-templates 样张——与页面导出共用同一 spec 纯函数，模板即同源产物。
// 约束：本文件及全部 spec 的 import 闭包须 node 可运行（不 import react / .tsx / css / window / zustand store）。
import type { ExportSpec } from '@aba/ui-admin';
import { buildDashboardSpec } from './dashboard.ts';
import { buildOrgListSpec } from './orgList.ts';
import { buildAccountsSpec } from './accounts.ts';
import { buildSubscriptionsSpec } from './subscriptions.ts';
import { buildGlobalKpsSpec } from './globalKps.ts';
import { buildGlobalUsersSpec } from './globalUsers.ts';
import { buildGlobalOrdersSpec } from './globalOrders.ts';
import { buildGlobalFeedbackSpec } from './globalFeedback.ts';
import { buildModelUsageSpec } from './modelUsage.ts';
import { buildPlatformAccountsSpec } from './platformAccounts.ts';

export const TEMPLATE_SPECS: Array<{ page: string; build: () => ExportSpec }> = [
  { page: '主控台', build: () => buildDashboardSpec() },
  { page: '机构管理', build: () => buildOrgListSpec() },
  { page: '机构账户', build: () => buildAccountsSpec() },
  { page: '订阅订单', build: () => buildSubscriptionsSpec() },
  { page: '全域知识产品 KP', build: () => buildGlobalKpsSpec() },
  { page: '全域用户', build: () => buildGlobalUsersSpec() },
  { page: '全域订单', build: () => buildGlobalOrdersSpec() },
  { page: '全域答案反馈', build: () => buildGlobalFeedbackSpec() },
  { page: '全域模型用量', build: () => buildModelUsageSpec() },
  { page: '平台账户', build: () => buildPlatformAccountsSpec() },
];
