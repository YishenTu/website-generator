// ==============================================
// AI Website Generator - Slides-Specific Prompts
// ==============================================
// Prompt templates for slides plan generation and HTML code generation

import { PlanSettings, processTemplateWithSettings, HTML_OUTPUT_ONLY_FORMATTING_INSTRUCTIONS } from './common';

// ==============================================
// SLIDES PLAN GENERATION PROMPTS
// ==============================================

const SLIDES_PLAN_GENERATION_ROLE = `
You are an expert presentation design planner and content strategist AI.
Your task is to analyze the following textual report and generate a clear, concise textual plan for a slide-based presentation. This presentation should transform the report's information into an engaging, easy-to-follow slide deck optimized for storytelling and audience engagement.`;

const SLIDES_PLAN_REQUIREMENTS_STRUCTURE = `
**Slides Plan Requirements:**

The plan should be structured for presentation flow and audience engagement. Please outline the following:

1.  **Presentation Theme & Objective:**
    *   Briefly describe the main purpose and visual style/theme of the presentation (e.g., "Professional business analysis presentation," "Educational research showcase," "Product feature walkthrough").
    *   Define the target audience and presentation context.

2.  **Slide Structure & Flow:**
    *   Create a logical slide sequence that tells a compelling story.
    *   For each slide, provide:
        *   A clear, descriptive slide title (e.g., "Executive Summary," "Key Insights," "Data Analysis - Q1 Results," "Methodology Overview," "Next Steps & Recommendations").
        *   A bullet-point summary of the main content points for that slide. Keep it focused - each slide should have 3-5 key points maximum.
        *   Design notes for the slide layout (e.g., "Split layout with chart on left, key points on right," "Hero slide with centered title and subtitle," "Grid layout for statistics").

3.  **Presentation Design Guidelines:**
    *   **Visual Hierarchy:** Each slide should have a clear primary focus with supporting elements.
    *   **Content Density:** Optimize for readability - avoid text-heavy slides, use bullet points and visual elements.
    *   **Slide Transitions:** Consider how slides connect logically to maintain narrative flow.
    *   **Visual Consistency:** Maintain consistent styling, spacing, and typography across all slides.

4.  **Styling & Visual Notes (Tailwind CSS based):**
    *   **Presentation Design Characteristics:**
        *   Clean, professional slide layouts with generous white space
        *   Strong typography hierarchy for slide titles and content
        *   Strategic use of color to highlight key information
        *   Consistent visual elements and spacing across slides
    *   Color palette recommendations (e.g., "Primary: Deep Blue, Accent: Orange, Background: Clean White")
    *   Font style recommendations (e.g., "Bold sans-serif for slide titles, clean sans-serif for content")
    *   **Theme Implementation Requirements:**
        -   For cyber theme: Dark backgrounds with neon accents, glass-like elements, modern tech aesthetic
        -   For light theme: Clean white/light backgrounds, subtle shadows, minimal professional design

5.  **Interactive & Visual Features:**
    *   **Navigation Requirements:** Specify need for slide navigation (next/previous buttons, slide counter, keyboard shortcuts).
    *   **Visual Enhancements:** Identify slides that need charts, graphs, icons, or other visual elements.
    *   **Animations:** Suggest subtle transition effects between slides for professional presentation flow.`;

const SLIDES_PLAN_OUTPUT_FORMAT_INSTRUCTIONS = `
**Output Format and Language Instructions:**
Provide ONLY the presentation plan as well-formatted, plain text.
Do NOT include any HTML code, markdown formatting (like \`\`\` or # headings for the plan itself), or any explanatory text outside of the requested plan content.
The plan should be directly usable as input for another AI to generate the slide presentation HTML.

**Language Requirements:**
- The plan should be written in Chinese (中文)
- If the original report contains important concepts in languages other than Chinese, include both the Chinese translation and the original language terms in parentheses
- Example: "数据分析 (Data Analysis)" or "用户体验 (User Experience)"
- The plan must specify that the presentation content language should be: {lang}
- The plan must specify that the presentation design theme should be: {theme}

Generated Slides Presentation Plan:`;

// ==============================================
// SLIDES CODE GENERATION PROMPTS
// ==============================================

const SLIDES_CODE_GENERATION_ROLE = `
You are an expert web developer and presentation designer AI.
Your mission is to transform the provided textual report into a compelling slide-based presentation, strictly adhering to the provided Slides Plan.
The presentation should be delivered as a single HTML file with built-in navigation, presenting information in an engaging, slide-by-slide format optimized for storytelling and audience engagement.
`;

const SLIDES_CORE_TASK_AND_PLAN_ADHERENCE = `
**Core Task & Requirements (Guided by the Plan):**

1.  **Adhere to the Plan:** The generated HTML structure, slide content, sequencing, layout, and styling cues MUST be derived from the "Slides Plan to Follow". The original report is for detailed content extraction where the plan refers to it.

2. **Language Requirements:**
    - The presentation content language MUST be based on the language specified in the "Slides Plan to Follow". The plan is the single source of truth for language selection.

3. **Single HTML File Output:**
    - Generate a complete, self-contained HTML file with all slides and navigation functionality.
    - Include all necessary JavaScript for slide navigation within the HTML file.
    - Ensure the presentation works offline without external dependencies (except CDN resources).
`;

