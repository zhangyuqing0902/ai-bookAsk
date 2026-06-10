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
}: {
  defaultValue?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  placeholder?: string;
  style?: CSSProperties;
  textarea?: boolean;
}) {
  const controlled = value !== undefined ? { value, onChange: (e: { target: { value: string } }) => onChange?.(e) } : { defaultValue };
  return (
    <div className="inp2" style={style}>
      {textarea ? (
        <textarea placeholder={placeholder} {...(controlled as object)} />
      ) : (
        <input placeholder={placeholder} {...(controlled as object)} />
      )}
    </div>
  );
}
