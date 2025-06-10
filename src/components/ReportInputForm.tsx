import React, { useState, useCallback } from 'react';
import { ModelSelector } from './ModelSelector';
import { ThinkingBudgetToggle } from './ThinkingBudgetToggle';
import { SparklesIcon } from './icons';
import { supportsThinking } from '../services/aiService';
import { validateReportText, formatCharacterCount, isApproachingLimit, VALIDATION_LIMITS } from '../utils/inputValidation';
import type { AppStage } from '../App'; // Import AppStage type

interface ReportInputFormProps {
  reportText: string;
  onReportChange: (text: string) => void;
  onGeneratePlan: () => void;
  isLoading: boolean; // True if planPending or htmlPending
  appStage: AppStage;
  selectedModel: string; // 模型ID字符串
  onModelChange: (model: string) => void; // 模型ID回调
  maxThinking?: boolean; // 新增：是否启用最大思考预算
  onMaxThinkingChange?: (enabled: boolean) => void; // 新增：思考预算开关回调
}

export const ReportInputForm: React.FC<ReportInputFormProps> = ({
  reportText,
  onReportChange,
  onGeneratePlan,
  isLoading,
  appStage,
  selectedModel,
  onModelChange,
  maxThinking = false,
  onMaxThinkingChange,
}) => {
  // Validation state
  const [validationError, setValidationError] = useState<string>('');
  
  // Handle text change with validation
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const validation = validateReportText(text);
    
    if (validation.isValid) {
      setValidationError('');
      onReportChange(validation.sanitizedText || text);
    } else {
      setValidationError(validation.error || '');
      onReportChange(text); // Still update to show user input
    }
  }, [onReportChange]);

  // Check if button should be disabled
  const isGenerationDisabled = !reportText.trim() || 
    reportText.length < VALIDATION_LIMITS.REPORT_TEXT_MIN || 
    reportText.length > VALIDATION_LIMITS.REPORT_TEXT_MAX ||
    isLoading;
  
  const isTextareaDisabled = isLoading || appStage === 'planPending' || appStage === 'htmlPending';
  const showThinkingToggle = supportsThinking(selectedModel) && onMaxThinkingChange;

  return (
    <div className="flex flex-col bg-slate-800 p-4 rounded-lg shadow-lg h-full">
      <div className="flex-grow min-h-0 flex flex-col relative">
        <textarea
          value={reportText}
          onChange={handleTextChange}
          placeholder={`Paste your text here... (minimum ${VALIDATION_LIMITS.REPORT_TEXT_MIN} characters)`}
          className={`w-full p-3 bg-slate-700 text-slate-200 border rounded-md resize-none focus:ring-2 focus:border-sky-500 text-sm leading-relaxed flex-grow min-h-0 custom-scrollbar ${
            validationError 
              ? 'border-red-500 focus:ring-red-500' 
              : isApproachingLimit(reportText.length, VALIDATION_LIMITS.REPORT_TEXT_MAX)
                ? 'border-yellow-500 focus:ring-yellow-500'
                : 'border-slate-600 focus:ring-sky-500'
          }`}
          disabled={isTextareaDisabled}
          aria-label="Report text input"
          aria-disabled={isTextareaDisabled}
          aria-invalid={!!validationError}
          aria-describedby={validationError ? "validation-error" : "char-count"}
        />
        
        {/* Character count overlay - positioned in bottom right of textarea */}
        <div className="absolute bottom-2 right-2 pointer-events-none">
          <span 
            id="char-count"
            className={`text-xs px-2 py-1 rounded bg-slate-800/80 ${
              isApproachingLimit(reportText.length, VALIDATION_LIMITS.REPORT_TEXT_MAX)
                ? 'text-yellow-400'
                : reportText.length > VALIDATION_LIMITS.REPORT_TEXT_MAX
                  ? 'text-red-400'
                  : 'text-slate-400'
            }`}
          >
            {formatCharacterCount(reportText.length, VALIDATION_LIMITS.REPORT_TEXT_MAX)}
          </span>
        </div>
        
        {/* Validation error overlay - positioned in bottom left of textarea */}
        {validationError && (
          <div className="absolute bottom-2 left-2 pointer-events-none">
            <span id="validation-error" className="text-xs px-2 py-1 rounded bg-red-900/80 text-red-400 max-w-xs truncate">
              {validationError}
            </span>
          </div>
        )}
      </div>
      <div className="mt-4 flex-shrink-0">
        {/* 单行布局：生成按钮 -> 思考预算开关 -> 模型选择器 */}
        <div className="flex items-center gap-3">
          {/* 生成按钮 */}
          <button
            onClick={onGeneratePlan}
            className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 text-white font-semibold py-1.5 px-4 rounded-md flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 text-sm"
            disabled={isGenerationDisabled}
            aria-label="Generate website plan from report"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            Generate Plan
          </button>
          
          {/* 思考预算开关 */}
          {showThinkingToggle && (
            <ThinkingBudgetToggle
              enabled={maxThinking}
              onToggle={onMaxThinkingChange!}
              disabled={isLoading}
            />
          )}
          
          {/* 模型选择器 */}
          <div className="flex items-center">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={onModelChange}
              disabled={isLoading}
              size="small"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
