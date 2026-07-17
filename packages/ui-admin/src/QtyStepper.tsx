import type { CSSProperties } from 'react';

// 0715 #8：数字步进器——左「−」/ 中间可直接输入 / 右「+」/ 右侧单位。
// 用于新建订阅额度与加油包加量额度（KP / 存储 / Token）。
// 禁用态（如套餐「不限版」）显示静态「不限」，不可编辑、不出加减按钮。
export function QtyStepper({
  value,
  onChange,
  min = 0,
  step = 1,
  unit,
  disabled = false,
  style,
}: {
  /** 当前值（受控，字符串以贴合额度字段既有类型） */
  value: string;
  /** 值变化回调（返回字符串，可直接接原 setState / editQuota） */
  onChange: (v: string) => void;
  /** 最小值，默认 0 */
  min?: number;
  /** 步长，默认 1 */
  step?: number;
  /** 右侧单位文字（个 / GB / 亿） */
  unit?: string;
  /** 禁用态：显静态「不限」不可编辑 */
  disabled?: boolean;
  style?: CSSProperties;
}) {
  // 禁用态：静态「不限」+ 单位，不可交互
  if (disabled) {
    return (
      <span className="qty-stepper qty-stepper--off" style={style}>
        <span className="qty-static">不限</span>
        {unit && <span className="qty-unit">{unit}</span>}
      </span>
    );
  }
  const num = parseFloat(value) || 0;
  const atMin = num <= min;
  // 数字步进：夹到 min 之上；小数场景保留精度（求和后可能出现浮点尾差，此处直接取整步长）
  const bump = (delta: number) => onChange(String(Math.max(min, num + delta)));
  return (
    <span className="qty-stepper" style={style}>
      <button type="button" className="qty-btn" aria-label="减少" disabled={atMin} onClick={() => bump(-step)}>
        −
      </button>
      <input
        className="qty-input"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="button" className="qty-btn" aria-label="增加" onClick={() => bump(step)}>
        +
      </button>
      {unit && <span className="qty-unit">{unit}</span>}
    </span>
  );
}
