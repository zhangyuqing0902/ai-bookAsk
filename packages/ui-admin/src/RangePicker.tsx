import { useState } from 'react';
import { Calendar, fmtD } from './Calendar';

// 时间区间：今日 / 近7天 / 30天 / 自定义；选定自定义后在页面回显区间 + 可取消重选。
// 0614c：日历换成共用 Calendar（支持点标题选年 / 月下钻）。
// 0714：onChange 载荷补 start/end（预设按 今天-(days-1) 折算），days=0 表示「不限」（不带 start/end），供列表真过滤。

function presetRange(days: number, label: string): { days: number; label: string; start?: Date; end?: Date } {
  if (!days || days <= 0) return { days: 0, label };
  const end = new Date(); end.setHours(23, 59, 59, 999);
  const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (days - 1));
  return { days, label, start, end };
}

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
  onChange?: (r: { days: number; label: string; start?: Date; end?: Date }) => void;
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
    const s = new Date(start); s.setHours(0, 0, 0, 0);
    const e = new Date(end ?? start); e.setHours(23, 59, 59, 999);
    onChange?.({ days: d, label: lab, start: s, end: e });
  };
  const cancelApplied = () => {
    setApplied(null);
    setStart(null);
    setEnd(null);
    setActive(defaultActive);
    onChange?.(presetRange(presetDays[defaultActive] ?? 7, presets[defaultActive]));
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
              onChange?.(presetRange(presetDays[i] ?? 7, p));
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
