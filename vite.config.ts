import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
          output: {
            manualChunks: {
              // Vendor libraries
              'vendor-react': ['react', 'react-dom'],
              'vendor-codemirror': ['@uiw/react-codemirror', '@codemirror/lang-html', '@codemirror/theme-one-dark'],
              
              // AI services
              'ai-services': [
                'src/services/geminiService.ts',
                'src/services/openaiService.ts', 
                'src/services/openrouterService.ts'
              ],
              
              // Heavy utilities
              'utils': [
                'src/utils/streamHandler.ts',
                'src/utils/errorHandler.ts',
                'src/utils/logger.ts'
              ]
            }
          }
        },
        chunkSizeWarningLimit: 1000
      },
      server: {
        port: 3000,
        host: true,
      },
      root: '.',
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY),
        'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src'),
        }
      }
    };
});
