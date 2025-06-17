// ==============================================
// AI Website Generator - Website-Specific Prompts
// ==============================================
// Prompt templates for website plan generation and HTML code generation

import { PlanSettings, processTemplateWithSettings, HTML_OUTPUT_ONLY_FORMATTING_INSTRUCTIONS } from './common';

// ==============================================
// WEBSITE PLAN GENERATION PROMPTS
// ==============================================

const PLAN_GENERATION_ROLE = `
You are an expert web design planner and content strategist AI.
Your task is to analyze the following textual report and generate a clear, concise textual plan for a single-page showcase webpage. This webpage should present the report's information in a modern, engaging format optimized for content presentation and user experience.`;

const PLAN_REQUIREMENTS_STRUCTURE = `
**Plan Requirements:**

The plan should be structured and easy to understand. Please outline the following:

1.  **Overall Theme & Objective:**
    *   Briefly describe the main purpose and visual style/theme of the webpage (e.g., "Modern corporate data showcase," "Clean academic summary," "Vibrant product feature overview").

2.  **Key Sections:**
    *   List the main sections the webpage will have. Think of these as content blocks that tell a cohesive story.
    *   For each section, provide:
        *   A short, descriptive title (e.g., "Introduction," "Key Findings," "Data Analysis Q1," "Methodology," "Conclusion & Next Steps").
        *   A bullet-point summary of the key information or data points from the report that should be highlighted in this section. Keep it concise.

3.  **Proposed Layout Structure:**
    *   **Must adopt the following design style combination:**
        *   **Primary Layout Style: "Linear App Style"** - Page structure starting with a prominent hero section followed by sequential content sections that flow naturally down the page
        *   **Supporting Layout Element: "Bento Grid"** - Use grid layouts in appropriate content areas to showcase related item collections (such as statistics, features, comparison data, etc.)
        *   **Design Aesthetic: "Glassmorphism"** - Overall adoption of glassmorphism design style to create a modern, elegant visual effect
    *   **Bento Grid Usage Rules - Important:** Only use grid layouts when content can naturally be broken down into at least 2 related items per row. 
    *   **Avoid:** DO NOT create single large boxes for entire sections or one box per section. DO NOT make large box backgrounds (like one large bento grid card) that encompass entire content areas.

4.  **Styling & Visual Notes (Tailwind CSS based):**
    *   **Required Design Style Characteristics:**
        *   **Linear App Style Features:** Clear vertical flow structure, distinct content hierarchy, modern application interface feel
        *   **Bento Grid Features:** Flexible grid layouts for related content groupings, responsive grid adaptation for different screen sizes
        *   **Glassmorphism Features:** Semi-transparent backgrounds, frosted glass effects, layered visual hierarchy, modern glass aesthetics
    *   Color palette should align with the specified design theme: {theme}
    *   Font style recommendations (e.g., "Clean sans-serif for body, slightly bolder sans-serif for headings")
    *   **Theme Implementation Requirements:**
        -   For cyber theme: Primarily dark backgrounds (blacks, deep grays, dark blues) with contrasting bright text and neon accent colors for highlights
        -   For light theme: Clean white/light backgrounds, subtle shadows, minimal professional design
    *   **Glassmorphism Implementation Requirements - Must Include:**
        -   Semi-transparent backgrounds with backdrop blur effects (e.g., \`bg-white/10 backdrop-blur-md\`)
        -   Subtle borders and shadows for depth (e.g., \`border border-white/20 shadow-xl\`)
        -   Layered visual hierarchy with glass-like card components
        -   Key UI elements with frosted glass appearance, creating modern, clean aesthetic effects

5.  **Interactive & Visual Features:**
    *   **Chart and Graph Requirements:** Specify which sections would benefit from charts or graphs for statistical data (e.g., "Statistical data section needs bar charts", "Trend analysis needs line charts").
    *   **Visual Enhancement Needs:** Identify sections that need icons for visual hierarchy (e.g., "Feature section needs icon enhancement").
    *   **Interactivity Requirements:** Specify interactive elements like hover effects or expandable content (e.g., "Cards need hover effects").

6.  **Implementation Specifications:**
    *   The plan must specify that the website content language should be: {lang}
    *   The plan must specify that the website design theme should be: {theme}`;

