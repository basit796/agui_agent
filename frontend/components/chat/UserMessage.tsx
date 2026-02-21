/**
 * User Message Component
 * Displays user messages in the chat
 */

'use client';

import { MessagePrimitive } from '@assistant-ui/react';

export function UserMessage() {
  return (
    <div className="flex justify-end mb-4">
      <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl px-4 py-2.5 shadow-sm">
        <MessagePrimitive.Content />
      </div>
    </div>
  );
}
