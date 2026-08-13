import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, Modal, TextInput, EmptyState, Pager } from '@aba/ui-admin';
import { KP_SOURCE_LABEL, ORG_FILTER_ALL, orgScopeOptions, orgScopeValue, visibleOrgs, CURRENT_ORG, currentSubCard, quotaState } from '@aba/mock';
import { useKpLifecycle } from '../stores/kpLifecycle';
import { useOrgScope } from '../stores/orgScope';
import { useSubDemo, SUB_DEMO_SUBS } from '../stores/subDemo';
import { ORG_KPS, ORG_KP_STATUS_META, type OrgKp } from '../data/kps';

// 机构后台 · 知识产品 KP 列表（搜索 + 状态/来源筛选 + 空态 + 新建/导入弹窗）
// 0717 #2.3：列表与详情同源（../data/kps.ts），每个状态各留一条演示数据 + 实时分享双视角。
// 0717 #2.4：状态命名两后台统一为「草稿 / 已发布 / 已下架」。
// 0718 #7：来源标签三态统一（自建 / 分享导入·实时 / 分享导入·快照，统一灰色），两后台列表/详情一致。
// 0813-2：删掉写死的 KP_USED/KP_LIMIT/STORE_USED/STORE_LIMIT 四个常量，改接真实生效订阅（currentSubCard）。
//   额度基数＝所有未删除的 KP（草稿 + 已发布 + 已下架都占，只有删除释放）。
//   超额＝棘轮冻结新建（quotaState 用 >=）：12 个降到 5 个额度后，删到 6 个仍继续阻断，回落到 4 个才能再建。

// 来源标签 = shareMode 映射（自建 / 分享导入·实时 / 分享导入·快照）
const sourceLabel = (kp: OrgKp) => KP_SOURCE_LABEL[kp.shareMode ?? 'own'];

