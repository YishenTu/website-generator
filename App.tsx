
import React, { useState, useCallback, useRef, useEffect } from 'react';
// Fix: Corrected import according to guidelines, removed unused GenerateContentResponse.
import { GoogleGenAI, Chat } from "@google/genai";
import { ReportInputForm } from './components/ReportInputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { ChatPanel } from './components/ChatPanel';
import { PlanDisplay } from './components/PlanDisplay';
import { generateWebsitePlanStream, generateWebsiteFromReportWithPlanStream } from './services/geminiService';
import { getChatSystemInstruction } from './promptTemplates';
import { ActiveTab, ChatMessage, UserType } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';

const MODEL_NAME = "gemini-2.5-pro-preview-05-06";

export type AppStage = 'initial' | 'planPending' | 'planReady' | 'htmlPending' | 'htmlReady';

// --- SVG Icons ---
const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.18l.88-1.473a1.65 1.65 0 0 1 1.505-.882H16.95a1.65 1.65 0 0 1 1.505.882l.88 1.473a1.651 1.651 0 0 1 0 1.18l-.88 1.473a1.65 1.65 0 0 1-1.505-.882H2.05a1.65 1.65 0 0 1-1.505-.882l-.88-1.473ZM3 10a7 7 0 1 1 14 0 7 7 0 0 1-14 0Z" clipRule="evenodd" />
  </svg>
);

const EyeSlashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.18l-.88-1.473a1.65 1.65 0 0 0-1.505-.882H9.56l-2.47-2.471A9.893 9.893 0 0 0 3.28 2.22ZM7.75 7.75l1.262 1.262a2.5 2.5 0 0 1-1.262-1.262Z" clipRule="evenodd" />
    <path d="M10.193 10.193a2.5 2.5 0 0 1 3.536 3.536L12.28 15.28a.75.75 0 0 1-1.06-1.06l-.908-.907a4.002 4.002 0 0 0-2.353-2.353l-.907-.908a.75.75 0 0 1-1.06-1.06l1.442-1.442a2.5 2.5 0 0 1 3.535 3.536Z" />
    <path d="m9.56 7.002.407.407a4.002 4.002 0 0 0 2.353 2.353l.407.407-.733.732a.75.75 0 0 1-1.061-1.06l.15-.15a2.5 2.5 0 0 0-3.536-3.536l-.15.15a.75.75 0 0 1-1.06-1.061l.732-.732Z" />
    <path d="M.664 10.59a1.651 1.651 0 0 1 0-1.18l.88-1.473A1.65 1.65 0 0 1 2.051 7.05h3.79a.75.75 0 0 1 0 1.5H2.05a.15.15 0 0 0-.136.082L1.03 9.975a.151.151 0 0 0 0 .109l.884 1.473a.15.15 0 0 0 .136.082h13.9a.15.15 0 0 0 .136-.082l.88-1.473a.151.151 0 0 0 0-.11V9.97l-.002-.002a10.046 10.046 0 0 1-3.335 4.438.75.75 0 0 1-1.06-1.06l1.745-1.745a10.029 10.029 0 0 0-3.3-4.38 1.651 1.651 0 0 0 0-1.18l-.88-1.473A1.65 1.65 0 0 0 6.95 5.05h-3.79a.75.75 0 0 1 0-1.5h3.79a1.65 1.65 0 0 1 1.505.882l.88 1.473c.077.129.14.265.19.406a9.96 9.96 0 0 1 3.628-1.61.75.75 0 1 1 .433 1.415 8.463 8.463 0 0 0-3.181 1.385A1.65 1.65 0 0 1 16.95 7.05h.002a1.65 1.65 0 0 1 1.505.882l.88 1.473a1.651 1.651 0 0 1 0 1.18l-.88 1.473a1.65 1.65 0 0 1-1.505.882H2.05a1.65 1.65 0 0 1-1.505-.882L.664 10.59Z" />
  </svg>
);

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
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [appStage, setAppStage] = useState<AppStage>('initial');
  const [showPlanInHtmlReadyStage, setShowPlanInHtmlReadyStage] = useState<boolean>(false);
  
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.Preview);
  const [isFullPreviewActive, setIsFullPreviewActive] = useState<boolean>(false);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatSessionRef = useRef<Chat | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fix: Initialize GoogleGenAI with apiKey from process.env.API_KEY directly as per guidelines.
  const ai = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY })).current;

  const cleanTextOutput = (text: string): string => {
    let cleaned = text;
    const fenceRegex = /^```(?:[a-zA-Z]+)?\s*\n?(.*?)\n?\s*```$/si;
    const match = cleaned.match(fenceRegex);
    if (match && match[1]) {
      cleaned = match[1].trim();
    } else if (cleaned.startsWith("```") && cleaned.endsWith("```")) {
      const firstNewline = cleaned.indexOf('\n');
      const lastNewline = cleaned.lastIndexOf('\n');
      if (firstNewline !== -1 && lastNewline !== -1 && lastNewline > firstNewline) {
        cleaned = cleaned.substring(firstNewline + 1, lastNewline).trim();
      } else {
        cleaned = cleaned.substring(3, cleaned.length - 3).trim();
        const potentialKeywords = ["html", "text", "json", "javascript", "css", "markdown"];
        for (const keyword of potentialKeywords) {
            if (cleaned.toLowerCase().startsWith(keyword)) {
                cleaned = cleaned.substring(keyword.length).trim();
                break;
            }
        }
      }
    }
    return cleaned.trim();
  };
  
  const handleGeneratePlan = useCallback(async () => {
    setError(null); 
    if (!process.env.API_KEY) {
      setError("Gemini API key is not configured. Please ensure the API_KEY environment variable is set.");
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
    chatSessionRef.current = null;
    setIsFullPreviewActive(false);
    setShowPlanInHtmlReadyStage(false);
    setAppStage('planReady'); 

    try {
      await generateWebsitePlanStream(
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
  }, [reportText, ai]);

  const handleGenerateHtmlFromPlan = useCallback(async (currentPlanText: string) => {
    setError(null); 
    if (!process.env.API_KEY) {
      setError("Gemini API key is not configured.");
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
      await generateWebsiteFromReportWithPlanStream(
        ai, 
        reportText, 
        currentPlanText,
        (chunk: string) => {
          setGeneratedHtml((prev: string | null) => (prev || '') + chunk);
        },
        (finalHtml: string) => {
          const cleanedInitialHtml = cleanTextOutput(finalHtml);
          setGeneratedHtml(cleanedInitialHtml);

          const chatHistory = [
            { role: "user", parts: [{ text: `I have a website generated from a report and a plan. Here's the initial HTML. I will give you instructions to modify it. Your responses should only be the complete, updated HTML code. Initial HTML:\n\n${cleanedInitialHtml}` }] },
            { role: "model", parts: [{ text: cleanedInitialHtml }] }
          ];
          
          chatSessionRef.current = ai.chats.create({
            model: MODEL_NAME,
            config: { systemInstruction: getChatSystemInstruction() },
            history: chatHistory,
          });

          setChatMessages([{ id: Date.now().toString(), sender: UserType.AI, text: "Initial website generated. How would you like to refine it?", isHtml: false }]);
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
  }, [reportText, ai]);


  const handleSendChatMessage = useCallback(async (messageText: string) => {
    setError(null);
    if (!process.env.API_KEY) {
      setError("Gemini API key is not configured. Cannot send chat message.");
      return;
    }
    if (!chatSessionRef.current) {
      setError("Chat session not initialized. Please generate a website first.");
      return;
    }
    if (!messageText.trim()) return;

    const newUserMessage: ChatMessage = { id: Date.now().toString(), sender: UserType.User, text: messageText };
    setChatMessages((prev: ChatMessage[]) => [...prev, newUserMessage]);
    
    const aiMessageId = (Date.now() + 1).toString();
    // Set a generic placeholder, not the HTML stream
    setChatMessages((prev: ChatMessage[]) => [...prev, { id: aiMessageId, sender: UserType.AI, text: "Processing your request..." }]);
    
    setIsChatLoading(true);
    setActiveTab(ActiveTab.Code); // Switch to Code tab for streaming

    if (abortControllerRef.current) abortControllerRef.current.abort(); 
    abortControllerRef.current = new AbortController(); 
    const signal = abortControllerRef.current.signal;
    
    let currentResponseHtml = ""; // Accumulates the new HTML from AI for this response

    try {
      const stream = await chatSessionRef.current.sendMessageStream({
        message: messageText
      });

      for await (const chunk of stream) {
        if (signal.aborted) { 
          throw new DOMException('The user aborted a request.', 'AbortError');
        }
        const chunkText = chunk.text; 
        if (chunkText) {
          currentResponseHtml += chunkText;
          setGeneratedHtml(currentResponseHtml); // Update the code tab live
        }
      }
      
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
  }, [ai]); 

  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const handleResetToInitial = useCallback(() => { 
    setGeneratedPlan(null);
    setGeneratedHtml(null);
    setChatMessages([]);
    chatSessionRef.current = null;
    setAppStage('initial');
    setError(null);
    setIsLoading(false);
    setIsChatLoading(false);
    setIsFullPreviewActive(false);
    setShowPlanInHtmlReadyStage(false);
    setActiveTab(ActiveTab.Preview); 
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
    }
  }, []);
  
  const handleStartNewSession = useCallback(() => { 
    setReportText(''); 
    handleResetToInitial(); 
  }, [handleResetToInitial]);


  const handleCopyCode = useCallback(async () => {
    if (generatedHtml) {
      try {
        await navigator.clipboard.writeText(generatedHtml);
        alert('HTML code copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy code:', err);
        alert('Failed to copy code. Check console for details.');
      }
    }
  }, [generatedHtml]);

  const handleDownloadHtml = useCallback(() => {
    if (generatedHtml) {
      const blob = new Blob([generatedHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated-website.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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


  const currentDisplayStage = isLoading ? appStage : appStage; 

  let mainGridClasses = 'grid-cols-1 gap-4 md:gap-6 min-h-0'; 
  if (currentDisplayStage === 'planReady' || currentDisplayStage === 'htmlPending') {
    mainGridClasses = 'md:grid-cols-2 grid-cols-1 gap-4 md:gap-6 min-h-0';
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
      <header className="mb-4 md:mb-6 flex-shrink-0">
        <h1 className="text-3xl md:text-4xl font-bold text-sky-500 text-center">
          AI Website Generator
        </h1>
        <p className="text-slate-400 text-center mt-1 text-sm md:text-base">
          Turn text reports into websites: Plan, Generate, Refine.
        </p>
      </header>

      {error && (
        <div className="mb-4 p-3 bg-red-900/70 text-red-200 border border-red-700 rounded-md text-center text-sm shadow-lg" role="alert">
          {error}
        </div>
      )}

      <main className={`flex-grow grid ${mainGridClasses} ${ (currentDisplayStage === 'initial' || currentDisplayStage === 'planPending') ? 'place-items-start justify-center' : ''}`}>
        
        { (currentDisplayStage === 'initial' || currentDisplayStage === 'planPending') && ( 
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
            />
          </div>
        )}

        { (currentDisplayStage === 'planReady' || currentDisplayStage === 'htmlPending') && ( 
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
              />
            </div>
            <div className="md:col-span-1 flex flex-col h-full overflow-hidden">
              {(generatedPlan !== null || (isLoading && appStage === 'planReady' )) && (
                <PlanDisplay
                  planText={generatedPlan || ''}
                  onProceedToHtml={handleGenerateHtmlFromPlan}
                  showGenerateButton={true}
                  onReviseReportAndPlan={handleResetToInitial}
                  isAppLoading={isLoading && appStage === 'planReady'} 
                  isLoadingHtml={isLoading && appStage === 'htmlReady' && generatedHtml !== null} 
                  isCompactView={false}
                />
              )}
              {isLoading && currentDisplayStage === 'htmlPending' && generatedPlan === null && (
                 <div className="flex flex-col items-center justify-center bg-slate-800 rounded-lg shadow-lg p-4 h-full">
                    <LoadingSpinner className="w-12 h-12 text-sky-500" />
                    <p className="mt-3 text-lg text-slate-300">Preparing for website generation...</p>
                </div>
              )}
            </div>
          </>
        )}

        { currentDisplayStage === 'htmlReady' && (
          <>
            <div className="md:col-span-1 flex flex-col space-y-4 overflow-y-auto pr-2 pb-2 custom-scrollbar h-full">
              <div className="bg-slate-800 p-3 rounded-lg shadow-md flex-shrink-0">
                <h3 className="text-md font-semibold text-sky-400 mb-2">Session & Plan</h3>
                <button
                  onClick={handleStartNewSession}
                  className="w-full flex items-center justify-center text-sm bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-3 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                  aria-label="Start a new session"
                  disabled={isLoading || isChatLoading}
                >
                  <ArrowPathIcon className="w-4 h-4 mr-1.5" /> Start New Session
                </button>
                {generatedPlan && (
                  <button
                    onClick={() => setShowPlanInHtmlReadyStage((s: boolean) => !s)}
                    className="w-full flex items-center justify-center text-sm mt-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-3 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                    aria-label={showPlanInHtmlReadyStage ? "Hide current plan" : "View current plan"}
                    disabled={isLoading || isChatLoading}
                  >
                    {showPlanInHtmlReadyStage ? <EyeSlashIcon className="w-4 h-4 mr-1.5" /> : <EyeIcon className="w-4 h-4 mr-1.5" />}
                    {showPlanInHtmlReadyStage ? 'Hide Plan' : 'View Plan'}
                  </button>
                )}
              </div>

              {showPlanInHtmlReadyStage && generatedPlan && (
                <div className="flex-shrink-0 bg-slate-800 p-0 rounded-lg shadow-md max-h-72 overflow-y-auto custom-scrollbar">
                  <PlanDisplay
                    planText={generatedPlan}
                    onProceedToHtml={() => {}} 
                    showGenerateButton={false} 
                    onReviseReportAndPlan={handleResetToInitial} 
                    isAppLoading={false} 
                    isLoadingHtml={false} 
                    isCompactView={true} 
                  />
                </div>
              )}
              
              <div className="flex-grow min-h-0"> 
                {generatedHtml !== null && chatSessionRef.current && ( 
                    <ChatPanel
                    messages={chatMessages}
                    onSendMessage={handleSendChatMessage}
                    isLoading={isChatLoading} 
                    onStop={handleStopGeneration} 
                    />
                )}
                {isLoading && appStage === 'htmlReady' && !chatSessionRef.current && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <LoadingSpinner className="w-10 h-10 text-sky-400" />
                        <p className="mt-2 text-sm text-slate-400">Generating initial website...</p>
                    </div>
                )}
              </div>
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
