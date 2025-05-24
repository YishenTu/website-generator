import { getChatSystemInstruction } from "../templates/promptTemplates";

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const CLAUDE_MODEL = 'anthropic/claude-sonnet-4';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterChatRequest {
  model: string;
  messages: OpenRouterMessage[];
  stream: boolean;
}

export class OpenRouterChatSession {
  private messages: OpenRouterMessage[] = [];
  private apiKey: string;

  constructor(initialHtml: string) {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error("OpenRouter API key is not configured.");
    }

    // Initialize chat session with system instruction and initial HTML
    this.messages = [
      {
        role: 'system',
        content: getChatSystemInstruction()
      },
      {
        role: 'user',
        content: `I have a website generated from a report and a plan. Here's the initial HTML. I will give you instructions to modify it. Your responses should only be the complete, updated HTML code. Initial HTML:\n\n${initialHtml}`
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

    const requestBody: OpenRouterChatRequest = {
      model: CLAUDE_MODEL,
      messages: [...this.messages],
      stream: true
    };

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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
                // Add assistant response to conversation history
                this.messages.push({
                  role: 'assistant',
                  content: accumulatedText
                });
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

      // Add assistant response to conversation history
      this.messages.push({
        role: 'assistant',
        content: accumulatedText
      });
      onComplete(accumulatedText);
    } catch (error) {
      console.error("Error in OpenRouter chat stream:", error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw error;
        }
        if (error.message.includes("API key") || error.message.includes("Authorization")) {
          throw new Error("Invalid or missing OpenRouter API Key for chat.");
        }
        throw new Error(`Failed to send chat message via OpenRouter: ${error.message}`);
      }
      throw new Error("An unknown error occurred during OpenRouter chat.");
    }
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

    // Initialize chat session with system instruction for plan modification
    this.messages = [
      {
        role: 'system',
        content: 'You are an expert web design planner. When the user asks you to modify a website plan, respond with only the complete updated plan text. Do not include any explanations, markdown formatting, or additional text.'
      },
      {
        role: 'user',
        content: `I have a website plan generated from a report. Here's the plan. I will give you instructions to modify it. Your responses should only be the complete, updated plan text. Initial Plan:\n\n${initialPlan}`
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

    const requestBody: OpenRouterChatRequest = {
      model: CLAUDE_MODEL,
      messages: [...this.messages],
      stream: true
    };

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Website Generator - Plan Chat'
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
                // Add assistant response to conversation history
                this.messages.push({
                  role: 'assistant',
                  content: accumulatedText
                });
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

      // Add assistant response to conversation history
      this.messages.push({
        role: 'assistant',
        content: accumulatedText
      });
      onComplete(accumulatedText);
    } catch (error) {
      console.error("Error in OpenRouter plan chat stream:", error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw error;
        }
        if (error.message.includes("API key") || error.message.includes("Authorization")) {
          throw new Error("Invalid or missing OpenRouter API Key for plan chat.");
        }
        throw new Error(`Failed to send plan chat message via OpenRouter: ${error.message}`);
      }
      throw new Error("An unknown error occurred during OpenRouter plan chat.");
    }
  }
} 