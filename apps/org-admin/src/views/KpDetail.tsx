import { useParams, useSearchParams } from 'react-router-dom';
import { KpDetailView } from '@aba/ui-admin';
import { tenantDomainSuffix } from '@aba/mock';
import { useKpLifecycle } from '../stores/kpLifecycle';

// 机构后台 · KP 详情（复用共享 KpDetailView）
// 机构后台代表单一机构（演示机构 XX 出版社，域名前缀 xx-press）；前台地址后缀按当前环境生成。
// ?share=realtime|snapshot 由 KP 列表带入：实时同步导入的 KP 走只读、隐藏二维码 / 分享 Tab。
// 0716 #1.1：下架 / 删除接 kpLifecycle store 真状态（key = 路由 id，与列表叠加显示一致）。
export function KpDetail() {
  const { id = '1' } = useParams();
  const [sp] = useSearchParams();
  const share = sp.get('share');
  const importMode = share === 'realtime' ? 'realtime' : share === 'snapshot' ? 'snapshot' : 'own';
  const kpStatus = useKpLifecycle((s) => s.overrides[id]) ?? 'published';
  const setStatus = useKpLifecycle((s) => s.setStatus);
  // 0714 #5：演示「物理删除」——KP 列表第 2 条「儿科学（未发布）」无任何业务关系 → 传空关系（可删）；
  // 其余 KP 已有订单/分享等关系 → 传 {orders:1} 走软删除语义。可删 KP 无已购用户，purchasedUsers 传 0。
  const deletable = id === '2';
  const kpRelations = deletable ? {} : { orders: 1 };
  return (
    <KpDetailView
      listBase="/kps"
      orgPrefix="xx-press"
      domainSuffix={tenantDomainSuffix(window.location.hostname)}
      importMode={importMode}
      shareOrgName="YY 教育"
      kpStatus={kpStatus}
      onKpStatusChange={(next) => setStatus(id, next)}
      purchasedUsers={deletable ? 0 : 12}
      bookUsers={deletable ? 0 : 8}
      kpRelations={kpRelations}
    />
  );
}
