import React, { createContext, useContext, ReactNode } from 'react';
import { ActiveTab, ChatMessage } from '../types/types';
import type { AppStage } from '../App';

// State interface
export interface AppState {
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
  maxThinking: boolean;
}

// Actions interface
export interface AppActions {
  setReportText: (text: string) => void;
  handleGeneratePlan: () => Promise<void>;
  handleGenerateHtmlFromPlan: (planText: string, maxThinking?: boolean) => Promise<void>;
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
  setMaxThinking: (enabled: boolean) => void;
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

// Context type
export interface AppContextType {
  state: AppState;
  actions: AppActions;
}

// Create contexts
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
  value: AppContextType;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children, value }) => {
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Convenience hooks for specific parts
export const useAppState = (): AppState => {
  const { state } = useAppContext();
  return state;
};

export const useAppActions = (): AppActions => {
  const { actions } = useAppContext();
  return actions;
};