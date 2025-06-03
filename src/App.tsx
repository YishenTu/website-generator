import React, { useState, useCallback, useRef, useEffect } from 'react';
// Fix: Corrected import according to guidelines, removed unused GenerateContentResponse.
import { GoogleGenAI } from "@google/genai";
import { ReportInputForm } from './components/ReportInputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { ChatPanel } from './components/ChatPanel';
import { PlanDisplay } from './components/PlanDisplay';
import { 
  generateWebsitePlanWithModel, 
  generateWebsiteFromReportWithPlanWithModel,
  validateModelApiKeys,
  createHtmlChatSession,
  createPlanChatSession,
  ChatSession
} from './services/aiService';
import { cleanTextOutput, getModelDisplayName } from './components/textUtils';
import { copyHtmlToClipboard, downloadHtmlFile } from './components/fileUtils';
import { abortAllOperations } from './components/appStateUtils';
import { ActiveTab, ChatMessage, UserType, AIModel } from './types/types';
import { LoadingSpinner } from './components/LoadingSpinner';

export type AppStage = 'initial' | 'planPending' | 'planReady' | 'htmlPending' | 'htmlReady';

// --- SVG Icons ---
const ArrowPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props: React.SVGProps<SVGSVGElement>) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M15.312 5.312a.75.75 0 0 1 0 1.061l-2.47 2.47L15.312 11.312a.75.75 0 1 1-1.061 1.061l-2.47-2.47-2.47 2.47a.75.75 0 1 1-1.061-1.061l2.47-2.47-2.47-2.47a.75.75 0 1 1 1.061-1.061l2.47 2.47 2.47-2.47a.75.75 0 0 1 1.061 0Zm-3.903 6.034a.75.75 0 0 1-1.061-1.06L8.25 12.382V7.5a.75.75 0 0 1 1.5 0v4.132l1.597-1.597a.75.75 0 0 1 1.06 1.06Z" clipRule="evenodd" />
    <path d="M10 3.5A6.5 6.5 0 0 1 10 16.5a.75.75 0 0 1 0-1.5A5 5 0 1 0 5.375 7.3a.75.75 0 0 1-1.442-.436A6.5 6.5 0 0 1 10 3.5Z" />
  </svg>
);
// --- End SVG Icons ---


