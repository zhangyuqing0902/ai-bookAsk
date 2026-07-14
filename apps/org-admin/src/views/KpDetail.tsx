import { useSearchParams } from 'react-router-dom';
import { KpDetailView } from '@aba/ui-admin';
import { tenantDomainSuffix } from '@aba/mock';

// 机构后台 · KP 详情（复用共享 KpDetailView）
// 机构后台代表单一机构（演示机构 XX 出版社，域名前缀 xx-press）；前台地址后缀按当前环境生成。
// ?share=realtime|snapshot 由 KP 列表带入：实时同步导入的 KP 走只读、隐藏二维码 / 分享 Tab。
export function KpDetail() {
  const [sp] = useSearchParams();
  const share = sp.get('share');
  const importMode = share === 'realtime' ? 'realtime' : share === 'snapshot' ? 'snapshot' : 'own';
  return <KpDetailView listBase="/kps" orgPrefix="xx-press" domainSuffix={tenantDomainSuffix(window.location.hostname)} importMode={importMode} />;
}
