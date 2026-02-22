/**
 * Agentic Chat Agent Page
 * Simple conversational AI with Claude-style interface
 */

'use client';

import { ADKRuntimeProvider } from '@/components/providers/ADKRuntimeProvider';
import { ClaudeUI } from '@/components/chat/ClaudeUI';

export default function ChatAgentPage() {
  return (
    <ADKRuntimeProvider agentEndpoint="chat-agent">
      <div className="h-screen">
        <ClaudeUI />
      </div>
    </ADKRuntimeProvider>
  );
}
