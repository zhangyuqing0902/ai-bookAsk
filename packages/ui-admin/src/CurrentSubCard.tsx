import { Icon } from '@aba/ui';
import { InfoDot } from './InfoDot';

// 0615-6：当前生效订阅卡（共享）——平台机构详情订阅 Tab / 用量看板 + 机构后台主控台三处复用。
// 用本地结构类型（不依赖 @aba/mock）；数据由各页用 @aba/mock 的 currentSubCard() 计算后传入。
export interface CurrentSubRow {
  k: string;
  used: number;
  limit: number;
  unit: string;
  kind: 'occupancy' | 'consumption';
  info: string;
  /** 0812-g：该项额度为「不限」——不画百分比进度条，改渐隐条纹轨道 + 「不限」标 */
  unlimited?: boolean;
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
  lastExpired = null,
  emptyHint,
}: {
  /** 当前生效订阅视图模型；null = 暂无生效订阅 */
  data: CurrentSubData | null;
  /** 是否显示商务负责人（机构后台主控台 / 用量看板传 false） */
  showOwner?: boolean;
  /** 是否显示「新建订阅」按钮（仅平台机构详情订阅 Tab 传 true） */
  showNew?: boolean;
  onNew?: () => void;
  /** 0812：最近一条已过期订阅（data 为 null 时区分「全部过期」与「从未开通」）；用 @aba/mock lastExpiredSub() 计算 */
  lastExpired?: { plan?: string; endDate: string } | null;
  /** 0812：空态引导行（机构端「联系平台客服」/ 平台端「新建订阅」指引） */
  emptyHint?: string;
}) {
  return (
    <div className="cursub-card">
      <div className="cursub-top">
        <div className="cursub-top-l">
          <span className="cursub-plan">{data?.plan ?? lastExpired?.plan ?? '暂无生效订阅'}</span>
          {data && <span className={'fstat ' + (data.status === '生效' ? 'ok' : 'none')}><span className="dt" />{data.status}</span>}
          {!data && lastExpired && <span className="fstat none"><span className="dt" />已过期</span>}
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
              // 0812-g：不限项——「还剩多少」不成立，故不画百分比；只保留有意义的「当前用量」+ 不封口的渐隐轨道
              if (r.unlimited) {
                return (
                  <div className="quota-row" key={r.k}>
                    <div className="quota-head">
                      <span className="quota-k">
                        {r.k}
                        <span className={'quota-kind ' + r.kind}>{r.kind === 'occupancy' ? '占用量' : '消耗量'}</span>
                        <InfoDot text={r.info} />
                      </span>
                      <span className="quota-v mono">
                        <small>{r.kind === 'occupancy' ? '当前占用' : '本周期消耗'}</small> {r.used} {r.unit}
                        <span className="quota-lim">/ {r.kind === 'occupancy' ? '当前上限' : '本周期额度'} <b className="quota-unlim-word">不限</b></span>
                      </span>
                    </div>
                    <div className="quota-track">
                      <span className="quota-bar"><i className="quota-fill unlim" /></span>
                      <span className="quota-pct mono unlim">不限</span>
                    </div>
                  </div>
                );
              }
              // 0813-2：降档后存量超额（如 12 个 KP 落到 5 个额度）——进度条封顶但数值显示真实的 12 / 5。
              //   刻意不把 used 截断到 limit：截断是撒谎，管理员必须看到真实超出多少才知道要清理多少。
              const over = r.used > r.limit;
              const overBy = over ? Number((r.used - r.limit).toFixed(2)) : 0;
              return (
                <div className="quota-row" key={r.k}>
                  <div className="quota-head">
                    <span className="quota-k">
                      {r.k}
                      <span className={'quota-kind ' + r.kind}>{r.kind === 'occupancy' ? '占用量' : '消耗量'}</span>
                      <InfoDot text={r.info} />
                    </span>
                    <span className={'quota-v mono' + (over ? ' is-over' : '')}><small>{r.kind === 'occupancy' ? '当前占用' : '本周期消耗'}</small> {r.used} <span className="quota-lim">/ {r.kind === 'occupancy' ? '当前上限' : '本周期额度'} {r.limit} {r.unit}</span></span>
                  </div>
                  <div className="quota-track">
                    <span className="quota-bar"><i className={'quota-fill ' + (over ? 'over' : tone(pct))} style={{ width: (over ? 100 : pct) + '%' }} /></span>
                    {/* 超额时把百分比换成「超额 N」——超过 100% 的百分比没有信息量，
                        「还要清理多少」才是管理员唯一需要的数字 */}
                    <span className={'quota-pct mono ' + (over ? 'over' : tone(pct))}>{over ? `超额 ${overBy}${r.unit}` : `${pct}%`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* 0812：空态升级——区分「全部过期」（保留过期套餐与到期日 + 影响说明）与「从未开通」；配引导行 */
        /* 0812-b：空态美化——图标徽章 + 三段排版（标题 / 说明 / 引导胶囊），仅样式不动逻辑 */
        <div className={'cursub-empty' + (lastExpired ? ' is-expired' : ' is-none')}>
          <span className="cursub-empty-ic">
            <Icon id={lastExpired ? 'i-warn' : 'i-crownO'} w={22} h={22} />
          </span>
          <div className="cursub-empty-body">
            <b className="cursub-empty-title">{lastExpired ? '订阅套餐已全部过期' : '暂未开通订阅套餐'}</b>
            <span className="cursub-empty-desc">
              {lastExpired
                ? `上一套餐「${lastExpired.plan ?? '—'}」已于 ${lastExpired.endDate} 到期：机构既有内容与数据完整保留，C 端问答与新建 / 上传暂停，续费后即时恢复。`
                : '开通订阅后机构才具备 KP / 存储 / Token 额度，C 端方可扫码问答。'}
            </span>
            <span className="cursub-empty-hint">{emptyHint ?? (showNew ? '可点击右上角「新建订阅」为机构开通或续费。' : '如需开通或续费，请联系平台客服。')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
