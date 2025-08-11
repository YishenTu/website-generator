import React from 'react';
import { ReportInputForm } from '../ReportInputForm';
import { useAppState, useAppActions } from '../../contexts/AppContext';
import { CONTAINER_STYLES, LAYOUT_STYLES, combineStyles } from '../../utils/styleConstants';

export const InitialStage: React.FC = React.memo(() => {
  const { 
    reportText, 
    isLoading, 
    appStage, 
    planModel, 
    maxThinking 
  } = useAppState();
  
  const { 
    setReportText,
    handleGeneratePlan,
    setPlanModel,
    setMaxThinking
  } = useAppActions();

  return (
    <div className={combineStyles(CONTAINER_STYLES.mainContainer, LAYOUT_STYLES.fullHeight, LAYOUT_STYLES.flexCol, 'py-4 md:py-6')}>
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
  );
});