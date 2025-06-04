import { useCallback, useRef } from 'react';

/**
 * Buffer updates and commit them on the next animation frame to reduce re-renders.
 */
export function useBufferedUpdater<T>(setter: React.Dispatch<React.SetStateAction<T>>) {
  const bufferRef = useRef<T>();
  const rafRef = useRef<number>();

  const flush = useCallback(() => {
    if (rafRef.current !== undefined) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
    if (bufferRef.current !== undefined) {
      setter(bufferRef.current);
    }
  }, [setter]);

  const update = useCallback((value: T) => {
    bufferRef.current = value;
    if (rafRef.current === undefined) {
      rafRef.current = requestAnimationFrame(() => {
        if (bufferRef.current !== undefined) {
          setter(bufferRef.current);
        }
        rafRef.current = undefined;
      });
    }
  }, [setter]);

  return { update, flush };
}
