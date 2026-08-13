import { useState, type ReactNode } from 'react';

// 后台统一日历（0614c）：日 → 月 → 年 三级下钻——点中间标题「2026 年 6 月」切到月选择，
// 再点「2026 年」切到年选择，可灵活选任意年月再回到日。两后台所有时间面板共用。
const MN = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const pad = (n: number) => String(n).padStart(2, '0');
export const fmtD = (d: Date | null) => (d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : '');

// 0813-2：新增可选上下界 min / max（默认不传＝行为完全不变，留存单日面板与订阅有效期表单不受影响）。
//   看板自定义区间用它把「今天及以后」和「近 3 年以前」置灰不可选。
export function Calendar({
  start = null,
  end = null,
  onPick,
  initialView,
  min = null,
  max = null,
}: {
  start?: Date | null;
  end?: Date | null;
  onPick: (d: Date) => void;
  initialView?: Date | null;
  /** 可选最早日期（含），早于它的日格置灰不可点 */
  min?: Date | null;
  /** 可选最晚日期（含），晚于它的日格置灰不可点 */
  max?: Date | null;
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
      // 0813-2：越界日格置灰且不响应点击（min / max 未传时恒为 false，行为同旧版）
      const off = (min != null && fmtD(dt) < fmtD(min)) || (max != null && fmtD(dt) > fmtD(max));
      let c = 'cal-d';
      if (off) c += ' off';
      if (!off && start && fmtD(dt) === fmtD(start)) c += ' sel start';
      if (!off && end && fmtD(dt) === fmtD(end)) c += ' sel end';
      if (!off && start && end && dt > start && dt < end) c += ' inrange';
      dayCells.push(
        <span key={d} className={c} onClick={off ? undefined : () => onPick(dt)}>
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
