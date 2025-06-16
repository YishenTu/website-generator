// Internationalization constants for the settings panel
export const I18N_CONSTANTS = {
  SETTINGS: {
    TITLE: 'Settings',
    OUTPUT_TYPE: {
      LABEL: 'Output Type',
      WEBPAGE: 'Webpage',
      SLIDES: 'Slides',
      WEBPAGE_TOOLTIP: 'Generate a single-page website',
      SLIDES_TOOLTIP: 'Generate presentation slides'
    },
    THEME: {
      LABEL: 'Theme',
      CYBER: 'Cyber',
      LIGHT: 'Light',
      CYBER_TOOLTIP: 'Switch to cyberpunk glassmorphism theme',
      LIGHT_TOOLTIP: 'Switch to clean minimal light theme'
    },
    LANGUAGE: {
      LABEL: 'Language', 
      DEFAULT: 'Default',
      ENGLISH: 'English',
      CHINESE: 'Chinese',
      DEFAULT_TOOLTIP: 'Use the same language as the input report',
      ENGLISH_TOOLTIP: 'Generate website in English',
      CHINESE_TOOLTIP: 'Generate website in Chinese'
    }
  }
} as const;