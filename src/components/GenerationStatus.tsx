import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface GenerationStatusProps {
  isGenerating: boolean;
  modelName?: string;
  className?: string;
}

export const GenerationStatus: React.FC<GenerationStatusProps> = ({
  isGenerating,
  modelName,
  className = ""
}) => {
  if (!modelName) return null;

  return (
    <div className={`bg-slate-800/90 text-sky-400 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm ${className}`}>
      <div className="flex items-center space-x-2 text-sm font-medium">
        {isGenerating ? (
          <>
            <LoadingSpinner size="sm" />
            <span>Generating with {modelName}</span>
          </>
        ) : (
          <span>Generated with {modelName}</span>
        )}
      </div>
    </div>
  );
};