import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { KpDetailView } from '@aba/ui-admin';
import { KPS, tenantDomainSuffix } from '@aba/mock';

// 平台后台 · 全域 KP 详情（直接复用机构后台 KP 详情；删除后返回全域 KP 列表）
// 0717 #2.3：按路由 :id 从 @aba/mock 查同一份 KP 数据——名称 / 初始状态与全域列表一致
//   （此前详情硬编码「心血管分册 · published」，与列表点开的条目对不上）。
// 0714 #18：接线 kpStatus / onKpStatusChange——平台侧无需持久 store，本地 useState 演示状态流转。
// 0718 #7：来源标签三态统一（自建 / 分享导入·实时 / 分享导入·快照）；consumerReadonly=false——
//   平台超管查看实时导入 KP 不套用接收方只读，保留发布/下架/删除等监管操作。
export function GlobalKpDetail() {
  const { id } = useParams();
  const kp = KPS.find((k) => k.id === id) ?? KPS[0];
  const [kpStatus, setKpStatus] = useState<'draft' | 'published' | 'unlisted' | 'deleted'>(kp.status);
  return (
    <KpDetailView
      listBase="/global-kps"
      orgPrefix="xx-press"
      domainSuffix={tenantDomainSuffix(window.location.hostname)}
      importMode={kp.shareMode ?? 'own'}
      consumerReadonly={false}
      kpName={kp.name}
      kpStatus={kpStatus}
      onKpStatusChange={setKpStatus}
      purchasedUsers={128}
      bookUsers={96}
    />
  );
}
