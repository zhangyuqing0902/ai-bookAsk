import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, toast } from '@aba/ui';
import { Search, Dropdown, Modal, TextInput, EmptyState, Pager } from '@aba/ui-admin';

interface Kp {
  name: string;
  cover: string;
  source: '自建' | '共享';
  status: string;
  statusCls: string;
  agent: string;
  files: string;
  asks: string;
}
const KPS: Kp[] = [
  { name: '心血管分册', cover: '', source: '自建', status: '已发', statusCls: 'tag-jade', agent: '李医生', files: '12', asks: '1.2k' },
  { name: '儿科学', cover: 'c2', source: '自建', status: '未发', statusCls: 'tag-line', agent: '王老师', files: '8', asks: '340' },
  { name: '内科精要', cover: 'c3', source: '共享', status: '已发', statusCls: 'tag-jade', agent: '—', files: '20', asks: '5k' },
  { name: '外科学-快照', cover: 'c4', source: '共享', status: '已发', statusCls: 'tag-jade', agent: '赵', files: '6', asks: '88' },
];

// 机构后台 · 知识产品 KP 列表（搜索 + 状态/来源筛选 + 空态 + 新建/导入弹窗）
export function KpList() {
  const nav = useNavigate();
  const [create, setCreate] = useState(false);
  const [imp, setImp] = useState(false);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('全部');
  const [source, setSource] = useState('全部');
  const [page, setPage] = useState(1);

  const list = KPS.filter(
    (kp) => (!q || kp.name.includes(q)) && (status === '全部' || kp.status === status) && (source === '全部' || kp.source === source),
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
          <button className="btn btn-ghost btn-sm" onClick={() => setImp(true)}>
            <Icon id="i-dl" w={14} h={14} />
            导入分享 KP
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setCreate(true)}>
            <Icon id="i-plus" w={14} h={14} />
            新建 KP
          </button>
        </div>
      </div>
      <div className="filter">
        <Search placeholder="搜索 KP 名称" minWidth={220} value={q} onChange={setQ} />
        <Dropdown label="状态" options={['全部', '未发', '已发', '已下架']} onSelect={setStatus} />
        <Dropdown label="来源" options={['全部', '自建', '共享']} onSelect={setSource} />
      </div>

      {list.length === 0 ? (
        <div className="card card-pad">
          <EmptyState icon="i-cube" title="没有匹配的 KP" sub="换个名称或筛选条件,或新建一个 KP" action={<button className="btn btn-primary btn-sm" onClick={() => setCreate(true)}><Icon id="i-plus" w={14} h={14} />新建 KP</button>} />
        </div>
      ) : (
        <div className="kp-grid">
          {pageList.map((kp, i) => (
            <div className="kp-card" key={kp.name} onClick={() => nav('/kps/' + ((curPage - 1) * PAGE_SIZE + i + 1))}>
              <div className={'kp-cover ' + kp.cover}>
                <div className="ct">{kp.name}</div>
              </div>
              <div className="kp-info">
                <div className="kp-info-top">
                  <span className="kp-name">{kp.name}</span>
                </div>
                {/* 4.1:来源(自建/共享)=统一灰色小标签;发布状态=彩色标签;左右并排 */}
                <div className="kp-tags">
                  <span className="kp-tag-src">{kp.source}</span>
                  <span className={'kp-tag-st ' + kp.statusCls}>{kp.status}</span>
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
          ))}
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
        onClose={() => setImp(false)}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setImp(false)}>
              取消
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => { setImp(false); toast('已导入分享 KP'); }}>
              导入
            </button>
          </>
        }
      >
        <div className="fm-row" style={{ borderTop: 'none', paddingTop: 4 }}>
          <div className="lab">分享链接<span className="req">*</span></div>
          <div className="ctl"><TextInput placeholder="粘贴分享链接" /></div>
        </div>
        <div className="fm-row">
          <div className="lab">密码<span className="req">*</span></div>
          <div className="ctl"><TextInput placeholder="输入提取密码" /></div>
        </div>
        <div className="imp-hint">实时同步：列表直显并标「共享」；独立快照：名称加「-快照」后缀。</div>
      </Modal>
    </>
  );
}
