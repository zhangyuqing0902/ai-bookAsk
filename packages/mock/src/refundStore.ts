import { create } from 'zustand';

// 后台订单退款（机构后台 + 平台后台共用一份状态）。0614b 下沉到 @aba/mock。
// 退款状态独立成列（未/退款中/部分/全额退款，与订单状态解耦）；发起人 = 登录机构账户名 + 真实姓名。
export interface RefundEvent {
  time: string;
  label: string;
}
export type RefundStatus = '退款中' | '部分退款' | '全额退款';
export interface RefundInfo {
  status: RefundStatus;
  refundedAmount: number; // 累计已退
  account: string; // 退回账户
  by: string; // 发起人（账户名 + 真实姓名）
  timeline: RefundEvent[];
}

// 当前登录的机构后台账户（对齐顶栏 UserMenu 的 张三 · 管理员）
export const OPERATOR = { account: 'xxcbs.admin', name: '张三' };
export const operatorLabel = `${OPERATOR.account}（${OPERATOR.name}）`;

interface RefundStore {
  refunds: Record<string, RefundInfo>;
  /** 发起退款：先置「退款中」+ 时间线，1.5s 后模拟商户退款成功 → 全额「全额退款」/ 部分「部分退款」 */
  startRefund: (orderId: string, amount: number, orderAmount: number, account: string, onSuccess?: () => void) => void;
}

const now = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

// 预置 2 笔历史退款，让机构后台 / 平台后台「退款状态」列开箱即有数据演示
const SEED_REFUNDS: Record<string, RefundInfo> = {
  OD20260525170612: {
    status: '全额退款',
    refundedAmount: 19.9,
    account: '原路退回 · 微信支付',
    by: operatorLabel,
    timeline: [
      { time: '2026-05-26 10:02:11', label: `${operatorLabel} 发起退款 ¥19.90` },
      { time: '2026-05-26 10:02:13', label: '退款成功 · ¥19.90 已原路退回（原路退回 · 微信支付）' },
    ],
  },
  OD20260528103412: {
    status: '部分退款',
    refundedAmount: 98,
    account: '原路退回 · 微信支付',
    by: operatorLabel,
    timeline: [
      { time: '2026-05-29 09:14:50', label: `${operatorLabel} 发起退款 ¥98.00` },
      { time: '2026-05-29 09:14:52', label: '退款成功 · ¥98.00 已原路退回（原路退回 · 微信支付）' },
    ],
  },
};

export const useRefundStore = create<RefundStore>((set, get) => ({
  refunds: SEED_REFUNDS,
  startRefund: (orderId, amount, orderAmount, account, onSuccess) => {
    const prev = get().refunds[orderId];
    const total = (prev?.refundedAmount ?? 0) + amount;
    set({
      refunds: {
        ...get().refunds,
        [orderId]: {
          status: '退款中',
          refundedAmount: total,
          account,
          by: operatorLabel,
          timeline: [...(prev?.timeline ?? []), { time: now(), label: `${operatorLabel} 发起退款 ¥${amount.toFixed(2)}` }],
        },
      },
    });
    setTimeout(() => {
      const cur = get().refunds[orderId];
      if (!cur) return;
      const finalStatus: RefundStatus = cur.refundedAmount >= orderAmount - 1e-6 ? '全额退款' : '部分退款';
      set({
        refunds: {
          ...get().refunds,
          [orderId]: {
            ...cur,
            status: finalStatus,
            timeline: [...cur.timeline, { time: now(), label: `退款成功 · ¥${amount.toFixed(2)} 已原路退回（${account}）` }],
          },
        },
      });
      onSuccess?.();
    }, 1500);
  },
}));
