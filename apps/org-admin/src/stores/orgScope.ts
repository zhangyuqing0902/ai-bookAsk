import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrgType } from '@aba/mock';

// 0806：机构类型演示切换（父机构 / 子机构 / 独立机构，仅原型演示、非上线功能）。
// 上线后由登录账号所属机构在机构主数据中的父子关系决定；这里 persist 到 localStorage 便于评审连续演示。
interface OrgScopeStore {
  orgType: OrgType;
  setOrgType: (t: OrgType) => void;
}

export const useOrgScope = create<OrgScopeStore>()(
  persist(
    (set) => ({
      orgType: 'ordinary', // 默认独立机构＝界面保持现状，演示父机构能力时手动切换
      setOrgType: (t) => set({ orgType: t }),
    }),
    { name: 'aba-org-scope' },
  ),
);
