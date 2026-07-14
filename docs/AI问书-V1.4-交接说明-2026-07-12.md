# AI 问书 V1.4 交接说明

> 交接日期：2026-07-12  
> 交接对象：后续继续维护本项目的 AI / 开发人员  
> 项目目录：`/Users/ziye/Documents/codes/ai-bookAsk`  
> 当前分支：`master`  
> 项目性质：三端高保真可交互原型，所有数据均为 mock，不接真实后端

## 0. 接手前必须先读

1. **不要执行 `git reset --hard`、`git checkout -- .` 或覆盖式生成。** 当前工作区存在大量未提交修改，其中既有本轮 V1.4 修改，也有用户此前使用 Claude Code 完成的改动。
2. **当前权威 PRD 是 V1.4，不是 V1.3。**
   - 成品：`docs/AI问书-产品PRD-v1.4.docx`
   - 生成源：`docs/prd-build/build-prd.js`
3. **当前权威功能清单是 v2.1 / 2026-07-11。**
   - Markdown：`docs/feature-list.md`
   - Excel：`docs/feature-list.xlsx`
   - 内容源：`docs/feature-list-build/gen.py`
   - XLSX 生成脚本：`docs/feature-list-build/build-xlsx.mjs`
4. `README.md`、`docs/page-mapping.md`、`docs/wireframes.md` 中仍有较早 Phase、旧路径和旧视觉方向的描述，**不能作为当前完成度的唯一依据**。以实际路由、当前代码、V1.4 PRD、v2.1 功能清单和本交接文档为准。
5. 本轮要求的“0711 更新”有两种呈现：
   - 功能清单：每个相关模块前放非常简短的“0711周六更新”摘要；详细正文继续描述最终规则。
   - PRD：统一更新摘要之外，在具体功能点后使用**红色** `[0711周六更新]` 标识，方便技术全局搜索“0711”。
6. 当前三个开发服务仍在运行：
   - 移动 H5：`http://localhost:5173/`
   - 机构后台：`http://localhost:5174/`
   - 平台后台：`http://localhost:5175/`

## 1. 项目结构与验证命令

```text
apps/mobile-h5/          移动 H5
apps/org-admin/          机构后台
apps/platform-admin/     平台后台
packages/mock/           mock 数据、类型、跨端产品规则
packages/ui-admin/       两后台共用组件、XLSX 导出
packages/tokens/         三端设计 CSS
docs/                    PRD、功能清单、原型材料
scripts/                 校验脚本
```

```bash
npm install
npm run dev
npm run build
npm run test:adversarial
```

端口固定为 5173 / 5174 / 5175。若 Vite 自动漂移到 5176 之后，先用 `lsof -nP -iTCP:5173,5174,5175 -sTCP:LISTEN` 判断占用进程来自哪个项目，不要直接接受漂移端口。

## 2. 两轮任务的关系与优先级

本交接所说的“两次任务”是：

1. **第一轮：产品补充与未决规则设计**  
   输入文件：`/Users/ziye/Downloads/AI问书：开发中问题.docx`。包含 21 项明确需求和 3 个需要从第一性原理设计的问题。用户随后确认了域名、指标周期、留存率、父/副机构筛选、KP 生命周期、纸书及分享撤销等方案，并追加了最终域名拼接规则。
2. **第二轮：用户对第一轮结果进行整体测试后的 20 组反馈**  
   重点是补做遗漏内容、优化 UI、补齐导出模板、在文档中标记 0711 更新，并要求用对抗性测试逐项验证。

若两轮要求冲突，**第二轮及用户后续确认的最终结论优先**。最典型的覆盖关系是域名：第一轮曾讨论二级/三级域名，最终确定为“机构只输入前缀，系统拼接 `-aba.{当前环境根域名}`”。

## 3. 第一轮任务：原始要求、最终方案与进度

### 3.1 机构域名

