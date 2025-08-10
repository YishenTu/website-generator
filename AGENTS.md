# Repository Guidelines

## Project Structure & Module Organization
- `src/components/`: React UI (e.g., `OutputDisplay.tsx`, `CodeEditor.tsx`).
- `src/hooks/`: Custom hooks (e.g., `useWebsiteGeneration.ts`).
- `src/services/`: AI integrations (`openaiService.ts`, `geminiService.ts`, `openrouterService.ts`, unified `aiService.ts`).
- `src/templates/`: Prompt templates (`websitePrompts.ts`, `slidesPrompts.ts`, `chatPrompts.ts`).
- `src/utils/`: Shared utilities (`streamHandler.ts`, `htmlPostProcessor.ts`, `envValidator.ts`, `htmlSanitizer.ts`).
- `src/contexts/`, `src/constants/`, `src/types/`: App state, config, and types.
- `docker/`: Dockerfile, Nginx config, `docker-run.sh` for deployment.
- Build output: `dist/`; static assets: `public/`; entry: `index.html`.

## Build, Test, and Development Commands
- `npm run dev`: Start Vite dev server for local development.
- `npm run build`: Production build to `dist/`.
- `npm run preview`: Serve the production build locally.
- `cd docker && ./docker-run.sh`: Build and run the Docker image (serves on port 8080).
- Type check: `npx tsc -p .` (uses strict TypeScript settings in `tsconfig.json`).

## Coding Style & Naming Conventions
- Language: TypeScript + React (React 19, Vite).
- Indentation: 2 spaces; keep files small and focused.
- Components: PascalCase file and component names (e.g., `ReportInputForm.tsx`).
- Hooks: `useX` naming (e.g., `useOptimizedWebsiteGeneration.ts`).
- Utilities/constants: camelCase for files like `envValidator.ts`, UPPER_SNAKE_CASE for constant values.
- Exports: Prefer named exports; avoid default unless conventional.

## Testing Guidelines
- No test framework is configured yet. When adding tests, prefer Vitest + React Testing Library.
- Location: `src/**/__tests__` or colocate as `*.test.ts(x)` next to the unit.
- Conventions: One behavior per test; mock network calls to AI services; keep tests deterministic.
- Command (once added): `npx vitest run` and `npx vitest --ui` for watch/UI.

## Commit & Pull Request Guidelines
- Commit style: Conventional prefixes used in history (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`). Example: `feat: add docker deployment script`.
- Scope small, imperative message; reference files or modules when helpful.
- PRs must include: concise description, linked issues, test plan/steps, screenshots for UI changes, and notes on env/config changes.

## Security & Configuration Tips
- Configure API keys via `.env`: `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `OPENAI_API_KEY`; never commit secrets.
- Runtime checks: `src/utils/envValidator.ts` validates required env; sanitize any HTML via `src/utils/htmlSanitizer.ts`.
- Prefer `services/*` for network access and keep UI components pure.

## Performance Guidelines
- Performance Mode: Provide HQ/BAL/PERF toggles in Settings; persist via localStorage; respect `prefers-reduced-motion`.
- Memoization: Keep `React.memo` on heavy components with stable, minimal props.
- Lazy Loading: `SettingsSidebar` and `CodeEditor` are code-split with Suspense skeletons; do not inline-import them in App initialization.
- CSS Effects: Avoid global backdrop-blur; keep shadows/gradients lightweight and transitions scoped to transform/opacity.
- Avoid re-adding the removed `docs/` reports; consolidate performance notes in README to prevent drift.
