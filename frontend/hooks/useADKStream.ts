/**
 * Custom hook for managing SSE streaming from ADK agents - WITH STATE SUPPORT
 * Supports passing initial state to agents for shared state pattern
 */

import { useState, useCallback, useRef } from 'react';
import type { StreamPhase, StreamToolCall, ADKMessage, ConversationHistoryMessage } from '@/lib/types';

interface StartStreamOptions {
  question: string;
  agentEndpoint: string;
  conversationHistory?: ConversationHistoryMessage[];
  threadId?: string;
  initialState?: any; // State to pass to agent
  onComplete?: (text: string, toolCalls: StreamToolCall[]) => void;
}

export function useADKStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [phaseLabel, setPhaseLabel] = useState('');
  const [currentPhase, setCurrentPhase] = useState<StreamPhase>('understanding');
  const [toolCalls, setToolCalls] = useState<StreamToolCall[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string>('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const onCompleteRef = useRef<((text: string, toolCalls: StreamToolCall[]) => void) | null>(null);
  
  const firstDoneReceivedRef = useRef(false);

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
    setToolCalls([]);
    setStreamedText('');
    setDisplayedText('');
    setPhaseLabel('');
    firstDoneReceivedRef.current = false;
  }, []);

  const startStream = useCallback(async ({ 
    question, 
    agentEndpoint, 
    conversationHistory = [], 
    threadId, 
    initialState,
    onComplete 
  }: StartStreamOptions) => {
    const newStreamingId = crypto.randomUUID();
    setStreamingMessageId(newStreamingId);
    
    setIsStreaming(true);
    setStreamedText('');
    setDisplayedText('');
    setPhaseLabel('');
    setToolCalls([]);
    setError(null);
    firstDoneReceivedRef.current = false;

    onCompleteRef.current = onComplete || null;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`/api/stream/${agentEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          conversationHistory,
          threadId: threadId || `thread-${Date.now()}`,
          state: initialState || {}, // Pass state to backend
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';
      let accumulatedToolCalls: StreamToolCall[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ') && currentEvent) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);

              switch (currentEvent) {
                case 'phase':
                  setCurrentPhase(data.phase);
                  setPhaseLabel(data.label);
                  break;

                case 'token':
                  accumulatedText += data.text;
                  setStreamedText(accumulatedText);
                  setDisplayedText(accumulatedText);
                  break;

                case 'tool-call':
                  const newToolCall = {
                    toolCallId: data.toolCallId,
                    toolName: data.toolName,
                    args: data.args,
                  };
                  accumulatedToolCalls.push(newToolCall);
                  setToolCalls(prev => [...prev, newToolCall]);
                  break;

                case 'tool-result':
                  accumulatedToolCalls = accumulatedToolCalls.map(tc => 
                    tc.toolCallId === data.toolCallId
                      ? { ...tc, result: data.result }
                      : tc
                  );
                  setToolCalls(prev => prev.map(tc => 
                    tc.toolCallId === data.toolCallId
                      ? { ...tc, result: data.result }
                      : tc
                  ));
                  break;

                case 'error':
                  setError(data.message);
                  break;

                case 'done':
                  if (!firstDoneReceivedRef.current) {
                    firstDoneReceivedRef.current = true;
                  }
                  break;
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
            currentEvent = '';
          }
        }
      }

      // Stream completed
      if (onCompleteRef.current) {
        onCompleteRef.current(accumulatedText, accumulatedToolCalls);
      }
      
      setIsStreaming(false);
      setCurrentPhase('complete');
      setToolCalls([]);
      setStreamedText('');
      setDisplayedText('');
      setPhaseLabel('');
      firstDoneReceivedRef.current = false;

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Stream failed');
      }
    } finally {
      setIsStreaming(false);
      setToolCalls([]);
      setStreamedText('');
      setDisplayedText('');
      setPhaseLabel('');
      firstDoneReceivedRef.current = false;
    }
  }, []);

  return {
    isStreaming,
    streamedText,
    displayedText,
    phaseLabel,
    currentPhase,
    toolCalls,
    error,
    streamingMessageId,
    startStream,
    cancelStream,
  };
}