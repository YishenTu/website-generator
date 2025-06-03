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
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            options.onComplete(accumulatedText);
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulatedText += content;
              options.onChunk(content);
            }
          } catch (e) {
            // 忽略解析错误
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