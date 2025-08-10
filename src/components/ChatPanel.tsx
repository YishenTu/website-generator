import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserType } from '../types/types';
import { ModelSelector } from './ModelSelector';
import { getDefaultModel } from '../services/aiService';
import { isProviderAvailable } from '../utils/envValidator';
import { PaperAirplaneIcon, StopIcon } from './icons';
import { useDebouncedCallback } from '../hooks/useStateDebouncer';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onStop: () => void;
  chatModel?: string; // 模型ID字符串
  onChatModelChange?: (model: string) => void; // 模型ID回调
  isChatAvailable?: boolean;
  title?: string;
}

const ChatPanelComponent: React.FC<ChatPanelProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  onStop, 
  chatModel = getDefaultModel(isProviderAvailable('gemini') ? 'gemini' : 'openrouter'),
  onChatModelChange,
  isChatAvailable = true,
  title
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Note: Input text debouncing available for future use if needed
  // const debouncedInputText = useDebounce(inputText, 300);
  
  // Debounced submit to prevent rapid form submissions
  const { callback: debouncedSubmit } = useDebouncedCallback(
    (text: string) => {
      if (text.trim() && !isLoading && isChatAvailable) {
        onSendMessage(text);
        setInputText('');
      }
    },
    300, // 300ms debounce for submit
    { leading: true, trailing: false }
  );
  
  // Debounced stop button to prevent rapid clicking
  const { callback: debouncedStop } = useDebouncedCallback(
    onStop,
    200, // 200ms debounce for stop button
    { leading: true, trailing: false }
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSubmit(inputText);
  };

  const isInputDisabled = isLoading || !isChatAvailable;
  
  const getPlaceholderText = () => {
    if (isLoading) return "AI is thinking...";
    if (!isChatAvailable) return "Generating website...";
    return "Describe your changes...";
  };

  return (
    <div className="flex flex-col glass-card p-4 rounded-xl shadow-lg h-full">
      <div className="flex flex-col items-center mb-3 flex-shrink-0">
        {onChatModelChange ? (
          <div className="w-full flex items-center justify-center gap-3 pb-2 border-b border-white/10">
            <h2 className="text-lg font-semibold text-sky-400">
              {title ? 
                title.replace(/Refine\s+(Plan|Code)(\s+with\s+Chat)?/i, 'Refine with ') : 
                "Refine with "
              }
            </h2>
            <ModelSelector
              selectedModel={chatModel}
              onModelChange={onChatModelChange}
              disabled={isInputDisabled}
              size="small"
              expandDirection="down"
            />
          </div>
        ) : (
          <h2 className="text-xl font-semibold text-sky-400 mb-3">{title || "Refine Website with Chat"}</h2>
        )}
      </div>
      
      <div className="flex-grow overflow-y-auto mb-3 pr-1 space-y-3 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === UserType.User ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-2.5 rounded-lg text-sm shadow-md
                ${msg.sender === UserType.User
                  ? 'bg-sky-600/80 text-white rounded-br-none border border-sky-500/30'
                  : 'glass-input text-slate-200 rounded-bl-none border border-white/20'
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex-shrink-0 mt-auto pt-2">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={getPlaceholderText()}
            className="flex-grow py-1.5 px-2.5 glass-input text-slate-200 border border-white/20 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white/5 text-sm transition-colors duration-150 will-change-on-hover"
            disabled={isInputDisabled}
            aria-label="Chat message input"
          />
          {isLoading ? (
            <button
                type="button"
                onClick={debouncedStop}
                className="bg-red-600/80 hover:bg-red-700/90 text-white font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black border border-red-500/30 will-change-on-hover"
                aria-label="Stop refinement"
            >
                <StopIcon className="w-5 h-5" />
            </button>
          ) : (
            <button
                type="submit"
                disabled={isInputDisabled || !inputText.trim()}
                className="bg-sky-600/80 hover:bg-sky-700/90 disabled:bg-white/10 disabled:border-white/10 disabled:opacity-50 text-white font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-black border border-sky-500/30 will-change-on-hover"
                aria-label="Send chat message"
            >
                <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export const ChatPanel = React.memo(ChatPanelComponent, (prevProps, nextProps) => {
  // Compare messages safely by length, then by item equality
  let messagesEqual = false;
  if (prevProps.messages.length === nextProps.messages.length) {
    messagesEqual = prevProps.messages.every((msg, index) => {
      const nm = nextProps.messages[index];
      return nm && msg.id === nm.id && msg.text === nm.text && msg.sender === nm.sender;
    });
  }

  return (
    messagesEqual &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.chatModel === nextProps.chatModel &&
    prevProps.isChatAvailable === nextProps.isChatAvailable &&
    prevProps.title === nextProps.title &&
    prevProps.onSendMessage === nextProps.onSendMessage &&
    prevProps.onStop === nextProps.onStop &&
    prevProps.onChatModelChange === nextProps.onChatModelChange
  );
});
