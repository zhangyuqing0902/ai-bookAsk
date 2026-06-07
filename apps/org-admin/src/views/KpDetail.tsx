import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, DataGrid, TextInput, Modal, pickFile, ACCEPT, type Col } from '@aba/ui-admin';

const TABS = [
  { id: 'base', label: '基础信息' },
  { id: 'kb', label: '知识库' },
  { id: 'yx', label: '永享' },
  { id: 'price', label: '定价与权益' },
  { id: 'qr', label: '二维码' },
  { id: 'share', label: '分享' },
] as const;
type TabId = (typeof TABS)[number]['id'];

interface KbFile {
  name: string;
  icon: string;
  type: string;
  slice: string;
  st: { kind: string; text: string; prog?: number };
}
const KB: KbFile[] = [
  { name: 'ch3-饮食管理.pdf', icon: 'i-file', type: '文档', slice: '语义', st: { kind: 'ok', text: '已向量化' } },
  { name: 'ch5-药物治疗.pdf', icon: 'i-file', type: '文档', slice: '章节', st: { kind: 'ing', text: '向量化中 60%', prog: 60 } },
  { name: '诊疗指南.docx', icon: 'i-doc', type: '文档', slice: '字数', st: { kind: 'ok', text: '已向量化' } },
  { name: '心电图示例.png', icon: 'i-image', type: '图片', slice: '—', st: { kind: 'ok', text: '已向量化' } },
  { name: '专题讲座.mp3', icon: 'i-sound', type: '音频', slice: '—', st: { kind: 'wait', text: '待确认字幕' } },
  { name: '手术演示.mp4', icon: 'i-play', type: '视频', slice: '—', st: { kind: 'fail', text: '向量化失败 ⓘ' } },
];
const TYPE_ORDER: Record<string, number> = { 文档: 0, 图片: 1, 音频: 2, 视频: 3 };
const SLICE_ORDER: Record<string, number> = { 语义: 0, 章节: 1, 字数: 2, '—': 3 };
const ST_ORDER: Record<string, number> = { wait: 1, ing: 2, ok: 3, fail: 4 };

interface Yx { name: string; type: string; preview: string; price: string }
const YX: Yx[] = [
  { name: '心电图示例.png', type: '图片', preview: '[缩略]', price: '¥9.9' },
  { name: '专题讲座.mp3', type: '音频', preview: '▶', price: '未设价' },
  { name: '手术演示.mp4', type: '视频', preview: '▶', price: '¥29.9' },
];
interface Qr { name: string; mode: string; qty: number }
const QR: Qr[] = [
  { name: '心血管首发批次', mode: '首扫绑定,后扫引导', qty: 100 },
  { name: '内部测试码', mode: '无权益', qty: 1 },
];
interface Share { link: string; mode: string; ttl: string; used: string; status: string; statusCls: string; canCancel: boolean }
const SHARES: Share[] = [
  { link: '..abc/8821', mode: '实时同步', ttl: '还剩 2 天', used: '1 / 1', status: '已作废', statusCls: 'tag-line', canCancel: false },
  { link: '..xyz/4490', mode: '独立快照', ttl: '还剩 5 天', used: '3 / 10', status: '生效中', statusCls: 'tag-jade', canCancel: true },
];

