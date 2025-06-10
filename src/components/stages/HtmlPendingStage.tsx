import React from 'react';
import { ReportInputForm } from '../ReportInputForm';
import { OutputDisplay } from '../OutputDisplay';
import { ChatPanel } from '../ChatPanel';
import { useAppState, useAppActions } from '../../contexts/AppContext';
import { CONTAINER_STYLES, LAYOUT_STYLES, combineStyles } from '../../utils/styleConstants';

export const HtmlPendingStage: React.FC = React.memo(() => {
  const { 
    reportText,
    generatedPlan,
    generatedHtml,
    isLoading,
    appStage,
    planModel,
    htmlModel,
    activeTab,
    planChatMessages,
    isPlanChatLoading,
    planChatModel,
    maxThinking
  } = useAppState();
  
  const { 
    setReportText,
    handleGeneratePlan,
    handleStartNewSession,
    handleResetToInitial,
    handleStopGeneration,
    setPlanModel,
    setActiveTab,
    setMaxThinking,
    handleSendPlanChatMessage,
    handlePlanChatModelChange,
    isPlanChatAvailable,
    onCopyCode,
    onDownloadHtml,
    onToggleFullPreview,
    onHtmlContentChange
  } = useAppActions();

  return (
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
      <div className={combineStyles('md:col-span-2', LAYOUT_STYLES.flexCol, LAYOUT_STYLES.overflowHidden, LAYOUT_STYLES.fullHeight)}>
        <OutputDisplay
          htmlContent={generatedHtml}
          isLoading={isLoading}
          error={null}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onCopyCode={onCopyCode}
          onDownloadHtml={onDownloadHtml}
          onToggleFullPreview={onToggleFullPreview}
          isFullPreviewActive={false}
          appStage={appStage}
          onHtmlContentChange={onHtmlContentChange}
          className={LAYOUT_STYLES.fullHeight}
          streamingModel={htmlModel}
        />
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
          maxThinking={maxThinking}
          onMaxThinkingChange={setMaxThinking}
        />
      </div>
    </>
  );
});