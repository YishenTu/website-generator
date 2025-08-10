# AI Website Generator

AI-powered content generator that transforms text reports into complete websites or interactive presentation slides. Supports multiple AI models with real-time chat optimization.

## Features

- **Multiple Output Types**: Generate responsive websites or interactive presentation slides
- **Multiple AI Models**: GPT, Gemini, Claude and more via OpenRouter
- **Advanced Reasoning**: Enable maximum thinking for better result
- **Interactive Chat**: Real-time AI conversation for optimization and refinement
- **Code Editor**: Built-in editor with live preview functionality
- **Smart Planning**: AI analyzes reports and generates structured content plans
- **Multi-language Support**: Auto-detect or specify English/Chinese output
- **Flexible Themes**: Choose between cyberpunk dark theme or clean light theme
- **One-Click Deploy**: Automated Docker deployment
- **Performance Mode**: HQ/BAL/PERF modes to tailor effects and GPU use

## Quick Start

### Docker Deployment (Recommended)

1. **Get API Keys**:
   - [Gemini API](https://aistudio.google.com/app/apikey) 
   - [OpenAI API](https://platform.openai.com/)
   - [OpenRouter API](https://openrouter.ai/) 

2. **Safely store your API Keys**
   Create `.env` file in root dir with your API keys:
   ```
   # GEMINI_API_KEY=your_key
   # OPENROUTER_API_KEY=your_key
   # OPENAI_API_KEY=your_key
   ```

3. **Deploy**:
   ```bash
   cd docker && ./docker-run.sh
   ```
   The script builds the Docker image and starts the container without nesting.

4. **Access**: Open http://localhost:8080

### Local Development

**Prerequisites**: Node.js 18+

```bash
npm run dev
```

## How It Works

1. **Input**: Paste your text report and select output type (webpage/slides)
2. **Configuration**: Choose language preference and visual theme
3. **Planning**: AI generates structured content plan with detailed sections
4. **Generation**: AI creates responsive HTML with modern styling or interactive slides
5. **Refinement**: Chat with AI to optimize and customize the result

## Tech Stack

- **Frontend**: React 19.1.0, TypeScript 5.7.2, Vite 6.2.0, Tailwind CSS
- **Code Editor**: CodeMirror with HTML syntax highlighting
- **Deployment**: Docker, Nginx
- **Version**: 1.2.4

## Architecture

- Stage-based workflow: `initial → planPending → planReady → htmlPending → htmlReady`
- Service layer pattern with unified AI interface
- Custom hooks for state management and optimization
- Stream processing for real-time updates
- Template-based prompt system with configurable output types

## Project Structure

```
src/
├── App.tsx            # Main application component with context providers
├── main.tsx           # Application entry point and React DOM rendering
├── components/        # React components and UI elements
│   ├── stages/        # Stage-specific workflow components
│   │   ├── InitialStage.tsx
│   │   ├── PlanPendingStage.tsx
│   │   ├── PlanReadyStage.tsx
│   │   ├── HtmlPendingStage.tsx
│   │   └── HtmlReadyStage.tsx
│   ├── icons/         # Icon components
│   └── *.tsx          # UI components (ChatPanel, CodeEditor, ModelSelector, etc.)
├── hooks/             # Custom React hooks
│   ├── useWebsiteGeneration.ts        # Main generation logic
│   ├── useOptimizedWebsiteGeneration.ts # Performance-optimized generation
│   ├── usePerformanceMode.ts          # Performance mode management
│   ├── useDebounce.ts                 # Debouncing utilities
│   └── ...                            # Other utility hooks
├── services/          # AI service integrations
│   ├── aiService.ts         # Unified AI interface with model dispatch
│   ├── geminiService.ts     # Google Gemini integration
│   ├── openaiService.ts     # OpenAI integration
│   ├── openrouterService.ts # OpenRouter integration
│   └── streamRequest.ts     # Stream processing utilities
├── templates/         # AI prompt templates
│   ├── websitePrompts.ts    # Website generation prompts
│   ├── slidesPrompts.ts     # Slides generation prompts
│   ├── chatPrompts.ts       # Chat refinement prompts
│   ├── promptOrchestrator.ts # Prompt composition and management
│   └── common.ts            # Shared prompt utilities
├── types/             # TypeScript type definitions
│   └── types.ts             # Core type definitions
├── utils/             # Shared utilities
│   ├── streamHandler.ts     # SSE stream parsing
│   ├── htmlPostProcessor.ts # HTML processing and optimization
│   ├── htmlSanitizer.ts     # HTML sanitization for security
│   ├── envValidator.ts      # Environment and API key validation
│   ├── styleConstants.ts    # Centralized style constants
│   ├── logger.ts            # Logging utilities
│   └── ...                  # Other utilities
├── contexts/          # React contexts
│   ├── AppContext.tsx       # Global app state
│   └── ConfirmationContext.tsx # Confirmation dialogs
└── constants/         # Configuration constants
    └── i18n.ts              # Internationalization strings

docker/                # Docker configuration and deployment
├── Dockerfile         # Multi-stage build configuration
├── nginx.conf         # Nginx server configuration
├── docker-compose.yml # Docker compose configuration
└── docker-run.sh      # Deployment script

index.html             # Main HTML entry point with Tailwind config
template-slides.html   # Sample presentation slides template
```

## Commands

- `npm run dev` - Development server
- `npm run build` - Production build  
- `npm run preview` - Preview build
- `cd docker && ./docker-run.sh` - Docker deployment

## Configuration Options

- **Output Type**: Choose between webpage or presentation slides
- **Language**: Auto-detect, English, or Chinese output
- **Theme**: Cyberpunk dark theme or clean light theme
- **AI Model**: Select from available models based on API keys
- **Max Thinking**: Enable enhanced reasoning

## Security

- Store API keys in environment variables
- Never commit secrets to version control
- Use HTTPS in production
- API key validation and error handling

## License

MIT License - see [LICENSE](LICENSE) for details.
