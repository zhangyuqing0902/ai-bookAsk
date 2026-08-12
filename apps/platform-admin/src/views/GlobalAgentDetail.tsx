import { AgentDetailView } from '@aba/ui-admin';

// 平台后台 · 全域 Agent 详情（复用机构后台 Agent 详情；超管不受权限限制，可编辑任意 Agent 人设风格）
export function GlobalAgentDetail() {
  return <AgentDetailView backTo="/global-agents" kpBase="/global-kps" customEditable />;
}
