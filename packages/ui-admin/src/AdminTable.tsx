import { type ReactNode, useEffect, useRef, useState } from 'react';
import { TableSkeleton } from './States';

// 1:1 移植 proto-admin.js 的 autoSortable + sortTable（后台强制约束：时间/数字列自动加排序箭头）。
// 用法：<AdminTable><table className="tbl">…</table></AdminTable>（演示数据静态，DOM 重排安全）。
const KW = ['时间', '日期', '金额', '到期', '有效期', '价', '数量', '数', '响应', 'token', 'GMV', 'DAU', '永享', '购', '次数'];
const BLACK = ['号', 'ID', '码', '名称', '姓名', '微信', '手机', '链接', '操作', '状态', '权益', '类型', '机构', '用户'];

function autoSortable(root: HTMLElement) {
  root.querySelectorAll('table.tbl').forEach((table) => {
    const ths = [...table.querySelectorAll('thead th')] as HTMLElement[];
    const firstRow = table.querySelector('tbody tr') as HTMLTableRowElement | null;
    ths.forEach((th, i) => {
      if (th.classList.contains('sortable')) return;
      const t = th.textContent?.trim() || '';
      if (!t) return;
      if (BLACK.some((b) => t.includes(b))) return;
      let ok = KW.some((k) => t.includes(k));
      if (!ok && firstRow && firstRow.cells[i]) {
        const c = firstRow.cells[i].textContent?.trim() || '';
        if (/^\d{4}-\d{2}-\d{2}/.test(c) || /^[¥]?[\d,.]+[kKwWMs]?$/.test(c.replace(/\s/g, ''))) ok = true;
      }
      if (ok) {
        th.classList.add('sortable');
        th.insertAdjacentHTML('beforeend', '<span class="sort"><i class="up"></i><i class="dn"></i></span>');
      }
    });
  });
}

function sortTable(th: HTMLElement) {
  const table = th.closest('table') as HTMLTableElement;
  const tb = table.querySelector('tbody') as HTMLTableSectionElement;
  const idx = [...(th.parentElement as HTMLElement).children].indexOf(th);
  const cur = th.classList.contains('asc') ? 'asc' : th.classList.contains('desc') ? 'desc' : '';
  const dir = cur === 'asc' ? 'desc' : 'asc';
  table.querySelectorAll('th.sortable').forEach((h) => h.classList.remove('asc', 'desc'));
  th.classList.add(dir);
  const rows = [...tb.rows];
  const val = (tr: HTMLTableRowElement): number | string => {
    const raw = (tr.cells[idx] ? tr.cells[idx].textContent : '') || '';
    const t = raw.trim().replace(/[¥,kKwW\s]/g, '');
    const num = parseFloat(t);
    return isNaN(num) ? raw.trim() : num;
  };
  rows.sort((a, b) => {
    const x = val(a),
      y = val(b);
    if (typeof x === 'number' && typeof y === 'number') return dir === 'asc' ? x - y : y - x;
    return dir === 'asc' ? ('' + x).localeCompare('' + y) : ('' + y).localeCompare('' + x);
  });
  rows.forEach((r) => tb.appendChild(r));
}

export function AdminTable({
  children,
  className,
  cols = 5,
}: {
  children: ReactNode;
  className?: string;
  cols?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // 加载态：挂载时先显示骨架屏,短暂延时后再呈现真实表格（覆盖所有后台列表）
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!loading && ref.current) autoSortable(ref.current);
  }, [loading]);
  const onClick = (e: React.MouseEvent) => {
    const th = (e.target as HTMLElement).closest('th.sortable') as HTMLElement | null;
    if (th) sortTable(th);
  };
  if (loading) return <TableSkeleton rows={4} cols={cols} />;
  return (
    <div className={'tbl-wrap' + (className ? ' ' + className : '')} ref={ref} onClick={onClick}>
      {children}
    </div>
  );
}
