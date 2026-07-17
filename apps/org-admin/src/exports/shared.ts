// 0714：导出 spec 公用小工具（纯函数，node --experimental-strip-types 可直接运行）。
// 注意：本目录不得 import react / .tsx / css / window；@aba/ui-admin 只允许 type 引用。

/** 预设区间折算为 yyyy-mm-dd 起止（end=今天，start=今天-(days-1)）；days<=0 视为「不限」，不带起止 */
export function periodOf(days: number, label: string): { label: string; start?: string; end?: string } {
  if (!days || days <= 0) return { label };
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  return { label, start: fmt(start), end: fmt(end) };
}

// 与 @aba/ui-admin format.fmtCn 同口径的中文万进制（spec 需 node 可运行，不能引 ui-admin 运行时，故本地复刻）。
// 规则：|n| < 1万 → 千分位原值；1万 ≤ |n| < 1亿 → X.X万；|n| ≥ 1亿 → X.XX亿。
function trimZero(v: number, d: number): string {
  let s = v.toFixed(d);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}
export function fmtCnLite(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e8) return trimZero(n / 1e8, 2) + '亿';
  if (abs >= 1e4) return trimZero(n / 1e4, 1) + '万';
  return n.toLocaleString('en-US');
}

// 环比方向标识：升 ↑ / 降 ↓ / 持平 —，配百分比或绝对差，让读数人一眼看出升降（不再只写「9.2%」）。
// pct：环比百分比（正=升，负=降）；suffix 默认「%」，率类可传「个百分点」、时长类传「秒」等。
export function deltaArrow(pct: number, suffix = '%'): string {
  if (pct > 0) return `↑ +${Math.abs(pct).toFixed(1)}${suffix}`;
  if (pct < 0) return `↓ -${Math.abs(pct).toFixed(1)}${suffix}`;
  return `— 持平`;
}
