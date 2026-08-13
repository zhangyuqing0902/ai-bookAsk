import { useParams, useSearchParams } from 'react-router-dom';
import { KpDetailView } from '@aba/ui-admin';
import { tenantDomainSuffix, currentSubCard, quotaState } from '@aba/mock';
import { useKpLifecycle } from '../stores/kpLifecycle';
import { useSubDemo, SUB_DEMO_SUBS } from '../stores/subDemo';
import { ORG_KPS } from '../data/kps';

// 机构后台 · KP 详情（复用共享 KpDetailView）
// 机构后台代表单一机构（演示机构 XX 出版社，域名前缀 xx-press）；前台地址后缀按当前环境生成。
// 0717 #2.3：与列表同源（../data/kps.ts）——名称 / 状态 / 导入方式 / 业务关系均按路由 id 查同一份数据，
//   不再依赖 ?share= query 与硬编码（列表仍带 query 仅作兼容，以数据源为准）。
// 0716 #1.1：发布 / 下架 / 删除接 kpLifecycle store 真状态（key = 路由 id，与列表叠加显示一致）。
export function KpDetail() {
  const { id = '1' } = useParams();
  const [sp] = useSearchParams();
  const entry = ORG_KPS.find((k) => k.id === id) ?? ORG_KPS[0];
  // 0806：父机构查看子机构 KP——整页只读（机构角色「可操作」仅针对本机构数据）
  const childReadonly = sp.get('owner') === 'child';
  const importMode = entry.shareMode ?? 'own';
  const kpStatus = useKpLifecycle((s) => s.overrides[id]) ?? entry.status;
  const setStatus = useKpLifecycle((s) => s.setStatus);
  // 0813-2：存储额度已满 / 降档后存量超额 → 冻结「上传知识文件」（既有文件与 C 端问答不受影响）。
  //   与 KP 列表的新建阻断同源（currentSubCard + quotaState），两处口径不可能不一致。
  const subDemo = useSubDemo((s) => s.subDemo);
  const sub = currentSubCard(SUB_DEMO_SUBS[subDemo]);
  const stRow = sub?.rows.find((r) => r.k === '存储');
  const stQ = quotaState(stRow?.used ?? 0, stRow?.limit ?? 0, stRow?.unlimited, 'storage');
  const storageBlocked = !sub
    ? '订阅套餐已过期或尚未开通，既有文件与数据完整保留；续费后即可恢复上传。'
    : stQ.canAdd ? undefined : stQ.reason;
  return (
    <KpDetailView
      listBase="/kps"
      orgPrefix="xx-press"
      domainSuffix={tenantDomainSuffix(window.location.hostname)}
      importMode={importMode}
      readonlyBanner={childReadonly ? `子机构数据 · 仅可查看：本 KP 归属「${entry.org}」，机构后台角色的「可操作」权限仅针对本机构数据，如需编辑请在该子机构后台操作。` : undefined}
      shareOrgName="YY 教育"
      kpName={entry.name}
      kpStatus={kpStatus}
      onKpStatusChange={(next) => setStatus(id, next)}
      purchasedUsers={entry.purchasedUsers}
      bookUsers={entry.bookUsers}
      kpRelations={entry.relations}
      storageBlocked={storageBlocked}
    />
  );
}
