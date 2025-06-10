import React, { useState, useCallback } from 'react';
import { ModelSelector } from './ModelSelector';
import { ThinkingBudgetToggle } from './ThinkingBudgetToggle';
import { SparklesIcon, StopIcon, ArrowPathIcon } from './icons';
import { supportsThinking } from '../services/aiService';
import { validateReportText, formatCharacterCount, isApproachingLimit, VALIDATION_LIMITS } from '../utils/inputValidation';
import type { AppStage } from '../App'; // Import AppStage type

interface ReportInputFormProps {
  reportText: string;
  onReportChange: (text: string) => void;
  onGeneratePlan: () => void;
  onStartNewSession: () => void;
  onRevisePlan: () => void;
  onStop: () => void;
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
  onStartNewSession,
  onRevisePlan,
  onStop,
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

  let buttonText = "Generate Plan";
  let ButtonIcon = SparklesIcon;
  let buttonAction = onGeneratePlan;
  let buttonAriaLabel = "Generate website plan";

  if (isLoading) {
    buttonText = appStage === 'planPending' ? "Stop Plan Generation" : "Stop Website Generation";
    ButtonIcon = StopIcon;
    buttonAction = onStop;
    buttonAriaLabel = appStage === 'planPending' ? "Stop plan generation" : "Stop website generation";
  } else {
    switch (appStage) {
      case 'initial':
        buttonText = "Generate Plan";
        ButtonIcon = SparklesIcon;
        buttonAction = onGeneratePlan;
        buttonAriaLabel = "Generate website plan from report";
        break;
      case 'planReady':
        buttonText = "Revise Report & Plan";
        ButtonIcon = ArrowPathIcon; 
        buttonAction = onRevisePlan;
        buttonAriaLabel = "Revise report and start new plan generation";
        break;
      case 'htmlReady':
        buttonText = "Start New Session";
        ButtonIcon = ArrowPathIcon;
        buttonAction = onStartNewSession;
        buttonAriaLabel = "Start a new session, clearing current website";
        break;
    }
  }
  
  const isTextareaDisabled = isLoading || appStage === 'planPending' || appStage === 'htmlPending';
  const showThinkingToggle = supportsThinking(selectedModel) && onMaxThinkingChange;

  return (
    <div className="flex flex-col bg-slate-800 p-4 rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-semibold text-sky-400 mb-3 flex-shrink-0">Text Input</h2>
      <div className="flex-grow min-h-0 flex flex-col">
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
        
        {/* Character count and validation */}
        <div className="flex justify-between items-center mt-2 text-xs">
          <span 
            id="char-count"
            className={`${
              isApproachingLimit(reportText.length, VALIDATION_LIMITS.REPORT_TEXT_MAX)
                ? 'text-yellow-400'
                : reportText.length > VALIDATION_LIMITS.REPORT_TEXT_MAX
                  ? 'text-red-400'
                  : 'text-slate-400'
            }`}
          >
            {formatCharacterCount(reportText.length, VALIDATION_LIMITS.REPORT_TEXT_MAX)}
          </span>
          
          {validationError && (
            <span id="validation-error" className="text-red-400 text-right max-w-xs truncate">
              {validationError}
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 flex-shrink-0">
        {/* 单行布局：生成按钮 -> 思考预算开关 -> 模型选择器 */}
        <div className="flex items-center gap-3">
          {/* 生成按钮 */}
          <button
            onClick={buttonAction}
            className={`flex-1 font-semibold py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 text-sm
              ${isLoading 
                ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500' 
                : 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500 disabled:bg-slate-600'
              }
            `}
            disabled={!isLoading && appStage === 'initial' && isGenerationDisabled}
            aria-label={buttonAriaLabel}
          >
            <ButtonIcon className="w-5 h-5 mr-2" />
            {buttonText}
            {maxThinking && showThinkingToggle && (
              <span className="ml-2 text-xs bg-sky-700 px-2 py-1 rounded-full">
                Max
              </span>
            )}
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
