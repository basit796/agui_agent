/**
 * Assistant UI Sidebar Component
 * Wrapper for @assistant-ui/react-ui's sidebar
 * Note: Runtime is provided by ADKRuntimeProvider in parent
 */

'use client';

import { Thread } from '@/components/thread';
import { AssistantSidebar as AUISidebar } from "@/components/assistant-sidebar";
// import '@assistant-ui/react-ui/styles/index.css';
import { type ReactNode } from 'react';

interface AssistantSidebarProps {
  children: ReactNode;
}

export function AssistantSidebar({ children }: AssistantSidebarProps) {
  return (
    <AUISidebar>
      {/* Main app content */}
      {children}
    </AUISidebar>
  );
}