/**
 * Chat Input Component
 * Handles user input with send button
 */

'use client';

import { useState } from 'react';
import { Send, StopCircle } from 'lucide-react';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  onStop: () => void;
}

export function ChatInput({ onSubmit, isLoading, onStop }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <form onSubmit={handleSubmit} className="flex gap-2 items-end max-w-4xl mx-auto">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the weather in any city..."
          disabled={isLoading}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-800 px-4 py-3 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   min-h-[48px] max-h-[200px]"
          style={{ 
            height: 'auto',
            minHeight: '48px',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 200) + 'px';
          }}
        />
        
        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="flex items-center justify-center w-12 h-12 rounded-xl 
                     bg-red-600 hover:bg-red-700 text-white
                     transition-colors duration-200 flex-shrink-0"
            title="Stop generation"
          >
            <StopCircle className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex items-center justify-center w-12 h-12 rounded-xl 
                     bg-blue-600 hover:bg-blue-700 text-white
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600
                     transition-colors duration-200 flex-shrink-0"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        )}
      </form>
    </div>
  );
}
