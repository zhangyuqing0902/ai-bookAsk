// 0806：平台机构详情 · 机构资料（Tab 6，0806-2 由「协议文档」更名）预置演示数据。
// 归档与机构相关的全部资料：ICP 授权函 / 微信网站应用登记表 / 产品截图 / 合作协议等。
// 本文件须保持 node 可运行（不 import react / .tsx / css / window）。

export interface OrgAgreementFile {
  id: number;
  name: string;
  /** 图标 key（i-file=pdf / i-doc=word / i-image=图片），与 inferKind 口径一致 */
  icon: string;
  type: '图片' | '文档';
  /** 展示用文件大小 */
  size: string;
  uploadedAt: string;
}

// 支持格式与单文件上限（原型仅展示与拦截口径；0806-2 去除 PPT 支持——需求极少）：
// 图片 PNG/JPG/GIF ≤20MB；文档 DOC/DOCX/PDF ≤50MB
export const AGREEMENT_SPEC = [
  { k: '图片', v: 'PNG、JPG、GIF', z: '≤ 20MB' },
  { k: '文档', v: 'DOC/DOCX、PDF', z: '≤ 50MB' },
];

export const AGREEMENT_TYPES = ['全部', '图片', '文档'];

export const ORG_AGREEMENTS: OrgAgreementFile[] = [
  { id: 1, name: 'ICP 授权函（盖章扫描件）.pdf', icon: 'i-file', type: '文档', size: '8.6 MB', uploadedAt: '2026-07-18 14:22' },
  { id: 2, name: '微信网站应用登记表.docx', icon: 'i-doc', type: '文档', size: '1.2 MB', uploadedAt: '2026-07-18 14:25' },
  { id: 3, name: '产品截图-首页.png', icon: 'i-image', type: '图片', size: '2.4 MB', uploadedAt: '2026-07-20 10:08' },
  { id: 4, name: '产品截图-AI 会话.png', icon: 'i-image', type: '图片', size: '3.1 MB', uploadedAt: '2026-07-20 10:09' },
  { id: 5, name: '平台合作协议（双方用印）.pdf', icon: 'i-file', type: '文档', size: '12.8 MB', uploadedAt: '2026-06-30 17:41' },
  { id: 6, name: '合作备忘录（补充条款）.pdf', icon: 'i-file', type: '文档', size: '3.2 MB', uploadedAt: '2026-07-02 09:15' },
  { id: 7, name: '品牌演示.gif', icon: 'i-image', type: '图片', size: '9.8 MB', uploadedAt: '2026-07-22 16:30' },
];
