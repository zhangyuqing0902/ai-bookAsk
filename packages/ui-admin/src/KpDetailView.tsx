import { useState, useRef, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast, FileTypeIcon, type FileKind } from '@aba/ui';
import { Search, TextInput } from './Fields';
import { Dropdown } from './Dropdown';
import { DataGrid, type Col } from './DataGrid';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';
import { pickFile, ACCEPT } from './Upload';

const TABS = [
  { id: 'base', label: '基础信息' },
  { id: 'kb', label: '知识库' },
  { id: 'yx', label: '永享' },
  { id: 'price', label: '定价与权益' },
  { id: 'qr', label: '二维码' },
  { id: 'share', label: '分享' },
] as const;
type TabId = (typeof TABS)[number]['id'];

// 0615-2:知识库文件类型彩色图标(用上传的 word/pdf/图片/音频/视频 SVG,FileTypeIcon)。icon 与文件名间距加大。
const ICON_KIND: Record<string, FileKind> = { 'i-file': 'pdf', 'i-doc': 'word', 'i-image': 'image', 'i-sound': 'audio', 'i-play': 'video', 'i-video': 'video' };
const fileIcon = (icon: string) => (
  <FileTypeIcon kind={ICON_KIND[icon] ?? 'word'} size={18} style={{ verticalAlign: -4, marginRight: 9 }} />
);

// 4.5:按文件扩展名推断 icon + 类型(文档/图片/音频/视频)
const inferKind = (name: string): { icon: string; type: string } => {
  const ext = name.slice(name.lastIndexOf('.') + 1).toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) return { icon: 'i-image', type: '图片' };
  if (['mp3', 'wav', 'm4a', 'aac', 'flac'].includes(ext)) return { icon: 'i-sound', type: '音频' };
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return { icon: 'i-video', type: '视频' };
  if (ext === 'pdf') return { icon: 'i-file', type: '文档' };
  if (['doc', 'docx', 'txt', 'md', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) return { icon: 'i-doc', type: '文档' };
  return { icon: 'i-doc', type: '文档' };
};

interface KbFile {
  id: number;
  name: string;
  icon: string;
  type: string;
  slice: string;
  // 4.7:已向量化成功(ok)的文件带上架/下架状态(shelf);上架=可被检索
  shelf?: boolean;
  st: { kind: string; text: string; prog?: number; reason?: string };
}
const KB0: KbFile[] = [
  { id: 1, name: 'ch3-饮食管理.pdf', icon: 'i-file', type: '文档', slice: '语义', shelf: true, st: { kind: 'ok', text: '已向量化' } },
  { id: 2, name: 'ch5-药物治疗.pdf', icon: 'i-file', type: '文档', slice: '章节', st: { kind: 'ing', text: '向量化中 60%', prog: 60 } },
  { id: 3, name: '诊疗指南.docx', icon: 'i-doc', type: '文档', slice: '字数', shelf: false, st: { kind: 'ok', text: '已向量化' } },
  { id: 4, name: '心电图示例.png', icon: 'i-image', type: '图片', slice: '—', shelf: true, st: { kind: 'ok', text: '已向量化' } },
  // 4.6:音视频提取字幕后自动向量化(直接 ok),不再有「待确认字幕」步骤
  { id: 5, name: '专题讲座.mp3', icon: 'i-sound', type: '音频', slice: '—', shelf: true, st: { kind: 'ok', text: '已向量化' } },
  { id: 6, name: '手术演示.mp4', icon: 'i-play', type: '视频', slice: '—', st: { kind: 'fail', text: '向量化失败', reason: '文件解析失败：视频时长超过 60 分钟上限,请压缩或分段后重传' } },
];
const TYPE_ORDER: Record<string, number> = { 文档: 0, 图片: 1, 音频: 2, 视频: 3 };
const ST_ORDER: Record<string, number> = { ing: 2, ok: 3, fail: 4 };

interface Yx { name: string; icon: string; type: string; price: number | null }
const YX: Yx[] = [
  { name: '心电图示例.png', icon: 'i-image', type: '图片', price: 9.9 },
  { name: '专题讲座.mp3', icon: 'i-sound', type: '音频', price: null },
  { name: '手术演示.mp4', icon: 'i-play', type: '视频', price: 29.9 },
];
// 4.8:二维码包 —— 含可读包号(pkg) + 扫描统计;ID = QR-{KP编号}-{包号}-{序号}
interface Qr {
  name: string;
  pkg: string; // 包号,如 B01
  mode: string;
  qty: number; // 生成的二维码数量
  totalScans: number | null; // 扫描总量
  firstScans: number | null; // 首扫数量
  rescans: number | null; // 后扫数量
}
const KP_CODE = 'KP012'; // 当前 KP 全平台唯一编号(心血管分册)
const QR: Qr[] = [
  { name: '心血管首发批次', pkg: 'B01', mode: '首扫绑定,后扫引导', qty: 100, totalScans: 8642, firstScans: 6210, rescans: 2432 },
  { name: '内部测试码', pkg: 'B02', mode: '无权益', qty: 1, totalScans: 38, firstScans: null, rescans: 38 },
  { name: '渠道地推码', pkg: 'B03', mode: '首扫绑定,后扫引导', qty: 500, totalScans: null, firstScans: null, rescans: null },
];

