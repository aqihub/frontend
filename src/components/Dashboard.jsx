import React, { useEffect, useState } from "react";
import { useTimeBasedTheme } from "../hooks/useTimeBasedTheme";
import MapComponent from "./MapComponent";
import Header from "./Header";

const Dashboard = () => {
  const isDarkMode = useTimeBasedTheme();
  const [layers, setLayers] = useState({
    aqi: true,
    temperature: true,
    humidity: true,
    rsR0: true,
    pm25: true,
    tvoc: true,
    eco2: true,
    coordinates: true,
  });
  const [isOpen, setIsOpen] = useState(true);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  useEffect(() => {
    // Check the screen width when the component mounts
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false); // Set false for mobile devices (less than 768px)
        setIsLegendOpen(false)
      } else {
        setIsOpen(true); // Set true for desktop (768px or more)
        setIsLegendOpen(true)
      }
    };

    // Initial check on component mount
    handleResize();

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLayerToggle = (layerName) => {
    setLayers((prev) => ({
      ...prev,
      [layerName]: !prev[layerName],
    }));
  };

  const handleToggleAll = () => {
    const areAllActive = Object.values(layers).every((value) => value);
    setLayers(
      Object.keys(layers).reduce(
        (acc, key) => ({
          ...acc,
          [key]: !areAllActive,
        }),
        {}
      )
    );
  };

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="pt-[60px]">
      <Header />
      {/* Enhanced Data Layers Panel */}
      <div
        className={`fixed top-16 left-4 ${isDarkMode
          ? "bg-gray-800/95 border-gray-700"
          : "bg-white/95 border-gray-100"
          } backdrop-blur-sm shadow-lg rounded-xl z-[1000] mt-2 border p-5 ${isOpen ? "w-96" : "w-auto"} sm:w-72 md:w-96`}
      >
        <button
          onClick={toggle}
          className={`w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-colors ${isOpen && "data-layer-btn"}`}
        >
          {isOpen ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>

        {isOpen && (
          <>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2
                className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"
                  } flex items-center`}
              >
                <svg
                  className={`w-5 h-5 mr-2 ${isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                Data Layers
              </h2>
              <button
                onClick={handleToggleAll}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${isDarkMode
                  ? "text-blue-400 hover:text-blue-300 bg-blue-900/40 hover:bg-blue-900/60"
                  : "text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100"
                  }`}
              >
                {Object.values(layers).every((value) => value)
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            {/* Layer Toggles - More Compact but Readable */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {Object.entries(layers).map(([key, value]) => (
                <label
                  key={key}
                  className={`flex items-center p-2.5 ${isDarkMode
                    ? "bg-gray-900/50 hover:bg-gray-900/70 border-gray-700"
                    : "bg-gray-50 hover:bg-gray-100/80 border-gray-200"
                    } rounded-lg border cursor-pointer transition-all`}
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handleLayerToggle(key)}
                    className={`rounded h-3.5 w-3.5 ${isDarkMode
                      ? "text-blue-500 bg-gray-800 border-gray-600"
                      : "text-blue-600 bg-white border-gray-300"
                      } focus:ring-offset-0 focus:ring-1 focus:ring-blue-500 cursor-pointer`}
                  />
                  <span
                    className={`ml-2 text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                  >
                    {key === "rsR0"
                      ? "RS/R0 Ratio"
                      : key === "pm25"
                        ? "PM2.5"
                        : key === "eco2"
                          ? "eCO2"
                          : key === "tvoc"
                            ? "TVOC"
                            : key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Combined Legends Section - Collapsible */}
      <div
  className={`fixed bottom-4 left-4 z-[1000] transition-all duration-300 ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}
>
  <div className="relative">
    {/* Legend Content */}
    <div
      className={`transition-all duration-300 ${isLegendOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
    >
      <div
        className={`rounded-lg shadow-lg backdrop-blur-sm border ${isDarkMode ? "bg-gray-800/90 border-gray-700" : "bg-white/90 border-gray-200"}`}
      >
        {/* Toggle Button for Open State */}
        <button
          onClick={() => setIsLegendOpen(false)}
          className={`absolute -top-2 -right-2 p-1.5 rounded-full shadow-lg transition-all duration-200 ${isDarkMode ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-500 hover:bg-blue-600"} text-white z-10`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-3 min-w-[300px] flex">
          {/* AQI Legend */}
          <div className="mr-3 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/90'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm">
            <div className="flex items-center">
              <svg className="w-3.5 h-3.5 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              <span className="text-xs font-semibold">Air Quality Index (AQI)</span>
            </div>
            <div className="flex items-center justify-between px-2">
              {[
                { color: "bg-green-500", range: "0-50", label: "Good" },
                { color: "bg-yellow-500", range: "51-100", label: "Moderate" },
                { color: "bg-orange-500", range: "101-150", label: "Unhealthy" },
                { color: "bg-red-500", range: "151-200", label: "Poor" },
                { color: "bg-purple-500", range: "201-300", label: "Very Poor" },
                { color: "bg-[#7e0023]", range: "300+", label: "Severe" }
              ].map((item, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100/50"} px-2 py-1 rounded-lg transition-colors`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${item.color} ring-2 ring-opacity-50 ${isDarkMode ? `ring-${item.color.replace('bg-', '')}/30` : `ring-${item.color.replace('bg-', '')}/20`} shadow-sm`}
                  ></div>
                  <span className={`mt-1 text-[11px] font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {item.range}
                  </span>
                  <span className={`text-[10px] ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Other Measurements */}
          <div>
            <div className="flex items-center">
              {/* <svg className="w-3.5 h-3.5 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs font-semibold">Other Measurements</span> */}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* TVOC Section */}
              <div
                className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/90'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[11px] font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    TVOC (ppb)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  {[
                    { color: "bg-green-500", label: "0-220", text: "Good" },
                    { color: "bg-yellow-500", label: "221-660", text: "Moderate" },
                    { color: "bg-red-500", label: "660+", text: "Poor" }
                  ].map((value, index) => (
                    <div key={index} className="flex flex-col items-center mx-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${value.color} ring-2 ring-opacity-30 ${isDarkMode ? `ring-${value.color.replace('bg-', '')}/30` : `ring-${value.color.replace('bg-', '')}/20`}`}
                      />
                      <span className={`mt-1 text-[11px] font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {value.label}
                      </span>
                      <span className={`text-[9px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{value.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* eCO2 Section */}
              <div
                className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/90'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[11px] font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    eCO2 (ppm)
                  </span>
                </div>
                <div className="flex items-center justify-around">
                  {[
                    { color: "bg-green-500", label: "400-1000", text: "Normal" },
                    { color: "bg-red-500", label: "1000+", text: "High" }
                  ].map((value, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${value.color} ring-2 ring-opacity-30 ${isDarkMode ? `ring-${value.color.replace('bg-', '')}/30` : `ring-${value.color.replace('bg-', '')}/20`}`}
                      />
                      <span className={`mt-1 text-[10px] font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {value.label}
                      </span>
                      <span className={`text-[9px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{value.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Minimized View */}
    <div
      className={`transition-all duration-300 ${isLegendOpen ? "opacity-0 translate-y-4 pointer-events-none absolute" : "opacity-100 translate-y-0 relative"}`}
    >
      <button
        onClick={() => setIsLegendOpen(true)}
        className={`rounded-lg shadow-lg backdrop-blur-sm border px-3 py-1.5 transition-all duration-200 hover:shadow-xl ${isDarkMode ? "bg-gray-800/90 border-gray-700 hover:bg-gray-700/90" : "bg-white/90 border-gray-200 hover:bg-gray-50/90"}`}
      >
        <div className="flex items-center space-x-1.5">
          <div className="flex items-center space-x-1">
            {[
              { color: "bg-green-500", range: "i" },
              { color: "bg-yellow-500", range: "51" },
              { color: "bg-orange-500", range: "101" },
              { color: "bg-red-500", range: "151" },
              { color: "bg-purple-500", range: "201" },
              { color: "bg-[#7e0023]", range: "300+" }
            ].map((item, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                <span className={`ml-0.5 text-[9px] ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {item.range}
                </span>
              </div>
            ))}
          </div>
        </div>
      </button>
    </div>
  </div>
</div>


      {/* Map Container */}
      <div className="absolute inset-0 pt-14">
        <MapComponent activeLayers={layers} isDarkMode={isDarkMode} />
      </div>
    </div>
  )
}

export default Dashboard
