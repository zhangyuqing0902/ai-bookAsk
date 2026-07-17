// 机构套餐预设上限（0714 从 OrgList.tsx 视图下移，供视图与导出 spec 共用）。
// KP 个 / 存储 GB / 当前订阅周期 Token 亿，与机构详情套餐一致；定制版上限走 org.custom。
// 本文件须保持 node 可运行（不 import react / .tsx / css / window）。
import type { PlatformOrg } from '@aba/mock';

export const PLAN_Q: Record<string, { kp: number; storage: number; token: number }> = {
  基础版: { kp: 10, storage: 20, token: 0.5 },
  专业版: { kp: 50, storage: 100, token: 2 },
  旗舰版: { kp: 200, storage: 500, token: 10 },
};

export const limitOf = (r: PlatformOrg) => r.custom ?? PLAN_Q[r.plan];
