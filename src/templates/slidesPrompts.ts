// ==============================================
// AI Website Generator - Slides-Specific Prompts
// ==============================================
// Prompt templates for slides plan generation and HTML code generation

import { PlanSettings, processTemplateWithSettings, HTML_OUTPUT_ONLY_FORMATTING_INSTRUCTIONS } from './common';

// ==============================================
// SLIDES PLAN GENERATION PROMPTS
// ==============================================

const SLIDES_PLAN_GENERATION_ROLE = `
You are an expert keynote design planner and content strategist AI.
Your task is to analyze the following textual report and generate a clear, concise textual plan for a slide-based keynote. This keynote should transform the report's information into an engaging, easy-to-follow slide deck optimized for storytelling and audience engagement.`;

const SLIDES_PLAN_REQUIREMENTS_STRUCTURE = `
**Slides Plan Requirements:**

The plan should be structured for keynote flow and audience engagement. Please outline the following:

1.  **Keynote Theme & Objective:**
    *   Briefly describe the main purpose and visual style/theme of the keynote (e.g., "Professional business analysis keynote," "Educational research showcase," "Product feature walkthrough").
    *   Define the target audience and keynote context.

2.  **Slide Structure & Flow:**
    *   Create a logical slide sequence that tells a compelling story.
    *   **Content Organization Rules:**
        -   **One Concept Per Slide:** Each slide should present one main concept or logical grouping
        -   **Semantic Content Splitting:** When topics are complex, split by natural topic boundaries that preserve narrative flow
        -   **Context Preservation:** Each slide should provide sufficient context to stand alone while connecting to the overall story
    *   For each slide, provide:
        *   A clear, descriptive slide title (e.g., "Executive Summary," "Key Insights," "Data Analysis - Q1 Results," "Methodology Overview," "Next Steps & Recommendations").
        *   A bullet-point summary of the main content points for that slide. Ensure logical completeness - each slide should tell a complete sub-story.
        *   Design notes for the slide layout (e.g., "Split layout with chart on left, key points on right," "Hero slide with centered title and subtitle," "Grid layout for statistics").
    *   **Content Splitting Examples:**
        -   Split "Market Analysis" into "Current Market State" → "Growth Trends" → "Competitive Landscape"
        -   Split "Research Methodology" into "Data Collection" → "Analysis Framework" → "Validation Process"
        -   Ensure each split maintains narrative continuity and logical progression

3.  **Keynote Design Guidelines:**
    *   **Visual Hierarchy:** Each slide should have a clear primary focus with supporting elements.
    *   **Content Density:** Optimize for readability - avoid text-heavy slides, use bullet points and visual elements.
    *   **Slide Transitions:** Consider how slides connect logically to maintain narrative flow.
    *   **Visual Consistency:** Maintain consistent styling, spacing, and typography across all slides.
    *   **Avoid:** DO NOT create single large boxes for entire sections or one box per section. DO NOT make large box backgrounds (like one large bento grid card) that encompass entire content areas.

4.  **Styling & Visual Notes (Tailwind CSS based):**
    *   **Presentation Design Characteristics:**
        *   Clean, professional slide layouts with generous white space
        *   Strong typography hierarchy for slide titles and content
        *   Strategic use of color to highlight key information
        *   Consistent visual elements and spacing across slides
    *   Color palette should align with the specified design theme: {theme}
    *   Font style recommendations (e.g., "Bold sans-serif for slide titles, clean sans-serif for content")
    *   **Theme Implementation Requirements:**
        -   For cyber theme: Primarily dark backgrounds (blacks, deep grays, dark blues) with contrasting bright text and neon accent colors for highlights
        -   For light theme: Clean white/light backgrounds, subtle shadows, minimal professional design

5.  **Interactive & Visual Features:**
    *   **Visual Enhancements:** Identify slides that need charts, graphs, icons, or other visual elements.
    *   **Animations:** Suggest subtle transition effects between slides for professional keynote flow.`;

