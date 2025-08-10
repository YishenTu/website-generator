/**
 * Centralized utility for managing transition debouncing across components
 * This file exports all debouncing utilities and provides configuration constants
 */

// Configuration constants for different debouncing scenarios
export const DEBOUNCE_TIMINGS = {
  // UI interactions
  HOVER_THROTTLE: 50,        // Hover state changes
  TAB_SWITCH: 200,          // Tab switching
  BUTTON_CLICK: 200,        // Button clicks
  
  // Form inputs
  INPUT_TYPING: 300,        // Text input debouncing
  FORM_SUBMIT: 300,         // Form submission
  
  // Model selection
  DROPDOWN_HOVER: 50,       // Dropdown option hover
  PROVIDER_TOGGLE: 200,     // Provider expansion toggle
  
  // Performance critical
  STATE_BATCH: 100,         // State batching
  ANIMATION_FRAME: 16,      // ~1 frame at 60fps
} as const;

// Debouncing options presets
export const DEBOUNCE_OPTIONS = {
  LEADING_ONLY: { leading: true, trailing: false },
  TRAILING_ONLY: { leading: false, trailing: true },
  BOTH_EDGES: { leading: true, trailing: true },
} as const;

// Export all hooks for easy importing
export { useDebounce, useAdvancedDebounce } from './useDebounce';
export { useThrottledHover, useAdvancedThrottledHover } from './useThrottledHover';
export { useStateDebouncer, useDebouncedCallback } from './useStateDebouncer';

/**
 * Testing scenarios that are now optimized:
 * 
 * 1. Rapid mouse movement over dropdown options - Handled by useThrottledHover with 50ms throttle
 * 2. Quick tab switching - Debounced with 200ms to prevent accidental double-clicks
 * 3. Fast typing in input fields - Form submissions debounced at 300ms
 * 4. Rapid button clicking - All interactive buttons debounced at 200ms
 * 5. ModelSelector hover spam - Dropdown options throttled at 50ms
 * 6. Provider toggle spam - Expansion toggles debounced at 200ms
 * 
 * Performance improvements:
 * - Prevents excessive DOM updates during rapid interactions
 * - Reduces unnecessary re-renders and state changes
 * - Uses requestAnimationFrame for smooth visual updates
 * - Batches state changes to minimize layout thrashing
 * - Memory efficient with proper cleanup on unmount
 */