import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PLATFORM_ORGS, type PlatformOrg } from '@aba/mock';

// 0714 #1：机构层级调整（子机构改父 / 取消关联）。
// 机构主数据 PLATFORM_ORGS 仍是单一事实源，这里只存「层级覆盖」：id → 新上级 ID（null = 顶级）。
// 所有读机构树的页面（OrgList / OrgDetail / 主控台 / 模型用量）经 effectiveOrgs 拿应用覆盖后的数据，
// 父 / 子 / 普通三态继续由 platformOrgRole 从（覆盖后的）树推导——取消关联后原父机构若再无子机构，
// 其父机构身份自动解除，无需额外处理。

interface OrgTreeState {
  /** 机构层级覆盖：机构 ID → 新上级机构 ID（null = 顶级机构） */
  parentOverrides: Record<string, string | null>;
  setParent: (id: string, parentId: string | null) => void;
}

export const useOrgTree = create<OrgTreeState>()(
  persist(
    (set) => ({
      parentOverrides: {},
      setParent: (id, parentId) =>
        set((s) => ({ parentOverrides: { ...s.parentOverrides, [id]: parentId } })),
    }),
    { name: 'aba-platform-org-tree' },
  ),
);

/** 对任意机构数组应用层级覆盖（OrgList 有本地新增机构，也走这条路径） */
export function applyOrgOverrides(orgs: PlatformOrg[], overrides: Record<string, string | null>): PlatformOrg[] {
  return orgs.map((o) => (o.id in overrides && overrides[o.id] !== o.parentId ? { ...o, parentId: overrides[o.id]! } : o));
}

/** PLATFORM_ORGS 应用覆盖后的机构主数据（非组件上下文可直接调用） */
export function effectiveOrgs(overrides?: Record<string, string | null>): PlatformOrg[] {
  return applyOrgOverrides(PLATFORM_ORGS, overrides ?? useOrgTree.getState().parentOverrides);
}
