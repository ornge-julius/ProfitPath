import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage utilities for React Native using AsyncStorage.
 * All methods are async - callers must await them.
 */
export const storage = {
  getItem: async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage read error:', error);
      return null;
    }
  },
  
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage write error:', error);
    }
  },
  
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },

  clear: async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },
};

/**
 * Helper for JSON data serialization/deserialization.
 */
export const storageJson = {
  get: async (key) => {
    const value = await storage.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error('JSON parse error:', error);
      return null;
    }
  },
  
  set: async (key, value) => {
    try {
      await storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('JSON stringify error:', error);
    }
  },
};
