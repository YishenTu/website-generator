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

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// 可选择的OpenAI模型列表
export const OPENAI_MODELS = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo'
  }
] as const;

// 默认模型
const DEFAULT_MODEL = OPENAI_MODELS[0].id;

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  stream: boolean;
}

// --- Generic Stream Request Helper ---

async function makeGenericStreamRequest(
  requestBody: OpenAIRequest,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  errorContext: string = "OpenAI"
): Promise<void> {
  const apiKey = getEnvVar('OPENAI_API_KEY');
  
  if (!apiKey) {
    throw new Error(`OpenAI API key is not configured. Please ensure the ${ENV_VARS.OPENAI_API_KEY} environment variable is set.`);
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
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
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
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

async function makeOpenAIStreamRequest(
  prompt: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  modelName?: string
): Promise<void> {
  const requestBody: OpenAIRequest = {
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
  messages: OpenAIMessage[],
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  modelName?: string
): Promise<void> {
  const requestBody: OpenAIRequest = {
    model: modelName || DEFAULT_MODEL,
    messages: [...messages],
    stream: true
  };

  return makeGenericStreamRequest(requestBody, onChunk, onComplete, signal, "chat");
}

// --- Public API Functions ---

export async function generateWebsitePlanStreamOpenAI(
  reportText: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  modelName?: string
): Promise<void> {
  const prompt = generateWebsitePlanPrompt(reportText);
  return makeOpenAIStreamRequest(prompt, onChunk, onComplete, signal, modelName);
}

export async function generateWebsiteFromReportWithPlanStreamOpenAI(
  reportText: string,
  planText: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  modelName?: string
): Promise<void> {
  const prompt = generateWebsitePromptWithPlan(reportText, planText);
  return makeOpenAIStreamRequest(prompt, onChunk, onComplete, signal, modelName);
}

// --- Chat Session Classes ---

export class OpenAIChatSession {
  private messages: OpenAIMessage[] = [];
  private apiKey: string;
  private modelName: string;

  constructor(initialHtml: string, reportText: string, planText: string, modelName?: string) {
    this.apiKey = getEnvVar('OPENAI_API_KEY') || '';
    this.modelName = modelName || DEFAULT_MODEL;
    
    if (!this.apiKey) {
      throw new Error("OpenAI API key is not configured.");
    }

    // Initialize chat session with system instruction and initial HTML using promptTemplates
    this.messages = [
      {
        role: 'system',
        content: getChatSystemInstruction()
      },
      {
        role: 'user',
        content: getHtmlChatInitialMessage(initialHtml, reportText, planText)
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

export class OpenAIPlanChatSession {
  private messages: OpenAIMessage[] = [];
  private apiKey: string;
  private modelName: string;

  constructor(initialPlan: string, reportText: string, modelName?: string) {
    this.apiKey = getEnvVar('OPENAI_API_KEY') || '';
    this.modelName = modelName || DEFAULT_MODEL;
    
    if (!this.apiKey) {
      throw new Error("OpenAI API key is not configured.");
    }

    // Initialize chat session with system instruction for plan modification using promptTemplates
    this.messages = [
      {
        role: 'system',
        content: getPlanChatSystemInstruction()
      },
      {
        role: 'user',
        content: getPlanChatInitialMessage(initialPlan, reportText)
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