- 原始要求：平台创建机构增加必填域名；列表、详情可展示和修改；机构前台、后台、KP 前台访问地址随机构域名变化。
- 最终方案：平台人员只输入前缀，例如 `test`；系统动态拼为 `test-aba.{当前环境根域名}`。本地环境显示 `test-aba.localhost`。机构列表只显示二级机构域名 `test-aba`，不显示长根域名。
- 路由固定为同域路径：前台 `/`、机构后台 `/admin/`、KP `/kp/{id}`，但按第二轮要求不在表单下方常驻展示这段说明。
- 前缀只允许小写字母、数字和中划线，不能以中划线开头或结尾，并按规范化结果全局判重。
- 状态：✅ 已实现代码、功能清单和 PRD。
- 关键文件：
  - `packages/mock/src/rules.ts`
  - `packages/ui-admin/src/Fields.tsx`
  - `apps/platform-admin/src/views/OrgList.tsx`
  - `apps/platform-admin/src/views/OrgDetail.tsx`
  - `packages/ui-admin/src/KpDetailView.tsx`

### 3.2 两后台导出模板

- 原始范围：机构后台 6 类、平台后台 5 类；第二轮新增平台全域用户，最终为 **12 类 XLSX**。
- 机构后台 6 类：主控台、C 端用户、订单管理、兑换码详情、数据看板、答案反馈。
- 平台后台 6 类：主控台、订阅订单、全域用户、全域订单、全域答案反馈、全域模型用量。
- 最终导出规范：深靛蓝表头白字、冻结表头、自动筛选、斑马纹、合理列宽、长文本换行；主控台拆“实时总览 / 经营分析”两个 Sheet，实时 Sheet 写导出时刻，经营分析 Sheet 写明确起止日期。
- 状态：✅ 原型已实现浏览器端 XLSX 下载；真实后端数据导出不在原型范围。
- 关键文件：`packages/ui-admin/src/exportCsv.ts` 及上述 12 个页面。

### 3.3 微信配置字段名称

- 要求：字段中的“域名”改为“地址”。
- 最终文案：微信公众号“网页授权回调地址”；微信开放平台“授权回调地址”；均填写完整 URL。
- 状态：✅ 已完成。
- 文件：`apps/platform-admin/src/views/OrgDetail.tsx`。

### 3.4 我的纸书权益

- 要求：纸书扫码绑定的指定 KP 解锁该 KP 全部权益，包括永享内容。
- 最终规则：纸书权益作为独立权益来源；保留 KP 入口，不重复计入“我的永享”。第二轮按要求删除界面上的解释性长文案，只保留简短前段。
- 状态：✅ 文档和移动端文案已更新。
- 文件：`apps/mobile-h5/src/screens/MyBooks.tsx`。

### 3.5 我的订单支持多笔退款

- 要求：订单列表和详情展示退款；同一订单可多次退款，UI 需容纳多笔。
- 最终方案：订单列表卡片下方使用淡灰退款摘要块，每笔一行，最多展示两笔；详情拆分“退款金额”和“退款状态”，不再挤在一行。
- 状态：✅ 已完成，包含成功、处理中、失败三种演示状态。
- 文件：
  - `apps/mobile-h5/src/data/orders.ts`
  - `apps/mobile-h5/src/screens/Orders.tsx`
  - `apps/mobile-h5/src/screens/OrderDetail.tsx`
  - `packages/tokens/src/design/mobile-app.css`

### 3.6 平台机构详情用量看板时间筛选

- 要求：支持今日、近 7 天、近 30 天和自定义区间。
- 最终方案：套餐、额度、KP/存储占用、当前会员等归入实时区；活跃、区间提问、GMV、LLM 消耗等归入区间分析并随筛选联动。
- 状态：✅ 已完成。
- 文件：`apps/platform-admin/src/views/OrgDetail.tsx`。

### 3.7 上级机构可选范围

