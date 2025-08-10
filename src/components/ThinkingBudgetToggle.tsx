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
      className={`px-4 py-1.5 text-sm font-medium transition-colors duration-200 focus:outline-none rounded-lg
        ${
          enabled
            ? 'glass-card border border-sky-400/50 text-sky-400 hover:border-sky-400/70'
            : 'text-white bg-slate-800/30 border border-white/15 hover:text-white hover:bg-slate-800/30 hover:border-white/15'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:border-transparent hover:text-white/70' : ''}
      `}
      aria-pressed={enabled}
      title={enabled ? "Disable Max Thinking" : "Enable Max Thinking"}
    >
      Max Thinking
    </button>
  );
}; 
