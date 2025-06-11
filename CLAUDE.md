# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server on port 3000 (user will run manually)
- `npm run build` - Build production version to `dist/`
- `npm run preview` - Preview production build

### Important Notes
- DO NOT run `npm run dev` automatically - the user will start the development server manually when needed

### TypeScript Configuration
- Uses TypeScript 5.7 with strict mode enabled
- Path aliases configured: `@/*` maps to project root
- Includes strict linting options: noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch, noUncheckedIndexedAccess

### Docker
- `./scripts/deploy.sh` - Automated deployment with Docker (checks environment, creates .env, builds, and starts containers)
- `docker-compose up -d` - Start containers in background
- `docker-compose down` - Stop and remove containers
- `docker-compose logs -f` - View container logs

## Architecture

This is a React-based AI website generator that transforms text reports into complete websites using multiple AI models.

### Key Components Architecture
- **App.tsx** - Main component with stage management (initial → planPending → planReady → htmlPending → htmlReady)
- **useWebsiteGeneration** hook - Core business logic managing the entire generation workflow and state
- **AppStages.tsx** - Renders different UI stages based on current app state
- **aiService.ts** - Unified AI service layer that routes requests to Gemini, OpenRouter, or OpenAI based on model selection

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
1. Report input → Plan generation (streaming)
2. Plan editing/refinement via chat (optional)
3. Plan → HTML generation (streaming)
4. HTML refinement via chat (optional)

### Environment Configuration
- API keys for GEMINI_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY
- Environment validation on startup via envValidator.ts
- Defaults are automatically selected based on available API keys

### File Organization
- `src/components/` - React components and utility functions
- `src/hooks/` - Custom React hooks
- `src/services/` - AI service integrations
- `src/utils/` - Shared utilities (constants, logging, error handling, styling)
- `src/types/` - TypeScript type definitions
- `src/templates/` - AI prompt templates

### Styling System
- Uses Tailwind CSS with centralized style constants in styleConstants.ts
- Linear App-inspired design with vertical flow layout
- Responsive grid layout that adapts based on app stage
- Cyberpunk aesthetic with icy blue color scheme
- Custom fonts: Orbitron (cyberpunk titles), Rajdhani (subtitles), Space Mono, Exo 2
- Enhanced visual effects: gradient animations, glow effects, neon styling