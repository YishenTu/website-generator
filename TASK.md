# Add Slides Generation + Refactor Prompt Templates

## Overview
Add slides generation capability while maintaining the same plan → approve → generate workflow. Refactor prompt templates into modular files for better maintainability.

## Architecture
- **Same Workflow**: reportText → plan (editable text) → HTML (single file with navigation)
- **Output Types**: webpage (existing) vs slides (new)
- **File Structure**: Break promptTemplates.ts into common, website, slides, and chat modules
- **Navigation**: Reusable vanilla JS component for slide transitions

## Implementation Tasks

### Phase 1: Refactor Prompt Templates (Foundation)

- [x] **Task 1.1**: Create `/src/templates/common.ts`
  - Export `HTML_OUTPUT_ONLY_FORMATTING_INSTRUCTIONS`
  - Export `TAILWIND_STYLING_INSTRUCTIONS`
  - Define `PlanSettings` interface with `outputType: 'webpage' | 'slides'`
  - Add language/theme mapping utility functions

- [x] **Task 1.2**: Create `/src/templates/websitePrompts.ts`
  - Move all existing website plan generation prompts (unchanged)
  - Move all existing website HTML generation prompts
  - Export `generateWebsitePlanPrompt(reportText, settings)` function
  - Export `generateWebsiteCodePrompt(reportText, planText)` function

- [x] **Task 1.3**: Create `/src/templates/slidesPrompts.ts`
  - Create slides plan generation prompt (human-readable slide outline)
  - Create slides HTML generation prompt (single file with navigation)
  - Export `generateSlidesPlanPrompt(reportText, settings)` function
  - Export `generateSlidesCodePrompt(reportText, planText)` function

- [x] **Task 1.4**: Create `/src/templates/chatPrompts.ts`
  - Move `CHAT_SYSTEM_ROLE_AND_CONTEXT`
  - Move `PLAN_CHAT_SYSTEM_INSTRUCTION`
  - Export `getChatSystemInstruction()` and related functions

- [x] **Task 1.5**: Update `/src/templates/promptTemplates.ts`
  - Import from all sub-modules
  - Keep existing public API unchanged
  - Add dispatch logic in `generateWebsitePlanPrompt()` - route based on `outputType`
  - Add dispatch logic in `generateWebsitePromptWithPlan()` - route based on `outputType`

### Phase 2: Slide Navigation Component

- [x] **Task 2.1**: Create `/src/components/slideNavigation.js`
  - Build self-contained vanilla JavaScript navigation script
  - No external dependencies, pure JS + Tailwind CSS
  - Export as string template for injection into HTML

- [x] **Task 2.2**: Add navigation features
  - Next/previous buttons with Tailwind styling
  - Keyboard shortcuts (arrow keys, space, escape)
  - Slide counter display (e.g., "3 / 12")
  - Smooth CSS transitions between slides

- [x] **Task 2.3**: Add slide management
  - Auto-detect slide sections in HTML
  - Hide/show slides with CSS transforms
  - Handle edge cases (first/last slide navigation)
  - Responsive design for mobile devices

- [x] **Task 2.4**: Test navigation component standalone
  - Create sample HTML with multiple slide sections
  - Verify all navigation features work correctly
  - Test keyboard and mouse interactions

### Phase 3: Slides Prompts Design

- [ ] **Task 3.1**: Design slides plan generation prompt
  - Focus on presentation structure and flow
  - Human-readable slide outline with content descriptions
  - Include design notes for each slide (layout, visuals)
  - Specify presentation-appropriate content density

- [ ] **Task 3.2**: Design slides HTML generation prompt
  - Generate single HTML file with slide sections
  - Include navigation component injection instructions
  - Emphasize slide-appropriate visual hierarchy
  - Specify Tailwind CSS classes for presentation styling

- [ ] **Task 3.3**: Include navigation component in HTML template
  - Add instructions to inject slideNavigation.js script
  - Specify proper HTML structure for slides (sections with IDs)
  - Include CSS classes for slide transitions and layout

- [ ] **Task 3.4**: Test prompts with sample inputs
  - Generate sample slide plans from test reports
  - Generate sample slide HTML from test plans
  - Verify output quality and structure

### Phase 4: Integration & Testing

- [ ] **Task 4.1**: Update `useWebsiteGeneration.ts`
  - Modify plan generation call to pass `outputType` from settings
  - No other changes needed - same streaming, same state management
  - Maintain existing AppStage flow: planPending → planReady → htmlPending → htmlReady

- [ ] **Task 4.2**: Test complete slides workflow
  - Input report text → generate slide plan → review plan → generate slides HTML
  - Verify slide navigation works in generated output
  - Test with various report types and lengths

- [ ] **Task 4.3**: Verify website generation unchanged
  - Test existing website generation workflow
  - Ensure no regressions in website output quality
  - Verify all existing features still work (chat, model switching, etc.)

- [ ] **Task 4.4**: Test both output types
  - Switch between webpage and slides in settings
  - Verify plan and HTML generation adapt correctly
  - Test with different themes (cyber vs light) and languages

## File Changes Summary
- **New**: `src/templates/common.ts` (shared utilities)
- **New**: `src/templates/websitePrompts.ts` (website-specific prompts)
- **New**: `src/templates/slidesPrompts.ts` (slides-specific prompts)
- **New**: `src/templates/chatPrompts.ts` (chat-related prompts)
- **New**: `src/components/slideNavigation.js` (navigation component)
- **Modified**: `src/templates/promptTemplates.ts` (orchestrator)
- **Modified**: `src/hooks/useWebsiteGeneration.ts` (pass outputType)

## Key Features
- **Modular Prompts**: Separated concerns with clean file structure
- **Same Workflow**: Familiar plan → approve → generate process
- **Single HTML Output**: One file with built-in slide navigation
- **Reusable Component**: Navigation script works independently
- **Zero Breaking Changes**: Existing website functionality unchanged

## Success Criteria
- [ ] Prompt templates successfully refactored into modular files
- [ ] Slide navigation component works standalone and in generated HTML
- [ ] Slides generation produces high-quality presentation HTML
- [ ] Both webpage and slides output types work correctly
- [ ] No regressions in existing website generation functionality
- [ ] Clean, maintainable code structure for future extensions