- 要求：已作为父机构的机构不能再选父机构，非法选项置灰。
- 最终规则：禁止选择自身和自己的后代，避免成环；副机构详情的上级机构只读；父/副身份明确标记。
- 状态：✅ 已实现共享规则和页面禁用态。
- 文件：`packages/mock/src/rules.ts`、`apps/platform-admin/src/views/OrgList.tsx`、`OrgDetail.tsx`。

### 3.8 机构账户联系方式

- 要求：只保留手机号，删除邮箱说明。
- 状态：✅ 已完成。
- 文件：`apps/platform-admin/src/views/Accounts.tsx` 及共用个人中心。

### 3.9 退款后的权益处理

- 最终规则：
  - 全额退款只撤销“由该订单单独产生”的会员/永享权益。
  - 若同一权益还有纸书、赠送、兑换码或其他订单来源，则保留。
  - 部分退款不撤销权益。
- 移动端详情以两条无序点提示呈现，不放在页面最底部。
- 状态：✅ 规则、文档与 UI 均完成。
- 文件：`packages/mock/src/rules.ts`、`OrderDetail.tsx`。

### 3.10 到期后 72 小时会员缓冲期

- 原规则“到期前 72 小时宽限期”已废弃。
- 最终文案：“支持随时退订，到期赠 72 小时会员缓冲使用期”。
- 续订从付费到期时间计算，**缓冲期不计入付费时长，也不能被续订叠加**。
- 状态：✅ 移动端、系统配置、功能清单和 PRD 已更新。
- 文件：`Member.tsx`、`Agreement.tsx`、`SysConfig.tsx`、`rules.ts`。

### 3.11 两后台个人中心联系方式

- 要求：去掉邮箱，只保留手机号。
- 第二轮追加：本人查看本人时手机号完整展示，不脱敏。
- 状态：✅ 已完成。

### 3.12 机构订阅配额跨订单规则

- KP 数和存储是“占用量”，Token 是“消耗量”。
- 新订阅生效时：
  - 新上限 = 当前生效订阅基础额度 + 当前订阅有效加油包。
  - KP/存储按机构真实存量跨订单延续，不把“已用”挂在旧订单上。
  - Token 绑定订阅周期，新订阅生效时归零，旧周期未用额度作废。
  - 续订单不累加额度，只有加油包在订阅期内累加。
- 降级时若当前 KP/存储占用超过新上限：存量照常可用，C 端无感，只禁止新增或上传；机构删除内容降到额度内或购买加油包后解冻。
- 状态：✅ 规则、套餐 UI、配额看板、功能清单和 PRD 均已更新。
- 文件：`packages/mock/src/rules.ts`、`packages/mock/src/data/subscriptions.ts`、`packages/ui-admin/src/CurrentSubCard.tsx`、`apps/platform-admin/src/views/Subscriptions.tsx`、`OrgDetail.tsx`。

### 3.13 KP 分享模式与计量

- 实时同步：消费机构不占 KP 数和存储，问答消耗消费机构自己的 Token；内容只读；二维码和分享 Tab 不可见。
- 独立快照：消费机构占 KP 数和存储，成为独立 KP；基础信息、知识库、定价与权益从源 KP 复制，二维码和分享从消费机构自己的空数据开始；允许编辑。
- 机构“已使用 KP 数” = 自建 KP + 独立快照 KP，不含实时同步引用。
- 状态：✅ 文档、导入弹窗提示和共用规则已更新。
- 文件：`packages/mock/src/rules.ts`、`apps/org-admin/src/views/KpList.tsx`、`packages/ui-admin/src/KpDetailView.tsx`。

### 3.14 多兑换码会员权益叠加

- 同一账户扫多张有效兑换码时，会员时长从当前付费到期日顺延；若已过期则从当前时间开始。
- 到期后的 72 小时缓冲期不参与叠加。
- 状态：✅ 规则和文档已完成。
- 文件：`packages/mock/src/rules.ts`、`docs/feature-list.md`、PRD V1.4。

### 3.15 C 端登录态

