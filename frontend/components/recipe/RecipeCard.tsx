/**
 * Recipe Card Component
 * Interactive recipe editor with manual controls and AI integration
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Clock, Star, Sparkles, Plus, X } from 'lucide-react';

export enum SkillLevel {
  BEGINNER = "Beginner",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced",
}

export enum CookingTime {
  FiveMin = "5 min",
  FifteenMin = "15 min",
  ThirtyMin = "30 min",
  FortyFiveMin = "45 min",
  SixtyPlusMin = "60+ min",
}

export enum SpecialPreferences {
  HighProtein = "High Protein",
  LowCarb = "Low Carb",
  Spicy = "Spicy",
  BudgetFriendly = "Budget-Friendly",
  OnePotMeal = "One-Pot Meal",
  Vegetarian = "Vegetarian",
  Vegan = "Vegan",
}

export interface Ingredient {
  icon: string;
  name: string;
  amount: string;
}

export interface Recipe {
  title: string;
  skill_level: SkillLevel;
  cooking_time: CookingTime;
  special_preferences: string[];
  ingredients: Ingredient[];
  instructions: string[];
  changes?: string;
}

export const INITIAL_RECIPE: Recipe = {
  title: "Make Your Recipe",
  skill_level: SkillLevel.INTERMEDIATE,
  cooking_time: CookingTime.FortyFiveMin,
  special_preferences: [],
  ingredients: [
    { icon: "🥕", name: "Carrots", amount: "3 large, grated" },
    { icon: "🌾", name: "All-Purpose Flour", amount: "2 cups" },
  ],
  instructions: ["Preheat oven to 350°F (175°C)"],
};

interface RecipeCardProps {
  recipe: Recipe;
  onRecipeChange: (recipe: Recipe) => void;
  changedKeys?: string[];
}

const cookingTimeValues = [
  { label: CookingTime.FiveMin, value: 0 },
  { label: CookingTime.FifteenMin, value: 1 },
  { label: CookingTime.ThirtyMin, value: 2 },
  { label: CookingTime.FortyFiveMin, value: 3 },
  { label: CookingTime.SixtyPlusMin, value: 4 },
];

const skillLevelColors = {
  [SkillLevel.BEGINNER]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  [SkillLevel.INTERMEDIATE]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  [SkillLevel.ADVANCED]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function RecipeCard({ recipe, onRecipeChange, changedKeys = [] }: RecipeCardProps) {
  const [editingInstructionIndex, setEditingInstructionIndex] = useState<number | null>(null);

  const updateRecipe = (updates: Partial<Recipe>) => {
    onRecipeChange({ ...recipe, ...updates });
  };

  const addIngredient = () => {
    updateRecipe({
      ingredients: [...recipe.ingredients, { icon: "🍴", name: "", amount: "" }],
    });
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...recipe.ingredients];
    updated[index] = { ...updated[index], [field]: value };
    updateRecipe({ ingredients: updated });
  };

  const removeIngredient = (index: number) => {
    const updated = [...recipe.ingredients];
    updated.splice(index, 1);
    updateRecipe({ ingredients: updated });
  };

  const addInstruction = () => {
    const newIndex = recipe.instructions.length;
    updateRecipe({
      instructions: [...recipe.instructions, ""],
    });
    setEditingInstructionIndex(newIndex);
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...recipe.instructions];
    updated[index] = value;
    updateRecipe({ instructions: updated });
  };

  const removeInstruction = (index: number) => {
    const updated = [...recipe.instructions];
    updated.splice(index, 1);
    updateRecipe({ instructions: updated });
  };

  const handleDietaryChange = (preference: string, checked: boolean) => {
    if (checked) {
      updateRecipe({
        special_preferences: [...recipe.special_preferences, preference],
      });
    } else {
      updateRecipe({
        special_preferences: recipe.special_preferences.filter((p) => p !== preference),
      });
    }
  };

  return (
    <div className="bg-white dark:bg-olive-950 rounded-2xl shadow-lg p-8 max-w-3xl w-screen h-screen overflow-y-auto relative">
      {/* Recipe Title */}
      <div className="mb-6">
        <input
          type="text"
          value={recipe.title}
          onChange={(e) => updateRecipe({ title: e.target.value })}
          className="text-3xl font-bold text-gray-900 dark:text-gray-100 w-full bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-orange-500 focus:outline-none transition-colors px-2 py-1"
          placeholder="Recipe Title"
        />

        {/* Meta Info */}
        <div className="flex items-center gap-4 mt-4">
          {/* Cooking Time */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <select
              value={cookingTimeValues.find((t) => t.label === recipe.cooking_time)?.value || 3}
              onChange={(e) => updateRecipe({ cooking_time: cookingTimeValues[Number(e.target.value)].label })}
              className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {cookingTimeValues.map((time) => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Level */}
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <select
              value={recipe.skill_level}
              onChange={(e) => updateRecipe({ skill_level: e.target.value as SkillLevel })}
              className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {Object.values(SkillLevel).map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Changes Banner */}
      {recipe.changes && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r-lg">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">What's New</p>
              <p className="text-sm text-amber-700 dark:text-amber-400">{recipe.changes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dietary Preferences */}
      <div className="mb-6 relative">
        {changedKeys.includes('special_preferences') && <ChangeIndicator />}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Dietary Preferences
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.values(SpecialPreferences).map((pref) => (
            <label
              key={pref}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <input
                type="checkbox"
                checked={recipe.special_preferences.includes(pref)}
                onChange={(e) => handleDietaryChange(pref, e.target.checked)}
                className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{pref}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div className="mb-6 relative">
        {changedKeys.includes('ingredients') && <ChangeIndicator />}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ingredients</h3>
          <button
            onClick={addIngredient}
            className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Ingredient
          </button>
        </div>
        <div className="space-y-2">
          {recipe.ingredients.map((ing, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 group">
              <span className="text-2xl">{ing.icon || '🍴'}</span>
              <input
                type="text"
                value={ing.name}
                onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                placeholder="Ingredient name"
                className="flex-1 bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100"
              />
              <input
                type="text"
                value={ing.amount}
                onChange={(e) => updateIngredient(idx, 'amount', e.target.value)}
                placeholder="Amount"
                className="w-32 bg-transparent border-none focus:outline-none text-gray-600 dark:text-gray-400 text-sm"
              />
              <button
                onClick={() => removeIngredient(idx)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="relative">
        {changedKeys.includes('instructions') && <ChangeIndicator />}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Instructions</h3>
          <button
            onClick={addInstruction}
            className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Step
          </button>
        </div>
        <div className="space-y-3">
          {recipe.instructions.map((instruction, idx) => (
            <div key={idx} className="flex gap-3 group">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center">
                {idx + 1}
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={instruction}
                  onChange={(e) => updateInstruction(idx, e.target.value)}
                  placeholder="Enter cooking instruction..."
                  onFocus={() => setEditingInstructionIndex(idx)}
                  onBlur={() => setEditingInstructionIndex(null)}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  rows={2}
                />
                <button
                  onClick={() => removeInstruction(idx)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChangeIndicator() {
  return (
    <span className="absolute -top-1 -right-1 flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
    </span>
  );
}