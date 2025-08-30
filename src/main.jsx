import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';
import '@rainbow-me/rainbowkit/styles.css';
import { registerSW } from 'virtual:pwa-register';
import { BrowserRouter as Router } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from './config/wagmi';

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

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <Router>
          <React.StrictMode>
            <App />
          </React.StrictMode>
        </Router>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