- 最终规则：滑动 7 天会话；每次经过认证的有效请求刷新最后活跃时间；连续 7 天无有效请求后退出登录。
- 重新登录后恢复原目标地址，但不自动补发未认证输入。
- 状态：✅ 文档和规则已完成；原型为 mock，不代表生产鉴权已经实现。
- 文件：`packages/mock/src/rules.ts`、`docs/feature-list.md`。

### 3.16 两后台指标周期

- 累计/存量指标：截至当前的实时快照，不做上一周期对比。
- 今日：今日 00:00 至当前，对比昨日 00:00 至相同已过时长；趋势按小时。
- 近 7/30 天及自定义：对比紧邻此前的等长区间；趋势按自然日。
- 计数/金额显示相对百分比；率类显示百分点；时长显示绝对时长差；上期为 0 时不计算无限增幅。
- 所有参与环比的指标在界面显示精确“对比 MM-DD—MM-DD”灰字；问号悬浮面板说明定义、去重方式、时区、周期、上一周期和差值单位。
- 状态：✅ 规则、两后台主要看板和文档已更新。
- 文件：`packages/mock/src/rules.ts`、机构/平台各 Dashboard、DataBoard、ModelUsage、OrgDetail。

### 3.17 兑换码有效时间与机构状态

- 批次创建时必须填写可兑换开始和结束时间。
- 未到生效时间：“该兑换码尚未到生效时间，请于 {生效时间} 后再试”。
- 已过期：“该兑换码已过期，请联系发码机构”。
- 所属机构停用：“机构服务已暂停，请联系发码机构”。
- 状态：✅ 机构后台配置、移动端校验和文档均完成。
- 文件：`apps/org-admin/src/data/codes.ts`、`apps/org-admin/src/views/Codes.tsx`、`apps/mobile-h5/src/screens/Redeem.tsx`。

### 3.18 全平台机构筛选范围

- 默认“全部机构”包含父机构和副机构。
- 精确选择某机构时默认只统计该机构；只有显式开启“含下级”才汇总后代机构。
- 父机构和副机构在名称后加标签，避免运营误解口径。
- 状态：✅ 共享规则、列表及主要筛选器已完成。

### 3.19 禁止本机构导入自己的分享 KP

- 实时同步和独立快照都只允许其他机构导入。
- 导入弹窗必须展示这条限制及两种模式的配额影响。
- 状态：✅ 已完成。

### 3.20 分享二维码和 Tab 权限

- 实时同步：基础信息、知识库、定价与权益可见但只读；二维码和分享 Tab 不可见。
- 独立快照：全部 Tab 可见可编辑；二维码和分享数据为消费机构自己的新数据。
- 状态：✅ 文档和共享 KP 详情规则已完成。

### 3.21 手机号与微信账号冲突

- 最终结论：不自动合并、不顶替、不迁移权益。
- 微信账号尝试绑定已占用手机号时，引导使用手机号登录或联系客服核验。
- 状态：✅ 功能清单和 PRD 已完成；生产账户体系仍需后端按此实现。

### 3.22 创建角色类型

- 从“机构角色”页签创建时，角色类型固定为机构角色；从“平台角色”页签创建时固定为平台角色。
- 字段置灰不可编辑；删除“继承当前页签，创建时不可切换”说明文案。
- 状态：✅ 原型已完成。
- 文件：`apps/platform-admin/src/views/Roles.tsx`。

### 3.23 未决问题一：KP 下架、删除与已购权益

- 下架：停止公开发现、新购买、新扫码及通用访问链接；已购永享、纸书权益和已有合法授权继续可访问。
- 删除：若存在订单、权益、分享或导入关系，不允许物理删除，只能归档并保留审计记录；只有完全无关系的草稿/测试 KP 才允许物理删除。
- 分享撤销：实时同步导入立即失效；独立快照继续保留。
- 状态：✅ 第一性原理方案、规则和文档已完成。
- 文件：`packages/mock/src/rules.ts`、`packages/ui-admin/src/KpDetailView.tsx`、`docs/feature-list.md`、PRD V1.4。

