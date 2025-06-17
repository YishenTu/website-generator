// ==============================================
// AI Website Generator - Slides-Specific Prompts
// ==============================================
// Prompt templates for slides plan generation and HTML code generation

import { PlanSettings, processTemplateWithSettings, SLIDES_HTML_OUTPUT_INSTRUCTIONS } from './common';

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
        *   **Template Assignment:** Specify which template to use from the 4 canonical options:
            - **TEMPLATE 1 (HERO_SLIDE):** For presentation title, section breaks, author slides
            - **TEMPLATE 2 (CONTENT_SLIDE):** For bullet points, paragraphs, mixed content, data analysis
            - **TEMPLATE 3 (MINIMAL_SLIDE):** For quotes, single statistics, simple statements, key takeaways
            - **TEMPLATE 4 (FULLSCREEN_IMAGE):** For slides with background images and overlay text
        *   Layout rationale explaining why the chosen template fits the slide content and purpose.
    *   **Content Splitting Examples:**
        -   Split "Market Analysis" into "Current Market State" → "Growth Trends" → "Competitive Landscape"
        -   Split "Research Methodology" into "Data Collection" → "Analysis Framework" → "Validation Process"
        -   Ensure each split maintains narrative continuity and logical progression

3.  **Keynote Design Guidelines:**
    *   **Visual Hierarchy:** Each slide should have a clear primary focus with supporting elements.
    *   **Content Density:** Optimize for readability - avoid text-heavy slides, use bullet points and visual elements.
    *   **Slide Transitions:** Consider how slides connect logically to maintain narrative flow.
    *   **Visual Consistency:** Maintain consistent styling, spacing, and typography across all slides.
    *   **Avoid:** 
        -   DO NOT wrap entire slide content in a single large container/box
        -   DO NOT create "card" layouts that encompass the whole slide
        -   DO NOT add unnecessary wrapper divs around template content
        -   Templates already provide proper structure - use them as-is

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
    *   **Chart and Graph Requirements:** Identify slides that need charts, graphs, or data visualization elements.
    *   **Visual Enhancement Needs:** Identify slides that need icons or other visual elements for hierarchy and engagement.
    *   **Animation Requirements:** Suggest subtle transition effects between slides for professional keynote flow.

