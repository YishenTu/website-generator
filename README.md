# AI Website Generator

AI-powered website generator that transforms text reports into complete websites. Supports multiple AI models with real-time chat optimization.

## Features

- **Multiple AI Models**: Gemini, Claude, GPT-4, and more via OpenRouter
- **Interactive Chat**: Real-time AI conversation for optimization
- **Code Editor**: Built-in editor with live preview
- **Smart Planning**: AI analyzes reports and generates website structure
- **Modern UI**: Cyberpunk-themed interface with glassmorphism effects
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

1. **Input**: Paste your text report
2. **Planning**: AI generates website structure and content plan
3. **Generation**: AI creates responsive HTML with modern styling
4. **Refinement**: Chat with AI to optimize the result

## Tech Stack

- **Frontend**: React 19, TypeScript 5.7, Vite 6.2, Tailwind CSS
- **AI Integration**: Gemini, OpenRouter, OpenAI APIs
- **Deployment**: Docker, Nginx

## Architecture

- Stage-based workflow: `initial → planPending → planReady → htmlPending → htmlReady`
- Service layer pattern with unified AI interface
- Custom hooks for state management
- Stream processing for real-time updates

## Project Structure

```
src/
├── components/          # React components
│   ├── stages/         # Stage-specific components
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

## Security

- Store API keys in environment variables
- Never commit secrets to version control
- Use HTTPS in production

## License

MIT License - see [LICENSE](LICENSE) for details.