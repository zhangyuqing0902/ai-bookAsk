import { useState } from 'react';
import { KpDetailView } from '@aba/ui-admin';
import { tenantDomainSuffix } from '@aba/mock';

// 平台后台 · 全域 KP 详情（直接复用机构后台 KP 详情；删除后返回全域 KP 列表）
// 演示 KP（心血管分册）归属 XX 出版社（域名前缀 xx-press）；前台地址后缀按当前环境生成。
// 0714 #18：接线 kpStatus / onKpStatusChange / purchasedUsers——平台侧无需持久 store，本地 useState 演示状态流转。
export function GlobalKpDetail() {
  const [kpStatus, setKpStatus] = useState<'draft' | 'published' | 'unlisted' | 'deleted'>('published');
  return (
    <KpDetailView
      listBase="/global-kps"
      orgPrefix="xx-press"
      domainSuffix={tenantDomainSuffix(window.location.hostname)}
      kpStatus={kpStatus}
      onKpStatusChange={setKpStatus}
      purchasedUsers={128}
      bookUsers={96}
    />
  );
}
