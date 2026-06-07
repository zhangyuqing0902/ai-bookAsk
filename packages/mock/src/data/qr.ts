import type { QrPackage } from '../types';

export const QR_PACKAGES: QrPackage[] = [
  {
    id: 'qrpkg_001',
    orgId: 'org_med',
    kpId: 'kp_cardio',
    mode: 'kp',
    grantMode: 'first_scan_grant',
    count: 50000,
    createdAt: '2026-04-12',
    stats: {
      totalScans: 23148,
      firstScanBound: 18642,
      rescans: 4506,
      rescanLogins: 2873,
    },
  },
  {
    id: 'qrpkg_002',
    orgId: 'org_med',
    kpId: 'kp_cardio',
    mode: 'kp',
    grantMode: 'none',
    count: 1,
    createdAt: '2026-04-20',
    stats: {
      totalScans: 1820,
      firstScanBound: 0,
      rescans: 1820,
      rescanLogins: 1043,
    },
  },
  {
    id: 'qrpkg_003',
    orgId: 'org_med',
    kpId: 'kp_endo',
    mode: 'kp',
    grantMode: 'first_scan_grant',
    count: 10000,
    createdAt: '2026-03-22',
    stats: {
      totalScans: 7423,
      firstScanBound: 5891,
      rescans: 1532,
      rescanLogins: 882,
    },
  },
];
