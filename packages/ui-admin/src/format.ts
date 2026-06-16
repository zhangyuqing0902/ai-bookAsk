// 0614b：指标数值格式化——中文万进制（个 / 万 / 亿），符合中文后台看板行规。
// 规则：|n| < 1万 → 千分位原值（8,204）；1万 ≤ |n| < 1亿 → X.X万；|n| ≥ 1亿 → X.XX亿。
// Token 同此规则（与配额额度 2亿 / 10亿 一致）。比率 / 时长 / 容量不缩写。
function trimZero(v: number, d: number): string {
  let s = v.toFixed(d);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}

export function fmtCn(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e8) return trimZero(n / 1e8, 2) + '亿';
  if (abs >= 1e4) return trimZero(n / 1e4, 1) + '万';
  return n.toLocaleString('en-US');
}

export function fmtMoney(n: number): string {
  return '¥' + fmtCn(n);
}

// 各看板页脚的「数值单位规范 + 典型案例」说明（她要求规则在界面体现）
export const UNIT_NOTE =
  '单位：金额 ¥ · 计数 个 / 条 / 次 / 单 / 人 · Token 万 / 亿；大数按万 / 亿缩写，如 1.2万 = 12,000、1.05亿 = 105,000,000。';
