import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Conversation, Order, Role, User } from './types';
import { DEFAULT_ORG_ID, ORGS, KPS, SEED_CONVERSATIONS, SEED_ORDERS } from './data';

const buildUser = (orgId: string, role: Role, phoneBound = true): User => {
  const base: User = {
    id: 'user_demo',
    orgId,
    openId: 'wx_demo_open_id_xxxx',
    phone: role === 'guest' || !phoneBound ? undefined : '138****1234',
    nickname: '微信昵称A',
    avatar: undefined,
    gender: 'female',
    region: '上海市 · 浦东新区',
    bookGrants: [
      { kpId: 'kp_cardio', scannedAt: '2026-05-20', grant: 'member' },
      { kpId: 'kp_endo', scannedAt: '2026-04-08', grant: 'member' },
      { kpId: 'kp_xie', scannedAt: '2026-02-15', grant: 'forever' },
    ],
    membership: { userId: 'user_demo', orgId, state: 'none', autoRenew: false },
    permanentGrants: [],
  };
  if (role === 'member' || role === 'member_permanent') {
    base.membership = {
      userId: 'user_demo',
      orgId,
      state: 'active',
      expiresAt: '2026-08-12',
      autoRenew: true,
    };
  }
  if (role === 'permanent_only' || role === 'member_permanent') {
    base.permanentGrants = [
      { userId: 'user_demo', orgId, kpId: 'kp_cardio', grantedAt: '2026-03-15' },
    ];
  }
  return base;
};

interface PaymentSetting {
  result: 'success' | 'failure' | 'cancel';
  delayMs: number;
}

interface DemoStore {
  // 当前角色 / 当前机构（可在演示控制台切换）
  role: Role;
  orgId: string;
  // 业务态
  user: User;
  conversations: Conversation[];
  orders: Order[];
  // 演示开关
  paymentSetting: PaymentSetting;
  showDemoConsole: boolean;
  // 0613 登录演示：浏览器环境（微信内 / 非微信）+ 手机号绑定态
  wechatEnv: boolean;
  phoneBound: boolean;
  // 操作
  setRole: (r: Role) => void;
  setOrg: (orgId: string) => void;
  setPaymentSetting: (s: Partial<PaymentSetting>) => void;
  toggleDemoConsole: () => void;
  setWechatEnv: (v: boolean) => void;
  wechatLogin: () => void;
  phoneLogin: () => void;
  bindPhone: () => void;
  updateProfile: (patch: Partial<Pick<User, 'gender' | 'region' | 'avatar' | 'nickname'>>) => void;
  resetAll: () => void;
  // 业务操作
  upsertConversation: (c: Conversation) => void;
  appendMessage: (convId: string, msg: Conversation['messages'][number]) => void;
  updateMessage: (convId: string, msgId: string, patch: Partial<Conversation['messages'][number]>) => void;
  addOrder: (o: Order) => void;
  grantMembership: () => void;
  cancelMembershipRenewal: () => void;
  grantPermanent: (kpId: string) => void;
  revokeAllGrants: () => void;
}

const initialState = (role: Role = 'free', orgId: string = DEFAULT_ORG_ID) => ({
  role,
  orgId,
  user: buildUser(orgId, role, true),
  conversations: SEED_CONVERSATIONS,
  orders: SEED_ORDERS,
  paymentSetting: { result: 'success' as const, delayMs: 2400 },
  showDemoConsole: true,
  wechatEnv: true,
  phoneBound: true,
});

