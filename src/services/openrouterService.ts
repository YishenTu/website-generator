import { 
  generateWebsitePlanPrompt, 
  generateWebsitePromptWithPlan,
  getChatSystemInstruction,
  getPlanChatSystemInstruction,
  getHtmlChatInitialMessage,
  getPlanChatInitialMessage,
  type PlanSettings
} from "../templates/promptTemplates";
import { makeApiStreamRequest } from "./streamRequest";
import { ENV_VARS } from "../utils/constants";
import { getEnvVar } from "../utils/env";
import { logger } from '../utils/logger';

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
  },
  {
    id: 'openai/o3',
    name: 'OpenAI o3'
  },
  {
    id: 'openai/o3-pro',
    name: 'OpenAI o3-Pro'
  }
] as const;

// 默认模型
const DEFAULT_MODEL = OPENROUTER_MODELS[0].id;

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Reasoning configuration interface based on OpenRouter API
interface ReasoningConfig {
  max_tokens?: number;
  effort?: 'high' | 'medium' | 'low';
  exclude?: boolean;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  stream: boolean;
  reasoning?: ReasoningConfig;
}



// 创建reasoning配置
function createReasoningConfig(modelId: string, maxThinking: boolean = false): ReasoningConfig | undefined {
  if (!maxThinking) {
    return undefined;
  }

  // 对于Claude模型，使用max_tokens=32000
  if (modelId.includes('claude')) {
    logger.info(`Setting reasoning max_tokens to 32000 for Claude model ${modelId}, exclude: true`);
    return {
      max_tokens: 32000,
      exclude: true // 永远排除reasoning tokens输出
    };
  }
  
  // 对于其他模型（包括OpenAI o3/o3-pro和DeepSeek R1），使用effort=high
  logger.info(`Setting reasoning effort to 'high' for model ${modelId}, exclude: true`);
  return {
    effort: 'high',
    exclude: true // 永远排除reasoning tokens输出
  };
}

// --- Generic Stream Request Helper ---

async function makeGenericStreamRequest(
  requestBody: OpenRouterRequest,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  errorContext: string = "OpenRouter"
): Promise<void> {
  const apiKey = getEnvVar("OPENROUTER_API_KEY");
  if (!apiKey) {
    throw new Error(`OpenRouter API key is not configured. Please ensure the ${ENV_VARS.OPENROUTER_API_KEY} environment variable is set.`);
  }
  
  // Log reasoning configuration if present
  if (requestBody.reasoning) {
    logger.info(`Using reasoning configuration: ${JSON.stringify(requestBody.reasoning)}`);
  }
  
  await makeApiStreamRequest(OPENROUTER_API_URL, apiKey, requestBody, onChunk, onComplete, signal, errorContext);
}

// --- Base Stream Request Function ---

async function makeOpenRouterStreamRequest(
  prompt: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  modelName?: string,
  maxThinking: boolean = false
): Promise<void> {
  const model = modelName || DEFAULT_MODEL;
  const requestBody: OpenRouterRequest = {
    model,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    stream: true
  };

  // Add reasoning configuration if maxThinking is enabled
  const reasoningConfig = createReasoningConfig(model, maxThinking);
  if (reasoningConfig) {
    requestBody.reasoning = reasoningConfig;
  }

  return makeGenericStreamRequest(requestBody, onChunk, onComplete, signal);
}

// --- Chat Stream Request Function ---

async function makeChatStreamRequest(
  messages: OpenRouterMessage[],
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  modelName?: string,
  maxThinking: boolean = false
): Promise<void> {
  const model = modelName || DEFAULT_MODEL;
  const requestBody: OpenRouterRequest = {
    model,
    messages: [...messages],
    stream: true
  };

  // Add reasoning configuration if maxThinking is enabled
  const reasoningConfig = createReasoningConfig(model, maxThinking);
  if (reasoningConfig) {
    requestBody.reasoning = reasoningConfig;
  }

  return makeGenericStreamRequest(requestBody, onChunk, onComplete, signal, "chat");
}

// --- Public API Functions ---

export async function generateWebsitePlanStreamOpenRouter(
  reportText: string,
  settings: PlanSettings,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  modelName?: string,
  maxThinking: boolean = false
): Promise<void> {
  const prompt = generateWebsitePlanPrompt(reportText, settings);
  return makeOpenRouterStreamRequest(prompt, onChunk, onComplete, signal, modelName, maxThinking);
}

export async function generateWebsiteFromReportWithPlanStreamOpenRouter(
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
  return makeOpenRouterStreamRequest(prompt, onChunk, onComplete, signal, modelName, maxThinking);
}

// --- Chat Session Classes ---

export class OpenRouterChatSession {
  private messages: OpenRouterMessage[] = [];
  private apiKey: string;
  private modelName: string;

  constructor(initialHtml: string, reportText: string, planText: string, modelName?: string, outputType: 'webpage' | 'slides' = 'webpage') {
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
        content: getHtmlChatInitialMessage(initialHtml, reportText, planText, outputType)
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
      this.modelName,
      false // 聊天不使用max thinking
    );
  }
}

export class OpenRouterPlanChatSession {
  private messages: OpenRouterMessage[] = [];
  private apiKey: string;
  private modelName: string;

  constructor(initialPlan: string, reportText: string, settings: PlanSettings, modelName?: string) {
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
        content: getPlanChatInitialMessage(initialPlan, reportText, settings)
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
      this.modelName,
      false // 聊天不使用max thinking
    );
  }
} 