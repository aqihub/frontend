# AQI Dashboard

A real-time Air Quality Index (AQI) monitoring dashboard built with React, Vite, and Web3 integration. This application provides live air quality data visualization with interactive maps and blockchain-based NFT features.

## Features

- Real-time air quality monitoring with interactive maps
- Progressive Web App (PWA) support
- Web3 wallet integration with RainbowKit
- Time-based dark/light theme switching
- Location-based air quality data
- NFT minting for sensor data ownership
- Multiple environmental data layers (AQI, Temperature, Humidity, TVOC, eCO2, PM2.5)

## Prerequisites

Before installing, ensure you have the following installed on your system:

- **Node.js** (version 18.0.0 or higher)
- **npm** (version 8.0.0 or higher) or **yarn** (version 1.22.0 or higher)
- **Git** for cloning the repository

## Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd aqi-dashboard
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory and add the following environment variables:

```env
# WalletConnect Project ID (Required for Web3 functionality)
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# API Configuration (if needed)
VITE_API_BASE_URL=https://api.aqi.co.in

# Development Mode
NODE_ENV=development
```

**Note:** To get a WalletConnect Project ID:
1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy the Project ID to your `.env` file

### 4. Update Wagmi Configuration

Edit `src/config/wagmi.js` and replace `'YOUR_PROJECT_ID'` with your actual WalletConnect Project ID:

```javascript
export const config = getDefaultConfig({
  appName: 'AQI Dashboard',
  projectId: 'your_actual_project_id_here', // Replace with your Project ID
  chains: [
    // ... existing chains
  ],
});
```

## Development

### Start the Development Server

```bash
npm run dev
```

Or with yarn:
```bash
yarn dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint for code quality checks

## Build for Production

### 1. Create Production Build

```bash
npm run build
```

### 2. Preview Production Build

```bash
npm run preview
```

The built files will be in the `dist/` directory.

## Deployment

### Vercel (Recommended)

The project includes a `vercel.json` configuration file for easy deployment on Vercel:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Other Platforms

For other deployment platforms, build the project and serve the `dist/` directory as a static website.

## PWA Installation

Once deployed, users can install the app as a PWA:

1. Visit the deployed URL in a supported browser
2. Look for the "Install App" prompt or use the browser's install option
3. The app will be installed as a standalone application

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.jsx    # Main dashboard component
│   ├── Header.jsx       # App header with wallet connection
│   ├── MapComponent.jsx # Interactive map with sensor data
│   └── ChatBot.jsx      # AI chat assistance
├── config/             # Configuration files
│   ├── contract.js     # Smart contract configurations
│   └── wagmi.js        # Web3 wallet configuration
├── hooks/              # Custom React hooks
│   └── useTimeBasedTheme.js
├── App.jsx             # Main app component
├── main.jsx           # App entry point
└── index.css          # Global styles
```

## Dependencies Overview

### Core Dependencies
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Leaflet & React-Leaflet** - Interactive maps
- **Axios** - HTTP client for API requests

### Web3 Dependencies
- **Wagmi** - React hooks for Ethereum
- **RainbowKit** - Wallet connection UI
- **Viem** - TypeScript interface for Ethereum

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS & Autoprefixer** - CSS processing

### Additional Features
- **Date-fns** - Date manipulation
- **Lodash** - Utility functions
- **Vite PWA Plugin** - Progressive Web App support

## Troubleshooting

### Common Issues

1. **Node version compatibility**: Ensure you're using Node.js 18 or higher
2. **Permission errors**: Try clearing npm cache with `npm cache clean --force`
3. **Port already in use**: Change the port in `vite.config.js` or kill the process using port 5173
4. **Wallet connection issues**: Verify your WalletConnect Project ID is correctly set

### Location Services

The app requires location services to function properly:
- Ensure location permissions are granted in your browser
- For development, use HTTPS or localhost (HTTP may block geolocation)

## Support

If you encounter any issues during installation or setup, please check:
1. Node.js and npm versions meet requirements
2. All environment variables are correctly set
3. Dependencies are fully installed
4. No port conflicts exist

For additional help, refer to the project documentation or create an issue in the repository.