### 3.24 未决问题二：留存率

- 留存率不跟顶部普通经营时间筛选机械联动，使用独立 cohort 口径。
- 次日/7日/30日留存只纳入已经满 1/7/30 天的成熟注册 cohort；显示样本量和成熟截止日期；今日未成熟时显示“—”。
- 状态：✅ 文档和机构数据看板演示已完成。

### 3.25 未决问题三：所有指标合理性通查

- 已将指标拆成实时快照、固定窗口、区间统计、成熟 cohort 四类。
- 已删除对累计存量做伪环比、率类使用百分比涨幅、上一周期为 0 显示无限增长、用经验系数估算去重用户等不合理方案。
- 状态：✅ 主要看板、统一规则和两份文档已完成。

## 4. 第二轮任务：20 组验收反馈与处理结果

### 4.1 兑换码未到生效时间提示

- ✅ 已补入功能清单、PRD 和移动端兑换页。
- 精确文案：`该兑换码尚未到生效时间，请于 {生效时间} 后再试`。

### 4.2 功能清单的 0711 摘要

- ✅ 已在相关模块前增加简短“0711周六更新”摘要。
- 不在 PRD 中复制这种模块级摘要，避免 PRD 冗杂。

### 4.3 PRD 具体改动标记

- ✅ PRD 已升级为 V1.4。
- ✅ 具体功能点使用红色 `[0711周六更新]`；可全局搜索“0711”。
- ✅ PRD 开头仍保留本次更新统一摘要。

### 4.4 域名列表与输入控件

- ✅ 列表字段改为“二级机构域名”，只展示 `test-aba`。
- ✅ 创建/详情页将可输入前缀和固定后缀放在同一输入框视觉容器内，以竖线区分；固定后缀置灰。
- ✅ 后缀根据当前环境动态显示，如本地 `-aba.localhost`。
- ✅ 删除固定路由常驻说明；创建机构弹窗加宽。

### 4.5 删除“集团→分社两层”文案

- ✅ 已从上级机构区域删除。

### 4.6 可见即导出与模板美化

- ✅ 平台主控台实时总览中的机构数、累计用户、累计 GMV、净 GMV、提问总量均进入实时 Sheet，不再只导机构数。
- ✅ 经营分析 Sheet 带当前筛选区间的具体日期。
- ✅ 新增全域用户、全域订单、全域答案反馈导出。
- ✅ 12 类导出统一 XLSX 样式、列宽和换行。

### 4.7 我的纸书文案精简

- ✅ 删除“KP 入口持续保留，内容不重复计入『我的永享』”及其前面的分号，只保留前段用户价值文案。

### 4.8 退款详情和订单列表视觉

- ✅ 退款金额与状态分行。
- ✅ 成功绿色、处理中主题警示色、失败危险色。
- ✅ 权益规则移到退款记录下方的引用块，以两条无序点展示。
- ✅ 删除“退款记录（数量）”计数。
- ✅ 列表卡片下方增加淡灰退款摘要块，多笔退款一块内分行。

### 4.9 副机构基本资料与父机构停用

- ✅ 副机构上级机构字段置灰只读，页头显示“副机构”标签。
- ✅ 最终采用“父机构停用不自动级联子机构”：父机构与子机构是独立经营租户，自动级联风险过高；如需批量停用须逐家确认并留痕。

### 4.10 用量看板实时与区间分层

- ✅ 专业版/当前套餐放到时间筛选上方。
- ✅ KP、存储、累计用户、当前会员等标为实时快照。
- ✅ 活跃、区间提问、区间 GMV、区间 Token/调用等随时间筛选联动。

### 4.11 平台后台所有手机号完整展示

