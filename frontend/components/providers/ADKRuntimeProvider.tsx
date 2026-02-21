/**
 * ADK Runtime Provider for Assistant UI
 * 
 * This provider bridges our custom ADK streaming state to Assistant UI's runtime.
 * It converts our messages to ThreadMessageLike format that Assistant UI expects.
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
  displayedText: string;
  /** Tool calls received during streaming */
  streamToolCalls: StreamToolCall[];
  /** Current phase label (during streaming) */
  phaseLabel: string;
  /** Handler for new user messages */
  onSubmit: (question: string) => void;
}

/**
 * Convert an ADKMessage to Assistant UI's ThreadMessageLike format
 */
function convertMessage(message: ADKMessage): ThreadMessageLike {
  const textPart = { type: 'text' as const, text: message.content };

  // Build tool-call content parts from persisted metadata
  const toolCallParts =
    message.role === 'assistant' && message.metadata?.toolCalls
      ? message.metadata.toolCalls.map((tc) => ({
          type: 'tool-call' as const,
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          args: tc.args,
          result: tc.result || undefined,  // Pass actual result data
        }))
      : [];

  return {
    role: message.role,
    id: message.id,
    content: [textPart, ...toolCallParts],
    createdAt: new Date(message.createdAt),
    // Add required metadata fields for Assistant UI
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
  onSubmit,
}: ADKRuntimeProviderProps) {
  // Build the message list including the in-progress streaming message
  const allMessages = useMemo(() => {
    const converted = messages.map(convertMessage);

    // Add in-progress streaming message — use displayedText for real-time display
    if (isRunning && (displayedText || streamedText || phaseLabel)) {
      const textPart = { type: 'text' as const, text: displayedText || '' };

      const toolCallParts = streamToolCalls.map((tc) => ({
        type: 'tool-call' as const,
        toolCallId: tc.toolCallId,
        toolName: tc.toolName,
        args: tc.args,
        result: tc.result || undefined,  // Pass actual result data during streaming
      }));

      return [
        ...converted,
        {
          role: 'assistant' as const,
          id: 'streaming',
          content: [textPart, ...toolCallParts],
          status: { type: 'running' as const },
          metadata: {
            custom: { phase: phaseLabel },
          },
        },
      ];
    }

    return converted;
  }, [messages, isRunning, displayedText, streamedText, phaseLabel, streamToolCalls]);

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
