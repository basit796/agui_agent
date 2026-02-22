/**
 * Task Steps Tool UI Component
 * Human-in-the-Loop pattern - User approves/modifies task steps
 * Following RSP-Dashboard QuestionCardToolUI pattern
 */

'use client';

import { makeAssistantToolUI, useThreadRuntime } from '@assistant-ui/react';
import { ListChecks, CheckCircle2, Circle, ThumbsUp, X } from 'lucide-react';
import { useState, useCallback } from 'react';

interface TaskStep {
  description: string;
  status: 'enabled' | 'disabled';
}

interface TaskStepsArgs {
  steps: TaskStep[];
}

// Main Task Steps Component with user interaction
function TaskStepsCard({
  args,
  respond,
  isDisabled,
}: {
  args: TaskStepsArgs;
  respond: (response: string) => void;
  isDisabled: boolean;
}) {
  const [localSteps, setLocalSteps] = useState<TaskStep[]>(args.steps || []);
  const [submitted, setSubmitted] = useState(false);

  const toggleStep = useCallback((index: number) => {
    if (submitted) return;
    setLocalSteps(prev => {
      const newSteps = [...prev];
      newSteps[index].status = newSteps[index].status === 'enabled' ? 'disabled' : 'enabled';
      return newSteps;
    });
  }, [submitted]);

  const handleApprove = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    
    const enabledSteps = localSteps.filter(s => s.status === 'enabled');
    const response = `User approved ${enabledSteps.length} steps:\n${enabledSteps.map((s, i) => `${i + 1}. ${s.description}`).join('\n')}`;
    respond(response);
  }, [localSteps, submitted, respond]);

  const handleReject = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    respond('User rejected the task plan. Please ask what changes they want to make.');
  }, [submitted, respond]);

  const enabledCount = localSteps.filter(s => s.status === 'enabled').length;
  const disabled = isDisabled || submitted;

  return (
    <div className="my-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-indigo-500">
          <ListChecks className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Task Breakdown</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select the steps you want to include ({enabledCount}/{localSteps.length} selected)
          </p>
        </div>
      </div>

      {/* Task Steps */}
      <div className="space-y-2 mb-4">
        {localSteps.map((step, index) => {
          const isEnabled = step.status === 'enabled';
          return (
            <button
              key={index}
              onClick={() => toggleStep(index)}
              disabled={disabled}
              className={`w-full flex items-start gap-3 p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isEnabled
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/40'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50 opacity-60'
              } ${disabled ? 'cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}`}
            >
              {isEnabled ? (
                <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              )}
              <span className={`text-sm font-medium ${
                isEnabled
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {step.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={disabled || enabledCount === 0}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            disabled || enabledCount === 0
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:from-green-600 hover:to-emerald-700 hover:shadow-xl'
          }`}
        >
          <ThumbsUp className="w-5 h-5" />
          Approve Plan
        </button>
        <button
          onClick={handleReject}
          disabled={disabled}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            disabled
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {submitted && (
        <p className="mt-3 text-sm text-green-600 dark:text-green-400 font-medium">
          ✓ Response sent to agent
        </p>
      )}
    </div>
  );
}

// Wrapper that connects to Assistant UI runtime
function TaskStepsWithRuntime({ args, status }: { args: TaskStepsArgs; status: { type: string } }) {
  const thread = useThreadRuntime();
  
  const respond = useCallback((response: string) => {
    thread.append({
      role: 'user',
      content: [{ type: 'text', text: response }],
      parentId: null,
    });
  }, [thread]);

  return (
    <TaskStepsCard
      args={args}
      respond={respond}
      isDisabled={status.type !== 'complete'}
    />
  );
}

export const TaskStepsToolUI = makeAssistantToolUI<TaskStepsArgs, any>({
  toolName: 'generate_task_steps',
  render: function TaskStepsDisplay({ args, status }) {
    // Loading state while tool is being called
    if (status.type === 'running') {
      return (
        <div className="my-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-4">
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Planning task steps...
            </span>
          </div>
        </div>
      );
    }

    // Render interactive card once tool call completes
    return <TaskStepsWithRuntime args={args} status={status} />;
  },
});
