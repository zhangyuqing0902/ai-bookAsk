import type { CSSProperties } from 'react';
import { Icon } from '@aba/ui';

// 真实可输入的搜索框（带光标）。传 value/onChange 即为受控（可驱动列表过滤）。
export function Search({
  placeholder = '搜索',
  minWidth,
  value,
  onChange,
}: {
  placeholder?: string;
  minWidth?: number;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="search" style={minWidth ? { minWidth } : undefined}>
      <Icon id="i-search" />
      <input placeholder={placeholder} value={value} onChange={(e) => onChange?.(e.target.value)} />
    </div>
  );
}

// 真实可输入的表单输入框（带光标）。传 value/onChange 即为受控（用于唯一校验等）。
export function TextInput({
  defaultValue,
  value,
  onChange,
  placeholder,
  style,
  textarea,
  type,
  disabled,
}: {
  defaultValue?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  placeholder?: string;
  style?: CSSProperties;
  textarea?: boolean;
  type?: string; // 0615-3：支持 password 等
  disabled?: boolean;
}) {
  const controlled = value !== undefined ? { value, onChange: (e: { target: { value: string } }) => onChange?.(e) } : { defaultValue };
  // 0717 #4：禁用态外层同步挂 .disabled(灰底+cursor:not-allowed),供实时分享消费者只读表单使用
  return (
    <div className={'inp2' + (disabled ? ' disabled' : '')} style={style}>
      {textarea ? (
        <textarea placeholder={placeholder} disabled={disabled} {...(controlled as object)} />
      ) : (
        <input type={type} placeholder={placeholder} disabled={disabled} {...(controlled as object)} />
      )}
    </div>
  );
}

export function DomainInput({
  value,
  onChange,
  suffix,
  placeholder = '如 test',
  invalid = false,
}: {
  value: string;
  onChange: (value: string) => void;
  suffix: string;
  placeholder?: string;
  invalid?: boolean;
}) {
  return (
    <div className={'domain-input' + (invalid ? ' invalid' : '')}>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      <span className="domain-suffix">{suffix}</span>
    </div>
  );
}
