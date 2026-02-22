/**
 * Recipe Generator Agent Page
 * Interactive recipe builder with real-time state updates
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ThreadPrimitive } from '@assistant-ui/react';
import { ChefHat } from 'lucide-react';
import { useADKStream } from '@/hooks/useADKStream';
import { ADKRuntimeProvider } from '@/components/providers/ADKRuntimeProvider';
import { UserMessage } from '@/components/chat/UserMessage';
import { AssistantMessage } from '@/components/chat/AssistantMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { RecipeToolUI } from '@/components/tools/RecipeToolUI';
import type { ADKMessage } from '@/lib/types';

const SUGGESTED_QUESTIONS = [
  "Create a pasta recipe",
  "Make a vegetarian curry",
  "Quick 15-minute dinner idea",
  "Healthy breakfast recipe",
];

export default function RecipeGeneratorPage() {
  const [messages, setMessages] = useState<ADKMessage[]>([]);
  const [threadId] = useState(`thread-${Date.now()}`);
  
  const stream = useADKStream();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, stream.displayedText, stream.toolCalls]);

  const handleSubmit = useCallback((question: string) => {
    const userMsg: ADKMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    const conversationHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    stream.startStream({
      question,
      agentEndpoint: 'shared-state-agent',
      conversationHistory,
      threadId,
      onComplete: (text, toolCalls) => {
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recipe Generator</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and customize delicious recipes with step-by-step instructions
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
              <div className="flex flex-col items-center justify-center h-full text-center min-h-[60vh]">
                <div className="relative mb-6">
                  <div className="absolute inset-0 w-20 h-20 rounded-full bg-orange-500/20 blur-xl" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center ring-4 ring-orange-500/10 shadow-lg">
                    <ChefHat className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Welcome to Recipe Generator
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                  I create personalized recipes with ingredients, instructions, and cooking tips. You can modify and improve recipes as we go!
                </p>

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
                                hover:bg-orange-50 dark:hover:bg-orange-900/20 
                                hover:border-orange-300 dark:hover:border-orange-700
                                transition-all duration-200 group"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                        {question}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ADKRuntimeProvider
                messages={messages}
                isRunning={stream.isStreaming}
                streamedText={stream.streamedText}
                displayedText={stream.displayedText}
                streamToolCalls={stream.toolCalls}
                phaseLabel={stream.phaseLabel}
                onSubmit={handleSubmit}
              >
                <RecipeToolUI />
                <ThreadPrimitive.Messages
                  components={{
                    UserMessage: UserMessage,
                    AssistantMessage: AssistantMessage,
                  }}
                />
              </ADKRuntimeProvider>
            )}

            {stream.error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-700 dark:text-red-400">
                  <strong>Error:</strong> {stream.error}
                </p>
              </div>
            )}

            {stream.isStreaming && stream.phaseLabel && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                {stream.phaseLabel}
              </div>
            )}
          </div>
        </div>
      </div>

      <ChatInput 
        onSubmit={handleSubmit}
        isLoading={stream.isStreaming}
        onStop={stream.cancelStream}
      />
    </div>
  );
}
