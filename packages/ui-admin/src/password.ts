// 0615-3：后台账户密码规则与生成器（机构账户 / 平台账户 / 个人中心改密码共用）。
// 规则：8–16 位；至少同时包含字母和数字；区分大小写；可含特殊字符；不含空格。
export const PASSWORD_RULE = '8–16 位，至少同时包含字母和数字，区分大小写，可含特殊字符，不含空格';

const U = 'ABCDEFGHJKMNPQRSTUVWXYZ';
const L = 'abcdefghijkmnpqrstuvwxyz';
const D = '23456789';
const S = '!@#$%';

// 生成 10 位随机密码（保证含大写 / 小写 / 数字 / 特殊各 ≥1，排除易混字符）
export function genPassword(): string {
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  const out = [pick(U), pick(L), pick(D), pick(S)];
  const all = U + L + D;
  for (let i = 0; i < 6; i++) out.push(pick(all));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join('');
}
