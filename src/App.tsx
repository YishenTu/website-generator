import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { TabNavigation } from "./components/TabNavigation";
import { TabContent } from "./components/TabContent";
import { ChatPanel } from "./components/ChatPanel";
// Lazy-load SettingsSidebar to reduce initial bundle (Task 5.2)
const SettingsSidebarLazy = React.lazy(() => import('./components/SettingsSidebar').then(m => ({ default: m.SettingsSidebar })));
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
import { performanceMonitor } from './utils/performanceMonitor';
import { usePerformanceMode } from './hooks/usePerformanceMode';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';

export type AppStage = 'initial' | 'planPending' | 'planReady' | 'htmlPending' | 'htmlReady';

// Inner component that uses the hooks and needs the providers
const AppContent: React.FC<{ ai: GoogleGenAI }> = ({ ai }) => {
  // Performance monitoring state
  const [isPerformanceMonitoringEnabled, setIsPerformanceMonitoringEnabled] = React.useState(false);

  // Title animation visibility observer (Task 3.2)
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const isTitleVisible = useIntersectionObserver(titleRef as React.RefObject<Element>, {
    rootMargin: '0px',
    threshold: 0.1, // Trigger when 10% of title is visible
    onVisibilityChange: (isVisible) => {
      // Optional: Log visibility changes for debugging
      if (process.env.NODE_ENV === 'development') {
        logger.info(`Title animation visibility: ${isVisible}`);
      }
    }
  });

  // Performance mode hook (Task 2.2)
  const {
    performanceMode,
    level: performanceLevel,
    setLevel: setPerformanceLevel,
    toggleEnabled: togglePerformanceMode,
    prefersReducedMotion
  } = usePerformanceMode();

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

  // Performance monitoring control functions
  const togglePerformanceMonitoring = useCallback(() => {
    if (isPerformanceMonitoringEnabled) {
      performanceMonitor.stopMonitoring();
      setIsPerformanceMonitoringEnabled(false);
      logger.info('Performance monitoring disabled');
    } else {
      performanceMonitor.startMonitoring();
      setIsPerformanceMonitoringEnabled(true);
      logger.info('Performance monitoring enabled - press Ctrl+Shift+P to log metrics');
    }
  }, [isPerformanceMonitoringEnabled]);

  const logPerformanceMetrics = useCallback(() => {
    if (isPerformanceMonitoringEnabled) {
      performanceMonitor.logMetrics();
    } else {
      logger.warn('Performance monitoring is not enabled');
    }
  }, [isPerformanceMonitoringEnabled]);

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
      language,
      // Performance mode state (Task 2.2)
      performanceMode,
      performanceLevel,
      prefersReducedMotion
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
      setLanguage,
      // Performance mode actions (Task 2.2)
      setPerformanceLevel,
      togglePerformanceMode
    }
  }), [
    // State dependencies
    appStage, isRefineMode, reportText, generatedPlan, generatedHtml,
    planModel, htmlModel, chatModel, planChatModel,
    isLoading, isChatLoading, isPlanChatLoading,
    activeTab, chatMessages, planChatMessages, maxThinking, outputType, theme, language,
    performanceMode, performanceLevel, prefersReducedMotion,
    // Action dependencies
    setReportText, handleGeneratePlan, handleGenerateHtmlFromPlan,
    handleStartNewSession, handleResetToInitial, handleStopGeneration,
    handleSendChatMessage, handleSendPlanChatMessage,
    setPlanModel, setHtmlModel, setChatModel, setPlanChatModel,
    setActiveTab, setMaxThinking, initializePlanChatSession,
    isChatAvailable, isPlanChatAvailable, handlePlanChatModelChange,
    handleChatModelChange, handleCopyCode, handleDownloadHtml,
    toggleFullPreview, handleHtmlContentChange, setIsRefineMode, setOutputType, setTheme, setLanguage,
    setPerformanceLevel, togglePerformanceMode
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

  // Handle keyboard shortcuts for performance monitoring
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Shift+M: Toggle performance monitoring
      if (event.ctrlKey && event.shiftKey && event.key === 'M') {
        event.preventDefault();
        togglePerformanceMonitoring();
      }
      // Ctrl+Shift+P: Log performance metrics
      else if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        logPerformanceMetrics();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePerformanceMonitoring, logPerformanceMetrics]);

  // Cleanup performance monitoring on unmount
  useEffect(() => {
    return () => {
      if (isPerformanceMonitoringEnabled) {
        performanceMonitor.stopMonitoring();
      }
    };
  }, []);

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
      <div className={combineStyles(
        LAYOUT_STYLES.flexCol, 
        'h-screen p-4 md:p-6 bg-black text-slate-100 overflow-hidden',
        // Performance mode CSS classes (Task 2.2)
        `perf-${performanceLevel}`,
        prefersReducedMotion ? 'reduce-motion' : ''
      )}>
        {/* Header */}
        <header className={combineStyles('mb-4 md:mb-6', LAYOUT_STYLES.flexShrink0, LAYOUT_STYLES.relative)}>
          <div className="text-center relative">
            {/* Optimized Cyberpunk Title with GPU-Accelerated Animation */}
            <div className="relative">
              <h1 
                ref={titleRef}
                className="text-4xl md:text-6xl font-black mb-2 relative font-orbitron tracking-wider"
              >
                {/* Single optimized animated layer with visibility-based animation control */}
                <span className={combineStyles(
                  "relative inline-block will-change-transform text-shadow-glow",
                  "animate-title-gradient",
                  // Apply animation pause/resume based on visibility and motion preferences (Task 3.2)
                  !isTitleVisible || prefersReducedMotion ? "animation-paused" : "animation-running"
                )}>
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-ice-blue bg-clip-text text-transparent">
                    FROSTBYTE
                  </span>
                  <span className="ml-3 bg-gradient-to-r from-blue-300 via-cyan-300 to-white bg-clip-text text-transparent">
                    AI
                  </span>
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-xs md:text-sm font-rajdhani font-medium text-cyan-400/70 tracking-[0.3em] uppercase">
                Neural Website Generator
                {isPerformanceMonitoringEnabled && (
                  <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">
                    PERF MONITORING
                  </span>
                )}
              </p>
            </div>
            
            {/* Enhanced Decorative Elements with will-change optimization for transform
                 Note: These elements use static transforms, so will-change: auto is appropriate
                 to avoid unnecessary GPU layers for non-animating elements */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-[35rem] h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-70 border-t border-cyan-500/30 will-change-auto"></div>
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-[25rem] h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50 will-change-auto"></div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-[30rem] h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60 border-b border-blue-500/30 will-change-auto"></div>
            <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 w-[20rem] h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40 will-change-auto"></div>
            
            {/* Side Accents with visibility-based animation throttling and will-change for opacity
                 Note: will-change-opacity is applied during animation, will-change-auto when paused
                 This prevents memory leaks when animations are not visible or disabled */}
            <div className={combineStyles(
              "absolute top-1/2 -left-8 w-2 h-2 bg-cyan-400 blur-sm opacity-60 animate-pulse will-change-opacity",
              !isTitleVisible || prefersReducedMotion ? "animation-paused will-change-auto" : "animation-running"
            )}></div>
            <div className={combineStyles(
              "absolute top-1/2 -right-8 w-2 h-2 bg-blue-400 blur-sm opacity-60 animate-pulse will-change-opacity",
              !isTitleVisible || prefersReducedMotion ? "animation-paused will-change-auto" : "animation-running"
            )} style={{animationDelay: '1s'}}></div>
          </div>
        </header>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 glass-effect bg-red-600/20 text-red-200 border border-red-500/50 rounded-lg text-center text-sm shadow-lg" role="alert">
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
            {/* Main content panel with will-change during transitions
                 Note: will-change-on-hover optimizes layout transitions when panel size changes */}
            <div className={`${(activeTab === ActiveTab.Input || isRefineMode) ? 'flex-1 min-w-0' : 'w-full'} transition-[transform,opacity] duration-200 will-change-on-hover`}>
              <TabContent activeTab={activeTab} appStage={appStage} />
            </div>
            
            {/* Settings Sidebar for Input tab, Chat panel for other tabs */}
            {activeTab === ActiveTab.Input ? (
              <React.Suspense
                fallback={(
                  <aside className="w-80 flex-shrink-0">
                    <div className="glass-effect bg-slate-900/60 border border-cyan-500/30 rounded-lg p-6 shadow-md h-full animate-pulse">
                      <div className="h-5 w-2/3 bg-white/10 rounded mb-4" />
                      <div className="space-y-3">
                        <div className="h-9 bg-white/10 rounded" />
                        <div className="h-9 bg-white/10 rounded" />
                        <div className="h-9 bg-white/10 rounded" />
                      </div>
                    </div>
                  </aside>
                )}
              >
                <SettingsSidebarLazy />
              </React.Suspense>
            ) : isRefineMode && (
              <div className="w-80 flex-shrink-0 transition-[opacity,transform] duration-200 will-change-on-hover">
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

// Main App component that provides the context and initializes AI
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

  return (
    <ConfirmationProvider>
      <AppContent ai={ai} />
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
