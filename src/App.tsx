import React, { useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ReportInputForm } from './components/ReportInputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { ChatPanel } from './components/ChatPanel';
import { PlanDisplay } from './components/PlanDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
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
    
    // Actions
    setReportText,
    setPlanModel,
    setHtmlModel,
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
  } = useWebsiteGeneration({ ai });

  // Handle copy and download actions
  const handleCopyCode = async () => {
    if (generatedHtml) {
      const success = await copyHtmlToClipboard(generatedHtml);
      if (success) {
        alert(UI_TEXT.COPY_SUCCESS);
      } else {
        alert(UI_TEXT.COPY_FAILED);
      }
    }
  };

  const handleDownloadHtml = () => {
    if (generatedHtml) {
      downloadHtmlFile(generatedHtml, FILE.DEFAULT_HTML_NAME);
    }
  };

  const toggleFullPreview = () => {
    if (generatedHtml) {
      setIsFullPreviewActive(!isFullPreviewActive);
    }
  };
  
  const handleHtmlContentChange = (newHtml: string) => {
    setGeneratedHtml(newHtml);
  };

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
    );
  }

  // Main app layout
  return (
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
        
        {/* Initial state */}
        {appStage === 'initial' && (
          <div className={combineStyles(CONTAINER_STYLES.mainContainer, LAYOUT_STYLES.fullHeight, LAYOUT_STYLES.flexCol, 'py-4 md:py-6')}>
            <ReportInputForm
              reportText={reportText}
              onReportChange={setReportText}
              onGeneratePlan={handleGeneratePlan}
              onStartNewSession={handleStartNewSession}
              onRevisePlan={handleResetToInitial}
              onStop={handleStopGeneration}
              isLoading={isLoading}
              appStage={appStage}
              selectedModel={planModel}
              onModelChange={setPlanModel}
            />
          </div>
        )}

        {/* Plan pending state */}
        {appStage === 'planPending' && (
          <>
            <div className={CONTAINER_STYLES.section}>
              <ReportInputForm
                reportText={reportText}
                onReportChange={setReportText}
                onGeneratePlan={handleGeneratePlan}
                onStartNewSession={handleStartNewSession}
                onRevisePlan={handleResetToInitial}
                onStop={handleStopGeneration}
                isLoading={isLoading}
                appStage={appStage}
                selectedModel={planModel}
                onModelChange={setPlanModel}
              />
            </div>
            <div className={CONTAINER_STYLES.section}>
              <PlanDisplay
                planText={generatedPlan || ''}
                onProceedToHtml={handleGenerateHtmlFromPlan}
                showGenerateButton={true}
                onReviseReportAndPlan={handleResetToInitial}
                isAppLoading={isLoading && appStage === 'planPending'}
                isLoadingHtml={false}
                isCompactView={false}
                htmlModel={htmlModel}
                onHtmlModelChange={setHtmlModel}
              />
            </div>
          </>
        )}

        {/* Plan ready state (non-refine mode) */}
        {appStage === 'planReady' && !isRefineMode && (
          <>
            <div className={CONTAINER_STYLES.section}>
              <ReportInputForm
                reportText={reportText}
                onReportChange={setReportText}
                onGeneratePlan={handleGeneratePlan}
                onStartNewSession={handleStartNewSession}
                onRevisePlan={handleResetToInitial}
                onStop={handleStopGeneration}
                isLoading={isLoading}
                appStage={appStage}
                selectedModel={planModel}
                onModelChange={setPlanModel}
              />
            </div>
            <div className={CONTAINER_STYLES.section}>
              <PlanDisplay
                planText={generatedPlan || ''}
                onProceedToHtml={handleGenerateHtmlFromPlan}
                showGenerateButton={true}
                onReviseReportAndPlan={handleResetToInitial}
                isAppLoading={false}
                isLoadingHtml={false}
                isCompactView={false}
                htmlModel={htmlModel}
                onHtmlModelChange={setHtmlModel}
                onToggleRefine={() => {
                  setIsRefineMode(true);
                  if (generatedPlan && !isPlanChatAvailable()) {
                    initializePlanChatSession(generatedPlan);
                  }
                }}
                showRefineButton={true}
              />
            </div>
          </>
        )}

        {/* Plan ready state (refine mode) */}
        {appStage === 'planReady' && isRefineMode && (
          <>
            <div className={combineStyles('md:col-span-2', CONTAINER_STYLES.section)}>
              <ReportInputForm
                reportText={reportText}
                onReportChange={setReportText}
                onGeneratePlan={handleGeneratePlan}
                onStartNewSession={handleStartNewSession}
                onRevisePlan={handleResetToInitial}
                onStop={handleStopGeneration}
                isLoading={isLoading}
                appStage={appStage}
                selectedModel={planModel}
                onModelChange={setPlanModel}
              />
            </div>
            <div className={combineStyles('md:col-span-2', CONTAINER_STYLES.section)}>
              <PlanDisplay
                planText={generatedPlan || ''}
                onProceedToHtml={handleGenerateHtmlFromPlan}
                showGenerateButton={true}
                onReviseReportAndPlan={handleResetToInitial}
                isAppLoading={false}
                isLoadingHtml={false}
                isCompactView={false}
                htmlModel={htmlModel}
                onHtmlModelChange={setHtmlModel}
                onToggleRefine={() => setIsRefineMode(false)}
                showRefineButton={true}
              />
            </div>
            <div className={combineStyles('md:col-span-1', CONTAINER_STYLES.section)}>
              {generatedPlan !== null && (
                <ChatPanel
                  messages={planChatMessages}
                  onSendMessage={handleSendPlanChatMessage}
                  isLoading={isPlanChatLoading}
                  onStop={handleStopGeneration}
                  chatModel={planChatModel}
                  onChatModelChange={handlePlanChatModelChange}
                  isChatAvailable={isPlanChatAvailable()}
                  title="Refine Plan with Chat"
                />
              )}
            </div>
          </>
        )}

        {/* HTML pending state */}
        {appStage === 'htmlPending' && (
          <>
            <div className={combineStyles('md:col-span-1', CONTAINER_STYLES.section)}>
              {generatedPlan !== null && (
                <ChatPanel
                  messages={planChatMessages}
                  onSendMessage={handleSendPlanChatMessage}
                  isLoading={isPlanChatLoading}
                  onStop={handleStopGeneration}
                  chatModel={planChatModel}
                  onChatModelChange={handlePlanChatModelChange}
                  isChatAvailable={isPlanChatAvailable()}
                  title="Refine Plan with Chat"
                />
              )}
            </div>
            <div className={combineStyles('md:col-span-2', CONTAINER_STYLES.section)}>
              {isLoading && appStage === 'htmlPending' && (
                <div className={combineStyles(LAYOUT_STYLES.flexCol, LAYOUT_STYLES.flexCenter, LAYOUT_STYLES.fullHeight)}>
                  <LoadingSpinner className={combineStyles(ICON_SIZES.xl, 'text-sky-500')} />
                  <p className={combineStyles('mt-3', TEXT_STYLES.muted)}>Preparing for website generation...</p>
                </div>
              )}
            </div>
            <div className={combineStyles('md:col-span-2', CONTAINER_STYLES.section)}>
              <ReportInputForm
                reportText={reportText}
                onReportChange={setReportText}
                onGeneratePlan={handleGeneratePlan}
                onStartNewSession={handleStartNewSession}
                onRevisePlan={handleResetToInitial}
                onStop={handleStopGeneration}
                isLoading={isLoading}
                appStage={appStage}
                selectedModel={planModel}
                onModelChange={setPlanModel}
              />
            </div>
          </>
        )}

        {/* HTML ready state */}
        {appStage === 'htmlReady' && (
          <>
            <div className={combineStyles('md:col-span-1', CONTAINER_STYLES.section)}>
              {generatedHtml !== null && (
                <ChatPanel
                  messages={chatMessages}
                  onSendMessage={handleSendChatMessage}
                  isLoading={isChatLoading}
                  onStop={handleStopGeneration}
                  chatModel={chatModel}
                  onChatModelChange={handleChatModelChange}
                  isChatAvailable={isChatAvailable()}
                />
              )}
              {isLoading && appStage === 'htmlReady' && generatedHtml === null && (
                <div className={combineStyles(LAYOUT_STYLES.flexCol, LAYOUT_STYLES.flexCenter, LAYOUT_STYLES.fullHeight)}>
                  <LoadingSpinner className={combineStyles(ICON_SIZES.xl, 'text-sky-400')} />
                  <p className={combineStyles('mt-2', TEXT_STYLES.muted)}>Generating initial website...</p>
                </div>
              )}
            </div>

            <div className={combineStyles('md:col-span-4', LAYOUT_STYLES.flexCol, LAYOUT_STYLES.overflowHidden, LAYOUT_STYLES.fullHeight)}>
              {(generatedHtml !== null || (isLoading && appStage === 'htmlReady')) && (
                <OutputDisplay
                  htmlContent={generatedHtml || ''}
                  isLoading={isLoading || isChatLoading}
                  error={null}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onCopyCode={handleCopyCode}
                  onDownloadHtml={handleDownloadHtml}
                  onToggleFullPreview={toggleFullPreview}
                  isFullPreviewActive={false}
                  appStage={appStage}
                  onHtmlContentChange={handleHtmlContentChange}
                  className={LAYOUT_STYLES.fullHeight}
                  streamingModel={htmlModel}
                />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

// 包装App组件与错误边界
const AppWithErrorBoundary: React.FC = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWithErrorBoundary;
