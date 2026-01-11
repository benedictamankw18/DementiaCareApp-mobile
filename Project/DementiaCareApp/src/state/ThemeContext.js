/**
 * Theme Context
 * Dementia Care Mobile Application
 * 
 * Global theme state management for light/dark mode
 */

import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('Light');
  const [loading, setLoading] = useState(true);
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('preference_theme');
      if (savedTheme) {
        setCurrentTheme(savedTheme);
        console.log('[ThemeContext] Loaded theme from localStorage:', savedTheme);
      }
      setLoading(false);
    } catch (error) {
      console.error('[ThemeContext] Error loading theme:', error);
      setLoading(false);
    }
  };

  // Determine the active theme
  const getActiveTheme = () => {
    if (currentTheme === 'Auto') {
      return systemColorScheme === 'dark' ? 'Dark' : 'Light';
    }
    return currentTheme;
  };

  const activeTheme = getActiveTheme();
  const isDarkMode = activeTheme === 'Dark';

  // Light theme colors
  const lightTheme = {
    primary: '#2196F3',
    secondary: '#FF9800',
    accent: '#E91E63',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#212121',
    textSecondary: '#757575',
    textLight: '#BDBDBD',
    white: '#FFFFFF',
    black: '#000000',
    lightGray: '#F5F5F5',
    gray: '#BDBDBD',
    darkGray: '#424242',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
  };

  // Dark theme colors
  const darkTheme = {
    primary: '#1976D2',
    secondary: '#FF6F00',
    accent: '#EC407A',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textLight: '#808080',
    white: '#FFFFFF',
    black: '#000000',
    lightGray: '#2A2A2A',
    gray: '#616161',
    darkGray: '#212121',
    success: '#66BB6A',
    warning: '#FFA726',
    error: '#EF5350',
    info: '#42A5F5',
  };

  const colors = isDarkMode ? darkTheme : lightTheme;

  const value = {
    currentTheme,
    setCurrentTheme,
    activeTheme,
    isDarkMode,
    colors,
    loading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
