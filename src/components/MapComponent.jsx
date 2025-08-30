import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import ChatBot from './ChatBot';
import PincodeInput from './PincodeInput';

// Add this before the component to fix pointer events
if (L.Browser.pointer) {
  L.Browser.touch = false; // Disable touch detection
  L.Browser.pointer = true; // Enable pointer detection
}

// Update the location icon definition
const locationIcon = L.divIcon({
  className: 'location-pulse-marker',
  html: '<div class="pulse-circle"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Update the marker style - remove animation
const markerStyle = `
  .custom-location-marker {
    width: 30px !important;
    height: 30px !important;
  }

  .marker-pin {
    width: 30px;
    height: 30px;
    border-radius: 50% 50% 50% 0;
    background: #3b82f6;
    position: absolute;
    transform: rotate(-45deg);
    left: 50%;
    top: 50%;
    margin: -15px 0 0 -15px;
  }

  .marker-pin-inner {
    background: #fff;
    width: 14px;
    height: 14px;
    margin: 8px 0 0 8px;
    position: absolute;
    border-radius: 50%;
  }
`;

// Update the sensor marker icon (red pin for API locations)
const sensorIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <filter id="shadow">
        <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
      </filter>
      <path fill="#ef4444" stroke="#ffffff" stroke-width="2" d="M16 2C10.477 2 6 6.477 6 12c0 7 10 18 10 18s10-11 10-18c0-5.523-4.477-10-10-10z" filter="url(#shadow)"/>
      <circle cx="16" cy="12" r="4" fill="#ffffff"/>
    </svg>
  `)}`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: 'sensor-marker'
});

// Update the loading spinner for a more polished look
const LoadingSpinner = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-6">
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
        Detecting your location...
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Please allow location access for better accuracy
      </p>
    </div>
  </div>
);

