import React from 'react';
import { AIModel, ModelInfo } from '../types/types';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  disabled?: boolean;
  size?: 'small' | 'normal';
}

const models: ModelInfo[] = [
  {
    id: AIModel.Gemini,
    name: 'Gemini 2.5 Pro',
    description: 'Google\'s latest multimodal AI model',
    provider: 'Google'
  },
  {
    id: AIModel.Claude,
    name: 'Claude 4 Sonnet',
    description: 'Anthropic\'s most advanced reasoning model',
    provider: 'Anthropic'
  }
];

const CpuChipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-6-3.75h3.75m-3.75 0V21m0-12.75h3.75m-3.75 0V3m0 18V9m12-5.25v12m0 0V3m0 18h-1.5M21 3h-1.5m-7.5 15.75h3.75M10.5 21V3m3.75 0v3.75" />
  </svg>
);

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  disabled = false,
  size = 'normal'
}) => {
  const selectedModelInfo = models.find(m => m.id === selectedModel);
  
  if (size === 'small') {
    return (
      <div className="relative inline-block">
        <select
          value={selectedModel}
          onChange={(e) => !disabled && onModelChange(e.target.value as AIModel)}
          disabled={disabled}
          className="appearance-none bg-slate-700 text-slate-200 border border-slate-600 rounded-md py-1.5 px-3 pr-8 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-sky-400 mb-3 flex items-center">
        <CpuChipIcon className="w-5 h-5 mr-2" />
        AI Model Selection
      </h3>
      <div className="space-y-3">
        {models.map((model) => (
          <label
            key={model.id}
            className={`
              flex items-start p-3 rounded-md border-2 cursor-pointer transition-all duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700/50'}
              ${selectedModel === model.id 
                ? 'border-sky-500 bg-sky-900/20' 
                : 'border-slate-600 bg-slate-700/30'
              }
            `}
          >
            <input
              type="radio"
              name="aiModel"
              value={model.id}
              checked={selectedModel === model.id}
              onChange={() => !disabled && onModelChange(model.id)}
              disabled={disabled}
              className="mt-1 h-4 w-4 text-sky-600 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-200">
                  {model.name}
                </h4>
                <span className="text-xs px-2 py-1 bg-slate-600 text-slate-300 rounded-full">
                  {model.provider}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {model.description}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}; 