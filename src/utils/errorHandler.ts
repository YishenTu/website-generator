/**
 * 错误处理工具函数
 */

import { logger } from './logger';

export interface ErrorInfo {
  code?: string;
  message: string;
  details?: unknown;
}

/**
 * 处理API错误
 * @param error 错误对象
 * @param context 错误上下文
 * @returns 格式化的错误信息
 */
export function handleApiError(error: unknown, context: string): ErrorInfo {
  logger.error(`Error in ${context}:`, error);
  
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return {
        code: 'ABORTED',
        message: '操作已被用户取消',
        details: error
      };
    }
    
    if (error.message.includes('API key') || error.message.includes('API_KEY')) {
      return {
        code: 'API_KEY_ERROR',
        message: `API密钥无效或未配置`,
        details: error
      };
    }
    
    if (error.message.includes('finishReason') || error.message.includes('SAFETY')) {
      return {
        code: 'CONTENT_FILTER',
        message: '内容被AI模型安全过滤器拦截',
        details: error
      };
    }
    
    return {
      code: 'API_ERROR',
      message: error.message || `${context}失败`,
      details: error
    };
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: `发生未知错误`,
    details: error
  };
}

/**
 * 格式化错误消息用于显示
 * @param errorInfo 错误信息
 * @returns 用户友好的错误消息
 */
export function formatErrorMessage(errorInfo: ErrorInfo): string {
  switch (errorInfo.code) {
    case 'ABORTED':
      return errorInfo.message;
    case 'API_KEY_ERROR':
      return errorInfo.message + '。请检查环境变量配置。';
    case 'CONTENT_FILTER':
      return errorInfo.message + '。请修改内容后重试。';
    default:
      return errorInfo.message;
  }
} 