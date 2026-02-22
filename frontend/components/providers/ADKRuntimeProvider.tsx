/**
 * ADK Runtime Provider for Assistant UI - SIMPLIFIED
 * 
 * Tool responses now handled via global function in TaskStepsToolUI
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
  const textPart = { type: 'text' as const, text: message.content };

  // Create tool-call parts from completed messages
  const toolCallParts =
    message.role === 'assistant' && message.metadata?.toolCalls
      ? message.metadata.toolCalls.map((tc) => ({
          type: 'tool-call' as const,
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          args: tc.args,
          // Mark as complete so tools become interactive
          status: { type: 'complete' as const },
        }))
      : [];

  return {
    role: message.role,
    id: message.id,
    content: [textPart, ...toolCallParts],
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
  // Build the message list including the in-progress streaming message
  const allMessages = useMemo(() => {
    // Convert all completed messages
    const converted = messages.map(convertMessage);

    // Only add streaming message if actually streaming
    if (isRunning) {
      const currentText = displayedText || streamedText || '';
      const textPart = { type: 'text' as const, text: currentText };

      // Tool calls during streaming are marked as 'running'
      const toolCallParts = streamToolCalls.map((tc) => ({
        type: 'tool-call' as const,
        toolCallId: tc.toolCallId,
        toolName: tc.toolName,
        args: tc.args,
        // During streaming, tool is 'running' - disabled
        status: { type: 'running' as const },
      }));

      // Only add if there's content
      if (currentText || toolCallParts.length > 0 || phaseLabel) {
        return [
          ...converted,
          {
            role: 'assistant' as const,
            id: streamingMessageId || 'streaming',
            content: [textPart, ...toolCallParts],
            status: { type: 'running' as const },
            metadata: {
              custom: { phase: phaseLabel },
            },
          },
        ];
      }
    }

    return converted;
  }, [messages, isRunning, displayedText, streamedText, phaseLabel, streamToolCalls, streamingMessageId]);

  const handleNew = async (message: AppendMessage) => {
    const textPart = message.content.find(p => p.type === 'text');
    if (textPart && 'text' in textPart) {
      // All messages go through onSubmit
      // Tool responses are handled via global function in TaskStepsToolUI
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