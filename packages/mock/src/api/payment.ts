import type { Order, OrderType } from '../types';
import { useDemoStore } from '../store';
import { genOrderId, sleep, track } from './util';

export interface PayParams {
  type: OrderType;
  amount: number;
  kpId?: string;
  redeemCode?: string;
}

/** 模拟微信支付：返回订单 + 状态。结果由演示控制台 paymentSetting 控制。 */
export const wechatPay = async (params: PayParams): Promise<Order> => {
  const { type, amount, kpId, redeemCode } = params;
  const { paymentSetting, user, addOrder, grantMembership, grantPermanent } = useDemoStore.getState();

  track('paywall_pay_start', { type, amount, kpId });
  await sleep(paymentSetting.delayMs);

  const baseOrder: Order = {
    id: genOrderId(type === 'redeem' ? 'RD' : 'WX'),
    userId: user.id,
    orgId: user.orgId,
    type,
    amount,
    status: 'pending',
    kpId,
    redeemCode,
    createdAt: new Date().toISOString(),
  };

  if (paymentSetting.result === 'success') {
    const order = { ...baseOrder, status: 'paid' as const };
    addOrder(order);
    if (type === 'membership') grantMembership();
    if (type === 'permanent' && kpId) grantPermanent(kpId);
    if (type === 'redeem') grantMembership(); // 兑换码默认开会员演示
    track('pay_success', { order_type: type, amount });
    return order;
  }

  if (paymentSetting.result === 'cancel') {
    const order = { ...baseOrder, status: 'canceled' as const };
    addOrder(order);
    track('pay_cancel', { order_type: type });
    throw new Error('支付已取消');
  }

  // failure
  const order = { ...baseOrder, status: 'failed' as const };
  addOrder(order);
  track('pay_fail', { order_type: type });
  throw new Error('支付失败，请重试');
};

export const redeemCode = async (code: string): Promise<Order> => {
  track('redeem_attempt', { code });
  await sleep(800);
  if (!code || code.length < 6) {
    track('redeem_fail', { reason: 'invalid' });
    throw new Error('兑换码无效，请检查后重试');
  }
  if (code.toUpperCase().includes('USED')) {
    track('redeem_fail', { reason: 'used' });
    throw new Error('该兑换码已被使用');
  }
  return wechatPay({ type: 'redeem', amount: 0, redeemCode: code });
};
