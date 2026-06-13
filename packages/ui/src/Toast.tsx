import { useEffect, useState } from 'react';

// 与原型 .toast / .toast.show 同构：单条、底部弹出、2s 自动消失。
// 容器定位由 CSS 决定（前台 .toast=absolute 挂在手机框内；后台 .toast=fixed 挂在根部）。
let emit: ((msg: string, duration?: number) => void) | null = null;

/** 全局调用：toast('已复制')；可选 duration（毫秒）控制停留时长，默认 2000 */
export function toast(msg: string, duration = 2000) {
  emit?.(msg, duration);
}

export function ToastHost() {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    emit = (m: string, duration = 2000) => {
      setMsg(m);
      setShow(true);
      clearTimeout(t);
      t = setTimeout(() => setShow(false), duration);
    };
    return () => {
      emit = null;
      clearTimeout(t);
    };
  }, []);

  return <div className={'toast' + (show ? ' show' : '')}>{msg}</div>;
}
