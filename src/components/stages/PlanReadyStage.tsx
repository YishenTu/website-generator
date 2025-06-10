import React from 'react';
import { ReportInputForm } from '../ReportInputForm';
import { PlanDisplay } from '../PlanDisplay';
import { ChatPanel } from '../ChatPanel';
import { useAppState, useAppActions } from '../../contexts/AppContext';
import { CONTAINER_STYLES, combineStyles } from '../../utils/styleConstants';

export const PlanReadyStage: React.FC = React.memo(() => {
  const { 
    isRefineMode,
    reportText,
    generatedPlan,
    isLoading,
    appStage,
    planModel,
    htmlModel,
    planChatMessages,
    isPlanChatLoading,
    planChatModel,
    maxThinking
  } = useAppState();
  
  const { 
    setReportText,
    handleGeneratePlan,
    handleGenerateHtmlFromPlan,
    handleStartNewSession,
    handleResetToInitial,
    handleStopGeneration,
    setPlanModel,
    setHtmlModel,
    setMaxThinking,
    setIsRefineMode,
    handleSendPlanChatMessage,
    handlePlanChatModelChange,
    initializePlanChatSession,
    isPlanChatAvailable
  } = useAppActions();

  if (isRefineMode) {
    return (
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
            maxThinking={maxThinking}
            onMaxThinkingChange={setMaxThinking}
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
            maxThinking={maxThinking}
            setMaxThinking={setMaxThinking}
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
    );
  }

  return (
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
          maxThinking={maxThinking}
          onMaxThinkingChange={setMaxThinking}
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
          maxThinking={maxThinking}
          setMaxThinking={setMaxThinking}
        />
      </div>
    </>
  );
});