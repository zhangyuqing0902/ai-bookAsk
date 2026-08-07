import { type CSSProperties, useState } from 'react';
import { Icon, toast } from '@aba/ui';

// 0806：多选下拉（主控台 / 数据看板「机构」多选筛选用）。
// 0806-2 视觉重做：对齐 Dropdown 体系——白底浮层 + .dd-opt 行 + 自绘勾选框（选中靛蓝底白勾）；
// 选项支持「（父机构）」后缀 → 渲染为靛蓝小标（与 Dropdown 同约定，value 回传剥后缀的纯名）；
// 触发器回填选中项名称（全选＝「全部机构」，部分＝顿号拼接、超宽省略号）。
// 0806-3 视觉美化：选项行不再整行铺靛蓝底（全选时整片蓝太重），改为白底行 + 左侧勾选框表达选中，
// hover 浅灰底；触发器展开时靛蓝描边 + 淡蓝光圈、箭头翻转；浮层加滚动上限与淡入动画。
// 交互逻辑不变：至少保留一项（取消最后一项时 toast 拦截），避免空集导致指标全 0 的无意义状态。
const PARENT_SUFFIX = '（父机构）';
const strip = (o: string) => (o.endsWith(PARENT_SUFFIX) ? o.slice(0, -PARENT_SUFFIX.length) : o);

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  style,
  allLabel = '全部机构',
}: {
  label: string;
  /** 选项显示名；「XX（父机构）」后缀会渲染成靛蓝标，onChange 回传剥后缀的纯名 */
  options: string[];
  /** 选中值（纯名，不含「（父机构）」后缀） */
  value: string[];
  onChange: (v: string[]) => void;
  style?: CSSProperties;
  /** 全选快捷项文案 + 全选时触发器回填文案 */
  allLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const names = options.map(strip);
  const allChecked = value.length === names.length;
  const display = allChecked ? allLabel : value.join('、');
  const toggle = (name: string) => {
    if (value.includes(name)) {
      if (value.length === 1) {
        toast('至少选择一家机构');
        return;
      }
      onChange(value.filter((v) => v !== name));
    } else {
      onChange(names.filter((n) => value.includes(n) || n === name)); // 保持 options 原始顺序
    }
  };
  // 自绘勾选框：选中＝靛蓝底白勾；未选＝描边空框（与后台协议勾选框同语言）
  const CheckBox = ({ on }: { on: boolean }) => (
    <span className={'ms-box' + (on ? ' on' : '')}>{on && <Icon id="i-check" w={10} h={10} />}</span>
  );
  const renderOpt = (o: string) =>
    o.endsWith(PARENT_SUFFIX) ? (
      <span className="ms-name">
        {strip(o)}
        <span className="tag-s tag-indigo ms-tag">父机构</span>
      </span>
    ) : (
      <span className="ms-name">{o}</span>
    );
  return (
    <div style={{ position: 'relative', ...(style?.width ? { width: style.width } : {}) }}>
      <div
        className={'sel ms-trigger' + (open ? ' ms-open' : '') + (allChecked ? '' : ' sel-on')}
        style={{ justifyContent: 'space-between', cursor: 'pointer', ...style }}
        onClick={() => setOpen((o) => !o)}
      >
        {/* 回填选中项：flex 收缩 + 省略号，超宽不撑破触发器 */}
        <span className="ms-display" title={`${label}：${display}`}>{display}</span>
        <span className="ms-chev">
          <Icon id="i-chevD" />
        </span>
      </div>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div className="ms-panel">
            <div className={'ms-opt ms-all' + (allChecked ? ' on' : '')} onClick={() => onChange(allChecked ? [names[0]] : [...names])}>
              <CheckBox on={allChecked} />
              <span className="ms-name">{allLabel}</span>
            </div>
            <div className="ms-divider" />
            {options.map((o) => {
              const name = strip(o);
              const on = value.includes(name);
              return (
                <div key={o} className={'ms-opt' + (on ? ' on' : '')} onClick={() => toggle(name)}>
                  <CheckBox on={on} />
                  {renderOpt(o)}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
