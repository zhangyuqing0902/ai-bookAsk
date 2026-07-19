import { type CSSProperties, useState } from 'react';
import { Icon } from '@aba/ui';

// 筛选/表单下拉：chevron 固定在框右侧（符合规范）；支持禁用项（灰色不可选）。
export function Dropdown({
  label,
  options,
  onSelect,
  disabledOptions = [],
  style,
  value,
  disabled,
}: {
  label: string;
  options: string[];
  onSelect?: (v: string) => void;
  disabledOptions?: string[];
  style?: CSSProperties;
  /** 0717 #8：受控显示值——传入后触发器始终回显该值(如「注册时间：2026-06-30」),覆盖内部选中态 */
  value?: string | null;
  /** 0717 #4：整体禁用(实时分享消费者只读)——置灰、cursor:not-allowed、不可展开 */
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState<string | null>(null);
  // 0609 (#6 通查)：筛选下拉默认显示「筛选条件名」(label)；选中具体值后显示该值并轻微高亮；
  // 选中重置项（全部 / 不限）等同未筛选，回到显示筛选条件名。
  const isReset = value != null ? false : val == null || val === '全部' || val === '不限' || val.startsWith('全部');
  const display = value != null ? value : isReset ? label : val;
  // 0714 #8：父机构选项标签化——调用方仍传纯字符串「XX（父机构）」（orgOptionLabel 产出），
  // 这里只在渲染层把「（父机构）」后缀替换成主题色 tag（与机构管理列表 OrgList 一致）；
  // key / on 比较 / onSelect 回传仍用完整字符串 o，兼容调用方的 orgOptionValue 剥离逻辑。
  const PARENT_SUFFIX = '（父机构）';
  // 0715 #5：用 inline-flex 容器包住裸名 + tag，让 tag 与文字几何垂直居中（原 verticalAlign 无法对齐）
  const renderOpt = (o: string) =>
    o.endsWith(PARENT_SUFFIX) ? (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {o.slice(0, -PARENT_SUFFIX.length)}
        <span className="tag-s tag-indigo" style={{ marginLeft: 6 }}>父机构</span>
      </span>
    ) : (
      o
    );
  return (
    <div style={{ position: 'relative', ...(style?.width ? { width: style.width } : {}) }}>
      <div
        className={'sel' + (isReset ? '' : ' sel-on') + (disabled ? ' sel-disabled' : '')}
        style={{ justifyContent: 'space-between', cursor: disabled ? 'not-allowed' : 'pointer', ...style }}
        onClick={() => { if (!disabled) setOpen((o) => !o); }}
      >
        <span>{isReset ? label : renderOpt(display as string)}</span>
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
                  {renderOpt(o)}
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
