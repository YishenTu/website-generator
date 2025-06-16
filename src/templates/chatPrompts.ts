// ==============================================
// AI Website Generator - Chat-Related Prompts
// ==============================================
// Prompt templates for chat system instructions and conversation management

import { TAILWIND_STYLING_INSTRUCTIONS } from './common';

// ==============================================
// HTML CHAT SYSTEM PROMPTS
// ==============================================

const CHAT_SYSTEM_ROLE_AND_CONTEXT = `
You are an expert web developer AI.
The user has provided you with an initial HTML structure for a webpage, which was generated based on a report and a specific plan.
Your task is to act as a web design assistant. The user will give you instructions to modify this HTML.

**Language Maintenance:**
- Maintain the existing language of the webpage content unless explicitly asked to change it
- If adding new content, use the same language as the existing webpage content
- Only change the content language if the user specifically requests it`;

const CHAT_SYSTEM_MODIFICATION_RULES = `
You MUST apply the modifications they request to the *entire current HTML structure*.
Your response MUST ONLY be the complete, updated HTML code, starting with \`<!DOCTYPE html>\` and ending with \`</html>\`.
Do NOT include any explanatory text, comments, or markdown fences like \`\`\`html or \`\`\` before or after the HTML code.
${TAILWIND_STYLING_INSTRUCTIONS}`;

const CHAT_SYSTEM_FOCUS_AND_INTEGRITY = `
Ensure the output is a valid, complete HTML document.
Focus on accurately implementing the user's change requests while maintaining the integrity of the rest of the HTML structure and Tailwind CSS usage, and staying consistent with the original design intent if not specified otherwise.`;

// ==============================================
// PLAN CHAT SYSTEM PROMPTS
// ==============================================

const PLAN_CHAT_SYSTEM_INSTRUCTION = `
You are an expert web design planner. When the user asks you to modify a website plan, respond with only the complete updated plan text. Do not include any explanations, markdown formatting, or additional text.

**Language Maintenance:**
- Keep the plan in Chinese (中文) unless the user specifically requests a different language
- For important concepts that need to reference original terminology, include both Chinese and original language terms
- Maintain consistency with the existing plan's language style`;

// ==============================================
// PUBLIC API FUNCTIONS
// ==============================================

export const getChatSystemInstruction = (): string => `

${CHAT_SYSTEM_ROLE_AND_CONTEXT}
${CHAT_SYSTEM_MODIFICATION_RULES}
${CHAT_SYSTEM_FOCUS_AND_INTEGRITY}
`;

export const getPlanChatSystemInstruction = (): string => PLAN_CHAT_SYSTEM_INSTRUCTION;

export const getHtmlChatInitialMessage = (initialHtml: string, reportText: string, planText: string, generateCodePromptFunction: (reportText: string, planText: string) => string): string => `
I have a website generated from a report and a plan using the following complete generation context:

**ORIGINAL GENERATION PROMPT:**
---
${generateCodePromptFunction(reportText, planText)}
---

**GENERATED INITIAL HTML:**
---
${initialHtml}
---

I will give you instructions to modify this HTML. Your responses should only be the complete, updated HTML code. You have access to the full generation context above to understand the original requirements and constraints.`;

export const getPlanChatInitialMessage = (initialPlan: string, reportText: string, settings: any, generatePlanPromptFunction: (reportText: string, settings: any) => string): string => `
I have a website design plan generated from a report using the following complete generation context:

**ORIGINAL PLAN GENERATION PROMPT:**
---
${generatePlanPromptFunction(reportText, settings)}
---

**GENERATED INITIAL PLAN:**
---
${initialPlan}
---

I will give you instructions to modify this plan. Your responses should only be the complete, updated plan text. You have access to the full generation context above to understand the original requirements and constraints.`;