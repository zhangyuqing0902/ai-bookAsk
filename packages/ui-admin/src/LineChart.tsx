import { useEffect, useRef } from 'react';

// 1:1 移植 proto-admin.js drawLineChart：带 X/Y 轴 + hover 游标/数据点/tooltip（后台强制约束）。
export interface ChartSeries {
  name: string;
  color: string;
  values: number[];
  dash?: boolean;
}
export interface ChartCfg {
  x: string[];
  series: ChartSeries[];
  area?: boolean;
  unit?: string;
  h?: number;
}

function fmt(v: number) {
  if (Math.abs(v) >= 1000) return (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + 'k';
  return '' + Math.round(v);
}

function draw(el: HTMLElement, cfg: ChartCfg) {
  const W = 760,
    H = cfg.h || 200,
    pL = 48,
    pR = 18,
    pT = 14,
    pB = 26;
  const n = cfg.x.length,
    plotW = W - pL - pR,
    plotH = H - pT - pB,
    ticks = 4;
  let max = Math.max(...cfg.series.flatMap((s) => s.values), 1);
  const mag = Math.pow(10, Math.floor(Math.log10(max)));
  max = Math.ceil((max * 1.08) / mag) * mag;
  const xAt = (i: number) => pL + (n <= 1 ? 0 : (i * plotW) / (n - 1));
  const yAt = (v: number) => pT + plotH * (1 - v / max);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="none">`;
  for (let t = 0; t <= ticks; t++) {
    const v = (max * t) / ticks,
      y = yAt(v);
    s += `<line x1="${pL}" y1="${y}" x2="${W - pR}" y2="${y}" stroke="rgba(23,26,33,.07)"/><text x="${pL - 9}" y="${y + 3}" text-anchor="end" class="lc-yl">${fmt(v)}</text>`;
  }
  cfg.x.forEach((lb, i) => {
    s += `<text x="${xAt(i)}" y="${H - 7}" text-anchor="middle" class="lc-xl">${lb}</text>`;
  });
  s += `<line x1="${pL}" y1="${pT}" x2="${pL}" y2="${pT + plotH}" stroke="rgba(23,26,33,.2)"/><line x1="${pL}" y1="${pT + plotH}" x2="${W - pR}" y2="${pT + plotH}" stroke="rgba(23,26,33,.2)"/>`;
  cfg.series.forEach((ser, si) => {
    const pts = ser.values.map((v, i) => xAt(i) + ',' + yAt(v)).join(' ');
    if (cfg.area && si === 0)
      s += `<polygon points="${pts} ${xAt(n - 1)},${pT + plotH} ${xAt(0)},${pT + plotH}" fill="${ser.color}" fill-opacity=".13"/>`;
    s += `<polyline points="${pts}" fill="none" stroke="${ser.color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"${ser.dash ? ' stroke-dasharray="2 5"' : ''}/>`;
  });
  s += `<line class="lc-guide" x1="0" y1="${pT}" x2="0" y2="${pT + plotH}" stroke="#4B57E8" stroke-opacity=".45" style="display:none"/>`;
  cfg.series.forEach(
    (ser, si) =>
      (s += `<circle class="lc-dot d${si}" r="4.5" fill="#fff" stroke="${ser.color}" stroke-width="2.5" style="display:none"/>`),
  );
  s += `</svg>`;
  el.innerHTML = s + `<div class="lc-tip" style="display:none"></div>`;
  const svg = el.querySelector('svg') as SVGSVGElement;
  const guide = el.querySelector('.lc-guide') as SVGLineElement;
  const tip = el.querySelector('.lc-tip') as HTMLDivElement;
  const dots = [...el.querySelectorAll('.lc-dot')] as SVGCircleElement[];
  function hide() {
    guide.style.display = 'none';
    dots.forEach((d) => (d.style.display = 'none'));
    tip.style.display = 'none';
  }
  svg.addEventListener('mousemove', (ev) => {
    const r = svg.getBoundingClientRect();
    const xi = ((ev.clientX - r.left) / r.width) * W;
    if (xi < pL - 6 || xi > W - pR + 6) {
      hide();
      return;
    }
    let i = Math.round((xi - pL) / (plotW / (n - 1)));
    i = Math.max(0, Math.min(n - 1, i));
    const gx = xAt(i);
    guide.setAttribute('x1', '' + gx);
    guide.setAttribute('x2', '' + gx);
    guide.style.display = '';
    dots.forEach((d, si) => {
      d.setAttribute('cx', '' + gx);
      d.setAttribute('cy', '' + yAt(cfg.series[si].values[i]));
      d.style.display = '';
    });
    tip.style.display = '';
    tip.style.left = (gx / W) * 100 + '%';
    tip.innerHTML =
      `<div class="lc-tip-x">${cfg.x[i]}</div>` +
      cfg.series
        .map(
          (se) =>
            `<div class="lc-tip-r"><i style="background:${se.color}"></i>${se.name}<b>${cfg.unit || ''}${se.values[i].toLocaleString()}</b></div>`,
        )
        .join('');
  });
  svg.addEventListener('mouseleave', hide);
}

export function LineChart({ cfg, className }: { cfg: ChartCfg; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) draw(ref.current, cfg);
  }, [JSON.stringify(cfg)]);
  return <div className={'chart' + (className ? ' ' + className : '')} ref={ref} />;
}
