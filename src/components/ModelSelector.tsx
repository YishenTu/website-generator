import React, { useState } from 'react';
import { ALL_MODELS, MODELS_BY_PROVIDER, getModelInfo } from '../services/aiService';
import { CpuChipIcon, ChevronDownIcon, ExpandIcon, CollapseIcon } from './icons';

// 简化后的接口：只支持字符串模型ID
interface ModelSelectorProps {
  selectedModel: string; // 具体的模型ID
  onModelChange: (modelId: string) => void; // 模型ID回调
  disabled?: boolean;
  size?: 'small' | 'normal';
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  disabled = false,
  size = 'normal'
}) => {
  const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({
    gemini: true,
    openrouter: true
  });

  const toggleProvider = (provider: string) => {
    setExpandedProviders(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  // 处理模型选择变化
  const handleModelChange = (modelId: string) => {
    if (disabled) return;
    onModelChange(modelId);
  };

  if (size === 'small') {
    return (
      <div className="relative inline-block">
        <select
          value={selectedModel}
          onChange={(e) => handleModelChange(e.target.value)}
          disabled={disabled}
          className="appearance-none bg-slate-700 text-slate-200 border border-slate-600 rounded-md py-1.5 px-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-center"
        >
          {Object.entries(MODELS_BY_PROVIDER).map(([provider, models]) => (
            <optgroup key={provider} label={provider.charAt(0).toUpperCase() + provider.slice(1)}>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-sky-400 mb-3 flex items-center">
        <CpuChipIcon className="w-5 h-5 mr-2" />
        AI Model Selection
      </h3>
      
      <div className="space-y-4">
        {Object.entries(MODELS_BY_PROVIDER).map(([provider, models]) => (
          <div key={provider} className="border border-slate-600 rounded-lg overflow-hidden">
            {/* Provider Header */}
            <button
              onClick={() => toggleProvider(provider)}
              className="w-full flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700/70 transition-colors"
              disabled={disabled}
            >
              <div className="flex items-center">
                <span className="text-sm font-medium text-slate-300 capitalize">
                  {provider === 'gemini' ? 'Google Gemini' : 'OpenRouter Models'}
                </span>
                <span className="ml-2 text-xs px-2 py-1 bg-slate-600 text-slate-400 rounded-full">
                  {models.length} models
                </span>
              </div>
              {expandedProviders[provider] ? 
                <CollapseIcon className="w-4 h-4 text-slate-400" /> :
                <ExpandIcon className="w-4 h-4 text-slate-400" />
              }
            </button>
            
            {/* Models List */}
            {expandedProviders[provider] && (
              <div className="p-2 space-y-2">
                {models.map((model) => (
                  <label
                    key={model.id}
                    className={`
                      flex items-start p-3 rounded-md border cursor-pointer transition-all duration-200
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
                      onChange={() => handleModelChange(model.id)}
                      disabled={disabled}
                      className="mt-1 h-4 w-4 text-sky-600 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-slate-200">
                          {model.name}
                        </h4>
                        {selectedModel === model.id && (
                          <span className="text-xs px-2 py-1 bg-sky-600 text-white rounded-full">
                            选中
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* 显示当前选中的模型信息 */}
      {selectedModel && (
        <div className="mt-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600">
          <div className="text-xs text-slate-400 mb-1">当前选中:</div>
          <div className="text-sm text-slate-200 font-medium">
            {ALL_MODELS.find(m => m.id === selectedModel)?.name || selectedModel}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            服务商: {getModelInfo(selectedModel)?.provider || 'unknown'}
          </div>
        </div>
      )}
    </div>
  );
}; 