const SLIDES_PLAN_OUTPUT_FORMAT_INSTRUCTIONS = `
**Output Format and Language Instructions:**
Provide ONLY the keynote plan as well-formatted, plain text.
Do NOT include any HTML code, markdown formatting (like \`\`\` or # headings for the plan itself), or any explanatory text outside of the requested plan content.
The plan should be directly usable as input for another AI to generate the keynote HTML.

**Language Requirements:**
- The plan should be written in Chinese (中文)
- If the original report contains important concepts in languages other than Chinese, include both the Chinese translation and the original language terms in parentheses
- Example: "数据分析 (Data Analysis)" or "用户体验 (User Experience)"
- The plan must specify that the keynote content language should be: {lang}
- The plan must specify that the keynote design theme should be: {theme}

Generated Slides Keynote Plan:`;

// ==============================================
// SLIDES CODE GENERATION PROMPTS
// ==============================================

const SLIDES_CODE_GENERATION_ROLE = `
You are an expert web developer and keynote designer AI.
Your mission is to transform the provided textual report into a compelling slide-based keynote, strictly adhering to the provided Slides Plan.
The keynote should be delivered as a single HTML file with built-in navigation, presenting information in an engaging, slide-by-slide format optimized for storytelling and audience engagement.
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
    *   **Slide Dimensions:** Each slide should be designed for full-screen keynote delivery, typically using viewport dimensions.
    *   **Content Layout per Slide:**
        -   **Title Slides:** Large, centered titles with subtitles and minimal additional content
        -   **Content Slides:** Clear slide title at top, organized content below with appropriate spacing
        -   **Data Slides:** Dedicated space for charts/graphs with supporting text
        -   **Summary Slides:** Key points in bullet format or visual callout boxes
    *   **Content Encapsulation:** Wrap primary slide content (after title) in \`<div class="slide-content">\` for consistent styling.
    *   **Typography Hierarchy:**
        -   Slide titles: Large, bold fonts (e.g., \`text-4xl lg:text-5xl font-bold\`)
        -   Section headers: Medium fonts (e.g., \`text-2xl lg:text-3xl font-semibold\`)
        -   Body content: Readable fonts (e.g., \`text-lg lg:text-xl\`)
        -   Supporting text: Smaller fonts (e.g., \`text-base lg:text-lg\`)
    *   **Visual Spacing:** Generous padding and margins to avoid cramped appearance (e.g., \`p-8 lg:p-12\`, \`mb-6 lg:mb-8\`).`;

const SLIDES_VISUAL_IMPLEMENTATION_RULES = `
4.5  **Visual Implementation and Layout Balance:**
    *   **Content Density Management:**
        -   **Visual Scan Test:** Content should comfortably fit within a single screen view without scrolling
        -   **Breathing Room:** Maintain generous whitespace - content should never feel cramped or overwhelming
        -   **Hierarchical Structure:** Organize content with clear visual hierarchy (main points → supporting details → examples)
        
    *   **Layout Adaptation Patterns:**
        -   **Sparse Content:** If slide contains only title + single concept, add \`layout-center-vertical\` class to section for vertical centering
        -   **Standard Content:** Use default top-aligned layout with proper spacing progression
        -   **Dense Content:** Apply hierarchical grouping and generous spacing to prevent visual overcrowding
        
    *   **Content Encapsulation Structure:**
        -   Wrap primary slide content (after title) in \`<div class="slide-content">\` for consistent styling and layout control
        -   This enables CSS-based centering and distribution without complex AI layout decisions
        
    *   **Visual Balance Guidelines:**
        -   **Flow Direction:** Content should flow naturally downward from title area, not cluster in corners
        -   **Spacing Consistency:** Use semantic HTML tags (\`<p>\`, \`<ul>\`, \`<blockquote>\`) for natural vertical spacing
        -   **Avoid Manual Spacing:** Do not use multiple \`<br>\` tags - proper CSS handles margins on elements
        
    *   **Implementation Self-Check:** Before finalizing each slide, verify: "Does this slide have comfortable visual spacing and clear hierarchy? Is content properly distributed without overcrowding?"`

