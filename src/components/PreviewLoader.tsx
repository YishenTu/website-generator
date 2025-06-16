import React from 'react';
import { CONTAINER_STYLES, TEXT_STYLES, ICON_SIZES, ANIMATION_STYLES, combineStyles } from '../utils/styleConstants';
import { LoadingSpinner } from './LoadingSpinner';

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

  // Loading stage
  if (isLoading && !hasError) {
    return (
      <div className={combineStyles(
        CONTAINER_STYLES.absolute,
        CONTAINER_STYLES.inset0,
        CONTAINER_STYLES.flexCenter,
        'bg-slate-800 bg-opacity-50 z-20 rounded-b-md backdrop-blur-sm'
      )}>
        <div className="text-center">
          <LoadingSpinner />
          <p className={combineStyles(TEXT_STYLES.muted, 'mt-3')}>
            Loading preview...
          </p>
        </div>
      </div>
    );
  }

  // Error stage
  if (!hasError) return null;

  return (
    <div className={combineStyles(
      CONTAINER_STYLES.absolute,
      CONTAINER_STYLES.inset0,
      CONTAINER_STYLES.flexCenter,
      'bg-slate-800 bg-opacity-95 z-20 rounded-b-md backdrop-blur-sm'
    )}>
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 bg-red-500/20 rounded-full flex items-center justify-center">
          <svg className={combineStyles(ICON_SIZES.md, 'text-red-400')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className={combineStyles(TEXT_STYLES.error, 'font-medium mb-1')}>
          预览加载失败
        </p>
        <p className={combineStyles(TEXT_STYLES.mutedXs, 'mb-3')}>
          请检查网络连接
        </p>
        <button
          onClick={onRetry}
          className={combineStyles(
            'text-xs bg-sky-600 hover:bg-sky-700 text-white px-3 py-1 rounded-md',
            ANIMATION_STYLES.transitionColors
          )}
        >
          重试
        </button>
      </div>
    </div>
  );
}); 