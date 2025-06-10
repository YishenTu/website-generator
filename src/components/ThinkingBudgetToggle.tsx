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
  const handleClick = () => {
    if (!disabled) {
      onToggle(!enabled);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800
        ${enabled 
          ? 'bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500' 
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600 focus:ring-slate-500'
        }
        ${disabled 
          ? 'opacity-50 cursor-not-allowed hover:bg-slate-700' 
          : 'cursor-pointer'
        }
      `}
      aria-pressed={enabled}
      title={enabled ? "Disable Max Thinking" : "Enable Max Thinking"}
    >
      Max Thinking
    </button>
  );
}; 