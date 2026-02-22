/**
 * Assistant Sidebar Component
 * Collapsible sidebar for AI chat interface
 */

'use client';

import React, { useState, type ReactNode } from 'react';
import { ChefHat, X, MessageSquare } from 'lucide-react';
import { ChatInput } from '@/components/chat/ChatInput';

interface AssistantSidebarProps {
  children: ReactNode;
  title?: string;
  description?: string;
  defaultOpen?: boolean;
  onSubmit?: (message: string) => void;
  isLoading?: boolean;
  onStop?: () => void;
}

export function AssistantSidebar({ 
  children, 
  title = "AI Assistant",
  description = "How can I help?",
  defaultOpen = true,
  onSubmit,
  isLoading = false,
  onStop
}: AssistantSidebarProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl transition-all duration-300 ease-in-out z-50 flex flex-col ${
          isOpen ? 'w-96' : 'w-0'
        }`}
      >
        {isOpen && (
          <>
            {/* Header */}
            <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                    <ChefHat className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {children}
              </div>
            </div>

            {/* Input Area */}
            {onSubmit && (
              <ChatInput 
                onSubmit={onSubmit}
                isLoading={isLoading}
                onStop={onStop}
                placeholder="Ask me to create or improve your recipe..."
              />
            )}
          </>
        )}
      </div>

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-4 bottom-4 w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}