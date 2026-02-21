/**
 * Assistant Message Component
 * Displays assistant messages and tool calls in the chat
 */

'use client';

import { MessagePrimitive } from '@assistant-ui/react';

export function AssistantMessage() {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[85%]">
        {/* Text content */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2.5 shadow-sm mb-2">
          <MessagePrimitive.Content />
        </div>
        
        {/* Tool calls */}
        <MessagePrimitive.If hasToolCall>
          <div className="mt-2">
            <MessagePrimitive.Content />
          </div>
        </MessagePrimitive.If>
      </div>
    </div>
  );
}
