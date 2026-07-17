// 全域知识产品 KP 导出 spec（0714 新增）——纯函数，视图与模板生成共用（node 可运行，约束同 dashboard.ts）。
import type { ExportSpec } from '@aba/ui-admin';
import type { KnowledgeProduct } from '../../../../packages/mock/src/types.ts';
import { KPS } from '../../../../packages/mock/src/data/kps.ts';
import { ORGS } from '../../../../packages/mock/src/data/orgs.ts';
import { KP_BASE_TAG, KP_STAT } from '../data/kpStatus.ts';

export interface GlobalKpsExportArgs {
  rows?: KnowledgeProduct[];
  filters?: Array<[string, string]>;
}

export function buildGlobalKpsSpec(args: GlobalKpsExportArgs = {}): ExportSpec {
  const {
    rows = KPS,
    filters = [['关键词', '无'], ['机构', '全部'], ['状态', '全部']],
  } = args;
  const orgName = (id: string) => ORGS.find((o) => o.id === id)?.name ?? id;

  return {
    context: { scope: '全域', business: '知识产品', filters },
    sheets: [
      {
        name: 'KP 明细',
        title: '平台全域知识产品 KP',
        headers: ['KP ID', '名称', '机构', '状态', '永享', '权益', '创建时间', '简介'],
        rows: rows.map((k) => [
          k.id,
          k.name,
          orgName(k.orgId),
          KP_STAT[k.status]?.t ?? k.status,
          k.hasForever ? `永享 ¥${k.foreverPrice ?? '—'}` : '—',
          KP_BASE_TAG[k.baseTag ?? ''] ?? '—',
          k.createdAt,
          k.description ?? '—',
        ]),
        widths: [14, 34, 20, 10, 14, 10, 14, 56],
      },
    ],
  };
}
