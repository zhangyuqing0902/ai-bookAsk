# AI 问书 · 0606 重构计划

> 目的：把三端原型的视觉与交互全面切换到 ai-0606 新设计系统，废弃旧页面/旧 UI/旧令牌，保留可用基建。
> 评测标准（四条，开发与自查都对照）：①功能清单 `docs/feature-list.xlsx` ②线框 `docs/wireframes.md` ③设计规范 `ai-0606/.../设计规范.md` + `styles.css` ④已绘制的 3 个 HTML 原型（前台/机构后台/平台超管）。

## 背景

旧原型用的是「方向 B」奶白底配色（#f6f4f0 / #4f46e5 / #ff7a5c）。姐姐重新设计了三端视觉（ai-0606），定调「通透明亮·现代克制·冷调净白 + 同色系微光」，价值色改为珊瑚橙 `#FF6F55`（禁止金色）。新设计以 `styles.css :root` 为令牌单一事实源，并配套 `proto.css`/`proto-admin.css` 组件层与 `proto-app.js`/`proto-admin.js` 交互引擎。

## 决策（已与姐姐确认）

1. **原地重构**现有 monorepo（已先复制快照到 `../ai-bookAsk-backup-0606`）。保留：Vite+React+TS、npm workspaces、`@aba/*` 别名、react-router、zustand mock。
2. **直接移植设计稿 CSS**（styles/proto/proto-admin）为设计层，React 只负责结构与交互；像素级最高保真，且单点改 CSS 三端同步。
3. **节奏**：先地基 + 竖切样板定调 → 姐姐确认 → 批量铺开全部页面。

## 地基（Phase 0）

| 产物 | 位置 | 说明 |
|---|---|---|
| 设计令牌 + 组件 CSS | `packages/tokens/src/design/{styles,proto,proto-admin}.css` | 原样移植，单一事实源；各 app 在 `main.tsx` 于 tailwind 之后引入 |
| 图标雪碧 | `packages/ui/src/IconSprite.tsx` + `Icon.tsx` | 前台+后台全部 `<symbol>` 合集，根部注入一次；`<Icon id w h/>` |
| 折线图引擎（强制：轴+hover） | `packages/ui-admin/src/LineChart.tsx` | 1:1 移植 `drawLineChart`，`data-chart` 同构 |
| 可排序表格（强制：时间/数字列箭头） | `packages/ui-admin/src/DataTable.tsx` | React 化 `autoSortable`+`sortTable`，按关键词识别可排序列 |
| 时间区间+日历 | `packages/ui-admin/src/DateRange.tsx` | 今日/近7/30/自定义，弹日历区间 |
| 角色权限矩阵 | `packages/ui-admin/src/RolePerm.tsx` | 按模块分组、一行两个、只读态 |
| Toast / KPI / 后台壳 / 手机壳 | `ui`/`ui-admin`/`ui-mobile` | 复刻 `.statusbar/.phone`、`.side/.admin-top/.admin-body` |

## 竖切样板（定调用，先交付这批）

- **移动端**：登录落地页 → 会话欢迎态 → 会话对话态（含溯源抽屉/永享付费墙/lightbox/左抽屉）→ 开通会员。覆盖品牌球、渐变、气泡、卡片、抽屉、付费墙全套视觉语言。
- **机构后台**：侧栏+顶栏壳 → 主控台（KPI+折线图）→ KP 列表（水平卡）→ KP 详情（6 Tab）。覆盖侧栏、KPI、强制折线图、KP 卡、Tab、表格、表单。
- **平台超管**：壳 → 主控台 → 机构列表（可排序表格）。覆盖第二个独立后台 + 表格排序。

确认风格后，按端批量铺开全部一/二/三级页与空态/错误态（见下）。

## 批量铺开清单（确认后执行）

- **移动端 H5（端1）**：手机号登录、微信绑定、本人验证、电话语音页（含字幕态）、会员中心、我的主页、我的永享、兑换码、我的订单、支付成功/失败、二维码失效、协议页、空/错/加载态。
- **机构后台（端2）**：Agent 列表/详情、C端用户列表/详情、订单管理、兑换码（批量生成弹窗）、数据看板 5 Tab、客服配置、系统配置、各类弹窗（新建KP/导入/上传/新建分享/新建二维码包）、空/错/加载态、二次确认。
- **平台超管（端3）**：机构账户、机构详情（基本资料/机构配置二级Tab/用量看板）、全域用户、全域订单、模型用量、默认LLM、角色权限、上级机构看板与下钻只读、创建机构/新建账户弹窗、空/错态。

## 自行决策记录（最后汇总给姐姐）

- 移动端保留「手机框」呈现（H5 评审惯例）；后台改为**整屏真实应用**（规范明确两个独立 URL 应用），不保留原型里的 mac 浏览器窗壳。
- 其余 PM/UI 自决项在交付时单列说明。

## 验证

1. `npm run dev` 三端启动无错（5173/5174/5175）。
2. Chrome 375×812 看移动端；1440 看两后台。
3. 对照四条标准逐屏自查：令牌/按钮渐变/图标对齐/背景渐变/排序箭头/图表轴+hover/KP水平卡/价值色非金。
