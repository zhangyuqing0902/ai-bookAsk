import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { EmptyState, TableSkeleton } from './States';
import { Pager } from './Pager';

// 数据驱动表格：列头排序（带箭头）、挂载骨架屏、无数据空态。
// 搜索 / 下拉筛选在页面侧维护状态并把已过滤的 rows 传进来,排序由本组件负责（避免 DOM 与 React 冲突）。
export interface Col<T> {
  header: string;
  cell: (row: T) => ReactNode;
  /** 提供则该列可排序（返回用于比较的值） */
  sortValue?: (row: T) => string | number;
  className?: string;
}

export function DataGrid<T,>({
  columns,
  rows,
  empty,
  minWidth,
  pageSize = 10,
  pageUnit = '条',
}: {
  columns: Col<T>[];
  rows: T[];
  empty?: { title: string; sub?: string; icon?: string; illust?: ReactNode };
  minWidth?: number;
  /** 每页最多展示条数，默认 10；超出才分页，未超出不显示分页器 */
  pageSize?: number;
  /** 分页器“共 N __”的单位 */
  pageUnit?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [sortIdx, setSortIdx] = useState<number | null>(null);
  const [dir, setDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 360);
    return () => clearTimeout(t);
  }, []);

  // 行数变化（搜索/筛选）时回到第 1 页
  useEffect(() => {
    setPage(1);
  }, [rows.length]);

  const sorted = useMemo(() => {
    if (sortIdx == null || !columns[sortIdx]?.sortValue) return rows;
    const sv = columns[sortIdx].sortValue!;
    return [...rows].sort((a, b) => {
      const x = sv(a),
        y = sv(b);
      if (typeof x === 'number' && typeof y === 'number') return dir === 'asc' ? x - y : y - x;
      return dir === 'asc' ? ('' + x).localeCompare('' + y) : ('' + y).localeCompare('' + x);
    });
  }, [rows, sortIdx, dir, columns]);

  const clickSort = (i: number) => {
    if (!columns[i].sortValue) return;
    if (sortIdx === i) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortIdx(i);
      setDir('asc');
    }
  };

  if (loading) return <TableSkeleton rows={4} cols={columns.length} />;
  if (rows.length === 0)
    return (
      <div className="tbl-wrap">
        <EmptyState icon={empty?.icon || 'i-search'} illust={empty?.illust} title={empty?.title || '没有匹配的结果'} sub={empty?.sub || '换个关键词或筛选条件试试'} />
      </div>
    );

  // 真分页：超过 pageSize 才切页并显示分页器；当前页越界时夹到末页
  const paged = sorted.length > pageSize;
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const curPage = Math.min(page, pageCount);
  const visible = paged ? sorted.slice((curPage - 1) * pageSize, curPage * pageSize) : sorted;
  // 0613：操作列固定右侧——识别 header 为「操作」的列，给其 th/td 加 sticky 类
  const opIdx = columns.findIndex((c) => c.header === '操作');

  return (
    <>
      <div className="tbl-wrap">
        <table className="tbl" style={minWidth ? { minWidth } : undefined}>
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th
                  key={i}
                  className={[c.sortValue ? 'sortable' + (sortIdx === i ? ' ' + dir : '') : '', i === opIdx ? 'dg-op' : ''].filter(Boolean).join(' ') || undefined}
                  onClick={() => clickSort(i)}
                >
                  {c.header}
                  {c.sortValue && (
                    <span className="sort">
                      <i className="up" />
                      <i className="dn" />
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, ri) => (
              <tr key={ri}>
                {columns.map((c, ci) => (
                  <td key={ci} className={[c.className || '', ci === opIdx ? 'dg-op' : ''].filter(Boolean).join(' ') || undefined}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paged && (
        <Pager total={sorted.length} unit={pageUnit} pageSize={pageSize} page={curPage} onPageChange={setPage} />
      )}
    </>
  );
}
