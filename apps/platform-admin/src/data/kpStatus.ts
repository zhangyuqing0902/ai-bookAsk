// 全域 KP 状态 / 权益文案映射（0714 从 GlobalKps.tsx 视图下移，供视图与导出 spec 共用）。
// 本文件须保持 node 可运行（不 import react / .tsx / css / window）。

// 0716 #1.1：与 @aba/mock KpProduct.status 四态对齐（归档并入删除）。
export const KP_STAT: Record<string, { t: string; cls: string }> = {
  published: { t: '已发布', cls: 'tag-jade' },
  draft: { t: '草稿', cls: 'tag-line' },
  unlisted: { t: '已下架', cls: 'tag-amber' },
  deleted: { t: '已删除', cls: 'tag-terra' },
};

/** 基础权益文案：free = 免费问、member = 会员专享（与 C 端权益标一致） */
export const KP_BASE_TAG: Record<string, string> = { free: '免费', member: '会员' };
