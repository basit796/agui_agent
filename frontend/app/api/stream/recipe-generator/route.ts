/**
 * SSE Streaming API Route for Recipe Generator (with STATE_DELTA support)
 * 
 * Handles real-time state updates via STATE_DELTA events
 */

import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const AGENT_ENDPOINT = '/shared-state-agent';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const body = await request.json();
  const { question, conversationHistory = [], threadId, state = {} } = body;

  if (!question || question.trim().length === 0) {
    return new Response(
      encoder.encode('event: error\ndata: {"message":"Question is required"}\n\n'),
      {
        status: 400,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (eventType: string, data: any) => {
        const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      try {
        sendEvent('phase', { phase: 'understanding', label: 'Understanding your request...' });

        const messages = [
          ...conversationHistory.map((msg: any, i: number) => ({
            id: `hist-${i}`,
            role: msg.role,
            content: msg.content,
          })),
          {
            id: `user-${Date.now()}`,
            role: 'user',
            content: question,
          },
        ];

        const response = await fetch(`${BACKEND_URL}${AGENT_ENDPOINT}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadId: threadId || `thread-${Date.now()}`,
            runId: `run-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            state: state,
            messages,
            tools: [],
            context: [],
            forwardedProps: {},
          }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(`Backend returned ${response.status}: ${errText.slice(0, 200)}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body from backend');

        const decoder = new TextDecoder();
        let buffer = '';
        
        const pendingToolCalls = new Map<string, { name: string; argsBuffer: string }>();

        sendEvent('phase', { phase: 'synthesizing', label: 'Generating response...' });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (!raw || raw === '[DONE]') continue;

            let event: any;
            try {
              event = JSON.parse(raw);
            } catch {
              continue;
            }

            const type: string = event.type ?? '';
            
            switch (type) {
              case 'RUN_STARTED':
                sendEvent('phase', { phase: 'querying', label: 'Agent is processing...' });
                break;

              case 'STEP_STARTED':
                if (event.stepName) {
                  sendEvent('phase', { phase: 'querying', label: event.stepName });
                }
                break;

              case 'TEXT_MESSAGE_CONTENT':
                if (event.delta) {
                  sendEvent('token', { text: event.delta });
                }
                break;

              // NEW: Handle STATE_DELTA events for real-time state updates
              case 'STATE_DELTA':
                if (event.delta && Array.isArray(event.delta)) {
                  sendEvent('state-delta', {
                    delta: event.delta, // JSON Patch operations
                  });
                }
                break;

              // NEW: Handle STATE_SNAPSHOT events (full state)
              case 'STATE_SNAPSHOT':
                if (event.state) {
                  sendEvent('state-snapshot', {
                    state: event.state,
                  });
                }
                break;

              case 'TOOL_CALL_START':
                if (event.toolCallId) {
                  pendingToolCalls.set(event.toolCallId, {
                    name: event.toolCallName ?? '',
                    argsBuffer: '',
                  });
                }
                break;

              case 'TOOL_CALL_ARGS':
                if (event.toolCallId && event.delta) {
                  const pending = pendingToolCalls.get(event.toolCallId);
                  if (pending) pending.argsBuffer += event.delta;
                }
                break;

              case 'TOOL_CALL_END': {
                const tc = pendingToolCalls.get(event.toolCallId);
                if (tc) {
                  let args: any = {};
                  try { 
                    args = JSON.parse(tc.argsBuffer); 
                  } catch { 
                    // Use empty args if parsing fails
                  }
                  
                  sendEvent('tool-call', {
                    toolCallId: event.toolCallId,
                    toolName: tc.name,
                    args,
                  });
                  
                  pendingToolCalls.delete(event.toolCallId);
                }
                break;
              }

              case 'TOOL_CALL_RESULT':
                if (event.toolCallId && event.content) {
                  let resultData: any;
                  try {
                    resultData = JSON.parse(event.content);
                  } catch {
                    resultData = event.content;
                  }
                  
                  sendEvent('tool-result', {
                    toolCallId: event.toolCallId,
                    result: resultData,
                  });
                }
                break;

              case 'RUN_ERROR':
                throw new Error(event.message ?? 'Agent encountered an error');

              case 'RUN_FINISHED':
                // Stream finished successfully
                break;
            }
          }
        }

        sendEvent('done', {});
        controller.close();

      } catch (error: any) {
        console.error('[Recipe Generator Stream] Error:', error.message);
        sendEvent('error', { message: error.message || 'An unexpected error occurred' });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}