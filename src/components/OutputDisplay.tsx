import React, { useState, useRef, useEffect } from 'react';
import { ActiveTab } from '../types/types';
import { LoadingSpinner } from './LoadingSpinner';
import { TabButton } from './TabButton';
import type { AppStage } from '../App'; 

interface OutputDisplayProps {
  htmlContent: string | null;
  isLoading: boolean;
  error: string | null;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onCopyCode: () => void;
  onDownloadHtml: () => void;
  onToggleFullPreview: () => void;
  isFullPreviewActive: boolean;
  appStage: AppStage;
  className?: string;
  onHtmlContentChange?: (newHtml: string) => void; // New prop for editable code view
}

// ... (SVG Icons remain the same) ...
const DocumentDuplicateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
  </svg>
);

const ArrowDownTrayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const ArrowTopRightOnSquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>
);

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const InitialStateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-2 text-slate-600" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 5.25 6h.008a2.25 2.25 0 0 1 2.242 2.123M8.25 12h.008v.008H8.25V12Zm0 3h.008v.008H8.25V15Zm0 3h.008v.008H8.25V18Zm-4.5-3H3.75A2.25 2.25 0 0 1 1.5 12.75V6.75A2.25 2.25 0 0 1 3.75 4.5h13.5A2.25 2.25 0 0 1 19.5 6.75v6A2.25 2.25 0 0 1 17.25 15H9.75Z" />
  </svg>
);

const PlanReadyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-2 text-slate-600" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h.01M15 12h.01M10.5 16.5h3M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9Zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6Z" />
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 8.25h3M12 21V12m0-9v2.25m0 13.5V18M3.27 10.5H5.52m13.06-.002H16.48m-10.965 6L7.015 15m9.97 1.5-.005-1.505M7.5 12a4.5 4.5 0 0 1 4.5-4.5 4.502 4.502 0 0 1 2.858 1.023" />
</svg>
);