6.  **Implementation Specifications:**
    *   The plan must specify that the presentation content language should be: {lang}
    *   The plan must specify that the presentation design theme should be: {theme}`;

const SLIDES_PLAN_OUTPUT_FORMAT_INSTRUCTIONS = `
**Output Format and Language Instructions:**
Provide ONLY the keynote plan as well-formatted, plain text.
Do NOT include any HTML code, markdown formatting (like \`\`\` or # headings for the plan itself), or any explanatory text outside of the requested plan content.
The plan should be directly usable as input for another AI to generate the keynote HTML.

**Language Requirements:**
- The plan should be written in Chinese (中文)
- If the original report contains important concepts in languages other than Chinese, include both the Chinese translation and the original language terms in parentheses
- Example: "数据分析 (Data Analysis)" or "用户体验 (User Experience)"

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

1. **Adhere to the Plan:** The generated HTML structure, slide content, sequencing, layout, and styling cues MUST be derived from the "Slides Plan to Follow".

2. **CRITICAL: CONTENT EXTRACTION & ELABORATION**

**The plan provides bullet points as a framework, but you MUST extract detailed content from the original report to create substantial, well-balanced slides:**

- **Extract & Elaborate:** For each bullet point in the plan, find the relevant section in the original report and extract specific details, examples, data, quotes, and explanations
- **Content Density Requirements:** Each slide should have sufficient content for visual balance - avoid slides with just 2-3 brief bullet points
- **Specific Elaboration Guidelines:**
  * Transform brief bullet points into detailed paragraphs with context from the report
  * Include specific data, statistics, examples, and quotes from the original report
  * Add supporting details that weren't mentioned in the plan but exist in the report
  * Provide context and background information to make each slide self-contained
- **Content Quality Standards:**
  * Each content slide should have 4-8 substantial points or 2-4 detailed paragraphs
  * Minimal slides (Template 3) should still have meaningful, elaborated content
  * Use the report's specific language, terminology, and examples
  * Include relevant quotes, statistics, or findings from the report

**Example Transformation:**
- Plan bullet point: "Market analysis shows growth trends"
- Generated slide content: Include specific growth percentages, time periods, market segments, key drivers, comparative data, and supporting evidence from the report

This content extraction is MANDATORY - do not generate sparse slides with only the plan's bullet points.

3. **Template Compliance:** Each slide in the plan specifies a template assignment (TEMPLATE 1, 2, 3, or 4). You MUST use the exact template structure specified in the plan for each slide. Do not deviate from the assigned templates or create custom layouts.

4. **THE GOLDEN RULE: PRESERVE TEMPLATE INTEGRITY**

Your absolute highest priority is to maintain the structural and visual integrity of the 4 canonical templates:
- **DO NOT** alter, add, or remove any Tailwind CSS classes related to layout (e.g., \`flex\`, \`items-center\`, \`justify-center\`, \`w-full\`, \`h-screen\`)
- **DO NOT** use inline \`style="..."\` attributes to control layout, positioning, or visibility  
- **DO NOT** override template CSS with custom styles
- **FAILURE** to follow this rule will break the presentation's core functionality. The layout system is intentionally rigid and must not be changed.

5. **Language Requirements:**
    - The presentation content language MUST be based on the language specified in the "Slides Plan to Follow". The plan is the single source of truth for language selection.
    - DO NOT assume language from report content - ONLY follow the plan's language directive
    - If plan specifies "中文", write all slide content in Chinese
    - If plan specifies "English", write all slide content in English

6. **Single HTML File Output:**
    - Generate a complete, self-contained HTML file with all slides and navigation functionality.
    - Include all necessary JavaScript for slide navigation within the HTML file.
    - Ensure the presentation works offline without external dependencies (except CDN resources).
`;

const SLIDES_LAYOUT_AND_STRUCTURE = `
7. **VISUAL BALANCE & LAYOUT STRUCTURE:**

**Core Principle: Consistent Template-Based Design**
Every slide MUST use one of the 4 canonical templates (see Template System section). This ensures:
- **Title Positioning Consistency:** All content slides have titles in identical positions
- **Content Distribution Balance:** Automatic adaptation to content density without clustering
- **Professional Visual Hierarchy:** Standardized spacing and proportions

**Template Selection Guidelines:**
- **Slide Type Detection:** Analyze slide content to determine appropriate template (see Template System section for detailed rules)

**Visual Balance Enforcement:**
- **Rule of Thirds Application:** Template 2 uses 25% title zone + 75% content zone for optimal balance
- **Automatic Content Centering:** Templates prevent content clustering near top through flex centering
- **Responsive Scaling:** All templates adapt typography and spacing for different screen sizes
- **Overflow Protection:** Content zones include scrolling to prevent layout breakage

**Typography Hierarchy (Applied in Templates):**
- **Hero Titles:** \`text-5xl lg:text-7xl font-bold\` (Template 1)
- **Content Slide Titles:** \`text-4xl lg:text-5xl font-bold\` (Template 2)
- **Section Headers:** \`text-2xl lg:text-3xl font-semibold\`
- **Body Content:** \`text-lg lg:text-xl\`
- **Supporting Text:** \`text-base lg:text-lg\`
- **Captions/Metadata:** \`text-sm lg:text-base text-gray-400\` (use text color, not opacity)

**Spacing System (Built into Templates):**
- **Macro Spacing:** \`space-y-8\` between major content sections
- **Micro Spacing:** \`space-y-6\` within content groups
- **Template Padding:** \`p-16\` for standard slides, \`p-20\` for minimal content
- **Zone Separation:** \`mb-8\` between title and content zones`;

const SLIDES_TEMPLATE_SYSTEM = `
8. **TEMPLATE-BASED LAYOUT SYSTEM:**

**CRITICAL: Use only these 4 canonical slide templates. DO NOT create custom layouts.**

**Template Selection Rules:**
- **Hero/Title slides** (presentation title, section breaks): Use TEMPLATE 1
- **Standard content slides** (bullets, text, mixed content): Use TEMPLATE 2  
- **Minimal content slides** (quotes, single stats, simple statements): Use TEMPLATE 3
- **Image-heavy slides** (full-background images with overlay text): Use TEMPLATE 4

**TEMPLATE 1: HERO_SLIDE (Perfect Center)**
\`\`\`html
<section id="slide-X" class="slide h-screen w-full flex items-center justify-center">
  <!-- TEMPLATE 1: This layout REQUIRES 'flex items-center justify-center' for perfect centering. Do NOT add position:absolute/fixed. -->
  <div class="text-center max-w-5xl mx-auto space-y-6 px-8">
    <h1 class="text-5xl lg:text-7xl font-bold">[MAIN TITLE HERE]</h1>
    <h2 class="text-2xl lg:text-4xl text-gray-200">[SUBTITLE HERE]</h2>
    <p class="text-lg lg:text-xl text-gray-400">[AUTHOR/CONTEXT HERE]</p>
  </div>
</section>
\`\`\`

**TEMPLATE 2: CONTENT_SLIDE (Two-Zone System)**
\`\`\`html
<section id="slide-X" class="slide min-h-screen w-full flex flex-col p-16">
  <!-- TEMPLATE 2: This layout uses flex-column structure. Do not modify the classes on this <section> tag. -->
  <!-- Title Zone: Fixed height for consistency -->
  <div class="h-[25%] flex items-center border-b border-gray-600 border-opacity-30 mb-8">
    <h2 class="text-4xl lg:text-5xl font-bold">[SLIDE TITLE HERE]</h2>
  </div>
  
  <!-- Content Zone: Flexible, auto-adjusting -->
  <div class="flex-grow flex flex-col justify-center overflow-y-auto">
    <div class="space-y-6 lg:space-y-8">
      [SLIDE CONTENT HERE - bullets, paragraphs, etc.]
    </div>
  </div>
</section>
\`\`\`

**TEMPLATE 3: MINIMAL_SLIDE (Centered Content)**
\`\`\`html
<section id="slide-X" class="slide min-h-screen w-full flex items-center justify-center p-20">
  <!-- TEMPLATE 3: This layout REQUIRES 'flex items-center justify-center' for perfect centering. Do NOT add position:absolute/fixed. -->
  <div class="text-center max-w-4xl mx-auto space-y-8">
    [CENTERED CONTENT HERE - quote, statistic, or statement]
  </div>
</section>
\`\`\`

**TEMPLATE 4: FULLSCREEN_IMAGE (Overlay Design)**
\`\`\`html
<section id="slide-X" class="slide min-h-screen w-full relative">
  <!-- TEMPLATE 4: This layout uses 'relative' positioning for overlays. Do not modify the classes on this <section> tag. -->
  [BACKGROUND IMAGE OR GRADIENT HERE - use absolute inset-0 for full coverage]
  <div class="absolute top-8 left-8 p-6 rounded-lg max-w-md" style="background-color: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px);">
    <h2 class="text-2xl lg:text-3xl font-bold text-white mb-2">[OVERLAY TITLE HERE]</h2>
    <p class="text-lg text-gray-200">[OVERLAY SUBTITLE HERE]</p>
  </div>
</section>
\`\`\`

`;

const SLIDES_NAVIGATION_AND_FUNCTIONALITY = `
9.  **Navigation and Functionality:**
    *   **Navigation Component Placeholder:**
        -   You MUST include this exact placeholder in your HTML: \`<!-- NAVIGATION_COMPONENT_PLACEHOLDER -->\`
        -   Place it just before the closing \`</body>\` tag
        -   DO NOT generate any navigation HTML, CSS, or JavaScript (buttons, event listeners, navigation scripts, slide counters, etc.)
        -   DO NOT include any slide navigation code in \`<script>\` tags
        -   The navigation system is COMPLETELY handled by an external component
        
    *   **Slide Structure Requirements:**
        -   Each slide MUST be a \`<section>\` element with class="slide" and a unique id (e.g., id="slide-1", id="slide-2")
        -   First slide MUST have class="slide slide-active" (both classes)
        -   All other slides MUST have only class="slide" (without slide-active)
        -   Use min-h-screen and w-full classes for proper slide dimensions
        -   Your ONLY responsibility is the slide structure - navigation is handled automatically`;

const SLIDES_DESIGN_AND_AESTHETICS = `
10. **Design and Aesthetics (as per Plan):**
    *   **Theme Implementation:**
        -   For cyber theme: Primarily dark backgrounds (e.g., \`bg-black\`, \`bg-slate-900\`, \`bg-gray-900\`, \`bg-slate-800\`) with bright contrasting text and vibrant accent colors
        -   For light theme: Clean backgrounds (e.g., \`bg-white\`, \`bg-gray-50\`), subtle shadows, professional styling
    *   **CSS Compatibility Requirements:**
        -   **AVOID** Tailwind opacity syntax like \`bg-black/70\` or \`text-white/90\` - use standard CSS colors instead
        -   **AVOID** \`backdrop-blur-sm\` class - use inline style \`style="backdrop-filter: blur(4px);"\` for better compatibility
        -   **USE** \`text-gray-200\` instead of \`text-white/90\` for semi-transparent text
        -   **USE** \`style="background-color: rgba(0, 0, 0, 0.7);"\` instead of \`bg-black/70\`
    *   **Visual Consistency:**
        -   Consistent color scheme across all slides
        -   Uniform spacing and typography treatment
        -   Coherent visual elements and styling patterns
    *   **Professional Presentation Standards:**
        -   High contrast for readability
        -   Appropriate font sizes for keynote viewing
        -   Strategic use of color to highlight key information
        -   Clean, uncluttered slide layouts
    *   **Icon Usage Guidelines:**
        -   Use Font Awesome icons with correct class format: \`<i class="fas fa-icon-name"></i>\`
        -   Common icons: fa-check, fa-arrow-right, fa-lightbulb, fa-chart-line, fa-users
        -   For brand icons use \`fab\` prefix: \`<i class="fab fa-github"></i>\`
        -   Always verify icon names exist in Font Awesome 6.4.0
    *   **Responsive Design:**
        -   Ensure slides work on different screen sizes
        -   Maintain readability on both desktop and mobile devices
        -   Adapt font sizes and spacing for different viewports`;

const SLIDES_CSS_JAVASCRIPT_CONSISTENCY = `
11. **CRITICAL CSS & JAVASCRIPT REQUIREMENTS:**

    **Slide Visibility Control:**
    This is the most critical technical requirement. Failure to follow this will break the entire keynote.
    - You MUST control slide visibility using CSS classes ONLY (\`slide-active\`)
    - You MUST NOT use JavaScript to set \`style.display\` - only use CSS classes (\`slide-active\`)
    
    **WARNING: See "GOLDEN RULE" section above for layout positioning requirements.**

    **Required CSS for Functionality:**
    You MUST include these exact, unmodified CSS rules in your \`<style>\` section. Do not add or change them:

    \`\`\`css
    /* --- CORE SLIDE VISIBILITY RULES (DO NOT CHANGE) --- */
    .slide {
        display: none;
        width: 100vw;
        height: 100vh;
        /* DO NOT ADD 'position: absolute;' HERE - it breaks flexbox centering */
    }
    .slide.slide-active {
        display: flex;
        /* DO NOT ADD 'position: absolute;' HERE - it breaks flexbox centering */
    }
    /* --- END CORE RULES --- */

    /* Template-specific enhancements for visual balance */
    .slide h1, .slide h2 {
        line-height: 1.1;
        letter-spacing: -0.02em;
    }
    .slide .space-y-6 > * + * {
        margin-top: 1.5rem;
    }
    .slide .space-y-8 > * + * {
        margin-top: 2rem;
    }
    /* Responsive height adjustments for better balance */
    @media (max-height: 600px) {
        .slide .h-\[25\%\] { min-height: 120px; }
    }
    \`\`\`
    
    **CSS Class Naming Convention:**
    *   **Active Slide Control:** Use ONLY \`slide-active\` class to match navigation component
        -   The navigation component automatically adds/removes \`slide-active\` class
        -   DO NOT manually control visibility with JavaScript or inline styles
    
    Without these exact rules, navigation will fail and layouts will be broken.`;

const SLIDES_TECHNICAL_REQUIREMENTS = `
12. **Technical Requirements:**
    *   **HTML Boilerplate:** Include proper DOCTYPE, html lang attribute, head section with title, meta tags, and viewport settings.
    *   **Body Tag Restrictions:**
        -   DO NOT add \`overflow-hidden\` to body tag - it interferes with navigation
        -   Keep body tag simple with only theme colors: \`<body class="bg-gray-900 text-gray-100">\`
    *   **Required Resources in \`<head>\` section:**
        -   **Tailwind CSS:** \`<script src="https://cdn.tailwindcss.com"></script>\`
        -   **Font Awesome:** \`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\`
        -   **Optional:** Chart.js only if data visualization needed: \`<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\`
    *   **Common Pitfalls to AVOID:**
        -   DO NOT use typewriter animation on long titles - they will be cut off
        -   DO NOT mix \`opacity-70\` and \`text-opacity-80\` - use consistent opacity approach
        -   DO NOT create custom slide transitions or animations
        -   DO NOT add hover effects on slide content (navigation handles interactions)
        -   DO NOT use \`z-index\` on slides (CSS rules handle this)
    *   **Performance Optimization:**
        -   Minimize external dependencies
        -   Use efficient CSS transitions
        -   Optimize for smooth slide transitions`;

const SLIDES_CODE_GENERATION_OUTPUT_HEADER = `
**Final Checklist (Verify Before Generating):**
- [ ] First slide has class="slide slide-active"
- [ ] All other slides have only class="slide"
- [ ] No custom navigation code or scripts
- [ ] Using correct template for each slide as specified in plan
- [ ] No position:absolute on slide elements
- [ ] Placeholder \`<!-- NAVIGATION_COMPONENT_PLACEHOLDER -->\` before \`</body>\`
- [ ] Correct language as specified in plan
- [ ] No typewriter animations on long text
- [ ] Consistent color/opacity usage

Generated Slide Keynote HTML (Based on Report and Plan), Do not hold back, give me the best you can do:`;

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
${SLIDES_TEMPLATE_SYSTEM}
${SLIDES_NAVIGATION_AND_FUNCTIONALITY}
${SLIDES_DESIGN_AND_AESTHETICS}
${SLIDES_CSS_JAVASCRIPT_CONSISTENCY}
${SLIDES_TECHNICAL_REQUIREMENTS}
${SLIDES_HTML_OUTPUT_INSTRUCTIONS}
${SLIDES_CODE_GENERATION_OUTPUT_HEADER}
`;