// 4.8.3:全平台唯一且可读的二维码 ID,格式 QR-KP012-B03-0007
const qrId = (pkg: string, n: number) => `QR-${KP_CODE}-${pkg}-${String(n).padStart(4, '0')}`;

// 4.8.1:某包内单张二维码明细(mock)
interface QrCode {
  id: string;
  firstStatus: '已首扫' | '未首扫';
  firstTime: string;
  account: string;
  phone: string;
  rescans: number;
}
const FIRST_NAMES = ['张敏', '李伟', '王芳', '刘洋', '陈静', '杨帆', '赵磊', '孙琳', '周强', '吴敏', '郑华', '冯婷'];
const buildQrCodes = (pkg: string, qty: number): QrCode[] =>
  Array.from({ length: Math.min(qty, 48) }).map((_, i) => {
    const bound = (i * 7 + 3) % 5 !== 0; // 约 8 成已首扫
    const nm = FIRST_NAMES[i % FIRST_NAMES.length];
    return {
      id: qrId(pkg, i + 1),
      firstStatus: bound ? '已首扫' : '未首扫',
      firstTime: bound ? `2026-04-${String((i % 27) + 1).padStart(2, '0')} 1${i % 9}:0${i % 6}` : '—',
      account: bound ? nm : '—',
      phone: bound ? `13${(i % 9) + 1}****${String(1000 + i).slice(-4)}` : '—',
      rescans: bound ? (i * 13) % 40 : 0,
    };
  });
interface Share { link: string; mode: string; ttl: string; ttlOrder: number; used: string; status: string; statusCls: string; canCancel: boolean }
const SHARES: Share[] = [
  { link: '..abc/8821', mode: '实时同步', ttl: '还剩 2 天', ttlOrder: 2, used: '1 / 1', status: '已作废', statusCls: 'tag-line', canCancel: false },
  { link: '..xyz/4490', mode: '独立快照', ttl: '还剩 5 天', ttlOrder: 5, used: '3 / 10', status: '生效中', statusCls: 'tag-jade', canCancel: true },
];

type Confirm = { title: string; desc: ReactNode; danger?: boolean; confirmText?: string; onOk: () => void };

