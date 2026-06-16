import { BrowserRouter, Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { Icon, IconSprite, ToastHost, PrototypeList } from '@aba/ui';
import { AdminShell, AdminLogin, UserMenu, AccountCenter, type NavGroup, type AccountInfo } from '@aba/ui-admin';
import { useAdminAvatar } from '@aba/mock';
import { Dashboard } from './views/Dashboard';
import { OrgList } from './views/OrgList';
import { OrgDetail } from './views/OrgDetail';
import { Accounts } from './views/Accounts';
import { GlobalUsers } from './views/GlobalUsers';
import { GlobalUserDetail } from './views/GlobalUserDetail';
import { GlobalOrders } from './views/GlobalOrders';
import { GlobalOrderDetail } from './views/GlobalOrderDetail';
import { GlobalKps } from './views/GlobalKps';
import { GlobalKpDetail } from './views/GlobalKpDetail';
import { GlobalAgents } from './views/GlobalAgents';
import { GlobalAgentDetail } from './views/GlobalAgentDetail';
import { GlobalFeedback } from './views/GlobalFeedback';
import { ModelUsage } from './views/ModelUsage';
import { DefaultLlm } from './views/DefaultLlm';
import { Roles } from './views/Roles';
import { Subscriptions } from './views/Subscriptions';
import { PlatformAccounts } from './views/PlatformAccounts';
import { Placeholder } from './views/Placeholder';

const NAV: NavGroup[] = [
  { items: [{ to: '/', label: '主控台', icon: 'i-grid' }] },
  // 0614c：菜单按机构后台四板块（产品 / 运营 / 数据 / 系统设置）镜像重组，平台 ↔ 机构心智对称。
  {
    group: '机构管理',
    items: [
      { to: '/orgs', label: '机构管理', icon: 'i-building' },
      { to: '/accounts', label: '机构账户', icon: 'i-user' },
      // 0615：机构订阅订单（B 端签约 / 续签 / 升级），与机构管理同组
      { to: '/subscriptions', label: '订阅订单', icon: 'i-ticket' },
    ],
  },
  {
    group: '产品中心',
    items: [
      { to: '/global-kps', label: '全域知识产品 KP', icon: 'i-cube' },
      { to: '/global-agents', label: '全域 Agent 人设', icon: 'i-robot' },
    ],
  },
  {
    group: '运营中心',
    items: [
      { to: '/users', label: '全域用户', icon: 'i-user' },
      { to: '/orders', label: '全域订单', icon: 'i-doc' },
    ],
  },
  {
    group: '数据中心',
    items: [
      { to: '/global-feedback', label: '全域答案反馈', icon: 'i-msg' },
      { to: '/model', label: '全域模型用量', icon: 'i-chip' },
    ],
  },
  {
    group: '系统设置',
    items: [
      { to: '/platform-accounts', label: '平台账户', icon: 'i-shield' },
      // 0615-3：角色权限移到系统设置（按机构 / 平台类型分别管理）
      { to: '/roles', label: '角色权限', icon: 'i-key' },
      { to: '/llm', label: '默认 LLM', icon: 'i-chip' },
    ],
  },
  { group: '评审工具', items: [{ to: '/prototypes', label: '原型清单', icon: 'i-grid' }] },
];

const TITLES: Record<string, string> = {
  '/': '主控台',
  '/orgs': '机构管理',
  '/orgs/': '机构详情',
  '/accounts': '机构账户',
  '/users': '全域用户',
  '/users/': '用户详情',
  '/orders': '全域订单',
  '/orders/': '订单详情',
  '/global-kps': '全域知识产品 KP',
  '/global-kps/': 'KP 详情',
  '/global-agents': '全域 Agent 人设',
  '/global-agents/': 'Agent 详情',
  '/global-feedback': '全域答案反馈',
  '/model': '全域模型用量',
  '/platform-accounts': '平台账户',
  '/llm': '默认 LLM 模型配置',
  '/roles': '角色权限',
  '/subscriptions': '订阅订单',
  '/profile': '个人中心',
  '/prototypes': '原型清单',
};

function Prototypes() {
  const nav = useNavigate();
  return <PrototypeList current="platform" onSameApp={(p) => nav(p)} />;
}

// 0615：当前登录平台超管账户（演示数据；平台账户无所属 / 上级机构，个人中心不展示该两项）
const PLATFORM_ACCOUNT: AccountInfo = {
  account: 'superadmin',
  name: '超级管理员',
  roleName: '平台超级管理员',
  phone: '188****0000',
  email: 'admin@ai-book-ask.cn',
  status: 'active',
  initial: '超',
};

function ProfilePage() {
  const avatar = useAdminAvatar((s) => s.avatar);
  const setAvatar = useAdminAvatar((s) => s.setAvatar);
  return <AccountCenter account={PLATFORM_ACCOUNT} avatarImg={avatar} onAvatarChange={setAvatar} showHint={false} />;
}

function Shell() {
  const avatar = useAdminAvatar((s) => s.avatar);
  return (
    <AdminShell
      brandSub="平台后台"
      nav={NAV}
      titleMap={TITLES}
      topRight={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* 0615-2：顶栏固定「入驻微信对接清单」下载按钮（角色旁） */}
          <a
            className="btn btn-ghost btn-sm"
            href="/wechat-onboarding.docx"
            download="AI问书·新机构入驻微信对接清单.docx"
            style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            <Icon id="i-dl" w={14} h={14} />
            新机构入驻微信对接清单
          </a>
          <UserMenu org="平台超管" avatar="超" avatarImg={avatar} />
        </div>
      }
    >
      <Outlet />
    </AdminShell>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <IconSprite />
      <Routes>
        <Route path="/login" element={<AdminLogin title="登录 · 平台超管" />} />
        <Route element={<Shell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orgs" element={<OrgList />} />
          <Route path="/orgs/:id" element={<OrgDetail />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/users" element={<GlobalUsers />} />
          <Route path="/users/:id" element={<GlobalUserDetail />} />
          <Route path="/orders" element={<GlobalOrders />} />
          <Route path="/orders/:id" element={<GlobalOrderDetail />} />
          <Route path="/global-kps" element={<GlobalKps />} />
          <Route path="/global-kps/:id" element={<GlobalKpDetail />} />
          <Route path="/global-agents" element={<GlobalAgents />} />
          <Route path="/global-agents/:id" element={<GlobalAgentDetail />} />
          <Route path="/global-feedback" element={<GlobalFeedback />} />
          <Route path="/model" element={<ModelUsage />} />
          <Route path="/llm" element={<DefaultLlm />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/platform-accounts" element={<PlatformAccounts />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/prototypes" element={<Prototypes />} />
          <Route path="*" element={<Placeholder />} />
        </Route>
      </Routes>
      <ToastHost />
    </BrowserRouter>
  );
}
