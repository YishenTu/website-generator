import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { TabNavigation } from "./components/TabNavigation";
import { TabContent } from "./components/TabContent";
import { ChatPanel } from "./components/ChatPanel";
import { SettingsSidebar } from "./components/SettingsSidebar";
import { OutputDisplay } from "./components/OutputDisplay";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppProvider, type AppContextType } from './contexts/AppContext';
import { ConfirmationProvider } from './contexts/ConfirmationContext';
import { copyHtmlToClipboard, downloadHtmlFile } from './components/fileUtils';
import { ActiveTab } from './types/types';
import { useWebsiteGeneration } from './hooks/useWebsiteGeneration';
import { validateEnvironmentVariables } from './utils/envValidator';
import { logger } from './utils/logger';
import { getEnvVar } from './utils/env';
import { LAYOUT_STYLES, combineStyles } from './utils/styleConstants';
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
    outputType,
    theme,
    language,
    
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
    setOutputType,
    setTheme,
    setLanguage,
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
      maxThinking,
      outputType,
      theme,
      language
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
      setIsRefineMode,
      setOutputType,
      setTheme,
      setLanguage
    }
  }), [
    // State dependencies
    appStage, isRefineMode, reportText, generatedPlan, generatedHtml,
    planModel, htmlModel, chatModel, planChatModel,
    isLoading, isChatLoading, isPlanChatLoading,
    activeTab, chatMessages, planChatMessages, maxThinking, outputType, theme, language,
    // Action dependencies
    setReportText, handleGeneratePlan, handleGenerateHtmlFromPlan,
    handleStartNewSession, handleResetToInitial, handleStopGeneration,
    handleSendChatMessage, handleSendPlanChatMessage,
    setPlanModel, setHtmlModel, setChatModel, setPlanChatModel,
    setActiveTab, setMaxThinking, initializePlanChatSession,
    isChatAvailable, isPlanChatAvailable, handlePlanChatModelChange,
    handleChatModelChange, handleCopyCode, handleDownloadHtml,
    toggleFullPreview, handleHtmlContentChange, setIsRefineMode, setOutputType, setTheme, setLanguage
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
    <ConfirmationProvider>
      <AppProvider value={contextValue}>
      <div className={combineStyles(LAYOUT_STYLES.flexCol, 'h-screen p-4 md:p-6 bg-black text-slate-100 overflow-hidden')}>
        {/* Header */}
        <header className={combineStyles('mb-4 md:mb-6', LAYOUT_STYLES.flexShrink0, LAYOUT_STYLES.relative)}>
          <div className="text-center relative">
            {/* Cyberpunk Title with Enhanced Effects */}
            <div className="relative">
              <h1 className="text-4xl md:text-6xl font-black mb-2 relative font-orbitron tracking-wider">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-ice-blue bg-clip-text text-transparent bg-[length:200%_100%] animate-[gradient_6s_ease-in-out_infinite] drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                  FROSTBYTE
                </span>
                <span className="ml-3 bg-gradient-to-r from-blue-300 via-cyan-300 to-white bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-reverse drop-shadow-[0_0_15px_rgba(147,197,253,0.3)]">
                  AI
                </span>
                
                {/* Multiple Glow Layers */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-ice-blue bg-clip-text text-transparent blur-sm opacity-30 bg-[length:200%_100%] animate-[gradient_6s_ease-in-out_infinite]">
                  FROSTBYTE
                </span>
                <span className="absolute inset-0 ml-3 bg-gradient-to-r from-blue-300 via-cyan-300 to-white bg-clip-text text-transparent blur-sm opacity-30 bg-[length:200%_100%] animate-gradient-reverse">
                  AI
                </span>
                
                {/* Outer Glow */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-ice-blue bg-clip-text text-transparent blur-lg opacity-15 bg-[length:200%_100%] animate-[gradient_6s_ease-in-out_infinite] scale-110">
                  FROSTBYTE
                </span>
                <span className="absolute inset-0 ml-3 bg-gradient-to-r from-blue-300 via-cyan-300 to-white bg-clip-text text-transparent blur-lg opacity-15 bg-[length:200%_100%] animate-gradient-reverse scale-110">
                  AI
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-xs md:text-sm font-rajdhani font-medium text-cyan-400/70 tracking-[0.3em] uppercase">
                Neural Website Generator
              </p>
            </div>
            
            {/* Enhanced Decorative Elements */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-[35rem] h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-70 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-[25rem] h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-[30rem] h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60 shadow-[0_0_8px_rgba(59,130,246,0.4)]"></div>
            <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 w-[20rem] h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40"></div>
            
            {/* Side Accents */}
            <div className="absolute top-1/2 -left-8 w-2 h-2 bg-cyan-400 blur-sm opacity-60 animate-pulse"></div>
            <div className="absolute top-1/2 -right-8 w-2 h-2 bg-blue-400 blur-sm opacity-60 animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
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
            <div className={`${(activeTab === ActiveTab.Input || isRefineMode) ? 'flex-1 min-w-0' : 'w-full'} transition-all duration-300`}>
              <TabContent activeTab={activeTab} appStage={appStage} />
            </div>
            
            {/* Settings Sidebar for Input tab, Chat panel for other tabs */}
            {activeTab === ActiveTab.Input ? (
              <SettingsSidebar />
            ) : isRefineMode && (
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
    </ConfirmationProvider>
  );
};

// 包装App组件与错误边界
const AppWithErrorBoundary: React.FC = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWithErrorBoundary;
