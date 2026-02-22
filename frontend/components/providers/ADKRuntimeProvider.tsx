/**
 * ADK Runtime Provider for Assistant UI - FIXED
 * Properly handles tool results for UI rendering
 */

'use client';

import React, { useMemo, type ReactNode } from 'react';
import {
  useExternalStoreRuntime,
  AssistantRuntimeProvider,
  type ThreadMessageLike,
  type AppendMessage,
} from '@assistant-ui/react';
import type { ADKMessage, StreamToolCall } from '@/lib/types';

interface ADKRuntimeProviderProps {
  children: ReactNode;
  /** Completed messages from conversation history */
  messages: ADKMessage[];
  /** Whether the stream is currently active */
  isRunning: boolean;
  /** Full streamed text */
  streamedText: string;
  /** Text displayed (same as streamedText for instant display) */
  displayedText?: string;
  /** Tool calls received during streaming */
  streamToolCalls: StreamToolCall[];
  /** Current phase label (during streaming) */
  phaseLabel: string;
  /** Unique ID for the current streaming message */
  streamingMessageId: string;
  /** Handler for new user messages */
  onSubmit: (question: string) => void;
}

/**
 * Convert an ADKMessage to Assistant UI's ThreadMessageLike format
 */
function convertMessage(message: ADKMessage): ThreadMessageLike {
  const parts: any[] = [];

  // Create tool-call parts from completed messages
  if (message.role === 'assistant' && message.metadata?.toolCalls) {
    message.metadata.toolCalls.forEach((tc) => {
      parts.push({
        type: 'tool-call' as const,
        toolCallId: tc.toolCallId,
        toolName: tc.toolName,
        args: tc.args,
        result: tc.result, // Include the result!
        // Mark as complete so tools become interactive
        status: { type: 'complete' as const },
      });
    });
  }

  // Add text part (if there's content)
  if (message.content) {
    parts.push({ 
      type: 'text' as const, 
      text: message.content 
    });
  }

  return {
    role: message.role,
    id: message.id,
    content: parts,
    createdAt: new Date(message.createdAt),
    metadata: {
      custom: message.metadata,
    },
  };
}

export function ADKRuntimeProvider({
  children,
  messages,
  isRunning,
  streamedText,
  displayedText,
  streamToolCalls,
  phaseLabel,
  streamingMessageId,
  onSubmit,
}: ADKRuntimeProviderProps) {
  // Build the message list
  const allMessages = useMemo(() => {
    // Convert all completed messages
    const converted = messages.map(convertMessage);

    // CRITICAL: Only add streaming message if:
    // 1. Currently streaming (isRunning === true)
    // 2. AND there's actual content to show
    if (isRunning && (displayedText || streamedText || streamToolCalls.length > 0)) {
      const parts: any[] = [];

      // Tool calls during streaming
      streamToolCalls.forEach((tc) => {
        parts.push({
          type: 'tool-call' as const,
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          args: tc.args,
          result: tc.result, // Include result if available
          // During streaming, tool status depends on whether we have a result
          status: tc.result 
            ? { type: 'complete' as const }
            : { type: 'running' as const },
        });
      });

      // Text content
      const currentText = displayedText || streamedText || '';
      if (currentText) {
        parts.push({ 
          type: 'text' as const, 
          text: currentText 
        });
      }

      return [
        ...converted,
        {
          role: 'assistant' as const,
          id: streamingMessageId || 'streaming',
          content: parts,
          status: { type: 'running' as const },
          metadata: {
            custom: { phase: phaseLabel },
          },
        },
      ];
    }

    // When not streaming, only return completed messages
    return converted;
  }, [messages, isRunning, displayedText, streamedText, phaseLabel, streamToolCalls, streamingMessageId]);

  const handleNew = async (message: AppendMessage) => {
    const textPart = message.content.find(p => p.type === 'text');
    if (textPart && 'text' in textPart) {
      onSubmit(textPart.text);
    }
  };

  // Create runtime using Assistant UI's external store adapter
  const runtime = useExternalStoreRuntime({
    isRunning,
    messages: allMessages,
    convertMessage: (m: ThreadMessageLike) => m,
    onNew: handleNew,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}