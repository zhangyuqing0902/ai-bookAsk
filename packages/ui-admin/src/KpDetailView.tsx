import { useState, useRef, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { canDeleteKp, KP_SOURCE_LABEL } from '@aba/mock';
import { Search, TextInput } from './Fields';
import { Dropdown } from './Dropdown';
import { DataGrid, type Col } from './DataGrid';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';
import { pickFile, ACCEPT } from './Upload';
import { UploadModal, inferKind, fileIcon } from './UploadModal';

const TABS = [
  { id: 'base', label: '基础信息' },
  { id: 'kb', label: '知识库' },
  { id: 'price', label: '定价与权益' },
  { id: 'qr', label: '二维码' },
  { id: 'share', label: '分享' },
] as const;
type TabId = (typeof TABS)[number]['id'];

// 0806：ICON_KIND / fileIcon / inferKind 抽至 ./UploadModal.tsx 共享（机构详情 · 协议文档复用），此处 import。

interface KbFile {
  id: number;
  name: string;
  icon: string;
  type: string;
  slice: string;
  // 4.7:已向量化成功(ok)的文件带上架/下架状态(shelf);上架=可被检索
  shelf?: boolean;
  // 权益改造:图/音/视可设永享价(数字=永享内容;null/undefined=非永享);文档(word/pdf)恒无永享
  price?: number | null;
  st: { kind: string; text: string; prog?: number; reason?: string };
}
const KB0: KbFile[] = [
  { id: 1, name: 'ch3-饮食管理.pdf', icon: 'i-file', type: '文档', slice: '语义', shelf: true, st: { kind: 'ok', text: '已向量化' } },
  { id: 2, name: 'ch5-药物治疗.pdf', icon: 'i-file', type: '文档', slice: '章节', st: { kind: 'ing', text: '向量化中 60%', prog: 60 } },
  { id: 3, name: '诊疗指南.docx', icon: 'i-doc', type: '文档', slice: '字数', shelf: false, st: { kind: 'ok', text: '已向量化' } },
  { id: 4, name: '心电图示例.png', icon: 'i-image', type: '图片', slice: '—', shelf: true, price: 9.9, st: { kind: 'ok', text: '已向量化' } },
  // 4.6:音视频提取字幕后自动向量化(直接 ok),不再有「待确认字幕」步骤
  { id: 5, name: '专题讲座.mp3', icon: 'i-sound', type: '音频', slice: '—', shelf: true, price: null, st: { kind: 'ok', text: '已向量化' } },
  { id: 6, name: '手术演示.mp4', icon: 'i-play', type: '视频', slice: '—', price: 29.9, st: { kind: 'fail', text: '向量化失败', reason: '文件解析失败：视频时长超过 60 分钟上限,请压缩或分段后重传' } },
];
const TYPE_ORDER: Record<string, number> = { 文档: 0, 图片: 1, 音频: 2, 视频: 3 };
const ST_ORDER: Record<string, number> = { ing: 2, ok: 3, fail: 4 };
// 权益改造:原独立「永享」Tab 取消,永享并入知识库列表按文件管理(KbFile.price)
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
      phone: bound ? `13${(i % 9) + 1}0013${String(1000 + i).slice(-4)}` : '—',
      rescans: bound ? (i * 13) % 40 : 0,
    };
  });
interface Share { link: string; mode: string; ttl: string; ttlOrder: number; used: string; status: string; statusCls: string; canCancel: boolean }
const SHARES: Share[] = [
  { link: '..abc/8821', mode: '实时同步', ttl: '还剩 2 天', ttlOrder: 2, used: '1 / 1', status: '已作废', statusCls: 'tag-line', canCancel: false },
  { link: '..xyz/4490', mode: '独立快照', ttl: '还剩 5 天', ttlOrder: 5, used: '3 / 10', status: '生效中', statusCls: 'tag-jade', canCancel: true },
];

type Confirm = { title: string; desc: ReactNode; danger?: boolean; confirmText?: string; onOk: () => void };

// 0716 #1.1：头部状态标签配色（kpStatus → 标签文案 / 样式）。归档已并入删除，三态 + 已删除（软删）。
// 0717 #2.4：两后台状态命名统一为「草稿 / 已发布 / 已下架」（原「未发/未发布」统一改「草稿」）。
const KP_STATUS_TAG: Record<'draft' | 'published' | 'unlisted' | 'deleted', { label: string; cls: string }> = {
  draft: { label: '草稿', cls: 'tag-line' },
  published: { label: '已发布', cls: 'tag-jade' },
  unlisted: { label: '已下架', cls: 'tag-amber' },
  deleted: { label: '已删除', cls: 'tag-terra' },
};

