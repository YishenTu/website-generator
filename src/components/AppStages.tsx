import React from 'react';
import { ReportInputForm } from './ReportInputForm';
import { PlanDisplay } from './PlanDisplay';
import { OutputDisplay } from './OutputDisplay';
import { ChatPanel } from './ChatPanel';
import { LoadingSpinner } from './LoadingSpinner';
import { ActiveTab, ChatMessage } from '../types/types';
import type { AppStage } from '../App';
import { CONTAINER_STYLES, LAYOUT_STYLES, TEXT_STYLES, ICON_SIZES, combineStyles } from '../utils/styleConstants';

interface Props {
  appStage: AppStage;
  isRefineMode: boolean;
  reportText: string;
  generatedPlan: string | null;
  generatedHtml: string | null;
  planModel: string;
  htmlModel: string;
  chatModel: string;
  planChatModel: string;
  isLoading: boolean;
  isChatLoading: boolean;
  isPlanChatLoading: boolean;
  activeTab: ActiveTab;
  chatMessages: ChatMessage[];
  planChatMessages: ChatMessage[];
  setReportText: (text: string) => void;
  handleGeneratePlan: () => Promise<void>;
  handleGenerateHtmlFromPlan: (planText: string) => Promise<void>;
  handleStartNewSession: () => void;
  handleResetToInitial: () => void;
  handleStopGeneration: () => void;
  handleSendChatMessage: (msg: string) => Promise<void>;
  handleSendPlanChatMessage: (msg: string) => Promise<void>;
  setPlanModel: (model: string) => void;
  setHtmlModel: (model: string) => void;
  setChatModel: (model: string) => void;
  setPlanChatModel: (model: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  initializePlanChatSession: (plan: string) => void;
  isChatAvailable: () => boolean;
  isPlanChatAvailable: () => boolean;
  handlePlanChatModelChange: (model: string) => void;
  handleChatModelChange: (model: string) => void;
  onCopyCode: () => void;
  onDownloadHtml: () => void;
  onToggleFullPreview: () => void;
  onHtmlContentChange: (html: string) => void;
  setIsRefineMode: (flag: boolean) => void;
}

export const AppStages: React.FC<Props> = ({
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
  initializePlanChatSession,
  isChatAvailable,
  isPlanChatAvailable,
  handlePlanChatModelChange,
  handleChatModelChange,
  onCopyCode,
  onDownloadHtml,
  onToggleFullPreview,
  onHtmlContentChange,
  setIsRefineMode,
}) => {
  const renderInitial = () => (
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
  );

  const renderPlanPending = () => (
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
  );

  const renderPlanReady = () => {
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
    );
  };

  const renderHtmlPending = () => (
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
  );

  const renderHtmlReady = () => (
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
            onCopyCode={onCopyCode}
            onDownloadHtml={onDownloadHtml}
            onToggleFullPreview={onToggleFullPreview}
            isFullPreviewActive={false}
            appStage={appStage}
            onHtmlContentChange={onHtmlContentChange}
            className={LAYOUT_STYLES.fullHeight}
            streamingModel={htmlModel}
          />
        )}
      </div>
    </>
  );

  switch (appStage) {
    case 'planPending':
      return renderPlanPending();
    case 'planReady':
      return renderPlanReady();
    case 'htmlPending':
      return renderHtmlPending();
    case 'htmlReady':
      return renderHtmlReady();
    default:
      return renderInitial();
  }
};
