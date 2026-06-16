// 业务类型（与 PRD 第 4 章 ER 对齐）

export type Role = 'guest' | 'free' | 'member' | 'permanent_only' | 'member_permanent';

export type AssetTag = 'free' | 'member' | 'forever';

export type AssetType = 'image' | 'audio' | 'video';

export type Gender = 'male' | 'female' | 'unknown';

export type Granularity = 'book' | 'series' | 'expert' | 'domain' | 'custom';

export interface Organization {
  id: string;
  name: string;
  shortName: string;
  brandColor: string;
  /**
   * 上级机构 ID。null / undefined = 顶级机构。
   * V1 约束：只允许一层（集团→分社）——能被选为上级的只能是「自身 parentId 为空」的机构，
   * 且已有下级的机构不可再设上级，从而杜绝三层套娃与自环。
   */
  parentId?: string | null;
  serviceQrUrl?: string;
  servicePhone?: string;
  serviceEmail?: string;
}

export interface KnowledgeProduct {
  id: string;
  orgId: string;
  name: string;
  granularity: Granularity;
  cover?: string;
  description: string;
  /** free 与 member 互斥；undefined 表示草稿 */
  baseTag?: 'free' | 'member';
  /** 是否带永享标 */
  hasForever: boolean;
  foreverPrice?: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

export interface FileAsset {
  id: string;
  kpId: string;
  kind: 'pdf' | 'video' | 'audio' | 'image';
  name: string;
  sizeMB: number;
  status: 'uploading' | 'parsing' | 'ready' | 'failed';
  parsedAt?: string;
}

export interface Slice {
  id: string;
  fileId: string;
  kpId: string;
  preview: string; // 前 300 字
  page?: number;
  timestamp?: number;
  excluded: boolean; // 不入库
}

export interface QrCode {
  id: string; // qr_id 全平台唯一
  orgId: string;
  kpId: string;
  status: 'unbound' | 'bound' | 'revoked';
  grantType?: 'member' | 'forever' | 'none';
  scanCount: number;
  firstScanAt?: string;
}

/** 二维码模式：当前只有 KP 码，后续扩展 */
export type QrMode = 'kp';

/** KP 码权益模式 */
export type QrGrantMode = 'none' | 'first_scan_grant';

/** 码包（一次生成的 N 个码归为一个码包） */
export interface QrPackage {
  id: string;
  orgId: string;
  kpId: string;
  mode: QrMode;
  grantMode: QrGrantMode;
  /** 生成数量。grant=none 时固定 1 */
  count: number;
  createdAt: string;
  /** 码包级聚合统计（演示用） */
  stats: {
    totalScans: number;
    firstScanBound: number;
    rescans: number;
    rescanLogins: number;
  };
}

/** 单个码（首扫绑定模式才会有 N 个） */
export interface QrPackageItem {
  qrId: string;
  packageId: string;
  bound: boolean;
  rescans: number;
  rescanLogins: number;
  firstScanAt?: string;
}

// ───────────────── RBAC（平台超管管） ─────────────────
export interface Permission {
  key: string; // 如 kp.create, kp.edit, order.refund
  group: string;
  label: string;
}

export interface CustomRole {
  id: string;
  name: string;
  desc?: string;
  /** 权限点 key 列表 */
  permissions: string[];
  /** 内置角色不可删 */
  builtin?: boolean;
}

export interface OrgAccount {
  id: string;
  orgId: string;
  account: string; // 登录账号
  name: string;
  phone?: string;
  email?: string;
  roleId: string;
  status: 'active' | 'disabled';
  createdAt: string;
  lastLoginAt?: string;
}

// 0615-2：机构订阅订单（B 端，机构→平台）。与 C 端订单（终端用户→机构）两套体系。
// 类型只分两种：「订阅」= 常规订阅，定套餐 + 有效期（新签/续签只是触发时机先后，不手选）；
// 「加油包」= 期中加量，即时生效、额度累加到机构当前额度（不改套餐）。
// 每笔有「生效/未生效」状态开关，默认新建即生效。平台不经手资金，无合同金额。
export type SubType = '订阅' | '加油包';
// 0615-7：「订阅」状态三态、由有效期自动判定（未生效=未到生效日 / 生效=服务期内 / 已过期=已过到期日）；「加油包」沿用存储状态
export type SubStatus = '生效' | '未生效' | '已过期';
export interface Subscription {
  id: string; // 订阅订单 ID（自动生成）
  orgId: string;
  orgName: string; // 冗余机构名，便于全域列表展示
  type: SubType;
  parentId?: string; // 「加油包」所属的「订阅」订阅号（加油包跟随该订阅有效期）
  plan?: string; // 仅「订阅」有套餐：基础版 / 专业版 / 旗舰版 / 定制版
  kp: string; // 额度 / 加量增量（KP 个）
  storage: string; // 存储（GB）
  token: string; // 月度 Token（亿）
  kpUsed?: string; // 已用（演示）
  storageUsed?: string;
  tokenUsed?: string;
  startDate: string; // 有效期起
  endDate: string; // 有效期止
  owner?: string; // 商务负责人（选填）
  note?: string; // 备注（选填，新建订阅时填，详情页展示）
  status: SubStatus; // 生效 / 未生效（默认新建即生效）
  createdAt: string; // 创建时间（年月日时分秒）
  createdBy: string; // 创建人账户
}

// 跨机构 C 端用户（平台后台聚合视图）
export interface CrossOrgUser {
  userId: string;
  orgId: string;
  orgName: string;
  phone?: string;
  nickname?: string;
  membershipState: 'none' | 'active' | 'grace' | 'expired';
  permanentCount: number;
  orderCount: number;
  totalGmv: number;
  registeredAt: string;
  lastActiveAt: string;
}

export interface Membership {
  userId: string;
  orgId: string;
  state: 'none' | 'active' | 'grace' | 'expired';
  expiresAt?: string;
  autoRenew: boolean;
}

export interface PermanentGrant {
  userId: string;
  orgId: string;
  kpId: string;
  grantedAt: string;
}

/** 扫线下纸书二维码的知识 KP 记录（前台「我的纸书」展示所有扫码过的，含未解锁）。
 *  unlocked=true（首扫绑定）：已解锁该 KP 会员级权益，可看免费+会员内容（永享仍单独购买）；
 *  unlocked=false（后扫引导）：未解锁，进会话可体验，付费内容需按 KP 定价单独付费。 */
export interface BookGrant {
  kpId: string;
  scannedAt: string; // YYYY-MM-DD 扫码时间
  unlocked: boolean; // 是否首扫绑定获得权益
  grant?: 'member' | 'forever'; // 已解锁时的权益级别（首扫送会员级）
}

export type OrderType = 'membership' | 'permanent' | 'redeem';
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'canceled';

export interface Order {
  id: string;
  userId: string;
  orgId: string;
  type: OrderType;
  amount: number;
  status: OrderStatus;
  kpId?: string;
  redeemCode?: string;
  createdAt: string;
}

export interface Source {
  bookTitle: string;
  chapter?: string;
  page?: number;
  videoTimestamp?: number;
  publisher?: string;
}

export interface AssetItem {
  id: string;
  type: AssetType;
  title: string;
  meta?: string; // e.g. "00:42 · 第 4 章"
  thumb?: string;
  tag: AssetTag;
  price?: number; // 永享价
  kpId?: string;
}

export interface ExtendedKp {
  kpId: string;
  title: string;
  cover?: string;
  price: number;
  meta?: string;
}

export interface MessageBlock {
  id: string;
  role: 'user' | 'ai';
  text: string;
  streaming?: boolean;
  assets?: AssetItem[];
  sources?: Source[];
  followups?: string[];
  extended?: ExtendedKp[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  orgId: string;
  userId: string;
  kpId?: string;
  title: string;
  messages: MessageBlock[];
  updatedAt: string;
}

export interface User {
  id: string;
  orgId: string;
  openId?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  /** 性别 / 地区：微信环境由网页授权带回，非微信环境用户在个人资料自填 */
  gender?: Gender;
  region?: string;
  /** 扫纸书码解锁的知识 KP（前台「我的纸书」） */
  bookGrants?: BookGrant[];
  membership: Membership;
  permanentGrants: PermanentGrant[];
}
