import React from 'react';
import { combineStyles } from '../utils/styleConstants';

interface OptionButtonProps {
  selected: boolean;
  label: string;
  onClick: () => void;
  className?: string;
  'aria-pressed'?: boolean;
  title?: string;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  selected,
  label,
  onClick,
  className = '',
  'aria-pressed': ariaPressed,
  title
}) => {
  return (
    <button
      onClick={onClick}
      aria-pressed={ariaPressed ?? selected}
      title={title}
      className={combineStyles(
        'flex-1 px-3 py-3 rounded-lg text-sm font-semibold transition-colors transition-shadow duration-200',
        'border focus:outline-none focus:ring-2 focus:ring-cyan-400/50 will-change-on-hover',
        selected
          ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 hover:border-cyan-400/70'
          : 'bg-slate-800/50 border-slate-600/30 text-slate-400 hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-slate-300',
        className
      )}
    >
      <span className="font-rajdhani">{label}</span>
    </button>
  );
};
