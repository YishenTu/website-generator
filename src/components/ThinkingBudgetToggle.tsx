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
      className={`px-4 py-2.5 text-sm font-medium transition-all duration-300 focus:outline-none rounded-lg
        ${
          enabled
            ? 'glass-card border border-sky-400/50 text-sky-400 shadow-lg shadow-sky-500/20'
            : 'text-white bg-slate-800/30 backdrop-blur-md border border-white/15 hover:text-white hover:bg-slate-800/30 hover:backdrop-blur-md hover:border-white/15'
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