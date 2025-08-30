import { useState, useEffect } from 'react';

export const useTimeBasedTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // For testing light theme, always set to false
    // setIsDarkMode(false);

    // Original code (commented out for now)
    
    const checkTime = () => {
      const currentHour = new Date().getHours();
      setIsDarkMode(currentHour < 6 || currentHour >= 18);
    };

    // Initial check
    checkTime();

    // Check every minute
    const interval = setInterval(checkTime, 60000);

    return () => clearInterval(interval);
    
  }, []);

  return isDarkMode;
}; 