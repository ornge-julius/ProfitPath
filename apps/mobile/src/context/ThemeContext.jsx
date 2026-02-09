import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { storageJson } from '../utils/storage';
import { LUXE_LIGHT, LUXE_DARK } from '../theme/tokens';

const STORAGE_KEY = 'profitpath_theme';

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

  const theme = useMemo(() => {
    if (themePreference === THEMES.SYSTEM) {
      return systemColorScheme === 'dark' ? THEMES.DARK : THEMES.LIGHT;
    }
    return themePreference;
  }, [themePreference, systemColorScheme]);

  const isDark = theme === THEMES.DARK;

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

  useEffect(() => {
    if (!isLoading) {
      storageJson.set(STORAGE_KEY, themePreference).catch(() => {});
    }
  }, [themePreference, isLoading]);

  const setTheme = useCallback((newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setThemePreference(newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemePreference(prev => {
      if (prev === THEMES.DARK || (prev === THEMES.SYSTEM && isDark)) {
        return THEMES.LIGHT;
      }
      return THEMES.DARK;
    });
  }, [isDark]);

  const value = useMemo(() => ({
    theme,
    themePreference,
    isDark,
    isLoading,
    setTheme,
    toggleTheme,
    THEMES,
    colors: isDark ? LUXE_DARK : LUXE_LIGHT,
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

// Theme colors — Monochrome Luxe (semantic names). Use themeColors from useTheme() in components.
export const colors = {
  light: LUXE_LIGHT,
  dark: LUXE_DARK,
};
