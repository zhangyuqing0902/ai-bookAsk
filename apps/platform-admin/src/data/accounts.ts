// 机构账户 mock（0714 从 Accounts.tsx 视图下移，供视图与导出 spec 共用）。
// 本文件须保持 node 可运行（不 import react / .tsx / css / window）。

export interface Acct {
  id: string;
  name: string;
  person: string;
  org: string;
  parent: string;
  role: string;
  roleCls: string;
  status: string;
  statusCls: string;
  contact: string;
  /** 0918：登录密码（明文）。导出模板按需求明文带出；真实系统须可逆加密存储才能导出原文 */
  pwd: string;
}

export const ACCOUNT_ROWS: Acct[] = [
  { id: 'AC001', name: 'admin01', person: '张三', org: 'XX 出版集团', parent: '—', role: '管理员', roleCls: 'tag-indigo', status: '正常', statusCls: 'tag-jade', contact: '138****8888', pwd: 'Xk7mPq2a' },
  { id: 'AC002', name: 'view01', person: '李四', org: 'YY 教育', parent: 'XX 出版集团', role: '只读', roleCls: 'tag-line', status: '停用', statusCls: 'tag-terra', contact: '139****0000', pwd: 'Vw3nRt8b' },
  { id: 'AC003', name: 'ops01', person: '王五', org: 'ZZ 少儿', parent: 'XX 出版集团', role: '运营', roleCls: 'tag-jade', status: '正常', statusCls: 'tag-jade', contact: '138****1003', pwd: 'Hy6sLd4c' },
  { id: 'AC004', name: 'admin02', person: '赵敏', org: 'YY 教育', parent: 'XX 出版集团', role: '管理员', roleCls: 'tag-indigo', status: '正常', statusCls: 'tag-jade', contact: '137****1122', pwd: 'Qe9jBn5d' },
  { id: 'AC005', name: 'ops02', person: '钱进', org: 'XX 出版集团', parent: '—', role: '运营', roleCls: 'tag-jade', status: '正常', statusCls: 'tag-jade', contact: '138****1005', pwd: 'Mz2kTw7e' },
  { id: 'AC006', name: 'view02', person: '孙莉', org: 'ZZ 少儿', parent: 'XX 出版集团', role: '只读', roleCls: 'tag-line', status: '正常', statusCls: 'tag-jade', contact: '136****3344', pwd: 'Fp8rGh3f' },
  { id: 'AC007', name: 'ops03', person: '周涛', org: 'YY 教育', parent: 'XX 出版集团', role: '运营', roleCls: 'tag-jade', status: '停用', statusCls: 'tag-terra', contact: '138****1007', pwd: 'Ld5vNc9g' },
  { id: 'AC008', name: 'admin03', person: '吴芳', org: 'ZZ 少儿', parent: 'XX 出版集团', role: '管理员', roleCls: 'tag-indigo', status: '正常', statusCls: 'tag-jade', contact: '135****5566', pwd: 'Rb4xJm6h' },
  { id: 'AC009', name: 'view03', person: '郑昊', org: 'XX 出版集团', parent: '—', role: '只读', roleCls: 'tag-line', status: '正常', statusCls: 'tag-jade', contact: '134****7788', pwd: 'Tn7qWs2j' },
  { id: 'AC010', name: 'ops04', person: '冯雪', org: 'YY 教育', parent: 'XX 出版集团', role: '运营', roleCls: 'tag-jade', status: '正常', statusCls: 'tag-jade', contact: '138****1010', pwd: 'Gc3yKp8k' },
  { id: 'AC011', name: 'admin04', person: '陈晨', org: 'ZZ 少儿', parent: 'XX 出版集团', role: '管理员', roleCls: 'tag-indigo', status: '停用', statusCls: 'tag-terra', contact: '133****9900', pwd: 'Wj6hZr4m' },
  { id: 'AC012', name: 'view04', person: '褚岩', org: 'YY 教育', parent: 'XX 出版集团', role: '只读', roleCls: 'tag-line', status: '正常', statusCls: 'tag-jade', contact: '132****2233', pwd: 'Nd9fXb5n' },
  { id: 'AC013', name: 'ops05', person: '卫东', org: 'XX 出版集团', parent: '—', role: '运营', roleCls: 'tag-jade', status: '正常', statusCls: 'tag-jade', contact: '138****1013', pwd: 'Ks2tCv7p' },
  { id: 'AC014', name: 'admin05', person: '蒋琳', org: 'ZZ 少儿', parent: 'XX 出版集团', role: '管理员', roleCls: 'tag-indigo', status: '正常', statusCls: 'tag-jade', contact: '131****4455', pwd: 'Yh8gMd3q' },
];
