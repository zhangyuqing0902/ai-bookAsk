import { BrowserRouter, Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { IconSprite, ToastHost, PrototypeList } from '@aba/ui';
import { AdminShell, AdminLogin, UserMenu, AccountCenter, type NavGroup, type AccountInfo } from '@aba/ui-admin';
import { useAdminAvatar, CURRENT_ORG, PARENT_ORG_NAME, ORG_TYPE_LABEL, type OrgType } from '@aba/mock';
import { useOrgScope } from './stores/orgScope';
import { Dashboard } from './views/Dashboard';
import { KpList } from './views/KpList';
import { KpDetail } from './views/KpDetail';
import { AgentList } from './views/AgentList';
import { AgentDetail } from './views/AgentDetail';
import { CUsers } from './views/CUsers';
import { CUserDetail } from './views/CUserDetail';
import { Orders } from './views/Orders';
import { OrderDetail } from './views/OrderDetail';
import { Codes } from './views/Codes';
import { DataBoard } from './views/DataBoard';
import { Feedback } from './views/Feedback';
import { CsConfig } from './views/CsConfig';
import { SysConfig } from './views/SysConfig';
import { Placeholder } from './views/Placeholder';

const NAV: NavGroup[] = [
  { items: [{ to: '/', label: '主控台', icon: 'i-grid' }] },
  {
    group: '产品中心',
    items: [
      { to: '/kps', label: '知识产品 KP', icon: 'i-cube' },
      { to: '/agents', label: 'Agent 人设', icon: 'i-robot' },
    ],
  },
  {
    group: '运营中心',
    items: [
      { to: '/users', label: 'C 端用户', icon: 'i-user' },
      { to: '/orders', label: '订单管理', icon: 'i-doc' },
      { to: '/codes', label: '兑换码', icon: 'i-ticket' },
    ],
  },
  {
    group: '数据中心',
    items: [
      { to: '/board', label: '数据看板', icon: 'i-chart' },
      { to: '/feedback', label: '答案反馈', icon: 'i-msg' },
    ],
  },
  {
    group: '系统设置',
    items: [
      { to: '/cs', label: '客服配置', icon: 'i-headset' },
      { to: '/sys', label: '系统配置', icon: 'i-gear' },
    ],
  },
  { group: '评审工具', items: [{ to: '/prototypes', label: '原型清单', icon: 'i-grid' }] },
];

const TITLES: Record<string, string> = {
  '/': '主控台',
  '/kps': '知识产品 KP',
  '/kps/': 'KP 详情',
  '/agents': 'Agent 人设',
  '/agents/': '编辑 Agent',
  '/users': 'C 端用户',
  '/users/': '用户详情',
  '/orders': '订单管理',
  '/orders/': '订单详情',
  '/codes': '兑换码',
  '/board': '数据看板',
  '/feedback': '答案反馈',
  '/cs': '客服配置',
  '/sys': '系统配置',
  '/profile': '个人中心',
  '/prototypes': '原型清单',
};

function Prototypes() {
  const nav = useNavigate();
  return <PrototypeList current="org" onSameApp={(p) => nav(p)} />;
}

// 0615：当前登录机构账户（演示数据）
// 0806：机构名收敛为「XX 出版社」（与顶栏 / MY_ORG 统一）；上级机构随「机构类型」演示开关——仅子机构视角展示
const ORG_ACCOUNT: AccountInfo = {
  account: 'zhangsan@xx-press',
  name: '张三',
  orgName: CURRENT_ORG,
  roleName: '机构管理员',
  phone: '13800131234',
  status: 'active',
  initial: '张',
};

function ProfilePage() {
  const avatar = useAdminAvatar((s) => s.avatar);
  const setAvatar = useAdminAvatar((s) => s.setAvatar);
  const orgType = useOrgScope((s) => s.orgType);
  const account: AccountInfo = { ...ORG_ACCOUNT, parentOrgName: orgType === 'child' ? PARENT_ORG_NAME : undefined };
  return <AccountCenter account={account} avatarImg={avatar} onAvatarChange={setAvatar} />;
}

function Shell() {
  const avatar = useAdminAvatar((s) => s.avatar);
  const orgType = useOrgScope((s) => s.orgType);
  const setOrgType = useOrgScope((s) => s.setOrgType);
  return (
    <AdminShell
      brandSub="机构后台"
      nav={NAV}
      titleMap={TITLES}
      topRight={
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* 0806：〔演示〕机构类型三态切换——父机构视角出现机构筛选与归属展示，子/独立视角保持现状；
              上线后由登录账号所属机构在机构主数据中的父子关系决定，非用户可切换项 */}
          <div className="org-type-seg" title="仅用于演示 · 切换机构类型预览界面差异（非上线功能）">
            <span className="ots-tag">演示 · 机构类型</span>
            {(Object.keys(ORG_TYPE_LABEL) as OrgType[]).map((t) => (
              <b key={t} className={orgType === t ? 'on' : ''} onClick={() => setOrgType(t)}>{ORG_TYPE_LABEL[t]}</b>
            ))}
          </div>
          <UserMenu org={CURRENT_ORG} avatar="张" avatarImg={avatar} />
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
        <Route path="/login" element={<AdminLogin title="登录 · 机构后台" />} />
        <Route element={<Shell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kps" element={<KpList />} />
          <Route path="/kps/:id" element={<KpDetail />} />
          <Route path="/agents" element={<AgentList />} />
          <Route path="/agents/:id" element={<AgentDetail />} />
          <Route path="/users" element={<CUsers />} />
          <Route path="/users/:id" element={<CUserDetail />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/codes" element={<Codes />} />
          <Route path="/board" element={<DataBoard />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/cs" element={<CsConfig />} />
          <Route path="/sys" element={<SysConfig />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/prototypes" element={<Prototypes />} />
          <Route path="*" element={<Placeholder />} />
        </Route>
      </Routes>
      <ToastHost />
    </BrowserRouter>
  );
}
