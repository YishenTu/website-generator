/**
 * 环境变量访问辅助函数
 * 解决浏览器环境中process.env的兼容性问题
 */

// 环境变量的实际值（由Vite在构建时替换）
const ENV_VALUES = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  NODE_ENV: process.env.NODE_ENV || 'production',
} as const;

/**
 * 获取环境变量值
 * @param key 环境变量键名
 * @returns 环境变量值
 */
export function getEnvVar(key: keyof typeof ENV_VALUES): string | undefined {
  return ENV_VALUES[key];
}

/**
 * 检查是否为开发环境
 * @returns 是否为开发环境
 */
export function isDevelopment(): boolean {
  return ENV_VALUES.NODE_ENV === 'development';
}

/**
 * 获取所有环境变量
 * @returns 环境变量对象
 */
export function getAllEnvVars(): typeof ENV_VALUES {
  return { ...ENV_VALUES };
} 