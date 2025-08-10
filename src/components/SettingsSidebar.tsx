import React from 'react';
import { useAppTheme, useAppLanguage, useAppOutputType, useAppPerformanceLevel, useAppReducedMotion, useAppActions } from '../contexts/AppContext';
import { OptionButton } from './OptionButton';
import { I18N_CONSTANTS } from '../constants/i18n';

export const SettingsSidebar: React.FC = () => {
  const outputType = useAppOutputType();
  const theme = useAppTheme();
  const language = useAppLanguage();
  const performanceLevel = useAppPerformanceLevel();
  const prefersReducedMotion = useAppReducedMotion();
  const { setOutputType, setTheme, setLanguage, setPerformanceLevel } = useAppActions();

  return (
    <aside className="w-80 flex-shrink-0 transition-[opacity,transform] duration-200 will-change-on-hover">
      <div className="glass-effect bg-slate-900/80 border border-cyan-500/50 hover:border-cyan-500/70 rounded-lg p-6 shadow-lg h-full">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-1 font-orbitron tracking-wider">
            {I18N_CONSTANTS.SETTINGS.TITLE}
          </h3>
          <div className="w-full h-px bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
        </div>

        {/* Output Type Settings */}
        <fieldset className="mb-8">
          <legend className="block text-sm font-semibold text-slate-300 mb-3 font-rajdhani tracking-wide">
            {I18N_CONSTANTS.SETTINGS.OUTPUT_TYPE.LABEL}
          </legend>
          <div className="flex gap-3" role="group">
            <OptionButton
              selected={outputType === 'webpage'}
              label={I18N_CONSTANTS.SETTINGS.OUTPUT_TYPE.WEBPAGE}
              onClick={() => setOutputType('webpage')}
              title={I18N_CONSTANTS.SETTINGS.OUTPUT_TYPE.WEBPAGE_TOOLTIP}
              className="px-4"
            />
            <OptionButton
              selected={outputType === 'slides'}
              label={I18N_CONSTANTS.SETTINGS.OUTPUT_TYPE.SLIDES}
              onClick={() => setOutputType('slides')}
              title={I18N_CONSTANTS.SETTINGS.OUTPUT_TYPE.SLIDES_TOOLTIP}
              className="px-4"
            />
          </div>
        </fieldset>

        {/* Theme Settings */}
        <fieldset className="mb-8">
          <legend className="block text-sm font-semibold text-slate-300 mb-3 font-rajdhani tracking-wide">
            {I18N_CONSTANTS.SETTINGS.THEME.LABEL}
          </legend>
          <div className="flex gap-3" role="group">
            <OptionButton
              selected={theme === 'cyber'}
              label={I18N_CONSTANTS.SETTINGS.THEME.CYBER}
              onClick={() => setTheme('cyber')}
              title={I18N_CONSTANTS.SETTINGS.THEME.CYBER_TOOLTIP}
              className="px-4"
            />
            <OptionButton
              selected={theme === 'light'}
              label={I18N_CONSTANTS.SETTINGS.THEME.LIGHT}
              onClick={() => setTheme('light')}
              title={I18N_CONSTANTS.SETTINGS.THEME.LIGHT_TOOLTIP}
              className="px-4"
            />
          </div>
        </fieldset>

        {/* Language Settings */}
        <fieldset className="mb-8">
          <legend className="block text-sm font-semibold text-slate-300 mb-3 font-rajdhani tracking-wide">
            {I18N_CONSTANTS.SETTINGS.LANGUAGE.LABEL}
          </legend>
          <div className="flex gap-2" role="group">
            <OptionButton
              selected={language === 'default'}
              label={I18N_CONSTANTS.SETTINGS.LANGUAGE.DEFAULT}
              onClick={() => setLanguage('default')}
              title={I18N_CONSTANTS.SETTINGS.LANGUAGE.DEFAULT_TOOLTIP}
            />
            <OptionButton
              selected={language === 'en'}
              label={I18N_CONSTANTS.SETTINGS.LANGUAGE.ENGLISH}
              onClick={() => setLanguage('en')}
              title={I18N_CONSTANTS.SETTINGS.LANGUAGE.ENGLISH_TOOLTIP}
            />
            <OptionButton
              selected={language === 'zh'}
              label={I18N_CONSTANTS.SETTINGS.LANGUAGE.CHINESE}
              onClick={() => setLanguage('zh')}
              title={I18N_CONSTANTS.SETTINGS.LANGUAGE.CHINESE_TOOLTIP}
            />
          </div>
        </fieldset>

        {/* Performance Mode Settings (Task 2.2) */}
        <fieldset className="mb-6">
          <legend className="block text-sm font-semibold text-slate-300 mb-3 font-rajdhani tracking-wide">
            Performance Mode
          </legend>
          {prefersReducedMotion && (
            <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-300">
              ⚠️ Reduced motion detected - animations disabled by system preference
            </div>
          )}
          <div className="flex gap-2" role="group">
            <OptionButton
              selected={performanceLevel === 'high'}
              label="HQ"
              onClick={() => setPerformanceLevel('high')}
              title="Maximum visual effects - blur, animations, shadows, transitions"
            />
            <OptionButton
              selected={performanceLevel === 'balanced'}
              label="BAL"
              onClick={() => setPerformanceLevel('balanced')}
              title="Reduced effects for better performance while maintaining aesthetics"
            />
            <OptionButton
              selected={performanceLevel === 'low'}
              label="PERF"
              onClick={() => setPerformanceLevel('low')}
              title="Minimal effects for maximum performance and accessibility"
            />
          </div>
          {/* Current settings summary removed per request */}
        </fieldset>

      </div>
    </aside>
  );
};
