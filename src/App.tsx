import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { TabNavigation } from "./components/TabNavigation";
import { TabContent } from "./components/TabContent";
import { ChatPanel } from "./components/ChatPanel";
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

  // Handle tab switching with workflow logic
  const handleTabChange = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
  }, [setActiveTab]);
  
  // Handle refine mode toggle
  const handleToggleRefineMode = useCallback(() => {
    setIsRefineMode(!isRefineMode);
  }, [isRefineMode, setIsRefineMode]);
  
  // Auto-switch tabs based on workflow
  // Note: Manual tab switching is handled directly in generation functions:
  // - handleGeneratePlan switches to Plan tab
  // - handleGenerateHtmlFromPlan switches to Code tab
  // This allows users to manually switch between tabs during generation

  // Full preview mode
  if (isFullPreviewActive && generatedHtml) {
    return (
      <AppProvider value={contextValue}>
        <OutputDisplay
          htmlContent={generatedHtml}
          isLoading={false}
          error={null}
          activeTab={ActiveTab.Preview}
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
      <div className={combineStyles(LAYOUT_STYLES.flexCol, 'h-screen p-4 md:p-6 bg-black text-slate-100 overflow-hidden')}>
        {/* Header */}
        <header className={combineStyles('mb-4 md:mb-6', LAYOUT_STYLES.flexShrink0, LAYOUT_STYLES.relative)}>
          <h1 className="text-3xl md:text-4xl font-bold text-sky-400 text-center">
            {UI_TEXT.APP_TITLE}
          </h1>
          <p className="text-white/70 text-center mt-1 text-sm md:text-base">
            {UI_TEXT.APP_SUBTITLE}
          </p>
        </header>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 glass-effect bg-red-600/20 text-red-200 border border-red-500/30 rounded-lg text-center text-sm shadow-2xl shadow-red-900/50 backdrop-blur-lg" role="alert">
            {error}
          </div>
        )}
        
        {/* Tab Navigation - fixed at 75% width */}
        <div className="flex justify-center mb-6">
          <div className="w-3/4 max-w-7xl">
            <TabNavigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
              appStage={appStage}
              isRefineMode={isRefineMode}
              onToggleRefineMode={handleToggleRefineMode}
              onStartNewSession={handleStartNewSession}
              isLoading={isLoading}
              isChatLoading={isChatLoading}
              streamingModel={appStage === 'htmlPending' || appStage === 'htmlReady' ? htmlModel : planModel}
            />
          </div>
        </div>
        
        {/* Main content area - fixed at 75% width */}
        <main className={combineStyles(LAYOUT_STYLES.flexGrow, 'flex justify-center min-h-0')}>
          <div className="w-3/4 max-w-7xl flex gap-6 min-w-0">
            {/* Main content panel */}
            <div className={`${isRefineMode ? 'flex-1 min-w-0' : 'w-full'} transition-all duration-300`}>
              <TabContent activeTab={activeTab} appStage={appStage} />
            </div>
            
            {/* Chat panel */}
            {isRefineMode && (
              <div className="w-80 flex-shrink-0 transition-all duration-300">
                <ChatPanel
                  messages={activeTab === ActiveTab.Plan ? planChatMessages : chatMessages}
                  onSendMessage={activeTab === ActiveTab.Plan ? handleSendPlanChatMessage : handleSendChatMessage}
                  isLoading={activeTab === ActiveTab.Plan ? isPlanChatLoading : isChatLoading}
                  onStop={handleStopGeneration}
                  chatModel={activeTab === ActiveTab.Plan ? planChatModel : chatModel}
                  onChatModelChange={activeTab === ActiveTab.Plan ? handlePlanChatModelChange : handleChatModelChange}
                  isChatAvailable={activeTab === ActiveTab.Plan ? isPlanChatAvailable() : isChatAvailable()}
                  title={activeTab === ActiveTab.Plan ? "Refine Plan" : "Refine Code"}
                />
              </div>
            )}
          </div>
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
