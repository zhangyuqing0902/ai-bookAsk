import { useState } from 'react';
import { customRangeBounds, RANGE_SCOPE_NOTE, CUSTOM_RANGE_YEARS } from '@aba/mock';
import { Calendar, fmtD } from './Calendar';

// 时间区间：今日 / 近7天 / 30天 / 自定义；选定自定义后在页面回显区间 + 可取消重选。
// 0614c：日历换成共用 Calendar（支持点标题选年 / 月下钻）。
// 0714：onChange 载荷补 start/end（预设按 今天-(days-1) 折算），days=0 表示「不限」（不带 start/end），供列表真过滤。
// 0813-2：区间口径定版——今日 = 00:00 至此刻；近 N 天 = 截至昨日的 N 个完整自然日（不含今日，
//   否则「未过完的今天」会把区间数拉低、与等长的对比区间不可比）。自定义同规则，且只允许近 3 年、结束日最晚昨日。

function presetRange(days: number, label: string): { days: number; label: string; start?: Date; end?: Date } {
  if (!days || days <= 0) return { days: 0, label }; // 「不限」档：不带起止，供列表真过滤（Orders / GlobalOrders 在用）
  if (days === 1) {
    // 今日：00:00 → 此刻（终点是真实当前时刻，不再是 23:59:59，才能与「昨日同已过时长」等长）
    const start = new Date(); start.setHours(0, 0, 0, 0);
    return { days, label, start, end: new Date() };
  }
  // 近 N 天：终点＝昨日 23:59:59.999，起点＝昨日往前第 (days-1) 天的 00:00
  const end = new Date(); end.setDate(end.getDate() - 1); end.setHours(23, 59, 59, 999);
  const start = new Date(end); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (days - 1));
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

  // 0813-2：自定义区间可选范围——结束日最晚昨日（今天 / 未来不可选），起始日最早近 3 年
  const bounds = customRangeBounds();

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
    // 自定义区间同样是完整自然日（日历已把今天及以后置灰），days 为真实天数，供各页按真实区间取数与算环比
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
        <Calendar start={start} end={end} onPick={pickDay} min={bounds.min} max={bounds.max} initialView={bounds.max} />
        <div className="cal-f">
          <span className="cal-range">
            {start ? fmtD(start) : '开始'} ~ {end ? fmtD(end) : '结束'}
          </span>
          <button className="btn btn-primary btn-sm" onClick={apply}>
            应用
          </button>
        </div>
        {/* 0813-2：口径脚注——不只是把今天禁掉，还要告诉用户今天的数去哪看，以及为什么只能选近 3 年 */}
        <span className="cal-note">
          区间按完整自然日统计，{RANGE_SCOPE_NOTE}；可选范围为近 {CUSTOM_RANGE_YEARS} 年。
        </span>
      </div>
    </div>
  );
}
