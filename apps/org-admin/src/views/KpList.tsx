import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, Modal, TextInput, EmptyState, Pager } from '@aba/ui-admin';
import { KP_SOURCE_LABEL } from '@aba/mock';
import { useKpLifecycle } from '../stores/kpLifecycle';
import { ORG_KPS, ORG_KP_STATUS_META, type OrgKp } from '../data/kps';

// 机构后台 · 知识产品 KP 列表（搜索 + 状态/来源筛选 + 空态 + 新建/导入弹窗）
// 0717 #2.3：列表与详情同源（../data/kps.ts），每个状态各留一条演示数据 + 实时分享双视角。
// 0717 #2.4：状态命名两后台统一为「草稿 / 已发布 / 已下架」。
// 0718 #7：来源标签三态统一（自建 / 分享导入·实时 / 分享导入·快照，统一灰色），两后台列表/详情一致。
// 0614：机构 KP / 存储配额（demo，与平台用量看板一致）；超限时阻断并提示联系平台扩容
const KP_USED = 30, KP_LIMIT = 50;
const STORE_USED = 62, STORE_LIMIT = 100;

// 来源标签 = shareMode 映射（自建 / 分享导入·实时 / 分享导入·快照）
const sourceLabel = (kp: OrgKp) => KP_SOURCE_LABEL[kp.shareMode ?? 'own'];

