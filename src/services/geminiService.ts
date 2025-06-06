import { GoogleGenAI, GenerateContentParameters, Chat } from "@google/genai";
import { 
  generateWebsitePlanPrompt, 
  generateWebsitePromptWithPlan,
  getChatSystemInstruction,
  getPlanChatSystemInstruction,
  getHtmlChatInitialMessage,
  getPlanChatInitialMessage
} from "../templates/promptTemplates";
import { handleApiError, formatErrorMessage } from "../utils/errorHandler";
import { createLogger } from "../utils/logger";

// 创建模块特定的logger
const logger = createLogger('GeminiService');

// 可选择的Gemini模型列表
export const GEMINI_MODELS = [
  {
    id: "gemini-2.5-pro-preview-06-05",
    name: "Gemini 2.5 Pro"
  },
  {
    id: "gemini-2.5-flash-preview-05-20",
    name: "Gemini 2.5 Flash"
  }
] as const;

// 默认模型
const DEFAULT_MODEL = GEMINI_MODELS[0].id;

export async function generateWebsitePlanStream(
  ai: GoogleGenAI,
  reportText: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  modelName?: string
): Promise<void> {
  const prompt = generateWebsitePlanPrompt(reportText);
  
  const requestParams: GenerateContentParameters = { 
    model: modelName || DEFAULT_MODEL, 
    contents: prompt 
  };

  logger.debug('Starting plan generation stream');
  try {
    // Fix: Pass AbortSignal directly within the first argument object
    const streamRequest = signal ? { ...requestParams, signal } : requestParams;
    const responseStream = await ai.models.generateContentStream(streamRequest);

    let accumulatedText = "";
    for await (const chunk of responseStream) {
      const chunkText = chunk.text; 
      if (chunkText) { 
        accumulatedText += chunkText;
        onChunk(chunkText); 
      }
    }
    logger.debug('Plan stream completed', { length: accumulatedText.length });
    onComplete(accumulatedText);
  } catch (error) {
    const errorInfo = handleApiError(error, 'generateWebsitePlanStream');
    if (errorInfo.code === 'ABORTED') {
      throw error; // Re-throw abort errors
    }
    throw new Error(formatErrorMessage(errorInfo));
  }
}


export async function generateWebsiteFromReportWithPlanStream(
  ai: GoogleGenAI,
  reportText: string,
  planText: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  modelName?: string
): Promise<void> {
  const prompt = generateWebsitePromptWithPlan(reportText, planText);

  const requestParams: GenerateContentParameters = { 
    model: modelName || DEFAULT_MODEL, 
    contents: prompt 
  };
  
  logger.debug('Starting website HTML generation stream');
  try {
    // Fix: Pass AbortSignal directly within the first argument object
    const streamRequest = signal ? { ...requestParams, signal } : requestParams;
    const responseStream = await ai.models.generateContentStream(streamRequest);
    
    let accumulatedText = "";
    for await (const chunk of responseStream) {
      const chunkText = chunk.text; 
      if (chunkText) { 
        accumulatedText += chunkText;
        onChunk(chunkText); 
      }
    }
    logger.debug('HTML stream completed', { length: accumulatedText.length });
    onComplete(accumulatedText);

  } catch (error) {
    const errorInfo = handleApiError(error, 'generateWebsiteFromReportWithPlanStream');
    if (errorInfo.code === 'ABORTED') {
      throw error; // Re-throw abort errors
    }
    throw new Error(formatErrorMessage(errorInfo));
  }
}

// --- Gemini Chat Session Classes ---

export class GeminiChatSession {
  private chatSession: Chat;

  constructor(ai: GoogleGenAI, initialHtml: string, reportText: string, planText: string, modelName?: string) {
    // 构造Gemini API格式的聊天历史
    const chatHistory = [
      { role: "user", parts: [{ text: getHtmlChatInitialMessage(initialHtml, reportText, planText) }] },
      { role: "model", parts: [{ text: initialHtml }] }
    ];
    
    this.chatSession = ai.chats.create({
      model: modelName || DEFAULT_MODEL,
      config: { systemInstruction: getChatSystemInstruction() },
      history: chatHistory,
    });
  }

  async sendMessageStream(
    message: string,
    onChunk: (chunkText: string) => void,
    onComplete: (finalText: string) => void,
    signal?: AbortSignal
  ): Promise<void> {
    try {
      // Early check for already aborted signal
      if (signal?.aborted) {
        throw new DOMException('The user aborted a request.', 'AbortError');
      }

      // Pass AbortSignal to sendMessageStream if supported
      const streamRequest = signal ? { message: message, signal } : { message: message };
      const stream = await this.chatSession.sendMessageStream(streamRequest);

      let accumulatedText = "";
      for await (const chunk of stream) {
        if (signal?.aborted) {
          throw new DOMException('The user aborted a request.', 'AbortError');
        }
        const chunkText = chunk.text;
        if (chunkText) {
          accumulatedText += chunkText;
          onChunk(chunkText);
        }
      }
      onComplete(accumulatedText);
    } catch (error) {
      logger.error("Error in Gemini chat stream:", error);
      throw error;
    }
  }
}

export class GeminiPlanChatSession {
  private chatSession: Chat;

  constructor(ai: GoogleGenAI, initialPlan: string, reportText: string, modelName?: string) {
    // 构造Gemini API格式的聊天历史
    const chatHistory = [
      { role: "user", parts: [{ text: getPlanChatInitialMessage(initialPlan, reportText) }] },
      { role: "model", parts: [{ text: initialPlan }] }
    ];
    
    this.chatSession = ai.chats.create({
      model: modelName || DEFAULT_MODEL,
      config: { systemInstruction: getPlanChatSystemInstruction() },
      history: chatHistory,
    });
  }

  async sendMessageStream(
    message: string,
    onChunk: (chunkText: string) => void,
    onComplete: (finalText: string) => void,
    signal?: AbortSignal
  ): Promise<void> {
    try {
      // Early check for already aborted signal
      if (signal?.aborted) {
        throw new DOMException('The user aborted a request.', 'AbortError');
      }

      // Pass AbortSignal to sendMessageStream if supported
      const streamRequest = signal ? { message: message, signal } : { message: message };
      const stream = await this.chatSession.sendMessageStream(streamRequest);

      let accumulatedText = "";
      for await (const chunk of stream) {
        if (signal?.aborted) {
          throw new DOMException('The user aborted a request.', 'AbortError');
        }
        const chunkText = chunk.text;
        if (chunkText) {
          accumulatedText += chunkText;
          onChunk(chunkText);
        }
      }
      onComplete(accumulatedText);
    } catch (error) {
      logger.error("Error in Gemini plan chat stream:", error);
      throw error;
    }
  }
}
