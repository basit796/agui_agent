'use client';

import { useState } from 'react';
import { ADKRuntimeProvider } from '@/components/providers/ADKRuntimeProvider';
import { ClaudeUI } from '@/components/chat/ClaudeUI';
import { useADKStream } from '@/hooks/useADKStream';
import type { ADKMessage } from '@/lib/types';

export default function ChatAgentPage() {
  const [messages, setMessages] = useState<ADKMessage[]>([]);

  const {
    isStreaming,
    streamedText,
    displayedText,
    phaseLabel,
    toolCalls,
    streamingMessageId,
    startStream,
  } = useADKStream();

  const handleSubmit = async (question: string) => {
    const userMessage: ADKMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    await startStream({
      question,
      agentEndpoint: 'chat-agent',
      conversationHistory: messages,
      threadId: undefined,
      onComplete: (finalText) => {
        const assistantMessage: ADKMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: finalText,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      },
    });
  };

  return (
    <ADKRuntimeProvider
      messages={messages}
      isRunning={isStreaming}
      streamedText={streamedText}
      displayedText={displayedText}
      streamToolCalls={toolCalls}
      phaseLabel={phaseLabel}
      streamingMessageId={streamingMessageId}
      onSubmit={handleSubmit}
    >
      <div className="h-screen">
        <ClaudeUI />
      </div>
    </ADKRuntimeProvider>
  );
}