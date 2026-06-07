import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { EmptyState, TableSkeleton } from './States';

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
}: {
  columns: Col<T>[];
  rows: T[];
  empty?: { title: string; sub?: string; icon?: string };
  minWidth?: number;
}) {
  const [loading, setLoading] = useState(true);
  const [sortIdx, setSortIdx] = useState<number | null>(null);
  const [dir, setDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 360);
    return () => clearTimeout(t);
  }, []);

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
        <EmptyState icon={empty?.icon || 'i-search'} title={empty?.title || '没有匹配的结果'} sub={empty?.sub || '换个关键词或筛选条件试试'} />
      </div>
    );

  return (
    <div className="tbl-wrap">
      <table className="tbl" style={minWidth ? { minWidth } : undefined}>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th
                key={i}
                className={c.sortValue ? 'sortable' + (sortIdx === i ? ' ' + dir : '') : undefined}
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
          {sorted.map((row, ri) => (
            <tr key={ri}>
              {columns.map((c, ci) => (
                <td key={ci} className={c.className}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
