import { useState } from 'react';
import { Icon } from '@aba/ui';

// 统一分页：后台默认每页 10 条，页数由 total/pageSize 自动计算；
// 页码窗口化展示（首页 … 当前页附近 … 尾页），避免页数过多时全部铺开溢出。
export function Pager({
  total,
  unit = '条',
  pageSize = 10,
  defaultPage = 1,
  page: pageProp,
  onPageChange,
}: {
  total: number;
  unit?: string;
  pageSize?: number;
  defaultPage?: number;
  /** 受控页码；与 onPageChange 配合，由 DataGrid 等外部驱动真实翻页 */
  page?: number;
  onPageChange?: (p: number) => void;
  /** @deprecated 页数已由 total/pageSize 自动计算，保留仅为兼容旧调用 */
  pages?: number;
}) {
  const [internal, setInternal] = useState(defaultPage);
  const page = pageProp ?? internal;
  const setPage = onPageChange ?? setInternal;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const go = (p: number) => setPage(Math.max(1, Math.min(pageCount, p)));

  // 窗口化：始终含首尾,中间围绕当前页 ±1,断档处用省略号
  const win = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const nums = [...win].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);
  const items: (number | '…')[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) items.push('…');
    items.push(n);
  });

  return (
    <div className="pager">
      <span>共 {total} {unit}</span>
      <span className="pg" onClick={() => go(page - 1)}>
        <Icon id="i-chevL" w={13} h={13} />
      </span>
      {items.map((it, i) =>
        it === '…' ? (
          <span key={'e' + i} className="pg-ellip">…</span>
        ) : (
          <span key={it} className={'pg' + (it === page ? ' on' : '')} onClick={() => go(it)}>
            {it}
          </span>
        ),
      )}
      <span className="pg" onClick={() => go(page + 1)}>
        <Icon id="i-chevR" w={13} h={13} />
      </span>
    </div>
  );
}
