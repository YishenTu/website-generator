import React from 'react';

interface ThinkingBudgetToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export const ThinkingBudgetToggle: React.FC<ThinkingBudgetToggleProps> = ({
  enabled,
  onToggle,
  disabled = false
}) => {
  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center cursor-pointer select-none">
        <div className="relative">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            disabled={disabled}
            className="sr-only"
          />
          <div className={`
            block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out
            ${enabled 
              ? 'bg-sky-500' 
              : 'bg-slate-600'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}>
            <div className={`
              absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out
              ${enabled ? 'transform translate-x-4' : 'transform translate-x-0'}
            `} />
          </div>
        </div>
        <span className={`
          ml-2 text-sm font-medium
          ${enabled ? 'text-sky-400' : 'text-slate-400'}
          ${disabled ? 'opacity-50' : ''}
        `}>
          Max Thinking
        </span>
      </label>
    </div>
  );
}; 