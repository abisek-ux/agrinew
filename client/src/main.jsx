import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Clear any legacy PWA caches from previous versions
if ('caches' in window) {
  caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key.startsWith('agrilink-pwa-v1') || key.startsWith('agrilink-pwa-v2')) {
        caches.delete(key);
      }
    });
  });
}

// Register Service Worker for PWA Mobile App Support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        reg.update();
        console.log('📱 AgriLink PWA Service Worker Registered:', reg.scope);
      })
      .catch((err) => console.warn('PWA Service Worker registration error:', err));
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
