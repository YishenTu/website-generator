import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Enhanced debounce hook with advanced features
 * @param value The value to debounce
 * @param delay Delay time in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Advanced debounce hook with immediate value access and custom options
 * @param value The value to debounce
 * @param delay Delay time in milliseconds
 * @param options Configuration options
 * @returns Object with debouncedValue, immediateValue, and isPending
 */
export function useAdvancedDebounce<T>(
  value: T, 
  delay: number,
  options: {
    /** Whether to trigger on the leading edge instead of trailing */
    leading?: boolean;
    /** Whether to trigger on the trailing edge */
    trailing?: boolean;
    /** Maximum time to wait before forcing the debounced function to be invoked */
    maxWait?: number;
  } = {}
): {
  debouncedValue: T;
  immediateValue: T;
  isPending: boolean;
  cancel: () => void;
  flush: () => void;
} {
  const { leading = false, trailing = true, maxWait } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTimeRef = useRef<number>(0);
  const lastInvokeTimeRef = useRef<number>(0);

  const invokeFunc = useCallback(() => {
    setDebouncedValue(value);
    setIsPending(false);
    lastInvokeTimeRef.current = Date.now();
  }, [value]);

  const leadingEdge = useCallback(() => {
    lastInvokeTimeRef.current = Date.now();
    if (leading) {
      invokeFunc();
    } else {
      setIsPending(true);
    }
  }, [leading, invokeFunc]);

  const remainingWait = useCallback(() => {
    const timeSinceLastCall = Date.now() - lastCallTimeRef.current;
    const timeSinceLastInvoke = Date.now() - lastInvokeTimeRef.current;
    const timeWaiting = delay - timeSinceLastCall;

    if (maxWait !== undefined) {
      return Math.min(timeWaiting, maxWait - timeSinceLastInvoke);
    }
    return timeWaiting;
  }, [delay, maxWait]);

  const shouldInvoke = useCallback(() => {
    const timeSinceLastCall = Date.now() - lastCallTimeRef.current;
    const timeSinceLastInvoke = Date.now() - lastInvokeTimeRef.current;

    return (
      lastCallTimeRef.current === 0 ||
      timeSinceLastCall >= delay ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }, [delay, maxWait]);

  const trailingEdge = useCallback(() => {
    if (trailing) {
      invokeFunc();
    } else {
      setIsPending(false);
    }
  }, [trailing, invokeFunc]);

  const timerExpired = useCallback(() => {
    if (shouldInvoke()) {
      trailingEdge();
    } else {
      const remaining = remainingWait();
      if (remaining > 0) {
        timeoutRef.current = setTimeout(timerExpired, remaining);
      }
    }
  }, [shouldInvoke, trailingEdge, remainingWait]);

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
    setIsPending(false);
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current || maxTimeoutRef.current) {
      invokeFunc();
      cancel();
    }
  }, [invokeFunc, cancel]);

  useEffect(() => {
    lastCallTimeRef.current = Date.now();

    if (shouldInvoke()) {
      leadingEdge();
    }

    if (!leading && !trailing) return;

    const remaining = remainingWait();
    if (remaining > 0) {
      timeoutRef.current = setTimeout(timerExpired, remaining);
    } else if (trailing) {
      trailingEdge();
    }

    // Set max wait timeout if specified
    if (maxWait !== undefined && !maxTimeoutRef.current) {
      maxTimeoutRef.current = setTimeout(() => {
        if (isPending) {
          invokeFunc();
        }
      }, maxWait);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, [value, shouldInvoke, leadingEdge, trailingEdge, remainingWait, timerExpired, maxWait, isPending, invokeFunc]);

  return {
    debouncedValue,
    immediateValue: value,
    isPending,
    cancel,
    flush
  };
} 