# 205 页清单 ↔ 实现路径映射

**Phase 1 完成**：32 页（前台 12 / 机构后台 10 / 平台超管 8 + 通用件 2 套）。
**Phase 2 待补**：154 P0 页。
**Phase 3 待看**：19 P1/P2 页。

图例：✅ 已实现 · 🟦 Phase 2 · ⬜ Phase 3 · 🚫 不做（原型范围外）

---

## 机构前台 H5（5173）

| 编号 | 名称 | 状态 | 路径 / 文件 |
|---|---|---|---|
| F-1.1 | 落地页 | ✅ | `/` → `apps/mobile-h5/src/pages/Landing.tsx` |
| F-1.2 | 微信授权弹窗（微信内打开 H5，授予昵称/头像） | ✅ | `/login/wechat-auth` → `screens/WechatAuth.tsx` |
| F-1.2.2 | 微信扫码授权页（外部浏览器，open.weixin.qq.com 二维码） | ✅ | `/login/wechat-scan` → `screens/WechatScan.tsx` |
| F-1.3 | 手机号绑定页 | ✅ | `/phone-bind` → `pages/PhoneBind.tsx` |
| F-1.4 | 二维码失效落地页 | ✅ | `/qr-invalid` → `pages/QrInvalid.tsx` |
| F-1.5 | 机构内手机号冲突提示 | ✅ | `pages/PhoneBind.tsx` 内 toast |
| F-1.6 | 账号合并提示 | 🟦 Phase 2 | — |
| F-2.1 | AI 会话主页面 | ✅ | `/chat` → `pages/Chat.tsx` |
| F-2.1.1 | 顶部工具栏 | ✅ | `Chat.tsx` 内 |
| F-2.1.2 | 文字输入区 | ✅ | `packages/ui-mobile/src/AnswerComposer.tsx` |
| F-2.1.3 | 短语音输入按钮 | ✅ | `AnswerComposer.tsx`（长按 60s 上限 + 录音遮罩） |
| F-2.1.4 | 欢迎语区 | ✅ | `packages/ui-mobile/src/Welcome.tsx` |
| F-2.1.5 | 答案文字流式渲染 | ✅ | `packages/ui-mobile/src/MessageBubble.tsx` |
| F-2.1.6 | 多模态卡片（含锁标） | ✅ | `packages/ui-mobile/src/AssetCard.tsx` |
| F-2.1.7 | 回答溯源区 | ✅ | `packages/ui-mobile/src/AnswerSource.tsx` |
| F-2.1.8 | 推荐追问 | ✅ | `packages/ui-mobile/src/SuggestedFollowups.tsx` |
| F-2.1.9 | 答案末尾延伸视图 | ✅ | `packages/ui-mobile/src/ExtendedKpStrip.tsx` |
| F-2.1.10 | TTS 朗读控制条 | ✅ | `packages/ui-mobile/src/TtsBar.tsx` |
| F-2.1.11 | 会话偏好抽屉 | ✅ | `Chat.tsx` Drawer |
| F-2.1.12 | ASR 录音状态层 | ✅ | `AnswerComposer.tsx` 内录音遮罩 |
| F-2.1.13 | 答案操作菜单 | ⬜ P1 | — |
| F-2.2 | 实时电话式语音页 | 🟦 Phase 2 | toast 提示占位 |
| F-2.2.1 | 通话气泡 + 电平动效 | 🟦 Phase 2 | — |
| F-2.2.2 | 挂断 / 静音 / 切音色 | 🟦 Phase 2 | — |
| F-2.2.3 | 非会员引导弹窗 | ✅ | `Chat.tsx` 点击电话语音入口时 toast |
| F-2.3 / .1-3 | 资源跳转锚点页 | 🟦 Phase 2 | — |
| F-3.1 | 付费墙弹窗 | ✅ | `packages/ui-mobile/src/Paywall.tsx` |
| F-3.2 | 永享购买卡详情 | 🟦 Phase 2 | — |
| F-3.3 | AI 会员订阅页 | ✅ | `/member` → `pages/MemberPlan.tsx` |
| F-3.4 | 永享购买确认页 | 🟦 Phase 2 | 复用 PaymentTransition |
| F-3.5 | 微信支付拉起 | ✅ | `/pay/:type` → `pages/PaymentTransition.tsx` |
| F-3.6 | 兑换码输入页 | 🟦 Phase 2 | Paywall 内 Tab |
| F-3.7 | 支付成功页 | ✅ | `/pay-success` → `pages/PaySuccess.tsx` |
| F-3.8 | 支付失败页 | ✅ | `/pay-fail` → `pages/PayFail.tsx` |
| F-3.9 | 自动续费协议页 | 🟦 Phase 2 | MemberPlan 内文案 |
| F-3.10 | 取消自动续费页 | 🟦 Phase 2 | — |
| F-3.11 | 退订挽留弹窗 | ⬜ P1 | — |
| F-4.1 | 我的主页 | ✅ | `/me` → `pages/MyHome.tsx` |
| F-4.2 / .1-2 | 我的会员中心 | 🟦 Phase 2 | — |
| F-4.3 / .1 | 我的永享列表 | 🟦 Phase 2 | — |
| F-4.4 | 我的收藏 | ⬜ P1 | — |
| F-4.5 | 历史会话列表 | ✅ | `/history` → `pages/HistoryList.tsx` |
| F-4.5.1 | 历史会话详情 | ✅ | `/history/:id` → `pages/HistoryDetail.tsx` |
| F-4.6 / .1-2 | 反馈页 | ⬜ P1 | — |
| F-4.7 / .1-2 | 账号设置 | 🟦 Phase 2 | — |
| F-4.8 | 我的兑换码 | 🟦 Phase 2 | （建议合并到 F-3.6） |
| F-5.1 | 订单中心列表 | 🟦 Phase 2 | — |
| F-5.2 | 订单详情 | 🟦 Phase 2 | — |
| F-5.3 | 联系客服弹窗 | ✅ | 复用 `ServiceModal` |
| F-6.1 | 客服入口弹窗 | ✅ | `packages/ui-mobile/src/ServiceModal.tsx` |
| F-7.1 | 公众号底部菜单跳转 | 🟦 Phase 2 | 复用 Landing |
| F-7.2 | 朋友分享落地页 | 🟦 Phase 2 | 复用 Landing |
| F-7.3 | 答案分享卡片预览 | ⬜ P2 | — |

