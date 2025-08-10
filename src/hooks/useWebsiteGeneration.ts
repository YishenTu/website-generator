import { useState, useRef, useCallback, useEffect } from 'react';
import { useBufferedUpdater } from './useBufferedUpdater';
import { useDebouncedLocalStorage } from './useDebouncedLocalStorage';
import { useConfirmation } from '../contexts/ConfirmationContext';
import { GoogleGenAI } from "@google/genai";
import { 
  generateWebsitePlan, 
  generateWebsiteFromPlan,
  validateModelApiKeys,
  createHtmlChatSession,
  createPlanChatSession,
  ChatSession,
  getDefaultModel
} from '../services/aiService';
import { cleanTextOutput, getModelDisplayName } from '../components/textUtils';
import { processGeneratedHtml } from '../utils/htmlPostProcessor';
import { abortAllOperations, resetAppToInitialState } from '../components/appStateUtils';
import { ActiveTab, ChatMessage, UserType } from '../types/types';
import type { AppStage } from '../App';
import type { Theme, Language, OutputType } from '../contexts/AppContext';
import { createLogger } from '../utils/logger';
import { ERROR_MESSAGES } from '../utils/constants';
import { getAvailableProviders } from '../utils/envValidator';

const logger = createLogger('useWebsiteGeneration');

export interface UseWebsiteGenerationProps {
  ai: GoogleGenAI;
}

export interface UseWebsiteGenerationReturn {
  // State
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
  error: string | null;
  appStage: AppStage;
  activeTab: ActiveTab;
  isFullPreviewActive: boolean;
  isRefineMode: boolean;
  chatMessages: ChatMessage[];
  planChatMessages: ChatMessage[];
  maxThinking: boolean;
  outputType: OutputType;
  theme: Theme;
  language: Language;
  
  // Actions
  setReportText: (text: string) => void;
  setPlanModel: (model: string) => void;
  setHtmlModel: (model: string) => void;
  setChatModel: (model: string) => void;
  setPlanChatModel: (model: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setIsFullPreviewActive: (active: boolean) => void;
  setIsRefineMode: (active: boolean) => void;
  setGeneratedHtml: (html: string | null) => void;
  setMaxThinking: (enabled: boolean) => void;
  setOutputType: (outputType: OutputType) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  handleGeneratePlan: () => Promise<void>;
  handleGenerateHtmlFromPlan: (planText: string, maxThinking?: boolean) => Promise<void>;
  handleSendChatMessage: (message: string) => Promise<void>;
  handleSendPlanChatMessage: (message: string) => Promise<void>;
  handleChatModelChange: (model: string) => void;
  handlePlanChatModelChange: (model: string) => void;
  handleStopGeneration: () => void;
  handleResetToInitial: () => void;
  handleStartNewSession: () => void;
  initializePlanChatSession: (planText: string, model?: string) => void;
  isChatAvailable: () => boolean;
  isPlanChatAvailable: () => boolean;
}

export function useWebsiteGeneration({ ai }: UseWebsiteGenerationProps): UseWebsiteGenerationReturn {
  // Determine available providers to select sensible defaults
  const availableProviders = getAvailableProviders();
  const geminiAvailable = availableProviders.includes('gemini');
  const openrouterAvailable = availableProviders.includes('openrouter');

  // Choose defaults based on available API keys
  const defaultPlanProvider = geminiAvailable ? 'gemini' : 'openrouter';
  const defaultHtmlProvider = openrouterAvailable ? 'openrouter' : 'gemini';
  const defaultChatProvider = geminiAvailable ? 'gemini' : openrouterAvailable ? 'openrouter' : 'gemini';

  // State management
  const [reportText, setReportText] = useState<string>('');
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  
  // Confirmation modal hook
  const { confirm } = useConfirmation();
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [planModel, setPlanModel] = useState<string>(getDefaultModel(defaultPlanProvider));
  const [htmlModel, setHtmlModel] = useState<string>(getDefaultModel(defaultHtmlProvider));
  const [chatModel, setChatModel] = useState<string>(getDefaultModel(defaultChatProvider));
  const [planChatModel, setPlanChatModel] = useState<string>(getDefaultModel(defaultPlanProvider));
  
  // 添加状态来跟踪最后使用的plan文本（可能是用户编辑过的）
  const [lastUsedPlanText, setLastUsedPlanText] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isPlanChatLoading, setIsPlanChatLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [appStage, setAppStage] = useState<AppStage>('initial');
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.Input);
  const [isFullPreviewActive, setIsFullPreviewActive] = useState<boolean>(false);
  const [isRefineMode, setIsRefineMode] = useState<boolean>(false);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [planChatMessages, setPlanChatMessages] = useState<ChatMessage[]>([]);
  
