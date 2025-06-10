import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ActiveTab } from '../types/types';
import { CodeEditor } from './CodeEditor';
import { PreviewLoader } from './PreviewLoader';

import { useDebounce } from '../hooks/useDebounce';
import { 
  DocumentDuplicateIcon, 
  ArrowDownTrayIcon, 
  ArrowTopRightOnSquareIcon, 
  XMarkIcon,
  InitialStateIcon,
  PlanReadyIcon 
} from './icons';
import type { AppStage } from '../App'; 
import { CONTAINER_STYLES, TEXT_STYLES, BUTTON_STYLES, LAYOUT_STYLES, ICON_SIZES, combineStyles } from '../utils/styleConstants';
import { UI_TEXT, DELAYS } from '../utils/constants';


interface OutputDisplayProps {
  htmlContent: string | null;
  isLoading: boolean;
  error: string | null;
  activeTab: ActiveTab;
  onCopyCode: () => void;
  onDownloadHtml: () => void;
  onToggleFullPreview: () => void;
  isFullPreviewActive: boolean;
  appStage: AppStage;
  className?: string;
  onHtmlContentChange?: (newHtml: string) => void; // New prop for editable code view
}

export const OutputDisplay: React.FC<OutputDisplayProps> = React.memo(({
  htmlContent,
  isLoading,
  error,
  activeTab,
  onCopyCode,
  onDownloadHtml,
  onToggleFullPreview,
  isFullPreviewActive,
  appStage,
  className = "", 
  onHtmlContentChange,
}) => {
  // 添加iframe加载状态
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  
  // Create ref for iframe element
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 使用防抖动的HTML内容，减少iframe频繁更新
  const shouldDebounce = isLoading && appStage === 'htmlReady';
  const debouncedHtmlContent = useDebounce(htmlContent, shouldDebounce ? DELAYS.DEBOUNCE_INPUT : 0);

  // iframe加载处理函数
  const handleIframeLoad = useCallback(() => {
    setIsIframeLoading(false);
    setIframeError(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIsIframeLoading(false);
    setIframeError(true);
  }, []);

  // 重置iframe状态当内容变化时
  useEffect(() => {
    if (debouncedHtmlContent !== null) {
      setIsIframeLoading(true);
      setIframeError(false);
    }
  }, [debouncedHtmlContent]);

  // 生成优化的HTML，预加载关键资源
  const optimizedHtmlContent = useMemo(() => {
    if (debouncedHtmlContent === null || debouncedHtmlContent === undefined) return debouncedHtmlContent;
    
    try {
      // 使用DOMParser进行健壮的HTML解析和修改
      const parser = new DOMParser();
      const doc = parser.parseFromString(debouncedHtmlContent, 'text/html');
      
      // 获取head元素（不区分大小写，支持属性）
      const headElement = doc.querySelector('head');
      if (!headElement) {
        // 如果没有head元素，返回原始内容
        return debouncedHtmlContent;
      }
      
      // 创建预加载链接元素
      const preconnectUrls = [
        'https://cdn.tailwindcss.com',
        'https://cdnjs.cloudflare.com',
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net',
        'https://d3js.org'
      ];
      
      // 添加预加载关键资源的注释
      const preloadComment = doc.createComment(' 预加载关键资源 ');
      headElement.appendChild(preloadComment);
      
      // 添加预连接链接
      preconnectUrls.forEach(url => {
        const link = doc.createElement('link');
        link.rel = 'preconnect';
        link.href = url;
        headElement.appendChild(link);
      });
      
      // 检查是否已存在viewport meta标签
      const existingViewport = headElement.querySelector('meta[name="viewport"]');
      if (!existingViewport) {
        const viewportMeta = doc.createElement('meta');
        viewportMeta.name = 'viewport';
        viewportMeta.content = 'width=device-width, initial-scale=1.0';
        headElement.appendChild(viewportMeta);
      }
      
      // 添加优化加载性能的注释
      const optimizationComment = doc.createComment(' 优化加载性能 ');
      headElement.appendChild(optimizationComment);
      
      // 添加样式元素
      const styleElement = doc.createElement('style');
      styleElement.textContent = `
      /* 预加载时显示loading状态 */
      body { 
        opacity: 0; 
        transition: opacity 0.3s ease-in-out; 
      }
      body.loaded { 
        opacity: 1; 
      }
      
      /* 优化字体渲染 */
      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }`;
      headElement.appendChild(styleElement);
      
      // 添加脚本元素
      const scriptElement = doc.createElement('script');
      scriptElement.textContent = `
      // 确保所有资源加载完成后显示内容
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
          document.body.classList.add('loaded');
        }, ${DELAYS.IFRAME_LOAD});
      });
      
      // 处理错误情况
      window.addEventListener('error', function(e) {
        if (e.target && e.target !== window) {
          // 资源加载错误（图片、脚本等）
          // 在开发环境中记录错误
        }
        document.body.classList.add('loaded'); // 即使有错误也显示内容
      });`;
      headElement.appendChild(scriptElement);
      
      // 序列化回HTML字符串并添加 DOCTYPE
      return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
      
    } catch (error) {
      // 如果DOMParser失败，降级到原始内容
      console.warn('Failed to optimize HTML with DOMParser:', error);
      return debouncedHtmlContent;
    }
  }, [debouncedHtmlContent]);

  const handleRetry = useCallback(() => {
    setIsIframeLoading(true);
    setIframeError(false);
    // Force iframe reload by updating the srcdoc using ref
    if (iframeRef.current && optimizedHtmlContent) {
      iframeRef.current.srcdoc = optimizedHtmlContent;
    }
  }, [optimizedHtmlContent]);

  const baseContainerClasses = combineStyles(LAYOUT_STYLES.flexCol, CONTAINER_STYLES.card);
  const fullPreviewClasses = CONTAINER_STYLES.modalOverlay;
  
  const containerClasses = isFullPreviewActive
    ? fullPreviewClasses
    : combineStyles(baseContainerClasses, className, className.includes('h-full') ? '' : LAYOUT_STYLES.fullHeight);

  let placeholderTextContent = null;
  // Determine placeholder content only if htmlContent is truly null (not empty string for streaming)
  // and not in full preview.
  if (htmlContent === null && !isLoading && !error && !isFullPreviewActive) {
    if (appStage === 'initial' || appStage === 'planPending') {
      placeholderTextContent = (
        <>
          <InitialStateIcon />
          <p className={TEXT_STYLES.headingMd}>Your generated website will appear here.</p>
          <p className={TEXT_STYLES.mutedXs}>Enter a report and click "Generate Plan" to begin.</p>
        </>
      );
    } else if (appStage === 'planReady' || appStage === 'htmlPending') {
      placeholderTextContent = (
        <>
          <PlanReadyIcon />
          <p className={TEXT_STYLES.headingMd}>Plan generated. Awaiting website creation.</p>
          <p className={TEXT_STYLES.mutedXs}>Review the plan and proceed to "Generate Website from Plan".</p>
        </>
      );
    }
  }
  

  return (
    <div className={combineStyles(containerClasses, isFullPreviewActive ? '' : CONTAINER_STYLES.cardPadding, isFullPreviewActive ? '' : LAYOUT_STYLES.flexCol)}>


      {isFullPreviewActive && htmlContent && (
         <button
            onClick={onToggleFullPreview}
            className={combineStyles(
              'absolute top-4 right-4 z-[60] bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-3 rounded-full shadow-lg',
              LAYOUT_STYLES.flexCenter,
              BUTTON_STYLES.smallButton,
              'transition-colors'
            )}
            aria-label="Exit Full Preview"
          >
            <XMarkIcon className={ICON_SIZES.sm} />
          </button>
      )}

      <div className={combineStyles(LAYOUT_STYLES.flexGrow, LAYOUT_STYLES.relative, LAYOUT_STYLES.minH0, isFullPreviewActive ? 'h-full w-full' : 'overflow-hidden')}>
        {error && (
          <div className={combineStyles(LAYOUT_STYLES.fullHeight, LAYOUT_STYLES.flexCenter, 'p-4')}>
            <div className="text-center bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-md">
              <h3 className={combineStyles('font-semibold text-lg mb-1')}>{UI_TEXT.ERROR_TITLE}</h3>
              <p className={TEXT_STYLES.mutedXs}>{error}</p>
            </div>
          </div>
        )}
        
        {placeholderTextContent && !error && ( // Show placeholder if no error and conditions met
            <div className={combineStyles(LAYOUT_STYLES.fullHeight, LAYOUT_STYLES.flexCol, LAYOUT_STYLES.flexCenter, 'p-4 text-center')}>
                <div className="text-slate-500">
                    {placeholderTextContent}
                </div>
            </div>
        )}

        {/* PreviewLoader组件 - 处理iframe加载和错误状态 */}
        {activeTab === ActiveTab.Preview && optimizedHtmlContent && (
          <PreviewLoader 
            isLoading={isIframeLoading} 
            hasError={iframeError} 
            onRetry={handleRetry}
          />
        )}

        

        {/* Render content area if htmlContent is not null (even empty string) and no error, or if full preview active */}
        {(optimizedHtmlContent !== null && !error) || (isFullPreviewActive && optimizedHtmlContent !== null) ? (
          <>
            {activeTab === ActiveTab.Preview && (
              <iframe
                ref={iframeRef}
                // 移除key prop，避免不必要的重新创建
                srcDoc={optimizedHtmlContent || ''}
                title="Website Preview"
                className={combineStyles('w-full border-0 h-full', isFullPreviewActive ? '' : 'rounded-md', 'bg-white')}
                sandbox="allow-scripts allow-same-origin allow-downloads"
                loading="eager"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            )}
            {activeTab === ActiveTab.Code && (
              <CodeEditor
                value={htmlContent || ''}
                onChange={onHtmlContentChange}
                readOnly={!onHtmlContentChange || isFullPreviewActive}
                className="w-full h-full"
                autoScrollToBottom={isLoading && appStage === 'htmlPending'}
              />
            )}
          </>
        ) : null}
      </div>

      {!isFullPreviewActive && (appStage === 'htmlPending' || appStage === 'htmlReady') && (
        <div className={combineStyles(
          'mt-4',
          LAYOUT_STYLES.flexShrink0
        )}>
          <div className={combineStyles(
            LAYOUT_STYLES.flexCol,
            'sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3'
          )}>
            <button
              onClick={onToggleFullPreview}
              disabled={!htmlContent || !!error || isLoading || appStage === 'htmlPending'}
              className={combineStyles(
                'flex-1',
                BUTTON_STYLES.base,
                BUTTON_STYLES.blue,
                BUTTON_STYLES.disabled,
                BUTTON_STYLES.smallButton
              )}
              aria-label="Full Preview"
            >
              <ArrowTopRightOnSquareIcon className={combineStyles(ICON_SIZES.xs, 'mr-2')} />
              Full Preview
            </button>
            <button
              onClick={onCopyCode}
              disabled={!htmlContent || !!error || isLoading || appStage === 'htmlPending'}
              className={combineStyles(
                'flex-1',
                BUTTON_STYLES.base,
                BUTTON_STYLES.primary,
                BUTTON_STYLES.disabled,
                BUTTON_STYLES.smallButton
              )}
              aria-label="Copy HTML code"
            >
              <DocumentDuplicateIcon className={combineStyles(ICON_SIZES.xs, 'mr-2')} />
              Copy Code
            </button>
            <button
              onClick={onDownloadHtml}
              disabled={!htmlContent || !!error || isLoading || appStage === 'htmlPending'}
              className={combineStyles(
                'flex-1',
                BUTTON_STYLES.base,
                BUTTON_STYLES.success,
                BUTTON_STYLES.disabled,
                BUTTON_STYLES.smallButton
              )}
              aria-label="Download HTML file"
            >
              <ArrowDownTrayIcon className={combineStyles(ICON_SIZES.xs, 'mr-2')} />
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
