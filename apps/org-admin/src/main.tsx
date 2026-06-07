import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import '../../../packages/tokens/src/design/styles.css';
import '../../../packages/tokens/src/design/proto-admin.css';
import '../../../packages/tokens/src/design/admin-app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
