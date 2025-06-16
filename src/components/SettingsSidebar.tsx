import React from 'react';
import { useAppTheme, useAppLanguage, useAppActions, type Theme, type Language } from '../contexts/AppContext';
import { combineStyles } from '../utils/styleConstants';

export const SettingsSidebar: React.FC = () => {
  const theme = useAppTheme();
  const language = useAppLanguage();
  const { setTheme, setLanguage } = useAppActions();

  return (
    <aside className="w-80 flex-shrink-0 transition-all duration-300">
      <div className="glass-effect bg-slate-900/80 border border-cyan-500/30 rounded-lg p-6 shadow-2xl shadow-cyan-900/50 backdrop-blur-lg h-full">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-1 font-orbitron tracking-wider">
            Settings
          </h3>
          <div className="w-full h-px bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
        </div>

        {/* Theme Settings */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-300 mb-3 font-rajdhani tracking-wide">
            Theme
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('cyber')}
              className={combineStyles(
                'flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300',
                'border backdrop-blur-sm',
                theme === 'cyber'
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-800/50 border-slate-600/30 text-slate-400 hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-slate-300'
              )}
            >
              <span className="font-rajdhani">Cyber</span>
            </button>
            <button
              onClick={() => setTheme('light')}
              className={combineStyles(
                'flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300',
                'border backdrop-blur-sm',
                theme === 'light'
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-800/50 border-slate-600/30 text-slate-400 hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-slate-300'
              )}
            >
              <span className="font-rajdhani">Light</span>
            </button>
          </div>
        </div>

        {/* Language Settings */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-300 mb-3 font-rajdhani tracking-wide">
            Language
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('default')}
              className={combineStyles(
                'flex-1 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300',
                'border backdrop-blur-sm',
                language === 'default'
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-800/50 border-slate-600/30 text-slate-400 hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-slate-300'
              )}
            >
              <span className="font-rajdhani">Default</span>
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={combineStyles(
                'flex-1 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300',
                'border backdrop-blur-sm',
                language === 'en'
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-800/50 border-slate-600/30 text-slate-400 hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-slate-300'
              )}
            >
              <span className="font-rajdhani">English</span>
            </button>
            <button
              onClick={() => setLanguage('zh')}
              className={combineStyles(
                'flex-1 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300',
                'border backdrop-blur-sm',
                language === 'zh'
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-800/50 border-slate-600/30 text-slate-400 hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-slate-300'
              )}
            >
              <span className="font-rajdhani">Chinese</span>
            </button>
          </div>
        </div>


      </div>
    </aside>
  );
};