/**
 * Claude-style Chat Interface
 * Minimal, clean design inspired by Claude's UI
 */

'use client';

import {
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  useThreadRuntime,
} from '@assistant-ui/react';
import { ArrowUp, Plus, User, Bot } from 'lucide-react';

// Message Component
function ChatMessage() {
  const thread = useThreadRuntime();
  
  return (
    <MessagePrimitive.Root className="mb-6">
      <MessagePrimitive.If user>
        <div className="flex gap-4 justify-end">
          <div className="max-w-[85%]">
            <MessagePrimitive.Content className="text-[#1a1a18] dark:text-[#eee] text-base leading-relaxed" />
          </div>
          <div className="w-8 h-8 rounded-full bg-[#ae5630] flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </MessagePrimitive.If>

      <MessagePrimitive.If assistant>
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-[#e5e5e0] dark:bg-[#3a3935] flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-[#ae5630]" />
          </div>
          <div className="max-w-[85%] flex-1">
            <MessagePrimitive.Content className="text-[#1a1a18] dark:text-[#eee] text-base leading-relaxed prose prose-slate dark:prose-invert max-w-none" />
          </div>
        </div>
      </MessagePrimitive.If>
    </MessagePrimitive.Root>
  );
}

export function ClaudeUI() {
  return (
    <ThreadPrimitive.Root className="flex h-full flex-col bg-[#F5F5F0] dark:bg-[#2b2a27] font-sans">
      {/* Messages Area */}
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <ThreadPrimitive.Messages components={{ Message: ChatMessage }} />
        </div>
      </ThreadPrimitive.Viewport>

      {/* Input Area */}
      <div className="border-t border-[#e5e5e0] dark:border-[#3a3935] bg-[#F5F5F0] dark:bg-[#2b2a27] p-4">
        <ComposerPrimitive.Root className="mx-auto flex w-full max-w-3xl flex-col gap-2 rounded-2xl bg-white dark:bg-[#1f1e1b] p-4 shadow-[0_0.25rem_1.25rem_rgba(0,0,0,0.035)]">
          <ComposerPrimitive.Input
            placeholder="How can I help you today?"
            autoFocus
            className="min-h-[60px] w-full resize-none bg-transparent text-[#1a1a18] dark:text-[#eee] outline-none placeholder:text-gray-400"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ComposerPrimitive.AddAttachment asChild>
                <button className="rounded-lg p-2 hover:bg-[#f5f5f0] dark:hover:bg-[#2b2a27] border border-[#00000015] dark:border-[#ffffff15] transition-colors">
                  <Plus className="w-4 h-4 text-[#1a1a18] dark:text-[#eee]" />
                </button>
              </ComposerPrimitive.AddAttachment>
              <span className="text-sm text-gray-600 dark:text-gray-400">Gemini Flash 2.0</span>
            </div>
            <ComposerPrimitive.Send asChild>
              <button className="rounded-lg bg-[#ae5630] hover:bg-[#c4633a] p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <ArrowUp className="w-5 h-5 text-white" />
              </button>
            </ComposerPrimitive.Send>
          </div>
        </ComposerPrimitive.Root>
      </div>
    </ThreadPrimitive.Root>
  );
}
