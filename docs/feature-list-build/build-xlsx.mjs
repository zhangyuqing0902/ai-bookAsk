import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const inputPath = process.argv[2];
const outputPath = process.argv[3];
const previewDir = process.argv[4];
if (!inputPath || !outputPath || !previewDir) {
  throw new Error("usage: build-xlsx.mjs <input.json> <output.xlsx> <preview-dir>");
}

const data = JSON.parse(await fs.readFile(inputPath, "utf8"));
const workbook = Workbook.create();
const navy = "#172554";
const indigo = "#4F46E5";
const blue = "#2563EB";
const pale = "#EEF2FF";
const border = "#D9DCE5";

function styleSheet(sheet, lastRow, widths) {
  sheet.getRange(`A1:E${lastRow}`).format = {
    verticalAlignment: "top",
    wrapText: true,
    font: { name: "Arial", size: 10, color: "#222222" },
    borders: { color: border, style: "continuous", weight: 1 },
  };
  sheet.getRange("A1:E1").format = {
    fill: navy,
    font: { name: "Arial", size: 12, bold: true, color: "#FFFFFF" },
    horizontalAlignment: "left",
    verticalAlignment: "center",
  };
  sheet.getRange("A2:E2").format = {
    fill: indigo,
    font: { name: "Arial", size: 10, bold: true, color: "#FFFFFF" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
  };
  ["A", "B", "C", "D", "E"].forEach((col, i) => {
    sheet.getRange(`${col}:${col}`).format.columnWidth = widths[i];
  });
  sheet.getRange(`A3:E${lastRow}`).format.autofitRows();
  sheet.getRange("A1:E1").format.rowHeight = 32;
  sheet.getRange("A2:E2").format.rowHeight = 26;
}

function addFeatureSheet(name, rows) {
  const sheet = workbook.worksheets.add(name);
  const values = rows.map((r) => [
    r.module,
    r.feature,
    r.subfeature,
    r.bullets.map((b, i) => `（${i + 1}）${b.text}`).join("\n"),
    r.change ? `${data.changeDate}${r.change}：${r.changeSummary || "同步本次确认规则"}` : "—",
  ]);
  sheet.getRange("A1:E1").values = [[`AI 问书功能清单 · ${name} · v2.1 · 2026-07-11`, "", "", "", ""]];
  sheet.mergeCells("A1:E1");
  sheet.getRange("A2:E2").values = [["模块", "功能点", "二级功能", "功能描述 / 验收口径", "本次变更"]];
  if (values.length) sheet.getRange(`A3:E${values.length + 2}`).values = values;
  styleSheet(sheet, values.length + 2, [18, 24, 24, 90, 18]);
  rows.forEach((r, i) => {
    if (!r.change) return;
    const row = i + 3;
    sheet.getRange(`A${row}:E${row}`).format = {
      fill: pale,
      font: { name: "Arial", size: 10, color: blue },
      verticalAlignment: "top",
      wrapText: true,
      borders: { color: border, style: "continuous", weight: 1 },
    };
    sheet.getRange(`E${row}`).format.font = { name: "Arial", size: 10, bold: true, color: blue };
  });
  return sheet;
}

const sheetNames = [];
for (const [name, rows] of Object.entries(Object.groupBy(data.rows, (row) => row.duan))) {
  const short = name.replace("（C 端用户）", "").replace("（机构运营）", "").slice(0, 25);
  addFeatureSheet(short, rows);
  sheetNames.push(short);
}

function addAppendix(name, header, rows, widths) {
  const sheet = workbook.worksheets.add(name);
  sheet.getRange("A1:E1").values = [[`AI 问书 · ${name} · ${data.changeDate}更新`, "", "", "", ""]];
  sheet.mergeCells("A1:E1");
  const paddedHeader = [...header, ...Array(5 - header.length).fill("")];
  sheet.getRange("A2:E2").values = [paddedHeader];
  const values = rows.map((r) => [...r, ...Array(5 - r.length).fill("")]);
  sheet.getRange(`A3:E${values.length + 2}`).values = values;
  styleSheet(sheet, values.length + 2, widths);
  sheet.getRange(`A3:E${values.length + 2}`).format.font = { name: "Arial", size: 10, color: blue };
  sheet.getRange(`A3:E${values.length + 2}`).format.fill = pale;
  sheetNames.push(name);
}

addAppendix("指标周期与公式", data.boardHeader, data.board, [24, 44, 66, 35, 4]);
addAppendix("用量口径", data.usageHeader, data.usage, [28, 90, 4, 4, 4]);

await fs.mkdir(previewDir, { recursive: true });
for (const name of sheetNames) {
  const preview = await workbook.render({ sheetName: name, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(`${previewDir}/${name}.png`, new Uint8Array(await preview.arrayBuffer()));
}

const check = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log(check.ndjson);

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(JSON.stringify({ outputPath, sheetNames }));
