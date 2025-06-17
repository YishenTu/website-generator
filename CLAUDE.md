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
- `./scripts/deploy.sh` - Automated deployment with Docker (checks environment, creates .env, builds, and starts containers)
- Deploys to port 8080 via nginx proxy
- `docker-compose up -d` - Start containers in background
- `docker-compose down` - Stop and remove containers
- `docker-compose logs -f` - View container logs

## Architecture

This is a React-based AI website generator that transforms text reports into complete websites or interactive presentation slides using multiple AI models.

### Key Components Architecture
- **App.tsx** - Main component with stage management (initial → planPending → planReady → htmlPending → htmlReady)
- **useWebsiteGeneration** & **useOptimizedWebsiteGeneration** hooks - Core business logic managing the entire generation workflow and state
- **AppStages.tsx** - Renders different UI stages based on current app state
- **aiService.ts** - Unified AI service layer that routes requests to Gemini, OpenRouter, or OpenAI based on model selection
- **Output Types** - Supports both website generation and interactive presentation slides

### Service Layer Pattern
The app uses a service abstraction pattern where:
- Each AI provider has its own service file (geminiService.ts, openrouterService.ts, openaiService.ts)
- aiService.ts provides a unified interface using model dispatch pattern
- Stream processing is handled uniformly across all providers via streamRequest.ts

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

### Component Architecture
- Follow the stage-based component pattern in src/components/stages/
- Use custom hooks for complex state management
- Implement proper loading states and error boundaries
- Maintain consistent UI patterns across all stages

### Performance Considerations
- Use React.memo for frequently re-rendered components
- Implement debouncing for user input (useDebounce hook)
- Use lazy loading for heavy components
- Optimize bundle size with proper imports
- Preview iframe loading optimization: Uses minimum loading times and fallback mechanisms to prevent blank white screens when content is first generated