export function KpList() {
  const nav = useNavigate();
  // 0806：父机构视角——机构单选筛选 + 卡片归属机构 + 子机构 KP 只读（详情置灰）
  const orgType = useOrgScope((s) => s.orgType);
  const isParent = orgType === 'parent';
  const [orgSel, setOrgSel] = useState(ORG_FILTER_ALL);
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

  // 0813-2：配额接真实生效订阅。额度基数＝所有未删除的 KP（草稿 / 已发布 / 已下架都占，只有删除释放）。
  const subDemo = useSubDemo((s) => s.subDemo);
  const sub = currentSubCard(SUB_DEMO_SUBS[subDemo]);
  const kpRow = sub?.rows.find((r) => r.k === 'KP 数');
  const stRow = sub?.rows.find((r) => r.k === '存储');
  // 占用量取当前生效订阅记录（与主控台订阅卡、平台机构列表同源），两个页面不可能显示不一致的额度。
  // 上线口径：KP 占用＝该机构所有未删除的 KP（草稿 + 已发布 + 已下架都占，只有删除释放），实时统计。
  const kpAlive = kpRow?.used ?? 0;
  const kpQ = quotaState(kpAlive, kpRow?.limit ?? 0, kpRow?.unlimited, 'kp');
  const stQ = quotaState(stRow?.used ?? 0, stRow?.limit ?? 0, stRow?.unlimited, 'storage');
  // 无生效订阅（全部过期 / 从未开通）同样不能新建，但文案走「续费后恢复」而非「删到额度内」
  const noSub = !sub;
  const canCreate = !noSub && kpQ.canAdd;
  const blockReason = noSub
    ? '订阅套餐已过期或尚未开通，机构既有内容与数据完整保留；续费后即可恢复新建 KP。'
    : kpQ.reason;
  const newKp = () => {
    if (!canCreate) return toast(blockReason);
    setCreate(true);
  };
  const importKp = () => {
    if (!canCreate) return toast(blockReason);
    setImp(true);
  };

  // 0714 #18：状态筛选按叠加覆盖后的「有效状态」匹配；
  // 0717 #1.5：已删除（逻辑删除）的 KP 不在三端界面展示，数据库保留数据。
  // 0718 #7：来源筛选按三态标签匹配（自建 / 分享导入·实时 / 分享导入·快照）
  const scope = visibleOrgs(orgType);
  const list = ORG_KPS.filter(
    (kp) =>
      scope.includes(kp.org) &&
      (!isParent || orgSel === ORG_FILTER_ALL || kp.org === orgSel) &&
      effectiveStatus(kp).label !== '已删除' && (!q || kp.name.includes(q)) && (status === '全部' || effectiveStatus(kp).label === status) && (source === '全部' || sourceLabel(kp) === source),
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
          {/* 0813-2：配额 chip 接真实订阅——超额时显示真实占用与超出量（不截断），
              tooltip 给出「删到额度内 / 联系平台扩容」两条路，而不是「请联系平台扩容」这种死路 */}
          {noSub ? (
            <span className="quota-chip bad" title={blockReason}>无生效订阅</span>
          ) : (
            <span
              className={'quota-chip' + (kpQ.level === 'over' || stQ.level === 'over' ? ' bad' : kpQ.level === 'near' || stQ.level === 'near' ? ' bad' : kpQ.level === 'warn' || stQ.level === 'warn' ? ' warn' : '')}
              title={[kpQ.reason, stQ.reason].filter(Boolean).join('\n') || '机构配额：KP 数 / 存储空间。达上限将无法新建 KP 或上传文件，可删除释放或联系平台扩容。'}
            >
              KP {kpQ.unlimited ? `${kpAlive}/不限` : `${kpAlive}/${kpQ.limit}`}
              {kpQ.over && <b className="quota-chip-over">超额 {kpQ.overBy}</b>}
              {' · '}存储 {stQ.unlimited ? `${stQ.used}/不限` : `${stQ.used}/${stQ.limit}GB`}
              {stQ.over && <b className="quota-chip-over">超额 {stQ.overBy}GB</b>}
            </span>
          )}
          <button className="btn btn-ghost btn-sm" onClick={importKp} disabled={!canCreate} title={canCreate ? undefined : blockReason}>
            <Icon id="i-dl" w={14} h={14} />
            导入分享 KP
          </button>
          <button className="btn btn-primary btn-sm" onClick={newKp} disabled={!canCreate} title={canCreate ? undefined : blockReason}>
            <Icon id="i-plus" w={14} h={14} />
            新建 KP
          </button>
        </div>
      </div>
      {/* 0813-2：超额告警条——降档后存量超额是持续状态，不能只藏在 tooltip 里。
          明确三件事：既有内容不受影响（安抚）、当前被冻结了什么（后果）、怎么解除（两条路）。 */}
      {(kpQ.over || stQ.over || noSub) && (
        <div className="quota-alert">
          <Icon id="i-warn" w={16} h={16} />
          <div className="quota-alert-body">
            <b>{noSub ? '当前无生效订阅' : '订阅额度已超出'}</b>
            <span>{blockReason || stQ.reason}</span>
            {!noSub && stQ.over && <span>存储已超出 {stQ.overBy} GB，文件上传同步冻结；既有文件与 C 端问答不受影响。</span>}
            <span className="quota-alert-safe">机构既有内容、数据与 C 端读者已购权益完整保留，平台不会删除任何机构数据。</span>
          </div>
        </div>
      )}
      <div className="filter">
        <Search placeholder="搜索 KP 名称" minWidth={220} value={q} onChange={setQ} />
        {/* 0806：父机构视角——机构单选筛选（全部机构 / 本机构（父机构）/ 各子机构） */}
        {isParent && <Dropdown label="机构" options={orgScopeOptions()} onSelect={(v) => setOrgSel(v === ORG_FILTER_ALL ? ORG_FILTER_ALL : orgScopeValue(v))} style={{ width: 200 }} />}
        <Dropdown label="状态" options={['全部', '草稿', '已发布', '已下架']} onSelect={setStatus} />
        <Dropdown label="来源" options={['全部', '自建', '分享导入·实时', '分享导入·快照']} onSelect={setSource} />
      </div>

      {list.length === 0 ? (
        <div className="card card-pad">
          <EmptyState icon="i-cube" title="没有匹配的 KP" sub="换个名称或筛选条件,或新建一个 KP" action={<button className="btn btn-primary btn-sm" onClick={newKp} disabled={!canCreate} title={canCreate ? undefined : blockReason}><Icon id="i-plus" w={14} h={14} />新建 KP</button>} />
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
              onClick={() => {
                // 0806：子机构 KP 仅可查看——详情带 owner=child 进只读态（机构角色「可操作」仅针对本机构数据）
                const qs = [kp.shareMode ? `share=${kp.shareMode}` : '', kp.org !== CURRENT_ORG ? 'owner=child' : ''].filter(Boolean).join('&');
                nav('/kps/' + kp.id + (qs ? `?${qs}` : ''));
              }}
            >
              <div className={'kp-cover ' + kp.cover}>
                <div className="ct">{kp.name}</div>
              </div>
              <div className="kp-info">
                <div className="kp-info-top">
                  <span className="kp-name">{kp.name}</span>
                </div>
                {/* 0806：父机构视角显示数据归属机构 */}
                {isParent && <div className="kp-org-row">{kp.org}{kp.org !== CURRENT_ORG && <span className="kp-org-ro">仅可查看</span>}</div>}
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
            <li style={{ whiteSpace: 'nowrap' }}><b>实时同步</b>：占用接收方 KP、不占存储，内容只读，Token 消耗归属接收方</li>
            <li style={{ whiteSpace: 'nowrap' }}><b>独立快照</b>：占用接收方 KP 与存储，支持编辑，Token 消耗归属接收方</li>
          </ul>
        </div>
      </Modal>
    </>
  );
}
