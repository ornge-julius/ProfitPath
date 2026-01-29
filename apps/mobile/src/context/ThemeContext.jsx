import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { storageJson } from '../utils/storage';

const STORAGE_KEY = 'profitpath_theme';

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState(THEMES.SYSTEM);
  const [isLoading, setIsLoading] = useState(true);

  // Compute actual theme based on preference and system setting
  const theme = useMemo(() => {
    if (themePreference === THEMES.SYSTEM) {
      return systemColorScheme || THEMES.DARK;
    }
    return themePreference;
  }, [themePreference, systemColorScheme]);

  const isDark = theme === THEMES.DARK;

  // Async initialization
  useEffect(() => {
    const loadPersistedTheme = async () => {
      try {
        const stored = await storageJson.get(STORAGE_KEY);
        if (stored && Object.values(THEMES).includes(stored)) {
          setThemePreference(stored);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPersistedTheme();
  }, []);

  // Async persistence
  useEffect(() => {
    if (!isLoading) {
      storageJson.set(STORAGE_KEY, themePreference).catch(() => {});
    }
  }, [themePreference, isLoading]);

  // Setter
  const setTheme = useCallback((newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setThemePreference(newTheme);
    }
  }, []);

  // Toggle between light/dark (ignoring system)
  const toggleTheme = useCallback(() => {
    setThemePreference(prev => {
      if (prev === THEMES.DARK || (prev === THEMES.SYSTEM && isDark)) {
        return THEMES.LIGHT;
      }
      return THEMES.DARK;
    });
  }, [isDark]);

  // Memoize context value
  const value = useMemo(() => ({
    theme,
    themePreference,
    isDark,
    isLoading,
    setTheme,
    toggleTheme,
    THEMES
  }), [theme, themePreference, isDark, isLoading, setTheme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Theme colors for easy access
export const colors = {
  light: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    primary: '#10B981',
    danger: '#EF4444',
    success: '#10B981'
  },
  dark: {
    background: '#0A0A0B',
    surface: '#111113',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    border: '#1F2937',
    primary: '#10B981',
    danger: '#EF4444',
    success: '#10B981'
  }
};