// 机构后台 · KP 详情（6 Tab）
export function KpDetail() {
  const nav = useNavigate();
  const [tab, setTab] = useState<TabId>('base');
  const [price, setPrice] = useState(0);
  const [cover, setCover] = useState(true);
  const [crop, setCrop] = useState(false);

  const [kbQ, setKbQ] = useState('');
  const [kbFmt, setKbFmt] = useState('全部');
  const [yxQ, setYxQ] = useState('');
  const [yxFmt, setYxFmt] = useState('全部');
  const [yxPrice, setYxPrice] = useState('全部');
  const [qrQ, setQrQ] = useState('');
  const [qrMode, setQrMode] = useState('全部');

  const renderSt = (f: KbFile) => (
    <>
      <span className={'fstat ' + f.st.kind}>
        <span className="dt" />
        {f.st.text}
      </span>
      {f.st.prog != null && (
        <span className="fbar">
          <i style={{ width: f.st.prog + '%' }} />
        </span>
      )}
    </>
  );
  const renderOp = (f: KbFile) => {
    if (f.st.kind === 'wait')
      return (
        <>
          <span className="op" onClick={() => toast('确认字幕')}>确认</span>
          <span className="op" onClick={() => toast('删除文件(二次确认)')}>删除</span>
        </>
      );
    const retryOff = f.st.kind === 'ing';
    return (
      <>
        <span className={'op' + (retryOff ? ' off' : '')} onClick={() => !retryOff && toast('重试向量化')}>
          重试
        </span>
        <span className="op" onClick={() => toast('删除文件(二次确认)')}>删除</span>
      </>
    );
  };

  const kbRows = KB.filter((f) => (!kbQ || f.name.includes(kbQ)) && (kbFmt === '全部' || f.type === kbFmt));
  const kbCols: Col<KbFile>[] = [
    { header: '文件名', className: 'strong', cell: (f) => (<><Icon id={f.icon} w={15} h={15} style={{ verticalAlign: -3, color: 'var(--ink-3)' }} /> {f.name}</>) },
    { header: '类型', cell: (f) => f.type, sortValue: (f) => TYPE_ORDER[f.type] ?? 9 },
    { header: '切片方式', cell: (f) => f.slice, sortValue: (f) => SLICE_ORDER[f.slice] ?? 9 },
    { header: '处理状态', cell: renderSt, sortValue: (f) => ST_ORDER[f.st.kind] ?? 9 },
    { header: '操作', cell: renderOp },
  ];

  const yxRows = YX.filter(
    (y) => (!yxQ || y.name.includes(yxQ)) && (yxFmt === '全部' || y.type === yxFmt) && (yxPrice === '全部' || (yxPrice === '已设价') === (y.price !== '未设价')),
  );
  const yxCols: Col<Yx>[] = [
    { header: '内容', className: 'strong', cell: (y) => y.name },
    { header: '类型', cell: (y) => y.type },
    { header: '预览', className: 'muted', cell: (y) => y.preview },
    { header: '永享价', cell: (y) => (y.price === '未设价' ? <span className="muted">未设价</span> : <span className="mono">{y.price}</span>) },
    { header: '操作', cell: (y) => <span className="op" onClick={() => toast(y.price === '未设价' ? '设价' : '编辑价')}>{y.price === '未设价' ? '设价' : '编辑价'}</span> },
  ];

  const qrRows = QR.filter((r) => (!qrQ || r.name.includes(qrQ)) && (qrMode === '全部' || r.mode === qrMode));
  const qrCols: Col<Qr>[] = [
    { header: '二维码包名称', className: 'strong', cell: (r) => r.name },
    { header: '权益模式', cell: (r) => r.mode },
    { header: '数量', className: 'mono', cell: (r) => r.qty, sortValue: (r) => r.qty },
    { header: '操作', cell: () => (<><span className="op" onClick={() => toast('查看二维码')}>查看</span><span className="op" onClick={() => toast('下载 zip')}>下载 zip</span></>) },
  ];

  const shareCols: Col<Share>[] = [
    { header: '链接 / 密码', cell: (s) => (<><span className="mono">{s.link}</span> <Icon id="i-copy" w={13} h={13} className="op" style={{ verticalAlign: -2 }} /></>) },
    { header: '模式', cell: (s) => s.mode },
    { header: '时效', cell: (s) => s.ttl },
    { header: '消费 / 上限', className: 'mono', cell: (s) => s.used },
    { header: '状态', cell: (s) => <span className={'tag-s ' + s.statusCls}>{s.status}</span> },
    { header: '操作', cell: (s) => (s.canCancel ? <span className="op" onClick={() => toast('取消分享(二次确认)')}>取消分享</span> : <span className="muted">—</span>) },
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
        <span className="kpd-status">
          当前状态 <span className="tag-s tag-jade">已发布</span>
          <button className="btn btn-ghost btn-sm" onClick={() => toast('下架(二次确认)')}>下架</button>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--terra)', borderColor: 'var(--terra-soft)' }} onClick={() => toast('删除(二次确认)')}>删除</button>
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
                    <span onClick={() => { setCover(false); toast('已删除封面'); }}>删除</span>
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
              <div className="ctl">
                <TextInput placeholder="https://… (非必填)" />
                <div className="hint">填写后,用户查看内容溯源时可跳转该链接</div>
              </div>
            </div>
            <div className="fm-row">
              <div className="lab">关联 Agent</div>
              <div className="ctl"><Dropdown label="李医生" options={['李医生', '王老师', '机构 Agent']} style={{ maxWidth: 240 }} /></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'kb' && (
        <>
          <div className="filter">
            <Search placeholder="搜索文件名" minWidth={220} value={kbQ} onChange={setKbQ} />
            <Dropdown label="格式 · 全部" options={['全部', '文档', '图片', '音频', '视频']} onSelect={setKbFmt} />
            <div className="grow" />
            <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>⌀ 上传即向量化 · 已发布需至少一份已向量化</span>
            <button className="btn btn-primary btn-sm" onClick={() => pickFile(ACCEPT.doc + ',' + ACCEPT.image + ',' + ACCEPT.audio + ',' + ACCEPT.video, (n) => toast('已选择 ' + n + ',开始处理'))}>
              <Icon id="i-up" w={14} h={14} />
              上传文件
            </button>
          </div>
          <DataGrid columns={kbCols} rows={kbRows} empty={{ title: '没有匹配的文件' }} />
        </>
      )}

      {tab === 'yx' && (
        <>
          <div className="filter">
            <Search placeholder="搜索内容名称" minWidth={220} value={yxQ} onChange={setYxQ} />
            <Dropdown label="格式" options={['全部', '图片', '音频', '视频']} onSelect={setYxFmt} />
            <Dropdown label="价格状态" options={['全部', '已设价', '未设价']} onSelect={setYxPrice} />
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
              <div><div className="rt">免费</div><div className="rs">所有用户可看全部非永享内容</div></div>
            </div>
            <div className={'radio-opt' + (price === 1 ? ' on' : '')} onClick={() => setPrice(1)}>
              <div className="rd" />
              <div><div className="rt">会员</div><div className="rs">需会员才可看(永享内容单独计价)</div></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'qr' && (
        <>
          <div className="filter">
            <Search placeholder="搜索二维码包名称" minWidth={220} value={qrQ} onChange={setQrQ} />
            <Dropdown label="权益模式" options={['全部', '首扫绑定,后扫引导', '无权益']} onSelect={setQrMode} />
            <div className="grow" />
            <button className="btn btn-primary btn-sm" onClick={() => toast('新建二维码包')}>
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
            <div className="grow" />
            <button className="btn btn-primary btn-sm" onClick={() => toast('新建分享')}>
              <Icon id="i-plus" w={14} h={14} />
              新建分享
            </button>
          </div>
          <DataGrid columns={shareCols} rows={SHARES} empty={{ title: '还没有分享链接' }} />
        </>
      )}

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
          <div className="frame" />
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center' }}>拖动调整裁剪区域 · 输出 9:16 封面</div>
      </Modal>
    </>
  );
}
