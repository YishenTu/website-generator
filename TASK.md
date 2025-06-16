# Settings Sidebar Implementation Tasks

## Overview
Implementation of permanent settings sidebar for the AI website generator with theme and language controls.

## Architecture
- **Settings Flow**: UI → Plan Generation (with settings) → Website Generation (follows plan)
- **Language Architecture**: English prompts → Chinese plans (with embedded settings) → Website content (based on user language setting)
- **Layout**: CSS Grid with conditional rendering (Input tab = Settings, Other tabs = Chat)

## Implementation Tasks

### Phase 1: State Management & Persistence
- [ ] **Task 1**: Extend AppContext with theme and language state
  - Add `theme: 'cyber' | 'light'` and `language: 'default' | 'en' | 'zh'` to AppState
  - Add SET_THEME, SET_LANGUAGE reducer actions
  
- [ ] **Task 2**: Add localStorage persistence for settings
  - Save settings to localStorage on change
  - Restore settings from localStorage on app mount
  
- [ ] **Task 3**: Add useApp selectors for theme and language
  - Create `useAppTheme()` and `useAppLanguage()` selector hooks

### Phase 2: Layout & Components
- [ ] **Task 4**: Update App.tsx layout to use CSS Grid
  - Implement `grid-template-columns: 1fr 300px` layout
  - Fixed width sidebar column to prevent layout shifts
  
- [ ] **Task 5**: Implement conditional rendering for SettingsSidebar vs ChatPanel
  - Input tab: Show SettingsSidebar
  - Other tabs: Show ChatPanel (if isRefineMode)
  - Ensure clean ChatPanel unmounting when switching to Input
  
- [ ] **Task 6**: Create SettingsSidebar component with theme/language controls
  - Theme row: cyber/light toggle buttons
  - Language row: default/english/chinese selection buttons
  - Match existing cyberpunk aesthetic
  - Width: w-80 (same as chat panel)
  
- [ ] **Task 7**: Add Apply & Regenerate button to SettingsSidebar
  - UI feedback showing current settings
  - Explicit user control for triggering regeneration

### Phase 3: Prompt Template Updates
- [ ] **Task 8**: Modify generateWebsitePlanPrompt to accept settings parameter
  - Change function signature: `generateWebsitePlanPrompt(reportText: string, settings: {theme: string, language: string})`
  
- [ ] **Task 9**: Add theme and language instructions to plan generation prompt
  - Theme instructions: cyber (玻璃态设计风格) vs light (简洁明亮设计风格)
  - Language instructions: default (检测报告语言) vs en (英文) vs zh (中文)
  - Instructions written in English prompts, resulting in Chinese plan

### Phase 4: Service Layer Updates
- [ ] **Task 10**: Update AI service plan generation functions to pass settings
  - Modify `generateWebsitePlan()` in aiService.ts
  - Update service implementations (geminiService.ts, openrouterService.ts, openaiService.ts)
  - Pass settings to prompt template

### Phase 5: Hook Integration
- [ ] **Task 11**: Update useWebsiteGeneration hook to consume settings from AppContext
  - Consume theme/language from AppContext using selectors
  - Pass settings to plan generation functions (not website generation)
  - Add settings to useCallback dependencies
  
- [ ] **Task 12**: Wire up Apply & Regenerate functionality in useWebsiteGeneration
  - Connect SettingsSidebar button to plan regeneration
  - Ensure settings are applied when user triggers regeneration

### Phase 6: Testing & Validation
- [ ] **Task 13**: Test settings integration and plan generation
  - Verify theme settings appear in generated Chinese plans
  - Verify language settings affect final website content
  - Test localStorage persistence across sessions
  - Test layout behavior when switching tabs

## File Changes Summary
- **Modified**: `src/contexts/AppContext.tsx` (settings state + persistence)
- **Modified**: `src/App.tsx` (CSS Grid layout, conditional rendering)
- **New**: `src/components/SettingsSidebar.tsx` (settings UI)
- **Modified**: `src/templates/promptTemplates.ts` (plan generation prompt)
- **Modified**: `src/services/*Service.ts` (plan generation functions)
- **Modified**: `src/hooks/useWebsiteGeneration.ts` (settings integration)

## Key Features
- **Theme Control**: cyber (glassmorphism/neon) vs light (clean/minimal)
- **Language Control**: default (detect from report) vs en vs zh
- **Persistent Settings**: localStorage saves preferences across sessions
- **Single Source of Truth**: Settings embedded in Chinese plan for website generation
- **Layout Stability**: CSS Grid prevents content shifts when switching tabs

## Success Criteria
- [ ] Settings sidebar appears only on Input tab
- [ ] Chat panel appears on other tabs when isRefineMode is true
- [ ] Theme and language settings persist across sessions
- [ ] Settings are correctly embedded in generated Chinese plans
- [ ] Website generation follows plan instructions including user preferences
- [ ] Layout remains stable when switching between tabs