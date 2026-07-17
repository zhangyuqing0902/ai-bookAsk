// 统一 XLSX 导出底座（0714 升级）
// - buildWorkbook：纯构建（浏览器 / node 双端共用，docs/export-templates 模板与页面导出同源）
// - exportWorkbook：浏览器侧构建 + Blob 下载
// - exportFilename：文件名规范「AI问书_{机构名｜全域}_{业务名}数据导出.xlsx」
// 注意：本文件及其 import 闭包须保持 node 可运行（不引 react / css / window 顶层依赖）。

export function exportCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const csv = '﻿' + [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export interface ExportSheet {
  name: string;
  title: string;
  /** sheet 级口径说明（如「留存率为独立 cohort 口径」），拼在导出时间行 */
  subtitle?: string;
  /** 'realtime'：本 Sheet 为实时指标，标注实时统计时间；'range'：标注统计区间起止 */
  kind?: 'realtime' | 'range';
  headers: string[];
  rows: Array<Array<string | number | null | undefined>>;
  widths?: number[];
}

export interface ExportContext {
  /** 机构名（机构后台取 MY_ORG）或 '全域'（平台后台） */
  scope: string;
  /** 业务名，如 'C端用户'、'订单管理'、'主控台' */
  business: string;
  /** 导出时刻的筛选条件（有序键值对），如 [['会员状态','全部'],['关键词','无']] */
  filters?: Array<[string, string]>;
  /** 实时指标统计时间（默认 = exportedAt） */
  realtimeAt?: Date;
  /** 区间指标的统计区间 */
  period?: { label: string; start?: string; end?: string };
  exportedAt?: Date;
}

export interface ExportSpec {
  context: ExportContext;
  sheets: ExportSheet[];
}

export function exportFilename(ctx: ExportContext): string {
  const scope = ctx.scope.replace(/\s+/g, '');
  const business = ctx.business.replace(/\s+/g, '');
  return scope === '全域' ? `AI问书_全域${business}数据导出.xlsx` : `AI问书_${scope}_${business}数据导出.xlsx`;
}

const stampOf = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

function periodText(period?: ExportContext['period']) {
  if (!period) return '';
  const range = period.start && period.end ? `（${period.start} ~ ${period.end}）` : '';
  return `统计区间：${period.label}${range}`;
}

/** 纯构建：返回 exceljs Workbook（不触发下载），双端共用 */
export async function buildWorkbook(spec: ExportSpec) {
  const ExcelJS = await import('exceljs');
  const WorkbookCtor = (ExcelJS as any).Workbook ?? (ExcelJS as any).default.Workbook;
  const workbook = new WorkbookCtor();
  const exportedAt = spec.context.exportedAt ?? new Date();
  workbook.creator = 'AI 问书';
  workbook.created = exportedAt;
  workbook.modified = exportedAt;
  const stamp = stampOf(exportedAt);

  for (const sheetSpec of spec.sheets) {
    const sheet = workbook.addWorksheet(sheetSpec.name.slice(0, 31), { views: [{ showGridLines: false }] });
    const colCount = Math.max(1, sheetSpec.headers.length);

    // 行1 标题
    sheet.mergeCells(1, 1, 1, colCount);
    const title = sheet.getCell(1, 1);
    title.value = sheetSpec.title;
    title.font = { name: 'Microsoft YaHei', size: 16, bold: true, color: { argb: 'FF1F2440' } };
    title.alignment = { vertical: 'middle', horizontal: 'left' };
    title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F4FF' } };
    sheet.getRow(1).height = 34;

    // 行2 导出时间（实时 Sheet 另标实时统计时间；区间 Sheet 标区间起止）+ sheet 级口径说明
    sheet.mergeCells(2, 1, 2, colCount);
    const meta = sheet.getCell(2, 1);
    const metaParts = [`导出时间：${stamp}`];
    if (sheetSpec.kind === 'realtime') metaParts.push(`实时统计时间：${stampOf(spec.context.realtimeAt ?? exportedAt)}`);
    if (sheetSpec.kind === 'range') {
      const pt = periodText(spec.context.period);
      if (pt) metaParts.push(pt);
    }
    if (sheetSpec.subtitle) metaParts.push(sheetSpec.subtitle);
    meta.value = metaParts.join(' · ');
    meta.font = { name: 'Microsoft YaHei', size: 10, color: { argb: 'FF6B7185' } };
    meta.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    sheet.getRow(2).height = 25;

    // 行3 导出时刻的筛选条件
    sheet.mergeCells(3, 1, 3, colCount);
    const filterCell = sheet.getCell(3, 1);
    const filterText = (spec.context.filters ?? []).map(([k, v]) => `${k}＝${v || '无'}`).join(' · ');
    filterCell.value = `筛选条件：${filterText || '无（全量导出）'}`;
    filterCell.font = { name: 'Microsoft YaHei', size: 10, color: { argb: 'FF6B7185' } };
    filterCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    sheet.getRow(3).height = 22;

    // 行4 表头（深靛蓝底白字）
    const headerRow = sheet.getRow(4);
    headerRow.values = sheetSpec.headers;
    headerRow.height = 28;
    headerRow.eachCell((cell: any) => {
      cell.font = { name: 'Microsoft YaHei', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3730A3' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = { bottom: { style: 'medium', color: { argb: 'FF252069' } } };
    });

    sheetSpec.rows.forEach((values, index) => {
      const row = sheet.addRow(values.map((v) => v ?? '—'));
      row.height = 24;
      row.eachCell((cell: any, colNumber: number) => {
        cell.font = { name: 'Microsoft YaHei', size: 10, color: { argb: 'FF33384F' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: index % 2 ? 'FFF8F9FC' : 'FFFFFFFF' } };
        cell.alignment = { vertical: 'middle', horizontal: typeof cell.value === 'number' ? 'right' : 'left', wrapText: true };
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFE3E6EF' } } };
        if (colNumber === 1) cell.font = { ...cell.font, bold: true };
      });
    });

    sheetSpec.headers.forEach((_, index) => {
      sheet.getColumn(index + 1).width = sheetSpec.widths?.[index] ?? (index === 0 ? 20 : 24);
    });
    sheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4, column: colCount } };
    sheet.views = [{ state: 'frozen', ySplit: 4, showGridLines: false }];
    sheet.pageSetup = { orientation: colCount > 6 ? 'landscape' : 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } };
  }

  return workbook;
}

