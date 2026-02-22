/**
 * Haiku Generator Tool UI Component
 * Displays generated haikus with Japanese text, English translation, and selected images
 */

'use client';

import { makeAssistantToolUI } from '@assistant-ui/react';
import { Sparkles, Globe, Image as ImageIcon } from 'lucide-react';

interface HaikuData {
  japanese: string;
  english: string;
  selectedImages: string[];
}

export const HaikuToolUI = makeAssistantToolUI<{ topic?: string }, HaikuData>({
  toolName: 'generate_haiku',
  render: function HaikuDisplay({ result }) {
    if (!result) {
      return (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 mb-2">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-medium">Crafting haiku...</span>
          </div>
        </div>
      );
    }

    // Parse result if it's a string
    let haiku: HaikuData;
    try {
      haiku = typeof result === 'string' ? JSON.parse(result) : result;
    } catch {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-2">
          <p className="text-sm text-red-700 dark:text-red-300">Failed to parse haiku data</p>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 
                    border border-purple-200 dark:border-purple-800 rounded-xl p-6 mb-2 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-purple-200 dark:border-purple-800">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Generated Haiku
          </h3>
        </div>

        {/* Japanese Haiku */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🇯🇵</span>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Japanese</h4>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
            <p className="text-xl font-serif text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-line">
              {haiku.japanese}
            </p>
          </div>
        </div>

        {/* English Translation */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">English Translation</h4>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
            <p className="text-base italic text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {haiku.english}
            </p>
          </div>
        </div>

        {/* Selected Images */}
        {haiku.selectedImages && haiku.selectedImages.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Complementary Images
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {haiku.selectedImages.map((img, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 
                           border border-purple-300 dark:border-purple-700 rounded-full text-xs
                           text-purple-700 dark:text-purple-300 font-medium"
                >
                  {img.replace(/\.(jpg|jpeg|png)$/i, '').replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
});
