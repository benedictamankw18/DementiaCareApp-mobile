/**
 * App Theme & Colors
 * Dementia Care Mobile Application
 * 
 * Designed with dementia-friendly principles:
 * - High contrast colors
 * - Large fonts (18-22pt minimum)
 * - Simple, clear color palette
 */

export const colors = {
  // Primary Colors
  primary: '#2196F3',        // Blue
  secondary: '#FF9800',      // Orange
  accent: '#E91E63',         // Pink (for emergency SOS)
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  lightGray: '#F5F5F5',
  gray: '#BDBDBD',
  darkGray: '#424242',
  
  // Status Colors
  success: '#4CAF50',        // Green (for completed tasks)
  warning: '#FFC107',        // Amber (for pending)
  error: '#F44336',          // Red (for errors/emergency)
  info: '#2196F3',           // Blue (for information)
  
  // Text Colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textLight: '#BDBDBD',
  
  // Background Colors
  backgroundLight: '#FAFAFA',
  backgroundDark: '#F5F5F5',
};

export const typography = {
  // Font Sizes (in pt - minimum 18 for dementia-friendly)
  h1: 28,
  h2: 24,
  h3: 22,
  h4: 20,
  subtitle: 19,
  body: 18,
  caption: 16,
  small: 14,
  
  // Font Weights
  thin: '100',
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  
  // Font Family
  fontFamily: 'System',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const theme = {
  colors,
  typography,
  spacing,
};

export default theme;
