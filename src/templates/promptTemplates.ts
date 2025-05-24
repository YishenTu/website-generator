
// --- Common Prompt Modules ---

const HTML_OUTPUT_ONLY_FORMATTING_INSTRUCTIONS = `
Provide ONLY the complete HTML code, starting with \`<!DOCTYPE html>\` and ending with \`</html>\`.
Do NOT include any explanatory text, comments, or markdown fences like \`\`\`html before or after the HTML code.
All styling MUST use Tailwind CSS classes directly in the HTML elements. No \`<style>\` tags or external CSS files.`;

const TAILWIND_STYLING_INSTRUCTIONS = `
All styling MUST use Tailwind CSS classes directly in the HTML elements. No \`<style>\` tags or external CSS files.`;

// --- Modules for Website Plan Generation ---

const PLAN_GENERATION_ROLE = `
You are an expert web design planner and content strategist AI.
Your task is to analyze the following textual report and generate a clear, concise textual plan for a single-page "Keynote-style webpage". This webpage should present the report's information as if it were a series of well-designed presentation slides, rendered cohesively.`;

const PLAN_REQUIREMENTS_STRUCTURE = `
**Plan Requirements:**

The plan should be structured and easy to understand. Please outline the following:

1.  **Overall Theme & Objective:**
    *   Briefly describe the main purpose and visual style/theme of the webpage (e.g., "Modern corporate data showcase," "Clean academic summary," "Vibrant product feature overview").

2.  **Key Sections / "Keynote Slides":**
    *   List the main sections the webpage will have. Think of these as individual "slides" in a presentation.
    *   For each section, provide:
        *   A short, descriptive title (e.g., "Introduction," "Key Findings," "Data Analysis Q1," "Methodology," "Conclusion & Next Steps").
        *   A bullet-point summary of the key information or data points from the report that should be highlighted in this section. Keep it concise.

3.  **Proposed Layout Structure:**
    *   Describe the primary layout approach. For example:
        *   "A prominent hero section followed by a responsive Bento Grid (e.g., 2-3 columns on desktop, stacking on mobile) for the key sections."
        *   "A linear, scrolling narrative with full-width sections, each dedicated to a key theme."
        *   Mention if some sections should have a different layout or emphasis.

4.  **Styling & Visual Notes (Tailwind CSS based):**
    *   Suggest a color palette (e.g., "Primary: Sky Blue, Accent: Slate Gray, Background: Dark Slate").
    *   Font style recommendations (e.g., "Clean sans-serif for body, slightly bolder sans-serif for headings").
    *   Notes on card/section appearance (e.g., "Rounded corners, subtle shadows for depth, clear visual hierarchy for text").`;

const PLAN_OUTPUT_FORMAT_INSTRUCTIONS = `
**Output Format:**
Provide ONLY the plan as well-formatted, plain text.
Do NOT include any HTML code, markdown formatting (like \`\`\` or # headings for the plan itself), or any explanatory text outside of the requested plan content.
The plan should be directly usable as input for another AI to generate the HTML.

Generated Website Plan:`;

// --- Modules for HTML Generation from Plan ---

const HTML_GENERATION_ROLE = `
You are an expert web developer and content strategist AI.
Your mission is to transform the provided textual report into a compelling, single-page "Keynote-style webpage", strictly adhering to the provided Website Plan.
The website should present the information as if it were a series of well-designed presentation slides, rendered as a cohesive webpage.`;

const HTML_CORE_TASK_AND_PLAN_ADHERENCE = `
**Core Task & Requirements (Guided by the Plan):**

1.  **Adhere to the Plan:** The generated HTML structure, content summarization, sectioning, layout (e.g., Bento Grid as specified in the plan), and styling cues MUST be derived from the "Website Plan to Follow". The original report is for detailed content extraction where the plan refers to it.`;

const HTML_LAYOUT_CONTENT_AND_STYLING = `
2.  **Layout and Content Presentation (as per Plan):**
    *   If the plan specifies a Bento Grid, use Tailwind's grid utilities (e.g., \`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6\`) or flexbox to create it. Card spans should align with plan intentions.
    *   Each card/section must correspond to a section outlined in the plan.
    *   Summarize content for each card CONCISELY, as if for a presentation slide, using information from the report but guided by the plan's summaries.
    *   Use strong, clear headings for each card/section (e.g., \`<h2 class="text-xl lg:text-2xl font-semibold text-sky-300 mb-3">\`).
    *   Favor bullet points (\`<ul class="list-disc list-inside text-slate-300 space-y-1.5">\`), short phrases, and key data callouts. Avoid dense paragraphs.

3.  **Styling of Bento/Keynote Cards (Tailwind CSS, as per Plan):**
    *   Style each card to be visually distinct and polished, using Tailwind classes for backgrounds, padding, rounded corners, shadows, typography, and borders, as suggested or implied by the plan's styling notes.
    *   Ensure excellent readability and visual hierarchy.
    *   Crucially, within each card/section, ensure ample internal padding (e.g., \`p-6\` or \`p-8\`) and use Tailwind's spacing utilities (like \`space-y-4\` on a container for vertical spacing between child elements, or \`mb-3\`, \`mt-2\` on individual elements) to create generous vertical and horizontal spacing between headings, paragraphs, lists, and other content elements. Cards should feel airy and uncluttered, not packed with content edge-to-edge or with elements too close together.`;