const App: React.FC = () => {
  const [reportText, setReportText] = useState<string>('');
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [planModel, setPlanModel] = useState<AIModel>(AIModel.Gemini);
  const [htmlModel, setHtmlModel] = useState<AIModel>(AIModel.Claude);
  const [chatModel, setChatModel] = useState<AIModel>(AIModel.Gemini);
  const [planChatModel, setPlanChatModel] = useState<AIModel>(AIModel.Gemini);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isPlanChatLoading, setIsPlanChatLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [appStage, setAppStage] = useState<AppStage>('initial');
  
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.Preview);
  const [isFullPreviewActive, setIsFullPreviewActive] = useState<boolean>(false);
  const [isRefineMode, setIsRefineMode] = useState<boolean>(false);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [planChatMessages, setPlanChatMessages] = useState<ChatMessage[]>([]);
  const chatSessionRef = useRef<ChatSession | null>(null);
  const planChatSessionRef = useRef<ChatSession | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const planAbortControllerRef = useRef<AbortController | null>(null);

  // Fix: Initialize GoogleGenAI with apiKey from process.env.API_KEY directly as per guidelines.
  const ai = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY })).current;


  
  const handleGeneratePlan = useCallback(async () => {
    setError(null); 
    
    // Validate API key for selected model
    const validation = validateModelApiKeys(planModel);
    if (!validation.isValid) {
      setError(`${validation.missingKey} is not configured. Please ensure the API key is set in environment variables.`);
      return;
    }
    
    if (!reportText.trim()) {
      setError('Report text cannot be empty.');
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setGeneratedPlan(''); 
    setGeneratedHtml(null); 
    setChatMessages([]);    
    setPlanChatMessages([]);
    chatSessionRef.current = null;
    planChatSessionRef.current = null;
    setIsFullPreviewActive(false);
    setIsRefineMode(false);
    setAppStage('planPending'); 

    try {
      await generateWebsitePlanWithModel(
        planModel,
        ai, 
        reportText,
        (chunk: string) => {
          setGeneratedPlan((prev: string | null) => (prev || '') + chunk);
        },
        (finalPlan: string) => {
          const cleanedPlan = cleanTextOutput(finalPlan); 
          setGeneratedPlan(cleanedPlan);
          setIsLoading(false);
          abortControllerRef.current = null;
          setAppStage('planReady');
          
          // Initialize plan chat session
          initializePlanChatSession(cleanedPlan);
        },
        signal
      );
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') setError('Plan generation was stopped by the user.');
        else setError(err.message || 'Failed to generate plan.');
      } else setError('An unknown error occurred during plan generation.');
      setAppStage('initial'); 
      console.error("Plan generation error:", err);
      setIsLoading(false); 
      setGeneratedPlan(null); 
      abortControllerRef.current = null;
    }
  }, [reportText, planModel, ai]);

  const initializePlanChatSession = useCallback((planText: string, model?: AIModel) => {
    const targetModel = model || planChatModel;
    try {
      planChatSessionRef.current = createPlanChatSession(targetModel, ai, planText);
      setPlanChatMessages([{ id: Date.now().toString(), sender: UserType.AI, text: "Plan generated. How would you like to modify it?", isHtml: false }]);
    } catch (error) {
      console.error("Failed to initialize plan chat session:", error);
      setPlanChatMessages([{ id: Date.now().toString(), sender: UserType.AI, text: "Plan generated successfully! Note: Chat functionality is not available due to initialization error.", isHtml: false }]);
    }
  }, [ai, planChatModel]);

  const handleGenerateHtmlFromPlan = useCallback(async (currentPlanText: string) => {
    setError(null); 
    
    // Validate API key for selected model
    const validation = validateModelApiKeys(htmlModel);
    if (!validation.isValid) {
      setError(`${validation.missingKey} is not configured.`);
      return;
    }
    
    if (!reportText.trim() || !currentPlanText.trim()) {
      setError('Report text or plan is missing.');
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setGeneratedHtml(''); 
    setChatMessages([]);
    chatSessionRef.current = null;
    setActiveTab(ActiveTab.Code); 
    setAppStage('htmlReady'); 

    try {
      await generateWebsiteFromReportWithPlanWithModel(
        htmlModel,
        ai, 
        reportText, 
        currentPlanText,
        (chunk: string) => {
          setGeneratedHtml((prev: string | null) => (prev || '') + chunk);
        },
        (finalHtml: string) => {
          const cleanedInitialHtml = cleanTextOutput(finalHtml);
          setGeneratedHtml(cleanedInitialHtml);

          // Initialize chat session based on chat model (not html model)
          try {
            chatSessionRef.current = createHtmlChatSession(chatModel, ai, cleanedInitialHtml);
            setChatMessages([{ id: Date.now().toString(), sender: UserType.AI, text: "Initial website generated. How would you like to refine it?", isHtml: false }]);
          } catch (chatError) {
            console.error("Failed to initialize chat session:", chatError);
            setChatMessages([{ id: Date.now().toString(), sender: UserType.AI, text: "Website generated successfully! Note: Chat functionality is not available due to initialization error.", isHtml: false }]);
          }
          
          setActiveTab(ActiveTab.Preview); 
          setIsLoading(false);
          abortControllerRef.current = null;
        },
        signal
      );
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') setError('Website generation was stopped by the user.');
        else setError(err.message || 'Failed to generate website from plan.');
      } else setError('An unknown error occurred during website generation.');
      setAppStage('planReady'); 
      console.error("HTML generation error:", err);
      setIsLoading(false); 
      setGeneratedHtml(null); 
      abortControllerRef.current = null;
    }
  }, [reportText, htmlModel, chatModel, ai]);


  const handleSendChatMessage = useCallback(async (messageText: string) => {
    setError(null);
    
    if (!chatSessionRef.current) {
      setError("No active chat session. Please generate a website first.");
      return;
    }
    
    if (!messageText.trim()) return;

    const newUserMessage: ChatMessage = { id: Date.now().toString(), sender: UserType.User, text: messageText };
    setChatMessages((prev: ChatMessage[]) => [...prev, newUserMessage]);
    
    const aiMessageId = (Date.now() + 1).toString();
    setChatMessages((prev: ChatMessage[]) => [...prev, { id: aiMessageId, sender: UserType.AI, text: "Processing your request..." }]);
    
    setIsChatLoading(true);
    setActiveTab(ActiveTab.Code); // Switch to Code tab for streaming

    if (abortControllerRef.current) abortControllerRef.current.abort(); 
    abortControllerRef.current = new AbortController(); 
    const signal = abortControllerRef.current.signal;
    
    let currentResponseHtml = "";

    try {
      await chatSessionRef.current.sendMessageStream(
        messageText,
        (chunk: string) => {
          if (signal.aborted) {
            throw new DOMException('The user aborted a request.', 'AbortError');
          }
          currentResponseHtml += chunk;
          setGeneratedHtml(currentResponseHtml);
        },
        (finalText: string) => {
          currentResponseHtml = finalText;
        },
        signal
      );
      
      const finalCleanedHtmlFromChat = cleanTextOutput(currentResponseHtml);
      setGeneratedHtml(finalCleanedHtmlFromChat);

      // Update AI chat message to a static confirmation
      setChatMessages((prevMsgs: ChatMessage[]) => prevMsgs.map((msg: ChatMessage) => 
        msg.id === aiMessageId ? {...msg, text: "Website updated successfully." } : msg
      ));

    } catch (err) {
      let chatError = "An unknown error occurred during chat.";
      if (err instanceof Error) {
        if (err.name === 'AbortError') chatError = "Update cancelled by user.";
        else chatError = `Error: ${err.message}`;
      }
      setChatMessages((prevMsgs: ChatMessage[]) => prevMsgs.map((msg: ChatMessage) => 
        msg.id === aiMessageId ? {...msg, text: chatError } : msg
      ));
      setError(chatError); 
      console.error("Chat error:", err);
    } finally {
      setIsChatLoading(false);
      setActiveTab(ActiveTab.Preview); // Switch back to Preview tab
      abortControllerRef.current = null; 
    }
  }, [chatModel]);

  const handleChatModelChange = useCallback((model: AIModel) => {
    if (model === chatModel) return;
    
    setChatModel(model);
    
        // Clear existing chat sessions
    chatSessionRef.current = null;
    
    // Re-initialize chat session with new model if we have generated HTML
    if (generatedHtml) {
      try {
        chatSessionRef.current = createHtmlChatSession(model, ai, generatedHtml);
        
        // Add a system message about model change
        setChatMessages((prev: ChatMessage[]) => [
          ...prev,
          { 
            id: Date.now().toString(), 
            sender: UserType.AI, 
            text: `Chat model switched to ${getModelDisplayName(model)}. Previous conversation history cleared.`, 
            isHtml: false 
          }
        ]);
      } catch (error) {
        console.error("Failed to initialize chat session:", error);
        setError(`Failed to initialize chat with ${getModelDisplayName(model)}`);
      }
    }
  }, [chatModel, generatedHtml, ai]);



  const handleStopGeneration = useCallback(() => {
    abortAllOperations([abortControllerRef.current, planAbortControllerRef.current]);
  }, []);

  const handleResetToInitial = useCallback(() => { 
    setGeneratedPlan(null);
    setGeneratedHtml(null);
    setChatMessages([]);
    setPlanChatMessages([]);
    chatSessionRef.current = null;
    planChatSessionRef.current = null;
    setAppStage('initial');
    setError(null);
    setIsLoading(false);
    setIsChatLoading(false);
    setIsPlanChatLoading(false);
    setIsFullPreviewActive(false);
    setIsRefineMode(false);
    setActiveTab(ActiveTab.Preview); 
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
    }
    if (planAbortControllerRef.current) {
        planAbortControllerRef.current.abort();
        planAbortControllerRef.current = null;
    }
  }, []);
  
  const handleStartNewSession = useCallback(() => { 
    setReportText(''); 
    handleResetToInitial(); 
  }, [handleResetToInitial]);


  const handleCopyCode = useCallback(async () => {
    if (generatedHtml) {
      const success = await copyHtmlToClipboard(generatedHtml);
      if (success) {
        alert('HTML code copied to clipboard!');
      } else {
        alert('Failed to copy code. Check console for details.');
      }
    }
  }, [generatedHtml]);

  const handleDownloadHtml = useCallback(() => {
    if (generatedHtml) {
      downloadHtmlFile(generatedHtml);
    }
  }, [generatedHtml]);

  const toggleFullPreview = useCallback(() => {
    if (generatedHtml) {
      setIsFullPreviewActive((prev: boolean) => !prev);
    }
  }, [generatedHtml]);
  
  const handleHtmlContentChange = (newHtml: string) => {
    setGeneratedHtml(newHtml);
  };

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullPreviewActive) {
        setIsFullPreviewActive(false);
      }
    };
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isFullPreviewActive]);

  // Check if chat is available
  const isChatAvailable = () => {
    return !!chatSessionRef.current;
  };

  // Check if plan chat is available
  const isPlanChatAvailable = () => {
    return !!planChatSessionRef.current;
  };

  const handleSendPlanChatMessage = useCallback(async (messageText: string) => {
    setError(null);
    
    if (!planChatSessionRef.current) {
      setError("No active plan chat session. Please generate a plan first.");
      return;
    }
    
    if (!messageText.trim()) return;

    const newUserMessage: ChatMessage = { id: Date.now().toString(), sender: UserType.User, text: messageText };
    setPlanChatMessages((prev: ChatMessage[]) => [...prev, newUserMessage]);
    
    const aiMessageId = (Date.now() + 1).toString();
    setPlanChatMessages((prev: ChatMessage[]) => [...prev, { id: aiMessageId, sender: UserType.AI, text: "Processing your request..." }]);
    
    setIsPlanChatLoading(true);

    if (planAbortControllerRef.current) planAbortControllerRef.current.abort(); 
    planAbortControllerRef.current = new AbortController(); 
    const signal = planAbortControllerRef.current.signal;
    
    let currentResponsePlan = "";

    try {
      await planChatSessionRef.current.sendMessageStream(
        messageText,
        (chunk: string) => {
          if (signal.aborted) {
            throw new DOMException('The user aborted a request.', 'AbortError');
          }
          currentResponsePlan += chunk;
          setGeneratedPlan(currentResponsePlan);
        },
        (finalText: string) => {
          currentResponsePlan = finalText;
        },
        signal
      );
      
      const finalCleanedPlanFromChat = cleanTextOutput(currentResponsePlan);
      setGeneratedPlan(finalCleanedPlanFromChat);

      // Update AI chat message to a static confirmation
      setPlanChatMessages((prevMsgs: ChatMessage[]) => prevMsgs.map((msg: ChatMessage) => 
        msg.id === aiMessageId ? {...msg, text: "Plan updated successfully." } : msg
      ));

    } catch (err) {
      let chatError = "An unknown error occurred during plan chat.";
      if (err instanceof Error) {
        if (err.name === 'AbortError') chatError = "Update cancelled by user.";
        else chatError = `Error: ${err.message}`;
      }
      setPlanChatMessages((prevMsgs: ChatMessage[]) => prevMsgs.map((msg: ChatMessage) => 
        msg.id === aiMessageId ? {...msg, text: chatError } : msg
      ));
      setError(chatError); 
      console.error("Plan chat error:", err);
    } finally {
      setIsPlanChatLoading(false);
      planAbortControllerRef.current = null; 
    }
  }, [planChatModel]);

  const handlePlanChatModelChange = useCallback((model: AIModel) => {
    if (model === planChatModel) return;
    
    setPlanChatModel(model);
    
    // Re-initialize plan chat session with new model if we have generated plan
    if (generatedPlan) {
      // Clear existing plan chat sessions
      planChatSessionRef.current = null;
      
      // Immediately reinitialize with the new model
      initializePlanChatSession(generatedPlan, model);
      
      // Add a system message about model change
      setPlanChatMessages((prev: ChatMessage[]) => [
        ...prev,
        { 
          id: Date.now().toString(), 
          sender: UserType.AI, 
          text: `Plan chat model switched to ${getModelDisplayName(model)}. Previous conversation history cleared.`, 
          isHtml: false 
        }
      ]);
    }
  }, [planChatModel, generatedPlan, initializePlanChatSession]);

  const currentDisplayStage = isLoading ? appStage : appStage; 

  let mainGridClasses = 'grid-cols-1 gap-4 md:gap-6 min-h-0'; 
  if (currentDisplayStage === 'planPending') {
    mainGridClasses = 'md:grid-cols-2 grid-cols-1 gap-4 md:gap-6 min-h-0';
  } else if (currentDisplayStage === 'planReady') {
    if (isRefineMode) {
      mainGridClasses = 'md:grid-cols-5 grid-cols-1 gap-4 md:gap-6 min-h-0';
    } else {
      mainGridClasses = 'md:grid-cols-2 grid-cols-1 gap-4 md:gap-6 min-h-0';
    }
  } else if (currentDisplayStage === 'htmlPending') {
    mainGridClasses = 'md:grid-cols-5 grid-cols-1 gap-4 md:gap-6 min-h-0';
  } else if (currentDisplayStage === 'htmlReady') {
    mainGridClasses = 'md:grid-cols-5 grid-cols-1 gap-4 md:gap-6 min-h-0';
  }


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

  return (
    <div className="flex flex-col h-screen p-4 md:p-6 bg-slate-900 text-slate-100 overflow-hidden">
      <header className="mb-4 md:mb-6 flex-shrink-0 relative">
        <h1 className="text-3xl md:text-4xl font-bold text-sky-500 text-center">
          AI Website Generator
        </h1>
        <p className="text-slate-400 text-center mt-1 text-sm md:text-base">
          Turn text into websites: Plan, Generate, Refine.
        </p>
        {currentDisplayStage === 'htmlReady' && (
          <button
            onClick={handleStartNewSession}
            className="absolute top-0 right-0 flex items-center justify-center text-sm bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-3 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label="Start a new session"
            disabled={isLoading || isChatLoading}
          >
            <ArrowPathIcon className="w-4 h-4 mr-1.5" /> New Session
          </button>
        )}
      </header>

      {error && (
        <div className="mb-4 p-3 bg-red-900/70 text-red-200 border border-red-700 rounded-md text-center text-sm shadow-lg" role="alert">
          {error}
        </div>
      )}

      <main className={`flex-grow grid ${mainGridClasses} ${ currentDisplayStage === 'initial' ? 'place-items-start justify-center' : ''}`}>
        
        { currentDisplayStage === 'initial' && ( 
          <div className="w-full max-w-5xl mx-auto h-full flex flex-col py-4 md:py-6"> 
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

        { currentDisplayStage === 'planPending' && ( 
          <>
            <div className="md:col-span-1 flex flex-col h-full overflow-hidden">
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
            <div className="md:col-span-1 flex flex-col h-full overflow-hidden">
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

        { currentDisplayStage === 'planReady' && !isRefineMode && ( 
          <>
            <div className="md:col-span-1 flex flex-col h-full overflow-hidden">
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
            <div className="md:col-span-1 flex flex-col h-full overflow-hidden">
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

        { currentDisplayStage === 'planReady' && isRefineMode && ( 
          <>
            <div className="md:col-span-2 flex flex-col h-full overflow-hidden">
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
            <div className="md:col-span-2 flex flex-col h-full overflow-hidden">
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
            <div className="md:col-span-1 flex flex-col h-full overflow-hidden">
              {generatedPlan !== null && ( 
                  <ChatPanel
                  messages={planChatMessages}
                  onSendMessage={handleSendPlanChatMessage}
                  isLoading={isPlanChatLoading} 
                  onStop={handleStopGeneration}
                  chatModel={planChatModel}
                  onChatModelChange={handlePlanChatModelChange}
                  isChatAvailable={!!isPlanChatAvailable()}
                  title="Refine Plan with Chat"
                  />
              )}
            </div>
          </>
        )}

        { currentDisplayStage === 'htmlPending' && ( 
          <>
            <div className="md:col-span-1 flex flex-col h-full overflow-hidden">
              {generatedPlan !== null && ( 
                  <ChatPanel
                  messages={planChatMessages}
                  onSendMessage={handleSendPlanChatMessage}
                  isLoading={isPlanChatLoading} 
                  onStop={handleStopGeneration}
                  chatModel={planChatModel}
                  onChatModelChange={handlePlanChatModelChange}
                  isChatAvailable={!!isPlanChatAvailable()}
                  title="Refine Plan with Chat"
                  />
              )}
            </div>
            <div className="md:col-span-2 flex flex-col h-full overflow-hidden">
              {isLoading && currentDisplayStage === 'htmlPending' && (
                 <div className="flex flex-col items-center justify-center bg-slate-800 rounded-lg shadow-lg p-4 h-full">
                    <LoadingSpinner className="w-12 h-12 text-sky-500" />
                    <p className="mt-3 text-lg text-slate-300">Preparing for website generation...</p>
                </div>
              )}
            </div>
            <div className="md:col-span-2 flex flex-col h-full overflow-hidden">
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

        { currentDisplayStage === 'htmlReady' && (
          <>
            <div className="md:col-span-1 flex flex-col h-full overflow-hidden">
              {generatedHtml !== null && ( 
                  <ChatPanel
                  messages={chatMessages}
                  onSendMessage={handleSendChatMessage}
                  isLoading={isChatLoading} 
                  onStop={handleStopGeneration}
                  chatModel={chatModel}
                  onChatModelChange={handleChatModelChange}
                  isChatAvailable={!!isChatAvailable()}
                  />
              )}
              {isLoading && appStage === 'htmlReady' && generatedHtml === null && (
                  <div className="flex flex-col items-center justify-center h-full">
                      <LoadingSpinner className="w-10 h-10 text-sky-400" />
                      <p className="mt-2 text-sm text-slate-400">Generating initial website...</p>
                  </div>
              )}
            </div>

            <div className="md:col-span-4 flex flex-col overflow-hidden h-full">
              {(generatedHtml !== null || (isLoading && appStage === 'htmlReady' )) && ( 
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
                    className="h-full"
                  />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
