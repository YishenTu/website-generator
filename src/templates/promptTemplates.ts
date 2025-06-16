// ==============================================
// AI Website Generator - Prompt Templates (Orchestrator)
// ==============================================
// Main orchestrator that imports from modular prompt templates and provides dispatch logic

// Import from modular templates
import type { PlanSettings } from './common';
import { 
  generateWebsitePlanPrompt as generateWebsitePlanPromptInternal, 
  generateWebsiteCodePrompt 
} from './websitePrompts';
import { 
  generateSlidesPlanPrompt, 
  generateSlidesCodePrompt 
} from './slidesPrompts';
import { 
  getChatSystemInstruction, 
  getPlanChatSystemInstruction, 
  getHtmlChatInitialMessage as getHtmlChatInitialMessageFromChat, 
  getPlanChatInitialMessage as getPlanChatInitialMessageFromChat 
} from './chatPrompts';


// ==============================================
// PUBLIC API FUNCTIONS WITH DISPATCH LOGIC
// ==============================================

// Re-export PlanSettings interface for backward compatibility
export { PlanSettings };

// --- Plan Generation Functions with Dispatch Logic ---

export const generateWebsitePlanPrompt = (reportText: string, settings: PlanSettings): string => {
  // Dispatch based on outputType
  switch (settings.outputType) {
    case 'slides':
      return generateSlidesPlanPrompt(reportText, settings);
    case 'webpage':
    default:
      return generateWebsitePlanPromptInternal(reportText, settings);
  }
};

// --- Code Generation Functions with Dispatch Logic ---

export const generateWebsitePromptWithPlan = (reportText: string, planText: string, outputType: 'webpage' | 'slides' = 'webpage'): string => {
  // Dispatch based on outputType
  switch (outputType) {
    case 'slides':
      return generateSlidesCodePrompt(reportText, planText);
    case 'webpage':
    default:
      return generateWebsiteCodePrompt(reportText, planText);
  }
};

// --- Chat System Functions (Re-exported) ---

export { getChatSystemInstruction, getPlanChatSystemInstruction };

export const getHtmlChatInitialMessage = (initialHtml: string, reportText: string, planText: string, outputType: 'webpage' | 'slides' = 'webpage'): string => {
  // Determine the appropriate code generation function based on output type
  const generateCodePromptFunction = outputType === 'slides' ? generateSlidesCodePrompt : generateWebsiteCodePrompt;
  
  return getHtmlChatInitialMessageFromChat(initialHtml, reportText, planText, generateCodePromptFunction);
};

export const getPlanChatInitialMessage = (initialPlan: string, reportText: string, settings: PlanSettings): string => {
  // Determine the appropriate plan generation function based on output type
  const generatePlanPromptFunction = settings.outputType === 'slides' ? generateSlidesPlanPrompt : generateWebsitePlanPromptInternal;
  
  return getPlanChatInitialMessageFromChat(initialPlan, reportText, settings, generatePlanPromptFunction);
};