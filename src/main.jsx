import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { registerSW } from 'virtual:pwa-register';
import { BrowserRouter as Router } from 'react-router-dom';

// Register service worker
if ('serviceWorker' in navigator) {
  registerSW({
    onNeedRefresh() {
      // Handle PWA update notification if needed
    },
    onOfflineReady() {
      // Handle offline ready notification if needed
    },
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Router>
);