export const OutputDisplay: React.FC<OutputDisplayProps> = ({
  htmlContent,
  isLoading,
  error,
  activeTab,
  onTabChange,
  onCopyCode,
  onDownloadHtml,
  onToggleFullPreview,
  isFullPreviewActive,
  appStage,
  className = "", 
  onHtmlContentChange,
}) => {
  const baseContainerClasses = "flex flex-col bg-slate-800 rounded-lg shadow-lg";
  const fullPreviewClasses = "fixed inset-0 z-50 bg-slate-900 flex flex-col";
  
  const containerClasses = isFullPreviewActive
    ? fullPreviewClasses
    : `${baseContainerClasses} ${className} ${className.includes('h-full') ? '' : 'h-full'}`;

  let placeholderTextContent = null;
  // Determine placeholder content only if htmlContent is truly null (not empty string for streaming)
  // and not in full preview.
  if (htmlContent === null && !isLoading && !error && !isFullPreviewActive) {
    if (appStage === 'initial' || appStage === 'planPending') {
      placeholderTextContent = (
        <>
          <InitialStateIcon />
          <p className="text-lg">Your generated website will appear here.</p>
          <p className="text-sm">Enter a report and click "Generate Plan" to begin.</p>
        </>
      );
    } else if (appStage === 'planReady' || appStage === 'htmlPending') {
      placeholderTextContent = (
        <>
          <PlanReadyIcon />
          <p className="text-lg">Plan generated. Awaiting website creation.</p>
          <p className="text-sm">Review the plan and proceed to "Generate Website from Plan".</p>
        </>
      );
    }
  }
  
  // Main loading spinner for non-htmlReady stages OR if htmlContent is still null in htmlReady
  const showMainSpinner = isLoading && 
                         (appStage === 'planPending' || appStage === 'htmlPending' || 
                         (appStage === 'htmlReady' && htmlContent === null));

  return (
    <div className={`${containerClasses} ${isFullPreviewActive ? '' : 'p-4'}`}>
      {!isFullPreviewActive && (
        <div className="flex mb-3 border-b border-slate-700 flex-shrink-0">
          <TabButton
            label="Preview"
            isActive={activeTab === ActiveTab.Preview}
            onClick={() => onTabChange(ActiveTab.Preview)}
            disabled={htmlContent === null || (isLoading && appStage !== 'htmlReady')} // Disable if no content or loading non-HTML
          />
          <TabButton
            label="Code"
            isActive={activeTab === ActiveTab.Code}
            onClick={() => onTabChange(ActiveTab.Code)}
            disabled={htmlContent === null || (isLoading && appStage !== 'htmlReady')} // Disable if no content or loading non-HTML
          />
           {isLoading && appStage === 'htmlReady' && htmlContent !== null && (
            <div className="ml-auto flex items-center px-3">
              <LoadingSpinner className="w-5 h-5 text-sky-400" />
              <span className="ml-2 text-sm text-slate-400">Streaming...</span>
            </div>
          )}
        </div>
      )}

      {isFullPreviewActive && htmlContent && (
         <button
            onClick={onToggleFullPreview}
            className="absolute top-4 right-4 z-[60] bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-3 rounded-full shadow-lg flex items-center justify-center transition-colors text-sm"
            aria-label="Exit Full Preview"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
      )}

      <div className={`flex-grow relative min-h-0 ${isFullPreviewActive ? 'h-full w-full' : ''}`}>
        {showMainSpinner && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 bg-opacity-80 z-10 rounded-b-md">
            <LoadingSpinner className="w-12 h-12 text-sky-500" />
            <p className="mt-3 text-lg text-slate-300">
              {appStage === 'planPending' ? 'Generating your website plan...' : 
               appStage === 'htmlPending' ? 'Preparing for website generation...' :
               'Generating your website...'}
            </p>
          </div>
        )}
        {error && !showMainSpinner && ( // Show error if not already showing main spinner
          <div className="h-full flex items-center justify-center p-4">
            <div className="text-center bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-md">
              <h3 className="font-semibold text-lg mb-1">Operation Failed</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {placeholderTextContent && !showMainSpinner && !error && ( // Show placeholder if no spinner, error, and conditions met
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <div className="text-slate-500">
                    {placeholderTextContent}
                </div>
            </div>
        )}

        {/* Render content area if htmlContent is not null (even empty string) and no error, or if full preview active */}
        {(htmlContent !== null && !error) || (isFullPreviewActive && htmlContent !== null) ? (
          <>
            {activeTab === ActiveTab.Preview && (
              <iframe
                // Use a key that changes with htmlContent to force iframe reload if srcDoc is not reliably refreshing
                key={isFullPreviewActive ? 'full-preview' : `preview-${htmlContent ? htmlContent.length : '0'}`}
                srcDoc={htmlContent || ''}
                title="Website Preview"
                className={`w-full h-full border-0 ${isFullPreviewActive ? '' : 'rounded-b-md'} bg-white`}
                sandbox="allow-scripts allow-same-origin"
              />
            )}
            {activeTab === ActiveTab.Code && (
              <textarea
                value={htmlContent || ''} // Ensure value is never null
                onChange={(e) => onHtmlContentChange && onHtmlContentChange(e.target.value)}
                disabled={!onHtmlContentChange || isFullPreviewActive} // Disable if no handler or in full preview
                className={`w-full h-full p-3 font-mono text-sm bg-slate-900 text-slate-300 border ${isFullPreviewActive ? 'border-transparent' : 'border-slate-700 rounded-b-md'} resize-none focus:outline-none focus:ring-1 focus:ring-sky-600 custom-scrollbar ${(!onHtmlContentChange || isFullPreviewActive) ? 'cursor-not-allowed opacity-80' : '' }`}
                aria-label="Generated HTML Code"
              />
            )}
          </>
        ) : null}
      </div>

      {!isFullPreviewActive && htmlContent && !isLoading && !error && appStage === 'htmlReady' && (
        <div className="mt-4 pt-4 border-t border-slate-700 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0">
          <button
            onClick={onToggleFullPreview}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors text-sm"
            aria-label="Full Preview"
          >
            <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
            Full Preview
          </button>
          <button
            onClick={onCopyCode}
            className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors text-sm"
            aria-label="Copy HTML code"
          >
            <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
            Copy Code
          </button>
          <button
            onClick={onDownloadHtml}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors text-sm"
            aria-label="Download HTML file"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Download
          </button>
        </div>
      )}
    </div>
  );
};