const SLIDES_LAYOUT_AND_STRUCTURE = `
4.  **Slide Layout and Structure (as per Plan):**
    *   **HTML Structure:** Create slide sections with unique IDs (e.g., \`<section id="slide-1" class="slide">\`, \`<section id="slide-2" class="slide">\`).
    *   **Slide Dimensions:** Each slide should be designed for full-screen presentation, typically using viewport dimensions.
    *   **Content Layout per Slide:**
        -   **Title Slides:** Large, centered titles with subtitles and minimal additional content
        -   **Content Slides:** Clear slide title at top, organized content below with appropriate spacing
        -   **Data Slides:** Dedicated space for charts/graphs with supporting text
        -   **Summary Slides:** Key points in bullet format or visual callout boxes
    *   **Typography Hierarchy:**
        -   Slide titles: Large, bold fonts (e.g., \`text-4xl lg:text-5xl font-bold\`)
        -   Section headers: Medium fonts (e.g., \`text-2xl lg:text-3xl font-semibold\`)
        -   Body content: Readable fonts (e.g., \`text-lg lg:text-xl\`)
        -   Supporting text: Smaller fonts (e.g., \`text-base lg:text-lg\`)
    *   **Visual Spacing:** Generous padding and margins to avoid cramped appearance (e.g., \`p-8 lg:p-12\`, \`mb-6 lg:mb-8\`).`;

const SLIDES_NAVIGATION_AND_FUNCTIONALITY = `
5.  **Navigation and Functionality:**
    *   **Navigation Component Placeholder:**
        -   You MUST include this exact placeholder in your HTML: \`<!-- NAVIGATION_COMPONENT_PLACEHOLDER -->\`
        -   Place it just before the closing \`</body>\` tag
        -   The navigation component will be automatically injected at this location
        
    *   **Slide Structure Requirements:**
        -   Each slide MUST be a \`<section>\` element with class="slide" and a unique id (e.g., id="slide-1", id="slide-2")
        -   Use min-h-screen and w-full classes for proper slide dimensions
        -   Example: \`<section id="slide-1" class="slide min-h-screen w-full flex flex-col justify-center items-center">\`
        
    *   **Navigation Features (Automatically Provided):**
        -   Next/Previous slide buttons with glassmorphism styling
        -   Slide counter display (e.g., "3 / 12")
        -   Keyboard navigation (arrow keys, space bar, home, end, escape, F for fullscreen)
        -   Touch/swipe support for mobile devices
        -   Fullscreen toggle functionality
        -   Auto-detection of slide sections
        -   Smooth transitions between slides`;

const SLIDES_DESIGN_AND_AESTHETICS = `
6.  **Design and Aesthetics (as per Plan):**
    *   **Theme Implementation:**
        -   For cyber theme: Dark backgrounds (e.g., \`bg-slate-900\`, \`bg-gray-900\`), neon accents, glass-like elements
        -   For light theme: Clean backgrounds (e.g., \`bg-white\`, \`bg-gray-50\`), subtle shadows, professional styling
    *   **Visual Consistency:**
        -   Consistent color scheme across all slides
        -   Uniform spacing and typography treatment
        -   Coherent visual elements and styling patterns
    *   **Professional Presentation Standards:**
        -   High contrast for readability
        -   Appropriate font sizes for presentation viewing
        -   Strategic use of color to highlight key information
        -   Clean, uncluttered slide layouts
    *   **Responsive Design:**
        -   Ensure slides work on different screen sizes
        -   Maintain readability on both desktop and mobile devices
        -   Adapt font sizes and spacing for different viewports`;

const SLIDES_TECHNICAL_REQUIREMENTS = `
7.  **Technical Requirements:**
    *   **HTML Boilerplate:** Include proper DOCTYPE, html lang attribute, head section with title, meta tags, and viewport settings.
    *   **Resource Loading:**
        -   **Tailwind CSS:** \`<script src="https://cdn.tailwindcss.com"></script>\`
        -   **Optional Libraries:** Only include if specifically needed:
            *   Font Awesome for icons: \`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\`
            *   Chart.js for data visualization: \`<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\`
    *   **Performance Optimization:**
        -   Minimize external dependencies
        -   Use efficient CSS transitions
        -   Optimize for smooth slide transitions`;

const SLIDES_CODE_GENERATION_OUTPUT_HEADER = `
Generated Slide Presentation HTML (Based on Report and Plan):`;

// ==============================================
// PUBLIC API FUNCTIONS
// ==============================================

export const generateSlidesPlanPrompt = (reportText: string, settings: PlanSettings): string => {
  // Process the template with settings
  const processedInstructions = processTemplateWithSettings(SLIDES_PLAN_OUTPUT_FORMAT_INSTRUCTIONS, settings);

  return `
${SLIDES_PLAN_GENERATION_ROLE}

**Report to Analyze:**
---
${reportText}
---
${SLIDES_PLAN_REQUIREMENTS_STRUCTURE}
${processedInstructions}
`;
};

export const generateSlidesCodePrompt = (reportText: string, planText: string): string => `

${SLIDES_CODE_GENERATION_ROLE}

**Slides Plan to Follow:**
---
${planText}
---

**Original Report Content (for detailed information):**
---
${reportText}
---
${SLIDES_CORE_TASK_AND_PLAN_ADHERENCE}
${SLIDES_LAYOUT_AND_STRUCTURE}
${SLIDES_NAVIGATION_AND_FUNCTIONALITY}
${SLIDES_DESIGN_AND_AESTHETICS}
${SLIDES_TECHNICAL_REQUIREMENTS}
${HTML_OUTPUT_ONLY_FORMATTING_INSTRUCTIONS}
${SLIDES_CODE_GENERATION_OUTPUT_HEADER}
`;