import { Icon } from '@aba/ui';
import { InfoDot } from './InfoDot';

// 0615-6：当前生效订阅卡（共享）——平台机构详情订阅 Tab / 用量看板 + 机构后台主控台三处复用。
// 用本地结构类型（不依赖 @aba/mock）；数据由各页用 @aba/mock 的 currentSubCard() 计算后传入。
export interface CurrentSubRow {
  k: string;
  used: number;
  limit: number;
  unit: string;
  info: string;
}
export interface CurrentSubData {
  plan?: string;
  status: string;
  packsCount: number;
  startDate: string;
  endDate: string;
  owner?: string;
  rows: CurrentSubRow[];
}

const tone = (p: number) => (p >= 90 ? 'bad' : p >= 70 ? 'warn' : 'ok');
const daysTo = (end: string) => Math.max(0, Math.ceil((new Date(end + 'T00:00:00').getTime() - Date.now()) / 86400000));

export function CurrentSubCard({
  data,
  showOwner = true,
  showNew = false,
  onNew,
}: {
  /** 当前生效订阅视图模型；null = 暂无生效订阅 */
  data: CurrentSubData | null;
  /** 是否显示商务负责人（机构后台主控台 / 用量看板传 false） */
  showOwner?: boolean;
  /** 是否显示「新建订阅」按钮（仅平台机构详情订阅 Tab 传 true） */
  showNew?: boolean;
  onNew?: () => void;
}) {
  return (
    <div className="cursub-card">
      <div className="cursub-top">
        <div className="cursub-top-l">
          <span className="cursub-plan">{data?.plan ?? '暂无生效订阅'}</span>
          {data && <span className={'fstat ' + (data.status === '生效' ? 'ok' : 'none')}><span className="dt" />{data.status}</span>}
          {data && data.packsCount > 0 && <span className="tag-s tag-amber">含加油包 ×{data.packsCount}</span>}
        </div>
        {showNew && (
          <button className="btn btn-primary btn-sm" onClick={onNew}>
            <Icon id="i-plus" w={14} h={14} /> 新建订阅
          </button>
        )}
      </div>
      {data ? (
        <>
          <div className="cursub-meta">
            <span>有效期 <b>{data.startDate} ~ {data.endDate}</b></span>
            <span>剩余 <b>{daysTo(data.endDate)}</b> 天</span>
            {showOwner && <span>商务负责人 <b>{data.owner ?? '—'}</b></span>}
          </div>
          <div className="quota-rows cursub-quota">
            {data.rows.map((r) => {
              const pct = r.limit > 0 ? Math.min(100, Math.round((r.used / r.limit) * 100)) : 0;
              return (
                <div className="quota-row" key={r.k}>
                  <div className="quota-head">
                    <span className="quota-k">
                      {r.k}
                      <InfoDot text={r.info} />
                    </span>
                    <span className="quota-v mono">{r.used} <span className="quota-lim">/ {r.limit} {r.unit}</span></span>
                  </div>
                  <div className="quota-track">
                    <span className="quota-bar"><i className={'quota-fill ' + tone(pct)} style={{ width: pct + '%' }} /></span>
                    <span className={'quota-pct mono ' + tone(pct)}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="cursub-empty">暂无生效中订阅{showNew ? '，请「新建订阅」。' : '。'}</div>
      )}
    </div>
  );
}
