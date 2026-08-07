// 导出 spec 对抗性测试（0714）
// 用法：npm run test:export-specs（node --experimental-strip-types）
// 断言维度：文件名规范 / 行列对齐 / 头部区块（导出时间·筛选条件·实时/区间标注）/ 主控台与看板完整性 / 模板产物一致性

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWorkbook, exportFilename } from '../packages/ui-admin/src/exportCsv.ts';
import type { ExportSpec } from '../packages/ui-admin/src/exportCsv.ts';
import { TEMPLATE_SPECS as ORG_SPECS } from '../apps/org-admin/src/exports/index.ts';
import { TEMPLATE_SPECS as PLATFORM_SPECS } from '../apps/platform-admin/src/exports/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let pass = 0;
let fail = 0;
const failures: string[] = [];

function check(name: string, cond: boolean, detail = '') {
  if (cond) {
    pass++;
  } else {
    fail++;
    failures.push(`✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function main() {
  const groups = [
    { admin: '机构后台', scope: 'XX 出版社', specs: ORG_SPECS },
    { admin: '平台后台', scope: '全域', specs: PLATFORM_SPECS },
  ];

  // —— 文件名规范 ——
  check('文件名规范:机构侧剔空格', exportFilename({ scope: 'XX 出版社', business: 'C端用户' }) === 'AI问书_XX出版社_C端用户数据导出.xlsx');
  check('文件名规范:全域前缀', exportFilename({ scope: '全域', business: 'C端用户' }) === 'AI问书_全域C端用户数据导出.xlsx');

  const allNames = new Set<string>();
  for (const group of groups) {
    check(`${group.admin}:TEMPLATE_SPECS 非空`, group.specs.length > 0);
    for (const entry of group.specs) {
      const tag = `${group.admin}/${entry.page}`;
      let spec: ExportSpec;
      try {
        spec = entry.build();
      } catch (e: any) {
        check(`${tag}:spec 可构建`, false, String(e?.message ?? e));
        continue;
      }
      check(`${tag}:scope 正确`, spec.context.scope === group.scope, `实际 ${spec.context.scope}`);
      const fname = exportFilename(spec.context);
      check(`${tag}:文件名不重复`, !allNames.has(fname), fname);
      allNames.add(fname);
      check(`${tag}:文件名无非法字符`, !/[\\/:*?"<>|]/.test(spec.context.business));
      check(`${tag}:至少 1 个 Sheet`, spec.sheets.length >= 1);
      for (const sheet of spec.sheets) {
        check(`${tag}/${sheet.name}:表头非空`, sheet.headers.length > 0);
        const bad = sheet.rows.findIndex((r) => r.length !== sheet.headers.length);
        check(`${tag}/${sheet.name}:每行列数=表头数`, bad === -1, bad === -1 ? '' : `第 ${bad + 1} 行 ${sheet.rows[bad].length} 列 ≠ ${sheet.headers.length}`);
      }
      // 头部区块（读回工作簿断言样式与文案）
      const wb = await buildWorkbook({ ...spec, context: { ...spec.context, exportedAt: new Date('2026-07-14T10:00:00') } });
      const ws = wb.worksheets[0];
      check(`${tag}:行1=标题`, String(ws.getCell(1, 1).value ?? '').length > 0);
      check(`${tag}:行2 含导出时间`, String(ws.getCell(2, 1).value ?? '').includes('导出时间'));
      check(`${tag}:行3 含筛选条件`, String(ws.getCell(3, 1).value ?? '').includes('筛选条件'));
      const hdrFill: any = ws.getRow(4).getCell(1).fill;
      check(`${tag}:表头深靛蓝底`, hdrFill?.fgColor?.argb === 'FF3730A3');
      check(`${tag}:冻结表头`, (ws.views?.[0] as any)?.ySplit === 4);
      check(`${tag}:autoFilter`, !!ws.autoFilter);
    }
  }

  // —— 主控台（两后台）实时/区间标注 ——
  for (const group of groups) {
    const dash = group.specs.find((s) => /主控台/.test(s.page));
    check(`${group.admin}:注册了主控台导出`, !!dash);
    if (dash) {
      const spec = dash.build();
      check(`${group.admin}/主控台:含实时 Sheet`, spec.sheets.some((s) => s.kind === 'realtime'));
      check(`${group.admin}/主控台:含区间 Sheet`, spec.sheets.some((s) => s.kind === 'range'));
      check(`${group.admin}/主控台:period 起止非空`, !!spec.context.period?.start && !!spec.context.period?.end, JSON.stringify(spec.context.period));
      const rangeSheet = spec.sheets.find((s) => s.kind === 'range');
      check(`${group.admin}/主控台:区间指标含环比列`, !!rangeSheet && rangeSheet.headers.some((h) => /上一周期|环比/.test(h)));
      // 环比列必须带方向标识（↑/↓/持平），不能只写裸百分比
      if (rangeSheet) {
        const deltaIdx = rangeSheet.headers.findIndex((h) => /上一周期|环比/.test(h));
        const deltaVals = rangeSheet.rows.map((r) => String(r[deltaIdx] ?? '')).filter((v) => v && v !== '—' && /\d/.test(v));
        const allDirectional = deltaVals.every((v) => /[↑↓]|持平|上期为/.test(v));
        check(`${group.admin}/主控台:环比列带方向标识（非裸百分比）`, allDirectional, deltaVals.find((v) => !/[↑↓]|持平|上期为/.test(v)) ?? '');
      }
    }
  }
  // —— 环比列全域校验：所有 spec 里名为「较上一周期/环比」的列，含数字的值必须带方向 ——
  for (const group of groups) {
    for (const entry of group.specs) {
      let spec: ExportSpec;
      try { spec = entry.build(); } catch { continue; }
      for (const sheet of spec.sheets) {
        const di = sheet.headers.findIndex((h) => /较上一周期|环比/.test(h));
        if (di < 0) continue;
        for (const row of sheet.rows) {
          const v = String(row[di] ?? '');
          if (!v || v === '—' || !/\d/.test(v)) continue;
          check(`${group.admin}/${entry.page}/${sheet.name}:环比值「${v}」带方向`, /[↑↓]|持平|上期为|缩短|延长|增加|减少/.test(v), v);
        }
      }
    }
  }
  // —— 单位校验：趋势/词云/数值类 Sheet 的大数值列不得为裸数字（≥1000 须带单位或表头标单位）——
  const unitWhitelist = /万|亿|元|¥|人|条|次|个|秒|轮|GB|token|%|单|家|\//;
  for (const group of groups) {
    for (const entry of group.specs) {
      let spec: ExportSpec;
      try { spec = entry.build(); } catch { continue; }
      for (const sheet of spec.sheets) {
        // Sheet 内有独立「单位」列时，数值列由该列说明量纲，豁免
        const hasUnitCol = sheet.headers.some((h) => /单位/.test(h));
        if (hasUnitCol) continue;
        sheet.headers.forEach((h, ci) => {
          const headerHasUnit = unitWhitelist.test(h);
          for (const row of sheet.rows) {
            const cell = row[ci];
            // 纯数字且量级 ≥1000 → 表头或值必须能看出量纲
            if (typeof cell === 'number' && Math.abs(cell) >= 1000) {
              check(`${group.admin}/${entry.page}/${sheet.name}:大数值「${cell}」(${h}) 有单位`, headerHasUnit, `列「${h}」值 ${cell} 无量纲`);
            }
          }
        });
      }
    }
  }
  // 机构主控台实时指标全量（含退款率）
  const orgDash = ORG_SPECS.find((s) => /主控台/.test(s.page));
  if (orgDash) {
    // 0806-3：Sheet 对齐页面栏目——当前订阅 / 实时总览 / 经营分析；按名取实时总览（首个 realtime 已是「当前订阅」）
    const orgSheets = orgDash.build().sheets;
    for (const need of ['当前订阅', '实时总览', '经营分析']) {
      check(`机构主控台:含 Sheet「${need}」`, orgSheets.some((s) => s.name === need), `实际 ${orgSheets.map((s) => s.name).join('、')}`);
    }
    const rt = orgSheets.find((s) => s.name === '实时总览');
    const cells = (rt?.rows ?? []).flat().map(String).join('|') + (rt?.headers ?? []).join('|');
    for (const kpi of ['累计 GMV', '退款率', '净 GMV', '当前会员', '累计注册']) {
      check(`机构主控台:实时含「${kpi}」`, cells.replaceAll(' ', '').includes(kpi.replaceAll(' ', '')));
    }
    const subSheet = orgSheets.find((s) => s.name === '当前订阅');
    check('机构主控台/当前订阅:含配额行', !!subSheet && subSheet.rows.length > 0);
  }

  // —— DataBoard 7 Sheet ——
  const board = ORG_SPECS.find((s) => /数据看板/.test(s.page));
  check('机构后台:注册了数据看板导出', !!board);
  if (board) {
    // 0806-3：Sheet 结构对齐页面栏目——活跃概览 / 用户留存 / 区间分析（四主题 Tab 合一，首列标 Tab 名）
    const spec = board.build();
    const names = spec.sheets.map((s) => s.name);
    for (const need of ['活跃概览', '用户留存', '区间分析']) {
      check(`数据看板:含 Sheet「${need}」`, names.some((n) => n.includes(need)), `实际 ${names.join('、')}`);
    }
    const rangeSheet = spec.sheets.find((s) => s.name === '区间分析');
    check('数据看板/区间分析:首列为主题 Tab', !!rangeSheet && rangeSheet.headers[0] === '主题 Tab');
    for (const tab of ['用户分析', '提问分析', '营收分析', '热门 KP']) {
      check(`数据看板/区间分析:覆盖 Tab「${tab}」`, !!rangeSheet && rangeSheet.rows.some((r) => r[0] === tab));
    }
  }

  // —— 新增导出四页注册齐全 ——
  for (const page of ['机构管理', '机构账户', '知识产品', '平台账户']) {
    check(`平台后台:注册了「${page}」导出`, PLATFORM_SPECS.some((s) => s.page.includes(page)));
  }

  // —— 模板产物一致性（若已生成） ——
  const outDir = path.join(__dirname, '..', 'docs', 'export-templates');
  if (fs.existsSync(outDir)) {
    const files = fs.readdirSync(outDir).filter((f) => f.endsWith('.xlsx'));
    const total = ORG_SPECS.length + PLATFORM_SPECS.length;
    check('模板产物数=注册 spec 数', files.length === total, `${files.length} vs ${total}`);
    check('模板 README 存在', fs.existsSync(path.join(outDir, 'README.md')));
  }

  console.log(`\n导出 spec 测试：${pass} 通过 / ${fail} 失败`);
  if (failures.length) {
    console.log(failures.join('\n'));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
