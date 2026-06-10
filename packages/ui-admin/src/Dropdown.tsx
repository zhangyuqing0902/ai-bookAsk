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
  // 0609 (#6 通查)：筛选下拉默认显示「筛选条件名」(label)；选中具体值后显示该值并轻微高亮；
  // 选中重置项（全部 / 不限）等同未筛选，回到显示筛选条件名。
  const isReset = val == null || val === '全部' || val === '不限' || val.startsWith('全部');
  const display = isReset ? label : val;
  return (
    <div style={{ position: 'relative', ...(style?.width ? { width: style.width } : {}) }}>
      <div className={'sel' + (isReset ? '' : ' sel-on')} style={{ justifyContent: 'space-between', cursor: 'pointer', ...style }} onClick={() => setOpen((o) => !o)}>
        <span>{display}</span>
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
