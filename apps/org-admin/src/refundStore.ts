import { create } from 'zustand';

// 0613 订单退款（机构后台演示态）：列表与详情共享，跨页保留。
export interface RefundEvent {
  time: string;
  label: string;
}
export interface RefundInfo {
  status: '退款中' | '已退款' | '部分退款';
  refundedAmount: number; // 累计已退
  account: string; // 退回账户
  timeline: RefundEvent[];
}

interface RefundStore {
  refunds: Record<string, RefundInfo>;
  /** 发起退款：先置「退款中」+ 时间线，1.5s 后模拟商户退款成功 → 全额「已退款」/ 部分「部分退款」 */
  startRefund: (orderId: string, amount: number, orderAmount: number, account: string, onSuccess?: () => void) => void;
}

const now = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

export const useRefundStore = create<RefundStore>((set, get) => ({
  refunds: {},
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
          timeline: [...(prev?.timeline ?? []), { time: now(), label: `运营发起退款 ¥${amount.toFixed(2)}` }],
        },
      },
    });
    setTimeout(() => {
      const cur = get().refunds[orderId];
      if (!cur) return;
      const finalStatus: RefundInfo['status'] = cur.refundedAmount >= orderAmount - 1e-6 ? '已退款' : '部分退款';
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
