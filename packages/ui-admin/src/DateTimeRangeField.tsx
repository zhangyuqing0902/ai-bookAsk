import { useState } from 'react';
import { Calendar, fmtD } from './Calendar';

// 服务有效期等「开始 ~ 截止」选择（0614c）：日历与主控台共用 Calendar（可点标题选年 / 月）；
// 默认仅年月日；withTime=true 时附时分秒。点字段弹面板，选好后「应用」回填。
const parse = (s?: string): { d: Date | null; t: string } => {
  if (!s) return { d: null, t: '00:00:00' };
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (m) return { d: new Date(+m[1], +m[2] - 1, +m[3]), t: `${m[4]}:${m[5]}:${m[6]}` };
  const md = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  return md ? { d: new Date(+md[1], +md[2] - 1, +md[3]), t: '00:00:00' } : { d: null, t: '00:00:00' };
};
const norm = (t: string) => (t.length === 5 ? t + ':00' : t); // HH:mm → HH:mm:ss

export function DateTimeRangeField({
  defaultStart,
  defaultEnd,
  withTime = false,
  onChange,
}: {
  defaultStart?: string;
  defaultEnd?: string;
  withTime?: boolean;
  /** 选好「应用」后回调（年月日字符串），供调用方做有效期校验等 */
  onChange?: (start: string, end: string) => void;
}) {
  const ps = parse(defaultStart);
  const pe = parse(defaultEnd);
  const fmtOne = (d: Date | null, t: string) => (d ? fmtD(d) + (withTime ? ' ' + t : '') : '');
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState<Date | null>(ps.d);
  const [end, setEnd] = useState<Date | null>(pe.d);
  const [st, setSt] = useState(ps.t);
  const [et, setEt] = useState(pe.t);
  const [val, setVal] = useState(() => (ps.d && pe.d ? `${fmtOne(ps.d, ps.t)} ~ ${fmtOne(pe.d, pe.t)}` : ''));

  const pick = (dt: Date) => {
    if (!start || end) {
      setStart(dt);
      setEnd(null);
    } else if (dt >= start) setEnd(dt);
    else setStart(dt);
  };
  const apply = () => {
    if (!start) return;
    const e = end || start;
    setEnd(e);
    setVal(`${fmtD(start)}${withTime ? ' ' + norm(st) : ''} ~ ${fmtD(e)}${withTime ? ' ' + norm(et) : ''}`);
    setOpen(false);
    onChange?.(fmtD(start), fmtD(e));
  };

  return (
    <div className="dtr">
      <div className="dt-input dtr-field" onClick={() => setOpen((o) => !o)}>
        {val || <span style={{ color: 'var(--ink-3)' }}>选择开始 ~ 截止{withTime ? '时间' : '日期'}</span>}
      </div>
      <div className={'dr-pop calpop dtr-pop' + (open ? ' show' : '')}>
        <Calendar start={start} end={end} onPick={pick} initialView={start} />
        {withTime && (
          <div className="dtr-times">
            <label>开始<input type="time" step={1} className="dt-input dtr-time" value={st} onChange={(e) => setSt(e.target.value)} /></label>
            <label>截止<input type="time" step={1} className="dt-input dtr-time" value={et} onChange={(e) => setEt(e.target.value)} /></label>
          </div>
        )}
        <div className="cal-f">
          <span className="cal-range">{start ? fmtD(start) : '开始'} ~ {end ? fmtD(end) : '结束'}</span>
          <button className="btn btn-primary btn-sm" onClick={apply}>应用</button>
        </div>
      </div>
    </div>
  );
}