// 0716 #3：全平台统一导出上限。单次导出任一业务 Sheet 的数据行数超过此值即拦截，
// 弹窗引导缩小筛选范围或联系平台管理员导出完整数据。集中在 exportWorkbook 内拦截，16 处调用无需逐个改。
export const EXPORT_ROW_LIMIT = 10000;

function showExportLimitDialog(count: number, limit: number) {
  if (typeof document === 'undefined') return;
  const mask = document.createElement('div');
  mask.setAttribute('style', 'position:fixed;inset:0;z-index:9999;background:rgba(20,22,30,.44);display:flex;align-items:center;justify-content:center;');
  const box = document.createElement('div');
  box.setAttribute('style', 'width:428px;max-width:92vw;background:var(--surface,#fff);border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.24);padding:22px 24px;');
  const num = (n: number) => n.toLocaleString('en-US');
  box.innerHTML =
    '<div style="font-size:16px;font-weight:700;color:var(--ink,#1F2440);margin-bottom:10px;">导出条数超限</div>' +
    '<div style="font-size:13px;line-height:1.85;color:var(--ink-2,#4A4F66);">' +
    '本次筛选结果约 <b>' + num(count) + '</b> 条，超过单次导出上限 <b>' + num(limit) + '</b> 条。<br/>' +
    '请缩小筛选范围（如收窄时间区间或增加筛选条件）后重试，或联系平台管理员导出完整数据。</div>' +
    '<div style="display:flex;justify-content:flex-end;margin-top:18px;"></div>';
  const btn = document.createElement('button');
  btn.className = 'btn btn-primary btn-sm';
  btn.textContent = '我知道了';
  const close = () => mask.remove();
  btn.onclick = close;
  mask.onclick = (e) => { if (e.target === mask) close(); };
  (box.lastElementChild as HTMLElement).appendChild(btn);
  mask.appendChild(box);
  document.body.appendChild(mask);
}

/** 浏览器侧：构建 + 按规范文件名下载（超上限则拦截并弹窗，不下载） */
export async function exportWorkbook(spec: ExportSpec) {
  const maxRows = spec.sheets.reduce((m, s) => Math.max(m, s.rows.length), 0);
  if (maxRows > EXPORT_ROW_LIMIT) {
    showExportLimitDialog(maxRows, EXPORT_ROW_LIMIT);
    return;
  }
  const workbook = await buildWorkbook(spec);
  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = exportFilename(spec.context);
  link.click();
  URL.revokeObjectURL(url);
}
