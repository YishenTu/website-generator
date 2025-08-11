import React from 'react';
import { OutputDisplay } from '../OutputDisplay';
import { ChatPanel } from '../ChatPanel';
import { useAppState, useAppActions } from '../../contexts/AppContext';
import { CONTAINER_STYLES, LAYOUT_STYLES, combineStyles } from '../../utils/styleConstants';

export const HtmlReadyStage: React.FC = React.memo(() => {
  const { 
    generatedHtml,
    isLoading,
    isChatLoading,
    appStage,
    activeTab,
    chatMessages,
    chatModel
  } = useAppState();
  
  const { 
    handleStopGeneration,
    handleSendChatMessage,
    handleChatModelChange,
    isChatAvailable,
    onCopyCode,
    onDownloadHtml,
    onToggleFullPreview,
    onHtmlContentChange
  } = useAppActions();

  return (
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
      </div>
      <div className={combineStyles('md:col-span-4', LAYOUT_STYLES.flexCol, LAYOUT_STYLES.overflowHidden, LAYOUT_STYLES.fullHeight)}>
        {(generatedHtml !== null || (isLoading && appStage === 'htmlReady')) && (
          <OutputDisplay
            htmlContent={generatedHtml || ''}
            isLoading={isLoading || isChatLoading}
            error={null}
            activeTab={activeTab}
            onCopyCode={onCopyCode}
            onDownloadHtml={onDownloadHtml}
            onToggleFullPreview={onToggleFullPreview}
            isFullPreviewActive={false}
            appStage={appStage}
            onHtmlContentChange={onHtmlContentChange}
            className={LAYOUT_STYLES.fullHeight}
          />
        )}
      </div>
    </>
  );
});