export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      ...initialState(),
      setRole: (role) => {
        const s = get();
        const fresh = buildUser(s.orgId, role, s.phoneBound);
        // 仅按角色切换会员 / 永享，保留身份信息（微信 / 手机号 / 昵称 / 头像 / 性别 / 地区 / 纸书）
        set({
          role,
          user: {
            ...fresh,
            openId: s.user.openId,
            phone: s.user.phone,
            nickname: s.user.nickname,
            avatar: s.user.avatar,
            gender: s.user.gender,
            region: s.user.region,
            bookGrants: s.user.bookGrants,
          },
        });
      },
      setOrg: (orgId) =>
        set({ orgId, user: buildUser(orgId, get().role, get().phoneBound) }),
      setPaymentSetting: (s) =>
        set({ paymentSetting: { ...get().paymentSetting, ...s } }),
      toggleDemoConsole: () => set({ showDemoConsole: !get().showDemoConsole }),
      setWechatEnv: (v) => set({ wechatEnv: v }),
      // 微信授权成功：带回头像 / 昵称 / 性别 / 地区；手机号未绑（H5 无法获取手机号）
      wechatLogin: () =>
        set((s) => ({
          phoneBound: false,
          user: {
            ...s.user,
            openId: 'wx_demo_open_id_xxxx',
            nickname: '微信昵称A',
            gender: 'female',
            region: '上海市 · 浦东新区',
            phone: undefined,
          },
        })),
      // 手机号验证码登录：不获取 / 绑定微信信息
      phoneLogin: () =>
        set((s) => ({ phoneBound: true, user: { ...s.user, openId: undefined, phone: '138****1234' } })),
      // 绑定 / 换绑手机号成功
      bindPhone: () =>
        set((s) => ({ phoneBound: true, user: { ...s.user, phone: '138****1234' } })),
      updateProfile: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),
      resetAll: () => set(initialState(get().role, get().orgId)),
      upsertConversation: (c) =>
        set({
          conversations: [c, ...get().conversations.filter((x) => x.id !== c.id)],
        }),
      appendMessage: (convId, msg) =>
        set({
          conversations: get().conversations.map((c) =>
            c.id === convId
              ? { ...c, messages: [...c.messages, msg], updatedAt: msg.createdAt }
              : c,
          ),
        }),
      updateMessage: (convId, msgId, patch) =>
        set({
          conversations: get().conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...patch } : m)),
                }
              : c,
          ),
        }),
      addOrder: (o) => set({ orders: [o, ...get().orders] }),
      grantMembership: () => {
        const role = get().role === 'permanent_only' ? 'member_permanent' : 'member';
        get().setRole(role);
      },
      cancelMembershipRenewal: () =>
        set({
          user: {
            ...get().user,
            membership: {
              ...get().user.membership,
              autoRenew: false,
            },
          },
        }),
      grantPermanent: (kpId) => {
        const role = get().role === 'member' ? 'member_permanent' : 'permanent_only';
        get().setRole(role);
        const u = get().user;
        const exists = u.permanentGrants.find((g) => g.kpId === kpId);
        if (!exists) {
          set({
            user: {
              ...u,
              permanentGrants: [
                ...u.permanentGrants,
                { userId: u.id, orgId: u.orgId, kpId, grantedAt: new Date().toISOString().slice(0, 10) },
              ],
            },
          });
        }
      },
      revokeAllGrants: () => get().setRole('free'),
    }),
    {
      name: 'aba-demo',
      // 0613：User 结构新增 gender/region/bookGrants 与登录演示开关，bump 版本以重置过期持久态
      version: 2,
    },
  ),
);

// 角色显示名（演示控制台用）
export const ROLE_LABELS: Record<Role, string> = {
  guest: '未登录',
  free: '免费用户',
  member: 'AI 会员',
  permanent_only: '免费 + 永享',
  member_permanent: '会员 + 永享',
};

// 选择器：当前机构对象
export const useCurrentOrg = () => {
  const orgId = useDemoStore((s) => s.orgId);
  return ORGS.find((o) => o.id === orgId)!;
};

// 选择器：当前机构下可见的 KP
export const useOrgKps = () => {
  const orgId = useDemoStore((s) => s.orgId);
  return KPS.filter((k) => k.orgId === orgId);
};

// 选择器：当前用户对某 KP 的多模态可见性
export const useAssetVisibility = () => {
  const role = useDemoStore((s) => s.role);
  const grants = useDemoStore((s) => s.user.permanentGrants);
  return (assetTag: 'free' | 'member' | 'forever', kpId?: string) => {
    if (assetTag === 'free') return 'unlocked' as const;
    // permanent 已购解锁
    if (kpId && grants.some((g) => g.kpId === kpId)) return 'unlocked' as const;
    if (assetTag === 'member') {
      return role === 'member' || role === 'member_permanent' ? 'unlocked' : 'locked';
    }
    if (assetTag === 'forever') {
      return 'locked' as const;
    }
    return 'locked' as const;
  };
};
