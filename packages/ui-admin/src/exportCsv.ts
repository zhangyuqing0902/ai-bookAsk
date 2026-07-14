export function exportCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const csv = '\uFEFF' + [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');
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
  subtitle?: string;
  headers: string[];
  rows: Array<Array<string | number | null | undefined>>;
  widths?: number[];
}

export async function exportWorkbook(filename: string, sheets: ExportSheet[], exportedAt = new Date()) {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AI 问书';
  workbook.created = exportedAt;
  workbook.modified = exportedAt;
  const stamp = exportedAt.toLocaleString('zh-CN', { hour12: false });

  for (const spec of sheets) {
    const sheet = workbook.addWorksheet(spec.name.slice(0, 31), { views: [{ showGridLines: false }] });
    const colCount = Math.max(1, spec.headers.length);
    sheet.mergeCells(1, 1, 1, colCount);
    const title = sheet.getCell(1, 1);
    title.value = spec.title;
    title.font = { name: 'Microsoft YaHei', size: 16, bold: true, color: { argb: 'FF1F2440' } };
    title.alignment = { vertical: 'middle', horizontal: 'left' };
    title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F4FF' } };
    sheet.getRow(1).height = 34;

    sheet.mergeCells(2, 1, 2, colCount);
    const meta = sheet.getCell(2, 1);
    meta.value = `${spec.subtitle ? `${spec.subtitle} · ` : ''}导出时间：${stamp}`;
    meta.font = { name: 'Microsoft YaHei', size: 10, color: { argb: 'FF6B7185' } };
    meta.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    sheet.getRow(2).height = 25;

    const headerRow = sheet.getRow(4);
    headerRow.values = spec.headers;
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Microsoft YaHei', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3730A3' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = { bottom: { style: 'medium', color: { argb: 'FF252069' } } };
    });

    spec.rows.forEach((values, index) => {
      const row = sheet.addRow(values.map((v) => v ?? '—'));
      row.height = 24;
      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Microsoft YaHei', size: 10, color: { argb: 'FF33384F' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: index % 2 ? 'FFF8F9FC' : 'FFFFFFFF' } };
        cell.alignment = { vertical: 'middle', horizontal: typeof cell.value === 'number' ? 'right' : 'left', wrapText: true };
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFE3E6EF' } } };
        if (colNumber === 1) cell.font = { ...cell.font, bold: true };
      });
    });

    spec.headers.forEach((_, index) => {
      sheet.getColumn(index + 1).width = spec.widths?.[index] ?? (index === 0 ? 20 : 24);
    });
    sheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4, column: colCount } };
    sheet.views = [{ state: 'frozen', ySplit: 4, showGridLines: false }];
    sheet.pageSetup = { orientation: colCount > 6 ? 'landscape' : 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
