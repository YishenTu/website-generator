import React from 'react';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean; // New prop
}

export const TabButton: React.FC<TabButtonProps> = React.memo(({ label, isActive, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 text-sm font-medium transition-colors duration-150 focus:outline-none
        ${
          isActive
            ? 'border-b-2 border-sky-500 text-sky-400'
            : 'text-slate-400 hover:text-slate-200 hover:border-b-2 hover:border-slate-600'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed hover:border-transparent' : ''}
      `}
      aria-disabled={disabled}
    >
      {label}
    </button>
  );
});
