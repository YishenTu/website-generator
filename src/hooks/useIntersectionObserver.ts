import { useEffect, useRef, useState, RefObject } from 'react';

/**
 * Options for the Intersection Observer hook
 */
export interface UseIntersectionObserverOptions {
  /** The root element to use as the viewport. Defaults to document viewport */
  root?: Element | null;
  /** Margin around the root element (e.g., '10px 20px 30px 40px') */
  rootMargin?: string;
  /** 
   * Threshold(s) at which to trigger the callback.
   * Single number or array of numbers between 0 and 1.
   * 0 = element is just entering/leaving viewport
   * 1 = element is fully visible/hidden
   */
  threshold?: number | number[];
  /** Callback function called when visibility changes */
  onVisibilityChange?: (isVisible: boolean, entry: IntersectionObserverEntry) => void;
  /** Whether to freeze observation after the first trigger (useful for one-time animations) */
  freezeOnceVisible?: boolean;
}

/**
 * Custom hook that uses the Intersection Observer API to detect element visibility
 * 
 * @param elementRef - React ref to the element to observe
 * @param options - Configuration options for the intersection observer
 * @returns isVisible boolean indicating if the element is currently visible
 */
export const useIntersectionObserver = (
  elementRef: RefObject<Element>,
  options: UseIntersectionObserverOptions = {}
): boolean => {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    onVisibilityChange,
    freezeOnceVisible = false
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    
    // Don't observe if element is null or if we're frozen after first trigger
    if (!element || (freezeOnceVisible && isTriggered)) {
      return;
    }

    // Check if Intersection Observer is supported
    if (!window.IntersectionObserver) {
      console.warn('Intersection Observer not supported, assuming element is visible');
      setIsVisible(true);
      return;
    }

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const entry = entries[0];
        if (!entry) return;
        const visible = entry.isIntersecting;
        
        setIsVisible(visible);
        
        // Mark as triggered on first visibility change (if freezeOnceVisible is true)
        if (freezeOnceVisible && visible && !isTriggered) {
          setIsTriggered(true);
        }
        
        // Call optional callback
        if (onVisibilityChange && entry) {
          onVisibilityChange(visible, entry);
        }
      },
      {
        root,
        rootMargin,
        threshold
      }
    );

    // Start observing
    observerRef.current.observe(element);

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [
    elementRef,
    root,
    rootMargin,
    threshold,
    onVisibilityChange,
    freezeOnceVisible,
    isTriggered
  ]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return isVisible;
};

/**
 * Enhanced hook that provides additional visibility information
 */
export interface UseIntersectionObserverEnhancedResult {
  /** Whether the element is currently visible */
  isVisible: boolean;
  /** The intersection ratio (0-1) */
  intersectionRatio: number;
  /** Whether the element has ever been visible */
  hasBeenVisible: boolean;
  /** The raw intersection observer entry */
  entry: IntersectionObserverEntry | null;
}

/**
 * Enhanced version of useIntersectionObserver that provides more detailed visibility information
 */
export const useIntersectionObserverEnhanced = (
  elementRef: RefObject<Element>,
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverEnhancedResult => {
  const [state, setState] = useState<UseIntersectionObserverEnhancedResult>({
    isVisible: false,
    intersectionRatio: 0,
    hasBeenVisible: false,
    entry: null
  });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    onVisibilityChange,
    freezeOnceVisible = false
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    
    if (!element || (freezeOnceVisible && state.hasBeenVisible)) {
      return;
    }

    if (!window.IntersectionObserver) {
      console.warn('Intersection Observer not supported, assuming element is visible');
      setState({
        isVisible: true,
        intersectionRatio: 1,
        hasBeenVisible: true,
        entry: null
      });
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const entry = entries[0];
        if (!entry) return;
        const visible = entry.isIntersecting;
        
        setState(prevState => ({
          isVisible: visible,
          intersectionRatio: entry.intersectionRatio,
          hasBeenVisible: prevState.hasBeenVisible || visible,
          entry: entry as IntersectionObserverEntry
        }));
        
        if (onVisibilityChange && entry) {
          onVisibilityChange(visible, entry);
        }
      },
      {
        root,
        rootMargin,
        threshold
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [
    elementRef,
    root,
    rootMargin,
    threshold,
    onVisibilityChange,
    freezeOnceVisible,
    state.hasBeenVisible
  ]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return state;
};

export default useIntersectionObserver;