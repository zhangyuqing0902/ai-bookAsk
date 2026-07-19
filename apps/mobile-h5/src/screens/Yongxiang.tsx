import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { KPS } from '@aba/mock';
import { MediaPreview, type PreviewItem } from '@aba/ui-mobile';

// 14 我的永享（点击预览：图/音/视 不同预览方式）
// 0613：顶部新增搜索（文件名模糊匹配）+ 文件类型筛选（全部/图片/音频/视频）
// 0716 #1.2：关联 KP 已删除(deleted 软删、内容下线)的条目——封面置灰+「已失效」标,点击不进预览改弹 toast。
// 0717 #1.4：下架(unlisted)同样拦截——运营下架的真实动机多为「临时禁访问、之后再上架」,
//           故已购永享也标「已下架」并拦截,权益不清除,重新上架后自动恢复(不再按买断契约放行)。
// kpId 为本页扩展字段(PreviewItem 定义在 @aba/ui-mobile,不动包,本地交叉类型)
type YxItem = PreviewItem & { kpId?: string };
const ITEMS: YxItem[] = [
  { kind: 'image', name: '心电图示例' },
  { kind: 'audio', name: '专题讲座 · 低钠饮食' },
  { kind: 'video', name: '手术演示 · 冠脉造影' },
  { kind: 'image', name: '血压监测记录表' },
  { kind: 'audio', name: '用药讲解音频' },
  { kind: 'video', name: '家庭康复训练' },
  // 演示:关联 KP「围手术期麻醉管理精要」已下架,C 端展示「已下架」并拦截
  { kind: 'audio', name: '麻醉决策要点讲解（音频）', kpId: 'kp_anesthesia' },
  // 演示:关联 KP「急诊超声快速上手(旧版)」已删除,C 端展示「已失效」
  { kind: 'video', name: '急诊超声操作示范（视频）', kpId: 'kp_ultrasound_old' },
];

// 已失效:关联 KP 被删除(deleted 软删、内容下线);已下架:关联 KP unlisted(临时禁访问)
const kpStatus = (it: YxItem) => (it.kpId ? KPS.find((k) => k.id === it.kpId)?.status : undefined);
const isDead = (it: YxItem) => kpStatus(it) === 'deleted';
const isOff = (it: YxItem) => kpStatus(it) === 'unlisted';
const TYPE_LABEL = { image: '图片', audio: '音频', video: '视频' };
type Filter = 'all' | 'image' | 'audio' | 'video';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'image', label: '图片' },
  { key: 'audio', label: '音频' },
  { key: 'video', label: '视频' },
];

export function Yongxiang() {
  const nav = useNavigate();
  const [preview, setPreview] = useState<PreviewItem | null>(null);
  const [q, setQ] = useState('');
  const [type, setType] = useState<Filter>('all');

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return ITEMS.filter((it) => (type === 'all' || it.kind === type) && it.name.toLowerCase().includes(kw));
  }, [q, type]);

  return (
    <>
      <div className="h5-top">
        <div className="ic tap" onClick={() => nav(-1)}>
          <Icon id="i-chevL" w={22} h={22} />
        </div>
        <div className="center">
          <div className="ttl">我的永享</div>
        </div>
        <div className="grp" />
      </div>
      <div className="pg">
        <div className="scrollY">
          <div className="h5srch">
            <Icon id="i-search" />
            <input placeholder="搜索永享文件名称" value={q} onChange={(e) => setQ(e.target.value)} />
            {q && (
              <span className="h5srch-x tap" onClick={() => setQ('')}>
                ✕
              </span>
            )}
          </div>
          <div className="fchips">
            {FILTERS.map((f) => (
              <span key={f.key} className={'fchip' + (type === f.key ? ' on' : '')} onClick={() => setType(f.key)}>
                {f.label}
              </span>
            ))}
          </div>
          {list.length ? (
            <div className="yx-grid">
              {list.map((it) => {
                const dead = isDead(it);
                const off = isOff(it);
                return (
                  <div
                    className="yx-card tap"
                    key={it.name}
                    onClick={() => {
                      // 已失效/已下架:不进预览,弹说明 toast(下架为临时禁访问,重新上架后自动恢复)
                      if (dead) {
                        toast('该内容已失效，若有问题请联系客服', 3000);
                        return;
                      }
                      if (off) {
                        toast('该内容已下架，若有问题请联系客服', 3000);
                        return;
                      }
                      setPreview(it);
                    }}
                  >
                    <div className={'yx-cover' + (dead || off ? ' dead' : '')}>
                      <span className="pl">
                        <Icon id={it.kind === 'image' ? 'i-image' : 'i-play'} />
                      </span>
                      {TYPE_LABEL[it.kind]}
                    </div>
                    {/* 状态标放卡片层(不随封面置灰),保持可读 */}
                    {dead && <span className="yx-dead">已失效</span>}
                    {off && <span className="yx-off">已下架</span>}
                    <div className="yx-meta">
                      {it.name}
                      <div className="ty">{TYPE_LABEL[it.kind]}{dead ? ' · 已失效' : off ? ' · 已下架' : ' · 永久解锁'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h5empty">没有匹配的永享内容</div>
          )}
        </div>
      </div>
      <MediaPreview item={preview} onClose={() => setPreview(null)} />
    </>
  );
}
