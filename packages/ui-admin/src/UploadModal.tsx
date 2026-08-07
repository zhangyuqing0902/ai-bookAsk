import { useRef, useState } from 'react';
import { Icon, FileTypeIcon, type FileKind } from '@aba/ui';
import { Modal } from './Modal';

// 0806：批量上传弹窗抽为共享组件（原 KpDetailView 私有 UploadModal，抽出供「机构详情 · 协议文档」等复用）。
// 交互不变：点击/拖拽多文件 + 每文件独立进度条 + 全部完成后确认；标题 / 格式 / 规格表 / 按钮文案参数化。

// 0615-2:知识库文件类型彩色图标(word/pdf/图片/音频/视频/演示 SVG)。icon 与文件名间距加大。
export const ICON_KIND: Record<string, FileKind> = { 'i-file': 'pdf', 'i-doc': 'word', 'i-image': 'image', 'i-sound': 'audio', 'i-play': 'video', 'i-video': 'video' };
export const fileIcon = (icon: string) => (
  <FileTypeIcon kind={ICON_KIND[icon] ?? 'word'} size={18} style={{ verticalAlign: -4, marginRight: 9 }} />
);

// 4.5:按文件扩展名推断 icon + 类型(文档/图片/音频/视频)
export const inferKind = (name: string): { icon: string; type: string } => {
  const ext = name.slice(name.lastIndexOf('.') + 1).toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) return { icon: 'i-image', type: '图片' };
  if (['mp3', 'wav', 'm4a', 'aac', 'flac'].includes(ext)) return { icon: 'i-sound', type: '音频' };
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return { icon: 'i-video', type: '视频' };
  if (ext === 'pdf') return { icon: 'i-file', type: '文档' };
  if (['doc', 'docx', 'txt', 'md', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) return { icon: 'i-doc', type: '文档' };
  return { icon: 'i-doc', type: '文档' };
};

export interface UploadSpecRow { k: string; v: string; z: string }
interface UpFile { id: number; name: string; icon: string; prog: number }

export function UploadModal({
  open,
  onClose,
  onDone,
  title = '上传知识文件',
  accept = '*/*',
  doneText = '进入知识库',
  dropHint = '支持文档 / 图片 / 音频 / 视频多文件混传，支持批量上传，不支持文件夹',
  specTitle = '单个文件上限（非单次合计）',
  specRows = [
    { k: '文档', v: 'PDF、DOC/DOCX、TXT、MD', z: '≤ 100MB' },
    { k: '图片', v: 'JPG/JPEG、PNG', z: '≤ 20MB' },
    { k: '音频', v: 'MP3、WAV', z: '≤ 300MB · 120 分钟' },
    { k: '视频', v: 'MP4、MOV', z: '≤ 1GB · 60 分钟' },
  ],
}: {
  open: boolean;
  onClose: () => void;
  onDone: (names: string[]) => void;
  title?: string;
  accept?: string;
  doneText?: string;
  dropHint?: string;
  specTitle?: string;
  specRows?: UploadSpecRow[];
}) {
  const [files, setFiles] = useState<UpFile[]>([]);
  const [drag, setDrag] = useState(false);
  const seq = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => { setFiles([]); };
  const close = () => { reset(); onClose(); };

  // 模拟上传进度(setTimeout 递增)
  const startProgress = (id: number) => {
    const tick = () => {
      setFiles((fs) => {
        const next = fs.map((f) => (f.id === id ? { ...f, prog: Math.min(100, f.prog + 18 + Math.round(Math.random() * 14)) } : f));
        const cur = next.find((f) => f.id === id);
        if (cur && cur.prog < 100) setTimeout(tick, 240 + Math.random() * 160);
        return next;
      });
    };
    setTimeout(tick, 220);
  };

  // 4.5:文件名允许重复,不去重不拦截
  const addFiles = (list: FileList | null) => {
    if (!list || !list.length) return;
    const arr = Array.from(list).map((f) => {
      const id = ++seq.current;
      return { id, name: f.name, icon: inferKind(f.name).icon, prog: 0 };
    });
    setFiles((fs) => [...fs, ...arr]);
    arr.forEach((f) => startProgress(f.id));
  };

  const allDone = files.length > 0 && files.every((f) => f.prog >= 100);

  return (
    <Modal
      title={title}
      open={open}
      onClose={close}
      width={720}
      footer={
        <>
          <button className="btn btn-ghost btn-sm" onClick={close}>取消</button>
          {/* 4.5:全部完成后确认按钮可点 */}
          <button className={'btn btn-primary btn-sm' + (allDone ? '' : ' off')} disabled={!allDone} onClick={() => { if (allDone) { onDone(files.map((f) => f.name)); reset(); } }}>
            {doneText}
          </button>
        </>
      }
    >
      {/* 点击选择 + 拖拽上传;input 不用 webkitdirectory(不支持文件夹嵌套) */}
      <input ref={inputRef} type="file" multiple accept={accept} style={{ display: 'none' }} onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
      {/* 0614：弹窗左右布局——左=上传按钮 + 单文件格式 / 大小限制；右=批量上传进度与文件列表 */}
      <div className="up-modal">
        <div className="up-left">
          <div
            className={'up-drop' + (drag ? ' on' : '')}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
          >
            <Icon id="i-up" w={26} h={26} />
            <div className="up-drop-t">点击选择 或 拖拽文件到此处</div>
            <div className="up-drop-s">{dropHint}</div>
          </div>
          <div className="up-spec">
            <div className="up-spec-h">{specTitle}</div>
            {specRows.map((r) => (
              <div className="up-spec-row" key={r.k}><span className="k">{r.k}</span><span className="v">{r.v}</span><span className="z">{r.z}</span></div>
            ))}
          </div>
        </div>
        <div className="up-right">
          <div className="up-right-h">批量上传{files.length > 0 ? `（${files.length} 个文件）` : ''}</div>
          {files.length > 0 ? (
            <div className="up-list">
              {files.map((f) => (
                <div className="up-item" key={f.id}>
                  {fileIcon(f.icon)}
                  <span className="up-item-nm">{f.name}</span>
                  <span className="up-item-bar"><i style={{ width: f.prog + '%' }} /></span>
                  <span className="up-item-pct mono">{f.prog >= 100 ? '完成' : f.prog + '%'}</span>
                  <span className="up-item-x" onClick={(e) => { e.stopPropagation(); setFiles((fs) => fs.filter((x) => x.id !== f.id)); }}>✕</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="up-empty">选择或拖入文件后，批量上传进度将在此显示</div>
          )}
        </div>
      </div>
    </Modal>
  );
}
