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
        px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 backdrop-blur-md border
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
        ${enabled 
          ? 'bg-sky-600/80 text-white hover:bg-sky-700/90 focus:ring-sky-500 border-sky-500/30 shadow-lg shadow-sky-500/20' 
          : 'glass-input text-white/70 hover:bg-white/10 focus:ring-white/30 border-white/20'
        }
        ${disabled 
          ? 'opacity-50 cursor-not-allowed hover:bg-white/5' 
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