// ==============================================
// AI Website Generator - Common Template Utilities
// ==============================================
// Shared constants, interfaces, and utility functions used across all prompt templates

// --- Output Formatting Instructions ---

export const HTML_OUTPUT_ONLY_FORMATTING_INSTRUCTIONS = `
Provide ONLY the complete HTML code, starting with \`<!DOCTYPE html>\` and ending with \`</html>\`.
Do NOT include any explanatory text, comments, or markdown fences like \`\`\`html before or after the HTML code.
All styling MUST use Tailwind CSS classes directly in the HTML elements. No \`<style>\` tags or external CSS files.`;

export const TAILWIND_STYLING_INSTRUCTIONS = `
All styling MUST use Tailwind CSS classes directly in the HTML elements. No \`<style>\` tags or external CSS files.`;

// --- Interfaces ---

export interface PlanSettings {
  theme: 'cyber' | 'light';
  language: 'default' | 'en' | 'zh';
  outputType: 'webpage' | 'slides';
}

// --- Language Mapping Utilities ---

export const getLanguageText = (language: PlanSettings['language']): string => {
  switch (language) {
    case 'en':
      return '英文 (English)';
    case 'zh':
      return '中文 (Chinese)';
    case 'default':
    default:
      return 'The webpage content language should match the primary language of the input report. Use English if the report is primarily in English, use Chinese if the report is primarily in Chinese.';
  }
};

// --- Theme Mapping Utilities ---

export const getThemeText = (theme: PlanSettings['theme']): string => {
  return theme === 'light' 
    ? '简洁明亮的设计风格 (clean, minimal light theme)' 
    : '深色背景的赛博风格 (dark background cyber theme)';
};

// --- Template Processing Utilities ---

export const processTemplateWithSettings = (template: string, settings: PlanSettings): string => {
  return template
    .replace('{lang}', getLanguageText(settings.language))
    .replace('{theme}', getThemeText(settings.theme));
};