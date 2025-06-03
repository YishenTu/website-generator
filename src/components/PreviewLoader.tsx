import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { CONTAINER_STYLES, TEXT_STYLES, ICON_SIZES, ANIMATION_STYLES, combineStyles } from '../utils/styleConstants';
import { ANIMATION_DELAYS, UI_TEXT } from '../utils/constants';

interface PreviewLoaderProps {
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
}

export const PreviewLoader: React.FC<PreviewLoaderProps> = React.memo(({ 
  isLoading, 
  hasError, 
  onRetry 
}) => {
  if (!isLoading && !hasError) return null;

  return (
    <div className={combineStyles(
      CONTAINER_STYLES.absolute,
      CONTAINER_STYLES.inset0,
      CONTAINER_STYLES.flexCenter,
      'bg-slate-800 bg-opacity-95 z-20 rounded-b-md backdrop-blur-sm'
    )}>
      {isLoading && !hasError && (
        <div className="text-center">
          <LoadingSpinner className={combineStyles(ICON_SIZES.xl, 'text-sky-400 mx-auto')} />
          <div className="mt-3 space-y-1">
            <p className={combineStyles(TEXT_STYLES.paragraph, 'font-medium')}>
              {UI_TEXT.LOADING_PREVIEW}
            </p>
            <p className={TEXT_STYLES.mutedXs}>
              Fetching external resources...
            </p>
            <div className="mt-2 flex justify-center space-x-1">
              <div 
                className={combineStyles('w-2 h-2 bg-sky-400 rounded-full', ANIMATION_STYLES.animatePulse)}
              />
              <div 
                className={combineStyles('w-2 h-2 bg-sky-400 rounded-full', ANIMATION_STYLES.animatePulse)}
                style={{ animationDelay: ANIMATION_DELAYS.PULSE_2 }}
              />
              <div 
                className={combineStyles('w-2 h-2 bg-sky-400 rounded-full', ANIMATION_STYLES.animatePulse)}
                style={{ animationDelay: ANIMATION_DELAYS.PULSE_3 }}
              />
            </div>
          </div>
        </div>
      )}
      
      {hasError && (
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className={combineStyles(ICON_SIZES.md, 'text-red-400')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className={combineStyles(TEXT_STYLES.error, 'font-medium mb-1')}>
            Preview loading failed
          </p>
          <p className={combineStyles(TEXT_STYLES.mutedXs, 'mb-3')}>
            Check your network connection
          </p>
          <button
            onClick={onRetry}
            className={combineStyles(
              'text-xs bg-sky-600 hover:bg-sky-700 text-white px-3 py-1 rounded-md',
              ANIMATION_STYLES.transitionColors
            )}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}); 