/**
 * Recipe Tool UI Component - Simplified for Sidebar
 * Shows compact notification when recipe is updated
 */

'use client';

import { makeAssistantToolUI } from '@assistant-ui/react';
import { ChefHat, Check } from 'lucide-react';

interface RecipeToolArgs {
  title?: string;
  skill_level?: string;
  special_preferences?: string[];
  cooking_time?: string;
  ingredients?: any[];
  instructions?: string[];
  changes?: string;
}

export const RecipeToolUI = makeAssistantToolUI<RecipeToolArgs, any>({
  toolName: 'generate_recipe',
  render: function RecipeToolDisplay({ args, status }) {
    // Loading state
    if (status.type === 'running' || !args) {
      return (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-2">
          <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
            <ChefHat className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">Updating recipe...</span>
          </div>
        </div>
      );
    }

    // Completed state - show what was changed
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-2">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
            <Check className="w-3 h-3 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
              Recipe Updated
            </p>
            {args.changes && (
              <p className="text-xs text-green-700 dark:text-green-300">
                {args.changes}
              </p>
            )}
            {args.title && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {args.title}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  },
});