// KP 详情（6 Tab）——机构后台 + 平台后台全域 KP 共用，0614b 抽公共组件。
// listBase 适配两端「删除后返回列表」的路由（机构 /kps、平台 /global-kps）。
export function KpDetailView({ listBase = '/kps' }: { listBase?: string }) {
  const nav = useNavigate();
  const [tab, setTab] = useState<TabId>('base');
  const [price, setPrice] = useState(0);
  const [cover, setCover] = useState(true);
  const [crop, setCrop] = useState(false);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });

  const [kbQ, setKbQ] = useState('');
  const [kbFmt, setKbFmt] = useState('全部');
  // 4.5/4.6/4.7:知识库文件列表交由 state 管理(支持新增上传 / 上架下架切换)
  const [kb, setKb] = useState<KbFile[]>(KB0);
  const kbId = useRef(100);
  const [uploadOpen, setUploadOpen] = useState(false);
  // 4.6:新加入的「向量化中」文件自动推进至「已向量化」(音视频提取字幕后直接 ing→ok,无需确认),
  // 默认上架(可被检索)。demo 用 setTimeout 模拟向量化完成。
  useEffect(() => {
    const ing = kb.filter((f) => f.st.kind === 'ing' && (f.st.prog ?? 0) < 100);
    if (!ing.length) return;
    const t = setTimeout(() => {
      setKb((list) =>
        list.map((f) => {
          if (f.st.kind !== 'ing') return f;
          const p = (f.st.prog ?? 0) + 30;
          return p >= 100
            ? { ...f, shelf: true, st: { kind: 'ok', text: '已向量化' } }
            : { ...f, st: { ...f.st, prog: p, text: '向量化中 ' + p + '%' } };
        }),
      );
    }, 900);
    return () => clearTimeout(t);
  }, [kb]);
  const [yxQ, setYxQ] = useState('');
  const [yxFmt, setYxFmt] = useState('全部');
  const [yxPrice, setYxPrice] = useState('全部');
  const [qrQ, setQrQ] = useState('');
  const [qrMode, setQrMode] = useState('全部');
  const [shareMode, setShareMode] = useState('全部');
  const [shareStatus, setShareStatus] = useState('全部');

  // 弹窗状态
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [priceModal, setPriceModal] = useState<Yx | null>(null);
  const [previewYx, setPreviewYx] = useState<Yx | null>(null);
  const [qrView, setQrView] = useState<Qr | null>(null);
  // 4.8.1:二维码包详情抽屉的内部筛选
  const [qrcAcc, setQrcAcc] = useState('');
  const [qrcPhone, setQrcPhone] = useState('');
  const [qrNew, setQrNew] = useState(false);
  const [shareNew, setShareNew] = useState(false);

  // —— 知识库 ——
  const renderSt = (f: KbFile) => (
    <>
      <span className={'fstat ' + f.st.kind}>
        <span className="dt" />
        {f.st.text}
        {f.st.kind === 'fail' && f.st.reason && (
          // 0610:向量化失败原因悬浮提示,改用与指标同款的问号 icon
          <span className="has-tip" data-tip={f.st.reason} style={{ marginLeft: 2, display: 'inline-flex', verticalAlign: -2 }}>
            <span className="info-dot">?</span>
          </span>
        )}
      </span>
      {f.st.prog != null && (
        <span className="fbar">
          <i style={{ width: f.st.prog + '%' }} />
        </span>
      )}
    </>
  );
  // 4.7:上架/下架切换(仅 ok 文件)
  const toggleShelf = (f: KbFile) =>
    setKb((list) => list.map((x) => (x.id === f.id ? { ...x, shelf: !x.shelf } : x)));
  const renderOp = (f: KbFile) => {
    const del = () =>
      setConfirm({
        title: '删除文件',
        desc: <>确认删除「{f.name}」？删除后该文件的向量数据一并清除，不可恢复。</>,
        danger: true,
        confirmText: '确认删除',
        onOk: () => { setKb((list) => list.filter((x) => x.id !== f.id)); toast('已删除文件'); },
      });
    // 0610:下载已上传的知识文件内容(各状态文件均可下载,统一放在操作列最前)
    const dl = <span className="op" onClick={() => toast('已开始下载「' + f.name + '」')}>下载</span>;
    // 4.7:重试只对「向量化失败(fail)」显示;ok 不显示重试,改为上架/下架
    if (f.st.kind === 'ok')
      return (
        <div className="op-cell">
          {dl}
          <span className="op" onClick={() => { toggleShelf(f); toast(f.shelf ? '已下架,该内容停止被检索' : '已上架,该内容可被检索'); }}>
            {f.shelf ? '下架' : '上架'}
          </span>
          <span className="op op-danger" onClick={del}>删除</span>
        </div>
      );
    if (f.st.kind === 'fail')
      return (
        <div className="op-cell">
          {dl}
          <span
            className="op"
            onClick={() =>
              setConfirm({
                title: '重试向量化',
                desc: <>对「{f.name}」重新执行向量化处理？将重新解析并生成向量。</>,
                confirmText: '确认重试',
                onOk: () => toast('已重新提交向量化'),
              })
            }
          >
            重试
          </span>
          <span className="op op-danger" onClick={del}>删除</span>
        </div>
      );
    // ing:处理中,可下载与删除
    return (
      <div className="op-cell">
        {dl}
        <span className="op op-danger" onClick={del}>删除</span>
      </div>
    );
  };

  const kbRows = kb.filter((f) => (!kbQ || f.name.includes(kbQ)) && (kbFmt === '全部' || f.type === kbFmt));
  const kbCols: Col<KbFile>[] = [
    { header: '文件名', className: 'strong', cell: (f) => (<>{fileIcon(f.icon)} {f.name}</>) },
    { header: '类型', cell: (f) => f.type, sortValue: (f) => TYPE_ORDER[f.type] ?? 9 },
    { header: '处理状态', cell: renderSt, sortValue: (f) => ST_ORDER[f.st.kind] ?? 9 },
    // 0610:已向量化成功的文件展示上架/下架;向量化失败直接显示「下架」(不可检索);处理中显示「-」
    { header: '检索状态', cell: (f) => {
      if (f.st.kind === 'ok') return <span className={'tag-s ' + (f.shelf ? 'tag-jade' : 'tag-line')}>{f.shelf ? '上架' : '下架'}</span>;
      if (f.st.kind === 'fail') return <span className="tag-s tag-line">下架</span>;
      return <span className="muted">-</span>;
    }, sortValue: (f) => (f.st.kind === 'ok' ? (f.shelf ? 0 : 1) : f.st.kind === 'fail' ? 1 : 2) },
    { header: '操作', cell: renderOp },
  ];

  // —— 永享 ——
  const yxRows = YX.filter(
    (y) => (!yxQ || y.name.includes(yxQ)) && (yxFmt === '全部' || y.type === yxFmt) && (yxPrice === '全部' || (yxPrice === '已设价') === (y.price !== null)),
  );
  const yxCols: Col<Yx>[] = [
    // 6.8:字段名「文件名」+ icon,规则同知识库
    { header: '文件名', className: 'strong', cell: (y) => (<>{fileIcon(y.icon)} {y.name}</>) },
    { header: '类型', cell: (y) => y.type, sortValue: (y) => TYPE_ORDER[y.type] ?? 9 },
    // 6.8:预览列展示缩略图,点击放大查看(只查看不删除)
    { header: '预览', cell: (y) => (
      <span className="yx-thumb" onClick={() => setPreviewYx(y)}>
        <Icon id={y.icon === 'i-image' ? 'i-image' : 'i-play'} w={15} h={15} />
      </span>
    ) },
    // 6.9:未设价显示「-」,无文字
    { header: '永享价', cell: (y) => (y.price === null ? <span className="muted">-</span> : <span className="mono">¥{y.price}</span>), sortValue: (y) => y.price ?? -1 },
    { header: '操作', cell: (y) => (
      <div className="op-cell">
        <span className="op" onClick={() => setPriceModal(y)}>{y.price === null ? '设置价格' : '编辑价格'}</span>
      </div>
    ) },
  ];

  // —— 二维码 ——
  const qrRows = QR.filter((r) => (!qrQ || r.name.includes(qrQ)) && (qrMode === '全部' || r.mode === qrMode));
  // 4.8.2:数量字段无值显示「-」并可排序(null 排末尾)
  const numCell = (v: number | null) => (v == null ? <span className="muted">-</span> : <span className="mono">{v.toLocaleString()}</span>);
  const numSort = (v: number | null) => (v == null ? -1 : v);
  const qrCols: Col<Qr>[] = [
    { header: '二维码包名称', className: 'strong', cell: (r) => r.name },
    { header: '权益模式', cell: (r) => r.mode },
    // 4.8.2:原「数量」列名改为「生成的二维码数量」
    { header: '生成的二维码数量', className: 'mono', cell: (r) => r.qty.toLocaleString(), sortValue: (r) => r.qty },
    { header: '扫描总量', cell: (r) => numCell(r.totalScans), sortValue: (r) => numSort(r.totalScans) },
    { header: '首扫数量', cell: (r) => numCell(r.firstScans), sortValue: (r) => numSort(r.firstScans) },
    { header: '后扫数量', cell: (r) => numCell(r.rescans), sortValue: (r) => numSort(r.rescans) },
    { header: '操作', cell: (r) => (
      <div className="op-cell">
        {/* 4.8.1:查看 → 右侧抽屉展示该包全部二维码 */}
        <span className="op" onClick={() => { setQrcAcc(''); setQrcPhone(''); setQrView(r); }}>查看</span>
        {/* 4.8.3:每张图片以二维码 ID 命名 */}
        <span className="op" onClick={() => toast(`已开始下载 zip · 每张图片以二维码 ID 命名(如 ${qrId(r.pkg, 1)}.png)`)}>下载 zip</span>
      </div>
    ) },
  ];

  // 4.8.1:抽屉内二维码明细 + 按首扫账户名称/手机号模糊匹配
  const qrCodes = qrView ? buildQrCodes(qrView.pkg, qrView.qty) : [];
  const qrCodeRows = qrCodes.filter(
    (c) => (!qrcAcc || c.account.includes(qrcAcc)) && (!qrcPhone || c.phone.includes(qrcPhone)),
  );
  const qrCodeCols: Col<QrCode>[] = [
    { header: '二维码 ID', className: 'mono strong', cell: (c) => c.id },
    { header: '缩略图', cell: () => <span className="qr-thumb"><Icon id="i-qr" w={20} h={20} /></span> },
    { header: '首扫状态', cell: (c) => <span className={'tag-s ' + (c.firstStatus === '已首扫' ? 'tag-jade' : 'tag-line')}>{c.firstStatus}</span>, sortValue: (c) => (c.firstStatus === '已首扫' ? 0 : 1) },
    { header: '首扫时间', className: 'mono', cell: (c) => (c.firstTime === '—' ? <span className="muted">—</span> : c.firstTime), sortValue: (c) => c.firstTime },
    { header: '首扫账户', cell: (c) => (c.account === '—' ? <span className="muted">—</span> : c.account) },
    { header: '首扫手机号', className: 'mono', cell: (c) => (c.phone === '—' ? <span className="muted">—</span> : c.phone) },
    { header: '后扫数量', className: 'mono', cell: (c) => c.rescans, sortValue: (c) => c.rescans },
  ];

  // —— 分享 ——
  const shareRows = SHARES.filter((s) => (shareMode === '全部' || s.mode === shareMode) && (shareStatus === '全部' || s.status === shareStatus));
  const shareCols: Col<Share>[] = [
    { header: '链接 / 密码', cell: (s) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span className="mono">{s.link}</span>
        <span className="op" style={{ display: 'inline-flex', cursor: 'pointer' }} onClick={() => toast('已复制分享链接')}>
          <Icon id="i-copy" w={13} h={13} />
        </span>
      </span>
    ) },
    { header: '模式', cell: (s) => s.mode, sortValue: (s) => s.mode },
    { header: '链接分享有效期', cell: (s) => s.ttl, sortValue: (s) => s.ttlOrder },
    { header: '消费 / 上限', className: 'mono', cell: (s) => s.used },
    { header: '状态', cell: (s) => <span className={'tag-s ' + s.statusCls}>{s.status}</span>, sortValue: (s) => s.status },
    { header: '操作', cell: (s) => (s.canCancel ? (
      <div className="op-cell">
        <span className="op op-danger" onClick={() => setConfirm({
          title: '取消分享',
          desc: <>取消后该分享链接「{s.link}」立即失效，已导入的下级机构不受影响。</>,
          danger: true,
          confirmText: '确认取消',
          onOk: () => toast('已取消分享'),
        })}>取消分享</span>
      </div>
    ) : <span className="muted">—</span>) },
  ];

  return (
    <>
      <div className="kpd-head">
        <span className="kpd-back" onClick={() => nav(-1)}>
          <Icon id="i-chevL" />
          返回
        </span>
        <span className="kpd-name">心血管分册 · 第4版</span>
        <span className="tag-s tag-indigo">自建</span>
        {/* 6.15:状态紧跟自建标签直接显示,不要「当前状态」文案 */}
        <span className="tag-s tag-jade">已发布</span>
        <span className="kpd-status">
          <button className="btn btn-ghost btn-sm" onClick={() => setConfirm({
            title: '下架知识 KP',
            desc: '下架后该 KP 将从 C 端检索中移除，用户无法再提问；可随时重新发布。',
            confirmText: '确认下架',
            onOk: () => toast('已下架'),
          })}>下架</button>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--terra)', borderColor: 'var(--terra-soft)' }} onClick={() => setConfirm({
            title: '删除知识 KP',
            desc: '删除后该 KP 及其全部知识库文件、向量数据、二维码与分享将一并清除，不可恢复。',
            danger: true,
            confirmText: '确认删除',
            onOk: () => { toast('已删除'); nav(listBase); },
          })}>删除</button>
        </span>
      </div>

      <div className="kpd-tabs">
        {TABS.map((t) => (
          <div key={t.id} className={'kpd-tab' + (tab === t.id ? ' on' : '')} onClick={() => setTab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>

      {tab === 'base' && (
        <div style={{ display: 'flex', gap: 26 }}>
          <div>
            <div className="cover-up">
              {cover ? (
                <>
                  <div className="cover9">
                    <div className="ct">心血管分册 · 第4版</div>
                  </div>
                  <div className="ops">
                    <span onClick={() => pickFile(ACCEPT.cover, () => setCrop(true))}>重新上传</span>
                    <span onClick={() => setConfirm({
                      title: '删除封面',
                      desc: '删除后该 KP 将显示默认封面，可随时重新上传。',
                      danger: true,
                      confirmText: '确认删除',
                      onOk: () => { setCover(false); toast('已删除封面'); },
                    })}>删除</span>
                  </div>
                </>
              ) : (
                <div className="empty" onClick={() => pickFile(ACCEPT.cover, () => setCrop(true))}>
                  <Icon id="i-up" w={22} h={22} />
                  上传封面
                  <span style={{ fontSize: 11 }}>建议 9:16</span>
                </div>
              )}
            </div>
          </div>
          <div className="fm-card" style={{ flex: 1, margin: 0 }}>
            <div className="fm-row">
              <div className="lab">KP 名称<span className="req">*</span></div>
              <div className="ctl"><TextInput defaultValue="心血管分册 · 第4版" /></div>
            </div>
            <div className="fm-row">
              <div className="lab">简介</div>
              <div className="ctl"><TextInput placeholder="心血管疾病诊疗知识库,覆盖诊断、用药、术后管理…" /></div>
            </div>
            <div className="fm-row">
              <div className="lab">纸书购买链接</div>
              {/* 6.2:说明文案放进输入框做 placeholder 提示 */}
              <div className="ctl"><TextInput placeholder="填写后,用户查看内容溯源时可跳转该链接" /></div>
            </div>
            <div className="fm-row">
              {/* 0613-2:关联 Agent 为必填（KP 必须挂载一个 Agent 才能对外提问） */}
              <div className="lab">关联 Agent<span className="req">*</span></div>
              {/* 0610:下拉宽度收敛为与表单其他选择控件一致(200px),不再填满整行 */}
              <div className="ctl"><Dropdown label="李医生" options={['李医生', '王老师', '机构 Agent']} style={{ width: 200 }} /></div>
            </div>
            {/* 4.3:基础信息表单底部保存按钮 */}
            <div className="fm-row" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-primary btn-sm" onClick={() => toast('已保存')}>保存</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'kb' && (
        <>
          <div className="filter">
            <Search placeholder="搜索文件名" minWidth={220} value={kbQ} onChange={setKbQ} />
            {/* 6.7:默认显示「全部」,不带字段名 */}
            <Dropdown label="全部" options={['全部', '文档', '图片', '音频', '视频']} onSelect={setKbFmt} />
            <div className="grow" />
            {/* 6.5:文案 */}
            <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>上传即向量化，发布知识 KP 需至少一份已向量化完成的知识内容</span>
            {/* 4.5:打开上传知识文件弹窗 */}
            <button className="btn btn-primary btn-sm" onClick={() => setUploadOpen(true)}>
              <Icon id="i-up" w={14} h={14} />
              上传知识文件
            </button>
          </div>
          <DataGrid columns={kbCols} rows={kbRows} empty={{ title: '没有匹配的文件' }} />
        </>
      )}

      {tab === 'yx' && (
        <>
          <div className="filter">
            <Search placeholder="搜索文件名" minWidth={220} value={yxQ} onChange={setYxQ} />
            <Dropdown label="全部" options={['全部', '图片', '音频', '视频']} onSelect={setYxFmt} />
            <Dropdown label="全部" options={['全部', '已设价', '未设价']} onSelect={setYxPrice} />
            <div className="grow" />
            <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>新增 / 删除永享内容请在「知识库」Tab 操作</span>
          </div>
          <DataGrid columns={yxCols} rows={yxRows} empty={{ title: '没有匹配的内容' }} />
        </>
      )}

      {tab === 'price' && (
        <div className="fm-card">
          <div className="fh">基础权益标签 <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: 13 }}>免费 / 会员 二选一互斥</span></div>
          <div className="radio-list" style={{ padding: '6px 0 16px' }}>
            <div className={'radio-opt' + (price === 0 ? ' on' : '')} onClick={() => setPrice(0)}>
              <div className="rd" />
              <div><div className="rt">免费</div><div className="rs">平台上所有用户（无论免费或会员）均可查看此知识 KP 的全部非永享内容，包括文字、图片、音频、视频；仅「永享」标记内容需单独购买。</div></div>
            </div>
            <div className={'radio-opt' + (price === 1 ? ' on' : '')} onClick={() => setPrice(1)}>
              <div className="rd" />
              {/* 6.10/0614:文案详化，消除歧义 */}
              <div><div className="rt">会员</div><div className="rs">仅会员可查看此知识 KP 的图 / 音 / 视媒体资源；文字内容不受会员身份限制（免费 / 会员均可浏览）；「永享」标记内容仍需单独计价购买。</div></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'qr' && (
        <>
          <div className="filter">
            <Search placeholder="搜索二维码包名称" minWidth={220} value={qrQ} onChange={setQrQ} />
            {/* 6.11:默认「全部」 */}
            <Dropdown label="全部" options={['全部', '首扫绑定,后扫引导', '无权益']} onSelect={setQrMode} />
            <div className="grow" />
            <button className="btn btn-primary btn-sm" onClick={() => setQrNew(true)}>
              <Icon id="i-plus" w={14} h={14} />
              新建二维码包
            </button>
          </div>
          <DataGrid columns={qrCols} rows={qrRows} empty={{ title: '没有匹配的二维码包' }} />
        </>
      )}

      {tab === 'share' && (
        <>
          <div className="filter">
            {/* 6.13:按模式、状态筛选 */}
            <Dropdown label="全部" options={['全部', '实时同步', '独立快照']} onSelect={setShareMode} />
            <Dropdown label="全部" options={['全部', '生效中', '已作废']} onSelect={setShareStatus} />
            <div className="grow" />
            <button className="btn btn-primary btn-sm" onClick={() => setShareNew(true)}>
              <Icon id="i-plus" w={14} h={14} />
              新建分享
            </button>
          </div>
          <DataGrid columns={shareCols} rows={shareRows} empty={{ title: '还没有分享链接' }} />
        </>
      )}

      {/* —— 裁剪封面弹窗(6.1:裁剪框可拖拽) —— */}
      <Modal
        title="裁剪封面（9:16）"
        open={crop}
        onClose={() => setCrop(false)}
        width={420}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setCrop(false)}>取消</button>
            <button className="btn btn-primary btn-sm" onClick={() => { setCover(true); setCrop(false); toast('封面已更新'); }}>确定</button>
          </>
        }
      >
        <div className="crop-box">
          <div
            className="frame draggable"
            style={{ transform: `translate(${cropPos.x}px, ${cropPos.y}px)` }}
            onPointerDown={(e) => {
              const el = e.currentTarget;
              el.setPointerCapture(e.pointerId);
              const start = { x: e.clientX - cropPos.x, y: e.clientY - cropPos.y };
              const move = (ev: PointerEvent) => setCropPos({ x: ev.clientX - start.x, y: ev.clientY - start.y });
              const up = () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); };
              el.addEventListener('pointermove', move);
              el.addEventListener('pointerup', up);
            }}
          />
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center' }}>拖动裁剪框调整区域 · 输出 9:16 封面</div>
      </Modal>

      {/* —— 永享设置价格弹窗(6.9) —— */}
      <Modal
        title={priceModal?.price === null ? '设置永享价格' : '编辑永享价格'}
        open={priceModal !== null}
        onClose={() => setPriceModal(null)}
        width={400}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setPriceModal(null)}>取消</button>
            <button className="btn btn-primary btn-sm" onClick={() => { setPriceModal(null); toast('价格已保存,立即生效'); }}>保存</button>
          </>
        }
      >
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 4 }}>
          <div className="lab">内容</div>
          <div className="ctl">{priceModal && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{fileIcon(priceModal.icon)}{priceModal.name}</span>}</div>
        </div>
        <div className="fm-row">
          <div className="lab">永享价（元）<span className="req">*</span></div>
          <div className="ctl"><TextInput defaultValue={priceModal?.price != null ? String(priceModal.price) : ''} placeholder="如 9.9" /></div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>修改价格成功后将立即生效。</div>
      </Modal>

      {/* —— 永享内容预览弹窗(6.8:后台 UI,只查看不删除) —— */}
      <Modal title="内容预览" open={previewYx !== null} onClose={() => setPreviewYx(null)} width={460}>
        <div className="yx-preview">
          <div className="yx-preview-stage">
            <Icon id={previewYx?.icon === 'i-image' ? 'i-image' : 'i-play'} w={40} h={40} style={{ color: 'var(--ink-3)' }} />
          </div>
          <div className="yx-preview-name">{previewYx?.name}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{previewYx?.type} · 仅查看，删除请在「知识库」Tab 操作</div>
        </div>
      </Modal>

      {/* —— 4.8.1:二维码包详情抽屉(右侧滑入,列表展示全部二维码,分页 10/页) —— */}
      {qrView && (
        <>
          <div className="drawer-scrim" onClick={() => setQrView(null)} />
          <div className="drawer">
            <div className="drawer-h">
              <div>
                <div className="dh-t">{qrView.name}</div>
                <div className="dh-s">包号 {qrView.pkg} · 权益模式 {qrView.mode} · 共 {qrView.qty.toLocaleString()} 个二维码</div>
              </div>
              <span className="drawer-x" onClick={() => setQrView(null)}>✕</span>
            </div>
            <div className="drawer-b">
              <div className="filter">
                {/* 4.8.1:按首扫账户名称、首扫手机号模糊匹配 */}
                <Search placeholder="搜索首扫账户名称" minWidth={200} value={qrcAcc} onChange={setQrcAcc} />
                <Search placeholder="搜索首扫手机号" minWidth={200} value={qrcPhone} onChange={setQrcPhone} />
              </div>
              <DataGrid columns={qrCodeCols} rows={qrCodeRows} empty={{ title: '没有匹配的二维码' }} minWidth={760} pageUnit="个" />
            </div>
          </div>
        </>
      )}

      {/* —— 新建二维码包弹窗(6.12) —— */}
      <Modal
        title="新建二维码包"
        open={qrNew}
        onClose={() => setQrNew(false)}
        width={440}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setQrNew(false)}>取消</button>
            <button className="btn btn-primary btn-sm" onClick={() => { setQrNew(false); toast('已生成二维码包'); }}>生成</button>
          </>
        }
      >
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 4 }}>
          <div className="lab">包名称<span className="req">*</span></div>
          <div className="ctl"><TextInput placeholder="如 心血管二批" /></div>
        </div>
        <div className="fm-row">
          <div className="lab">权益模式</div>
          <div className="ctl"><Dropdown label="首扫绑定,后扫引导" options={['首扫绑定,后扫引导', '无权益']} style={{ width: 200 }} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">生成数量<span className="req">*</span></div>
          <div className="ctl"><TextInput placeholder="如 100" /></div>
        </div>
      </Modal>

      {/* —— 新建分享弹窗(6.13) —— */}
      <Modal
        title="新建分享"
        open={shareNew}
        onClose={() => setShareNew(false)}
        width={440}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setShareNew(false)}>取消</button>
            <button className="btn btn-primary btn-sm" onClick={() => { setShareNew(false); toast('已生成分享链接'); }}>生成链接</button>
          </>
        }
      >
        {/* 15a:标记本弹窗内容,让其外层 .modal-card overflow 可见,避免有效期下拉被裁切 */}
        <div className="modal-overflow-mark" />
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 4 }}>
          <div className="lab">同步模式</div>
          <div className="ctl"><Dropdown label="实时同步" options={['实时同步', '独立快照']} style={{ width: 200 }} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">有效期</div>
          <div className="ctl"><Dropdown label="7 天" options={['1 天', '7 天', '30 天', '永久']} style={{ width: 200 }} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">导入次数上限</div>
          <div className="ctl"><TextInput placeholder="如 10" /></div>
        </div>
      </Modal>

      {/* —— 上传知识文件弹窗(4.5) —— */}
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onDone={(names, slice) => {
          // 进入知识库:把上传文件加入列表(解析/向量化中态),音视频自动向量化(4.6)
          setKb((list) => [
            ...names.map((nm) => {
              const k = inferKind(nm);
              return {
                id: ++kbId.current,
                name: nm,
                icon: k.icon,
                type: k.type,
                slice: k.type === '文档' ? slice : '—',
                st: { kind: 'ing', text: '向量化中 5%', prog: 5 },
              } as KbFile;
            }),
            ...list,
          ]);
          setUploadOpen(false);
          toast('已加入知识库 · 开始向量化');
        }}
      />

      {/* —— 通用二次确认 —— */}
      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.title ?? ''}
        desc={confirm?.desc}
        danger={confirm?.danger}
        confirmText={confirm?.confirmText}
        onConfirm={() => confirm?.onOk()}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}

