import { 
  generateWebsitePlanPrompt, 
  generateWebsitePromptWithPlan,
  getChatSystemInstruction,
  getPlanChatSystemInstruction,
  getHtmlChatInitialMessage,
  getPlanChatInitialMessage
} from "../templates/promptTemplates";
import { handleApiError, formatErrorMessage } from "../utils/errorHandler";
import { handleStreamResponse } from "../utils/streamHandler";
import { createLogger } from "../utils/logger";
import { ENV_VARS } from "../utils/constants";
import { getEnvVar } from "../utils/env";

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// 可选择的OpenRouter模型列表
export const OPENROUTER_MODELS = [
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude 4 Sonnet'
  },
  {
    id: 'anthropic/claude-opus-4',
    name: 'Claude 4 Opus'
  },
  {
    id: 'anthropic/claude-3.7-sonnet',
    name: 'Claude 3.7 Sonnet'
  },
  {
    id: 'deepseek/deepseek-r1-0528',
    name: 'DeepSeek R1'
  }
] as const;

// 默认模型
const DEFAULT_MODEL = OPENROUTER_MODELS[0].id;

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  stream: boolean;
}

// --- Generic Stream Request Helper ---

async function makeGenericStreamRequest(
  requestBody: OpenRouterRequest,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  errorContext: string = "OpenRouter"
): Promise<void> {
  const apiKey = getEnvVar('OPENROUTER_API_KEY');
  
  if (!apiKey) {
    throw new Error(`OpenRouter API key is not configured. Please ensure the ${ENV_VARS.OPENROUTER_API_KEY} environment variable is set.`);
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Website Generator'
      },
      body: JSON.stringify(requestBody),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    await handleStreamResponse(reader, {
      onChunk,
      onComplete,
      signal
    });
  } catch (error) {
    const errorInfo = handleApiError(error, `${errorContext} stream request`);
    if (errorInfo.code === 'ABORTED') {
      throw error; // Re-throw abort errors
    }
    throw new Error(formatErrorMessage(errorInfo));
  }
}

// --- Base Stream Request Function ---

async function makeOpenRouterStreamRequest(
  prompt: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  modelName?: string
): Promise<void> {
  const requestBody: OpenRouterRequest = {
    model: modelName || DEFAULT_MODEL,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    stream: true
  };

  return makeGenericStreamRequest(requestBody, onChunk, onComplete, signal);
}

// --- Chat Stream Request Function ---

async function makeChatStreamRequest(
  messages: OpenRouterMessage[],
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  modelName?: string
): Promise<void> {
  const requestBody: OpenRouterRequest = {
    model: modelName || DEFAULT_MODEL,
    messages: [...messages],
    stream: true
  };

  return makeGenericStreamRequest(requestBody, onChunk, onComplete, signal, "chat");
}

// --- Public API Functions ---

export async function generateWebsitePlanStreamOpenRouter(
  reportText: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  modelName?: string
): Promise<void> {
  const prompt = generateWebsitePlanPrompt(reportText);
  return makeOpenRouterStreamRequest(prompt, onChunk, onComplete, signal, modelName);
}

export async function generateWebsiteFromReportWithPlanStreamOpenRouter(
  reportText: string,
  planText: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  modelName?: string
): Promise<void> {
  const prompt = generateWebsitePromptWithPlan(reportText, planText);
  return makeOpenRouterStreamRequest(prompt, onChunk, onComplete, signal, modelName);
}

// --- Chat Session Classes ---

export class OpenRouterChatSession {
  private messages: OpenRouterMessage[] = [];
  private apiKey: string;
  private modelName: string;

  constructor(initialHtml: string, modelName?: string) {
    this.apiKey = getEnvVar('OPENROUTER_API_KEY') || '';
    this.modelName = modelName || DEFAULT_MODEL;
    
    if (!this.apiKey) {
      throw new Error("OpenRouter API key is not configured.");
    }

    // Initialize chat session with system instruction and initial HTML using promptTemplates
    this.messages = [
      {
        role: 'system',
        content: getChatSystemInstruction()
      },
      {
        role: 'user',
        content: getHtmlChatInitialMessage(initialHtml)
      },
      {
        role: 'assistant',
        content: initialHtml
      }
    ];
  }

  async sendMessageStream(
    message: string,
    onChunk: (chunkText: string) => void,
    onComplete: (finalText: string) => void,
    signal?: AbortSignal
  ): Promise<void> {
    // Add user message to conversation history
    this.messages.push({
      role: 'user',
      content: message
    });

    let accumulatedText = "";

    await makeChatStreamRequest(
      this.messages,
      onChunk,
      (finalText) => {
        accumulatedText = finalText;
        // Add assistant response to conversation history
        this.messages.push({
          role: 'assistant',
          content: accumulatedText
        });
        onComplete(accumulatedText);
      },
      signal,
      this.modelName
    );
  }
}

export class OpenRouterPlanChatSession {
  private messages: OpenRouterMessage[] = [];
  private apiKey: string;
  private modelName: string;

  constructor(initialPlan: string, modelName?: string) {
    this.apiKey = getEnvVar('OPENROUTER_API_KEY') || '';
    this.modelName = modelName || DEFAULT_MODEL;
    
    if (!this.apiKey) {
      throw new Error("OpenRouter API key is not configured.");
    }

    // Initialize chat session with system instruction for plan modification using promptTemplates
    this.messages = [
      {
        role: 'system',
        content: getPlanChatSystemInstruction()
      },
      {
        role: 'user',
        content: getPlanChatInitialMessage(initialPlan)
      },
      {
        role: 'assistant',
        content: initialPlan
      }
    ];
  }

  async sendMessageStream(
    message: string,
    onChunk: (chunkText: string) => void,
    onComplete: (finalText: string) => void,
    signal?: AbortSignal
  ): Promise<void> {
    // Add user message to conversation history
    this.messages.push({
      role: 'user',
      content: message
    });

    let accumulatedText = "";

    await makeChatStreamRequest(
      this.messages,
      onChunk,
      (finalText) => {
        accumulatedText = finalText;
        // Add assistant response to conversation history
        this.messages.push({
          role: 'assistant',
          content: accumulatedText
        });
        onComplete(accumulatedText);
      },
      signal,
      this.modelName
    );
  }
} 