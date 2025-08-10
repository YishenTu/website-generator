import { useState, useRef, useCallback } from 'react';

/**
 * Throttled hover hook to prevent rapid hover state changes
 * Uses requestAnimationFrame for smooth updates and throttling
 */
export function useThrottledHover(delay: number = 100) {
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const updateHoverState = useCallback((newState: boolean) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    if (timeSinceLastUpdate >= delay) {
      // Immediate update if enough time has passed
      setIsHovered(newState);
      lastUpdateRef.current = now;
    } else {
      // Throttle the update
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsHovered(newState);
        lastUpdateRef.current = Date.now();
      }, delay - timeSinceLastUpdate);
    }
  }, [delay]);

  const handleMouseEnter = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      updateHoverState(true);
    });
  }, [updateHoverState]);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      updateHoverState(false);
    });
  }, [updateHoverState]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    isHovered,
    handleMouseEnter,
    handleMouseLeave,
    cleanup
  };
}

/**
 * Enhanced throttled hover hook with additional options
 */
export function useAdvancedThrottledHover(options: {
  /** Throttle delay in milliseconds */
  delay?: number;
  /** Whether to use leading edge triggering */
  leading?: boolean;
  /** Whether to use trailing edge triggering */
  trailing?: boolean;
  /** Maximum time to wait before forcing an update */
  maxWait?: number;
} = {}) {
  const { delay = 100, leading = true, trailing = true, maxWait } = options;
  
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const lastInvokeRef = useRef<number>(0);

  const invokeUpdate = useCallback((newState: boolean) => {
    setIsHovered(newState);
    lastInvokeRef.current = Date.now();
    
    // Clear timeouts after successful invoke
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
  }, []);

  const shouldInvoke = useCallback((now: number) => {
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    const timeSinceLastInvoke = now - lastInvokeRef.current;

    return (
      lastUpdateRef.current === 0 ||
      timeSinceLastUpdate >= delay ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }, [delay, maxWait]);

  const updateHoverState = useCallback((newState: boolean) => {
    const now = Date.now();
    lastUpdateRef.current = now;

    if (shouldInvoke(now)) {
      if (leading || lastInvokeRef.current === 0) {
        invokeUpdate(newState);
        return;
      }
    }

    // Set up trailing edge update
    if (trailing) {
      const remaining = Math.max(0, delay - (now - lastInvokeRef.current));
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        invokeUpdate(newState);
      }, remaining);
    }

    // Set up max wait timeout if specified
    if (maxWait !== undefined && !maxTimeoutRef.current) {
      maxTimeoutRef.current = setTimeout(() => {
        invokeUpdate(newState);
      }, maxWait);
    }
  }, [delay, leading, trailing, maxWait, shouldInvoke, invokeUpdate]);

  const handleMouseEnter = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      updateHoverState(true);
    });
  }, [updateHoverState]);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      updateHoverState(false);
    });
  }, [updateHoverState]);

  // Force immediate update
  const flush = useCallback((newState: boolean) => {
    if (timeoutRef.current || maxTimeoutRef.current) {
      invokeUpdate(newState);
    }
  }, [invokeUpdate]);

  // Cancel pending updates
  const cancel = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
  }, []);

  return {
    isHovered,
    handleMouseEnter,
    handleMouseLeave,
    flush,
    cancel
  };
}