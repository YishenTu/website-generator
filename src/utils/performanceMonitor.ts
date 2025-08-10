/**
 * Performance Monitor
 * Lightweight utilities to measure rendering performance, FPS, and GPU memory usage
 * 
 * @example Basic usage:
 * ```typescript
 * import { performanceMonitor } from './utils/performanceMonitor';
 * 
 * // Start monitoring
 * performanceMonitor.startMonitoring();
 * 
 * // Get current metrics
 * const fps = performanceMonitor.getCurrentFPS();
 * const avgRenderTime = performanceMonitor.getAverageRenderTime();
 * 
 * // Log all metrics to console
 * performanceMonitor.logMetrics();
 * 
 * // Stop monitoring
 * performanceMonitor.stopMonitoring();
 * ```
 * 
 * @example Manual render timing:
 * ```typescript
 * performanceMonitor.markRenderStart();
 * // ... perform rendering operations
 * performanceMonitor.markRenderEnd();
 * ```
 * 
 * @example Keyboard shortcuts (when integrated in App.tsx):
 * - Ctrl+Shift+M: Toggle performance monitoring on/off
 * - Ctrl+Shift+P: Log current performance metrics to console
 */

import { createLogger } from './logger';

const logger = createLogger('PerformanceMonitor');

// Performance metrics interface
interface PerformanceMetrics {
  fps: number;
  averageFps: number;
  renderTime: number;
  averageRenderTime: number;
  gpuMemoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
  timestamp: number;
}

// FPS calculation state
interface FpsState {
  frameCount: number;
  lastTime: number;
  currentFps: number;
  fpsHistory: number[];
  maxHistorySize: number;
}

// Render time tracking state
interface RenderTimeState {
  renderTimes: number[];
  maxHistorySize: number;
  lastRenderStart: number;
}

class PerformanceMonitor {
  private isMonitoring = false;
  private animationFrameId: number | null = null;
  
  // FPS tracking
  private fpsState: FpsState = {
    frameCount: 0,
    lastTime: 0,
    currentFps: 0,
    fpsHistory: [],
    maxHistorySize: 60, // Keep 60 samples for averaging
  };

  // Render time tracking
  private renderTimeState: RenderTimeState = {
    renderTimes: [],
    maxHistorySize: 60,
    lastRenderStart: 0,
  };

  // Performance observer for measuring render times
  private performanceObserver: PerformanceObserver | null = null;

  /**
   * Start monitoring performance metrics
   */
  public startMonitoring(): void {
    if (this.isMonitoring) {
      logger.warn('Performance monitoring is already active');
      return;
    }

    this.isMonitoring = true;
    this.resetMetrics();
    
    logger.info('Starting performance monitoring');

    // Start FPS monitoring
    this.startFpsMonitoring();
    
    // Start render time monitoring if PerformanceObserver is available
    this.startRenderTimeMonitoring();

    // Log initial GPU memory if available
    this.logGpuMemoryUsage();
  }

  /**
   * Stop monitoring performance metrics
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      logger.warn('Performance monitoring is not active');
      return;
    }

    this.isMonitoring = false;
    
    // Stop FPS monitoring
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Stop render time monitoring
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }

    logger.info('Stopped performance monitoring');
  }

  /**
   * Get current FPS
   */
  public getCurrentFPS(): number {
    return this.fpsState.currentFps;
  }

  /**
   * Get average render time in milliseconds
   */
  public getAverageRenderTime(): number {
    const { renderTimes } = this.renderTimeState;
    if (renderTimes.length === 0) return 0;
    
    const sum = renderTimes.reduce((acc, time) => acc + time, 0);
    return sum / renderTimes.length;
  }

  /**
   * Get comprehensive performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    const averageFps = this.getAverageFPS();
    const averageRenderTime = this.getAverageRenderTime();
    const gpuMemoryUsage = this.getGpuMemoryUsage();

    return {
      fps: this.fpsState.currentFps,
      averageFps,
      renderTime: this.renderTimeState.renderTimes[this.renderTimeState.renderTimes.length - 1] || 0,
      averageRenderTime,
      gpuMemoryUsage,
      timestamp: Date.now(),
    };
  }

  /**
   * Log current performance metrics to console
   */
  public logMetrics(): void {
    const metrics = this.getMetrics();
    
    logger.info('📊 Performance Metrics:', {
      'FPS (current)': `${metrics.fps.toFixed(1)}`,
      'FPS (average)': `${metrics.averageFps.toFixed(1)}`,
      'Render Time (current)': `${metrics.renderTime.toFixed(2)}ms`,
      'Render Time (average)': `${metrics.averageRenderTime.toFixed(2)}ms`,
      'GPU Memory': metrics.gpuMemoryUsage 
        ? `${metrics.gpuMemoryUsage.used.toFixed(1)}MB / ${metrics.gpuMemoryUsage.total.toFixed(1)}MB (${metrics.gpuMemoryUsage.percentage.toFixed(1)}%)`
        : 'Not available',
    });
  }

