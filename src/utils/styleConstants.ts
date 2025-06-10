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

// 毛玻璃效果样式
export const GLASS_STYLES = {
  effect: 'glass-effect',
  card: 'glass-card',
  dark: 'glass-dark',
  input: 'glass-input',
  // 自定义毛玻璃变体
  panel: 'backdrop-blur-lg bg-slate-900/30 border border-white/10',
  cardHover: 'backdrop-blur-xl bg-slate-800/40 border border-white/12 hover:bg-slate-700/50 hover:border-white/15',
  navigation: 'backdrop-blur-md bg-slate-900/25 border-b border-white/10',
  modal: 'backdrop-blur-2xl bg-slate-900/50 border border-white/20',
} as const;

// 容器样式 (更新为毛玻璃效果)
export const CONTAINER_STYLES = {
  card: 'glass-card rounded-lg shadow-2xl shadow-black/50',
  cardPadding: 'p-4',
  modalOverlay: 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col',
  section: 'flex flex-col h-full overflow-hidden',
  mainContainer: 'w-full max-w-5xl mx-auto',
  absolute: 'absolute',
  inset0: 'inset-0',
  flexCenter: 'flex items-center justify-center',
  glassPanel: 'glass-effect rounded-xl shadow-2xl shadow-black/30',
  glassCard: 'backdrop-blur-xl bg-slate-800/40 border border-white/12 rounded-lg shadow-xl shadow-black/40',
} as const;

// 按钮样式 (更新为毛玻璃效果)
export const BUTTON_STYLES = {
  base: 'font-semibold py-1.5 px-4 rounded-md flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black backdrop-blur-sm',
  primary: 'bg-sky-600/80 hover:bg-sky-700/90 text-white focus:ring-sky-500 backdrop-blur-md border border-sky-500/30',
  success: 'bg-green-600/80 hover:bg-green-700/90 text-white focus:ring-green-500 backdrop-blur-md border border-green-500/30',
  danger: 'bg-red-600/80 hover:bg-red-700/90 text-white focus:ring-red-500 backdrop-blur-md border border-red-500/30',
  warning: 'bg-yellow-600/80 hover:bg-yellow-700/90 text-white focus:ring-yellow-500 backdrop-blur-md border border-yellow-500/30',
  purple: 'bg-purple-600/80 hover:bg-purple-700/90 text-white focus:ring-purple-500 backdrop-blur-md border border-purple-500/30',
  blue: 'bg-blue-600/80 hover:bg-blue-700/90 text-white focus:ring-blue-500 backdrop-blur-md border border-blue-500/30',
  disabled: 'disabled:bg-white/10 disabled:border-white/10 disabled:opacity-50',
  iconButton: 'py-2.5 px-3',
  smallButton: 'text-sm',
  glass: 'glass-effect hover:bg-white/10 border-white/20',
  glassActive: 'glass-card border-sky-400/50 text-sky-400',
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
  glassText: 'text-white/90',
  glassSubtext: 'text-white/70',
  glassMuted: 'text-white/50',
} as const;

// 输入框样式 (更新为毛玻璃效果)
export const INPUT_STYLES = {
  base: 'glass-input text-slate-200 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-150',
  textarea: 'w-full p-3 resize-none text-sm leading-relaxed custom-scrollbar disabled:opacity-70 disabled:cursor-not-allowed',
  input: 'p-2.5 text-sm',
  glassInput: 'glass-input focus:bg-white/8 focus:border-white/30',
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

// 动画样式 (增强毛玻璃效果的动画)
export const ANIMATION_STYLES = {
  transition: 'transition-all duration-300 ease-in-out',
  transitionColors: 'transition-colors duration-150',
  animatePulse: 'animate-pulse',
  animateSpin: 'animate-spin',
  hover: 'hover:shadow-2xl hover:shadow-black/60 hover:scale-105',
  glassHover: 'hover:backdrop-blur-xl hover:bg-white/10 transition-all duration-300',
  slideUp: 'transform transition-transform duration-300 ease-out',
} as const;

// 辅助函数：组合样式类
export const combineStyles = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
}; 