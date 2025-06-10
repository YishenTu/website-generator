import React from 'react';
import { ActiveTab } from '../types/types';
import { AppStage } from '../App';
import { ReportInputForm } from './ReportInputForm';
import { PlanDisplay } from './PlanDisplay';
import { OutputDisplay } from './OutputDisplay';
import { useAppState, useAppActions } from '../contexts/AppContext';
import { GenerationStatus } from './GenerationStatus';
import { CONTAINER_STYLES, LAYOUT_STYLES, combineStyles } from '../utils/styleConstants';

interface TabContentProps {
  activeTab: ActiveTab;
  appStage: AppStage;
}

export const TabContent: React.FC<TabContentProps> = React.memo(({
  activeTab,
  appStage
}) => {
  const { 
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
    maxThinking,
    chatMessages,
    planChatMessages
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
    setChatModel,
    setPlanChatModel,
    setMaxThinking,
    onCopyCode,
    onDownloadHtml,
    onToggleFullPreview,
    onHtmlContentChange,
    handleSendChatMessage,
    handleSendPlanChatMessage,
    initializePlanChatSession,
    isChatAvailable,
    isPlanChatAvailable,
    handleChatModelChange,
    handlePlanChatModelChange
  } = useAppActions();

  const renderInputTab = () => (
    <div className="h-full">
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

  const renderPlanTab = () => {
    if (appStage === 'planPending') {
      return (
        <div className="h-full">
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
      );
    }

    if (generatedPlan) {
      return (
        <div className="h-full">
          <PlanDisplay 
            planText={generatedPlan}
            onProceedToHtml={handleGenerateHtmlFromPlan}
            isAppLoading={isLoading && appStage === 'planPending'}
            isLoadingHtml={isLoading && (appStage === 'htmlPending')}
            isCompactView={false}
            htmlModel={htmlModel}
            onHtmlModelChange={setHtmlModel}
            maxThinking={maxThinking}
            setMaxThinking={setMaxThinking}
          />
        </div>
      );
    }

    return null;
  };

  const renderCodeTab = () => {
    if (appStage === 'htmlPending' || generatedHtml) {
      return (
        <div className="h-full">
          <OutputDisplay
            htmlContent={generatedHtml || ''}
            isLoading={isLoading}
            error={null}
            activeTab={ActiveTab.Code}
            onCopyCode={onCopyCode}
            onDownloadHtml={onDownloadHtml}
            onToggleFullPreview={onToggleFullPreview}
            isFullPreviewActive={false}
            appStage={appStage}
            onHtmlContentChange={onHtmlContentChange}
            streamingModel={htmlModel}
          />
        </div>
      );
    }

    return null;
  };

  const renderPreviewTab = () => {
    if (appStage === 'htmlPending' || generatedHtml) {
      return (
        <div className="h-full">
          <OutputDisplay
            htmlContent={generatedHtml || ''}
            isLoading={isLoading}
            error={null}
            activeTab={ActiveTab.Preview}
            onCopyCode={onCopyCode}
            onDownloadHtml={onDownloadHtml}
            onToggleFullPreview={onToggleFullPreview}
            isFullPreviewActive={false}
            appStage={appStage}
            onHtmlContentChange={onHtmlContentChange}
            streamingModel={htmlModel}
          />
        </div>
      );
    }

    return null;
  };

  switch (activeTab) {
    case ActiveTab.Input:
      return renderInputTab();
    case ActiveTab.Plan:
      return renderPlanTab();
    case ActiveTab.Code:
      return renderCodeTab();
    case ActiveTab.Preview:
      return renderPreviewTab();
    default:
      return renderInputTab();
  }
});