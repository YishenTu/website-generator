import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { CONTAINER_STYLES, TEXT_STYLES, ICON_SIZES, ANIMATION_STYLES, combineStyles } from '../utils/styleConstants';
import { ANIMATION_DELAYS } from '../utils/constants';

interface PreviewLoaderProps {
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
  isStreaming?: boolean;
  streamingModel?: string;
  showStreamingStatus?: boolean;
}

export const PreviewLoader: React.FC<PreviewLoaderProps> = React.memo(({ 
  hasError, 
  onRetry,
  isStreaming = false,
  streamingModel,
  showStreamingStatus = false
}) => {
  if (showStreamingStatus && isStreaming) {
    return (
      <div className={combineStyles(
        CONTAINER_STYLES.absolute,
        CONTAINER_STYLES.inset0,
        CONTAINER_STYLES.flexCenter,
        'bg-slate-800 bg-opacity-90 z-20 rounded-b-md backdrop-blur-sm'
      )}>
        <div className="text-center">
          <div className="relative">
            <LoadingSpinner className={combineStyles(ICON_SIZES.xl, 'text-emerald-400 mx-auto')} />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
          <div className="mt-4 space-y-2">
            <p className={combineStyles(TEXT_STYLES.paragraph, 'font-medium text-emerald-300')}>
              正在生成代码...
            </p>
            {streamingModel && (
              <div className="bg-slate-700/60 rounded-lg px-3 py-2 border border-slate-600">
                <p className={combineStyles(TEXT_STYLES.mutedXs, 'text-slate-300 mb-1')}>
                  使用模型:
                </p>
                <p className={combineStyles(TEXT_STYLES.paragraph, 'font-mono text-emerald-400')}>
                  {streamingModel}
                </p>
              </div>
            )}
            <div className="flex items-center justify-center space-x-2 mt-3">
              <div className="flex space-x-1">
                <div 
                  className={combineStyles('w-2 h-2 bg-emerald-400 rounded-full', ANIMATION_STYLES.animatePulse)}
                />
                <div 
                  className={combineStyles('w-2 h-2 bg-emerald-400 rounded-full', ANIMATION_STYLES.animatePulse)}
                  style={{ animationDelay: ANIMATION_DELAYS.PULSE_2 }}
                />
                <div 
                  className={combineStyles('w-2 h-2 bg-emerald-400 rounded-full', ANIMATION_STYLES.animatePulse)}
                  style={{ animationDelay: ANIMATION_DELAYS.PULSE_3 }}
                />
              </div>
              <span className={combineStyles(TEXT_STYLES.mutedXs, 'text-emerald-300')}>
                实时流式生成
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 只显示错误状态，移除 loading preview 提示
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