import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
// 顺序：tailwind 基础 → 设计令牌/组件 → 前台原型样式 → 手机舞台覆盖（后者覆盖前者）
import './index.css';
import '../../../packages/tokens/src/design/styles.css';
import '../../../packages/tokens/src/design/proto.css';
import '../../../packages/tokens/src/design/mobile-app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
