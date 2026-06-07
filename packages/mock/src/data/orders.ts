import type { Order } from '../types';

export const SEED_ORDERS: Order[] = [
  {
    id: 'WX2026050810300001',
    userId: 'user_demo',
    orgId: 'org_med',
    type: 'membership',
    amount: 19,
    status: 'paid',
    createdAt: '2026-04-12T09:30:00Z',
  },
  {
    id: 'WX2026031514220001',
    userId: 'user_demo',
    orgId: 'org_med',
    type: 'permanent',
    amount: 4.9,
    status: 'paid',
    kpId: 'kp_cardio',
    createdAt: '2026-03-15T14:22:00Z',
  },
  {
    id: 'RD2026020100010001',
    userId: 'user_demo',
    orgId: 'org_med',
    type: 'redeem',
    amount: 0,
    status: 'paid',
    redeemCode: 'MED-2026-VIP-XXXX',
    createdAt: '2026-02-01T10:00:00Z',
  },
];
