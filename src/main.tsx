import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppStateProvider } from './state/AppState';
import App from './App';
import './styles.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </React.StrictMode>
);

