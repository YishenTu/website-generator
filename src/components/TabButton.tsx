import React from 'react';
import { useDebouncedCallback } from '../hooks/useStateDebouncer';
import { useThrottledHover } from '../hooks/useThrottledHover';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean; // New prop
}

export const TabButton: React.FC<TabButtonProps> = React.memo(({ label, isActive, onClick, disabled }) => {
  // Debounce tab switching to prevent rapid clicking issues
  const { callback: debouncedOnClick } = useDebouncedCallback(
    onClick,
    200, // 200ms debounce to prevent accidental rapid tab switching
    { leading: true, trailing: false }
  );
  
  // Throttled hover state for smooth visual feedback without performance impact
  const { isHovered, handleMouseEnter, handleMouseLeave } = useThrottledHover(50);

  return (
    <button
      onClick={disabled ? undefined : debouncedOnClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      className={`px-4 py-1.5 text-sm font-medium transition-colors duration-200 focus:outline-none rounded-lg will-change-on-hover
        ${
          isActive
            ? 'glass-card border border-sky-400/50 text-sky-400 hover:border-sky-400/70'
          : isHovered && !disabled
            ? 'text-white bg-slate-800/30 border border-white/15'
            : 'text-white/70 hover:text-white hover:bg-slate-800/30 border border-transparent hover:border-white/15'
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
  // Debounce action button clicks to prevent rapid clicking
  const { callback: debouncedOnClick } = useDebouncedCallback(
    onClick,
    200, // 200ms debounce for action buttons
    { leading: true, trailing: false }
  );

  // Throttled hover state for smooth visual feedback
  const { isHovered, handleMouseEnter, handleMouseLeave } = useThrottledHover(50);

  return (
    <button
      onClick={disabled ? undefined : debouncedOnClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      className={`px-4 py-1.5 text-sm font-medium transition-colors duration-200 focus:outline-none flex items-center rounded-lg will-change-on-hover
        ${
          isActive
            ? 'glass-card border border-sky-400/50 text-sky-400 hover:border-sky-400/70'
            : isHovered && !disabled
            ? 'text-white bg-slate-800/30 border border-white/15'
            : 'text-white/70 hover:text-white hover:bg-slate-800/30 border border-transparent hover:border-white/15'
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
