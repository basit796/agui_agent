/**
 * Recipe Generator Page with Shared State
 * Combines RecipeCard with AI Assistant in sidebar
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { ThreadPrimitive } from '@assistant-ui/react';
import { useADKStream } from '@/hooks/useADKStream';
import { ADKRuntimeProvider } from '@/components/providers/ADKRuntimeProvider';
import { UserMessage } from '@/components/chat/UserMessage';
import { AssistantMessage } from '@/components/chat/AssistantMessage';
import { RecipeToolUI } from '@/components/tools/RecipeToolUI';
import { RecipeCard, INITIAL_RECIPE, type Recipe } from '@/components/recipe/RecipeCard';
import { AssistantSidebar } from '@/components/assistant-ui/AssistantSidebar';
import type { ADKMessage } from '@/lib/types';

export default function RecipeGeneratorPage() {
  const [messages, setMessages] = useState<ADKMessage[]>([]);
  const [threadId] = useState(`thread-${Date.now()}`);
  const [recipe, setRecipe] = useState<Recipe>(INITIAL_RECIPE);
  const [changedKeys, setChangedKeys] = useState<string[]>([]);
  
  const stream = useADKStream();

  // Track changes from AI agent
  useEffect(() => {
    if (!stream.isStreaming) {
      setChangedKeys([]);
    }
  }, [stream.isStreaming]);

  // Handle recipe updates from the card (manual edits)
  const handleRecipeChange = useCallback((updatedRecipe: Recipe) => {
    setRecipe(updatedRecipe);
  }, []);

  // Handle message submission from chat
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

    // Start streaming with current recipe state
    stream.startStream({
      question,
      agentEndpoint: 'recipe-generator',
      conversationHistory,
      threadId,
      // Pass current recipe state to backend
      initialState: { recipe },
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

        // Update recipe from tool calls
        if (toolCalls.length > 0) {
          const recipeTool = toolCalls.find(tc => tc.toolName === 'generate_recipe');
          if (recipeTool && recipeTool.args) {
            // Merge agent updates with current recipe
            const updates = recipeTool.args as Partial<Recipe>;
            const newRecipe = { ...recipe };
            const changed: string[] = [];

            // Track which fields changed
            for (const key in updates) {
              if (JSON.stringify((updates as any)[key]) !== JSON.stringify((recipe as any)[key])) {
                (newRecipe as any)[key] = (updates as any)[key];
                changed.push(key);
              }
            }

            if (changed.length > 0) {
              setRecipe(newRecipe);
              setChangedKeys(changed);
              // Clear change indicators after 3 seconds
              setTimeout(() => setChangedKeys([]), 3000);
            }
          }
        }
      },
    });
  }, [messages, stream, threadId, recipe]);

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Main Content - Recipe Card */}
      <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
        <RecipeCard 
          recipe={recipe} 
          onRecipeChange={handleRecipeChange}
          changedKeys={changedKeys}
        />
      </div>

      {/* Sidebar with AI Assistant */}
      <AssistantSidebar
        title="AI Recipe Assistant"
        description="Ask me to create or improve your recipe"
        defaultOpen={true}
        onSubmit={handleSubmit}
        isLoading={stream.isStreaming}
        onStop={stream.cancelStream}
      >
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
          <RecipeToolUI />
          <ThreadPrimitive.Messages
            components={{
              UserMessage: UserMessage,
              AssistantMessage: AssistantMessage,
            }}
          />
        </ADKRuntimeProvider>
      </AssistantSidebar>
    </div>
  );
}