import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@aba/tokens/logo.svg': path.resolve(__dirname, '../../packages/tokens/src/logo.svg'),
      '@aba/tokens': path.resolve(__dirname, '../../packages/tokens/src/index.ts'),
      '@aba/mock': path.resolve(__dirname, '../../packages/mock/src/index.ts'),
      '@aba/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@aba/ui-admin': path.resolve(__dirname, '../../packages/ui-admin/src/index.ts'),
    },
  },
  server: { port: 5174, host: true },
});
