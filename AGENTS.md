# AI 问书 · 三端高保真原型

## 这是什么

姐姐的 OPC 项目：把 PRD V1.0.0 + 205 页清单变成可交互浏览器原型，给业务方/技术方评审。

- 不接真后端，**只 mock**
- 三端：移动 H5 + 机构后台 PC + 平台超管 PC
- 视觉方向 B（奶白底 + 电光靛 + 朝霞橙）
- 实施方案见 `~/.Codex/plans/users-ziye-documents-Codex-projects-ai-linked-wreath.md`

## 工程约定

- **包管理**：npm workspaces（pnpm 装不上不要再尝试 sudo）
- **技术栈**：React 18 + Vite 5 + Tailwind 3 + TypeScript 5
- **状态**：zustand + persist
- **路由**：react-router-dom v6
- **图表**：Recharts
- **路径别名**：`@aba/tokens` / `@aba/mock` / `@aba/ui` / `@aba/ui-mobile` / `@aba/ui-admin`

## 开发命令

```bash
npm install                    # 第一次装依赖
npm run dev                    # 同时起三端
npm run dev:mobile             # 只起前台 H5（5173）
npm run dev:org                # 只起机构后台（5174）
npm run dev:platform           # 只起平台超管（5175）
```

## 验证清单（每个 Phase 收口前）

1. `npm run dev` 三端启动无错
2. 浏览器分别打开 5173/5174/5175
3. 移动端 Chrome DevTools 设 375×812
4. 跑通该 Phase 金链条
5. 对照 `docs/page-mapping.md` 自查

## 命名约定

- 页面文件：`apps/<app>/src/pages/<Module>/<Page>.tsx`
- 组件：`packages/ui-*/src/components/<Name>.tsx`
- mock 数据：`packages/mock/src/data/<entity>.ts`
- mock 接口：`packages/mock/src/api/<module>.ts`
- 路由路径：与 Excel 编号对齐（如 `/chat` → F-2.1，`/kp/:id` → A-3.3）