- ✅ 平台机构用户、机构账户、平台账户、全域用户、全域订单、详情及弹窗均使用完整手机号。
- 注意：C 端面向普通用户的换绑手机号等隐私场景仍可脱敏；本要求不是取消所有 C 端隐私保护。

### 4.12 缓冲期文案

- ✅ 统一为“支持随时退订，到期赠 72 小时会员缓冲使用期”。

### 4.13 两后台个人中心完整手机号

- ✅ 机构后台和平台后台个人中心均展示本人完整手机号。

### 4.14 订阅配额“占用量 / 消耗量”视觉

- ✅ KP 数、存储明确标记“占用量 / 当前占用”。
- ✅ Token 明确标记“消耗量 / 本周期消耗”。
- ✅ 当前订阅卡、机构详情用量看板、订阅列表相关位置同步处理。

### 4.15 KP 分享和 C 端登录态文档遗漏

- ✅ 实时同步、独立快照、撤销影响、计量规则已补入功能清单和 PRD。
- ✅ C 端滑动 7 天登录态及账号冲突处理已补入两份文档。

### 4.16 指标上一周期灰字和悬浮说明

- ✅ 参与比较的指标显示精确上一周期日期灰字。
- ✅ 问号悬浮面板补指标定义、统计周期、上一周期、差值单位、零基线处理。
- ✅ 累计/存量快照明确“不参与上一周期比较”。

### 4.17 机构后台兑换码时间限制

- ✅ 兑换码批次新增可兑换开始/结束时间，列表和详情均展示。

### 4.18 机构筛选父机构标签

- ✅ 父机构和副机构在机构选项名称后显示对应标签。

### 4.19 分享 KP 导入弹窗说明

- ✅ 弹窗明确“不能导入本机构分享”；同时说明实时同步和独立快照的配额影响。

### 4.20 分享二维码逻辑、角色类型与三项未决问题复查

- ✅ 分享两模式的 Tab 权限已写入功能清单和 PRD。
- ✅ 创建角色类型已置灰，说明文案已删除。
- ✅ KP 生命周期、留存率、两后台指标体系已重新按第一性原理通查并补入文档和原型。

## 5. 当前最终产品规则速查

### 5.1 域名

`机构输入前缀 test` → `test-aba.{当前环境根域名}`。列表只显示 `test-aba`。

### 5.2 机构层级

- 允许父/副两层业务展示，但规则函数可防止自身/后代成环。
- 精确筛选默认不汇总下级；“含下级”必须显式开启。
- 停用不级联。

### 5.3 配额

- KP/存储 = 当前占用，可通过删除归还。
- Token = 当前订阅周期消耗，不可回收，新周期归零。
- 降级超占用只锁新增，不删除存量、不影响 C 端。

### 5.4 指标

- 快照不环比。
- 今日对昨日相同已过时长。
- 区间对紧邻前一等长区间。
- 率类用百分点，时长用绝对差，计数/金额用相对百分比。
- 留存使用成熟 cohort。

### 5.5 KP 生命周期

- 下架阻止新增访问，不伤害已购权益。
- 有业务关系时禁止物理删除，只归档。
- 实时分享撤销即失效；独立快照保留。

### 5.6 退款

- 支持同订单多笔退款。
- 全额退款只撤销订单唯一来源权益；部分退款和其他独立来源权益保留。

### 5.7 登录与账号

- C 端滑动 7 天登录态。
- 手机号冲突不自动合并账号。
- 平台管理场景展示完整手机号。

## 6. 关键代码变更地图

### 6.1 跨端规则与组件

- `packages/mock/src/rules.ts`：域名、周期、机构树、停用、KP 删除、分享、退款、订阅切换、兑换码、会员叠加、登录态。
- `packages/ui-admin/src/exportCsv.ts`：统一 XLSX 导出实现；旧 `exportCsv` 仍保留兼容。
- `packages/ui-admin/src/Fields.tsx`：动态域名前缀组合输入框。
- `packages/ui-admin/src/CurrentSubCard.tsx`：占用量/消耗量展示。
- `packages/tokens/src/design/admin-app.css`：后台新状态、域名控件、比较周期、配额样式。
- `packages/tokens/src/design/mobile-app.css`：退款摘要、退款状态和引用块样式。