const PLAN_OUTPUT_FORMAT_INSTRUCTIONS = `
**Output Format and Language Instructions:**
Provide ONLY the plan as well-formatted, plain text.
Do NOT include any HTML code, markdown formatting (like \`\`\` or # headings for the plan itself), or any explanatory text outside of the requested plan content.
The plan should be directly usable as input for another AI to generate the HTML.

**Language Requirements:**
- The plan should be written in Chinese (中文)
- If the original report contains important concepts in languages other than Chinese, include both the Chinese translation and the original language terms in parentheses
- Example: "数据分析 (Data Analysis)" or "人工智能 (Artificial Intelligence)"

Generated Website Plan:`;

// ==============================================
// WEBSITE CODE GENERATION PROMPTS
// ==============================================

const CODE_GENERATION_ROLE = `
You are an expert web developer and content strategist AI.
Your mission is to transform the provided textual report into a compelling, single-page showcase webpage, strictly adhering to the provided Website Plan.
The website should present the information in a modern, engaging format that tells a cohesive story and provides an excellent user experience.
`;

const CODE_CORE_TASK_AND_PLAN_ADHERENCE = `
**Core Task & Requirements (Guided by the Plan):**

1.  **Adhere to the Plan:** The generated HTML structure, content summarization, sectioning, layout, and styling cues MUST be derived from the "Website Plan to Follow". The original report is for detailed content extraction where the plan refers to it.

2. **Language Requirements:**
    - The webpage content language MUST be based on the language specified in the "Website Plan to Follow". The plan is the single source of truth for language selection.
`;

const CODE_LAYOUT_CONTENT_AND_STYLING = `
3.  **Layout and Content Presentation (as per Plan):**
    *   **Primary Layout Approach:** Use "Linear App Style" layout with sections flowing vertically down the page as the main structure.
    *   **Section Separation Methods - CRITICAL:**
        -   **AVOID:** DO NOT USE large wrapper boxes or containers that encompass entire sections as single blocks
        -   **PREFERRED:** Use natural content flow with visual separators such as:
            *   Subtle background color changes between sections (\`bg-slate-50\`, \`bg-white\`, \`bg-gray-100\`)
            *   Spacing-based separation using margins and padding (\`mt-12 mb-8\`, \`py-16\`)
            *   Horizontal dividers or visual breaks (\`border-t border-gray-200\`)
            *   Typography hierarchy to distinguish section boundaries
        -   **Content Grouping:** When multiple related items exist, use smaller grouped cards or inline arrangements rather than one large encompassing container
    *   **Bento Grid Usage Rules - CRITICAL:**
        -   Use bento grid layouts ONLY when content naturally fits into multiple related items that can display at least 2 items per row
        -   Perfect for: statistics collections, feature comparisons, team members, product showcases, or data points that benefit from side-by-side presentation
        -   AVOID: Creating bento grids for single large content blocks, using one grid item per section, or forcing unrelated content into grid format
        -   Implementation: Use Tailwind's grid utilities (e.g., \`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6\`) only when you have 2+ items per row
    *   **Content Structure:** Each section must correspond to a section outlined in the plan with clear headings and well-organized content presentation.
    *   **Typography:** Use strong, clear headings (e.g., \`<h2 class="text-xl lg:text-2xl font-semibold text-sky-300 mb-3">\`) and appropriate content formatting.
    *   **Spacing:** Ensure generous internal padding (e.g., \`p-6\` or \`p-8\`) and use Tailwind's spacing utilities for proper vertical and horizontal spacing between elements.`;

