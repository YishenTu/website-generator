import { generateWebsitePlanPrompt, generateWebsitePromptWithPlan } from "../templates/promptTemplates";

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

async function makeOpenRouterStreamRequest(
  prompt: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured. Please ensure the OPENROUTER_API_KEY environment variable is set.");
  }

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
    console.error("Error in OpenRouter stream request:", error);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      if (error.message.includes("API key") || error.message.includes("Authorization")) {
        throw new Error("Invalid or missing OpenRouter API Key.");
      }
      throw new Error(`Failed to communicate with OpenRouter: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with OpenRouter.");
  }
}

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