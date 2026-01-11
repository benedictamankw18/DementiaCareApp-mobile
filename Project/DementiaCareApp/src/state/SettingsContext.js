/**
 * Settings Context
 * Dementia Care Mobile Application
 * 
 * Global settings state management for accessibility and preferences
 */

import React, { createContext, useState } from 'react';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    soundAlerts: true,
    vibration: true,
    largeText: false,
    highContrast: false,
    voiceReminders: true,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Helper function to get adjusted text size based on largeText setting
  const getTextSize = (baseSize) => {
    return settings.largeText ? baseSize * 1.3 : baseSize;
  };

  const value = {
    settings,
    setSettings,
    handleToggle,
    getTextSize,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = React.useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
