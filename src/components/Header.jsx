import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTimeBasedTheme } from "../hooks/useTimeBasedTheme"

const Header = () => {
  const isDarkMode = useTimeBasedTheme();

  return (
    <header className={`fixed top-0 left-0 right-0 ${isDarkMode ? "bg-gray-900/95" : "bg-white/95"
      } backdrop-blur-sm border-b ${isDarkMode ? "border-gray-800" : "border-gray-200"
      } z-[1000]`}>
      <div className="mx-auto">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo and Title Section */}
          <div className="flex items-center space-x-3">
            <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'
              }`}>
              <svg
                className="w-6 h-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className={`text-lg font-bold leading-none ${isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                AQI Dashboard
              </h1>
              <p className={`text-xs mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                Real-time Air Quality Monitoring
              </p>
            </div>
          </div>

          <ConnectButton />
        </div>
      </div>
    </header>
  )
}

export default Header