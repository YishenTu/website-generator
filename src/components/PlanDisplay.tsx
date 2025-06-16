import React, { useState, useEffect } from 'react';
import { ModelSelector } from './ModelSelector';
import { ThinkingBudgetToggle } from './ThinkingBudgetToggle';
import { getDefaultModel, supportsThinking } from '../services/aiService';
import { isProviderAvailable } from '../utils/envValidator';
import { CheckCircleIcon } from './icons';

interface PlanDisplayProps {
  planText: string;
  onProceedToHtml: (editedPlan: string, maxThinking?: boolean) => void;
  isAppLoading: boolean; // True if app is generally loading (e.g., plan streaming in)
  isLoadingHtml: boolean; // True if this component's action (generating HTML from plan) is loading
  isCompactView?: boolean;
  htmlModel?: string; // 模型ID字符串
  onHtmlModelChange?: (model: string) => void; // 模型ID回调
  onToggleRefine?: () => void;
  showRefineButton?: boolean;
  maxThinking?: boolean;
  setMaxThinking?: (enabled: boolean) => void;
}


export const PlanDisplay: React.FC<PlanDisplayProps> = React.memo(({
  planText,
  onProceedToHtml,
  isAppLoading,
  isLoadingHtml,
  isCompactView = false,
  htmlModel = getDefaultModel(isProviderAvailable('gemini') ? 'gemini' : 'openrouter'),
  onHtmlModelChange,
  onToggleRefine,
  showRefineButton,
  maxThinking,
  setMaxThinking,
}) => {
  const [editablePlanText, setEditablePlanText] = useState<string>(planText);
  const [hasManualEdit, setHasManualEdit] = useState<boolean>(false); // 跟踪用户是否手动编辑过
  const [lastKnownPlanText, setLastKnownPlanText] = useState<string>(planText); // 记录上次已知的planText

  useEffect(() => {
    // Update editablePlanText if planText prop changes,
    // but only if the app is not currently loading the plan (to avoid overwriting during stream)
    // or if it's a compact view (which is non-editable for streaming plan).
    // 重要：如果用户已经手动编辑过，不要覆盖用户的编辑
    if ((!isAppLoading || isCompactView) && !hasManualEdit) {
      setEditablePlanText(planText);
    }
    setLastKnownPlanText(planText);
  }, [planText, isAppLoading, isCompactView, hasManualEdit]);

  // 当planText显著改变时（比如重新生成plan），重置hasManualEdit标记
  useEffect(() => {
    // 如果planText为空（初始状态或重置），清除手动编辑标记
    if (!planText.trim()) {
      setHasManualEdit(false);
      setEditablePlanText('');
      setLastKnownPlanText('');
      return;
    }

    // 如果planText发生了显著变化（不只是小的增量更新），
    // 我们认为这是一个新的plan，应该重置手动编辑标记
    const significantChange = Math.abs(planText.length - lastKnownPlanText.length) > planText.length * 0.5;
    const completelyDifferent = planText !== lastKnownPlanText && 
                               !planText.includes(lastKnownPlanText.substring(0, Math.min(100, lastKnownPlanText.length)));
    
    if (significantChange || completelyDifferent) {
      setHasManualEdit(false);
      setEditablePlanText(planText);
    }
  }, [planText, lastKnownPlanText]);

  // If app is loading (streaming in plan) and not compact view, show the raw planText prop
  const displayPlan = (isAppLoading && !isCompactView) ? planText : editablePlanText;

  const handleProceed = () => {
    if (!isAppLoading && !isLoadingHtml) {
      onProceedToHtml(editablePlanText, maxThinking);
    }
  };

  // 处理用户手动编辑plan文本
  const handlePlanTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setEditablePlanText(newValue);
    // 标记用户已经手动编辑过
    if (newValue !== planText) {
      setHasManualEdit(true);
    } else {
      setHasManualEdit(false);
    }
  };

  // 重置到原始plan
  const handleResetToOriginal = () => {
    setEditablePlanText(planText);
    setHasManualEdit(false);
  };

  const containerPadding = isCompactView ? 'p-3' : 'p-4';
  const titleMargin = isCompactView ? 'mb-2' : 'mb-3';

  const isTextareaDisabled = isAppLoading || isLoadingHtml;
  const generateButtonDisabled = isAppLoading || isLoadingHtml || !editablePlanText.trim();

  return (
    <div className={`flex flex-col glass-card ${containerPadding} rounded-xl shadow-2xl shadow-black/40 h-full`}>
      {/* Action buttons row */}
      {(hasManualEdit || showRefineButton) && (
        <div className={`flex items-center justify-end ${titleMargin} flex-shrink-0`}>
          <div className="flex items-center gap-2">
          {hasManualEdit && !isAppLoading && !isLoadingHtml && (
            <button
              onClick={handleResetToOriginal}
              className="px-4 py-1.5 text-sm font-medium transition-all duration-300 focus:outline-none rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-slate-800/30 hover:backdrop-blur-md border border-transparent hover:border-white/15"
              aria-label="Reset to original plan"
              title="重置到原始plan"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              重置
            </button>
          )}
          {showRefineButton && onToggleRefine && !isAppLoading && (
            <button
              onClick={onToggleRefine}
              className="px-4 py-1.5 text-sm font-medium transition-all duration-300 focus:outline-none rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-slate-800/30 hover:backdrop-blur-md border border-transparent hover:border-white/15"
              aria-label="Toggle refine mode"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
              Refine
            </button>
          )}
          </div>
        </div>
      )}
      <div className="flex-grow min-h-0 relative">
        <textarea
          value={displayPlan}
          onChange={handlePlanTextChange}
          disabled={isTextareaDisabled} 
          className="w-full h-full p-3 glass-input text-slate-200 border border-white/20 rounded-lg resize-none text-sm leading-relaxed custom-scrollbar focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white/5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          aria-label="Website plan text"
          readOnly={isAppLoading && !isCompactView} // Readonly while plan is streaming in
        />
        
        {/* Edit status overlay */}
        {hasManualEdit && !isAppLoading && (
          <div className="absolute bottom-2 right-2 pointer-events-none">
            <span className="text-xs px-2 py-1 rounded-md glass-effect backdrop-blur-lg text-amber-300 border border-amber-400/30">
              已编辑
            </span>
          </div>
        )}
      </div>
      <div className={`mt-4 flex ${isCompactView ? 'flex-col space-y-2' : 'flex-col space-y-3'} flex-shrink-0`}>
        <div className={`flex items-center gap-3`}>
          <button
            onClick={handleProceed}
            disabled={generateButtonDisabled}
            className={`flex-1 px-4 py-1.5 text-sm font-medium transition-all duration-300 focus:outline-none rounded-lg flex items-center justify-center ${
              !generateButtonDisabled
                ? 'glass-card border border-sky-400/50 text-sky-400 shadow-lg shadow-sky-500/20'
                : 'text-white/70 bg-slate-800/30 backdrop-blur-md border border-transparent'
            } ${generateButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-white hover:bg-slate-800/30 hover:backdrop-blur-md hover:border-white/15'}`}
            aria-label="Generate website from this plan"
          >
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            Generate Website from Plan
          </button>
          
          {supportsThinking(htmlModel) && setMaxThinking && (
            <ThinkingBudgetToggle
              enabled={maxThinking || false}
              onToggle={setMaxThinking}
              disabled={isAppLoading || isLoadingHtml}
            />
          )}
          
          {onHtmlModelChange && (
            <div className="flex items-center gap-2">
              <ModelSelector
                selectedModel={htmlModel}
                onModelChange={onHtmlModelChange}
                disabled={isAppLoading || isLoadingHtml}
                size="small"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
