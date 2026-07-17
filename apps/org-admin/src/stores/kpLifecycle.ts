import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 0716 #1.1：KP 下架 / 删除真状态（zustand + persist，仅覆盖被操作过的 KP）。
// key = KP 列表下钻用的路由 id（KPS 内联数据序号），value = 覆盖后的生命周期状态；
// 未被操作过的 KP 不落 overrides，沿用内联数据的原始状态。deleted＝软删除（下线内容、保留审计）。
export type KpLifecycleStatus = 'published' | 'unlisted' | 'deleted';

interface KpLifecycleStore {
  overrides: Record<string, KpLifecycleStatus>;
  setStatus: (id: string, s: KpLifecycleStatus) => void;
}

export const useKpLifecycle = create<KpLifecycleStore>()(
  persist(
    (set) => ({
      overrides: {},
      setStatus: (id, s) => set((st) => ({ overrides: { ...st.overrides, [id]: s } })),
    }),
    {
      name: 'aba-org-kp-lifecycle',
      // 0716 #1.1：旧持久化里的 'archived' 已并入 'deleted'——迁移，避免未知状态值导致详情页崩溃空白。
      version: 1,
      migrate: (persisted: unknown) => {
        const st = (persisted as { overrides?: Record<string, string> }) ?? {};
        const overrides = st.overrides ?? {};
        const fixed: Record<string, KpLifecycleStatus> = {};
        for (const [id, v] of Object.entries(overrides)) {
          fixed[id] = v === 'archived' ? 'deleted' : (v as KpLifecycleStatus);
        }
        return { overrides: fixed } as KpLifecycleStore;
      },
    },
  ),
);
