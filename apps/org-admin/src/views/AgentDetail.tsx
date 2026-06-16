import { AgentDetailView } from '@aba/ui-admin';

// 机构后台 · Agent 详情编辑（复用共享 AgentDetailView；机构侧回答 Prompt 受权限控制、只读）
export function AgentDetail() {
  return <AgentDetailView backTo="/agents" kpBase="/kps" />;
}
