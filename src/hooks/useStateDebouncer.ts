import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook for batching rapid state changes to prevent performance issues
 * Collects multiple state changes and applies them in batches
 */
export function useStateDebouncer<T>(
  initialState: T,
  batchDelay: number = 100,
  maxBatchSize: number = 10
) {
  const [state, setState] = useState<T>(initialState);
  const [pendingChanges, setPendingChanges] = useState<Array<(prevState: T) => T>>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  const processBatch = useCallback(() => {
    if (pendingChanges.length > 0) {
      setState(prevState => {
        return pendingChanges.reduce((acc, updater) => updater(acc), prevState);
      });
      setPendingChanges([]);
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [pendingChanges]);

  const scheduleBatchProcess = useCallback(() => {
    // Use RAF for immediate visual updates, fallback to timeout for longer delays
    if (batchDelay <= 16) { // ~1 frame at 60fps
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(processBatch);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(processBatch, batchDelay);
    }
  }, [batchDelay, processBatch]);

  const debouncedSetState = useCallback((updater: T | ((prevState: T) => T)) => {
    const updaterFn = typeof updater === 'function' 
      ? updater as ((prevState: T) => T)
      : () => updater;

    setPendingChanges(prev => {
      const newChanges = [...prev, updaterFn];
      
      // Force immediate process if batch is getting too large
      if (newChanges.length >= maxBatchSize) {
        // Process immediately on next tick
        setTimeout(() => processBatch(), 0);
        return [];
      }
      
      return newChanges;
    });

    scheduleBatchProcess();
  }, [maxBatchSize, scheduleBatchProcess, processBatch]);

  // Force immediate processing of pending changes
  const flushPendingChanges = useCallback(() => {
    processBatch();
  }, [processBatch]);

  // Cancel pending changes
  const cancelPendingChanges = useCallback(() => {
    setPendingChanges([]);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    state,
    setState: debouncedSetState,
    pendingCount: pendingChanges.length,
    flushPendingChanges,
    cancelPendingChanges,
    // Immediate state setter for urgent updates
    setStateImmediate: setState
  };
}

/**
 * Hook for debouncing rapid function calls
 * Useful for preventing spam clicking or rapid API calls
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
) {
  const { leading = false, trailing = true, maxWait } = options;
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTimeRef = useRef<number>(0);
  const lastInvokeTimeRef = useRef<number>(0);
  const argsRef = useRef<Parameters<T>>();

  // Update callback ref when callback changes
  callbackRef.current = callback;

  const invokeFunc = useCallback(() => {
    const args = argsRef.current;
    if (args) {
      callbackRef.current(...args);
    }
    lastInvokeTimeRef.current = Date.now();
    
    // Clear timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
  }, []);

  const shouldInvoke = useCallback((time: number) => {
    const timeSinceLastCall = time - lastCallTimeRef.current;
    const timeSinceLastInvoke = time - lastInvokeTimeRef.current;

    return (
      lastCallTimeRef.current === 0 ||
      timeSinceLastCall >= delay ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }, [delay, maxWait]);

  const leadingEdge = useCallback(() => {
    lastInvokeTimeRef.current = Date.now();
    if (leading) {
      invokeFunc();
    }
  }, [leading, invokeFunc]);

  const trailingEdge = useCallback(() => {
    if (trailing) {
      invokeFunc();
    }
  }, [trailing, invokeFunc]);

  const timerExpired = useCallback(() => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      trailingEdge();
    } else {
      const remaining = delay - (time - lastCallTimeRef.current);
      if (remaining > 0) {
        timeoutRef.current = setTimeout(timerExpired, remaining);
      }
    }
  }, [shouldInvoke, trailingEdge, delay]);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    const time = Date.now();
    argsRef.current = args;
    lastCallTimeRef.current = time;

    if (shouldInvoke(time)) {
      leadingEdge();
    }

    if (!leading && !trailing) return;

    // Set up trailing edge
    const remaining = delay;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(timerExpired, remaining);

    // Set up max wait timeout
    if (maxWait !== undefined && !maxTimeoutRef.current) {
      maxTimeoutRef.current = setTimeout(() => {
        invokeFunc();
      }, maxWait);
    }
  }, [shouldInvoke, leadingEdge, delay, timerExpired, invokeFunc, leading, trailing, maxWait]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    lastCallTimeRef.current = 0;
    lastInvokeTimeRef.current = 0;
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current || maxTimeoutRef.current) {
      invokeFunc();
      cancel();
    }
  }, [invokeFunc, cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    callback: debouncedCallback,
    cancel,
    flush
  };
}