const CODE_PAGE_AESTHETICS_AND_STRUCTURE = `
4.  **Overall Page Aesthetics & Structure (as per Plan):**
    *   **Design Philosophy:** Modern, clean, professional, and engaging, reflecting the theme from the plan. Consider glassmorphism design patterns for enhanced visual appeal.
    *   **Theme Implementation:**
        -   For cyber theme: Primarily dark backgrounds (e.g., \`bg-black\`, \`bg-slate-900\`, \`bg-gray-900\`, \`bg-slate-800\`) with bright contrasting text and vibrant accent colors
        -   For light theme: Clean backgrounds (e.g., \`bg-white\`, \`bg-gray-50\`), subtle shadows, professional styling
    *   **Hero Section:** Start with a visually distinct hero section featuring the main title and compelling introduction, or ensure significant top margin if no distinct hero.
    *   **Responsive Layout Strategy:**
        -   **Negative Space Management:** Main content should not exceed 80% viewport width on large screens, providing at least 10% empty space on each side
        -   **Container Structure:** Use \`<main class="w-full max-w-5xl lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">\` for consistent centering and spacing
        -   **Mobile Responsiveness:** Ensure linear sections stack naturally and any grid layouts adapt gracefully
        -   **Glassmorphism Implementation:** When specified in the plan, implement glass-like UI elements using Tailwind classes such as \`bg-white/10 backdrop-blur-md border border-white/20\` for cards and containers
    *   **HTML Boilerplate:** Include proper DOCTYPE, html lang attribute, head section with title, meta tags, and viewport settings.
    *   **Resource Loading Strategy:**
        -   **Tailwind CSS:** \`<script src="https://cdn.tailwindcss.com"></script>\`
        -   **Conditional Libraries:** Only include external libraries when specifically needed:
            *   Font Awesome: \`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\` (for icons)
            *   Chart.js: \`<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\` (for statistical data visualization)
        -   **Performance:** Add preconnect hints and use defer/async loading for non-critical scripts`;

const CODE_ADVANCED_INTERACTIVITY_AND_EXCELLENCE = `
5.  **Advanced Interactivity & Excellence Standards:**
    *   Implement the highest quality standards with comprehensive interactive features.
    *   Include thoughtful details like hover states, transitions, and micro-interactions using Tailwind CSS classes
    *   Apply design principles: hierarchy, contrast, balance, and movement
    *   Use smooth transitions (\`transition-all duration-300 ease-in-out\`) and hover effects (\`hover:shadow-lg hover:scale-105\`)
    *   Create depth with layered shadows and gradients where appropriate
    *   Ensure consistent animation timing across all interactive elements`;

const CODE_GENERATION_OUTPUT_HEADER = `
Generated Showcase Webpage HTML (Based on Report and Plan), do not hold back, give me the best you can do:`;

// ==============================================
// PUBLIC API FUNCTIONS
// ==============================================

export const generateWebsitePlanPrompt = (reportText: string, settings: PlanSettings): string => {
  // Process the template with settings
  const processedInstructions = processTemplateWithSettings(PLAN_OUTPUT_FORMAT_INSTRUCTIONS, settings);

  return `
${PLAN_GENERATION_ROLE}

**Report to Analyze:**
---
${reportText}
---
${PLAN_REQUIREMENTS_STRUCTURE}
${processedInstructions}
`;
};

export const generateWebsiteCodePrompt = (reportText: string, planText: string): string => `

${CODE_GENERATION_ROLE}

**Website Plan to Follow:**
---
${planText}
---

**Original Report Content (for detailed information):**
---
${reportText}
---
${CODE_CORE_TASK_AND_PLAN_ADHERENCE}
${CODE_LAYOUT_CONTENT_AND_STYLING}
${CODE_PAGE_AESTHETICS_AND_STRUCTURE}
${CODE_ADVANCED_INTERACTIVITY_AND_EXCELLENCE}
${HTML_OUTPUT_ONLY_FORMATTING_INSTRUCTIONS}
${CODE_GENERATION_OUTPUT_HEADER}
`;