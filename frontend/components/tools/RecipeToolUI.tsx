/**
 * Recipe Tool UI Component
 * Displays recipe information with ingredients, instructions, and metadata
 */

'use client';

import { makeAssistantToolUI } from '@assistant-ui/react';
import { ChefHat, Clock, Utensils, Star, Sparkles } from 'lucide-react';

interface Ingredient {
  icon: string;
  name: string;
  amount: string;
}

interface RecipeData {
  title: string;
  skill_level: string;
  special_preferences?: string[];
  cooking_time?: string;
  ingredients: Ingredient[];
  instructions: string[];
  changes?: string;
}

export const RecipeToolUI = makeAssistantToolUI<RecipeData, any>({
  toolName: 'generate_recipe',
  render: function RecipeDisplay({ args, status }) {
    // Loading state
    if (status.type === 'running' || !args) {
      return (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-2">
          <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
            <ChefHat className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-medium">Creating recipe...</span>
          </div>
        </div>
      );
    }

    const recipe = args;

    const skillLevelColors = {
      Beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 
                    border border-orange-200 dark:border-orange-800 rounded-xl p-6 mb-2 shadow-sm max-w-2xl">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <ChefHat className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {recipe.title}
            </h3>
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Skill Level */}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${skillLevelColors[recipe.skill_level as keyof typeof skillLevelColors] || skillLevelColors.Beginner}`}>
              <Star className="w-3 h-3 inline mr-1" />
              {recipe.skill_level}
            </span>

            {/* Cooking Time */}
            {recipe.cooking_time && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 
                             rounded-full text-xs font-semibold">
                <Clock className="w-3 h-3 inline mr-1" />
                {recipe.cooking_time}
              </span>
            )}

            {/* Special Preferences */}
            {recipe.special_preferences && recipe.special_preferences.length > 0 && recipe.special_preferences.map((pref, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 
                         rounded-full text-xs font-semibold"
              >
                {pref}
              </span>
            ))}
          </div>

          {/* Changes Note */}
          {recipe.changes && (
            <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">What's New</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">{recipe.changes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ingredients */}
        <div className="mb-5">
          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            Ingredients
          </h4>
          <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg p-4">
            <div className="grid grid-cols-1 gap-2">
              {recipe.ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <span className="text-xl flex-shrink-0">{ing.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 min-w-[120px]">{ing.name}</span>
                  <span className="text-gray-600 dark:text-gray-400">{ing.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            Instructions
          </h4>
          <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg p-4">
            <ol className="space-y-3">
              {recipe.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white 
                                 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pt-0.5">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    );
  },
});