// Update the error states with better styling
const ErrorState = ({ message, type = 'error' }) => (
  <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <div className="text-center max-w-md px-6">
      <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
        type === 'warning' ? 'bg-yellow-100 text-yellow-500' : 'bg-red-100 text-red-500'
      }`}>
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d={type === 'warning' 
              ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            }
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
        {type === 'warning' ? 'Location Access Required' : 'Error'}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {message}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg transition-colors duration-200 flex items-center justify-center mx-auto space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Try Again</span>
      </button>
    </div>
  </div>
);

// Update the error states with better styling
const PermissionRequest = ({ onRetry }) => (
  <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <div className="text-center max-w-md mx-auto px-6">
      <div className="w-16 h-16 mx-auto mb-6 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
        Location Access Required
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        This app needs access to your location to show air quality data in your area. 
        Please enable location services to continue.
      </p>
      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
          <span>Enable Location Access</span>
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You can enable location access in your browser settings
        </p>
      </div>
    </div>
  </div>
);

// Add this component definition after other imports
const LocationController = ({ userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 11, {
        animate: true,
        duration: 1.5
      });
    }
  }, [map, userLocation]);

  return null;
};

// Add this function near the top with other utility functions
const getAQIColor = (aqi) => {
  if (!aqi) return "bg-gray-400";
  if (aqi <= 50) return "bg-green-500";
  if (aqi <= 100) return "bg-yellow-500";
  if (aqi <= 150) return "bg-orange-500";
  if (aqi <= 200) return "bg-red-500";
  if (aqi <= 300) return "bg-purple-500";
  return "bg-[#7e0023]";
};

// Add this utility function at the top with other utility functions
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// Add this function to find the nearest sensor
const findNearestSensor = (userLocation, sensors) => {
  if (!userLocation || !sensors || sensors.length === 0) return null;
  
  return sensors.reduce((nearest, sensor) => {
    const distance = calculateDistance(
      userLocation[0],
      userLocation[1],
      sensor.gps_lat,
      sensor.gps_lng
    );
    
    if (!nearest || distance < nearest.distance) {
      return { sensor, distance };
    }
    return nearest;
  }, null)?.sensor;
};

// Update the getRelativeTime function to remove console.log
const getRelativeTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const currentEpoch = Math.floor(Date.now() / 1000);
  const diffInSeconds = currentEpoch - timestamp;
  
  // Handle future timestamps
  if (diffInSeconds < 0) return 'just now';
  
  // Define time intervals for exact calculations
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}${minutes === 1 ? 'm' : 'ms'} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}${hours === 1 ? 'h' : 'hs'} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}${days === 1 ? 'd' : 'ds'} ago`;
  }
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks}${weeks === 1 ? 'w' : 'ws'} ago`;
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months}${months === 1 ? 'mo' : 'mos'} ago`;
  }
  
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years}${years === 1 ? 'y' : 'ys'} ago`;
};

// Update the isDataLive function to remove console.log
const isDataLive = (timestamp) => {
  if (!timestamp) return false;
  
  const currentEpoch = Math.floor(Date.now() / 1000);
  const diffInSeconds = currentEpoch - timestamp;
  
  return diffInSeconds <= 600; // 10 minutes = 600 seconds
};

// Update the CustomMarker component to use the red sensor icon
const CustomMarker = ({ position, activeLayers, sensorData, isDarkMode }) => {
  if (!Array.isArray(sensorData) || sensorData.length === 0) return null;

  return (
    <>
      {sensorData.map((sensor, index) => {
        if (!sensor?.gps_lat || !sensor?.gps_lng) return null;
        
        return (
          <Marker
            key={`sensor-${index}-${sensor.gps_lat}-${sensor.gps_lng}`}
            position={[sensor.gps_lat, sensor.gps_lng]}
            icon={sensorIcon} // Use the red sensor icon
            eventHandlers={{
              mouseover: (e) => {
                e.target.openPopup();
              }
            }}
          >
            <Popup className="rounded-xl" maxWidth="350" closeButton={false}>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                {/* Status Section */}
                <div className={`mb-4 px-3 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'
                } border ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isDataLive(sensor?.timestamp) ? (
                        <>
                          <div className="relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75"></div>
                          </div>
                          <span className={`text-xs font-medium ${
                            isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`}>
                            Live Data
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
                          <span className={`text-xs font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Offline
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                      </svg>
                      <span className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Updated {getRelativeTime(sensor?.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Sensor Data
                </h3>
                
                {/* AQI Display */}
                {activeLayers.aqi && (
                  <div className={`px-4 py-3 rounded-lg text-white mb-4 transition-all duration-200 ${getAQIColor(sensor?.aqi)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium opacity-90">Air Quality Index</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-black/20">
                        {getAQILabel(sensor?.aqi)}
                      </span>
                    </div>
                    <div className="text-3xl font-bold tracking-tight">
                      {sensor?.aqi || '0'}
                    </div>
                  </div>
                )}

                {/* Sensor Readings Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Temperature */}
                  {activeLayers.temperature && (
                    <div className="bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-900/20 dark:to-rose-900/20 p-3 rounded-lg hover:shadow-md transition-all duration-200">
                      <div className="flex items-center mb-1">
                        <svg className="w-4 h-4 mr-1 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <div className="text-orange-600 dark:text-orange-400 text-sm font-medium">Temperature</div>
                      </div>
                      <div className="font-bold text-orange-700 dark:text-orange-300 text-lg">
                        {sensor?.temp_cel?.toFixed(1) || '--'}°C
                      </div>
                    </div>
                  )}

                  {/* Humidity */}
                  {activeLayers.humidity && (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-3 rounded-lg hover:shadow-md transition-all duration-200">
                      <div className="flex items-center mb-1">
                        <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">Humidity</div>
                      </div>
                      <div className="font-bold text-blue-700 dark:text-blue-300 text-lg">
                        {sensor?.humidity || '--'}%
                      </div>
                    </div>
                  )}

                  {/* PM2.5 */}
                  {activeLayers.pm25 && (
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-3 rounded-lg hover:shadow-md transition-all duration-200">
                      <div className="flex items-center mb-1">
                        <svg className="w-4 h-4 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div className="text-purple-600 dark:text-purple-400 text-sm font-medium">PM2.5</div>
                      </div>
                      <div className="font-bold text-purple-700 dark:text-purple-300 text-lg">
                        {sensor?.pm2_mgm3?.toFixed(1) || '--'} <span className="text-sm">µg/m³</span>
                      </div>
                    </div>
                  )}

                  {/* TVOC */}
                  {activeLayers.tvoc && (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-3 rounded-lg hover:shadow-md transition-all duration-200">
                      <div className="flex items-center mb-1">
                        <svg className="w-4 h-4 mr-1 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <div className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">TVOC</div>
                      </div>
                      <div className="font-bold text-emerald-700 dark:text-emerald-300 text-lg">
                        {sensor?.tvoc_ppb || '--'} <span className="text-sm">ppb</span>
                      </div>
                    </div>
                  )}

                  {/* eCO2 */}
                  {activeLayers.eco2 && (
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-3 rounded-lg hover:shadow-md transition-all duration-200">
                      <div className="flex items-center mb-1">
                        <svg className="w-4 h-4 mr-1 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <div className="text-amber-600 dark:text-amber-400 text-sm font-medium">eCO2</div>
                      </div>
                      <div className="font-bold text-amber-700 dark:text-amber-300 text-lg">
                        {sensor?.eco2_ppm || '--'} <span className="text-sm">ppm</span>
                      </div>
                    </div>
                  )}

                  {/* PM/P0 Ratio */}
                  {activeLayers.rsR0 && (
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-3 rounded-lg hover:shadow-md transition-all duration-200">
                      <div className="flex items-center mb-1">
                        <svg className="w-4 h-4 mr-1 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <div className="text-pink-600 dark:text-pink-400 text-sm font-medium">PM/P0 Ratio</div>
                      </div>
                      <div className="font-bold text-pink-700 dark:text-pink-300 text-lg">
                        {sensor?.gas_rsr0?.toFixed(6) || '--'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Location Info */}
                {activeLayers.coordinates && (
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400 block mb-1">Latitude</span>
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          {sensor.gps_lat.toFixed(6)}°N
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400 block mb-1">Longitude</span>
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          {sensor.gps_lng.toFixed(6)}°E
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

// Update the initial map options
const mapOptions = {
  preferCanvas: true,
  tap: false,
  dragging: true,
  touchZoom: true,
  doubleClickZoom: true,
  scrollWheelZoom: true,
  attributionControl: true,
  zoomControl: true,
  zoomAnimation: true,
  fadeAnimation: true,
  minZoom: 2, // Add minimum zoom level
  maxZoom: 18,
  worldCopyJump: true // Enable world copy for continuous scrolling
};

// Add this new component for the location prompt popup
const LocationPrompt = ({ isDarkMode }) => (
  <div className={`fixed inset-0 flex items-center justify-center p-4 ${
    isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'
  }`}>
    <div className={`max-w-md p-6 rounded-xl shadow-2xl ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    } border ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className="text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'
        }`}>
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
        </div>
        <h2 className={`text-xl font-semibold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Enable Location Services
        </h2>
        <p className={`mb-4 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Please enable location services to view air quality data in your area.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center mx-auto space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          <span>Try Again</span>
        </button>
      </div>
    </div>
  </div>
);

const MapComponent = ({ activeLayers, isDarkMode }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sensorData, setSensorData] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPincodeInput, setShowPincodeInput] = useState(false);

  // Update the location handling useEffect
  useEffect(() => {
    const getLocation = () => {
      setIsLoading(true);
      setLocationError(null);

      if (!navigator.geolocation) {
        setShowPincodeInput(true);
        setIsLoading(false);
        return;
      }

      // First check if permission is already denied
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' }).then(result => {
          if (result.state === 'denied') {
            setShowPincodeInput(true);
            setIsLoading(false);
            return;
          }

          // If not denied, try to get location
          requestLocation();
        });
      } else {
        // Fallback for browsers that don't support permissions API
        requestLocation();
      }
    };

    const requestLocation = () => {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setIsLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Show pincode input when permission is denied or any other error occurs
          setShowPincodeInput(true);
          setIsLoading(false);
        },
        options
      );
    };

    getLocation();
  }, []);

  // Update the sensor data fetching useEffect
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };

        const response = await axios.get('/api/select', { headers });
        const collections = response?.data?.data?.collections;
        
        if (collections) {
          const results = await Promise.all(
            collections.map(collection => 
              axios.get(`/api/select?document_id=${collection?.collection_data?.latest_document}`, { headers })
            )
          );

          const sensorDataResults = results
            .map(res => res.data.data)
            .filter(data => data?.gps_lat && data?.gps_lng);

          setSensorData(sensorDataResults);
        }
      } catch (err) {
        console.error('Error fetching sensor data:', err.response || err);
      }
    };

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 5 * 60 * 1000); // Fetch every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const handleRetryLocation = () => {
    setIsLoading(true);
    setLocationError(null);
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'prompt' || result.state === 'granted') {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation([latitude, longitude]);
              setIsLoading(false);
            },
            (error) => {
              console.error('Geolocation error:', error);
              setLocationError('location-permission');
              setIsLoading(false);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        } else {
          setLocationError('location-permission');
          setIsLoading(false);
        }
      });
    } else {
      // Fallback for browsers that don't support permissions API
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setIsLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('location-permission');
          setIsLoading(false);
        }
      );
    }
  };

  const handlePincodeSubmit = (location) => {
    setUserLocation(location);
    setShowPincodeInput(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (showPincodeInput) {
    return <PincodeInput onPincodeSubmit={handlePincodeSubmit} isDarkMode={isDarkMode} />;
  }

  if (locationError) {
    return (
      <ErrorState 
        message={locationError}
        type="error"
      />
    );
  }

  if (!userLocation) {
    return <PermissionRequest onRetry={handleRetryLocation} />;
  }

  // If no location is available, show the prompt
  if (!userLocation && !isLoading && !locationError) {
    return <LocationPrompt isDarkMode={isDarkMode} />;
  }

  return (
    <div className="h-screen w-screen relative">
      <style>{markerStyle}</style>

      {userLocation ? (
        <MapContainer
          {...mapOptions}
          center={userLocation}
          zoom={11}
          className="w-full h-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Add a dark overlay for dark mode */}
          {isDarkMode && (
            <div 
              className="absolute inset-0 bg-gray-900 pointer-events-none" 
              style={{ mixBlendMode: 'multiply', opacity: 0.7 }}
            />
          )}

          {userLocation && (
            <>
              <LocationController userLocation={userLocation} />
              <Circle
                center={userLocation}
                radius={100}
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.2,
                  weight: 2
                }}
              />
              <Circle
                center={userLocation}
                radius={1000}
                pathOptions={{
                  fillColor: '#3b82f6',
                  fillOpacity: 0.05,
                  color: '#3b82f6',
                  weight: 1,
                  dashArray: '5, 5'
                }}
              />
              <Marker 
                position={userLocation}
                icon={locationIcon}
                zIndexOffset={1000}
              />
              
              {/* Pass sensorData to CustomMarker */}
              <CustomMarker 
                position={userLocation} 
                activeLayers={activeLayers} 
                sensorData={sensorData}
                isDarkMode={isDarkMode}
              />
            </>
          )}
        </MapContainer>
      ) : (
        <LocationPrompt isDarkMode={isDarkMode} />
      )}

      {/* Fixed Position Buttons */}
      <div className="fixed-buttons">
        {/* Chat Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`rounded-lg ${
            isDarkMode 
              ? 'bg-gray-800 hover:bg-gray-700' 
              : 'bg-white hover:bg-gray-100'
          } text-blue-500`}
          title="Chat with AI"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>

        {/* Location Button */}
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const newLocation = [position.coords.latitude, position.coords.longitude];
                  setUserLocation(newLocation);
                  const map = document.querySelector('.leaflet-container')?._leaflet_map;
                  if (map) {
                    map.flyTo(newLocation, 11, {
                      animate: true,
                      duration: 1.5
                    });
                  }
                },
                (error) => {
                  setLocationError('Unable to get your location. Please enable location services.');
                },
                {
                  enableHighAccuracy: true,
                  timeout: 5000,
                  maximumAge: 0
                }
              );
            }
          }}
          className={`rounded-lg ${
            isDarkMode 
              ? 'bg-gray-800 hover:bg-gray-700' 
              : 'bg-white hover:bg-gray-100'
          } text-blue-500`}
          title="Find my location"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
        </button>

        {/* Add this button */}
        <button
          onClick={() => setShowPincodeInput(true)}
          className={`rounded-lg ${
            isDarkMode 
              ? 'bg-gray-800 hover:bg-gray-700' 
              : 'bg-white hover:bg-gray-100'
          } text-blue-500`}
          title="Enter Pincode"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </button>
      </div>

      <ChatBot 
        isDarkMode={isDarkMode} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </div>
  );
};

// Move helper functions outside the component to move component
const getAQILabel = (aqi) => {
  if (!aqi && aqi !== 0) return "No Data";
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy (Sensitive)";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

export default MapComponent;