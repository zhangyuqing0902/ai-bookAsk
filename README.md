# AI 问书 · 三端高保真原型

姐姐的 OPC 项目 · 给业务方/技术方评审用的可交互原型。**所有数据 mock，不接真后端。**

## 30 秒快速上手

```bash
# 1) 装依赖（只需一次）
npm install

# 2) 同时起三端
npm run dev
```

启动后用浏览器分别打开：

| 端 | 地址 | 视口 |
|---|---|---|
| 机构前台 H5（移动端） | <http://localhost:5173> | 375×812（含手机外框） |
| 机构后台 Web PC | <http://localhost:5174> | ≥ 1440 桌面 |
| 平台超管 Web PC | <http://localhost:5175> | ≥ 1440 桌面 |

> 演示用 1440 宽以上的桌面浏览器。前台 H5 在桌面会自动套手机外框居中显示；如需真机预览，把 5173 用手机打开同 Wi-Fi 的 IP 即可。

## 演示脚本（建议给评审人看）

详见 [`docs/demo-script.md`](./docs/demo-script.md)。三条主线，每条 5–8 分钟：

1. **C 端读者视角**：扫码落地 → 微信授权 → AI 会话三件套 → 多模态锁标 → 付费墙 → 微信支付 → 解锁
2. **机构管理员视角**：创建 KP → 上传切片 → 生成二维码 → 设置定价与权益 → 配 Agent 人设
3. **平台超管视角**：建机构 → 配 LLM/联网/微信支付 → 看 token 用量（已去掉告警）

## 演示控制台（前台 H5 右下角浮窗）

随时切换：
- **角色**：未登录 / 免费 / AI 会员 / 免费+永享 / 会员+永享 五种
- **机构**：医学社 / 财经社 / 文学社 三家（验证机构数据强隔离）
- **微信支付结果**：成功 / 失败 / 取消
- **重置 mock 数据**：清空当前会话与订单回到默认

## 工程结构

```
ai-bookAsk/
├── apps/
│   ├── mobile-h5/         前台 H5（5173）
│   ├── org-admin/         机构后台（5174）
│   └── platform-admin/    平台超管（5175）
├── packages/
│   ├── tokens/            B 方向设计 token + Tailwind preset + brand logo
│   ├── ui/                跨端共享件（Button / Modal / Drawer / Toast / Tag …）
│   ├── ui-mobile/         前台专用件（PhoneFrame / 多模态卡片 / 溯源 / 追问 / 付费墙 / 客服弹窗）
│   ├── ui-admin/          后台专用件（AdminLayout / SideNav / DataTable / StatCard）
│   └── mock/              全局 mock store（zustand）+ fake API + 五种角色 + 三家机构
├── design/                Claude Design 原始文件（参考，不入构建产物）
└── docs/
    ├── page-mapping.md    205 页清单 ↔ 实际实现路径自查表
    ├── demo-script.md     三条演示路线
    └── screenshots/       关键页面截图
```

## 视觉方向 B（已对齐设计文件）

| 元素 | 值 |
|---|---|
| 背景 / 卡面 | `#f6f4f0` 奶白底 / `#ffffff` 白卡 |
| 主文字 | `#14182a` 深墨蓝 |
| AI 主色 | `#4f46e5` 电光靛 → `#3730a3` 渐变深端 |
| 永享标 | `#ff7a5c` 朝霞橙 |
| 字体 | 中文 Noto Sans SC / 大数字 Manrope / 编号 DM Mono |

标签语义：`free` 中性灰 · `member` 靛蓝 · `forever` 朝霞橙

## PRD 第 6 章埋点

原型在关键事件点写了 `console.log('[track] event_name', payload)`，评审时打开 DevTools 控制台就能看到漏斗：
`qr_scan` · `chat_msg_submit` · `paywall_show` · `paywall_pay_start` · `pay_success` · `redeem_attempt` 等。

## 不实现的项（原型范围外）

- 真实的微信 OAuth 与微信支付 SDK（用 1.5–2.4s 假回调过场态模拟）
- 真实的 ASR / TTS / RAG 模型调用（用打字机 + 静态资源模拟）
- 数据库、用户表、订单表（用 zustand + persist 模拟，刷新保留状态）
- PRD 第 6 章埋点上报、第 7 章性能压测

## 排期与下一步

- ✅ Phase 0：基建完成（pnpm…npm workspaces / token / mock / 三端骨架 / 通用件）
- ✅ Phase 1：金链条 30 页（前台 12 + 机构后台 10 + 平台超管 8）
- 🟦 Phase 2：补全 P0 共 156 页（订单、永享、兑换码、Agent 子页、码包、定价、看板等）
- ⬜ Phase 3：P1 / P2 共 19 页（角色权限矩阵、SLA 告警、小鹅通同步等）
- ⬜ Phase 4：交付 → README 教学 + 演示脚本 + 截图集

## 开发命令

```bash
npm run dev               # 同时起三端
npm run dev:mobile        # 单起前台 H5
npm run dev:org           # 单起机构后台
npm run dev:platform      # 单起平台超管
npm run build             # 三端全量构建（dist/）
```

## 技术栈

- React 18 · Vite 5 · TypeScript 5 · Tailwind 3
- 状态：zustand + persist
- 路由：react-router-dom v6
- 图表：recharts
- 包管理：npm workspaces

## CLAUDE.md

工程约定与开发规范见根目录 [CLAUDE.md](./CLAUDE.md)。
