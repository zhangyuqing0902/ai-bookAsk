import { useSearchParams } from 'react-router-dom';
import { AgentDetailView } from '@aba/ui-admin';

// 机构后台 · Agent 详情编辑（复用共享 AgentDetailView；机构侧回答 Prompt 受权限控制、只读）
// 0806：父机构查看子机构 Agent（?owner=child&org=…）——整页只读，机构角色「可操作」仅针对本机构数据
export function AgentDetail() {
  const [sp] = useSearchParams();
  const childOrg = sp.get('owner') === 'child' ? sp.get('org') ?? '子机构' : null;
  return (
    <AgentDetailView
      backTo="/agents"
      kpBase="/kps"
      readonlyBanner={childOrg ? `子机构数据 · 仅可查看：本 Agent 归属「${childOrg}」，机构后台角色的「可操作」权限仅针对本机构数据，如需编辑请在该子机构后台操作。` : undefined}
    />
  );
}
