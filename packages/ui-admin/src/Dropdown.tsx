import { type CSSProperties, useState } from 'react';
import { Icon } from '@aba/ui';

// 筛选/表单下拉：chevron 固定在框右侧（符合规范）；支持禁用项（灰色不可选）。
export function Dropdown({
  label,
  options,
  onSelect,
  disabledOptions = [],
  style,
}: {
  label: string;
  options: string[];
  onSelect?: (v: string) => void;
  disabledOptions?: string[];
  style?: CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState<string | null>(null);
  return (
    <div style={{ position: 'relative', ...(style?.width ? { width: style.width } : {}) }}>
      <div className="sel" style={{ justifyContent: 'space-between', cursor: 'pointer', ...style }} onClick={() => setOpen((o) => !o)}>
        <span>{val || label}</span>
        <Icon id="i-chevD" />
      </div>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              minWidth: 148,
              zIndex: 50,
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 10,
              boxShadow: 'var(--sh-md)',
              padding: 6,
            }}
          >
            {options.map((o) => {
              const dis = disabledOptions.includes(o);
              return (
                <div
                  key={o}
                  className={'dd-opt' + (val === o ? ' on' : '') + (dis ? ' disabled' : '')}
                  onClick={() => {
                    if (dis) return;
                    setVal(o);
                    setOpen(false);
                    onSelect?.(o);
                  }}
                >
                  {o}
                  {dis && <span style={{ fontSize: 11, marginLeft: 6 }}>· 暂未开放</span>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
