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

// 真实可输入的表单输入框（带光标）。
export function TextInput({
  defaultValue,
  placeholder,
  style,
  textarea,
}: {
  defaultValue?: string;
  placeholder?: string;
  style?: CSSProperties;
  textarea?: boolean;
}) {
  return (
    <div className="inp2" style={style}>
      {textarea ? (
        <textarea defaultValue={defaultValue} placeholder={placeholder} />
      ) : (
        <input defaultValue={defaultValue} placeholder={placeholder} />
      )}
    </div>
  );
}
