/**
 * Assistant Message Component
 * Displays assistant messages and tool calls in the chat
 */

'use client';

import { MessagePrimitive, useMessage } from '@assistant-ui/react';
import { Sparkles } from 'lucide-react';

export function AssistantMessage() {
  const message = useMessage();
  const isRunning = message.status?.type === 'running';

  return (
    <div className="group/msg mb-6 animate-[messageIn_200ms_ease-out]">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0 max-w-[85%]">
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Weather Agent</span>
          
          {/* Single MessagePrimitive.Content handles both text AND tool calls */}
          <MessagePrimitive.Content
            components={{
              Text: ({ text }) => {
                if (!text) return null;
                return (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm text-[15px] leading-relaxed text-gray-900 dark:text-gray-100">
                    {text}
                    {isRunning && (
                      <span className="inline-block w-[2px] h-[1em] ml-1 bg-blue-500 align-text-bottom animate-pulse" />
                    )}
                  </div>
                );
              },
              // Tool calls are rendered by registered tool UI components automatically
            }}
          />
        </div>
      </div>
    </div>
  );
}
