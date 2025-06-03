import React from 'react';
import { ActiveTab, ChatMessage } from "../types/types";
import type { AppStage } from "../App";
import type { ChatSession } from "../services/aiService";

/**
 * 应用状态管理工具函数
 */

/**
 * 中止所有正在进行的操作
 * @param abortControllers 中止控制器数组
 */
export const abortAllOperations = (abortControllers: (AbortController | null)[]): void => {
  abortControllers.forEach(controller => {
    if (controller) {
      controller.abort();
    }
  });
};

/**
 * 重置应用状态的配置
 */
export interface ResetAppStateConfig {
  setGeneratedPlan: React.Dispatch<React.SetStateAction<string | null>>;
  setGeneratedHtml: React.Dispatch<React.SetStateAction<string | null>>;
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setPlanChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setAppStage: React.Dispatch<React.SetStateAction<AppStage>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsChatLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPlanChatLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFullPreviewActive: React.Dispatch<React.SetStateAction<boolean>>;
  setIsRefineMode: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveTab: React.Dispatch<React.SetStateAction<ActiveTab>>;
  chatSessionRef: React.MutableRefObject<ChatSession | null>;
  planChatSessionRef: React.MutableRefObject<ChatSession | null>;
  abortControllerRef: React.MutableRefObject<AbortController | null>;
  planAbortControllerRef: React.MutableRefObject<AbortController | null>;
}

/**
 * 重置应用到初始状态
 * @param config 重置配置
 */
export const resetAppToInitialState = (config: ResetAppStateConfig): void => {
  config.setGeneratedPlan(null);
  config.setGeneratedHtml(null);
  config.setChatMessages([]);
  config.setPlanChatMessages([]);
  config.chatSessionRef.current = null;
  config.planChatSessionRef.current = null;
  config.setAppStage('initial');
  config.setError(null);
  config.setIsLoading(false);
  config.setIsChatLoading(false);
  config.setIsPlanChatLoading(false);
  config.setIsFullPreviewActive(false);
  config.setIsRefineMode(false);
  config.setActiveTab(ActiveTab.Preview);
  
  // 中止所有正在进行的操作
  abortAllOperations([
    config.abortControllerRef.current,
    config.planAbortControllerRef.current
  ]);
  
  config.abortControllerRef.current = null;
  config.planAbortControllerRef.current = null;
}; 