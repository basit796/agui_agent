/**
 * Type definitions for ADK Agent streaming
 */

export type StreamPhase = 
  | 'understanding' 
  | 'querying' 
  | 'synthesizing' 
  | 'complete';

export interface StreamPhaseEvent {
  phase: StreamPhase;
  label: string;
}

export interface StreamTokenEvent {
  text: string;
}

export interface StreamToolCall {
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
}

export interface StreamToolCallEvent extends StreamToolCall {}

export interface StreamMetadataEvent {
  confidence?: number;
  executionTimeMs?: number;
  [key: string]: any;
}

export interface StreamErrorEvent {
  message: string;
}

export interface ADKMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  metadata?: {
    toolCalls?: StreamToolCall[];
    [key: string]: any;
  };
}

export interface ConversationHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}
