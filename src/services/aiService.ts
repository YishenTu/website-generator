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
  switch (model) {
    case AIModel.Gemini:
      return new GeminiChatSession(ai, initialHtml);
    case AIModel.Claude:
      return new OpenRouterChatSession(initialHtml);
    default:
      throw new Error(`Unsupported model for HTML chat: ${model}`);
  }
}

export function createPlanChatSession(
  model: AIModel,
  ai: GoogleGenAI,
  initialPlan: string
): ChatSession {
  switch (model) {
    case AIModel.Gemini:
      return new GeminiPlanChatSession(ai, initialPlan);
    case AIModel.Claude:
      return new OpenRouterPlanChatSession(initialPlan);
    default:
      throw new Error(`Unsupported model for plan chat: ${model}`);
  }
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