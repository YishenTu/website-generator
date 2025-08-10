/**
 * useReducedMotion Hook - Task 2.2
 * 
 * Detects the user's prefers-reduced-motion system setting and provides
 * a boolean indicating if reduced motion is preferred.
 * 
 * This hook helps improve accessibility and performance by allowing the app
 * to disable animations and other motion effects when requested by the user.
 * 
 * Features:
 * - Detects system preference for reduced motion
 * - Updates dynamically when preference changes
 * - Returns boolean for easy conditional rendering
 * - Supports SSR with safe defaults
 */

import { useState, useEffect } from 'react';

export const useReducedMotion = (): boolean => {
  // Default to false (motion enabled) for SSR compatibility
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Create media query for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Create handler for media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add listener for changes
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
};