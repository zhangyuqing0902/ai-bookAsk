// 机构账户批量导入（0918 新增）——模板生成 + 文件解析 + 错误明细 / 导入结果 spec。
// 约束同 accounts.ts：node 可运行（不 import react / .tsx / css / window），scripts 可直接跑来验证。
// 解析按「表头名」取列：导入模板与「导出」文件都能直接回传（导出多出的账户 ID / 上级机构 / 状态列忽略）。
import type { ExportSpec } from '@aba/ui-admin';
import {
  ACCOUNT_IMPORT_HEADERS,
  ACCOUNT_IMPORT_LIMIT,
  ACCOUNT_NAME_RULE,
  type AccountImportIssue,
  type AccountImportRow,
} from '../../../../packages/mock/src/rules.ts';

export const ACCOUNT_IMPORT_TEMPLATE_NAME = 'AI问书_全域机构账户导入模板.xlsx';
export const ACCOUNT_IMPORT_ORGS = ['XX 出版集团', 'YY 教育', 'ZZ 少儿'];
export const ACCOUNT_IMPORT_ROLES = ['管理员', '运营', '只读'];

const REQUIRED_FOR_NEW = new Set(['账户名', '姓名', '机构', '角色']);

export const ACCOUNT_IMPORT_TIPS = [
  `单次最多 ${ACCOUNT_IMPORT_LIMIT} 条，超出请拆分文件分批导入`,
  '按「账户名」匹配：已存在则更新，不存在则新建',
  '新建时账户名 / 姓名 / 机构 / 角色必填；密码留空由系统生成',
  '更新时留空的单元格不修改；填写密码即重置为该密码',
];

async function loadExcel() {
  const ExcelJS = await import('exceljs');
  return (ExcelJS as any).Workbook ?? (ExcelJS as any).default.Workbook;
}

