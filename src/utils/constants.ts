/**
 * 应用程序常量
 * 统一管理项目中的常量值
 */

// 延迟时间常量（毫秒）
export const DELAYS = {
  DEBOUNCE_INPUT: 300,
  IFRAME_LOAD: 100,
  SCROLL_SMOOTH: 300,
  ANIMATION: 150,
  TRANSITION: 300,
} as const;

// 尺寸常量
export const SIZES = {
  MAX_CHAT_WIDTH: '85%',
  MIN_IFRAME_HEIGHT: '400px',
  ICON_DEFAULT: 'w-5 h-5',
  SPINNER_SM: 'w-5 h-5',
  SPINNER_MD: 'w-10 h-10',
  SPINNER_LG: 'w-12 h-12',
} as const;

// HTTP相关常量
export const HTTP = {
  TIMEOUT: 30000, // 30秒
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
} as const;

// 文件相关常量
export const FILE = {
  DEFAULT_HTML_NAME: 'generated-website.html',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

// UI文本常量
export const UI_TEXT = {
  APP_TITLE: 'AI Website Generator',
  APP_SUBTITLE: 'Turn text into websites: Plan, Generate, Refine.',
  LOADING_PLAN: 'Generating your website plan...',
  LOADING_HTML: 'Generating your website...',
  LOADING_PREVIEW: 'Loading preview...',
  ERROR_TITLE: 'Operation Failed',
  CHAT_PLACEHOLDER: 'Describe your changes...',
  CHAT_THINKING: 'AI is thinking...',
  COPY_SUCCESS: 'HTML code copied to clipboard!',
  COPY_FAILED: 'Failed to copy code. Check console for details.',
} as const;

// 错误消息常量
export const ERROR_MESSAGES = {
  EMPTY_REPORT: 'Report text cannot be empty.',
  EMPTY_PLAN: 'Report text or plan is missing.',
  NO_CHAT_SESSION: 'No active chat session. Please generate a website first.',
  NO_PLAN_CHAT_SESSION: 'No active plan chat session. Please generate a plan first.',
  API_KEY_MISSING: 'API key is not configured. Please ensure the API key is set in environment variables.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
  ABORTED: 'Operation was stopped by the user.',
} as const;

// 环境变量名称
export const ENV_VARS = {
  GEMINI_API_KEY: 'GEMINI_API_KEY',
  OPENROUTER_API_KEY: 'OPENROUTER_API_KEY',
  OPENAI_API_KEY: 'OPENAI_API_KEY',
} as const;

// 动画延迟值
export const ANIMATION_DELAYS = {
  PULSE_1: '0s',
  PULSE_2: '0.2s',
  PULSE_3: '0.4s',
} as const; 