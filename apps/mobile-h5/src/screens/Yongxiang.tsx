import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@aba/ui';
import { MediaPreview, type PreviewItem } from '@aba/ui-mobile';

// 14 我的永享（点击预览：图/音/视 不同预览方式）
const ITEMS: PreviewItem[] = [
  { kind: 'image', name: '心电图示例' },
  { kind: 'audio', name: '专题讲座 · 低钠饮食' },
  { kind: 'video', name: '手术演示 · 冠脉造影' },
  { kind: 'image', name: '血压监测记录表' },
  { kind: 'audio', name: '用药讲解音频' },
  { kind: 'video', name: '家庭康复训练' },
];
const TYPE_LABEL = { image: '图片', audio: '音频', video: '视频' };

export function Yongxiang() {
  const nav = useNavigate();
  const [preview, setPreview] = useState<PreviewItem | null>(null);
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
          <div className="yx-grid">
            {ITEMS.map((it) => (
              <div className="yx-card tap" key={it.name} onClick={() => setPreview(it)}>
                <div className="yx-cover">
                  <span className="pl">
                    <Icon id={it.kind === 'image' ? 'i-image' : 'i-play'} />
                  </span>
                  {TYPE_LABEL[it.kind]}
                </div>
                <div className="yx-meta">
                  {it.name}
                  <div className="ty">
                    {TYPE_LABEL[it.kind]} · 永久解锁
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <MediaPreview item={preview} onClose={() => setPreview(null)} />
    </>
  );
}
