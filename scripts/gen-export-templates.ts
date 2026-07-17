// 导出模板样张生成器（0714）
// 用法：npm run gen:export-templates
//（内部为 node --experimental-strip-types，直接运行仓库内 TS：spec 与页面导出共用同一 buildWorkbook，模板即真实导出的同源产物）
// 产物：docs/export-templates/*.xlsx + README.md 索引
// 约束：spec 文件及其 import 闭包必须 node 可运行（不 import react / .tsx / css / window）

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWorkbook, exportFilename } from '../packages/ui-admin/src/exportCsv.ts';
import type { ExportSpec } from '../packages/ui-admin/src/exportCsv.ts';
import { TEMPLATE_SPECS as ORG_SPECS } from '../apps/org-admin/src/exports/index.ts';
import { TEMPLATE_SPECS as PLATFORM_SPECS } from '../apps/platform-admin/src/exports/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'docs', 'export-templates');

// 固定演示时间，避免每次生成产生 diff 噪音
const DEMO_EXPORTED_AT = new Date('2026-07-14T10:00:00');

interface IndexRow {
  admin: string;
  page: string;
  file: string;
  sheets: string;
  filters: string;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  // 清掉旧 xlsx，保证产物与注册 spec 一一对应
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (f.endsWith('.xlsx')) fs.unlinkSync(path.join(OUT_DIR, f));
  }

  const groups: Array<{ admin: string; specs: Array<{ page: string; build: () => ExportSpec }> }> = [
    { admin: '机构后台', specs: ORG_SPECS },
    { admin: '平台超管后台', specs: PLATFORM_SPECS },
  ];

  const index: IndexRow[] = [];
  for (const group of groups) {
    for (const entry of group.specs) {
      const spec = entry.build();
      spec.context.exportedAt = DEMO_EXPORTED_AT;
      if (spec.context.realtimeAt) spec.context.realtimeAt = DEMO_EXPORTED_AT;
      const filename = exportFilename(spec.context);
      const workbook = await buildWorkbook(spec);
      await workbook.xlsx.writeFile(path.join(OUT_DIR, filename));
      index.push({
        admin: group.admin,
        page: entry.page,
        file: filename,
        sheets: spec.sheets.map((s) => s.name).join('、'),
        filters: (spec.context.filters ?? []).map(([k, v]) => `${k}=${v || '无'}`).join('；') || '无（全量）',
      });
      console.log(`✓ ${filename}`);
    }
  }

  const readme = [
    '# AI 问书 · 导出模板样张',
    '',
    '> 本目录由 `npm run gen:export-templates` 自动生成——与两后台页面导出**共用同一构建函数**（packages/ui-admin/src/exportCsv.ts 的 buildWorkbook），模板即真实导出的同源样张；页面导出结构变更后重跑本命令即同步。',
    `> 生成时间基准（演示固定值）：${DEMO_EXPORTED_AT.toLocaleString('zh-CN', { hour12: false })} · 共 ${index.length} 份`,
    '',
    '| 后台 | 页面 | 文件名 | Sheet | 默认筛选 |',
    '|---|---|---|---|---|',
    ...index.map((r) => `| ${r.admin} | ${r.page} | ${r.file} | ${r.sheets} | ${r.filters} |`),
    '',
    '文件名规范：`AI问书_{机构名｜全域}_{业务名}数据导出.xlsx`；每个 Sheet 头部依次为 标题 / 导出时间（实时指标另标实时统计时间；区间指标标注区间起止）/ 导出时刻的筛选条件。',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(OUT_DIR, 'README.md'), readme);
  console.log(`✓ README.md（${index.length} 份模板索引）`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