// KP 详情（6 Tab）——机构后台 + 平台后台全域 KP 共用，0614b 抽公共组件。
// listBase 适配两端「删除后返回列表」的路由（机构 /kps、平台 /global-kps）。
// orgPrefix / domainSuffix 由各端 wrapper 注入（不在共享组件里硬编码机构 slug）：
//   前台访问地址采用真实二级机构域名形态 https://{前缀}{后缀}/kp/{KP编号}，与域名功能其它位置一致；
//   domainSuffix 由 wrapper 用 @aba/mock 的 tenantDomainSuffix(hostname) 按当前环境算好传入（本地 -aba.localhost）。
// 0716 #1.1：kpStatus / onKpStatusChange / purchasedUsers 为可选——机构端接 kpLifecycle store 走真状态
//   （下架↔重新发布、删除后置灰返回列表）；未传时保持旧行为（纯 toast），平台端未接线不受影响。
export function KpDetailView({ listBase = '/kps', orgPrefix = 'xx-press', domainSuffix = '-aba.一级域名.cn', importMode = 'own', consumerReadonly = true, shareOrgName = 'YY 教育', kpName = '心血管分册 · 第4版', kpStatus, onKpStatusChange, purchasedUsers, bookUsers, kpRelations, readonlyBanner, storageBlocked }: {
  listBase?: string;
  orgPrefix?: string;
  domainSuffix?: string;
  importMode?: 'own' | 'realtime' | 'snapshot';
  /** 0806：外部只读原因（父机构查看子机构 KP）——传入即启用与实时分享一致的整页只读机制，横幅显示该文案 */
  readonlyBanner?: string;
  /** 0718 #7：平台超管查看「分享导入·实时」的 KP 时传 false——不套用接收方只读（banner/禁编辑/隐藏 Tab），保留发布/下架/删除等监管操作，仅展示来源标签 */
  consumerReadonly?: boolean;
  /** 0716 二批 #5.1：实时同步导入时的来源（分享）机构名，banner 动态展示 */
  shareOrgName?: string;
  /** 0717 #2.3：KP 名称由列表数据传入,保证列表与详情一致 */
  kpName?: string;
  kpStatus?: 'draft' | 'published' | 'unlisted' | 'deleted';
  onKpStatusChange?: (next: 'published' | 'unlisted' | 'deleted') => void;
  purchasedUsers?: number; // 删除确认提示影响 N 位已购永享用户
  bookUsers?: number; // 删除影响的纸书扫码解锁用户数（与永享差异化处理）
  // 0717 #1.5：KP 的业务关系计数——只影响删除弹窗是否展示影响声明（删除一律逻辑删除）。
  // 默认按有关系处理（{orders:1}），平台端未接线不受影响。
  kpRelations?: { orders?: number; grants?: number; shares?: number; imports?: number };
  // 0813-2：存储额度已满 / 降档后存量超额时传入原因文案——冻结「上传知识文件」，保证超额量只减不增。
  //   既有文件、向量与 C 端问答完全不受影响，这里只挡新增。传 undefined 即不冻结。
  storageBlocked?: string;
}) {
  const nav = useNavigate();
  // 未传 kpStatus（平台端等未接线场景）按已发布渲染，交互与旧版一致。
  // 0716 #1.1：兼容旧持久化 'archived'→'deleted'，并对未知值回落 published，避免详情页崩溃空白。
  const rawStatus = (kpStatus as string | undefined) ?? 'published';
  const lifecycle: 'draft' | 'published' | 'unlisted' | 'deleted' =
    rawStatus === 'archived' ? 'deleted'
    : rawStatus === 'draft' || rawStatus === 'published' || rawStatus === 'unlisted' || rawStatus === 'deleted'
      ? rawStatus
      : 'published';
  const statusTag = KP_STATUS_TAG[lifecycle] ?? KP_STATUS_TAG.published;
  // 0717 #1.5：删除一律为逻辑删除（软删）;relations 仅决定弹窗是否展示对 C 端用户的影响声明
  const deleteVerdict = canDeleteKp(kpRelations ?? { orders: 1 });
  // 复制该 KP 的 C 端前台访问地址：随当前环境自动生成、随机构域名前缀变化
  const frontUrl = `https://${orgPrefix}${domainSuffix}/kp/${KP_CODE}`;
  // 分享权限（对齐 @aba/mock sharePolicy）：实时同步导入的 KP 内容随源机构更新、只读，
  // 二维码 / 分享两 Tab 不可见，下架 / 删除等源机构侧操作也隐藏；独立快照与自建 KP 全功能。
  // 0718 #7：consumerReadonly=false（平台超管）时仅展示来源标签，不套用接收方只读。
  const isRealtime = (importMode === 'realtime' && consumerReadonly) || !!readonlyBanner;
  const visibleTabs = isRealtime ? TABS.filter((t) => t.id !== 'qr' && t.id !== 'share') : TABS;
  // 0716 二批 #5.3：实时同步只读＝操作级——数据可读可查，仅操作按钮置灰、点击提示无权限
  const deny = () => toast('无权限操作');
  const copyFront = () => {
    navigator.clipboard?.writeText(frontUrl);
    toast('已复制前台访问地址');
  };
  const [tab, setTab] = useState<TabId>('base');
  const [price, setPrice] = useState(0);
  // 0717 #5：基础权益切换点击即生效 → 增加二次确认,确认后才生效并 toast
  const switchTier = (next: 0 | 1) => {
    if (price === next) return;
    const nm = next === 0 ? '免费' : '会员';
    setConfirm({
      title: '切换基础权益',
      desc: (
        <>
          确认将本 KP 基础权益由「{price === 0 ? '免费' : '会员'}」切换为「{nm}」？确认后<b>立即生效</b>：
          {next === 1
            ? '仅会员可查看图 / 音 / 视媒体资源，文字内容不受会员身份限制；「永享」内容仍单独计价。'
            : '平台所有用户均可查看全部非永享内容；「永享」内容仍单独计价。'}
        </>
      ),
      confirmText: '确认切换',
      onOk: () => { setPrice(next); toast(`基础权益已切换为「${nm}」· 立即生效`); },
    });
  };
  const [cover, setCover] = useState(true);
  const [crop, setCrop] = useState(false);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });

  const [kbQ, setKbQ] = useState('');
  const [kbFmt, setKbFmt] = useState('全部');
  const [kbYx, setKbYx] = useState('全部'); // 一-4:永享状态筛选
  const [kbTier, setKbTier] = useState('全部'); // 一-5:基础权益(免费/会员)筛选
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
  const [qrQ, setQrQ] = useState('');
  const [qrMode, setQrMode] = useState('全部');
  const [shareMode, setShareMode] = useState('全部');
  const [shareStatus, setShareStatus] = useState('全部');

  // 弹窗状态
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  // 权益改造:永享设价/预览改为对知识库文件(KbFile)操作;priceInput 受控真正写入永享价
  const [priceModal, setPriceModal] = useState<KbFile | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [previewYx, setPreviewYx] = useState<KbFile | null>(null);
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
  // 权益改造:仅图/音/视有永享(预览 + 设/编永享价);文档(word/pdf)无
  const isMedia = (f: KbFile) => f.type !== '文档';
  // 一-5:基础权益(联动定价 price:0免费/1会员)——word/pdf 恒免费;图音视跟 KP 基础权益
  const baseTier = (f: KbFile) => (isMedia(f) && price === 1 ? '会员' : '免费');
  // 一-7:综合权益(永享优先)——图音视设永享价=永享;否则按基础权益。权益筛选用此,避免永享被「会员」筛选搜出
  const fileTier = (f: KbFile) => (isMedia(f) && f.price != null ? '永享' : baseTier(f));
  const openPrice = (f: KbFile) => { setPriceModal(f); setPriceInput(f.price != null ? String(f.price) : ''); };
  const renderOp = (f: KbFile) => {
    // 0716 二批 #5.3：实时同步——操作列全部置灰、点击提示无权限（列表数据本身正常可读）
    if (isRealtime) {
      const denied = (label: string, danger = false) => (
        <span key={label} className={'op off' + (danger ? ' op-danger' : '')} onClick={() => toast('无权限操作')}>{label}</span>
      );
      return (
        <div className="op-cell">
          {denied('下载')}
          {f.st.kind === 'ok' && denied(f.shelf ? '下架' : '上架')}
          {f.st.kind === 'fail' && denied('重试')}
          {isMedia(f) && denied(f.price != null ? '编辑永享价' : '设置永享价')}
          {denied('删除', true)}
        </div>
      );
    }
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
    // 权益改造:图/音/视额外提供 预览 + 设置/编辑永享价(文档无此两项)
    // 一-2:预览移到列表缩略图列,操作列只保留设价
    const mediaOps = isMedia(f) ? (
      <span className="op" onClick={() => openPrice(f)}>{f.price != null ? '编辑永享价' : '设置永享价'}</span>
    ) : null;
    // 4.7:重试只对「向量化失败(fail)」显示;ok 不显示重试,改为上架/下架
    if (f.st.kind === 'ok')
      return (
        <div className="op-cell">
          {dl}
          <span className="op" onClick={() => { toggleShelf(f); toast(f.shelf ? '已下架,该内容停止被检索' : '已上架,该内容可被检索'); }}>
            {f.shelf ? '下架' : '上架'}
          </span>
          {mediaOps}
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
          {mediaOps}
          <span className="op op-danger" onClick={del}>删除</span>
        </div>
      );
    // ing:处理中,可下载与删除
    return (
      <div className="op-cell">
        {dl}
        {mediaOps}
        <span className="op op-danger" onClick={del}>删除</span>
      </div>
    );
  };

  const kbRows = kb.filter(
    (f) =>
      (!kbQ || f.name.includes(kbQ)) &&
      (kbFmt === '全部' || f.type === kbFmt) &&
      // 一-4:永享状态筛选(图音视设价=永享,其余=非永享)
      (kbYx === '全部' || (kbYx === '永享') === (isMedia(f) && f.price != null)) &&
      // 一-5:基础权益筛选(免费/会员)
      (kbTier === '全部' || fileTier(f) === kbTier),
  );
  const kbCols: Col<KbFile>[] = [
    { header: '文件名', className: 'strong', cell: (f) => (<>{fileIcon(f.icon)} {f.name}</>) },
    { header: '类型', cell: (f) => f.type, sortValue: (f) => TYPE_ORDER[f.type] ?? 9 },
    // 一-2:预览列——图音视显缩略图、点击直接预览(同原永享列);文档显「—」
    { header: '预览', cell: (f) => (isMedia(f)
      ? <span className="yx-thumb" onClick={() => setPreviewYx(f)}><Icon id={f.icon === 'i-image' ? 'i-image' : 'i-play'} w={15} h={15} /></span>
      : <span className="muted">—</span>) },
    // 一-5:权益列——综合显示 免费/会员/永享(联动定价 price);设了永享价显「永享 ¥X」
    { header: '权益', cell: (f) => {
      if (isMedia(f) && f.price != null) return <span className="tag-s" style={{ color: 'var(--terra)', borderColor: 'var(--terra)' }}>永享 ¥{f.price}</span>;
      return baseTier(f) === '会员'
        ? <span className="tag-s tag-amber">会员</span>
        : <span className="tag-s tag-line">免费</span>;
    }, sortValue: (f) => (isMedia(f) && f.price != null ? 2 : baseTier(f) === '会员' ? 1 : 0) },
    { header: '处理状态', cell: renderSt, sortValue: (f) => ST_ORDER[f.st.kind] ?? 9 },
    // 0610:已向量化成功的文件展示上架/下架;向量化失败直接显示「下架」(不可检索);处理中显示「-」
    { header: '检索状态', cell: (f) => {
      if (f.st.kind === 'ok') return <span className={'tag-s ' + (f.shelf ? 'tag-jade' : 'tag-line')}>{f.shelf ? '上架' : '下架'}</span>;
      if (f.st.kind === 'fail') return <span className="tag-s tag-line">下架</span>;
      return <span className="muted">-</span>;
    }, sortValue: (f) => (f.st.kind === 'ok' ? (f.shelf ? 0 : 1) : f.st.kind === 'fail' ? 1 : 2) },
    { header: '操作', cell: renderOp },
  ];

  // —— 永享已并入知识库列表(KbFile.price)按文件管理,原独立 yxCols/yxRows 移除 ——

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
          desc: <>取消后该分享链接「{s.link}」立即失效：未导入者不可再导入；已实时导入者立即失去授权，已导入的独立快照不受影响。</>,
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
        <span className="kpd-name">{kpName}</span>
        {/* 0718 #7：来源标签三态统一（自建 / 分享导入·实时 / 分享导入·快照），两后台一致、统一灰色；
            旧「自建靛蓝 / 共享灰」二分法废弃（0717 二批 #2 口径被本条取代） */}
        <span className="tag-s tag-line">{KP_SOURCE_LABEL[importMode]}</span>
        {/* 6.15:状态紧跟来源标签直接显示,不要「当前状态」文案；0714 #18 随 kpStatus 渲染 */}
        <span className={'tag-s ' + statusTag.cls}>{statusTag.label}</span>
        {/* 0717 二批 #4：实时同步导入的详情头不再挂只读附加标(顶部 banner 已说明),仅隐藏状态操作按钮 */}
        {!isRealtime && (
          <span className="kpd-status">
            {/* 0717 #2.1/#2.2：草稿→「发布」；已发布→「下架」；已下架→「重新发布」；已删除不再提供状态操作 */}
            {lifecycle === 'draft' && (
              <button className="btn btn-primary btn-sm" onClick={() => setConfirm({
                title: '发布知识 KP',
                desc: '发布后前台立即可见：支持检索、购买、扫码与链接访问。发布需至少一份已向量化完成的知识内容。',
                confirmText: '确认发布',
                onOk: () => { onKpStatusChange?.('published'); toast('已发布'); },
              })}>发布</button>
            )}
            {lifecycle === 'published' && (
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirm({
                title: '下架知识 KP',
                // 0717 #1.8：向运营明示下架对前台的影响——所有入口一律显「已下架」并拦截,权益保留、可逆
                desc: (
                  <>
                    <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: 13, lineHeight: 1.9, color: 'var(--ink-2)' }}>
                      <li>下架后停止检索、新购买、新扫码与链接访问</li>
                      <li>用户端<b>「我的纸书」「我的永享」</b>将显示<b>「已下架」</b>，点击提示联系客服，<b>暂不可进入会话 / 预览</b></li>
                      <li>已购权益<b>不会清除</b>，重新发布后自动恢复访问</li>
                    </ul>
                    <div style={{ background: 'rgba(240,165,0,.10)', borderLeft: '3px solid var(--amber)', borderRadius: 8, padding: '9px 12px', fontSize: 12.5, lineHeight: 1.7, color: 'var(--ink-2)' }}>
                      下架适用于「临时禁止用户访问、处理完问题再上架」的运营场景，可随时重新发布。
                    </div>
                  </>
                ),
                confirmText: '确认下架',
                onOk: () => { onKpStatusChange?.('unlisted'); toast('已下架'); },
              })}>下架</button>
            )}
            {lifecycle === 'unlisted' && (
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirm({
                title: '重新发布知识 KP',
                desc: '重新发布后恢复检索、购买、扫码与链接访问，前台立即可见。',
                confirmText: '确认发布',
                onOk: () => { onKpStatusChange?.('published'); toast('已重新发布'); },
              })}>重新发布</button>
            )}
            {/* 0717 #1.5：删除一律为逻辑删除（软删）——删除后三端界面均不再展示、数据库保留全部数据；
                有业务关系时弹窗额外展示对 C 端的影响声明（前台统一标「已失效」）。 */}
            {lifecycle !== 'deleted' && (!deleteVerdict.hasRelations ? (
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--terra)', borderColor: 'var(--terra-soft)' }} onClick={() => setConfirm({
                title: '删除知识 KP',
                desc: <>确认删除该 KP？本 KP 无任何订单 / 权益 / 分享关系。删除后三端界面均不再展示（逻辑删除，数据库保留数据），前台访问统一提示「已失效」。</>,
                danger: true,
                confirmText: '确认删除',
                onOk: () => { onKpStatusChange?.('deleted'); toast('已删除'); nav(listBase); },
              })}>删除</button>
            ) : (
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--terra)', borderColor: 'var(--terra-soft)' }} onClick={() => setConfirm({
                title: '删除知识 KP',
                desc: (
                  <>
                    {/* 删除影响声明——结构化无序列表(与「权益模型说明」同款范式) */}
                    <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: 13, lineHeight: 1.9, color: 'var(--ink-2)' }}>
                      <li>该 KP 已存在<b>订单 / 永享 / 纸书 / 分享 / 导入</b>关系</li>
                      <li>删除为<b>逻辑删除</b>：三端界面均不再展示，<b>数据库保留全部数据</b>与 C 端历史凭证</li>
                      <li>界面无恢复入口，请确认已知悉对下列用户的影响</li>
                    </ul>
                    {/* 警示引用块:淡红底 + 左珊瑚边,统计两类受影响用户；前台各入口统一标「已失效」 */}
                    <div style={{ background: 'rgba(229,83,59,.08)', borderLeft: '3px solid var(--terra)', borderRadius: 8, padding: '9px 12px', fontSize: 12.5, lineHeight: 1.7, color: 'var(--terra)' }}>
                      <b>本 KP 有 {purchasedUsers ?? 'N'} 位已购永享用户、{bookUsers ?? 'N'} 位纸书扫码解锁用户</b>：删除后<b>「我的永享」「我的纸书」</b>条目统一标记<b>「已失效」</b>、内容不可访问，点击提示联系客服；<b>新会话 / 扫码进入</b>提示「已失效」并引导至本机构其他 KP；<b>历史 AI 会话</b>中引用本 KP 的内容同标「已失效」，订单记录仍保留可查。
                    </div>
                  </>
                ),
                danger: true,
                confirmText: '确认删除',
                onOk: () => { onKpStatusChange?.('deleted'); toast('已删除'); nav(listBase); },
              })}>删除</button>
            ))}
          </span>
        )}
      </div>

      {/* 0716 二批 #5.1/#5.2：实时同步只读说明——单行呈现，来源机构名为动态变量 */}
      {isRealtime && (
        <div className="kp-readonly-banner">
          <Icon id="i-lock" w={14} h={14} />
          <span>{readonlyBanner ?? `本 KP 由「${shareOrgName}」以「实时同步」分享导入：内容随源机构自动更新、仅可查看不可编辑；占本机构 KP 数、不占存储、问答消耗本机构 Token；二维码与分享不可用。`}</span>
        </div>
      )}

      <div className="kpd-tabs">
        {visibleTabs.map((t) => (
          <div key={t.id} className={'kpd-tab' + (tab === t.id ? ' on' : '')} onClick={() => setTab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>

      {tab === 'base' && (
        <div style={{ display: 'flex', gap: 26 }}>
          <div>
            {/* 0716 二批 #5.3：实时同步——数据可读，仅操作按钮置灰、点击提示无权限 */}
            <div className="cover-up">
              {cover ? (
                <>
                  <div className="cover9">
                    <div className="ct">{kpName}</div>
                  </div>
                  <div className={'ops' + (isRealtime ? ' ops-deny' : '')}>
                    <span onClick={isRealtime ? deny : () => pickFile(ACCEPT.cover, () => setCrop(true))}>重新上传</span>
                    <span onClick={isRealtime ? deny : () => setConfirm({
                      title: '删除封面',
                      desc: '删除后该 KP 将显示默认封面，可随时重新上传。',
                      danger: true,
                      confirmText: '确认删除',
                      onOk: () => { setCover(false); toast('已删除封面'); },
                    })}>删除</span>
                  </div>
                </>
              ) : (
                <div className="empty" onClick={isRealtime ? deny : () => pickFile(ACCEPT.cover, () => setCrop(true))}>
                  <Icon id="i-up" w={22} h={22} />
                  上传封面
                  <span style={{ fontSize: 11 }}>建议 9:16</span>
                </div>
              )}
            </div>
          </div>
          <div className="fm-card" style={{ flex: 1, margin: 0 }}>
            {/* 0717 #4：实时同步(消费者视角)——表单全部禁用置灰(无光标、hover 显 not-allowed)、单选/下拉不可操作,仅「复制链接」可用 */}
            <div className="fm-row">
              <div className="lab">KP 名称<span className="req">*</span></div>
              <div className="ctl"><TextInput defaultValue={kpName} disabled={isRealtime} /></div>
            </div>
            <div className="fm-row">
              <div className="lab">简介</div>
              <div className="ctl"><TextInput placeholder="心血管疾病诊疗知识库,覆盖诊断、用药、术后管理…" disabled={isRealtime} /></div>
            </div>
            <div className="fm-row">
              <div className="lab">纸书购买链接</div>
              {/* 6.2:说明文案放进输入框做 placeholder 提示 */}
              <div className="ctl"><TextInput placeholder="填写后,用户查看内容溯源时可跳转该链接" disabled={isRealtime} /></div>
            </div>
            <div className="fm-row">
              {/* 0613-2:关联 Agent 为必填（KP 必须挂载一个 Agent 才能对外提问） */}
              <div className="lab">关联 Agent<span className="req">*</span></div>
              {/* 0610:下拉宽度收敛为与表单其他选择控件一致(200px),不再填满整行 */}
              <div className="ctl"><Dropdown label="李医生" options={['李医生', '王老师', '机构 Agent']} style={{ width: 200 }} disabled={isRealtime} /></div>
            </div>
            {/* 前台访问地址:只读 + 复制,链接随当前环境自动生成(本地端口 / 线上域名),携带机构 + KP */}
            <div className="fm-row">
              <div className="lab" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                前台访问地址
                {/* 5.3:说明移到问号 hover 面板(无序两行不换行);删字段下方长文案 */}
                <span className="kp-tip">
                  <span className="info-dot">?</span>
                  <span className="kp-tip-pop">
                    <ul>
                      <li>C 端用户访问本机构该 KP 的前台地址</li>
                      <li>随当前环境（本地 / 线上）自动生成</li>
                    </ul>
                  </span>
                </span>
              </div>
              <div className="ctl">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    className="mono"
                    title={frontUrl}
                    style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: 'var(--paper)', border: '1px solid var(--line-2)', borderRadius: 8, padding: '7px 10px', color: 'var(--ink-2)' }}
                  >
                    {frontUrl}
                  </span>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 'none' }} onClick={copyFront}>
                    <Icon id="i-copy" w={14} h={14} />
                    复制链接
                  </button>
                </div>
              </div>
            </div>
            {/* 4.3:基础信息表单底部保存按钮；实时同步置灰+无权限提示 */}
            <div className="fm-row" style={{ justifyContent: 'flex-end' }}>
              <button className={'btn btn-primary btn-sm' + (isRealtime ? ' off' : '')} onClick={isRealtime ? deny : () => toast('已保存')}>保存</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'kb' && (
        <>
          <div className="filter">
            <Search placeholder="搜索文件名" minWidth={200} value={kbQ} onChange={setKbQ} />
            <Dropdown label="全部" options={['全部', '文档', '图片', '音频', '视频']} onSelect={setKbFmt} />
            {/* 一-5:权益状态筛选(免费/会员) */}
            <Dropdown label="权益" options={['全部', '免费', '会员']} onSelect={setKbTier} />
            {/* 一-4:永享状态筛选 */}
            <Dropdown label="永享" options={['全部', '永享', '非永享']} onSelect={setKbYx} />
            <div className="grow" />
            {/* 6.5:文案 */}
            <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>上传即向量化，发布知识 KP 需至少一份已向量化完成的知识内容</span>
            {/* 4.5:打开上传知识文件弹窗；0716 二批 #5.3 实时同步置灰但可点击提示无权限
                0813-2：存储超额时同样置灰——冻结增量保证超额量只减不增，既有文件与 C 端问答不受影响 */}
            <button
              className={'btn btn-primary btn-sm' + (isRealtime || storageBlocked ? ' off' : '')}
              title={storageBlocked}
              onClick={isRealtime ? deny : storageBlocked ? () => toast(storageBlocked) : () => setUploadOpen(true)}
            >
              <Icon id="i-up" w={14} h={14} />
              上传知识文件
            </button>
          </div>
          {/* 0716 二批 #5.3：列表数据正常可读可查，仅操作列按钮在 renderOp 内按 isRealtime 置灰 */}
          <DataGrid columns={kbCols} rows={kbRows} empty={{ title: '没有匹配的文件' }} />
        </>
      )}

      {tab === 'price' && (
        <div className="fm-card">
          {/* 0716 二批 #5.3：实时同步——权益数据正常可读；0717 #4 单选整体置灰(not-allowed) */}
          <div className="fh">基础权益标签 <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: 13 }}>免费 / 会员 二选一互斥</span></div>
          <div className="radio-list" style={{ padding: '6px 0 16px' }}>
            {/* 0717 #5：切换点击即生效 → 先弹二次确认,避免误操作 */}
            <div className={'radio-opt' + (price === 0 ? ' on' : '') + (isRealtime ? ' off' : '')} onClick={isRealtime ? deny : () => switchTier(0)}>
              <div className="rd" />
              <div><div className="rt">免费</div><div className="rs">平台上所有用户（无论免费或会员）均可查看此知识 KP 的全部非永享内容，包括文字、图片、音频、视频；仅「永享」标记内容需单独购买。</div></div>
            </div>
            <div className={'radio-opt' + (price === 1 ? ' on' : '') + (isRealtime ? ' off' : '')} onClick={isRealtime ? deny : () => switchTier(1)}>
              <div className="rd" />
              {/* 6.10/0614:文案详化，消除歧义 */}
              <div><div className="rt">会员</div><div className="rs">仅会员可查看此知识 KP 的图 / 音 / 视媒体资源；文字内容不受会员身份限制（免费 / 会员均可浏览）；「永享」标记内容仍需单独计价购买。</div></div>
            </div>
          </div>
          {/* 一-6:权益模型说明块(淡紫底,无序不换行)——避免运营/产品过段时间遗忘 */}
          <div style={{ background: 'rgba(139,108,246,.10)', border: '1px solid rgba(139,108,246,.22)', borderRadius: 10, padding: '11px 14px' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 7 }}>权益模型说明（免费 / 会员 / 永享）</div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, lineHeight: 1.95, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>
              <li><b>免费</b>：所有用户可查看该 KP 全部非永享内容（文字 / 图片 / 音频 / 视频）</li>
              <li><b>会员</b>：仅会员可看图 / 音 / 视媒体，文字内容不受会员身份限制</li>
              <li><b>永享</b>：图 / 音 / 视可单独标价买断，无论 KP 免费还是会员都需单独付费</li>
              <li>即使 KP 设为会员，其中标了永享价的图 / 音 / 视也<b>必须永享付费才能看</b>，会员身份不例外</li>
              <li>免费/会员 与 永享 是<b>两套相互独立</b>的权益模型，互不覆盖、各自计费</li>
              {/* 0717 终版：永享购后处理规则常驻（下架拦截可恢复 / 删除为逻辑删除） */}
              <li><b>永享为一次性买断</b>：调价不影响已购用户（仅新购按新价，不补差不重复扣费）；转非永享 / 停售后已购权益保留</li>
              <li><b>下架 KP</b>：已购永享标「已下架」暂不可访问（权益保留，重新上架自动恢复）；<b>删除 KP（逻辑删除）</b>：标「已失效」，数据库保留购买与权益数据</li>
            </ul>
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

      {/* —— 设置/编辑永享价弹窗(权益改造:对知识库图音视文件,真正写入 KbFile.price) —— */}
      <Modal
        title={priceModal?.price != null ? '编辑永享价' : '设置永享价'}
        open={priceModal !== null}
        onClose={() => setPriceModal(null)}
        width={420}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setPriceModal(null)}>取消</button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                if (!priceModal) return;
                const v = priceInput.trim();
                const num = v === '' ? null : Number(v);
                if (v !== '' && (!isFinite(num as number) || (num as number) <= 0)) { toast('请输入正确的永享价'); return; }
                setKb((list) => list.map((x) => (x.id === priceModal.id ? { ...x, price: num } : x)));
                setPriceModal(null);
                toast(num == null ? '已清空永享价 · 恢复为非永享' : '永享价已保存,立即生效');
              }}
            >
              保存
            </button>
          </>
        }
      >
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 4 }}>
          <div className="lab">内容</div>
          <div className="ctl">{priceModal && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{fileIcon(priceModal.icon)}{priceModal.name}</span>}</div>
        </div>
        <div className="fm-row">
          <div className="lab">永享价（元）<span className="req">*</span></div>
          <div className="ctl"><TextInput value={priceInput} onChange={(e) => setPriceInput(e.target.value)} placeholder="如 9.9" /></div>
        </div>
        {/* 一-3:说明块移到「永享价」下方,无序 4 条,淡紫底 */}
        <div style={{ background: 'rgba(139,108,246,.10)', border: '1px solid rgba(139,108,246,.22)', borderRadius: 10, padding: '10px 14px', marginTop: 14 }}>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, lineHeight: 1.9, color: 'var(--ink-2)' }}>
            <li>永享内容需单独付费，无论该 KP 是免费还是会员</li>
            <li>免费用户无需先开通会员即可直接购买</li>
            <li>免费/会员 与 永享 是两套相互独立的权益模型</li>
            <li>留空保存即清除永享价，恢复为非永享，修改后立即生效</li>
          </ul>
        </div>
      </Modal>

      {/* —— 内容预览弹窗(权益改造:知识库图音视点「预览」) —— */}
      <Modal title="内容预览" open={previewYx !== null} onClose={() => setPreviewYx(null)} width={460}>
        <div className="yx-preview">
          <div className="yx-preview-stage">
            <Icon id={previewYx?.icon === 'i-image' ? 'i-image' : 'i-play'} w={40} h={40} style={{ color: 'var(--ink-3)' }} />
          </div>
          <div className="yx-preview-name">{previewYx?.name}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{previewYx?.type} · 仅查看</div>
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
        <div className="sub-tip">实时同步：占接收方 KP、不占存储，接收方消耗 Token，内容只读且隐藏二维码/分享；撤销或源 KP 下架后立即失权。独立快照：占接收方 KP/存储，可编辑五个页签并生成自有二维码/分享；源侧撤销不影响已导入快照。发起机构不能导入自己的分享。</div>
      </Modal>

      {/* —— 上传知识文件弹窗(4.5) —— */}
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onDone={(names) => {
          const slice = '语义'; // 0613：切片方式固定语义（原弹窗参数，抽共享组件后在调用方写死）
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