### 6.2 移动 H5

- `apps/mobile-h5/src/screens/Redeem.tsx`
- `apps/mobile-h5/src/screens/MyBooks.tsx`
- `apps/mobile-h5/src/screens/Orders.tsx`
- `apps/mobile-h5/src/screens/OrderDetail.tsx`
- `apps/mobile-h5/src/data/orders.ts`
- `apps/mobile-h5/src/screens/Member.tsx`
- `apps/mobile-h5/src/screens/Agreement.tsx`

### 6.3 机构后台

- `apps/org-admin/src/views/Dashboard.tsx`
- `apps/org-admin/src/views/DataBoard.tsx`
- `apps/org-admin/src/views/Codes.tsx`
- `apps/org-admin/src/data/codes.ts`
- `apps/org-admin/src/views/KpList.tsx`
- `apps/org-admin/src/views/CUsers.tsx`
- `apps/org-admin/src/views/Orders.tsx`
- `apps/org-admin/src/views/Feedback.tsx`
- `apps/org-admin/src/views/SysConfig.tsx`

### 6.4 平台后台

- `apps/platform-admin/src/views/OrgList.tsx`
- `apps/platform-admin/src/views/OrgDetail.tsx`
- `apps/platform-admin/src/views/Dashboard.tsx`
- `apps/platform-admin/src/views/GlobalUsers.tsx`
- `apps/platform-admin/src/views/GlobalOrders.tsx`
- `apps/platform-admin/src/views/GlobalFeedback.tsx`
- `apps/platform-admin/src/views/ModelUsage.tsx`
- `apps/platform-admin/src/views/Subscriptions.tsx`
- `apps/platform-admin/src/views/Accounts.tsx`
- `apps/platform-admin/src/views/PlatformAccounts.tsx`
- `apps/platform-admin/src/views/Roles.tsx`

## 7. 文档生成与修改方式

### 7.1 功能清单

不要只手改 `docs/feature-list.md` 或 Excel 成品。先改：

```text
docs/feature-list-build/gen.py
```

然后重新生成 Markdown 和 XLSX。XLSX 构建脚本为：

```text
docs/feature-list-build/build-xlsx.mjs
```

当前 Excel 有 6 个 Sheet，交付前需要逐 Sheet 渲染或打开检查，并确保无公式错误。

### 7.2 PRD

源文件：

```text
docs/prd-build/build-prd.js
```

输出：

```text
docs/AI问书-产品PRD-v1.4.docx
```

V1.4 当前渲染为 46 页。改完生成器后必须重生成、重新渲染并逐页检查，不能只检查 Word XML 或文本。

## 8. 已完成验证

以下为 2026-07-11 至 2026-07-12 的验证结果：

- ✅ `npm run test:adversarial`：27/27 通过。
- ✅ `npm run build`：移动 H5、机构后台、平台后台全部通过。
- ✅ PRD V1.4：46 页渲染检查通过。
- ✅ 功能清单 XLSX：6 个 Sheet 渲染/检查通过，无公式错误。
- ✅ 浏览器回归：
  - 5173 确认为“AI 问书 · 机构前台 H5”。
  - 5174 确认为“AI 问书 · 机构后台”。
  - 5175 确认为“AI 问书 · 平台超管”。
  - 移动端订单列表、订单详情、兑换码未生效提示通过。
  - 机构后台兑换码时间、数据看板周期说明通过。
  - 平台机构列表、创建机构、详情、副机构禁用上级、用量看板、全域用户/订单/反馈导出、角色禁用态通过。
  - 浏览器控制台无 error。

对抗性测试入口：`scripts/adversarial-tests.mjs`。覆盖域名、周期、层级、KP 生命周期、分享、退款、订阅、兑换码、登录态、文档关键字和导出样式。

