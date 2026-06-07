import type { CSSProperties } from 'react';

/** 引用雪碧中的某个 symbol。w/h 可省略（由 CSS 控制），与原型 `<svg><use href="#id"/></svg>` 同构。 */
export function Icon({
  id,
  w,
  h,
  className,
  style,
}: {
  id: string;
  w?: number | string;
  h?: number | string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg width={w} height={h} className={className} style={style} aria-hidden>
      <use href={`#${id}`} />
    </svg>
  );
}
