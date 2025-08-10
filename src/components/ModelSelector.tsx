import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ALL_MODELS, MODELS_BY_PROVIDER, getModelInfo } from '../services/aiService';
import { CpuChipIcon, ExpandIcon, CollapseIcon } from './icons';
import { useDebouncedCallback } from '../hooks/useStateDebouncer';

// 简化后的接口：只支持字符串模型ID
interface ModelSelectorProps {
  selectedModel: string; // 具体的模型ID
  onModelChange: (modelId: string) => void; // 模型ID回调
  disabled?: boolean;
  size?: 'small' | 'normal';
  expandDirection?: 'up' | 'down'; // 展开方向，默认向上
}

const ModelSelectorComponent: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  disabled = false,
  size = 'normal',
  expandDirection = 'up'
}) => {
  const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({
    gemini: true,
    openrouter: true
  });
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  
  // Debounce hover state changes for dropdown options to prevent rapid repaints
  const { callback: debouncedSetHoveredOption } = useDebouncedCallback(
    (modelId: string | null) => setHoveredOption(modelId),
    50, // 50ms debounce for smooth but not overwhelming updates
    { leading: true, trailing: true }
  );

  const toggleProvider = (provider: string) => {
    setExpandedProviders(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  // Debounced provider toggle to prevent rapid clicking issues
  const { callback: debouncedToggleProvider } = useDebouncedCallback(
    toggleProvider,
    200, // 200ms debounce to prevent accidental double-clicks
    { leading: true, trailing: false }
  );

  // 处理模型选择变化
  const handleModelChange = (modelId: string) => {
    if (disabled) return;
    onModelChange(modelId);
    if (size === 'small') {
      setIsOpen(false);
    }
  };

  // 计算下拉菜单位置
  const calculatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      let top, left;
      if (expandDirection === 'up') {
        top = rect.top + scrollTop - 280; // 减去菜单高度
      } else {
        top = rect.bottom + scrollTop + 4; // 向下展开
      }
      
      left = rect.left + scrollLeft;
      
      setPosition({
        top,
        left,
        width: Math.max(rect.width, 200)
      });
    }
  };

  // 监听窗口滚动和resize事件，更新位置
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && size === 'small') {
        calculatePosition();
      }
    };

    if (isOpen && size === 'small') {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, size]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen && size === 'small') {
      calculatePosition();
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, size, expandDirection]);

  if (size === 'small') {
    const selectedModelInfo = getModelInfo(selectedModel);
    
    const dropdownMenu = isOpen && !disabled && (
      <div 
        ref={dropdownRef}
        className="fixed min-w-[200px] max-h-60 overflow-y-auto bg-black border border-white/20 rounded-lg shadow-lg"
        style={{ 
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${position.width}px`,
          zIndex: 999999
        }}
      >
        {Object.entries(MODELS_BY_PROVIDER).map(([provider, models]) => (
          <div key={provider}>
            <div className="px-3 py-2 text-xs font-medium text-white/90 bg-slate-800 border-b border-white/20">
              {provider === 'gemini' ? 'Google Gemini' : provider === 'openrouter' ? 'OpenRouter' : provider === 'openai' ? 'ChatGPT' : provider.charAt(0).toUpperCase() + provider.slice(1)}
            </div>
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => handleModelChange(model.id)}
                onMouseEnter={() => debouncedSetHoveredOption(model.id)}
                onMouseLeave={() => debouncedSetHoveredOption(null)}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors duration-150 border-b border-white/5 last:border-b-0 will-change-on-hover ${
                  selectedModel === model.id 
                    ? 'bg-transparent text-sky-400 border-sky-400/50 border-l-2 border-r-2' 
                    : hoveredOption === model.id
                    ? 'bg-white/20 text-white/90' 
                    : 'text-white/80 hover:bg-white/20'
                }`}
              >
                <div className="truncate">{model.name}</div>
              </button>
            ))}
          </div>
        ))}
      </div>
    );
    
    return (
      <div className="relative inline-block">
        <button
          ref={buttonRef}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="appearance-none glass-input text-slate-200 border border-white/20 rounded-lg py-1.5 px-4 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-center transition-colors duration-150 min-w-[120px] flex items-center justify-between will-change-on-hover"
        >
          <span className="truncate">
            {selectedModelInfo?.name || selectedModel}
          </span>
          <ExpandIcon className={`w-3 h-3 ml-1 transition-transform duration-200 will-change-on-hover ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {dropdownMenu && createPortal(dropdownMenu, document.body)}
      </div>
    );
  }

  return (
    <div className="glass-card p-4 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-sky-400 mb-3 flex items-center">
        <CpuChipIcon className="w-5 h-5 mr-2" />
        AI Model Selection
      </h3>
      
      <div className="space-y-4">
        {Object.entries(MODELS_BY_PROVIDER).map(([provider, models]) => (
          <div key={provider} className="border border-white/20 rounded-lg overflow-hidden">
            {/* Provider Header */}
            <button
              onClick={() => debouncedToggleProvider(provider)}
              className="w-full flex items-center justify-between p-3 glass-effect hover:bg-white/10 transition-colors duration-150"
              disabled={disabled}
            >
              <div className="flex items-center">
                <span className="text-sm font-medium text-white/80 capitalize">
                  {provider === 'gemini' ? 'Google Gemini' : 'OpenRouter Models'}
                </span>
                <span className="ml-2 text-xs px-2 py-1 glass-effect text-white/70 rounded-full border border-white/20">
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
                      flex items-start p-3 rounded-lg border cursor-pointer transition-colors duration-150
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}
                      ${selectedModel === model.id 
                        ? 'border-sky-400/50 bg-sky-600/20 hover:border-sky-400/70' 
                        : 'border-white/20 glass-input'
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
                        <h4 className="text-sm font-medium text-white/90">
                          {model.name}
                        </h4>
                        {selectedModel === model.id && (
                          <span className="text-xs px-2 py-1 bg-sky-600/80 text-white rounded-full border border-sky-400/30">
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
        <div className="mt-4 p-3 glass-effect rounded-lg border border-white/20">
          <div className="text-xs text-white/70 mb-1">当前选中:</div>
          <div className="text-sm text-white/90 font-medium">
            {ALL_MODELS.find(m => m.id === selectedModel)?.name || selectedModel}
          </div>
          <div className="text-xs text-white/60 mt-1">
            服务商: {getModelInfo(selectedModel)?.provider || 'unknown'}
          </div>
        </div>
      )}
    </div>
  );
};

export const ModelSelector = React.memo(ModelSelectorComponent, (prevProps, nextProps) => {
  return (
    prevProps.selectedModel === nextProps.selectedModel &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.size === nextProps.size &&
    prevProps.expandDirection === nextProps.expandDirection &&
    prevProps.onModelChange === nextProps.onModelChange
  );
}); 