## 9. 当前工作区状态与已知风险

### 9.1 尚未提交

当前所有 V1.4 修改都还在 `master` 工作区，**没有为本轮创建提交**。接手 AI 必须先执行：

```bash
git status --short
git diff --stat
```

确认变更范围后再决定是否拆分提交。不要把用户此前的 PPT、截图或 Claude Code 改动误删。

### 9.2 原型和生产实现的边界

- 当前只验证前端交互和 mock 规则。
- 域名 DNS、证书、反向代理、微信回调、真实 XLSX 后端查询、真实退款、真实账户合并/鉴权、真实统计 SQL 尚未实现。
- 后端开发必须把 `packages/mock/src/rules.ts` 和两份文档中的规则转成可审计的服务端逻辑，不能只复制前端展示。
- 当前构建会提示 `exceljs` 动态分包约 939 kB、超过 Vite 500 kB 建议值；这是非阻断警告。若进入生产开发，应继续做按需加载或独立导出服务优化。

### 9.3 旧文档可能误导

- `README.md` 仍写旧 Phase 完成度。
- `docs/page-mapping.md` 仍有大量“Phase 2 待补”，与当前路由不完全一致。
- `docs/wireframes.md` 和 `docs/design-brief.md` 保留早期设计过程，不是 V1.4 验收标准。
- `docs/AI问书-产品PRD-v1.3.docx` 仅为历史版本；后续不要在其上继续修改。

### 9.4 需要后续 AI 继续做的工作

1. 对照本交接的两轮清单，再做一轮逐项浏览器回归，尤其检查所有机构筛选器是否都带父/副标签。
2. 实际点击并打开 12 类 XLSX，逐列确认“可见即导出”、筛选条件、Sheet 名、统计时间和长文本换行。
3. 将 `README.md`、`docs/page-mapping.md` 的陈旧完成度与当前项目同步；这不属于前两轮产品改动，当前尚未处理。
4. 清理或归档生成过程中的临时文件时必须先确认归属，不要直接删除未跟踪 PPT、截图、`docs/ppt-*` 或用户材料。
5. 在用户确认后再拆分 commit；建议至少拆为“产品规则与三端 UI”“文档 V1.4”“XLSX 与测试”三组。

## 10. 建议接手顺序

1. 阅读本文件。
2. 阅读 `AGENTS.md`。
3. 阅读 `packages/mock/src/rules.ts` 和 `scripts/adversarial-tests.mjs`，先掌握最终规则。
4. 阅读 `docs/feature-list.md` 中所有“0711周六更新”。
5. 打开 `docs/AI问书-产品PRD-v1.4.docx`，全局搜索“0711”。
6. 查看 `git status --short`，保护现有修改。
7. 运行 `npm run test:adversarial` 和 `npm run build`。
8. 启动三端并按 375×812 / 1440 宽完成浏览器回归。
9. 修改文档时改生成源并重新生成，不直接只改成品。

## 11. 可直接交给下一位 AI 的执行提示

```text
你正在接手 /Users/ziye/Documents/codes/ai-bookAsk。

先完整阅读：
1. AGENTS.md
2. docs/AI问书-V1.4-交接说明-2026-07-12.md
3. packages/mock/src/rules.ts
4. scripts/adversarial-tests.mjs
5. docs/feature-list.md 中所有 0711周六更新

注意：当前 master 工作区有大量未提交修改，包含用户和 Claude Code 的既有成果。禁止 reset、checkout 覆盖或删除未跟踪文件。PRD V1.4 和功能清单 v2.1 是当前权威文档，README/page-mapping/wireframes 有旧信息。

接手后先运行 git status --short、npm run test:adversarial、npm run build，再启动 5173/5174/5175 做三端浏览器回归。所有后续修改必须同时核对产品规则、用户体验、文档、导出模板和对抗性测试。
```
