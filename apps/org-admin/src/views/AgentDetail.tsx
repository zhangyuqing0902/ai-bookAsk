import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AgentDetailView } from '@aba/ui-admin';

// 机构后台 · Agent 详情编辑（复用共享 AgentDetailView）
// 0806：父机构查看子机构 Agent（?owner=child&org=…）——整页只读，机构角色「可操作」仅针对本机构数据
// 0812-e：人设风格权限语义——预设人人可切；「自定义」按角色权限「人设风格-自定义」开关
// 0812-f：加〔演示〕权限切换，便于评审对比「有 / 无 自定义权限」两种效果（上线后由登录账号的角色权限决定，非用户可切换项）
export function AgentDetail() {
  const [sp] = useSearchParams();
  const childOrg = sp.get('owner') === 'child' ? sp.get('org') ?? '子机构' : null;
  const [canCustom, setCanCustom] = useState(false);
  return (
    <AgentDetailView
      backTo="/agents"
      kpBase="/kps"
      customEditable={canCustom}
      readonlyBanner={childOrg ? `子机构数据 · 仅可查看：本 Agent 归属「${childOrg}」，机构后台角色的「可操作」权限仅针对本机构数据，如需编辑请在该子机构后台操作。` : undefined}
      headExtra={
        <div className="org-type-seg" title="仅用于演示 · 切换当前账号是否具备「人设风格-自定义」权限（非上线功能）">
          <span className="ots-tag">演示 · 自定义权限</span>
          <b className={!canCustom ? 'on' : ''} onClick={() => setCanCustom(false)}>无</b>
          <b className={canCustom ? 'on' : ''} onClick={() => setCanCustom(true)}>有</b>
        </div>
      }
    />
  );
}
