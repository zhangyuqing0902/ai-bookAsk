import { useState } from 'react';
import { Icon } from '@aba/ui';

// 统一分页：总数 + 左右切换 + 页码 + 当前页高亮（以知识产品 KP 为基准样式）。
export function Pager({
  total,
  unit = '条',
  pages = 1,
  defaultPage = 1,
}: {
  total: number;
  unit?: string;
  pages?: number;
  defaultPage?: number;
}) {
  const [page, setPage] = useState(defaultPage);
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  return (
    <div className="pager">
      <span>共 {total} {unit}</span>
      <span className="pg" onClick={() => setPage((p) => Math.max(1, p - 1))}>
        <Icon id="i-chevL" w={13} h={13} />
      </span>
      {nums.map((n) => (
        <span key={n} className={'pg' + (n === page ? ' on' : '')} onClick={() => setPage(n)}>
          {n}
        </span>
      ))}
      <span className="pg" onClick={() => setPage((p) => Math.min(pages, p + 1))}>
        <Icon id="i-chevR" w={13} h={13} />
      </span>
    </div>
  );
}
