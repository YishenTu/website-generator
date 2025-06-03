import React, { Component, ReactNode } from 'react';
import { logger } from '../utils/logger';
import { CONTAINER_STYLES, TEXT_STYLES, BUTTON_STYLES, combineStyles } from '../utils/styleConstants';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: React.ErrorInfo | null) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // 记录错误日志
    logger.error('React Error Boundary caught an error:', error, errorInfo);
    // 更新状态以保存错误信息
    this.setState({ errorInfo });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // 刷新页面以确保完全重置
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // 如果提供了自定义的fallback渲染函数，使用它
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }

      // 默认的错误UI
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6 flex items-center justify-center">
          <div className={combineStyles(CONTAINER_STYLES.card, 'p-8 max-w-2xl w-full')}>
            <div className="text-center">
              {/* 错误图标 */}
              <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg 
                  className="w-10 h-10 text-red-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>

              {/* 错误标题 */}
              <h1 className="text-2xl font-bold text-red-400 mb-3">
                出错了
              </h1>

              {/* 错误描述 */}
              <p className={combineStyles(TEXT_STYLES.paragraph, 'mb-6')}>
                应用程序遇到了意外错误。请尝试刷新页面或联系技术支持。
              </p>
              {/* 错误详情（仅在开发环境显示） */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300">
                    查看错误详情
                  </summary>
                  <div className="mt-3 p-4 bg-slate-800 rounded-md overflow-auto">
                    <p className="text-sm text-red-300 font-mono mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.error.stack && (
                      <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className={combineStyles(
                    BUTTON_STYLES.base,
                    BUTTON_STYLES.primary,
                    BUTTON_STYLES.smallButton
                  )}
                >
                  刷新页面
                </button>
                <button
                  onClick={() => window.history.back()}
                  className={combineStyles(
                    BUTTON_STYLES.base,
                    'bg-slate-600 hover:bg-slate-700 text-white focus:ring-slate-500',
                    BUTTON_STYLES.smallButton
                  )}
                >
                  返回上一页
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 