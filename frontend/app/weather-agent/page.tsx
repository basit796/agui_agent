/**
 * Weather Agent Page - FIXED
 * 
 * Properly integrates tool UI rendering with spacing
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ThreadPrimitive } from '@assistant-ui/react';
import { Cloud, Sparkles } from 'lucide-react';
import { useADKStream } from '@/hooks/useADKStream';
import { ADKRuntimeProvider } from '@/components/providers/ADKRuntimeProvider';
import { UserMessage } from '@/components/chat/UserMessage';
import { AssistantMessage } from '@/components/chat/AssistantMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { WeatherToolUI } from '@/components/tools/WeatherToolUI';
import type { ADKMessage } from '@/lib/types';

const SUGGESTED_QUESTIONS = [
  "What's the weather in New York?",
  "Tell me the weather in Tokyo",
  "How's the weather in London?",
  "What's the temperature in Paris?",
];

export default function WeatherAgentPage() {
  const [messages, setMessages] = useState<ADKMessage[]>([]);
  const [threadId] = useState(`thread-${Date.now()}`);
  
  const stream = useADKStream();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, stream.displayedText, stream.toolCalls]);

  const handleSubmit = useCallback((question: string) => {
    // Add user message immediately
    const userMsg: ADKMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Build conversation history (all previous messages)
    const conversationHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Start streaming with onComplete callback to persist completed message
    stream.startStream({
      question,
      agentEndpoint: 'weather-agent',
      conversationHistory,
      threadId,
      onComplete: (text, toolCalls) => {
        // Add completed assistant message to persistent state
        const assistantMsg: ADKMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: text,
          createdAt: new Date().toISOString(),
          metadata: {
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
          },
        };
        setMessages(prev => [...prev, assistantMsg]);
      },
    });
  }, [messages, stream, threadId]);

  const handleSuggestionClick = useCallback((question: string) => {
    handleSubmit(question);
  }, [handleSubmit]);

  const isNewChat = messages.length === 0 && !stream.isStreaming;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Weather Agent</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ask me about the weather in any city around the world
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={scrollRef}
          className="h-full overflow-y-auto px-6 py-6"
        >
          <div className="max-w-4xl mx-auto">
            {isNewChat ? (
              // Welcome Screen
              <div className="flex flex-col items-center justify-center h-full text-center min-h-[60vh]">
                <div className="relative mb-6">
                  <div className="absolute inset-0 w-20 h-20 rounded-full bg-blue-500/20 blur-xl" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-4 ring-blue-500/10 shadow-lg">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Welcome to Weather Agent
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                  I can fetch real-time weather information for any city in the world.
                  Just ask me about a location!
                </p>

                {/* Suggested Questions */}
                <div className="w-full max-w-md space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Try asking:
                  </p>
                  {SUGGESTED_QUESTIONS.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(question)}
                      className="w-full text-left px-4 py-3 bg-white dark:bg-gray-800 
                               border border-gray-200 dark:border-gray-700 rounded-xl
                               hover:bg-blue-50 dark:hover:bg-blue-900/20 
                               hover:border-blue-300 dark:hover:border-blue-700
                               transition-all duration-200 group"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {question}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Messages Display with Assistant UI
              <ADKRuntimeProvider
                messages={messages}
                isRunning={stream.isStreaming}
                streamedText={stream.streamedText}
                displayedText={stream.displayedText}
                streamToolCalls={stream.toolCalls}
                phaseLabel={stream.phaseLabel}
                streamingMessageId={stream.streamingMessageId}
                onSubmit={handleSubmit}
              >
                {/* Register Weather Tool UI */}
                <WeatherToolUI />
                
                {/* Render Messages */}
                <ThreadPrimitive.Messages
                  components={{
                    UserMessage: UserMessage,
                    AssistantMessage: AssistantMessage,
                  }}
                />
              </ADKRuntimeProvider>
            )}

            {/* Error Display */}
            {stream.error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-700 dark:text-red-400">
                  <strong>Error:</strong> {stream.error}
                </p>
              </div>
            )}

            {/* Phase Label (during streaming) */}
            {stream.isStreaming && stream.phaseLabel && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                {stream.phaseLabel}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <ChatInput 
        onSubmit={handleSubmit}
        isLoading={stream.isStreaming}
        onStop={stream.cancelStream}
      />
    </div>
  );
}