import React, { useRef } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface LoadingSpinnerProps {
  className?: string;
  /** Whether to disable visibility-based animation throttling (default: false) */
  disableVisibilityThrottling?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(({ 
  className = 'w-8 h-8 text-sky-500',
  disableVisibilityThrottling = false 
}) => {
  // Reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  
  // Visibility observer for animation throttling (Task 3.2)
  const spinnerRef = useRef<SVGSVGElement | null>(null);
  const isSpinnerVisible = useIntersectionObserver(spinnerRef as React.RefObject<Element>, {
    rootMargin: '50px', // Start animation slightly before coming into view
    threshold: 0,       // Trigger as soon as any part is visible
  });

  // Determine animation classes based on visibility and motion preferences
  const shouldPause = !isSpinnerVisible || prefersReducedMotion;
  const animationClass = disableVisibilityThrottling 
    ? 'animate-spin'
    : `animate-spin ${shouldPause ? 'animation-paused' : 'animation-running'}`;

  return (
    <svg
      ref={spinnerRef}
      className={`${animationClass} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
});
