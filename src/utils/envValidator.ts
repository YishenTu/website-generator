/**
 * 环境变量验证工具
 * 在应用启动时验证必要的环境变量
 */

import { ENV_VARS } from './constants';
import { logger } from './logger';
import { getEnvVar, isDevelopment } from './env';

export interface EnvValidationResult {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
}

/**
 * 验证环境变量
 * @returns 验证结果
 */
export function validateEnvironmentVariables(): EnvValidationResult {
  const result: EnvValidationResult = {
    isValid: true,
    missingVars: [],
    warnings: [],
  };

  // 检查 Gemini API Key
  const geminiKey = getEnvVar('GEMINI_API_KEY');
  if (!geminiKey || geminiKey.trim() === '') {
    result.warnings.push(`${ENV_VARS.GEMINI_API_KEY} is not set. Gemini models will not be available.`);
  }

  // 检查 OpenRouter API Key
  const openrouterKey = getEnvVar('OPENROUTER_API_KEY');
  if (!openrouterKey || openrouterKey.trim() === '') {
    result.warnings.push(`${ENV_VARS.OPENROUTER_API_KEY} is not set. OpenRouter models will not be available.`);
  }

  // 至少需要一个API密钥
  if (!geminiKey && !openrouterKey) {
    result.isValid = false;
    result.missingVars.push('At least one API key (Gemini or OpenRouter)');
    logger.error('No API keys configured. At least one API key is required.');
  }

  // 开发环境特定的检查
  if (isDevelopment()) {
    // 检查是否使用了占位符值
    if (geminiKey === 'your_gemini_api_key_here' || geminiKey === 'your_api_key_here') {
      result.warnings.push('Gemini API key appears to be a placeholder value.');
    }
    if (openrouterKey === 'your_openrouter_api_key_here' || openrouterKey === 'your_api_key_here') {
      result.warnings.push('OpenRouter API key appears to be a placeholder value.');
    }
  }

  // 记录验证结果
  if (result.warnings.length > 0) {
    result.warnings.forEach(warning => logger.warn(warning));
  }

  if (!result.isValid) {
    logger.error('Environment validation failed', { missingVars: result.missingVars });
  } else {
    logger.info('Environment validation passed');
  }

  return result;
}

/**
 * 获取可用的API提供商
 * @returns 可用的提供商列表
 */
export function getAvailableProviders(): string[] {
  const providers: string[] = [];
  
  if (getEnvVar('GEMINI_API_KEY')) {
    providers.push('gemini');
  }
  
  if (getEnvVar('OPENROUTER_API_KEY')) {
    providers.push('openrouter');
  }
  
  return providers;
}

/**
 * 检查特定提供商是否可用
 * @param provider 提供商名称
 * @returns 是否可用
 */
export function isProviderAvailable(provider: 'gemini' | 'openrouter'): boolean {
  switch (provider) {
    case 'gemini':
      return !!getEnvVar('GEMINI_API_KEY');
    case 'openrouter':
      return !!getEnvVar('OPENROUTER_API_KEY');
    default:
      return false;
  }
} 