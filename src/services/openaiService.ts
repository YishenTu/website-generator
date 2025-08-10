import {
  generateWebsitePlanPrompt,
  generateWebsitePromptWithPlan,
  getChatSystemInstruction,
  getPlanChatSystemInstruction,
  getHtmlChatInitialMessage,
  getPlanChatInitialMessage,
  type PlanSettings
} from "../templates/promptOrchestrator";
import { makeApiStreamRequest } from "./streamRequest";

// Available OpenAI models
export const OPENAI_MODELS = [
  {
    id: 'gpt-5',
    name: 'GPT-5'
  }
] as const;

// Default model
const DEFAULT_MODEL = OPENAI_MODELS[0].id;

// Responses API Message format
interface OpenAIMessage {
  role: 'developer' | 'user' | 'assistant';
  content: string;
}

// Strict Responses API input message (content parts array)
type OpenAIInputMessage = {
  role: 'developer' | 'user' | 'assistant';
  content: { type: 'text'; text: string }[];
};

// Responses API Request format
interface OpenAIResponsesRequest {
  model: string;
  input: string | OpenAIInputMessage[];
  reasoning?: {
    effort: 'low' | 'medium' | 'high' | 'minimal';
    summary?: 'auto' | 'concise' | 'detailed';
  };
  stream?: boolean;
}

// Map our simple message shape to Responses API input format
function toOpenAIInput(messages: OpenAIMessage[]): OpenAIInputMessage[] {
  return messages.map(m => ({
    role: m.role,
    content: [{ type: 'text', text: m.content }]
  }));
}

// --- Generic Stream Request Helper for Responses API ---

async function makeGenericStreamRequest(
  requestBody: OpenAIResponsesRequest,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  errorContext: string = "OpenAI",
  enableMaxThinking: boolean = false
): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured. Please ensure the OPENAI_API_KEY environment variable is set.");
  }
  
  // Set reasoning effort based on max thinking setting
  if (!requestBody.reasoning) {
    requestBody.reasoning = {
      effort: enableMaxThinking ? 'high' : 'medium',
      summary: 'auto'
    };
  }
  
  // Use Responses API endpoint
  await makeApiStreamRequest("https://api.openai.com/v1/responses", apiKey, requestBody, onChunk, onComplete, signal, errorContext);
}

// --- Base Stream Request Function ---

async function makeOpenAIStreamRequest(
  prompt: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  modelName?: string,
  enableMaxThinking: boolean = false
): Promise<void> {
  const requestBody: OpenAIResponsesRequest = {
    model: modelName || DEFAULT_MODEL,
    input: prompt,
    stream: true
  };

  return makeGenericStreamRequest(requestBody, onChunk, onComplete, signal, "OpenAI", enableMaxThinking);
}

// --- Chat Stream Request Function ---

async function makeChatStreamRequest(
  messages: OpenAIMessage[],
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  modelName?: string,
  enableMaxThinking: boolean = false
): Promise<void> {
  const requestBody: OpenAIResponsesRequest = {
    model: modelName || DEFAULT_MODEL,
    input: toOpenAIInput(messages),
    stream: true
  };

  return makeGenericStreamRequest(requestBody, onChunk, onComplete, signal, "chat", enableMaxThinking);
}

// --- Public API Functions ---

export async function generateWebsitePlanStreamOpenAI(
  reportText: string,
  settings: PlanSettings,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  modelName?: string,
  enableMaxThinking: boolean = false
): Promise<void> {
  const prompt = generateWebsitePlanPrompt(reportText, settings);
  return makeOpenAIStreamRequest(prompt, onChunk, onComplete, signal, modelName, enableMaxThinking);
}

export async function generateWebsiteFromReportWithPlanStreamOpenAI(
  reportText: string,
  planText: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  modelName?: string,
  outputType: 'webpage' | 'slides' = 'webpage',
  enableMaxThinking: boolean = false
): Promise<void> {
  const prompt = generateWebsitePromptWithPlan(reportText, planText, outputType);
  return makeOpenAIStreamRequest(prompt, onChunk, onComplete, signal, modelName, enableMaxThinking);
}

// --- Chat Session Classes ---

export class OpenAIChatSession {
  private messages: OpenAIMessage[] = [];
  private apiKey: string;
  private modelName: string;
  private enableMaxThinking: boolean;
  
  constructor(initialHtml: string, reportText: string, planText: string, modelName?: string, outputType: 'webpage' | 'slides' = 'webpage', enableMaxThinking: boolean = false) {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.modelName = modelName || DEFAULT_MODEL;
    this.enableMaxThinking = enableMaxThinking;

    if (!this.apiKey) {
      throw new Error("OpenAI API key is not configured.");
    }

    // Initialize chat session with system instruction and initial HTML
    this.messages = [
      {
        role: 'developer',
        content: getChatSystemInstruction(outputType)
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
      this.enableMaxThinking
    );
  }
}

export class OpenAIPlanChatSession {
  private messages: OpenAIMessage[] = [];
  private apiKey: string;
  private modelName: string;
  private enableMaxThinking: boolean;
  
  constructor(initialPlan: string, reportText: string, settings: PlanSettings, modelName?: string, enableMaxThinking: boolean = false) {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.modelName = modelName || DEFAULT_MODEL;
    this.enableMaxThinking = enableMaxThinking;

    if (!this.apiKey) {
      throw new Error("OpenAI API key is not configured.");
    }

    // Initialize chat session with system instruction for plan modification
    this.messages = [
      {
        role: 'developer',
        content: getPlanChatSystemInstruction(settings.outputType)
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
      this.enableMaxThinking
    );
  }
}
