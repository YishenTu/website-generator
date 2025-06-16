import React from 'react';
import { ReportInputForm } from '../ReportInputForm';
import { PlanDisplay } from '../PlanDisplay';
import { useAppState, useAppActions } from '../../contexts/AppContext';
import { CONTAINER_STYLES } from '../../utils/styleConstants';

export const PlanPendingStage: React.FC = React.memo(() => {
  const { 
    reportText,
    generatedPlan,
    isLoading,
    appStage,
    planModel,
    htmlModel,
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
    setMaxThinking
  } = useAppActions();

  return (
    <>
      <div className={CONTAINER_STYLES.section}>
        <ReportInputForm
          reportText={reportText}
          onReportChange={setReportText}
          onGeneratePlan={handleGeneratePlan}
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
          isAppLoading={isLoading && appStage === 'planPending'}
          isLoadingHtml={false}
          isCompactView={false}
          htmlModel={htmlModel}
          onHtmlModelChange={setHtmlModel}
          maxThinking={maxThinking}
          setMaxThinking={setMaxThinking}
        />
      </div>
    </>
  );
});