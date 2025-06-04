import { handleApiError, formatErrorMessage } from '../utils/errorHandler';
import { handleStreamResponse } from '../utils/streamHandler';

export async function makeApiStreamRequest(
  url: string,
  apiKey: string,
  requestBody: any,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal,
  errorContext = 'API'
): Promise<void> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Website Generator'
      },
      body: JSON.stringify(requestBody),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${errorContext} error: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    await handleStreamResponse(reader, { onChunk, onComplete, signal });
  } catch (error) {
    const errorInfo = handleApiError(error, `${errorContext} stream request`);
    if (errorInfo.code === 'ABORTED') {
      throw error;
    }
    throw new Error(formatErrorMessage(errorInfo));
  }
}
