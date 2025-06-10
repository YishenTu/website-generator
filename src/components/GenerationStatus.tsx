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
    <div className={`text-sky-400 px-3 py-2 ${className}`}>
      <div className="flex items-center space-x-2 text-sm font-medium">
        {isGenerating ? (
          <>
            <LoadingSpinner className="w-4 h-4 text-sky-400" />
            <span>Generating with {modelName}</span>
          </>
        ) : (
          <span>Generated with {modelName}</span>
        )}
      </div>
    </div>
  );
};