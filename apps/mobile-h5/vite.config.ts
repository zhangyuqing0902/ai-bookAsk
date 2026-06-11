import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // 源码为 .tsx/.ts；src 下可能存在同名误编译 .js(已 gitignore)。
    // 必须让 TS 源优先于 .js 解析,否则 packages/* 组件改动不生效(Vite 默认 .js 排在 .tsx 前)。
    extensions: ['.tsx', '.ts', '.jsx', '.mjs', '.js', '.json'],
    alias: {
      '@aba/tokens/logo.svg': path.resolve(__dirname, '../../packages/tokens/src/logo.svg'),
      '@aba/tokens': path.resolve(__dirname, '../../packages/tokens/src/index.ts'),
      '@aba/mock': path.resolve(__dirname, '../../packages/mock/src/index.ts'),
      '@aba/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@aba/ui-mobile': path.resolve(__dirname, '../../packages/ui-mobile/src/index.ts'),
    },
  },
  server: { port: 5173, host: true },
});