const SLIDES_NAVIGATION_AND_FUNCTIONALITY = `
5.  **Navigation and Functionality:**
    *   **Navigation Component Placeholder:**
        -   You MUST include this exact placeholder in your HTML: \`<!-- NAVIGATION_COMPONENT_PLACEHOLDER -->\`
        -   Place it just before the closing \`</body>\` tag
        -   DO NOT generate any navigation HTML, CSS, or JavaScript (buttons, event listeners, etc.)
        
    *   **Slide Structure Requirements:**
        -   Each slide MUST be a \`<section>\` element with class="slide" and a unique id (e.g., id="slide-1", id="slide-2")
        -   Use min-h-screen and w-full classes for proper slide dimensions
        -   Your ONLY responsibility is the slide structure - navigation is handled automatically`;

const SLIDES_DESIGN_AND_AESTHETICS = `
6.  **Design and Aesthetics (as per Plan):**
    *   **Theme Implementation:**
        -   For cyber theme: Primarily dark backgrounds (e.g., \`bg-black\`, \`bg-slate-900\`, \`bg-gray-900\`, \`bg-slate-800\`) with bright contrasting text and vibrant accent colors
        -   For light theme: Clean backgrounds (e.g., \`bg-white\`, \`bg-gray-50\`), subtle shadows, professional styling
    *   **Visual Consistency:**
        -   Consistent color scheme across all slides
        -   Uniform spacing and typography treatment
        -   Coherent visual elements and styling patterns
    *   **Professional Presentation Standards:**
        -   High contrast for readability
        -   Appropriate font sizes for keynote viewing
        -   Strategic use of color to highlight key information
        -   Clean, uncluttered slide layouts
    *   **Responsive Design:**
        -   Ensure slides work on different screen sizes
        -   Maintain readability on both desktop and mobile devices
        -   Adapt font sizes and spacing for different viewports`;

const SLIDES_CSS_JAVASCRIPT_CONSISTENCY = `
7.  **🚨 CRITICAL: CSS and JavaScript Consistency Requirements:**
    
    **CSS Class Naming Convention:**
    *   **Active Slide Control:** Use ONLY \`slide-active\` class to match navigation component
        -   CSS: \`.slide.slide-active { /* optional active slide styles */ }\`
        -   The navigation component automatically adds/removes \`slide-active\` class
    
    **Slide Visibility Control Method:**
    *   **The navigation component uses \`display\` property** for slide visibility control
        -   Navigation sets \`style.display = 'block'\` for visible slides
        -   Navigation sets \`style.display = 'none'\` for hidden slides
        -   Your CSS should work with this display-based approach
    
    **Required CSS Structure (Compatible with Navigation Component):**
    \`\`\`css
    .slide {
        /* Base slide styles - navigation will control display */
        width: 100vw;
        height: 100vh;
        /* DO NOT set display: none here - navigation controls it */
    }
    .slide.slide-active {
        /* Optional: additional styles for active slide */
        /* The navigation already handles display: block */
    }
    \`\`\``;

const SLIDES_TECHNICAL_REQUIREMENTS = `
8.  **Technical Requirements:**
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
Generated Slide Keynote HTML (Based on Report and Plan):`;

// ==============================================
// PUBLIC API FUNCTIONS
// ==============================================

export const generateSlidesPlanPrompt = (reportText: string, settings: PlanSettings): string => {
  // Process the templates with settings
  const processedInstructions = processTemplateWithSettings(SLIDES_PLAN_OUTPUT_FORMAT_INSTRUCTIONS, settings);
  const processedRequirements = processTemplateWithSettings(SLIDES_PLAN_REQUIREMENTS_STRUCTURE, settings);

  return `
${SLIDES_PLAN_GENERATION_ROLE}

**Report to Analyze:**
---
${reportText}
---
${processedRequirements}
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
${SLIDES_VISUAL_IMPLEMENTATION_RULES}
${SLIDES_NAVIGATION_AND_FUNCTIONALITY}
${SLIDES_DESIGN_AND_AESTHETICS}
${SLIDES_CSS_JAVASCRIPT_CONSISTENCY}
${SLIDES_TECHNICAL_REQUIREMENTS}
${HTML_OUTPUT_ONLY_FORMATTING_INSTRUCTIONS}
${SLIDES_CODE_GENERATION_OUTPUT_HEADER}
`;