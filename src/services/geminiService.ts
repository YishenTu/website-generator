import { GoogleGenAI, Chat } from "@google/genai";
import {
  generateWebsitePlanPrompt,
  generateWebsitePromptWithPlan,
  getChatSystemInstruction,
  getPlanChatSystemInstruction,
  getHtmlChatInitialMessage,
  getPlanChatInitialMessage,
  type PlanSettings
} from "../templates/promptOrchestrator";
import { handleApiError, formatErrorMessage } from "../utils/errorHandler";
import { createLogger } from "../utils/logger";

// 创建模块特定的logger
const logger = createLogger('GeminiService');

// 可选择的Gemini模型列表
export const GEMINI_MODELS = [
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro"
  }
] as const;

// 默认模型
const DEFAULT_MODEL = GEMINI_MODELS[0].id;

// 思考预算配置 - 设置为最大值以获得最佳推理能力
const getMaxThinkingBudget = (modelName: string): number => {
  if (modelName.includes('flash')) {
    return 24576; // Gemini 2.5 Flash 最大思考预算
  } else if (modelName.includes('pro')) {
    return 32768; // Gemini 2.5 Pro 最大思考预算
  }
  return 32768; // 默认使用 Pro 的最大值
};

// 创建生成配置，包含思考预算 - 仅用于内容生成
const createGenerationConfig = (modelName: string) => ({
  thinkingConfig: {
    thinking_budget: getMaxThinkingBudget(modelName)
  }
});

export async function generateWebsitePlanStream(
  ai: GoogleGenAI,
  reportText: string,
  settings: PlanSettings,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  modelName?: string,
  maxThinking: boolean = false
): Promise<void> {
  const prompt = generateWebsitePlanPrompt(reportText, settings);
  const model = modelName || DEFAULT_MODEL;

  const requestParams = maxThinking ? {
    model: model,
    contents: prompt,
    generationConfig: createGenerationConfig(model)
  } : {
    model: model,
    contents: prompt
  };

  logger.debug(`Starting plan generation stream${maxThinking ? ' with maximum thinking budget' : ''}`, {
    model,
    maxThinking,
    ...(maxThinking && { thinkingBudget: getMaxThinkingBudget(model) })
  });
  try {
    // Fix: Pass AbortSignal directly within the first argument object
    const streamRequest = signal ? { ...requestParams, signal } : requestParams;
    const responseStream = await ai.models.generateContentStream(streamRequest);

    let accumulatedText = "";
    for await (const chunk of responseStream) {
      if (signal?.aborted) {
        throw new DOMException('The user aborted a request.', 'AbortError');
      }
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
  modelName?: string,
  maxThinking: boolean = false,
  outputType: 'webpage' | 'slides' = 'webpage'
): Promise<void> {
  const prompt = generateWebsitePromptWithPlan(reportText, planText, outputType);
  const model = modelName || DEFAULT_MODEL;

  const requestParams = maxThinking ? {
    model: model,
    contents: prompt,
    generationConfig: createGenerationConfig(model)
  } : {
    model: model,
    contents: prompt
  };

  logger.debug(`Starting website HTML generation stream${maxThinking ? ' with maximum thinking budget' : ''}`, {
    model,
    maxThinking,
    ...(maxThinking && { thinkingBudget: getMaxThinkingBudget(model) })
  });
  try {
    // Fix: Pass AbortSignal directly within the first argument object
    const streamRequest = signal ? { ...requestParams, signal } : requestParams;
    const responseStream = await ai.models.generateContentStream(streamRequest);

    let accumulatedText = "";
    for await (const chunk of responseStream) {
      if (signal?.aborted) {
        throw new DOMException('The user aborted a request.', 'AbortError');
      }
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

  constructor(ai: GoogleGenAI, initialHtml: string, reportText: string, planText: string, modelName?: string, outputType: 'webpage' | 'slides' = 'webpage') {
    const model = modelName || DEFAULT_MODEL;
    // 构造Gemini API格式的聊天历史
    const chatHistory = [
      { role: "user", parts: [{ text: getHtmlChatInitialMessage(initialHtml, reportText, planText, outputType) }] },
      { role: "model", parts: [{ text: initialHtml }] }
    ];

    this.chatSession = ai.chats.create({
      model: model,
      config: {
        systemInstruction: getChatSystemInstruction(outputType)
      },
      history: chatHistory,
    });

    logger.debug('Created Gemini chat session', { model });
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

  constructor(ai: GoogleGenAI, initialPlan: string, reportText: string, settings: PlanSettings, modelName?: string) {
    const model = modelName || DEFAULT_MODEL;
    // 构造Gemini API格式的聊天历史
    const chatHistory = [
      { role: "user", parts: [{ text: getPlanChatInitialMessage(initialPlan, reportText, settings) }] },
      { role: "model", parts: [{ text: initialPlan }] }
    ];

    this.chatSession = ai.chats.create({
      model: model,
      config: {
        systemInstruction: getPlanChatSystemInstruction(settings.outputType)
      },
      history: chatHistory,
    });

    logger.debug('Created Gemini plan chat session', { model, outputType: settings.outputType });
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
