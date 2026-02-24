/**
 * Recipe Generator Page with Real-Time State Updates
 * Uses STATE_DELTA events for instant UI updates
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { AssistantSidebar } from '@/components/assistant-ui/AssistantSidebar';
import { useADKStream } from '@/hooks/useADKStream';
import { ADKRuntimeProvider } from '@/components/providers/ADKRuntimeProvider';
import { UserMessage } from '@/components/chat/UserMessage';
import { AssistantMessage } from '@/components/chat/AssistantMessage';
import { RecipeToolUI } from '@/components/tools/RecipeToolUI';
import { RecipeCard, INITIAL_RECIPE, type Recipe } from '@/components/recipe/RecipeCard';
import { applyJsonPatch, getChangedKeysFromPatch } from '@/lib/jsonPatch';
import type { ADKMessage } from '@/lib/types';

export default function RecipeGeneratorPage() {
  const [messages, setMessages] = useState<ADKMessage[]>([]);
  const [threadId] = useState(`thread-${Date.now()}`);
  const [recipe, setRecipe] = useState<Recipe>(INITIAL_RECIPE);
  const [changedKeys, setChangedKeys] = useState<string[]>([]);
  
  const stream = useADKStream();

  // Clear change indicators when streaming stops
  useEffect(() => {
    if (!stream.isStreaming) {
      const timer = setTimeout(() => setChangedKeys([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [stream.isStreaming]);

  // Handle recipe updates from the card (manual edits)
  const handleRecipeChange = useCallback((updatedRecipe: Recipe) => {
    setRecipe(updatedRecipe);
  }, []);

  // Handle real-time state delta updates
  const handleStateDelta = useCallback((delta: any[]) => {
    console.log('📦 STATE_DELTA received:', delta);

    setRecipe(currentRecipe => {
      // Apply JSON Patch operations to current recipe
      const stateWrapper = { recipe: currentRecipe };
      const patchedState = applyJsonPatch(stateWrapper, delta);
      
      // Extract which fields changed
      const changed = getChangedKeysFromPatch(delta);
      setChangedKeys(prev => {
        const newKeys = new Set([...prev, ...changed]);
        return Array.from(newKeys);
      });

      return patchedState.recipe;
    });
  }, []);

  // Handle full state snapshot (fallback)
  const handleStateSnapshot = useCallback((state: any) => {
    console.log('📸 STATE_SNAPSHOT received:', state);
    
    if (state.recipe) {
      setRecipe(state.recipe);
      // Mark all fields as changed
      setChangedKeys(Object.keys(state.recipe));
    }
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

    // Start streaming with current recipe state and delta handlers
    stream.startStream({
      question,
      agentEndpoint: 'recipe-generator',
      conversationHistory,
      threadId,
      initialState: { recipe },
      // Real-time state updates
      onStateDelta: handleStateDelta,
      onStateSnapshot: handleStateSnapshot,
      // Completion handler (still needed for messages)
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

        // Fallback: If no state deltas received, use tool result
        if (toolCalls.length > 0) {
          const recipeTool = toolCalls.find(tc => tc.toolName === 'generate_recipe');
          if (recipeTool && recipeTool.args) {
            const updates = recipeTool.args as Partial<Recipe>;
            const newRecipe = { ...recipe };
            const changed: string[] = [];

            for (const key in updates) {
              if (JSON.stringify((updates as any)[key]) !== JSON.stringify((recipe as any)[key])) {
                (newRecipe as any)[key] = (updates as any)[key];
                changed.push(key);
              }
            }

            if (changed.length > 0) {
              setRecipe(newRecipe);
              setChangedKeys(changed);
            }
          }
        }
      },
    });
  }, [messages, stream, threadId, recipe, handleStateDelta, handleStateSnapshot]);

  return (
    <div className="h-screen">
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
        
        <AssistantSidebar>
          {/* Main Content - Recipe Card */}
          <div className="h-full overflow-auto p-8 flex items-center justify-center bg-gray-50 dark:bg-black">
            <RecipeCard 
              recipe={recipe} 
              onRecipeChange={handleRecipeChange}
              changedKeys={changedKeys}
            />
          </div>
        </AssistantSidebar>
      </ADKRuntimeProvider>
    </div>
  );
}