/** 导入模板：行1 标题 / 行2 填写说明 / 行3 表头（必填列赭色底）/ 行4 起填数据 */
export async function buildAccountImportTemplate() {
  const WorkbookCtor = await loadExcel();
  const wb = new WorkbookCtor();
  wb.creator = 'AI 问书';
  const sheet = wb.addWorksheet('机构账户导入', { views: [{ state: 'frozen', ySplit: 3, showGridLines: false }] });
  const n = ACCOUNT_IMPORT_HEADERS.length;

  sheet.mergeCells(1, 1, 1, n);
  const title = sheet.getCell(1, 1);
  title.value = '机构账户批量导入模板';
  title.font = { name: 'Microsoft YaHei', size: 16, bold: true, color: { argb: 'FF1F2440' } };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F4FF' } };
  title.alignment = { vertical: 'middle' };
  sheet.getRow(1).height = 34;

  sheet.mergeCells(2, 1, 2, n);
  const tip = sheet.getCell(2, 1);
  tip.value = [
    '填写说明：' + ACCOUNT_IMPORT_TIPS.map((t, i) => `${i + 1}）${t}`).join('；'),
    `账户名：${ACCOUNT_NAME_RULE}；密码：8–16 位，同时含字母和数字，不含空格；机构：${ACCOUNT_IMPORT_ORGS.join(' / ')}；角色：${ACCOUNT_IMPORT_ROLES.join(' / ')}；联系电话：11 位手机号，可留空。`,
    '赭色表头为新建必填列。请从第 4 行开始填写，不要修改表头。',
  ].join('\n');
  tip.font = { name: 'Microsoft YaHei', size: 10, color: { argb: 'FF6B7185' } };
  tip.alignment = { vertical: 'top', wrapText: true };
  sheet.getRow(2).height = 78;

  const header = sheet.getRow(3);
  header.values = [...ACCOUNT_IMPORT_HEADERS];
  header.height = 28;
  header.eachCell((cell: any) => {
    const req = REQUIRED_FOR_NEW.has(String(cell.value));
    cell.font = { name: 'Microsoft YaHei', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: req ? 'FFC2410C' : 'FF3730A3' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  [18, 18, 12, 18, 12, 18].forEach((w, i) => { sheet.getColumn(i + 1).width = w; });
  // 文本格式：避免手机号 / 纯数字密码被 Excel 转成数字或科学计数法
  for (let c = 1; c <= n; c++) sheet.getColumn(c).numFmt = '@';
  // 机构 / 角色列下拉，降低填错率
  for (let r = 4; r <= ACCOUNT_IMPORT_LIMIT + 3; r++) {
    sheet.getCell(r, 4).dataValidation = { type: 'list', allowBlank: true, formulae: [`"${ACCOUNT_IMPORT_ORGS.join(',')}"`] };
    sheet.getCell(r, 5).dataValidation = { type: 'list', allowBlank: true, formulae: [`"${ACCOUNT_IMPORT_ROLES.join(',')}"`] };
  }
  return wb;
}

const cellText = (v: any): string => {
  if (v == null) return '';
  if (typeof v === 'object') {
    if (Array.isArray(v.richText)) return v.richText.map((t: any) => t.text).join('');
    if ('text' in v) return String(v.text ?? '');
    if ('result' in v) return String(v.result ?? '');
    if (v instanceof Date) return v.toISOString();
    return '';
  }
  return String(v);
};
const normHeader = (s: string) => s.replace(/[\s*＊]|（必填）|\(必填\)/g, '');

export type ParseResult = { ok: true; rows: AccountImportRow[] } | { ok: false; error: string };

/** 解析 xlsx：在前 10 行内定位含「账户名」的表头行，按表头名取列；整行为空的跳过 */
export async function parseAccountImportFile(buffer: ArrayBuffer): Promise<ParseResult> {
  const WorkbookCtor = await loadExcel();
  const wb = new WorkbookCtor();
  try {
    await wb.xlsx.load(buffer);
  } catch {
    return { ok: false, error: '文件无法解析，请使用 .xlsx 格式（可先下载导入模板）' };
  }
  const sheet = wb.worksheets[0];
  if (!sheet) return { ok: false, error: '文件中没有工作表' };
  let headerRow = 0;
  const col: Record<string, number> = {};
  for (let r = 1; r <= Math.min(10, sheet.rowCount); r++) {
    const row = sheet.getRow(r);
    const found: Record<string, number> = {};
    row.eachCell((cell: any, c: number) => { found[normHeader(cellText(cell.value))] = c; });
    if (found['账户名']) { headerRow = r; Object.assign(col, found); break; }
  }
  if (!headerRow) return { ok: false, error: '未找到表头「账户名」，请使用导入模板填写' };
  const missing = ACCOUNT_IMPORT_HEADERS.filter((h) => !col[h]);
  if (missing.length) return { ok: false, error: `缺少列：${missing.join('、')}，请使用导入模板填写` };

  const rows: AccountImportRow[] = [];
  const get = (row: any, h: string) => cellText(row.getCell(col[h]).value).trim();
  for (let r = headerRow + 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const item: AccountImportRow = {
      line: r,
      account: get(row, '账户名'),
      password: get(row, '密码'),
      person: get(row, '姓名'),
      org: get(row, '机构'),
      role: get(row, '角色'),
      contact: get(row, '联系电话'),
    };
    // 导出文件里空值写作「—」，回传时视同留空
    for (const k of ['password', 'person', 'org', 'role', 'contact'] as const) if (item[k] === '—') item[k] = '';
    if (!item.account && !item.password && !item.person && !item.org && !item.role && !item.contact) continue;
    rows.push(item);
  }
  if (!rows.length) return { ok: false, error: '文件中没有可导入的数据行' };
  return { ok: true, rows };
}

export function buildImportErrorSpec(errors: AccountImportIssue[]): ExportSpec {
  return {
    context: { scope: '全域', business: '机构账户导入错误明细' },
    sheets: [{
      name: '错误明细',
      title: '机构账户导入 · 错误明细（修正后可重新导入）',
      headers: ['文件行号', '账户名', '错误原因'],
      rows: errors.map((e) => [e.line, e.account, e.reasons.join('；')]),
      widths: [12, 20, 70],
    }],
  };
}

export interface ImportResultRow { type: '新建' | '更新'; account: string; password: string; person: string; org: string; role: string }
export function buildImportResultSpec(rows: ImportResultRow[]): ExportSpec {
  return {
    context: { scope: '全域', business: '机构账户导入结果' },
    sheets: [{
      name: '导入结果',
      title: '机构账户导入结果（含明文密码，请妥善保管）',
      subtitle: '密码列：新建账户为填写值或系统生成值；更新账户未填密码的显示「未修改」',
      headers: ['类型', '账户名', '密码', '姓名', '机构', '角色'],
      rows: rows.map((r) => [r.type, r.account, r.password, r.person, r.org, r.role]),
      widths: [10, 18, 16, 12, 20, 12],
    }],
  };
}
