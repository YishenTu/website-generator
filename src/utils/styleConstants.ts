/**
 * 通用样式常量
 * 统一管理项目中重复使用的Tailwind CSS类名
 */

// 布局相关
export const LAYOUT_STYLES = {
  fullHeight: 'h-full',
  flexCol: 'flex flex-col',
  flexRow: 'flex',
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexGrow: 'flex-grow',
  flexShrink0: 'flex-shrink-0',
  overflowHidden: 'overflow-hidden',
  relative: 'relative',
  absolute: 'absolute',
  inset0: 'inset-0',
  minH0: 'min-h-0',
} as const;

// 容器样式
export const CONTAINER_STYLES = {
  card: 'bg-slate-800 rounded-lg shadow-lg',
  cardPadding: 'p-4',
  modalOverlay: 'fixed inset-0 z-50 bg-slate-900 flex flex-col',
  section: 'flex flex-col h-full overflow-hidden',
  mainContainer: 'w-full max-w-5xl mx-auto',
  absolute: 'absolute',
  inset0: 'inset-0',
  flexCenter: 'flex items-center justify-center',
} as const;

// 按钮样式
export const BUTTON_STYLES = {
  base: 'font-semibold py-1.5 px-4 rounded-md flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800',
  primary: 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500',
  success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
  danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500',
  purple: 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500',
  blue: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
  disabled: 'disabled:bg-slate-600',
  iconButton: 'py-2.5 px-3',
  smallButton: 'text-sm',
} as const;

// 文本样式
export const TEXT_STYLES = {
  heading: 'font-semibold text-sky-400',
  headingXl: 'text-xl font-semibold text-sky-400',
  headingLg: 'text-lg font-semibold text-sky-400',
  headingMd: 'text-base font-semibold text-sky-400',
  paragraph: 'text-sm text-slate-300',
  muted: 'text-sm text-slate-400',
  mutedXs: 'text-xs text-slate-400',
  error: 'text-sm text-red-300',
} as const;

// 输入框样式
export const INPUT_STYLES = {
  base: 'bg-slate-700 text-slate-200 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500',
  textarea: 'w-full p-3 resize-none text-sm leading-relaxed custom-scrollbar disabled:opacity-70 disabled:cursor-not-allowed',
  input: 'p-2.5 text-sm',
} as const;

// 间距样式
export const SPACING_STYLES = {
  mb2: 'mb-2',
  mb3: 'mb-3',
  mb4: 'mb-4',
  mt2: 'mt-2',
  mt3: 'mt-3',
  mt4: 'mt-4',
  gap2: 'gap-2',
  gap3: 'gap-3',
  gap4: 'gap-4',
  spaceY2: 'space-y-2',
  spaceY3: 'space-y-3',
  spaceX2: 'space-x-2',
  spaceX3: 'space-x-3',
} as const;

// 图标尺寸
export const ICON_SIZES = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
  xxl: 'w-12 h-12',
  huge: 'w-16 h-16',
} as const;

// 动画样式
export const ANIMATION_STYLES = {
  transition: 'transition-all duration-300 ease-in-out',
  transitionColors: 'transition-colors duration-150',
  animatePulse: 'animate-pulse',
  animateSpin: 'animate-spin',
  hover: 'hover:shadow-lg hover:scale-105',
} as const;

// 辅助函数：组合样式类
export const combineStyles = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
}; 