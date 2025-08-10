/**
 * 流式处理工具函数
 */

export interface StreamHandlerOptions {
  onChunk: (chunk: string) => void;
  onComplete: (finalText: string) => void;
  signal?: AbortSignal;
}

/**
 * 处理流式响应
 * @param reader ReadableStreamDefaultReader
 * @param options 流处理选项
 */
export async function handleStreamResponse(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  options: StreamHandlerOptions
): Promise<void> {
  const decoder = new TextDecoder();
  let accumulatedText = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        // Handle OpenAI Responses API format (event + data lines)
        if (line.startsWith('event: ')) {
          continue;
        }
        
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            options.onComplete(accumulatedText);
            return;
          }

          try {
            const parsed = JSON.parse(data);
            
            // Handle different streaming formats
            let content: string | undefined;
            
            // OpenAI Responses API format
            if (parsed.type === 'response.output_text.delta' && parsed.delta) {
              content = parsed.delta;
            }
            // OpenAI Responses API completion event
            else if (parsed.type === 'response.completed') {
              options.onComplete(accumulatedText);
              return;
            }
            // Chat Completions API format
            else if (parsed.choices?.[0]?.delta?.content) {
              content = parsed.choices[0].delta.content;
            }
            // Other possible formats
            else if (parsed.output) {
              content = parsed.output;
            } else if (parsed.delta?.output) {
              content = parsed.delta.output;
            } else if (parsed.delta?.content) {
              content = parsed.delta.content;
            }
            
            if (content) {
              accumulatedText += content;
              options.onChunk(content);
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  options.onComplete(accumulatedText);
}

/**
 * 创建带有超时的AbortController
 * @param timeoutMs 超时时间（毫秒）
 * @returns AbortController
 */
export function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  
  // 清理超时定时器
  controller.signal.addEventListener('abort', () => {
    clearTimeout(timeoutId);
  });
  
  return controller;
} 