  // 新增：思考预算状态
  const [maxThinking, setMaxThinking] = useState<boolean>(false);
  
  // Output Type, Theme and Language state with localStorage persistence
  const [outputType, setOutputTypeState] = useState<OutputType>(() => {
    try {
      const saved = localStorage.getItem('ai-website-generator-output-type');
      return (saved === 'webpage' || saved === 'slides') ? saved : 'webpage';
    } catch {
      return 'webpage';
    }
  });
  
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('ai-website-generator-theme');
      return (saved === 'light' || saved === 'cyber') ? saved : 'cyber';
    } catch {
      return 'cyber';
    }
  });
  
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('ai-website-generator-language');
      return (saved === 'default' || saved === 'en' || saved === 'zh') ? saved : 'default';
    } catch {
      return 'default';
    }
  });
  
  // Refs
  const chatSessionRef = useRef<ChatSession | null>(null);
  const planChatSessionRef = useRef<ChatSession | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const planAbortControllerRef = useRef<AbortController | null>(null);

  const htmlBuffer = useBufferedUpdater<string | null>(setGeneratedHtml);
  const planBuffer = useBufferedUpdater<string | null>(setGeneratedPlan);

  // Plan generation
  const handleGeneratePlan = useCallback(async () => {
    setError(null);
    
    const validation = validateModelApiKeys(planModel);
    if (!validation.isValid) {
      setError(`${validation.missingKey} is not configured. Please ensure the API key is set in environment variables.`);
      return;
    }
    
    if (!reportText.trim()) {
      setError(ERROR_MESSAGES.EMPTY_REPORT);
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
    setActiveTab(ActiveTab.Plan);
    setAppStage('planPending');

    let streamingPlan = '';

    try {
      await generateWebsitePlan(
        planModel,
        ai,
        reportText,
        { theme, language, outputType },
        (chunk: string) => {
          streamingPlan += chunk;
          planBuffer.update(streamingPlan);
        },
        (finalPlan: string) => {
          const cleanedPlan = cleanTextOutput(finalPlan);
          planBuffer.flush();
          setGeneratedPlan(cleanedPlan);
          setIsLoading(false);
          abortControllerRef.current = null;
          setAppStage('planReady');

          initializePlanChatSession(cleanedPlan);
        },
        signal,
        maxThinking
      );
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') setError('Plan generation was stopped by the user.');
        else setError(err.message || 'Failed to generate plan.');
      } else setError(ERROR_MESSAGES.UNKNOWN_ERROR);
      setAppStage('initial');
      logger.error("Plan generation error:", err);
      setIsLoading(false);
      setGeneratedPlan(null);
      abortControllerRef.current = null;
    }
  }, [reportText, planModel, ai, maxThinking, theme, language, outputType]);

  // Initialize plan chat session
  const initializePlanChatSession = useCallback((planText: string, model?: string) => {
    const targetModel = model || planChatModel;
    try {
      planChatSessionRef.current = createPlanChatSession(targetModel, ai, planText, reportText, { theme, language, outputType }, maxThinking);
      setPlanChatMessages([{ id: Date.now().toString(), sender: UserType.AI, text: "Plan generated. How would you like to modify it?", isHtml: false }]);
    } catch (error) {
      logger.error("Failed to initialize plan chat session:", error);
      setPlanChatMessages([{ id: Date.now().toString(), sender: UserType.AI, text: "Plan generated successfully! Note: Chat functionality is not available due to initialization error.", isHtml: false }]);
    }
  }, [ai, planChatModel, reportText, theme, language, outputType]);

  // HTML generation from plan
  const handleGenerateHtmlFromPlan = useCallback(async (currentPlanText: string, maxThinking?: boolean) => {
    setError(null);
    
    // 保存当前使用的plan文本（可能是用户编辑过的）
    setLastUsedPlanText(currentPlanText);
    
    const validation = validateModelApiKeys(htmlModel);
    if (!validation.isValid) {
      setError(`${validation.missingKey} is not configured.`);
      return;
    }
    
    if (!reportText.trim() || !currentPlanText.trim()) {
      setError(ERROR_MESSAGES.EMPTY_PLAN);
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
    setAppStage('htmlPending');

    let streamingHtml = '';

    try {
      await generateWebsiteFromPlan(
        htmlModel,
        ai,
        reportText,
        currentPlanText,
        (chunk: string) => {
          streamingHtml += chunk;
          htmlBuffer.update(streamingHtml);
        },
        (finalHtml: string) => {
          const cleanedInitialHtml = cleanTextOutput(finalHtml);
          
          // Apply post-processing (navigation injection for slides)
          const { html: processedHtml, warnings } = processGeneratedHtml(cleanedInitialHtml, outputType);
          
          // Log any warnings from post-processing
          if (warnings.length > 0) {
            logger.warn('Post-processing warnings:', warnings);
          }
          
          htmlBuffer.flush();
          setGeneratedHtml(processedHtml);
          setAppStage('htmlReady');

          try {
            chatSessionRef.current = createHtmlChatSession(chatModel, ai, processedHtml, reportText, currentPlanText, outputType, maxThinking);
            const messageText = outputType === 'slides' 
              ? "Initial slide presentation generated. How would you like to refine it?"
              : "Initial website generated. How would you like to refine it?";
            setChatMessages([{ id: Date.now().toString(), sender: UserType.AI, text: messageText, isHtml: false }]);
          } catch (chatError) {
            logger.error("Failed to initialize chat session:", chatError);
            const errorText = outputType === 'slides'
              ? "Slide presentation generated successfully! Note: Chat functionality is not available due to initialization error."
              : "Website generated successfully! Note: Chat functionality is not available due to initialization error.";
            setChatMessages([{ id: Date.now().toString(), sender: UserType.AI, text: errorText, isHtml: false }]);
          }
          
          setActiveTab(ActiveTab.Preview);
          setIsLoading(false);
          abortControllerRef.current = null;
        },
        signal,
        maxThinking,
        outputType
      );
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') setError('Website generation was stopped by the user.');
        else setError(err.message || 'Failed to generate website from plan.');
      } else setError(ERROR_MESSAGES.UNKNOWN_ERROR);
      setAppStage('planReady');
      logger.error("HTML generation error:", err);
      setIsLoading(false);
      setGeneratedHtml(null);
      abortControllerRef.current = null;
    }
  }, [reportText, htmlModel, chatModel, ai, outputType]);

  // Chat message handling
  const handleSendChatMessage = useCallback(async (messageText: string) => {
    setError(null);
    
    if (!chatSessionRef.current) {
      setError(ERROR_MESSAGES.NO_CHAT_SESSION);
      return;
    }
    
    if (!messageText.trim()) return;

    const newUserMessage: ChatMessage = { id: Date.now().toString(), sender: UserType.User, text: messageText };
    setChatMessages((prev: ChatMessage[]) => [...prev, newUserMessage]);
    
    const aiMessageId = (Date.now() + 1).toString();
    setChatMessages((prev: ChatMessage[]) => [...prev, { id: aiMessageId, sender: UserType.AI, text: "Processing your request..." }]);
    
    setIsChatLoading(true);
    setActiveTab(ActiveTab.Code);

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    let streamingHtml = "";

    try {
      await chatSessionRef.current.sendMessageStream(
        messageText,
        (chunk: string) => {
          if (signal.aborted) {
            throw new DOMException('The user aborted a request.', 'AbortError');
          }
          streamingHtml += chunk;
          htmlBuffer.update(streamingHtml);
        },
        (finalText: string) => {
          const finalCleanedHtmlFromChat = cleanTextOutput(finalText);
          
          // Apply post-processing to maintain navigation component for slides
          const { html: processedHtml, warnings } = processGeneratedHtml(finalCleanedHtmlFromChat, outputType);
          
          // Log any warnings from post-processing
          if (warnings.length > 0) {
            logger.warn('Chat post-processing warnings:', warnings);
          }
          
          htmlBuffer.flush();
          setGeneratedHtml(processedHtml);
        },
        signal
      );
      
      setChatMessages((prevMsgs: ChatMessage[]) => prevMsgs.map((msg: ChatMessage) => 
        msg.id === aiMessageId ? {...msg, text: "Website updated successfully." } : msg
      ));

    } catch (err) {
      let chatError: string = ERROR_MESSAGES.UNKNOWN_ERROR;
      if (err instanceof Error) {
        if (err.name === 'AbortError') chatError = "Update cancelled by user.";
        else chatError = `Error: ${err.message}`;
      }
      setChatMessages((prevMsgs: ChatMessage[]) => prevMsgs.map((msg: ChatMessage) => 
        msg.id === aiMessageId ? {...msg, text: chatError } : msg
      ));
      setError(chatError);
      logger.error("Chat error:", err);
    } finally {
      setIsChatLoading(false);
      setActiveTab(ActiveTab.Preview);
      abortControllerRef.current = null;
    }
  }, [outputType]);

  // Plan chat message handling
  const handleSendPlanChatMessage = useCallback(async (messageText: string) => {
    setError(null);
    
    if (!planChatSessionRef.current) {
      setError(ERROR_MESSAGES.NO_PLAN_CHAT_SESSION);
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
    
    let streamingPlan = "";

    try {
      await planChatSessionRef.current.sendMessageStream(
        messageText,
        (chunk: string) => {
          if (signal.aborted) {
            throw new DOMException('The user aborted a request.', 'AbortError');
          }
          streamingPlan += chunk;
          planBuffer.update(streamingPlan);
        },
        (finalText: string) => {
          const finalCleanedPlanFromChat = cleanTextOutput(finalText);
          planBuffer.flush();
          setGeneratedPlan(finalCleanedPlanFromChat);
        },
        signal
      );
      
      setPlanChatMessages((prevMsgs: ChatMessage[]) => prevMsgs.map((msg: ChatMessage) => 
        msg.id === aiMessageId ? {...msg, text: "Plan updated successfully." } : msg
      ));

    } catch (err) {
      let chatError: string = ERROR_MESSAGES.UNKNOWN_ERROR;
      if (err instanceof Error) {
        if (err.name === 'AbortError') chatError = "Update cancelled by user.";
        else chatError = `Error: ${err.message}`;
      }
      setPlanChatMessages((prevMsgs: ChatMessage[]) => prevMsgs.map((msg: ChatMessage) => 
        msg.id === aiMessageId ? {...msg, text: chatError } : msg
      ));
      setError(chatError);
      logger.error("Plan chat error:", err);
    } finally {
      setIsPlanChatLoading(false);
      planAbortControllerRef.current = null;
    }
  }, []);

  // Model change handlers
  const handleChatModelChange = useCallback((model: string) => {
    if (model === chatModel) return;
    
    setChatModel(model);
    chatSessionRef.current = null;
    
    if (generatedHtml && reportText && lastUsedPlanText) {
      try {
        chatSessionRef.current = createHtmlChatSession(model, ai, generatedHtml, reportText, lastUsedPlanText, outputType, maxThinking);
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
        logger.error("Failed to initialize chat session:", error);
        setError(`Failed to initialize chat with ${getModelDisplayName(model)}`);
      }
    }
  }, [chatModel, generatedHtml, ai, reportText, lastUsedPlanText, outputType, maxThinking]);

  const handlePlanChatModelChange = useCallback((model: string) => {
    if (model === planChatModel) return;
    
    setPlanChatModel(model);
    
    if (generatedPlan) {
      planChatSessionRef.current = null;
      initializePlanChatSession(generatedPlan, model);
      
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

  // Other actions
  const handleStopGeneration = useCallback(() => {
    abortAllOperations([abortControllerRef.current, planAbortControllerRef.current]);
  }, []);

  const handleResetToInitial = useCallback(() => {
    resetAppToInitialState({
      setGeneratedPlan,
      setGeneratedHtml,
      setChatMessages,
      setPlanChatMessages,
      setAppStage,
      setError,
      setIsLoading,
      setIsChatLoading,
      setIsPlanChatLoading,
      setIsFullPreviewActive,
      setIsRefineMode,
      setActiveTab,
      chatSessionRef,
      planChatSessionRef,
      abortControllerRef,
      planAbortControllerRef,
    });
  }, []);
  
  const handleStartNewSession = useCallback(async () => {
    // Show confirmation dialog
    const confirmed = await confirm(
      'Are you sure you want to start a new session? This will clear all current content including the report, plan, and generated website.',
      'Start New Session'
    );
    
    if (confirmed) {
      setReportText('');
      handleResetToInitial();
      // Ensure we switch to Input tab after reset
      setActiveTab(ActiveTab.Input);
    }
  }, [confirm, handleResetToInitial, setActiveTab]);

  const isChatAvailable = () => !!chatSessionRef.current;
  const isPlanChatAvailable = () => !!planChatSessionRef.current;

  // Output Type, Theme and Language persistence with debouncing
  useDebouncedLocalStorage('ai-website-generator-output-type', outputType);
  useDebouncedLocalStorage('ai-website-generator-theme', theme);
  useDebouncedLocalStorage('ai-website-generator-language', language);

  // Output Type, Theme and Language setter functions
  const setOutputType = useCallback((newOutputType: OutputType) => {
    setOutputTypeState(newOutputType);
    // Clear existing generated content when output type changes to prevent mismatched content
    if (newOutputType !== outputType) {
      setGeneratedPlan(null);
      setGeneratedHtml(null);
      // Reset to initial stage if we had generated content
      if (generatedPlan || generatedHtml) {
        setAppStage('initial');
      }
    }
  }, [outputType, generatedPlan, generatedHtml]);
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage);
  }, []);

  // Cleanup effect to handle component unmount
  useEffect(() => {
    return () => {
      // Abort all ongoing operations
      abortAllOperations([abortControllerRef.current, planAbortControllerRef.current]);
      
      // Clear session references to help with garbage collection
      chatSessionRef.current = null;
      planChatSessionRef.current = null;
    };
  }, []); // Empty dependency array ensures this only runs on unmount

  return {
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
    maxThinking,
    outputType,
    theme,
    language,
    
    // Actions
    setReportText,
    setPlanModel,
    setHtmlModel,
    setChatModel,
    setPlanChatModel,
    setActiveTab,
    setIsFullPreviewActive,
    setIsRefineMode,
    setGeneratedHtml,
    setMaxThinking,
    setOutputType,
    setTheme,
    setLanguage,
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
  };
} 