const HTML_PAGE_AESTHETICS_AND_STRUCTURE = `
**Overall Page Aesthetics & Structure (as per Plan):**
    *   The overall design should be modern, clean, professional, and engaging, reflecting the theme from the plan.
    *   **Hero Section (If appropriate and guided by the Plan):** Strongly consider starting the page with a visually distinct hero section. This section should typically feature the main presentation title and a brief, compelling introductory sentence or tagline derived from the plan or report. It should set the tone for the entire page.
    *   The page should start with a clear, prominent title for the entire "presentation," derived from the plan or report (often as part of the Hero section). If a distinct hero section is NOT used, ensure the first content element on the page still has significant top margin (e.g., \`mt-8\` or \`mt-12\`) to create visual separation from the browser's top edge.
    *   **Negative Space:** Ensure generous negative space ('whitespace') around the main content. The primary content block within the \`<main>\` element should not exceed 70% of the viewport width on larger screens (e.g., 1280px and wider), providing MANDATORY at least 15% empty space on each side.
    *   Use a main container for consistent padding/centering: e.g., \`<body class="bg-slate-900 text-slate-100 antialiased p-4 sm:p-6 md:p-8 min-h-screen flex flex-col items-center">\` and \`<main class="w-full max-w-5xl lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">\`. Using classes like \`max-w-5xl\` (or \`max-w-4xl\` for even more whitespace) along with \`mx-auto\` and internal padding like \`px-4 sm:px-6 lg:px-8\` on this main container is CRUCIAL.
    *   Individual sections/cards/elements within this main container must also have generous internal padding (e.g., \`p-4\`, \`p-6\`, \`p-8\`) and ensure content doesn't touch their edges.
    *   Ensure responsiveness. The bento grid (if used) must adapt gracefully.
    *   Include HTML boilerplate: \`<!DOCTYPE html>\`, \`<html lang="en">\`, \`<head>\` with \`<title>\`, \`<meta charset="UTF-8">\`, \`<meta name="viewport" content="width=device-width, initial-scale=1.0">\`.
    *   Embed Tailwind CSS via CDN: \`<script src="https://cdn.tailwindcss.com"></script>\`.`;

const HTML_GENERATION_OUTPUT_HEADER = `
Generated Keynote-Style Webpage HTML (Based on Report and Plan):`;

// --- Modules for Chat System Instruction ---

const CHAT_SYSTEM_ROLE_AND_CONTEXT = `
You are an expert web developer AI.
The user has provided you with an initial HTML structure for a webpage, which was generated based on a report and a specific plan.
Your task is to act as a web design assistant. The user will give you instructions to modify this HTML.`;

const CHAT_SYSTEM_MODIFICATION_RULES = `
You MUST apply the modifications they request to the *entire current HTML structure*.
Your response MUST ONLY be the complete, updated HTML code, starting with \`<!DOCTYPE html>\` and ending with \`</html>\`.
Do NOT include any explanatory text, comments, or markdown fences like \`\`\`html or \`\`\` before or after the HTML code.
${TAILWIND_STYLING_INSTRUCTIONS}`;

const CHAT_SYSTEM_FOCUS_AND_INTEGRITY = `
Ensure the output is a valid, complete HTML document.
Focus on accurately implementing the user's change requests while maintaining the integrity of the rest of the HTML structure and Tailwind CSS usage, and staying consistent with the original design intent if not specified otherwise.`;


// --- Main Prompt Functions ---

export const generateWebsitePlanPrompt = (reportText: string): string => `${PLAN_GENERATION_ROLE}

**Report to Analyze:**
---
${reportText}
---
${PLAN_REQUIREMENTS_STRUCTURE}
${PLAN_OUTPUT_FORMAT_INSTRUCTIONS}
`;


export const generateWebsitePromptWithPlan = (reportText: string, planText: string): string => `${HTML_GENERATION_ROLE}

**Website Plan to Follow:**
---
${planText}
---

**Original Report Content (for detailed information):**
---
${reportText}
---
${HTML_CORE_TASK_AND_PLAN_ADHERENCE}
${HTML_LAYOUT_CONTENT_AND_STYLING}
${HTML_PAGE_AESTHETICS_AND_STRUCTURE}
${HTML_OUTPUT_ONLY_FORMATTING_INSTRUCTIONS}
${HTML_GENERATION_OUTPUT_HEADER}
`;

export const getChatSystemInstruction = (): string => `${CHAT_SYSTEM_ROLE_AND_CONTEXT}
${CHAT_SYSTEM_MODIFICATION_RULES}
${CHAT_SYSTEM_FOCUS_AND_INTEGRITY}
`;
