import { GoogleGenAI } from "@google/genai";
import { AIModel } from "../types/types";
import { 
  generateWebsitePlanStream, 
  generateWebsiteFromReportWithPlanStream,
  GeminiChatSession,
  GeminiPlanChatSession
} from "./geminiService";
import {
  generateWebsitePlanStreamOpenRouter,
  generateWebsiteFromReportWithPlanStreamOpenRouter,
  OpenRouterChatSession,
  OpenRouterPlanChatSession
} from "./openrouterService";

// 统一的聊天会话接口
export interface ChatSession {
  sendMessageStream(
    message: string,
    onChunk: (chunkText: string) => void,
    onComplete: (finalText: string) => void,
    signal?: AbortSignal
  ): Promise<void>;
}

// 会话构造函数类型定义
type SessionConstructorMap<T> = {
  [AIModel.Gemini]: new (ai: GoogleGenAI, initialContent: T) => ChatSession;
  [AIModel.Claude]: new (initialContent: T) => ChatSession;
};

// 通用的聊天会话工厂函数
function createChatSession<T>(
  model: AIModel,
  ai: GoogleGenAI,
  initialContent: T,
  sessionConstructors: SessionConstructorMap<T>
): ChatSession {
  switch (model) {
    case AIModel.Gemini:
      return new sessionConstructors[AIModel.Gemini](ai, initialContent);
    case AIModel.Claude:
      return new sessionConstructors[AIModel.Claude](initialContent);
    default:
      throw new Error(`Unsupported model: ${model}`);
  }
}

export async function generateWebsitePlanWithModel(
  model: AIModel,
  ai: GoogleGenAI,
  reportText: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal
): Promise<void> {
  switch (model) {
    case AIModel.Gemini:
      return generateWebsitePlanStream(ai, reportText, onChunk, onComplete, signal);
    case AIModel.Claude:
      return generateWebsitePlanStreamOpenRouter(reportText, onChunk, onComplete, signal);
    default:
      throw new Error(`Unsupported model: ${model}`);
  }
}

export async function generateWebsiteFromReportWithPlanWithModel(
  model: AIModel,
  ai: GoogleGenAI,
  reportText: string,
  planText: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal
): Promise<void> {
  switch (model) {
    case AIModel.Gemini:
      return generateWebsiteFromReportWithPlanStream(
        ai, reportText, planText, onChunk, onComplete, signal
      );
    case AIModel.Claude:
      return generateWebsiteFromReportWithPlanStreamOpenRouter(
        reportText, planText, onChunk, onComplete, signal
      );
    default:
      throw new Error(`Unsupported model: ${model}`);
  }
}

export function createHtmlChatSession(
  model: AIModel,
  ai: GoogleGenAI,
  initialHtml: string
): ChatSession {
  const htmlSessionConstructors: SessionConstructorMap<string> = {
    [AIModel.Gemini]: GeminiChatSession,
    [AIModel.Claude]: OpenRouterChatSession
  };
  
  return createChatSession(model, ai, initialHtml, htmlSessionConstructors);
}

export function createPlanChatSession(
  model: AIModel,
  ai: GoogleGenAI,
  initialPlan: string
): ChatSession {
  const planSessionConstructors: SessionConstructorMap<string> = {
    [AIModel.Gemini]: GeminiPlanChatSession,
    [AIModel.Claude]: OpenRouterPlanChatSession
  };
  
  return createChatSession(model, ai, initialPlan, planSessionConstructors);
}

export function validateModelApiKeys(model: AIModel): { isValid: boolean; missingKey?: string } {
  switch (model) {
    case AIModel.Gemini:
      return {
        isValid: !!process.env.GEMINI_API_KEY,
        missingKey: !process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY' : undefined
      };
    case AIModel.Claude:
      return {
        isValid: !!process.env.OPENROUTER_API_KEY,
        missingKey: !process.env.OPENROUTER_API_KEY ? 'OPENROUTER_API_KEY' : undefined
      };
    default:
      return { isValid: false, missingKey: 'UNKNOWN_MODEL' };
  }
} 