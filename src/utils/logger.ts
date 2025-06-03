/**
 * 日志工具
 * 在生产环境中自动禁用调试日志
 */

// 检查是否为开发环境
const isDevelopment = import.meta.env.DEV;

// 日志级别
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// 日志配置
interface LogConfig {
  enableInProduction: boolean;
  prefix?: string;
}

// 默认配置
const defaultConfig: LogConfig = {
  enableInProduction: false,
  prefix: '[AI Website Generator]',
};

class Logger {
  private config: LogConfig;

  constructor(config: Partial<LogConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private shouldLog(level: LogLevel): boolean {
    if (isDevelopment) return true;
    if (this.config.enableInProduction) return true;
    // 在生产环境中，只允许警告和错误
    return level === LogLevel.WARN || level === LogLevel.ERROR;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const prefix = this.config.prefix || '';
    return `${prefix} [${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage(LogLevel.DEBUG, message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message), ...args);
    }
  }

  error(message: string, error?: unknown, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, message), error, ...args);
    }
  }

  // 用于性能测量
  time(label: string): void {
    if (isDevelopment) {
      console.time(`${this.config.prefix} ${label}`);
    }
  }

  timeEnd(label: string): void {
    if (isDevelopment) {
      console.timeEnd(`${this.config.prefix} ${label}`);
    }
  }

  // 条件日志
  assert(condition: boolean, message: string, ...args: unknown[]): void {
    if (!condition && this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, `Assertion failed: ${message}`), ...args);
    }
  }
}

// 导出默认logger实例
export const logger = new Logger();

// 导出特定模块的logger工厂函数
export function createLogger(moduleName: string): Logger {
  return new Logger({
    prefix: `[${moduleName}]`,
  });
} 