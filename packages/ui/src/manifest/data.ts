// 原型清单 · 单一数据源（三端全部页面）
// 维护约定：每次原型新增/删除/调整页面后，在此同步；并跑 `node scripts/manifest-check.mjs` 校验与真实路由一致。
export type AppKey = 'mobile' | 'org' | 'platform';

export interface PageEntry {
  app: AppKey;
  module: string; // 模块（分组）
  name: string; // 页面中文名
  path: string; // 路由（与 App.tsx 的 <Route path> 对齐）
  linkPath?: string; // 动态路由(:id) 的可跳转样例；无则用 path
}

export const APP_META: Record<AppKey, { label: string; short: string; devPort: number; accent: string }> = {
  mobile: { label: '机构前台 H5', short: '前台', devPort: 5173, accent: '#15b080' },
  org: { label: '机构后台', short: '机构后台', devPort: 5174, accent: '#4f46e5' },
  platform: { label: '平台超管', short: '平台超管', devPort: 5175, accent: '#ff7a5c' },
};

export const PAGES: PageEntry[] = [
  // ============ 机构前台 H5（mobile） ============
  { app: 'mobile', module: '登录与权限', name: '落地页', path: '/' },
  { app: 'mobile', module: '登录与权限', name: '手机号登录', path: '/login/phone' },
  { app: 'mobile', module: '登录与权限', name: '微信授权弹窗', path: '/login/wechat-auth' },
  { app: 'mobile', module: '登录与权限', name: '微信扫码授权', path: '/login/wechat-scan' },
  { app: 'mobile', module: '登录与权限', name: '微信绑定手机号', path: '/login/wechat-bind' },
  { app: 'mobile', module: '登录与权限', name: '账号冲突合并', path: '/login/conflict' },
  { app: 'mobile', module: '登录与权限', name: '二维码失效', path: '/qr-invalid' },
  { app: 'mobile', module: 'AI 会话', name: 'AI 会话主页', path: '/chat' },
  { app: 'mobile', module: 'AI 会话', name: '实时电话语音', path: '/call' },
  { app: 'mobile', module: '付费与会员', name: 'AI 会员订阅页', path: '/member' },
  { app: 'mobile', module: '付费与会员', name: '会员中心', path: '/member/center' },
  { app: 'mobile', module: '付费与会员', name: '微信支付收银台', path: '/pay/wechat' },
  { app: 'mobile', module: '付费与会员', name: '支付成功', path: '/pay/success' },
  { app: 'mobile', module: '付费与会员', name: '支付失败', path: '/pay/fail' },
  { app: 'mobile', module: '我的', name: '我的主页', path: '/me' },
  { app: 'mobile', module: '我的', name: '我的永享', path: '/me/yongxiang' },
  { app: 'mobile', module: '我的', name: '兑换码核销', path: '/me/redeem' },
  { app: 'mobile', module: '我的', name: '我的订单', path: '/me/orders' },
  { app: 'mobile', module: '我的', name: '订单详情', path: '/me/orders/:id', linkPath: '/me/orders/o1' },
  { app: 'mobile', module: '我的', name: '换绑手机号', path: '/account' },
  { app: 'mobile', module: '协议', name: '用户协议 / 隐私政策', path: '/agreement/:type', linkPath: '/agreement/terms' },

  // ============ 机构后台（org） ============
  { app: 'org', module: '主控台', name: '主控台', path: '/' },
  { app: 'org', module: '产品中心', name: '知识产品 KP 列表', path: '/kps' },
  { app: 'org', module: '产品中心', name: 'KP 详情', path: '/kps/:id', linkPath: '/kps/kp_cardio' },
  { app: 'org', module: '产品中心', name: 'Agent 列表', path: '/agents' },
  { app: 'org', module: '产品中心', name: 'Agent 详情编辑', path: '/agents/:id', linkPath: '/agents/a1' },
  { app: 'org', module: '运营中心', name: 'C 端用户列表', path: '/users' },
  { app: 'org', module: '运营中心', name: 'C 端用户详情', path: '/users/:id', linkPath: '/users/u1' },
  { app: 'org', module: '运营中心', name: '订单管理', path: '/orders' },
  { app: 'org', module: '运营中心', name: '订单详情', path: '/orders/:id', linkPath: '/orders/o1' },
  { app: 'org', module: '运营中心', name: '兑换码', path: '/codes' },
  { app: 'org', module: '数据中心', name: '数据看板', path: '/board' },
  { app: 'org', module: '系统设置', name: '客服配置', path: '/cs' },
  { app: 'org', module: '系统设置', name: '系统配置', path: '/sys' },
  { app: 'org', module: '登录', name: '登录页', path: '/login' },

  // ============ 平台超管（platform） ============
  { app: 'platform', module: '主控台', name: '主控台', path: '/' },
  { app: 'platform', module: '机构管理', name: '机构列表', path: '/orgs' },
  { app: 'platform', module: '机构管理', name: '机构详情', path: '/orgs/:id', linkPath: '/orgs/org_med' },
  { app: 'platform', module: '机构管理', name: '机构账户管理', path: '/accounts' },
  { app: 'platform', module: '平台数据中心', name: '全域用户', path: '/users' },
  { app: 'platform', module: '平台数据中心', name: '全域用户详情', path: '/users/:id', linkPath: '/users/u1' },
  { app: 'platform', module: '平台数据中心', name: '全域订单', path: '/orders' },
  { app: 'platform', module: '平台数据中心', name: '全域订单详情', path: '/orders/:id', linkPath: '/orders/o1' },
  { app: 'platform', module: '平台数据中心', name: '模型用量', path: '/model' },
  { app: 'platform', module: '全局策略', name: '默认 LLM 配置', path: '/llm' },
  { app: 'platform', module: '全局策略', name: '角色与权限', path: '/roles' },
  { app: 'platform', module: '登录', name: '登录页', path: '/login' },
];

// 按端取页面，保持声明顺序内的模块分组
export function pagesByApp(app: AppKey): { module: string; items: PageEntry[] }[] {
  const groups: { module: string; items: PageEntry[] }[] = [];
  for (const p of PAGES.filter((x) => x.app === app)) {
    let g = groups.find((x) => x.module === p.module);
    if (!g) {
      g = { module: p.module, items: [] };
      groups.push(g);
    }
    g.items.push(p);
  }
  return groups;
}
