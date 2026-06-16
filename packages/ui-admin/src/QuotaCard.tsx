import { InfoDot } from './InfoDot';

export interface QuotaRow {
  k: string;
  used: string;
  limit: string;
  pct: number;
  info: string;
}

// 配额进度卡（平台后台机构详情用量 + 机构后台主控台共用，0614b 抽公共组件）
// 已用 / 上限 进度条，接近上限按色预警（70% 警示 / 90% 危险）。
export function QuotaCard({
  rows,
  title = '配额用量（已用 / 上限）',
  sub,
}: {
  rows: QuotaRow[];
  title?: string;
  sub?: string;
}) {
  const tone = (p: number) => (p >= 90 ? 'bad' : p >= 70 ? 'warn' : 'ok');
  return (
    <div className="quota-card">
      <div className="uc-title">
        <span className="uc-dot" />
        {title}
        {sub && <span className="quota-sub">{sub}</span>}
      </div>
      <div className="quota-rows">
        {rows.map((r) => (
          <div className="quota-row" key={r.k}>
            <div className="quota-head">
              <span className="quota-k">
                {r.k}
                <InfoDot text={r.info} />
              </span>
              <span className="quota-v mono">
                {r.used} <span className="quota-lim">/ {r.limit}</span>
              </span>
            </div>
            <div className="quota-track">
              <span className="quota-bar">
                <i className={'quota-fill ' + tone(r.pct)} style={{ width: r.pct + '%' }} />
              </span>
              <span className={'quota-pct mono ' + tone(r.pct)}>{r.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
