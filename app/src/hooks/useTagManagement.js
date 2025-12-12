import { useTagContext } from '../context/TagContext';

/**
 * Hook to access tag data and management functions.
 * This is now a thin wrapper around TagContext for backward compatibility.
 * 
 * @returns {Object} Tag data and management functions
 */
export const useTagManagement = () => {
  return useTagContext();
};

