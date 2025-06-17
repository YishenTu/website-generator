# AI Website Generator

AI-powered content generator that transforms text reports into complete websites or interactive presentation slides. Supports multiple AI models with real-time chat optimization.

## Features

- **Multiple Output Types**: Generate responsive websites or interactive presentation slides
- **Multiple AI Models**: Gemini, Claude, GPT-4, and more via OpenRouter
- **Interactive Chat**: Real-time AI conversation for optimization and refinement
- **Code Editor**: Built-in editor with live preview functionality
- **Smart Planning**: AI analyzes reports and generates structured content plans
- **Multi-language Support**: Auto-detect or specify English/Chinese output
- **Flexible Themes**: Choose between cyberpunk dark theme or clean light theme
- **Modern UI**: Responsive interface with glassmorphism effects
- **One-Click Deploy**: Automated Docker deployment

## Quick Start

### Docker Deployment (Recommended)

1. **Get API Keys**:
   - [Gemini API](https://aistudio.google.com/app/apikey) (required)
   - [OpenRouter API](https://openrouter.ai/) (optional)
   - [OpenAI API](https://platform.openai.com/) (optional)

2. **Deploy**:
   ```bash
   ./scripts/deploy.sh
   ```
   The script handles environment setup, builds containers, and starts the app.

3. **Access**: Open http://localhost:8080

### Local Development

**Prerequisites**: Node.js 18+

```bash
npm install
# Create .env.local with your API keys:
# GEMINI_API_KEY=your_key
# OPENROUTER_API_KEY=your_key (optional)
# OPENAI_API_KEY=your_key (optional)
npm run dev
```

## How It Works

1. **Input**: Paste your text report and select output type (webpage/slides)
2. **Configuration**: Choose language preference and visual theme
3. **Planning**: AI generates structured content plan with detailed sections
4. **Generation**: AI creates responsive HTML with modern styling or interactive slides
5. **Refinement**: Chat with AI to optimize and customize the result

## Tech Stack

- **Frontend**: React 19, TypeScript 5.7, Vite 6.2, Tailwind CSS
- **AI Integration**: Gemini, OpenRouter, OpenAI APIs
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
├── components/          # React components
│   ├── stages/         # Stage-specific workflow components
│   └── icons/          # Icon components
├── hooks/              # Custom React hooks
├── services/           # AI service integrations
├── templates/          # AI prompt templates
├── types/              # TypeScript definitions
├── utils/              # Shared utilities
└── contexts/           # React contexts

docker/                 # Docker configuration
scripts/                # Deployment scripts
```

## Commands

- `npm run dev` - Development server
- `npm run build` - Production build  
- `npm run preview` - Preview build
- `./scripts/deploy.sh` - Docker deployment

## Configuration Options

- **Output Type**: Choose between webpage or presentation slides
- **Language**: Auto-detect, English, or Chinese output
- **Theme**: Cyberpunk dark theme or clean light theme
- **AI Model**: Select from available models based on API keys

## Security

- Store API keys in environment variables
- Never commit secrets to version control
- Use HTTPS in production
- API key validation and error handling

## License

MIT License - see [LICENSE](LICENSE) for details.