import { KpDetailView } from '@aba/ui-admin';

// 平台后台 · 全域 KP 详情（直接复用机构后台 KP 详情；删除后返回全域 KP 列表）
export function GlobalKpDetail() {
  return <KpDetailView listBase="/global-kps" />;
}
