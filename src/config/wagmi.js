import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
  avalancheFuji,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'AQI Dashboard',
  projectId: 'YOUR_PROJECT_ID', // Get this from WalletConnect Cloud
  chains: [
    avalancheFuji, // Default chain (first in array)
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    ...(process.env.NODE_ENV === 'development' ? [sepolia] : []),
  ],
  initialChain: avalancheFuji, // Explicitly set as initial chain
  ssr: false, // If your dApp uses server side rendering (SSR)
});
