import { type ReactNode } from 'react';
import { ToastHost } from '@aba/ui';
import { StatusBar } from './StatusBar';

// 手机外框（桌面居中 375×812；窄屏自动整屏，见 design/mobile-app.css）。
// 状态条与 Toast 常驻；页面只渲染各自屏幕（.h5 / .lg / .pg + 浮层）。
export function PhoneStage({ children }: { children: ReactNode }) {
  return (
    <div className="h5-stage">
      <div className="phone">
        <div className="notch" />
        <div className="phone-screen">
          <StatusBar />
          {children}
          <ToastHost />
        </div>
      </div>
    </div>
  );
}
