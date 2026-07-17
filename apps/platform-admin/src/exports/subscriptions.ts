// 订阅订单导出 spec（0714）——纯函数，视图与模板生成共用（node 可运行，约束同 dashboard.ts）。
import type { ExportSpec } from '@aba/ui-admin';
import type { Subscription } from '../../../../packages/mock/src/types.ts';
import { SUBSCRIPTIONS, subStatus } from '../../../../packages/mock/src/data/subscriptions.ts';

export interface SubscriptionsExportArgs {
  /** 已按视图筛选后的「订阅」行（不含加油包） */
  rows?: Subscription[];
  filters?: Array<[string, string]>;
}

export function buildSubscriptionsSpec(args: SubscriptionsExportArgs = {}): ExportSpec {
  const {
    rows = SUBSCRIPTIONS.filter((s) => s.type === '订阅').slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    filters = [['关键词', '无'], ['机构', '全部'], ['套餐', '全部'], ['状态', '全部']],
  } = args;

  return {
    context: { scope: '全域', business: '订阅订单', filters },
    sheets: [
      {
        name: '订阅明细',
        title: '平台订阅订单',
        subtitle: 'KP / 存储已用为机构当前占用，Token 已用为当前订阅周期消耗',
        headers: ['订单 ID', '机构', '套餐', 'KP 上限（个）', 'KP 当前占用（个）', '存储上限（GB）', '存储当前占用（GB）', 'Token 周期额度（亿）', 'Token 本周期消耗（亿）', '生效日', '到期日', '负责人', '状态'],
        rows: rows.map((s) => [s.id, s.orgName, s.plan ?? '—', s.kp, s.kpUsed ?? 0, s.storage, s.storageUsed ?? 0, s.token, s.tokenUsed ?? 0, s.startDate, s.endDate, s.owner ?? '—', subStatus(s)]),
        widths: [26, 24, 14, 14, 18, 18, 22, 20, 24, 16, 16, 16, 14],
      },
    ],
  };
}
