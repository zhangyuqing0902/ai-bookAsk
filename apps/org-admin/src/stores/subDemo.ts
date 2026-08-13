import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MY_ORG_SUBS, MY_ORG_SUBS_EXPIRED, MY_ORG_SUBS_UNLIMITED, MY_ORG_SUBS_OVER, type Subscription } from '@aba/mock';

// 0812-e / 0812-g：〔演示〕订阅状态切换（正常 / 不限 / 全部过期 / 未开通，仅原型演示、非上线功能）。
// 0813-2：补第五态「降档超额」，并把状态从主控台的局部 state 提升为共享 store——
//   配额是跨页面的机构级事实：主控台切了「降档超额」，KP 列表的配额 chip 与新建阻断必须同步，
//   否则评审在两个页面看到自相矛盾的额度。persist 到 localStorage 便于评审连续演示。
export type SubDemo = 'normal' | 'unlimited' | 'expired' | 'none' | 'over';

export const SUB_DEMO_LABEL: Record<SubDemo, string> = {
  normal: '正常',
  unlimited: '不限',
  expired: '全部过期',
  none: '未开通',
  over: '降档超额',
};

export const SUB_DEMO_SUBS: Record<SubDemo, Subscription[]> = {
  normal: MY_ORG_SUBS,
  unlimited: MY_ORG_SUBS_UNLIMITED,
  expired: MY_ORG_SUBS_EXPIRED,
  none: [],
  over: MY_ORG_SUBS_OVER,
};

interface SubDemoStore {
  subDemo: SubDemo;
  setSubDemo: (d: SubDemo) => void;
}

export const useSubDemo = create<SubDemoStore>()(
  persist(
    (set) => ({
      subDemo: 'normal',
      setSubDemo: (d) => set({ subDemo: d }),
    }),
    { name: 'aba-sub-demo' },
  ),
);
