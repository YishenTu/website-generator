import { ActiveTab } from "../types/types";

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
  setGeneratedPlan: (plan: string | null) => void;
  setGeneratedHtml: (html: string | null) => void;
  setChatMessages: (messages: any[]) => void;
  setPlanChatMessages: (messages: any[]) => void;
  setAppStage: (stage: string) => void;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsChatLoading: (loading: boolean) => void;
  setIsPlanChatLoading: (loading: boolean) => void;
  setIsFullPreviewActive: (active: boolean) => void;
  setIsRefineMode: (refine: boolean) => void;
  setActiveTab: (tab: ActiveTab) => void;
  chatSessionRef: React.MutableRefObject<any>;
  planChatSessionRef: React.MutableRefObject<any>;
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