---

## 机构后台 Web PC（5174）

| 编号 | 名称 | 状态 | 路径 |
|---|---|---|---|
| A-1.1 | 登录页 | ✅ | `/login` → `pages/Login.tsx` |
| A-1.2 | 主控台 Dashboard | ✅ | `/dashboard` → `pages/Dashboard.tsx` |
| A-2.1 / .1-3 | 员工列表 + 子件 | 🟦 Phase 2 | — |
| A-2.2 | 角色权限矩阵 | ⬜ P1 | — |
| A-3.1 | KP 列表 | ✅ | `/kps` → `pages/kp/KpList.tsx` |
| A-3.2 | KP 创建弹窗 | ✅ | `KpList.tsx` 内 Modal |
| A-3.3 | KP 详情容器 | ✅ | `/kps/:id` → `pages/kp/KpDetail.tsx` |
| A-3.3.1 | 基本信息 Tab | ✅ | `KpDetail.tsx` Tab |
| A-3.3.2 | 文件与切片 Tab | ✅ | `KpDetail.tsx` Tab |
| A-3.3.2.1 | 文件上传弹窗 | ✅ | `KpDetail.tsx` Modal |
| A-3.3.2.2 | 上传进度抽屉 | ✅ | `KpDetail.tsx` Drawer（异步任务中心） |
| A-3.3.2.3 | 切片列表 | ✅ | `KpDetail.tsx` 内 |
| A-3.3.2.4-7 | 切片精细管理（编辑/合并/删除/不入库） | 🟦 Phase 2 | — |
| A-3.3.3 | 二维码 Tab | ✅ | `KpDetail.tsx` Tab |
| A-3.3.3.1 | 码包生成弹窗（KP 内） | ✅ | `KpDetail.tsx` Modal |
| A-3.3.3.2-4 | 码包/扫码/停用 | 🟦 Phase 2 | — |
| A-3.3.4 | 定价与权益 Tab | ✅ | `KpDetail.tsx` Tab |
| A-3.3.4.1-3 | 价格切换/编辑/审计 | 🟦 Phase 2 | 当前页含静态展示 |
| A-4.x | 二维码 / 码包跨 KP | 🚫 不做 | 已删除：二维码改为 KP 内「二维码包」管理，无跨 KP 码包 |
| A-5.x | 定价管理 / 兑换码 | 🟦 Phase 2 | 定价管理总览已删除；永享单价在 KP 内、会员价在系统配置、兑换码在运营中心 |
| A-6.1 | Agent 列表 | 🟦 Phase 2 | 当前直接进 A-6.2 |
| A-6.2 | Agent 详情编辑 | ✅ | `/agent/:id` → `pages/agent/AgentDetail.tsx` |
| A-6.2.1-7 | Agent 子件 | 🟦 Phase 2 | 当前页含表单基础 |
| A-7.x | 订单管理 | 🟦 Phase 2 | — |
| A-8.x | 数据看板（5 Tab） | 🟦 Phase 2 | Dashboard 已含部分 |
| A-9.x | 客服配置 | 🟦 Phase 2 | — |
| A-10.x | C 端用户管理 | 🟦 Phase 2 | — |
| A-11.x | 小鹅通同步 | ⬜ P1 | — |

---

## 平台超管 Web PC（5175）

