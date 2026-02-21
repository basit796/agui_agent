/**
 * User Message Component
 * Displays user messages in the chat
 */

'use client';

import { MessagePrimitive } from '@assistant-ui/react';

export function UserMessage() {
  return (
    <div className="flex justify-end mb-6 animate-[messageIn_200ms_ease-out]">
      <div className="max-w-[70%]">
        <div className="flex items-center gap-2 mb-1 justify-end">
          <span className="text-xs text-gray-500 dark:text-gray-400">You</span>
        </div>
        <div className="rounded-2xl rounded-br-md px-4 py-3 bg-blue-600 text-white shadow-sm">
          <MessagePrimitive.Content
            components={{
              Text: ({ text }) => (
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                  {text}
                </p>
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
}
