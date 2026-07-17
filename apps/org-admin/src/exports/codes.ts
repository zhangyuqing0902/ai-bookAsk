// 0714：兑换码批次详情导出 spec（纯函数）——两 Sheet：批次信息 + 兑换码明细。
import type { ExportSpec } from '@aba/ui-admin';
import { MY_ORG } from '../../../../packages/mock/src/data/adminOrders.ts';
import type { Batch, Code } from '../data/codes.ts';

export interface CodesExportInput {
  batch: Batch;
  codeRows: Code[];
  cStatus: string; // 状态筛选
  cUser: string; // 兑换用户关键词
  cPhone: string; // 手机号关键词
}

export function buildCodesSpec({ batch, codeRows, cStatus, cUser, cPhone }: CodesExportInput): ExportSpec {
  const keyword = [cUser, cPhone].filter(Boolean).join(' / ');
  return {
    context: {
      scope: MY_ORG,
      business: `兑换码_${batch.name}`,
      filters: [
        ['关键词', keyword || '无'],
        ['状态', cStatus],
      ],
    },
    sheets: [
      {
        name: '批次信息',
        title: batch.name,
        subtitle: `可兑换 ${batch.validFrom ?? '创建后立即'} ~ ${batch.validTo ?? '长期有效'}`,
        headers: ['批次 ID', '生成数量（个）', '已兑换（个）', '会员时长', '创建时间'],
        rows: [[batch.id, batch.total, batch.redeemed, batch.duration, batch.createdAt]],
        widths: [22, 14, 14, 16, 22],
      },
      {
        name: '兑换码明细',
        title: `${batch.name} · 兑换码明细`,
        headers: ['兑换码', '权益', '状态', '兑换时间', '兑换用户', '手机号', '权益到期'],
        rows: codeRows.map((c) => [c.code, `会员 · ${batch.duration}`, c.status, c.redeemAt, c.user, c.phone, c.expire]),
        widths: [16, 18, 14, 22, 26, 16, 18],
      },
    ],
  };
}
