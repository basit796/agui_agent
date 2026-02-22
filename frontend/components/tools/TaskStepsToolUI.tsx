/**
 * Task Steps Tool UI Component
 * Displays task breakdown with interactive step management
 */

'use client';

import { makeAssistantToolUI } from '@assistant-ui/react';
import { ListChecks, CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';

interface TaskStep {
  description: string;
  status: 'enabled' | 'disabled';
}

interface TaskStepsData {
  steps: TaskStep[];
}

export const TaskStepsToolUI = makeAssistantToolUI<any, TaskStepsData>({
  toolName: 'generate_task_steps',
  render: function TaskStepsDisplay({ result }) {
    const [localSteps, setLocalSteps] = useState<TaskStep[] | null>(null);

    if (!result) {
      return (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 mb-2">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
            <ListChecks className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-medium">Planning task steps...</span>
          </div>
        </div>
      );
    }

    // Parse result if it's a string
    let taskData: TaskStepsData;
    try {
      taskData = typeof result === 'string' ? JSON.parse(result) : result;
    } catch {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-2">
          <p className="text-sm text-red-700 dark:text-red-300">Failed to parse task data</p>
        </div>
      );
    }

    // Use local state or original data
    const steps = localSteps || taskData.steps;
    const enabledCount = steps.filter(s => s.status === 'enabled').length;

    const toggleStep = (index: number) => {
      const newSteps = [...steps];
      newSteps[index].status = newSteps[index].status === 'enabled' ? 'disabled' : 'enabled';
      setLocalSteps(newSteps);
    };

    return (
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 
                    border border-indigo-200 dark:border-indigo-800 rounded-xl p-5 mb-2 shadow-sm max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Task Plan
            </h3>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {enabledCount} of {steps.length} steps enabled
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 <strong>Review the plan:</strong> Click steps to disable ones you don't need. The agent will only execute enabled steps.
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-2">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => toggleStep(idx)}
              className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all duration-200
                ${step.status === 'enabled'
                  ? 'bg-white dark:bg-gray-800 border-indigo-300 dark:border-indigo-700 hover:border-indigo-400 dark:hover:border-indigo-600'
                  : 'bg-gray-100 dark:bg-gray-900/50 border-gray-300 dark:border-gray-700 opacity-50'
                }
              `}
            >
              {/* Step Number & Icon */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${step.status === 'enabled'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-400 text-gray-600'
                  }
                `}>
                  {idx + 1}
                </span>
                {step.status === 'enabled' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-400" />
                )}
              </div>

              {/* Step Text */}
              <span className={`text-left text-sm font-medium flex-1 pt-0.5
                ${step.status === 'enabled'
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-500 dark:text-gray-500 line-through'
                }
              `}>
                {step.description}
              </span>

              {/* Status Label */}
              <span className={`text-xs font-semibold px-2 py-1 rounded
                ${step.status === 'enabled'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }
              `}>
                {step.status === 'enabled' ? 'Enabled' : 'Disabled'}
              </span>
            </button>
          ))}
        </div>

        {/* Footer Actions Hint */}
        <div className="mt-4 pt-3 border-t border-indigo-200 dark:border-indigo-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Once you're happy with the plan, tell the agent to proceed or make changes
          </p>
        </div>
      </div>
    );
  },
});
