import React from 'react';
import { ModelSelector } from './ModelSelector';
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

// Consider moving icons to a shared file if they grow
const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
  </svg>
);

const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M2 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5zm2 0a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5z" clipRule="evenodd" />
  </svg>
);

const ArrowPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M15.312 5.312a.75.75 0 0 1 0 1.061l-2.47 2.47L15.312 11.312a.75.75 0 1 1-1.061 1.061l-2.47-2.47-2.47 2.47a.75.75 0 1 1-1.061-1.061l2.47-2.47-2.47-2.47a.75.75 0 1 1 1.061-1.061l2.47 2.47 2.47-2.47a.75.75 0 0 1 1.061 0Zm-3.903 6.034a.75.75 0 0 1-1.061-1.06L8.25 12.382V7.5a.75.75 0 0 1 1.5 0v4.132l1.597-1.597a.75.75 0 0 1 1.06 1.06Z" clipRule="evenodd" />
    <path d="M10 3.5A6.5 6.5 0 0 1 10 16.5a.75.75 0 0 1 0-1.5A5 5 0 1 0 5.375 7.3a.75.75 0 0 1-1.442-.436A6.5 6.5 0 0 1 10 3.5Z" />
  </svg>
);

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
