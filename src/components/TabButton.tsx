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
      className={`px-4 py-2.5 text-sm font-medium transition-all duration-300 focus:outline-none rounded-lg
        ${
          isActive
            ? 'glass-card border border-sky-400/50 text-sky-400 shadow-lg shadow-sky-500/20'
            : 'text-white/70 hover:text-white hover:bg-slate-800/30 hover:backdrop-blur-md border border-transparent hover:border-white/15'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:border-transparent hover:text-white/70' : ''}
      `}
      aria-disabled={disabled}
    >
      {label}
    </button>
  );
});

// 新增操作按钮组件，样式与TabButton一致但不显示激活状态
interface TabActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean; // 新增，用于显示激活状态
  className?: string;
}

export const TabActionButton: React.FC<TabActionButtonProps> = React.memo(({ 
  children, 
  onClick, 
  disabled = false,
  isActive = false, // 新增
  className = '' 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 text-sm font-medium transition-all duration-300 focus:outline-none flex items-center rounded-lg
        ${
          isActive
            ? 'glass-card border border-sky-400/50 text-sky-400 shadow-lg shadow-sky-500/20'
            : 'text-white/70 hover:text-white hover:bg-slate-800/30 hover:backdrop-blur-md border border-transparent hover:border-white/15'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:border-transparent hover:text-white/70' : ''}
        ${className}
      `}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
});
