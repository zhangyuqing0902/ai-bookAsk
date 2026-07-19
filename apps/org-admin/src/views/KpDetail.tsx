import { useParams } from 'react-router-dom';
import { KpDetailView } from '@aba/ui-admin';
import { tenantDomainSuffix } from '@aba/mock';
import { useKpLifecycle } from '../stores/kpLifecycle';
import { ORG_KPS } from '../data/kps';

// 机构后台 · KP 详情（复用共享 KpDetailView）
// 机构后台代表单一机构（演示机构 XX 出版社，域名前缀 xx-press）；前台地址后缀按当前环境生成。
// 0717 #2.3：与列表同源（../data/kps.ts）——名称 / 状态 / 导入方式 / 业务关系均按路由 id 查同一份数据，
//   不再依赖 ?share= query 与硬编码（列表仍带 query 仅作兼容，以数据源为准）。
// 0716 #1.1：发布 / 下架 / 删除接 kpLifecycle store 真状态（key = 路由 id，与列表叠加显示一致）。
export function KpDetail() {
  const { id = '1' } = useParams();
  const entry = ORG_KPS.find((k) => k.id === id) ?? ORG_KPS[0];
  const importMode = entry.shareMode ?? 'own';
  const kpStatus = useKpLifecycle((s) => s.overrides[id]) ?? entry.status;
  const setStatus = useKpLifecycle((s) => s.setStatus);
  return (
    <KpDetailView
      listBase="/kps"
      orgPrefix="xx-press"
      domainSuffix={tenantDomainSuffix(window.location.hostname)}
      importMode={importMode}
      shareOrgName="YY 教育"
      kpName={entry.name}
      kpStatus={kpStatus}
      onKpStatusChange={(next) => setStatus(id, next)}
      purchasedUsers={entry.purchasedUsers}
      bookUsers={entry.bookUsers}
      kpRelations={entry.relations}
    />
  );
}
