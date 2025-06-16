import { useEffect, useRef } from 'react';
import { createLogger } from '../utils/logger';

const logger = createLogger('useDebouncedLocalStorage');

/**
 * Hook to debounce localStorage writes to prevent blocking the main thread
 * @param key - localStorage key
 * @param value - value to store
 * @param delay - debounce delay in milliseconds (default: 500ms)
 */
export const useDebouncedLocalStorage = (key: string, value: string, delay: number = 500) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        logger.error(`Failed to save ${key} to localStorage:`, error);
      }
    }, delay);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, value, delay]);

  // Immediate save on unmount (for unsaved changes)
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          logger.error(`Failed to save ${key} to localStorage on unmount:`, error);
        }
      }
    };
  }, [key, value]);
};