  /**
   * Export metrics as JSON string for external use
   */
  public exportMetrics(): string {
    const metrics = this.getMetrics();
    return JSON.stringify(metrics, null, 2);
  }

  /**
   * Mark the start of a render operation (for manual timing)
   */
  public markRenderStart(): void {
    this.renderTimeState.lastRenderStart = performance.now();
  }

  /**
   * Mark the end of a render operation and record the time
   */
  public markRenderEnd(): void {
    if (this.renderTimeState.lastRenderStart === 0) {
      logger.warn('markRenderEnd called without markRenderStart');
      return;
    }

    const renderTime = performance.now() - this.renderTimeState.lastRenderStart;
    this.addRenderTime(renderTime);
    this.renderTimeState.lastRenderStart = 0;
  }

  // Private methods

  private resetMetrics(): void {
    this.fpsState = {
      frameCount: 0,
      lastTime: performance.now(),
      currentFps: 0,
      fpsHistory: [],
      maxHistorySize: 60,
    };

    this.renderTimeState = {
      renderTimes: [],
      maxHistorySize: 60,
      lastRenderStart: 0,
    };
  }

  private startFpsMonitoring(): void {
    const updateFps = () => {
      if (!this.isMonitoring) return;

      this.fpsState.frameCount++;
      const currentTime = performance.now();
      
      // Calculate FPS every second
      if (currentTime - this.fpsState.lastTime >= 1000) {
        this.fpsState.currentFps = this.fpsState.frameCount * 1000 / (currentTime - this.fpsState.lastTime);
        
        // Add to history for averaging
        this.fpsState.fpsHistory.push(this.fpsState.currentFps);
        if (this.fpsState.fpsHistory.length > this.fpsState.maxHistorySize) {
          this.fpsState.fpsHistory.shift();
        }

        this.fpsState.frameCount = 0;
        this.fpsState.lastTime = currentTime;
      }

      this.animationFrameId = requestAnimationFrame(updateFps);
    };

    updateFps();
  }

  private startRenderTimeMonitoring(): void {
    if (!window.PerformanceObserver) {
      logger.warn('PerformanceObserver not supported - render time monitoring disabled');
      return;
    }

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          // Monitor paint and layout operations
          if (entry.entryType === 'paint' || entry.entryType === 'measure') {
            this.addRenderTime(entry.duration);
          }
        });
      });

      // Observe paint and measure events
      this.performanceObserver.observe({ entryTypes: ['paint', 'measure'] });
    } catch (error) {
      logger.error('Failed to start render time monitoring:', error);
    }
  }

  private addRenderTime(time: number): void {
    this.renderTimeState.renderTimes.push(time);
    if (this.renderTimeState.renderTimes.length > this.renderTimeState.maxHistorySize) {
      this.renderTimeState.renderTimes.shift();
    }
  }

  private getAverageFPS(): number {
    const { fpsHistory } = this.fpsState;
    if (fpsHistory.length === 0) return 0;
    
    const sum = fpsHistory.reduce((acc, fps) => acc + fps, 0);
    return sum / fpsHistory.length;
  }

  private getGpuMemoryUsage(): PerformanceMetrics['gpuMemoryUsage'] {
    try {
      // Try to access WebGL context for GPU memory information
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      
      if (!gl) {
        return undefined;
      }

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) {
        return undefined;
      }

      // Try to get memory info extension (Chrome/Firefox specific)
      const memoryInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      
      // Note: Actual GPU memory usage is not directly accessible via web APIs
      // This is a placeholder implementation that would need to be enhanced
      // with browser-specific APIs or estimated based on texture/buffer usage
      
      return {
        used: 0, // Would need WebGL resource tracking
        total: 0, // Not available via standard APIs
        percentage: 0,
      };
    } catch (error) {
      // GPU memory information is not available in most browsers for security reasons
      return undefined;
    }
  }

  private logGpuMemoryUsage(): void {
    const gpuMemory = this.getGpuMemoryUsage();
    if (gpuMemory) {
      logger.info('GPU Memory Usage:', gpuMemory);
    } else {
      logger.debug('GPU memory information not available');
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export the class for custom instances
export { PerformanceMonitor, type PerformanceMetrics };

// Export utility functions for ease of use
export const startMonitoring = () => performanceMonitor.startMonitoring();
export const stopMonitoring = () => performanceMonitor.stopMonitoring();
export const logMetrics = () => performanceMonitor.logMetrics();
export const getCurrentFPS = () => performanceMonitor.getCurrentFPS();
export const getAverageRenderTime = () => performanceMonitor.getAverageRenderTime();