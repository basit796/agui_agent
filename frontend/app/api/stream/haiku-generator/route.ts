/**
 * SSE Streaming API Route for Haiku Generator (tool_based_generative_ui)
 * 
 * This route:
 * 1. Receives POST request with question and conversation history
 * 2. Defines the generate_haiku frontend tool
 * 3. Forwards to ADK backend at http://localhost:8000/haiku-generator
 * 4. Translates ADK SSE events to frontend-compatible events
 * 5. Streams response back to client
 */

import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const AGENT_ENDPOINT = '/haiku-generator';

// Frontend tool definition - sent to backend so LLM can call it
const GENERATE_HAIKU_TOOL = {
  name: 'generate_haiku',
  description: 'Generate a haiku poem with Japanese and English text, along with matching images and gradient',
  parameters: {
    type: 'object',
    properties: {
      japanese: {
        type: 'array',
        items: { type: 'string' },
        description: '3 lines of haiku in Japanese (5-7-5 syllable structure)',
      },
      english: {
        type: 'array',
        items: { type: 'string' },
        description: '3 lines of haiku translated to English',
      },
      selectedImages: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of image filenames that match the haiku theme (e.g., ["Mount_Fuji_Lake_Reflection_Cherry_Blossoms_Sakura_Spring.jpg"])',
      },
      gradient: {
        type: 'string',
        description: 'CSS gradient for the background (e.g., "linear-gradient(to right, #667eea, #764ba2)")',
      },
    },
    required: ['japanese', 'english'],
  },
};

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  // Parse request body
  const body = await request.json();
  const { question, conversationHistory = [], threadId } = body;

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

  // Create readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (eventType: string, data: any) => {
        const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      try {
        sendEvent('phase', { phase: 'understanding', label: 'Understanding your question...' });

        // Build messages array for ADK agent
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

        // Call ADK backend with frontend tool
        const response = await fetch(`${BACKEND_URL}${AGENT_ENDPOINT}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadId: threadId || `thread-${Date.now()}`,
            runId: `run-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            state: {},
            messages,
            tools: [GENERATE_HAIKU_TOOL], // ← Frontend tool sent to backend
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
        let fullAnswer = '';
        
        // Track pending tool calls (accumulated during streaming)
        const pendingToolCalls = new Map<string, { name: string; argsBuffer: string }>();

        sendEvent('phase', { phase: 'synthesizing', label: 'Generating response...' });

        // Read ADK SSE stream
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            // ADK sends events as SSE `data:` lines with JSON object that has a `type` field
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
                  fullAnswer += event.delta;
                  sendEvent('token', { text: event.delta });
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
                // ADK sends the tool result - forward it to frontend so WeatherToolUI can display it
                if (event.toolCallId && event.content) {
                  // Parse the result content (it's stringified JSON)
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

              // TEXT_MESSAGE_START, TEXT_MESSAGE_END, STEP_FINISHED — no action needed
            }
          }
        }

        // Send completion event
        sendEvent('done', {});
        controller.close();

      } catch (error: any) {
        console.error('[Weather Agent Stream] Error:', error.message);
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
