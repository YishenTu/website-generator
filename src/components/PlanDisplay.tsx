
import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface PlanDisplayProps {
  planText: string;
  onProceedToHtml: (editedPlan: string) => void;
  onReviseReportAndPlan: () => void;
  isAppLoading: boolean; // True if app is generally loading (e.g., plan streaming in)
  isLoadingHtml: boolean; // True if this component's action (generating HTML from plan) is loading
  showGenerateButton?: boolean; 
  isCompactView?: boolean; 
}

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
  </svg>
);

const PencilSquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343Z" />
  </svg>
);


export const PlanDisplay: React.FC<PlanDisplayProps> = ({
  planText,
  onProceedToHtml,
  onReviseReportAndPlan,
  isAppLoading,
  isLoadingHtml,
  showGenerateButton = true, 
  isCompactView = false,     
}) => {
  const [editablePlanText, setEditablePlanText] = useState<string>(planText);

  useEffect(() => {
    // Update editablePlanText if planText prop changes,
    // but only if the app is not currently loading the plan (to avoid overwriting during stream)
    // or if it's a compact view (which is non-editable for streaming plan).
    if (!isAppLoading || isCompactView) {
      setEditablePlanText(planText);
    }
  }, [planText, isAppLoading, isCompactView]);

  // If app is loading (streaming in plan) and not compact view, show the raw planText prop
  const displayPlan = (isAppLoading && !isCompactView) ? planText : editablePlanText;

  const handleProceed = () => {
    if (!isAppLoading && !isLoadingHtml) {
      onProceedToHtml(editablePlanText);
    }
  };

  const containerPadding = isCompactView ? 'p-3' : 'p-4';
  const titleMargin = isCompactView ? 'mb-2' : 'mb-3';
  const titleSize = isCompactView ? 'text-lg' : 'text-xl';
  const buttonPy = isCompactView ? 'py-2' : 'py-2.5';

  const isTextareaDisabled = isAppLoading || isLoadingHtml || (isCompactView && !showGenerateButton);
  const generateButtonDisabled = isAppLoading || isLoadingHtml || !editablePlanText.trim();
  const reviseButtonDisabled = isAppLoading || isLoadingHtml;

  return (
    <div className={`flex flex-col bg-slate-800 ${containerPadding} rounded-lg shadow-lg h-full`}>
      <h2 className={`${titleSize} font-semibold text-sky-400 ${titleMargin} flex-shrink-0`}>
        {isCompactView ? 'Current Plan' : 
         isAppLoading ? 'Generating Website Plan (Editable)...' : 
         'Generated Website Plan (Editable)'}
      </h2>
      <textarea
        value={displayPlan}
        onChange={(e) => setEditablePlanText(e.target.value)}
        disabled={isTextareaDisabled} 
        className="w-full p-3 bg-slate-700 text-slate-200 border border-slate-600 rounded-md resize-none text-sm leading-relaxed custom-scrollbar focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-70 disabled:cursor-not-allowed flex-grow min-h-0"
        aria-label="Website plan text"
        readOnly={isAppLoading && !isCompactView} // Readonly while plan is streaming in
      />
      <div className={`mt-3 flex ${isCompactView ? 'flex-col space-y-2' : 'flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0'} flex-shrink-0`}>
        {showGenerateButton && (
            <button
            onClick={handleProceed}
            disabled={generateButtonDisabled}
            className={`flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-semibold ${buttonPy} px-4 rounded-md flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
            aria-label="Generate website from this plan"
            >
            {isLoadingHtml ? ( // Spinner only for this button's action
                <LoadingSpinner className="w-5 h-5 mr-2 text-white" />
            ) : (
                <CheckCircleIcon className="w-5 h-5 mr-2" />
            )}
            {isLoadingHtml ? 'Generating Website...' : 'Generate Website from Plan'}
            </button>
        )}
        <button
          onClick={onReviseReportAndPlan}
          disabled={reviseButtonDisabled} 
          className={`flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-600 text-white font-semibold ${buttonPy} px-4 rounded-md flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${isCompactView && !showGenerateButton ? '' : (showGenerateButton ? 'mt-2 sm:mt-0' : '')}`}
          aria-label="Revise report and re-generate plan"
        >
          <PencilSquareIcon className="w-5 h-5 mr-2" />
          Revise Report / Plan
        </button>
      </div>
    </div>
  );
};
