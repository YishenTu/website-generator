import { GoogleGenAI } from "@google/genai";
import { AIModel } from "../types/types";
import { 
  generateWebsitePlanStream, 
  generateWebsiteFromReportWithPlanStream 
} from "./geminiService";
import {
  generateWebsitePlanStreamOpenRouter,
  generateWebsiteFromReportWithPlanStreamOpenRouter
} from "./openrouterService";

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