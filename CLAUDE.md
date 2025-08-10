# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server on port 5173 (user will run manually)
- `npm run build` - Build production version to `dist/`
- `npm run preview` - Preview production build

### Important Notes
- DO NOT run `npm run dev` automatically - the user will start the development server manually when needed

### TypeScript Configuration
- Uses TypeScript 5.7.2 with strict mode enabled
- Vite 6.2.0 as build tool
- React 19.1.0 and TypeScript strict configuration
- No path aliases configured (uses relative imports)

### Docker
- `cd docker && ./docker-run.sh` - Build and deploy Docker container (runs on port 8080)
- Container runs directly without nesting in Docker Desktop
- Docker files are organized in `docker/` folder:
  - `Dockerfile` - Multi-stage build configuration
  - `nginx.conf` - Nginx server configuration (listens on port 8080)
  - `docker-compose.yml` - Docker compose configuration (if needed)
  - `docker-run.sh` - Deployment script that avoids container nesting
- Useful Docker commands:
  - `docker logs ai-website-generator` - View container logs
  - `docker stop ai-website-generator` - Stop container
  - `docker restart ai-website-generator` - Restart container

## Architecture

This is a React-based AI website generator that transforms text reports into complete websites or interactive presentation slides using multiple AI models.

### Key Components Architecture
- **App.tsx** - Main component with stage management (initial → planPending → planReady → htmlPending → htmlReady)
- **useWebsiteGeneration** & **useOptimizedWebsiteGeneration** hooks - Core business logic managing the entire generation workflow and state
- **AppStages.tsx** - Renders different UI stages based on current app state
- **aiService.ts** - Unified AI service layer that routes requests to Gemini, OpenRouter, or OpenAI based on model selection
- **Output Types** - Supports both website generation and interactive presentation slides
- **Max Thinking** - Enhanced reasoning mode for GPT-5, Claude, and DeepSeek models with adjustable effort levels

### Service Layer Pattern
The app uses a service abstraction pattern where:
- Each AI provider has its own service file:
  - **geminiService.ts** - Google Gemini models integration
  - **openrouterService.ts** - OpenRouter for Claude, DeepSeek, GPT-4, etc.
  - **openaiService.ts** - OpenAI Responses API for GPT-5 with reasoning effort control
- aiService.ts provides a unified interface using model dispatch pattern
- Stream processing handles both Chat Completions API and Responses API formats via streamHandler.ts

### State Management Pattern
- Uses custom hooks for complex state (useWebsiteGeneration, useBufferedUpdater)
- AppStage enum drives UI rendering: 'initial' | 'planPending' | 'planReady' | 'htmlPending' | 'htmlReady'
- Chat sessions are managed through ChatSession interface with provider-specific implementations
- Error boundaries provide app-level error handling

### Generation Workflow
1. Report input → Choose output type (website or slides) → Plan generation (streaming)
2. Plan editing/refinement via chat (optional)
3. Plan → HTML/Slides generation (streaming) with output type-specific templates
4. HTML/Slides refinement via chat (optional)

### Environment Configuration
- API keys for GEMINI_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY
- Environment validation on startup via envValidator.ts
- Defaults are automatically selected based on available API keys

### File Organization
- `src/components/` - React components and utility functions
  - `src/components/stages/` - Stage-specific workflow components
  - `src/components/icons/` - Icon components
- `src/hooks/` - Custom React hooks (useWebsiteGeneration, useOptimizedWebsiteGeneration, useDebounce, etc.)
- `src/services/` - AI service integrations (aiService, geminiService, openaiService, openrouterService)
- `src/utils/` - Shared utilities (constants, logging, error handling, styling, HTML processing)
- `src/types/` - TypeScript type definitions
- `src/templates/` - AI prompt templates (websitePrompts, slidesPrompts, chatPrompts)
- `src/contexts/` - React contexts (AppContext, ConfirmationContext)
- `src/constants/` - Internationalization and constants

### Styling System
- Uses Tailwind CSS with centralized style constants in styleConstants.ts
- Linear App-inspired design with vertical flow layout
- Responsive grid layout that adapts based on app stage
- Cyberpunk aesthetic with icy blue color scheme
- Custom fonts: Orbitron (cyberpunk titles), Rajdhani (subtitles), Space Mono, Exo 2
- Enhanced visual effects: gradient animations, glow effects, neon styling

## Development Guidelines

### Code Quality Standards
- TypeScript strict mode enabled with comprehensive linting rules
- All components should use proper TypeScript typing
- Follow existing code patterns and conventions
- Use centralized constants from styleConstants.ts and constants.ts
- Implement proper error handling with ErrorBoundary components

### Testing
- Check for existing test commands in package.json before running tests
- Use `npm run build` to verify TypeScript compilation
- Test with multiple AI models to ensure compatibility

### Linting and Type Checking
- Run `npm run build` to check for TypeScript errors
- Follow strict linting rules: noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch
- Ensure all imports are properly typed and available

### AI Integration Best Practices
- Always validate API keys through envValidator.ts
- Use the unified aiService.ts interface for AI calls
- Implement proper stream handling for real-time responses
- Handle rate limiting and error responses gracefully
- OpenAI GPT-5 specific:
  - Uses Responses API endpoint (`/v1/responses`) instead of Chat Completions
  - Supports `reasoning_effort` parameter: 'low', 'medium' (default), 'high'
  - Stream events format: `response.output_text.delta` with text in `delta` field
  - Role mapping: 'developer' role for system instructions

### Component Architecture
- Follow the stage-based component pattern in src/components/stages/
- Use custom hooks for complex state management
- Implement proper loading states and error boundaries
- Maintain consistent UI patterns across all stages

### Performance Considerations
- Prefer React.memo with custom comparators for frequently re-rendered components (OutputDisplay, ChatPanel, ModelSelector already memoized)
- Debounce rapid interactions (useDebounce, useStateDebouncer hooks)
- Lazy-load heavy components: `SettingsSidebar` and `CodeEditor` use `React.lazy` + Suspense fallbacks
- Keep Suspense skeletons lightweight to avoid layout shifts and FOUC
- Optimize bundle size; avoid re-introducing global backdrop-blur and heavy shadows
- Preview iframe: rely on re-mounting and simple load handlers; avoid injecting heavy scripts

### Recent Optimizations (Do Not Regress)
- Performance Mode with three levels (HQ/BAL/PERF) persisted to localStorage and honoring `prefers-reduced-motion`.
- Backdrop-blur limited to critical UI; static glass alternatives elsewhere.
- Animation throttling via IntersectionObserver; strategic `will-change` usage.
- Transition and shadow simplifications focusing on GPU-friendly properties.
- Removed standalone `docs/` reports; performance notes are consolidated in README.
