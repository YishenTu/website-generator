import { 
  generateWebsitePlanPrompt, 
  generateWebsitePromptWithPlan,
  getChatSystemInstruction,
  getPlanChatSystemInstruction,
  getHtmlChatInitialMessage,
  getPlanChatInitialMessage
} from "../templates/promptTemplates";

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const CLAUDE_MODEL = 'anthropic/claude-sonnet-4';

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
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured. Please ensure the OPENROUTER_API_KEY environment variable is set.");
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

    const decoder = new TextDecoder();
    let accumulatedText = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onComplete(accumulatedText);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                accumulatedText += content;
                onChunk(content);
              }
            } catch (e) {
              // Ignore parsing errors for malformed chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    onComplete(accumulatedText);
  } catch (error) {
    console.error(`Error in ${errorContext} stream request:`, error);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      if (error.message.includes("API key") || error.message.includes("Authorization")) {
        throw new Error(`Invalid or missing OpenRouter API Key${errorContext !== "OpenRouter" ? ` for ${errorContext}` : ""}.`);
      }
      throw new Error(`Failed to communicate with OpenRouter${errorContext !== "OpenRouter" ? ` (${errorContext})` : ""}: ${error.message}`);
    }
    throw new Error(`An unknown error occurred while communicating with OpenRouter${errorContext !== "OpenRouter" ? ` (${errorContext})` : ""}.`);
  }
}

// --- Base Stream Request Function ---

async function makeOpenRouterStreamRequest(
  prompt: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const requestBody: OpenRouterRequest = {
    model: CLAUDE_MODEL,
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
  signal?: AbortSignal
): Promise<void> {
  const requestBody: OpenRouterRequest = {
    model: CLAUDE_MODEL,
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
  signal?: AbortSignal
): Promise<void> {
  const prompt = generateWebsitePlanPrompt(reportText);
  return makeOpenRouterStreamRequest(prompt, onChunk, onComplete, signal);
}

export async function generateWebsiteFromReportWithPlanStreamOpenRouter(
  reportText: string,
  planText: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const prompt = generateWebsitePromptWithPlan(reportText, planText);
  return makeOpenRouterStreamRequest(prompt, onChunk, onComplete, signal);
}

// --- Chat Session Classes ---

export class OpenRouterChatSession {
  private messages: OpenRouterMessage[] = [];
  private apiKey: string;

  constructor(initialHtml: string) {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    
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
      signal
    );
  }
}

export class OpenRouterPlanChatSession {
  private messages: OpenRouterMessage[] = [];
  private apiKey: string;

  constructor(initialPlan: string) {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    
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
      signal
    );
  }
} 