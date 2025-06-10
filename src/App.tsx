import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AppStages } from "./components/AppStages";
import { OutputDisplay } from "./components/OutputDisplay";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppProvider, type AppContextType } from './contexts/AppContext';
import { ArrowPathIcon } from './components/icons';
import { copyHtmlToClipboard, downloadHtmlFile } from './components/fileUtils';
import { ActiveTab } from './types/types';
import { useWebsiteGeneration } from './hooks/useWebsiteGeneration';
import { validateEnvironmentVariables } from './utils/envValidator';
import { logger } from './utils/logger';
import { getEnvVar } from './utils/env';
import { CONTAINER_STYLES, TEXT_STYLES, BUTTON_STYLES, LAYOUT_STYLES, ICON_SIZES, combineStyles } from './utils/styleConstants';
import { UI_TEXT, FILE } from './utils/constants';

export type AppStage = 'initial' | 'planPending' | 'planReady' | 'htmlPending' | 'htmlReady';

const App: React.FC = () => {
  // Validate environment variables on mount
  useEffect(() => {
    const validation = validateEnvironmentVariables();
    if (!validation.isValid) {
      // 在生产环境中，这可能需要显示一个更友好的错误界面
      logger.error('Environment validation failed. Please check your configuration.');
    }
  }, []);

  // Initialize GoogleGenAI
  const ai = useRef(new GoogleGenAI({ apiKey: getEnvVar('GEMINI_API_KEY') })).current;

  // Use the website generation hook
  const {
    // State
    reportText,
    generatedPlan,
    generatedHtml,
    planModel,
    htmlModel,
    chatModel,
    planChatModel,
    isLoading,
    isChatLoading,
    isPlanChatLoading,
    error,
    appStage,
    activeTab,
    isFullPreviewActive,
    isRefineMode,
    chatMessages,
    planChatMessages,
    maxThinking,
    
    // Actions
    setReportText,
    setPlanModel,
    setHtmlModel,
    setChatModel,
    setPlanChatModel,
    setActiveTab,
    setIsFullPreviewActive,
    setIsRefineMode,
    setGeneratedHtml,
    handleGeneratePlan,
    handleGenerateHtmlFromPlan,
    handleSendChatMessage,
    handleSendPlanChatMessage,
    handleChatModelChange,
    handlePlanChatModelChange,
    handleStopGeneration,
    handleResetToInitial,
    handleStartNewSession,
    initializePlanChatSession,
    isChatAvailable,
    isPlanChatAvailable,
    setMaxThinking,
  } = useWebsiteGeneration({ ai });

  // Memoized action handlers
  const handleCopyCode = useCallback(async () => {
    if (generatedHtml) {
      const success = await copyHtmlToClipboard(generatedHtml);
      if (success) {
        alert(UI_TEXT.COPY_SUCCESS);
      } else {
        alert(UI_TEXT.COPY_FAILED);
      }
    }
  }, [generatedHtml]);

  const handleDownloadHtml = useCallback(() => {
    if (generatedHtml) {
      downloadHtmlFile(generatedHtml, FILE.DEFAULT_HTML_NAME);
    }
  }, [generatedHtml]);

  const toggleFullPreview = useCallback(() => {
    if (generatedHtml) {
      setIsFullPreviewActive(!isFullPreviewActive);
    }
  }, [generatedHtml, isFullPreviewActive, setIsFullPreviewActive]);
  
  const handleHtmlContentChange = useCallback((newHtml: string) => {
    setGeneratedHtml(newHtml);
  }, [setGeneratedHtml]);

  // Memoized context value
  const contextValue = useMemo((): AppContextType => ({
    state: {
      appStage,
      isRefineMode,
      reportText,
      generatedPlan,
      generatedHtml,
      planModel,
      htmlModel,
      chatModel,
      planChatModel,
      isLoading,
      isChatLoading,
      isPlanChatLoading,
      activeTab,
      chatMessages,
      planChatMessages,
      maxThinking
    },
    actions: {
      setReportText,
      handleGeneratePlan,
      handleGenerateHtmlFromPlan,
      handleStartNewSession,
      handleResetToInitial,
      handleStopGeneration,
      handleSendChatMessage,
      handleSendPlanChatMessage,
      setPlanModel,
      setHtmlModel,
      setChatModel,
      setPlanChatModel,
      setActiveTab,
      setMaxThinking,
      initializePlanChatSession,
      isChatAvailable,
      isPlanChatAvailable,
      handlePlanChatModelChange,
      handleChatModelChange,
      onCopyCode: handleCopyCode,
      onDownloadHtml: handleDownloadHtml,
      onToggleFullPreview: toggleFullPreview,
      onHtmlContentChange: handleHtmlContentChange,
      setIsRefineMode
    }
  }), [
    // State dependencies
    appStage, isRefineMode, reportText, generatedPlan, generatedHtml,
    planModel, htmlModel, chatModel, planChatModel,
    isLoading, isChatLoading, isPlanChatLoading,
    activeTab, chatMessages, planChatMessages, maxThinking,
    // Action dependencies
    setReportText, handleGeneratePlan, handleGenerateHtmlFromPlan,
    handleStartNewSession, handleResetToInitial, handleStopGeneration,
    handleSendChatMessage, handleSendPlanChatMessage,
    setPlanModel, setHtmlModel, setChatModel, setPlanChatModel,
    setActiveTab, setMaxThinking, initializePlanChatSession,
    isChatAvailable, isPlanChatAvailable, handlePlanChatModelChange,
    handleChatModelChange, handleCopyCode, handleDownloadHtml,
    toggleFullPreview, handleHtmlContentChange, setIsRefineMode
  ]);

  // Handle ESC key for full preview
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullPreviewActive) {
        setIsFullPreviewActive(false);
      }
    };
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isFullPreviewActive, setIsFullPreviewActive]);

  // Determine grid classes based on stage
  const getMainGridClasses = () => {
    switch (appStage) {
      case 'planPending':
        return 'md:grid-cols-2 grid-cols-1 gap-4 md:gap-6 min-h-0';
      case 'planReady':
        return isRefineMode 
          ? 'md:grid-cols-5 grid-cols-1 gap-4 md:gap-6 min-h-0'
          : 'md:grid-cols-2 grid-cols-1 gap-4 md:gap-6 min-h-0';
      case 'htmlPending':
      case 'htmlReady':
        return 'md:grid-cols-5 grid-cols-1 gap-4 md:gap-6 min-h-0';
      default:
        return 'grid-cols-1 gap-4 md:gap-6 min-h-0';
    }
  };

  // Full preview mode
  if (isFullPreviewActive && generatedHtml) {
    return (
      <AppProvider value={contextValue}>
        <OutputDisplay
          htmlContent={generatedHtml}
          isLoading={false}
          error={null}
          activeTab={ActiveTab.Preview}
          onTabChange={() => {}}
          onCopyCode={handleCopyCode}
          onDownloadHtml={handleDownloadHtml}
          onToggleFullPreview={toggleFullPreview}
          isFullPreviewActive={true}
          appStage={appStage}
          onHtmlContentChange={handleHtmlContentChange}
          className="h-full w-full"
        />
      </AppProvider>
    );
  }

  // Main app layout
  return (
    <AppProvider value={contextValue}>
      <div className={combineStyles(LAYOUT_STYLES.flexCol, 'h-screen p-4 md:p-6 bg-slate-900 text-slate-100 overflow-hidden')}>
        {/* Header */}
        <header className={combineStyles('mb-4 md:mb-6', LAYOUT_STYLES.flexShrink0, LAYOUT_STYLES.relative)}>
          <h1 className="text-3xl md:text-4xl font-bold text-sky-500 text-center">
            {UI_TEXT.APP_TITLE}
          </h1>
          <p className="text-slate-400 text-center mt-1 text-sm md:text-base">
            {UI_TEXT.APP_SUBTITLE}
          </p>
          {appStage === 'htmlReady' && (
            <button
              onClick={handleStartNewSession}
              className={combineStyles(
                'absolute top-0 right-0',
                LAYOUT_STYLES.flexCenter,
                BUTTON_STYLES.base,
                BUTTON_STYLES.primary,
                BUTTON_STYLES.smallButton,
                'py-2 px-3'
              )}
              aria-label="Start a new session"
              disabled={isLoading || isChatLoading}
            >
              <ArrowPathIcon className={combineStyles(ICON_SIZES.xs, 'mr-1.5')} /> New Session
            </button>
          )}
        </header>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/70 text-red-200 border border-red-700 rounded-md text-center text-sm shadow-lg" role="alert">
            {error}
          </div>
        )}
        
        {/* Main content grid */}
        <main className={combineStyles(LAYOUT_STYLES.flexGrow, 'grid', getMainGridClasses(), appStage === 'initial' ? 'place-items-start justify-center' : '')}>
          <AppStages />
        </main>
      </div>
    </AppProvider>
  );
};

// 包装App组件与错误边界
const AppWithErrorBoundary: React.FC = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWithErrorBoundary;
