// 机构管理导出 spec（0714 新增）——纯函数，视图与模板生成共用（node 可运行，约束同 dashboard.ts）。
import type { ExportSpec } from '@aba/ui-admin';
import { PLATFORM_ORGS, type PlatformOrg } from '../../../../packages/mock/src/data/platformOrgs.ts';
import { secondaryTenantDomain } from '../../../../packages/mock/src/rules.ts';
import { limitOf } from '../data/orgPlans.ts';

export interface OrgListExportArgs {
  /** 已按视图筛选后的机构行（含层级覆盖后的 parentId） */
  rows?: PlatformOrg[];
  /** 上级机构名查找基准（默认与 rows 同一份） */
  all?: PlatformOrg[];
  filters?: Array<[string, string]>;
}

export function buildOrgListSpec(args: OrgListExportArgs = {}): ExportSpec {
  const {
    rows = PLATFORM_ORGS,
    all = rows,
    filters = [['关键词', '无'], ['机构状态', '全部'], ['套餐', '全部'], ['上级机构', '全部']],
  } = args;
  const nameOf = (id: string | null) => (id ? all.find((r) => r.id === id)?.name ?? '—' : '—');

  return {
    context: { scope: '全域', business: '机构管理', filters },
    sheets: [
      {
        name: '机构明细',
        title: '平台机构管理',
        subtitle: 'KP / 存储为当前占用，Token 为当前订阅周期消耗；上限由套餐推断（定制版为单独设定）',
        headers: ['机构 ID', '机构名称', '二级机构域名', '状态', '上级机构', '套餐', 'KP 已用（个）', 'KP 上限（个）', '存储已用（GB）', '存储上限（GB）', 'Token 已用（亿）', 'Token 上限（亿）'],
        rows: rows.map((r) => {
          const lim = limitOf(r);
          return [r.id, r.name, secondaryTenantDomain(r.domainPrefix), r.status, nameOf(r.parentId), r.plan, r.kpUsed, lim.kp, r.stUsed, lim.storage, r.tkUsed, lim.token];
        }),
        widths: [12, 22, 20, 10, 20, 12, 12, 14, 12, 16, 13, 16],
      },
    ],
  };
}