| 编号 | 名称 | 状态 | 路径 |
|---|---|---|---|
| P-1.1 | 登录页 | ✅ | `/login` → `pages/Login.tsx` |
| P-1.2 | 2FA 弹窗 | ✅ | `Login.tsx` 内 Modal |
| P-1.3 | 主控台 | ✅ | `/dashboard` → `pages/Dashboard.tsx` |
| P-2.1 | 机构列表 | ✅ | `/orgs` → `pages/orgs/OrgList.tsx` |
| P-2.2 | 机构创建弹窗 | ✅ | `OrgList.tsx` 内 Modal |
| P-2.3 | 机构详情容器 | ✅ | `/orgs/:id` → `pages/orgs/OrgDetail.tsx` |
| P-2.3.1 | 基本资料 Tab | ✅ | `OrgDetail.tsx` Tab |
| P-2.3.2 | LLM & 联网 Tab | ✅ | `OrgDetail.tsx` Tab |
| P-2.3.2.1-6 | LLM 字段子件 | ✅ | `OrgDetail.tsx` 内 |
| P-2.3.3 | 微信支付 Tab | ✅ | `OrgDetail.tsx` Tab |
| P-2.3.3.1-4 | 支付字段子件 | ✅ | `OrgDetail.tsx` 内 |
| P-2.3.4 | 用量看板 Tab | ✅ | `OrgDetail.tsx` Tab |
| P-2.3.5-6 | 启停 / 删除弹窗 | 🟦 Phase 2 | 当前 toast 占位 |
| P-3.x | 全平台订单 | 🟦 Phase 2 | — |
| P-4.1 | 跨机构对比 | 🟦 Phase 2 | — |
| P-4.2 | 平台默认 LLM 用量看板 | ✅ | `/data/llm-usage` → `pages/data/LlmUsage.tsx` |
| P-4.3 | 单机构钻取详情 | 🟦 Phase 2 | 复用 OrgDetail |
| P-5.x | 全局默认策略 | 🟦 Phase 2 | — |
| P-6.x | 操作审计 | 🟦 Phase 2 | — |
| P-7.x | 超管账号 | 🟦 Phase 2 | — |
| P-8.x | SLA / 告警 | 🚫 不做 | 已删除：去掉告警 KPI、SLA / 告警、操作审计、跨机构数据对比 |

---

## 通用组件 / 弹窗

| 编号 | 名称 | 状态 | 路径 |
|---|---|---|---|
| FG-1 | 全局 Toast | ✅ | `packages/ui/src/Toast.tsx` |
| FG-2 | 二次确认弹窗 | ✅ | `packages/ui/src/Modal.tsx` |
| FG-3 | 加载骨架屏 | ✅ | `packages/ui/src/Skeleton.tsx` |
| FG-4 | 网络异常重试 | 🟦 Phase 2 | — |
| FG-5 | 空状态 / 错误页 | ✅ | `packages/ui/src/EmptyState.tsx` |
| FG-6 | 错误码映射文案 | 🟦 Phase 2 | api/auth.ts 含部分 |
| FG-7 | 微信支付 SDK 拉起 | ✅ | `packages/mock/src/api/payment.ts` |
| FG-8 | ASR 语音录制 | ✅ | `AnswerComposer.tsx` |
| FG-9 | TTS 朗读控制 | ✅ | `TtsBar.tsx` |
| FG-10/11/12 | 视频/音频/图片预览 | 🟦 Phase 2 | AssetCard 含锁标 |
| FG-13 | PDF 锚点跳转 | 🟦 Phase 2 | — |
| FG-14 | 分享卡片生成 | ⬜ P2 | — |
| AG-1 | 顶部导航 + 侧菜单 | ✅ | `packages/ui-admin/src/AdminLayout.tsx` |
| AG-2 / 3 / 5 / 7 / 8 / 12 / 13 / 14 | 后台基础件 | 🟦 Phase 2 | 部分用 Modal/Drawer 替代 |
| AG-4 | 上传进度抽屉 | ✅ | `KpDetail.tsx` Drawer |
| AG-9 | 异步任务中心抽屉 | ✅ | `KpDetail.tsx` Drawer |
| AG-10 | 数据导出弹窗 | 🟦 Phase 2 | — |
| AG-11 | 富文本编辑器 | ✅ | `AgentDetail.tsx` 内 Textarea（简化版） |
| PG-1 | 顶部 + 侧菜单（超管） | ✅ | 复用 AdminLayout |
| PG-2 | 高危操作二次确认 | 🟦 Phase 2 | OrgDetail 含 toast |
| PG-3 | 2FA 验证码弹窗 | ✅ | `platform-admin Login.tsx` |
| PG-4 | KEY 加密输入 | ✅ | `OrgDetail.tsx` 内 |
| PG-5 | PEM 上传 | ✅ | `OrgDetail.tsx` 内 |
| PG-6 | 空 / 错 / 骨架 | ✅ | 复用 ui 包 |
| PG-7 | 操作审计弹窗 | 🟦 Phase 2 | — |
| PG-8 | 多机构切看 | ⬜ P1 | — |

---

## Phase 1 收口数据

- **已实现**：32 个 routable 页 + 30+ 子件 + 6 个跨端通用件
- **核心金链条**：3 端 3 条故事线全部打通
- **设计 token**：100% 对齐方向 B（奶白底 + 电光靛 + 朝霞橙）
- **mock 演示**：5 角色 / 3 机构 / 假支付（成功/失败/取消）/ 流式打字机 / 异步任务进度
- **埋点**：核心事件以 `console.log('[track] event')` 形式可见，DevTools 可看漏斗
