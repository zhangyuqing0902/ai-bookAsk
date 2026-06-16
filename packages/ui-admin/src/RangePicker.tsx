import { useState } from 'react';
import { Calendar, fmtD } from './Calendar';

// 时间区间：今日 / 近7天 / 30天 / 自定义；选定自定义后在页面回显区间 + 可取消重选。
// 0614c：日历换成共用 Calendar（支持点标题选年 / 月下钻）。

export function RangePicker({
  presets = ['今日', '近 7 天', '30 天'],
  presetDays = [1, 7, 30],
  defaultActive = 1,
  label,
  onChange,
}: {
  presets?: string[];
  presetDays?: number[];
  defaultActive?: number;
  label?: string;
  onChange?: (r: { days: number; label: string }) => void;
}) {
  const [active, setActive] = useState(defaultActive);
  const [showCal, setShowCal] = useState(false);
  const [applied, setApplied] = useState<string | null>(null);
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);

  const pickDay = (dt: Date) => {
    if (!start || end) {
      setStart(dt);
      setEnd(null);
    } else if (dt >= start) setEnd(dt);
    else setStart(dt);
  };
  const apply = () => {
    if (!start) return;
    const lab = fmtD(start) + (end ? ' 至 ' + fmtD(end) : '');
    setApplied(lab);
    setShowCal(false);
    const d = end ? Math.round((end.getTime() - start.getTime()) / 86400000) + 1 : 1;
    onChange?.({ days: d, label: lab });
  };
  const cancelApplied = () => {
    setApplied(null);
    setStart(null);
    setEnd(null);
    setActive(defaultActive);
    onChange?.({ days: presetDays[defaultActive] ?? 7, label: presets[defaultActive] });
  };

  return (
    <div className="rangewrap">
      {label && <span className="range-label">{label}</span>}
      {applied && (
        <span className="dr-applied">
          {applied}
          <i title="取消自定义区间" onClick={cancelApplied}>
            ✕
          </i>
        </span>
      )}
      <div className="seg seg-range">
        {presets.map((p, i) => (
          <b
            key={p}
            className={active === i && !showCal && !applied ? 'on' : undefined}
            onClick={() => {
              setActive(i);
              setShowCal(false);
              setApplied(null);
              onChange?.({ days: presetDays[i] ?? 7, label: p });
            }}
          >
            {p}
          </b>
        ))}
        <b className={showCal || applied ? 'on' : undefined} onClick={() => setShowCal((s) => !s)}>
          自定义
        </b>
      </div>
      <div className={'dr-pop calpop' + (showCal ? ' show' : '')}>
        <Calendar start={start} end={end} onPick={pickDay} />
        <div className="cal-f">
          <span className="cal-range">
            {start ? fmtD(start) : '开始'} ~ {end ? fmtD(end) : '结束'}
          </span>
          <button className="btn btn-primary btn-sm" onClick={apply}>
            应用
          </button>
        </div>
      </div>
    </div>
  );
}
