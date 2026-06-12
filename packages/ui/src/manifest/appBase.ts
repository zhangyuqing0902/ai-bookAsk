// 跨端地址解析：本地用「当前主机:端口」（支持局域网 IP），线上用部署域名。
// 使用方无需维护任何地址；部署域名敲定后仅改本文件 PROD_BASES 一处。
import { APP_META, type AppKey } from './data';

// 线上部署域名（Vercel 等）。留空则回退到当前 origin（同端跳转始终可用）。
const PROD_BASES: Record<AppKey, string> = {
  mobile: 'https://ai-book-ask-mobile-h5.zhangyuqing.top',
  org: 'https://ai-book-ask-org-admin.zhangyuqing.top',
  platform: 'https://ai-book-ask-platform-admin.zhangyuqing.top',
};

function isDev(): boolean {
  try {
    return Boolean((import.meta as any).env?.DEV);
  } catch {
    return false;
  }
}

/** 返回目标端的基址（不含路径）。本地：协议//当前主机:端口；线上：部署域名或当前 origin。 */
export function appBase(app: AppKey): string {
  if (typeof window === 'undefined') return '';
  if (isDev()) {
    return `${window.location.protocol}//${window.location.hostname}:${APP_META[app].devPort}`;
  }
  return PROD_BASES[app] || window.location.origin;
}