export function KpList() {
  const nav = useNavigate();
  const overrides = useKpLifecycle((s) => s.overrides);
  const effectiveStatus = (kp: OrgKp) => {
    // 0716 #1.1：详情下架/发布/删除写入 kpLifecycle store 后，列表状态标签叠加覆盖值；
    // 兼容旧持久化 'archived'→'deleted'，未知覆盖值回落数据源原始状态，避免列表崩溃空白。
    const ov = overrides[kp.id] as string | undefined;
    const norm = ov === 'archived' ? 'deleted' : ov;
    return ORG_KP_STATUS_META[(norm as keyof typeof ORG_KP_STATUS_META) ?? kp.status] ?? ORG_KP_STATUS_META[kp.status];
  };
  const [create, setCreate] = useState(false);
  const [imp, setImp] = useState(false);
  const [impLink, setImpLink] = useState('');
  const [impPassword, setImpPassword] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('全部');
  const [source, setSource] = useState('全部');
  const [page, setPage] = useState(1);
  // 0614：KP 数达上限 → 阻断新建并提示
  const overKp = KP_USED >= KP_LIMIT;
  const newKp = () => {
    if (overKp) return toast(`已达 KP 数量上限（${KP_LIMIT} 个），请联系平台扩容`);
    setCreate(true);
  };

  // 0714 #18：状态筛选按叠加覆盖后的「有效状态」匹配；
  // 0717 #1.5：已删除（逻辑删除）的 KP 不在三端界面展示，数据库保留数据。
  // 0718 #7：来源筛选按三态标签匹配（自建 / 分享导入·实时 / 分享导入·快照）
  const list = ORG_KPS.filter(
    (kp) => effectiveStatus(kp).label !== '已删除' && (!q || kp.name.includes(q)) && (status === '全部' || effectiveStatus(kp).label === status) && (source === '全部' || sourceLabel(kp) === source),
  );
  // 4.2:每页 10 条,即使 ≤10 条也始终显示分页器(KP 列表特例),真实 slice 翻页
  const PAGE_SIZE = 10;
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const curPage = Math.min(page, pageCount);
  const pageList = list.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="pt">知识产品 KP</div>
        </div>
        <div className="pa">
          {/* 0614：机构配额用量提示（超限将阻断新建 / 上传，提示联系平台扩容） */}
          <span
            className={'quota-chip' + (KP_USED / KP_LIMIT >= 0.9 || STORE_USED / STORE_LIMIT >= 0.9 ? ' bad' : KP_USED / KP_LIMIT >= 0.7 || STORE_USED / STORE_LIMIT >= 0.7 ? ' warn' : '')}
            title="机构配额：KP 数 / 存储空间。达上限将无法新建 KP 或上传文件，请联系平台扩容。"
          >
            KP {KP_USED}/{KP_LIMIT} · 存储 {STORE_USED}/{STORE_LIMIT}GB
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => setImp(true)}>
            <Icon id="i-dl" w={14} h={14} />
            导入分享 KP
          </button>
          <button className="btn btn-primary btn-sm" onClick={newKp}>
            <Icon id="i-plus" w={14} h={14} />
            新建 KP
          </button>
        </div>
      </div>
      <div className="filter">
        <Search placeholder="搜索 KP 名称" minWidth={220} value={q} onChange={setQ} />
        <Dropdown label="状态" options={['全部', '草稿', '已发布', '已下架']} onSelect={setStatus} />
        <Dropdown label="来源" options={['全部', '自建', '分享导入·实时', '分享导入·快照']} onSelect={setSource} />
      </div>

      {list.length === 0 ? (
        <div className="card card-pad">
          <EmptyState icon="i-cube" title="没有匹配的 KP" sub="换个名称或筛选条件,或新建一个 KP" action={<button className="btn btn-primary btn-sm" onClick={() => setCreate(true)}><Icon id="i-plus" w={14} h={14} />新建 KP</button>} />
        </div>
      ) : (
        <div className="kp-grid">
          {pageList.map((kp) => {
            const st = effectiveStatus(kp);
            return (
            // 0716 #1.1（二批）：已删除 KP 已在列表源头过滤，不再出现；已下架显琥珀标、可进详情重新发布
            <div
              className="kp-card"
              key={kp.id}
              onClick={() => nav('/kps/' + kp.id + (kp.shareMode ? `?share=${kp.shareMode}` : ''))}
            >
              <div className={'kp-cover ' + kp.cover}>
                <div className="ct">{kp.name}</div>
              </div>
              <div className="kp-info">
                <div className="kp-info-top">
                  <span className="kp-name">{kp.name}</span>
                </div>
                {/* 4.1:来源(自建/分享导入·实时/分享导入·快照)=统一灰色小标签;发布状态=彩色标签;左右并排 */}
                {/* 0722：分享标识仅接收方显示（分享导入·实时/快照），分享方不再显示角色标签 */}
                <div className="kp-tags">
                  <span className="kp-tag-src">{sourceLabel(kp)}</span>
                  <span className={'kp-tag-st ' + st.cls}>{st.label}</span>
                </div>
                <div className="kp-agent">
                  <span className="av" />
                  Agent · {kp.agent}
                </div>
                <div className="kp-stat">
                  <span className="has-tip" data-tip="知识库文件数">
                    <Icon id="i-file" />
                    {kp.files}
                  </span>
                  <span className="has-tip" data-tip="C 端累计提问数">
                    <Icon id="i-msg" />
                    {kp.asks}
                  </span>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* 4.2:KP 列表始终显示分页器(即使 ≤10 条);空态时不显示 */}
      {list.length > 0 && <Pager total={list.length} unit="个" pageSize={PAGE_SIZE} page={curPage} onPageChange={setPage} />}

      <Modal
        title="新建知识产品 KP"
        open={create}
        onClose={() => setCreate(false)}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setCreate(false)}>
              取消
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => { setCreate(false); toast('已创建 KP'); }}>
              创建
            </button>
          </>
        }
      >
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 4 }}>
          <div className="lab">KP 名称<span className="req">*</span></div>
          <div className="ctl"><TextInput placeholder="请输入 KP 名称" /></div>
        </div>
        <div className="fm-row">
          <div className="lab">简介</div>
          <div className="ctl"><TextInput placeholder="一句话介绍此 KP" /></div>
        </div>
      </Modal>

      <Modal
        title="导入分享 KP"
        open={imp}
        width={680}
        onClose={() => setImp(false)}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setImp(false)}>
              取消
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => {
              if (!impLink.trim() || !impPassword.trim()) return toast('请填写分享链接与密码');
              if (/xx-press|本机构|\/own(?:\/|$)/i.test(impLink)) return toast('不能导入本机构分享的知识产品');
              setImp(false); setImpLink(''); setImpPassword(''); toast('已导入分享 KP');
            }}>
              导入
            </button>
          </>
        }
      >
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 4 }}>
          <div className="lab">分享链接<span className="req">*</span></div>
          <div className="ctl"><TextInput placeholder="粘贴分享链接" value={impLink} onChange={(e) => setImpLink(e.target.value)} /></div>
        </div>
        <div className="fm-row">
          <div className="lab">密码<span className="req">*</span></div>
          <div className="ctl"><TextInput placeholder="输入提取密码" value={impPassword} onChange={(e) => setImpPassword(e.target.value)} /></div>
        </div>
        {/* 0714 #11：提示结构化——灰色内容框 + 三条无序列表（导入限制 / 实时同步 / 独立快照） */}
        <div className="imp-hint" style={{ textAlign: 'left', background: 'var(--paper)', border: '1px solid var(--line-2)', borderRadius: 10, padding: '10px 14px' }}>
          {/* 弹窗加宽至 680，li 不换行，三条各占一行不折 */}
          <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.9 }}>
            <li style={{ whiteSpace: 'nowrap' }}><b>导入限制</b>：仅支持导入外部机构分享，本机构分享不可导入</li>
            <li style={{ whiteSpace: 'nowrap' }}><b>实时同步</b>：不占用接收方 KP 与存储，内容只读，Token 消耗归属接收方</li>
            <li style={{ whiteSpace: 'nowrap' }}><b>独立快照</b>：占用接收方 KP 与存储，支持编辑，Token 消耗归属接收方</li>
          </ul>
        </div>
      </Modal>
    </>
  );
}
