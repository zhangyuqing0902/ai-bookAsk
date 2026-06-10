import type { Organization } from '../types';

export const ORGS: Organization[] = [
  {
    id: 'org_med',
    name: '中国医学临床百家',
    shortName: '临',
    brandColor: '#4f46e5',
    parentId: null, // 顶级机构
    servicePhone: '400-820-1234',
    serviceEmail: 'service@med-clinic.cn',
  },
  {
    id: 'org_fin',
    name: '财经出版社',
    shortName: '财',
    brandColor: '#3730a3',
    parentId: null, // 顶级机构
    servicePhone: '400-666-8888',
    serviceEmail: 'cs@fin-press.cn',
  },
  {
    id: 'org_lit',
    name: '十月文学',
    shortName: '文',
    brandColor: '#ff7a5c',
    parentId: null, // 顶级机构
    servicePhone: '010-65000000',
    serviceEmail: 'reader@october-lit.cn',
  },
];

export const DEFAULT_ORG_ID = 'org_med';
