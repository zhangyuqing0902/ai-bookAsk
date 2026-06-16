import { useState, type ReactNode } from 'react';

// 后台统一日历（0614c）：日 → 月 → 年 三级下钻——点中间标题「2026 年 6 月」切到月选择，
// 再点「2026 年」切到年选择，可灵活选任意年月再回到日。两后台所有时间面板共用。
const MN = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const pad = (n: number) => String(n).padStart(2, '0');
export const fmtD = (d: Date | null) => (d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : '');

export function Calendar({
  start = null,
  end = null,
  onPick,
  initialView,
}: {
  start?: Date | null;
  end?: Date | null;
  onPick: (d: Date) => void;
  initialView?: Date | null;
}) {
  const [view, setView] = useState(() => {
    const base = initialView || start || new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [mode, setMode] = useState<'day' | 'month' | 'year'>('day');
  const y = view.getFullYear();
  const m = view.getMonth();
  const yearBase = y - (((y % 12) + 12) % 12); // 对齐的 12 年区块起点

  const prev = () => setView(new Date(mode === 'day' ? y : mode === 'month' ? y - 1 : y - 12, mode === 'day' ? m - 1 : m, 1));
  const next = () => setView(new Date(mode === 'day' ? y : mode === 'month' ? y + 1 : y + 12, mode === 'day' ? m + 1 : m, 1));

  const dayCells: ReactNode[] = [];
  if (mode === 'day') {
    const wd = (new Date(y, m, 1).getDay() + 6) % 7;
    const days = new Date(y, m + 1, 0).getDate();
    for (let i = 0; i < wd; i++) dayCells.push(<span key={'e' + i} className="cal-d empty" />);
    for (let d = 1; d <= days; d++) {
      const dt = new Date(y, m, d);
      let c = 'cal-d';
      if (start && fmtD(dt) === fmtD(start)) c += ' sel start';
      if (end && fmtD(dt) === fmtD(end)) c += ' sel end';
      if (start && end && dt > start && dt < end) c += ' inrange';
      dayCells.push(
        <span key={d} className={c} onClick={() => onPick(dt)}>
          {d}
        </span>,
      );
    }
  }

  return (
    <div className="cal">
      <div className="cal-h">
        <span className="cal-nav" onClick={prev}>‹</span>
        {mode === 'day' && <b className="cal-title" onClick={() => setMode('month')}>{y} 年 {MN[m]} 月</b>}
        {mode === 'month' && <b className="cal-title" onClick={() => setMode('year')}>{y} 年</b>}
        {mode === 'year' && <b className="cal-title cal-title-static">{yearBase} - {yearBase + 11}</b>}
        <span className="cal-nav" onClick={next}>›</span>
      </div>

      {mode === 'day' && (
        <>
          <div className="cal-wk">
            <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
          </div>
          <div className="cal-grid">{dayCells}</div>
        </>
      )}

      {mode === 'month' && (
        <div className="cal-grid cal-ym">
          {MN.map((mm, i) => (
            <span key={i} className={'cal-cell' + (i === m ? ' on' : '')} onClick={() => { setView(new Date(y, i, 1)); setMode('day'); }}>
              {mm} 月
            </span>
          ))}
        </div>
      )}

      {mode === 'year' && (
        <div className="cal-grid cal-ym">
          {Array.from({ length: 12 }, (_, i) => yearBase + i).map((yr) => (
            <span key={yr} className={'cal-cell' + (yr === y ? ' on' : '')} onClick={() => { setView(new Date(yr, m, 1)); setMode('month'); }}>
              {yr}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
