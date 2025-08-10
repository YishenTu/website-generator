/**
 * usePerformanceMode Hook - Task 2.2
 * 
 * Manages performance mode state with three levels: high, balanced, and low.
 * Persists preference to localStorage and provides methods to control
 * visual effects based on performance requirements.
 * 
 * Performance Levels:
 * - High: All visual effects enabled (blur, animations, shadows, transitions)
 * - Balanced: Reduced effects for better performance while maintaining aesthetics
 * - Low: Minimal effects for maximum performance and accessibility
 * 
 * Features:
 * - Persistent localStorage storage
 * - Dynamic feature toggles based on performance level
 * - Integration with reduced motion preferences
 * - Type-safe performance mode interface
 */

import { useState, useEffect, useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

export interface PerformanceMode {
  enabled: boolean;
  level: 'high' | 'balanced' | 'low';
  features: {
    blur: boolean;
    animations: boolean;
    shadows: boolean;
    transitions: boolean;
  };
}

type PerformanceLevel = 'high' | 'balanced' | 'low';

const STORAGE_KEY = 'frostbyte-performance-mode';

// Default performance configurations for each level
const PERFORMANCE_CONFIGS: Record<PerformanceLevel, PerformanceMode['features']> = {
  high: {
    blur: true,
    animations: true,
    shadows: true,
    transitions: true,
  },
  balanced: {
    blur: false, // Disabled for GPU performance (Task 2.1 optimizations)
    animations: true,
    shadows: false, // Simplified shadows for better performance
    transitions: true,
  },
  low: {
    blur: false,
    animations: false,
    shadows: false,
    transitions: false,
  },
};

export const usePerformanceMode = () => {
  const prefersReducedMotion = useReducedMotion();
  
  // Initialize with balanced mode as default
  const [performanceLevel, setPerformanceLevel] = useState<PerformanceLevel>('balanced');
  const [isEnabled, setIsEnabled] = useState(true);

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { level, enabled } = JSON.parse(saved);
        if (level && ['high', 'balanced', 'low'].includes(level)) {
          setPerformanceLevel(level);
        }
        if (typeof enabled === 'boolean') {
          setIsEnabled(enabled);
        }
      }
    } catch (error) {
      console.warn('Failed to load performance mode from localStorage:', error);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        level: performanceLevel,
        enabled: isEnabled,
      }));
    } catch (error) {
      console.warn('Failed to save performance mode to localStorage:', error);
    }
  }, [performanceLevel, isEnabled]);

  // Calculate effective performance mode based on preferences and reduced motion
  const effectivePerformanceMode: PerformanceMode = {
    enabled: isEnabled,
    level: performanceLevel,
    features: {
      ...PERFORMANCE_CONFIGS[performanceLevel],
      // Override animations and transitions if user prefers reduced motion
      animations: PERFORMANCE_CONFIGS[performanceLevel].animations && !prefersReducedMotion,
      transitions: PERFORMANCE_CONFIGS[performanceLevel].transitions && !prefersReducedMotion,
    },
  };

  // Methods to control performance mode
  const setLevel = useCallback((level: PerformanceLevel) => {
    setPerformanceLevel(level);
  }, []);

  const toggleEnabled = useCallback(() => {
    setIsEnabled(!isEnabled);
  }, [isEnabled]);

  const enable = useCallback(() => {
    setIsEnabled(true);
  }, []);

  const disable = useCallback(() => {
    setIsEnabled(false);
  }, []);

  // Convenience methods for specific levels
  const setHighPerformance = useCallback(() => setLevel('high'), [setLevel]);
  const setBalancedPerformance = useCallback(() => setLevel('balanced'), [setLevel]);
  const setLowPerformance = useCallback(() => setLevel('low'), [setLevel]);

  // Utility methods to check current state
  const isHighPerformance = performanceLevel === 'high';
  const isBalancedPerformance = performanceLevel === 'balanced';
  const isLowPerformance = performanceLevel === 'low';

  return {
    // Current performance mode state
    performanceMode: effectivePerformanceMode,
    
    // Level controls
    level: performanceLevel,
    setLevel,
    setHighPerformance,
    setBalancedPerformance,
    setLowPerformance,
    
    // Enable/disable controls
    isEnabled,
    enable,
    disable,
    toggleEnabled,
    
    // Convenience state checks
    isHighPerformance,
    isBalancedPerformance,
    isLowPerformance,
    
    // System preferences
    prefersReducedMotion,
    
    // Feature availability
    features: effectivePerformanceMode.features,
  };
};