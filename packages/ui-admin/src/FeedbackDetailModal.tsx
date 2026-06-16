import { useState } from 'react';
import { Icon } from '@aba/ui';
import { Modal } from './Modal';
import { MediaView, type MediaItem } from './MediaView';

export interface FeedbackDetailData {
  q: string;
  answer: string;
  media: MediaItem[];
  tag: string;
  cls: string;
  user: string; // 已是昵称（调用方传入 nickOf 后的值）
  member: boolean;
  time: string;
  org?: string; // 平台视角多显示归属机构
}

const kindIcon = (k: MediaItem['kind']) => (k === 'image' ? 'i-image' : k === 'video' ? 'i-play' : 'i-sound');

// 答案反馈详情弹窗（机构后台 / 平台后台共用，0614b 抽公共组件，避免两套）
// 与前台 AI 会话保持一致：用户问题=主题色渐变气泡(右)，AI 答案=白底+边框气泡(左)；
// 媒体改「相关媒体资源」横向缩略图条（左右滑动、点击放大）；元信息与气泡间加浅灰分隔线，
// 避免运营误以为这是 C 端 AI 会话界面本身。
export function FeedbackDetailModal({ detail, onClose }: { detail: FeedbackDetailData | null; onClose: () => void }) {
  const [preview, setPreview] = useState<MediaItem | null>(null);
  return (
    <>
      <Modal title="反馈详情" open={!!detail} onClose={onClose} width={560}>
        {detail && (
          <div className="fb-detail">
            <div className="fb-line">
              <span className={'tag-s ' + detail.cls}>{detail.tag}</span>
              <span className="fb-meta">
                {detail.org && (
                  <>
                    <span style={{ fontWeight: 600, color: 'var(--ink-2)' }}>{detail.org}</span>
                    <span style={{ margin: '0 6px', color: 'var(--ink-3)' }}>·</span>
                  </>
                )}
                {detail.user}
                {detail.member && <span className="tag-s tag-amber" style={{ marginLeft: 6 }}>会员</span>}
                <span className="mono" style={{ marginLeft: 10, color: 'var(--ink-3)' }}>{detail.time}</span>
              </span>
            </div>
            {/* 浅灰分隔线：把反馈元信息与下方问答气泡分开 */}
            <div className="fb-divider" />
            <div className="fb-chat">
              <div className="fb-bubble user">
                <div className="fb-bub-role">用户问题</div>
                <div className="fb-bub-body">{detail.q}</div>
              </div>
              <div className="fb-bubble ai">
                <div className="fb-bub-role">AI 答案</div>
                <div className="fb-bub-body">{detail.answer}</div>
                {detail.media.length > 0 && (
                  <div className="fb-media">
                    <div className="fb-media-k">相关媒体资源</div>
                    {/* 横向缩略图条：左右滑动、点击放大（与前台一致） */}
                    <div className="fb-media-strip">
                      {detail.media.map((m, i) => (
                        <div key={i} className="fb-thumb" onClick={() => setPreview(m)} title={'点击放大 ' + m.name}>
                          <span className="fb-thumb-ic">
                            <Icon id={kindIcon(m.kind)} w={20} h={20} />
                          </span>
                          <span className="fb-thumb-nm">{m.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
      <MediaView item={preview} onClose={() => setPreview(null)} />
    </>
  );
}
