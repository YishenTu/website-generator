import React from 'react';
import { ModelSelector } from './ModelSelector';
import { SparklesIcon, StopIcon, ArrowPathIcon } from './icons';
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
}) => {
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

  return (
    <div className="flex flex-col bg-slate-800 p-4 rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-semibold text-sky-400 mb-3 flex-shrink-0">Text Input</h2>
      <textarea
        value={reportText}
        onChange={(e) => onReportChange(e.target.value)}
        placeholder="Paste your text here..."
        className="w-full p-3 bg-slate-700 text-slate-200 border border-slate-600 rounded-md resize-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm leading-relaxed flex-grow min-h-0 custom-scrollbar"
        disabled={isTextareaDisabled}
        aria-label="Report text input"
        aria-disabled={isTextareaDisabled}
      />
      <div className="mt-4 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={buttonAction}
          className={`flex-1 font-semibold py-1.5 px-4 rounded-md flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 text-sm
            ${isLoading 
              ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500' 
              : 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500 disabled:bg-slate-600'
            }
          `}
          disabled={!isLoading && appStage === 'initial' && !reportText.trim()}
          aria-label={buttonAriaLabel}
        >
          <ButtonIcon className="w-5 h-5 mr-2" />
          {buttonText}
        </button>
        <div className="flex items-center gap-2">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            disabled={isLoading}
            size="small"
          />
        </div>
      </div>
    </div>
  );
};