// —— 上传知识文件弹窗(4.5)——
// 切片方式 + 点击/拖拽多文件(图音视混传,不支持文件夹嵌套) + 每文件进度条 + 全部完成后「进入知识库」
interface UpFile { id: number; name: string; icon: string; prog: number }
function UploadModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (names: string[], slice: string) => void }) {
  const slice = '语义'; // 0613：去掉切片方式选择，直接上传，系统默认语义切片
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
      title="上传知识文件"
      open={open}
      onClose={close}
      width={720}
      footer={
        <>
          <button className="btn btn-ghost btn-sm" onClick={close}>取消</button>
          {/* 4.5:全部完成后「进入知识库」可点 */}
          <button className={'btn btn-primary btn-sm' + (allDone ? '' : ' off')} disabled={!allDone} onClick={() => { if (allDone) { onDone(files.map((f) => f.name), slice); reset(); } }}>
            进入知识库
          </button>
        </>
      }
    >
      {/* 0613：去掉「切片方式」选择，直接上传（系统默认语义切片） */}
      {/* 点击选择 + 拖拽上传;input 不用 webkitdirectory(不支持文件夹嵌套) */}
      <input ref={inputRef} type="file" multiple accept="*/*" style={{ display: 'none' }} onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
      {/* 0614：弹窗改左右布局——左=上传按钮 + 单文件格式 / 大小 / 时长限制；右=批量上传进度与文件列表 */}
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
            <div className="up-drop-s">支持文档 / 图片 / 音频 / 视频多文件混传，<br />支持批量上传，不支持文件夹</div>
          </div>
          <div className="up-spec">
            <div className="up-spec-h">单个文件上限（非单次合计）</div>
            <div className="up-spec-row"><span className="k">文档</span><span className="v">PDF、DOC/DOCX、TXT、MD</span><span className="z">≤ 100MB</span></div>
            <div className="up-spec-row"><span className="k">图片</span><span className="v">JPG/JPEG、PNG</span><span className="z">≤ 20MB</span></div>
            <div className="up-spec-row"><span className="k">音频</span><span className="v">MP3、WAV</span><span className="z">≤ 300MB · 120 分钟</span></div>
            <div className="up-spec-row"><span className="k">视频</span><span className="v">MP4、MOV</span><span className="z">≤ 1GB · 60 分钟</span></div>
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
