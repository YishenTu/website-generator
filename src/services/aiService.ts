import { GoogleGenAI } from "@google/genai";
import { 
  generateWebsitePlanStream, 
  generateWebsiteFromReportWithPlanStream,
  GeminiChatSession,
  GeminiPlanChatSession,
  GEMINI_MODELS
} from "./geminiService";
import {
  generateWebsitePlanStreamOpenRouter,
  generateWebsiteFromReportWithPlanStreamOpenRouter,
  OpenRouterChatSession,
  OpenRouterPlanChatSession,
  OPENROUTER_MODELS
} from "./openrouterService";
import { ENV_VARS } from "../utils/constants";

// 模型信息接口
export interface ModelInfo {
  id: string;
  name: string;
  provider: 'gemini' | 'openrouter';
}

// 统一的模型列表
export const ALL_MODELS: ModelInfo[] = [
  // Gemini 模型
  ...GEMINI_MODELS.map(model => ({
    id: model.id,
    name: model.name,
    provider: 'gemini' as const
  })),
  // OpenRouter 模型
  ...OPENROUTER_MODELS.map(model => ({
    id: model.id,
    name: model.name,
    provider: 'openrouter' as const
  }))
];

// 按提供商分组的模型 - 重用ALL_MODELS避免重复映射
export const MODELS_BY_PROVIDER = {
  gemini: ALL_MODELS.filter(model => model.provider === 'gemini'),
  openrouter: ALL_MODELS.filter(model => model.provider === 'openrouter')
};

// 获取模型信息
export function getModelInfo(modelId: string): ModelInfo | undefined {
  return ALL_MODELS.find(model => model.id === modelId);
}

// 检查模型是否是Gemini模型 - 基于getModelInfo减少重复查找
export function isGeminiModel(modelId: string): boolean {
  const modelInfo = getModelInfo(modelId);
  return modelInfo?.provider === 'gemini';
}

// 检查模型是否是OpenRouter模型 - 基于getModelInfo减少重复查找
export function isOpenRouterModel(modelId: string): boolean {
  const modelInfo = getModelInfo(modelId);
  return modelInfo?.provider === 'openrouter';
}

// 获取默认模型
export function getDefaultModel(provider: 'gemini' | 'openrouter'): string {
  if (provider === 'gemini') {
    return GEMINI_MODELS[0].id;
  } else {
    return OPENROUTER_MODELS[0].id;
  }
}

// 统一的聊天会话接口
export interface ChatSession {
  sendMessageStream(
    message: string,
    onChunk: (chunkText: string) => void,
    onComplete: (finalText: string) => void,
    signal?: AbortSignal
  ): Promise<void>;
}

// 通用的模型分发辅助函数
function dispatchToModel<T>(
  modelId: string,
  geminiHandler: () => T,
  openrouterHandler: () => T
): T {
  const modelInfo = getModelInfo(modelId);
  if (!modelInfo) {
    throw new Error(`Unsupported model: ${modelId}`);
  }

  if (modelInfo.provider === 'gemini') {
    return geminiHandler();
  } else {
    return openrouterHandler();
  }
}

// 主要的生成函数 - 基于模型ID生成网站规划
export async function generateWebsitePlan(
  modelId: string,
  ai: GoogleGenAI,
  reportText: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal
): Promise<void> {
  return dispatchToModel(
    modelId,
    () => generateWebsitePlanStream(ai, reportText, onChunk, onComplete, signal, modelId),
    () => generateWebsitePlanStreamOpenRouter(reportText, onChunk, onComplete, signal, modelId)
  );
}

// 主要的生成函数 - 基于模型ID生成网站
export async function generateWebsiteFromPlan(
  modelId: string,
  ai: GoogleGenAI,
  reportText: string,
  planText: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal
): Promise<void> {
  return dispatchToModel(
    modelId,
    () => generateWebsiteFromReportWithPlanStream(ai, reportText, planText, onChunk, onComplete, signal, modelId),
    () => generateWebsiteFromReportWithPlanStreamOpenRouter(reportText, planText, onChunk, onComplete, signal, modelId)
  );
}

// 主要的会话创建函数 - 基于模型ID创建HTML聊天会话
export function createHtmlChatSession(
  modelId: string,
  ai: GoogleGenAI,
  initialHtml: string
): ChatSession {
  return dispatchToModel<ChatSession>(
    modelId,
    () => new GeminiChatSession(ai, initialHtml, modelId),
    () => new OpenRouterChatSession(initialHtml, modelId)
  );
}

// 主要的会话创建函数 - 基于模型ID创建Plan聊天会话
export function createPlanChatSession(
  modelId: string,
  ai: GoogleGenAI,
  initialPlan: string
): ChatSession {
  return dispatchToModel<ChatSession>(
    modelId,
    () => new GeminiPlanChatSession(ai, initialPlan, modelId),
    () => new OpenRouterPlanChatSession(initialPlan, modelId)
  );
}

// 主要的验证函数 - 验证模型的API密钥
export function validateModelApiKeys(modelId: string): { isValid: boolean; missingKey?: string } {
  const modelInfo = getModelInfo(modelId);
  if (!modelInfo) {
    return { isValid: false, missingKey: 'UNKNOWN_MODEL' };
  }

  const apiKey = modelInfo.provider === 'gemini' ? process.env[ENV_VARS.GEMINI_API_KEY] : process.env[ENV_VARS.OPENROUTER_API_KEY];
  const keyName = modelInfo.provider === 'gemini' ? ENV_VARS.GEMINI_API_KEY : ENV_VARS.OPENROUTER_API_KEY;
  
  return {
    isValid: !!apiKey,
    missingKey: !apiKey ? keyName : undefined
  };
} 